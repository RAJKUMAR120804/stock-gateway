const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

// In-memory fallback in case MongoDB is not actively running locally
const memoryOrders = [];
const memoryCustomers = [];

router.post('/process', async (req, res) => {
  try {
    const { customer, items, amount, paymentMethod, paymentDetails } = req.body;

    // 1. Validation
    if (!customer || !customer.name || !customer.email) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and email are required.',
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items to checkout.',
      });
    }

    // 2. Demo Payment Gateway Simulation
    let isSuccess = true;
    let failureReason = '';

    if (paymentMethod === 'card') {
      const cardNum = (paymentDetails?.cardNumber || '').replace(/\s+/g, '');
      if (cardNum.length < 12) {
        isSuccess = false;
        failureReason = 'Invalid card number (must be at least 12 digits for demo).';
      } else if (!paymentDetails?.cvv || paymentDetails.cvv.length < 3) {
        isSuccess = false;
        failureReason = 'Invalid CVV (must be 3 or 4 digits).';
      }
    } else if (paymentMethod === 'upi') {
      const upiId = paymentDetails?.upiId || '';
      if (!upiId.includes('@')) {
        isSuccess = false;
        failureReason = 'Invalid UPI ID (format: username@bank).';
      }
    }

    const orderId = `AMZ-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transactionId = `TXN-PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    if (!isSuccess) {
      return res.status(400).json({
        success: false,
        message: `Payment Failed: ${failureReason}`,
        orderId,
      });
    }

    // 3. Database persistence (Mongoose or in-memory fallback)
    const orderData = {
      orderId,
      customerDetails: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || {},
      },
      items: items.map(item => ({
        productId: String(item.id || item.productId || 'p1'),
        title: item.title || item.name || 'Amazon Product',
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        image: item.image || '',
      })),
      totalAmount: Number(amount),
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'SUCCESS',
      transactionId,
      createdAt: new Date(),
    };

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      try {
        let dbCustomer = await Customer.findOne({ email: customer.email });
        if (!dbCustomer) {
          dbCustomer = await Customer.create({
            name: customer.name,
            email: customer.email,
            phone: customer.phone || '',
            address: customer.address || {},
          });
        }
        orderData.customer = dbCustomer._id;
        const savedOrder = await Order.create(orderData);
        return res.json({
          success: true,
          message: 'Payment verified and Order placed successfully!',
          order: savedOrder,
          storage: 'MongoDB',
        });
      } catch (dbErr) {
        console.warn('MongoDB write error, falling back to memory store:', dbErr.message);
      }
    }

    // Fallback store
    memoryOrders.unshift(orderData);
    let memCust = memoryCustomers.find(c => c.email === customer.email);
    if (!memCust) {
      memoryCustomers.push(customer);
    }

    return res.json({
      success: true,
      message: 'Payment verified and Order placed successfully!',
      order: orderData,
      storage: isMongoConnected ? 'MongoDB' : 'In-Memory (Start MongoDB for persistent DB)',
    });
  } catch (error) {
    console.error('Payment API error:', error);
    res.status(500).json({
      success: false,
      message: 'Server internal error processing payment: ' + error.message,
    });
  }
});

// Export memoryOrders for order queries fallback
router.memoryOrders = memoryOrders;

module.exports = router;

