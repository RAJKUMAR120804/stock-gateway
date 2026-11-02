const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Customer = require('../models/Customer');

// Protect private routes with Bearer JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'super_secret_jwt_amazon_key_2026_secure';
      const decoded = jwt.verify(token, secret);

      const isMongoConnected = mongoose.connection.readyState === 1;
      if (isMongoConnected) {
        req.customer = await Customer.findById(decoded.id).select('-passwordHash');
        if (!req.customer) {
          req.customer = await Customer.findOne({ customerId: decoded.id }).select('-passwordHash');
        }
      }

      // If not found in Mongo or Mongo not connected, check memoryCustomers
      if (!req.customer) {
        const { memoryCustomers } = require('../controllers/adminController');
        const found = memoryCustomers.find(
          (c) =>
            String(c._id) === String(decoded.id) ||
            String(c.customerId) === String(decoded.id) ||
            String(c.email) === String(decoded.id)
        );
        if (found) {
          const { passwordHash, ...safeCust } = found;
          req.customer = safeCust;
        }
      }

      if (!req.customer) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized: Customer record not found',
        });
      }

      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Token invalid or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Bearer token required in Authorization header',
    });
  }
};

// Admin role check middleware
const adminOnly = (req, res, next) => {
  if (req.customer && req.customer.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access Denied: Administrator privileges required',
    });
  }
};

module.exports = { protect, adminOnly };
