const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const paymentRoute = require('./payment');

// GET all customer orders
router.get('/', async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const orders = await Order.find().sort({ createdAt: -1 }).populate('customer');
      return res.json({
        success: true,
        count: orders.length,
        orders,
        storage: 'MongoDB',
      });
    }

    // Fallback in-memory orders
    return res.json({
      success: true,
      count: paymentRoute.memoryOrders.length,
      orders: paymentRoute.memoryOrders,
      storage: 'In-Memory (Start MongoDB for persistent DB)',
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET order by orderId
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const order = await Order.findOne({ orderId }).populate('customer');
      if (order) return res.json({ success: true, order });
    }

    const memOrder = paymentRoute.memoryOrders.find(o => o.orderId === orderId);
    if (memOrder) return res.json({ success: true, order: memOrder });

    return res.status(404).json({ success: false, message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

