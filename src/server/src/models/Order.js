const mongoose = require('mongoose');

const PurchasedProductSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  productImage: {
    type: String,
    default: '',
  },
});

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
      default: () => `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    customerId: {
      type: String,
      required: true,
      index: true,
    },
    customerDetails: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phoneNumber: { type: String, default: '' },
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, default: '' },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' },
      },
    },
    productsPurchased: [PurchasedProductSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount must be positive'],
    },
    orderStatus: {
      type: String,
      enum: ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Confirmed',
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    paymentId: {
      type: String,
      default: '',
    },
  },
  {
    collection: 'orders',
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', OrderSchema);
