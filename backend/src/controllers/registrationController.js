const asyncHandler = require('../utils/asyncHandler');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const registrationService = require('../services/registrationService');
const { findByIdOrSlug } = require('../services/competitionService');
const { toCompetitionDTO } = require('../presenters/competitionPresenter');

exports.createPaymentOrder = asyncHandler(async (req, res) => {
  const order = await registrationService.createPaymentOrder({ userId: req.user.id, idOrSlug: req.params.idOrSlug });
  res.status(201).json({ success: true, data: order });
});

exports.register = asyncHandler(async (req, res) => {
  const { competition, registration } = await registrationService.registerForCompetition({
    userId: req.user.id,
    idOrSlug: req.params.idOrSlug,
    ...req.body,
  });
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: toCompetitionDTO(competition, { registration }),
  });
});

exports.status = asyncHandler(async (req, res) => {
  const competition = await findByIdOrSlug(req.params.idOrSlug);
  const [registration, submission] = await Promise.all([
    Registration.findOne({ userId: req.user.id, competitionId: competition._id, status: 'REGISTERED' }).lean(),
    Submission.findOne({ userId: req.user.id, competitionId: competition._id }).lean(),
  ]);
  res.json({
    success: true,
    data: {
      registered: Boolean(registration),
      status: registration ? registration.status : null,
      registeredAt: registration ? registration.registeredAt : null,
      hasSubmitted: Boolean(submission),
    },
  });
});
