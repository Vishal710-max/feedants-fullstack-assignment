const config = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');
const Registration = require('./models/Registration');
const Submission = require('./models/Submission');
const PaymentOrder = require('./models/PaymentOrder');
const Competition = require('./models/Competition');
const User = require('./models/User');

(async () => {
  await connectDB(config.mongoUri);
  // The unique indexes are what make registration/submission safe; make sure they exist before serving traffic.
  await Promise.all([Registration, Submission, PaymentOrder, Competition, User].map((m) => m.init()));

  const server = app.listen(config.port, '0.0.0.0', () =>
    console.log(`API listening on :${config.port} (payments: ${config.payment.mode})`)
  );

  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
})().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
