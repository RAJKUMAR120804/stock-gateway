const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
      required: true,
      default: () => `PROD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be greater than zero'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      default: 50,
      min: [0, 'Stock cannot be negative'],
    },
    productImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    },
    badge: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: 'products',
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', ProductSchema);
