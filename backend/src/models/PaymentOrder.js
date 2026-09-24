const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentOrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    mode: { type: String, enum: ['mock', 'razorpay'], required: true },
    // CREATED -> PROCESSING (claimed by a register call) -> PAID
    // FAILED = bad signature, REFUND_PENDING = paid but competition filled up meanwhile
    status: {
      type: String,
      enum: ['CREATED', 'PROCESSING', 'PAID', 'FAILED', 'REFUND_PENDING'],
      default: 'CREATED',
    },
    paymentId: String,
  },
  { timestamps: true }
);

paymentOrderSchema.index({ userId: 1, competitionId: 1 });

module.exports = mongoose.model('PaymentOrder', paymentOrderSchema);
