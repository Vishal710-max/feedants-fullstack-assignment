const mongoose = require('mongoose');
const { Schema } = mongoose;

const rewardSchema = new Schema(
  {
    position: { type: Number, required: true, min: 1 },
    label: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const winnerSchema = new Schema(
  {
    name: { type: String, required: true },
    position: Number,
    label: String,
    thumbnailUrl: String,
    videoUrl: String,
  },
  { _id: false }
);

const parameterSchema = new Schema(
  { title: String, description: String, weightage: Number },
  { _id: false }
);

const competitionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9-]+$/ },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    tags: [String],
    certificateText: String,

    prizePool: { type: Number, required: true, min: 0 },
    entryFee: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },

    maxParticipants: { type: Number, required: true, min: 1 },
    // Denormalised counter. Only ever changed with atomic $inc guarded by a filter.
    registeredCount: { type: Number, default: 0, min: 0 },

    registrationStart: { type: Date, required: true },
    registrationEnd: { type: Date, required: true },
    submissionStart: { type: Date, required: true },
    submissionEnd: { type: Date, required: true },
    resultDate: { type: Date, required: true },

    judge: {
      name: String,
      designation: String,
      experience: String,
      imageUrl: String,
      introVideoUrl: String,
    },

    about: [String],
    judgingParameters: [parameterSchema],
    rules: [String],
    eligibility: [String],
    rewards: [rewardSchema],
    previousWinners: [winnerSchema],

    disclaimer: String,
    refundPolicy: String,
    prizeInfoVideoUrl: String,
    referralReward: { type: Number, default: 0 },

    allowedFileTypes: { type: [String], default: ['mp4', 'mov'] },
    maxFileSizeMB: { type: Number, default: 100 },

    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

competitionSchema.pre('validate', function (next) {
  if (this.registrationEnd <= this.registrationStart) return next(new Error('registrationEnd must be after registrationStart'));
  if (this.submissionEnd <= this.submissionStart) return next(new Error('submissionEnd must be after submissionStart'));
  if (this.resultDate < this.submissionEnd) return next(new Error('resultDate must not be before submissionEnd'));
  next();
});

competitionSchema.index({ isPublished: 1, registrationEnd: -1 });

module.exports = mongoose.model('Competition', competitionSchema);
