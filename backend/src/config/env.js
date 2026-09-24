const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/feedants',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  referralBaseUrl: process.env.REFERRAL_BASE_URL || 'https://feedants.com/r',
  uploadDir: path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads')),
  maxUploadMB: 200, // hard cap; each competition can set a lower limit
  payment: {
    mode: process.env.PAYMENT_MODE || 'mock',
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
};

if (!config.jwtSecret) {
  throw new Error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
}
if (config.payment.mode === 'razorpay' && (!config.payment.keyId || !config.payment.keySecret)) {
  throw new Error('PAYMENT_MODE=razorpay requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
}

module.exports = config;
