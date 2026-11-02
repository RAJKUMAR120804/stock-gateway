const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
      default: () => `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    customerId: {
      type: String,
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['CARD', 'UPI', 'NETBANKING', 'COD'],
      default: 'CARD',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be greater than zero'],
    },
    paymentStatus: {
      type: String,
      enum: ['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'],
      default: 'SUCCESS',
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    paymentDetails: {
      maskedCard: { type: String, default: '' },
      upiId: { type: String, default: '' },
      bankName: { type: String, default: '' },
      gatewayResponse: { type: String, default: 'Simulated Approval: 200 OK' },
    },
  },
  {
    collection: 'payments',
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', PaymentSchema);

