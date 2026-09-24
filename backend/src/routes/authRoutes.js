const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const schemas = require('../validators/schemas');
const ctrl = require('../controllers/authController');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

router.post('/signup', authLimiter, validate(schemas.signup), ctrl.signup);
router.post('/login', authLimiter, validate(schemas.login), ctrl.login);
router.get('/me', requireAuth, ctrl.me);

module.exports = router;
