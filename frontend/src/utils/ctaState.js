import { formatDateTime, inr } from './format';

/**
 * Maps competition + user state to the primary action button.
 * Pure function so every state is easy to reason about (and to unit test).
 * The backend enforces the same rules; this only decides what the UI offers.
 */
export function getCtaState(c, { isLoggedIn, busy }) {
  if (busy) return { key: 'PROCESSING', labelKey: 'processing', disabled: true, busy: true };
  const u = c.userState;

  if (u.isRegistered) {
    if (u.hasSubmitted) return { key: 'SUBMITTED', labelKey: 'submissionUploaded', subKey: 'registered', disabled: true };
    if (c.submissionPhase === 'OPEN') return { key: 'UPLOAD', labelKey: 'uploadSubmission', subKey: 'registered', action: 'upload' };
    if (c.submissionPhase === 'NOT_STARTED') {
      return { key: 'SUBMISSION_SOON', labelKey: 'submissionOpensOn', labelVars: { date: formatDateTime(c.dates.submissionStart) }, subKey: 'registered', disabled: true };
    }
    return { key: 'SUBMISSION_CLOSED', labelKey: 'submissionClosed', subKey: 'registered', disabled: true };
  }

  if (c.registrationPhase === 'UPCOMING') return { key: 'NOT_OPEN', labelKey: 'registrationOpensSoon', disabled: true };
  if (c.registrationPhase === 'CLOSED') return { key: 'CLOSED', labelKey: 'registrationClosed', disabled: true };
  if (c.isFull) return { key: 'FULL', labelKey: 'competitionFull', disabled: true };
  if (!isLoggedIn) return { key: 'LOGIN', labelKey: 'registerNow', subKey: 'loginToContinue', action: 'login' };
  return { key: 'REGISTER', labelKey: 'registerFee', labelVars: { fee: inr(c.entryFee) }, action: 'register' };
}
