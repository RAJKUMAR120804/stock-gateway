const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CustomerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
      default: () => `CUST-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'customers',
    timestamps: true,
  }
);

// Method to verify password against bcrypt hash
CustomerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('Customer', CustomerSchema);
