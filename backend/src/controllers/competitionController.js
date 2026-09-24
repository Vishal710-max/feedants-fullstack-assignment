const Competition = require('../models/Competition');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const { findByIdOrSlug, getUserState } = require('../services/competitionService');
const { toCompetitionDTO, toSummaryDTO } = require('../presenters/competitionPresenter');

exports.list = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const filter = { isPublished: true };
  const [items, total] = await Promise.all([
    Competition.find(filter).sort({ registrationEnd: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Competition.countDocuments(filter),
  ]);
  const now = new Date();
  res.json({ success: true, data: { items: items.map((c) => toSummaryDTO(c, now)), page, limit, total } });
});

exports.get = asyncHandler(async (req, res) => {
  const competition = await findByIdOrSlug(req.params.idOrSlug);
  const { registration, submission } = await getUserState(req.user?.id, competition._id);
  res.set('Cache-Control', 'no-store'); // response contains per-user state
  res.json({ success: true, data: toCompetitionDTO(competition, { registration, submission }) });
});

exports.reviews = asyncHandler(async (req, res) => {
  const competition = await findByIdOrSlug(req.params.idOrSlug);
  const { page, limit } = req.query;
  const match = { competitionId: competition._id };

  const [items, stats] = await Promise.all([
    Review.find(match).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Review.aggregate([{ $match: match }, { $group: { _id: null, average: { $avg: '$rating' }, total: { $sum: 1 } } }]),
  ]);
  const { average = 0, total = 0 } = stats[0] || {};
  res.json({
    success: true,
    data: {
      items: items.map((r) => ({ id: String(r._id), userName: r.userName, rating: r.rating, comment: r.comment, createdAt: r.createdAt })),
      page,
      limit,
      total,
      average: Math.round(average * 10) / 10,
      hasMore: page * limit < total,
    },
  });
});
