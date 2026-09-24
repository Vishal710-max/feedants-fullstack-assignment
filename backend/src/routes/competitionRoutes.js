const router = require('express').Router();
const validate = require('../middleware/validate');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const schemas = require('../validators/schemas');
const competition = require('../controllers/competitionController');
const registration = require('../controllers/registrationController');
const submission = require('../controllers/submissionController');

router.get('/', validate(schemas.pagination, 'query'), competition.list);
router.get('/:idOrSlug', optionalAuth, competition.get);
router.get('/:idOrSlug/reviews', validate(schemas.pagination, 'query'), competition.reviews);

router.post('/:idOrSlug/payment-order', requireAuth, registration.createPaymentOrder);
router.post('/:idOrSlug/register', requireAuth, validate(schemas.register), registration.register);
router.get('/:idOrSlug/registration-status', requireAuth, registration.status);

router.get('/:idOrSlug/submissions/me', requireAuth, submission.mine);
router.post('/:idOrSlug/submissions', requireAuth, submission.assertCanSubmit, upload.single('file'), submission.create);

module.exports = router;
