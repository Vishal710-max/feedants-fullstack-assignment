const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const AppError = require('../utils/AppError');

const OBJECT_ID = /^[a-f\d]{24}$/i;
const SLUG = /^[a-z0-9-]{1,100}$/;

async function findByIdOrSlug(idOrSlug, { lean = true } = {}) {
  let filter;
  if (OBJECT_ID.test(idOrSlug)) filter = { _id: idOrSlug };
  else if (SLUG.test(idOrSlug)) filter = { slug: idOrSlug };
  else throw new AppError(400, 'INVALID_COMPETITION_ID', 'Invalid competition id.');

  let query = Competition.findOne({ ...filter, isPublished: true });
  if (lean) query = query.lean();
  const competition = await query;
  if (!competition) throw new AppError(404, 'COMPETITION_NOT_FOUND', 'Competition not found.');
  return competition;
}

async function getUserState(userId, competitionId) {
  if (!userId) return { registration: null, submission: null };
  const [registration, submission] = await Promise.all([
    Registration.findOne({ userId, competitionId, status: 'REGISTERED' }).lean(),
    Submission.findOne({ userId, competitionId }).lean(),
  ]);
  return { registration, submission };
}

module.exports = { findByIdOrSlug, getUserState };
