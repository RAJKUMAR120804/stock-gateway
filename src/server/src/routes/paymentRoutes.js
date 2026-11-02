const express = require('express');
const router = express.Router();
const {
  processPaymentSimulation,
  getAllPayments,
} = require('../controllers/paymentController');

// Process simulated payment request & validate
router.post('/process', processPaymentSimulation);

// Retrieve all payment transaction records
router.get('/history', getAllPayments);
router.get('/transactions', getAllPayments);

module.exports = router;
