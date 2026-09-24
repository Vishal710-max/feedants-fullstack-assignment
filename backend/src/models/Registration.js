const mongoose = require('mongoose');
const { Schema } = mongoose;

const registrationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
    status: { type: String, enum: ['REGISTERED', 'CANCELLED'], default: 'REGISTERED' },
    paymentStatus: { type: String, enum: ['PAID', 'REFUNDED'], default: 'PAID' },
    orderId: { type: String, required: true },
    paymentId: { type: String, required: true },
    amountPaid: { type: Number, required: true },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One registration per user per competition, enforced by the database.
registrationSchema.index({ userId: 1, competitionId: 1 }, { unique: true });
// A payment can never be used for two registrations.
registrationSchema.index({ paymentId: 1 }, { unique: true });
registrationSchema.index({ competitionId: 1, status: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
