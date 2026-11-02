const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Protected (requires Bearer JWT)
router.get('/profile', protect, getCustomerProfile);
router.put('/profile', protect, updateCustomerProfile);

module.exports = router;
