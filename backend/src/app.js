const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Stateless: no server-side sessions, so any number of instances can sit behind a load balancer.
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',') }));
app.use(express.json({ limit: '100kb' }));
if (config.nodeEnv !== 'test') app.use(morgan('tiny'));

app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/uploads', express.static(config.uploadDir)); // dev only; use object storage + CDN in production
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/competitions', require('./routes/competitionRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
