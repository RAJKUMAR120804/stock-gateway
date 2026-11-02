require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Legacy routes preserved for backward compatibility
const authRoutes = require('./routes/authRoutes');
const legacyPaymentRoutes = require('./routes/payment');
const legacyOrderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Global Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Backward-compatible endpoints
app.use('/api/auth', authRoutes);
app.use('/api/pay', legacyPaymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ONLINE',
    service: 'Stock Shop E-Commerce Customer Management & Payment System Backend',
    database: mongoose.connection.readyState === 1 ? 'MongoDB Connected' : 'In-Memory Fallback Active',
    timestamp: new Date().toISOString(),
    endpoints: {
      customers: '/api/customers',
      products: '/api/products',
      orders: '/api/orders',
      payments: '/api/payments',
      admin: '/api/admin',
    },
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 E-Commerce Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check:  GET  http://localhost:${PORT}/api/health`);
  console.log(`👤 Customers:     POST http://localhost:${PORT}/api/customers/register`);
  console.log(`🔐 Login:         POST http://localhost:${PORT}/api/customers/login`);
  console.log(`📦 Products:      GET  http://localhost:${PORT}/api/products`);
  console.log(`🛒 Orders:        POST http://localhost:${PORT}/api/orders`);
  console.log(`💳 Payments:      GET  http://localhost:${PORT}/api/payments/history`);
  console.log(`👑 Admin Stats:   GET  http://localhost:${PORT}/api/admin/stats`);
  console.log(`=======================================================`);
});
