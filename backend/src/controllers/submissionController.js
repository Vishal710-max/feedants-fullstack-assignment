const fs = require('fs');
const path = require('path');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const { findByIdOrSlug } = require('../services/competitionService');
const { submissionPhase } = require('../services/lifecycle');
const { MIME_BY_EXT } = require('../utils/fileTypes');

/** Runs BEFORE multer so we reject ineligible users without receiving a large upload. */
exports.assertCanSubmit = asyncHandler(async (req, res, next) => {
  const competition = await findByIdOrSlug(req.params.idOrSlug);
  const registered = await Registration.exists({ userId: req.user.id, competitionId: competition._id, status: 'REGISTERED' });
  if (!registered) throw new AppError(403, 'NOT_REGISTERED', 'Only registered participants can upload a submission.');

  const phase = submissionPhase(competition, new Date());
  if (phase === 'NOT_STARTED') throw new AppError(409, 'SUBMISSION_NOT_STARTED', 'Submissions have not opened yet.');
  if (phase === 'CLOSED') throw new AppError(409, 'SUBMISSION_CLOSED', 'The submission deadline has passed.');

  if (await Submission.exists({ userId: req.user.id, competitionId: competition._id })) {
    throw new AppError(409, 'DUPLICATE_SUBMISSION', 'You have already uploaded a submission.');
  }
  req.competition = competition;
  next();
});

const removeFile = (file) => file && fs.promises.unlink(file.path).catch(() => {});

exports.create = asyncHandler(async (req, res) => {
  const { file, competition } = req;
  if (!file) throw new AppError(400, 'FILE_REQUIRED', 'Choose a file to upload.');

  try {
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    const extOk = competition.allowedFileTypes.includes(ext);
    const mimeOk = extOk && (MIME_BY_EXT[ext] || []).includes(file.mimetype);
    if (!extOk || !mimeOk) {
      throw new AppError(400, 'INVALID_FILE_TYPE', `Allowed file types: ${competition.allowedFileTypes.join(', ').toUpperCase()}.`);
    }
    if (file.size > competition.maxFileSizeMB * 1024 * 1024) {
      throw new AppError(413, 'FILE_TOO_LARGE', `File must be smaller than ${competition.maxFileSizeMB} MB.`);
    }

    const submission = await Submission.create({
      userId: req.user.id,
      competitionId: competition._id,
      fileUrl: `/uploads/submissions/${competition._id}/${file.filename}`,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
    });
    res.status(201).json({
      success: true,
      message: 'Submission uploaded',
      data: { id: String(submission._id), status: submission.status, submittedAt: submission.submittedAt },
    });
  } catch (err) {
    await removeFile(file);
    if (err.code === 11000) throw new AppError(409, 'DUPLICATE_SUBMISSION', 'You have already uploaded a submission.');
    throw err;
  }
});

exports.mine = asyncHandler(async (req, res) => {
  const competition = await findByIdOrSlug(req.params.idOrSlug);
  const submission = await Submission.findOne({ userId: req.user.id, competitionId: competition._id }).lean();
  res.json({ success: true, data: submission });
});
