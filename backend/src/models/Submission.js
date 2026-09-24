const mongoose = require('mongoose');
const { Schema } = mongoose;

const submissionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
    fileUrl: { type: String, required: true },
    fileName: String,
    fileType: String,
    fileSize: Number,
    status: { type: String, enum: ['SUBMITTED', 'UNDER_REVIEW', 'REJECTED'], default: 'SUBMITTED' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

submissionSchema.index({ userId: 1, competitionId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
