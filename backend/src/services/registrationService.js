const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const PaymentOrder = require('../models/PaymentOrder');
const AppError = require('../utils/AppError');
const paymentService = require('./paymentService');
const { findByIdOrSlug } = require('./competitionService');
const { registrationPhase } = require('./lifecycle');

function assertRegistrationOpen(competition, now) {
  const phase = registrationPhase(competition, now);
  if (phase === 'UPCOMING') throw new AppError(409, 'REGISTRATION_NOT_STARTED', 'Registration has not opened yet.');
  if (phase === 'CLOSED') throw new AppError(409, 'REGISTRATION_CLOSED', 'Registration is closed.');
}

/** Step 1: validate the user can register, then create a payment order. */
async function createPaymentOrder({ userId, idOrSlug }) {
  const competition = await findByIdOrSlug(idOrSlug);
  assertRegistrationOpen(competition, new Date());

  if (await Registration.exists({ userId, competitionId: competition._id, status: 'REGISTERED' })) {
    throw new AppError(409, 'ALREADY_REGISTERED', 'You are already registered for this competition.');
  }
  // Soft check for a nicer UX. The hard guarantee is the atomic reservation below.
  if (competition.registeredCount >= competition.maxParticipants) {
    throw new AppError(409, 'COMPETITION_FULL', 'This competition is full.');
  }

  const order = await paymentService.createOrder({
    amountInr: competition.entryFee,
    receipt: `c_${String(competition._id).slice(-8)}_${Date.now()}`,
  });
  await PaymentOrder.create({
    orderId: order.orderId,
    userId,
    competitionId: competition._id,
    amount: competition.entryFee,
    currency: competition.currency,
    mode: order.mode,
  });
  return { ...order, amount: competition.entryFee, currency: competition.currency };
}

/**
 * Step 2: confirm registration after payment.
 *
 * Safety nets, in order:
 *  1. order is claimed atomically (CREATED -> PROCESSING) so a double-click / retry storm
 *     can only ever be processed once;
 *  2. payment signature is verified server-side;
 *  3. the spot is reserved with ONE atomic conditional $inc (no read-then-write race);
 *  4. unique indexes (user+competition, paymentId) are the final backstop;
 *  5. if creating the Registration fails, the reserved spot is released.
 */
async function registerForCompetition({ userId, idOrSlug, orderId, paymentId, signature }) {
  const now = new Date();
  const competition = await findByIdOrSlug(idOrSlug);
  assertRegistrationOpen(competition, now);

  if (await Registration.exists({ userId, competitionId: competition._id, status: 'REGISTERED' })) {
    throw new AppError(409, 'ALREADY_REGISTERED', 'You are already registered for this competition.');
  }

  const order = await PaymentOrder.findOneAndUpdate(
    { orderId, userId, competitionId: competition._id, status: 'CREATED' },
    { status: 'PROCESSING' },
    { new: true }
  );
  if (!order) {
    throw new AppError(400, 'INVALID_ORDER', 'Payment order is invalid or has already been used.');
  }

  let spotReserved = false;
  try {
    if (!paymentService.verifySignature({ orderId, paymentId, signature })) {
      throw new AppError(402, 'PAYMENT_VERIFICATION_FAILED', 'Payment could not be verified.');
    }

    const reserved = await Competition.findOneAndUpdate(
      { _id: competition._id, $expr: { $lt: ['$registeredCount', '$maxParticipants'] } },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );
    if (!reserved) {
      throw new AppError(409, 'COMPETITION_FULL', 'The competition filled up before your payment completed.', {
        refundRequired: true,
      });
    }
    spotReserved = true;

    const registration = await Registration.create({
      userId,
      competitionId: competition._id,
      orderId,
      paymentId,
      amountPaid: order.amount,
    });
    await PaymentOrder.updateOne({ _id: order._id }, { status: 'PAID', paymentId });
    return { competition: reserved, registration };
  } catch (err) {
    if (spotReserved) {
      await Competition.updateOne({ _id: competition._id, registeredCount: { $gt: 0 } }, { $inc: { registeredCount: -1 } });
    }
    const nextStatus =
      err.code === 'COMPETITION_FULL' ? 'REFUND_PENDING' : err.code === 'PAYMENT_VERIFICATION_FAILED' ? 'FAILED' : 'CREATED';
    await PaymentOrder.updateOne({ _id: order._id }, { status: nextStatus });

    if (err.code === 11000) {
      throw new AppError(409, 'ALREADY_REGISTERED', 'You are already registered for this competition.');
    }
    throw err;
  }
}

module.exports = { createPaymentOrder, registerForCompetition };
