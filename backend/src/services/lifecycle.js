/**
 * Competition lifecycle, derived from dates on every request (never stored),
 * so it can never go stale. Registration and submission windows are independent
 * because in the design they overlap (submissions open before registration closes).
 */
const registrationPhase = (c, now = new Date()) =>
  now < c.registrationStart ? 'UPCOMING' : now <= c.registrationEnd ? 'OPEN' : 'CLOSED';

const submissionPhase = (c, now = new Date()) =>
  now < c.submissionStart ? 'NOT_STARTED' : now <= c.submissionEnd ? 'OPEN' : 'CLOSED';

const resultPhase = (c, now = new Date()) => (now >= c.resultDate ? 'DECLARED' : 'PENDING');

function overallStatus(c, now = new Date()) {
  const reg = registrationPhase(c, now);
  const sub = submissionPhase(c, now);
  if (reg === 'UPCOMING') return 'UPCOMING';
  if (reg === 'OPEN') return 'REGISTRATION_OPEN';
  if (sub === 'NOT_STARTED') return 'REGISTRATION_CLOSED';
  if (sub === 'OPEN') return 'SUBMISSION_OPEN';
  return resultPhase(c, now) === 'DECLARED' ? 'RESULT_DECLARED' : 'JUDGING';
}

module.exports = { registrationPhase, submissionPhase, resultPhase, overallStatus };
