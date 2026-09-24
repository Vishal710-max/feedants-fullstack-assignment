const { registrationPhase, submissionPhase, resultPhase, overallStatus } = require('../services/lifecycle');
const { mimeTypesFor } = require('../utils/fileTypes');

const iso = (d) => (d ? new Date(d).toISOString() : null);

function toCompetitionDTO(competition, { registration = null, submission = null, now = new Date() } = {}) {
  const c = typeof competition.toObject === 'function' ? competition.toObject() : competition;
  const remainingSpots = Math.max(0, c.maxParticipants - c.registeredCount);

  return {
    id: String(c._id),
    slug: c.slug,
    title: c.title,
    category: c.category,
    tags: c.tags || [],
    certificateText: c.certificateText || null,
    prizePool: c.prizePool,
    entryFee: c.entryFee,
    currency: c.currency,
    maxParticipants: c.maxParticipants,
    registeredCount: c.registeredCount,
    remainingSpots, // computed on the server, never trusted from the client
    isFull: remainingSpots === 0,
    judge: c.judge || null,
    dates: {
      registrationStart: iso(c.registrationStart),
      registrationEnd: iso(c.registrationEnd),
      submissionStart: iso(c.submissionStart),
      submissionEnd: iso(c.submissionEnd),
      resultDate: iso(c.resultDate),
    },
    status: overallStatus(c, now),
    registrationPhase: registrationPhase(c, now),
    submissionPhase: submissionPhase(c, now),
    resultPhase: resultPhase(c, now),
    about: c.about || [],
    judgingParameters: c.judgingParameters || [],
    rules: c.rules || [],
    eligibility: c.eligibility || [],
    rewards: [...(c.rewards || [])].sort((a, b) => a.position - b.position),
    previousWinners: c.previousWinners || [],
    disclaimer: c.disclaimer || null,
    refundPolicy: c.refundPolicy || null,
    prizeInfoVideoUrl: c.prizeInfoVideoUrl || null,
    referralReward: c.referralReward || 0,
    submissionRules: {
      allowedFileTypes: c.allowedFileTypes,
      allowedMimeTypes: mimeTypesFor(c.allowedFileTypes),
      maxFileSizeMB: c.maxFileSizeMB,
    },
    userState: {
      isRegistered: Boolean(registration),
      registrationStatus: registration ? registration.status : null,
      registeredAt: registration ? iso(registration.registeredAt) : null,
      hasSubmitted: Boolean(submission),
      submittedAt: submission ? iso(submission.submittedAt) : null,
    },
    serverTime: iso(now), // lets the client correct for device clock skew
  };
}

const toSummaryDTO = (c, now = new Date()) => ({
  id: String(c._id),
  slug: c.slug,
  title: c.title,
  category: c.category,
  tags: c.tags,
  prizePool: c.prizePool,
  entryFee: c.entryFee,
  remainingSpots: Math.max(0, c.maxParticipants - c.registeredCount),
  status: overallStatus(c, now),
  registrationEnd: iso(c.registrationEnd),
});

module.exports = { toCompetitionDTO, toSummaryDTO };
