const crypto = require('crypto');
const config = require('../config/env');

let razorpay = null;
const getRazorpay = () => {
  if (!razorpay) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({ key_id: config.payment.keyId, key_secret: config.payment.keySecret });
  }
  return razorpay;
};

/** Creates a payment order with the gateway (or a local mock order). */
async function createOrder({ amountInr, receipt }) {
  if (config.payment.mode === 'mock') {
    return { orderId: `order_mock_${crypto.randomBytes(8).toString('hex')}`, mode: 'mock', keyId: null };
  }
  const order = await getRazorpay().orders.create({
    amount: Math.round(amountInr * 100), // paise
    currency: 'INR',
    receipt: String(receipt).slice(0, 40),
  });
  return { orderId: order.id, mode: 'razorpay', keyId: config.payment.keyId };
}

/** Server-side proof that the gateway really captured this payment. */
function verifySignature({ orderId, paymentId, signature }) {
  if (config.payment.mode === 'mock') return signature === 'mock_signature';
  const expected = crypto
    .createHmac('sha256', config.payment.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { createOrder, verifySignature, mode: () => config.payment.mode };
