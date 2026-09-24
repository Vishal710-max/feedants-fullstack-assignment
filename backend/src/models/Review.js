const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 600 },
  },
  { timestamps: true }
);

reviewSchema.index({ competitionId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
