const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');

const memoryOrders = [
  {
    orderId: 'ORD-948201-1024',
    customerId: 'CUST-002-RAGAVI',
    customerDetails: {
      fullName: 'Ragavi M',
      email: 'ragavi@example.com',
      phoneNumber: '9876543210',
      address: { street: 'Flat 402, Outer Ring Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560103' },
    },
    productsPurchased: [
      {
        productId: 'PROD-002-SONY',
        productName: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        price: 26990,
        quantity: 1,
        productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      },
    ],
    totalAmount: 26990,
    orderStatus: 'Confirmed',
    orderDate: new Date(Date.now() - 86400000 * 2),
    paymentId: 'TXN-DEMO-S98X2K',
  },
];

// @desc    Create Order & Payment records in MongoDB
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { customerDetails, items, totalAmount, paymentMethod, paymentDetails } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Products purchased are required' });
    }

    const email = customerDetails?.email?.toLowerCase().trim();
    let customerId = 'CUST-GUEST';

    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transactionId = `TXN-DEMO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const method = (paymentMethod || 'DEBIT_CARD').toUpperCase();

    const isMongoConnected = mongoose.connection.readyState === 1;

    const orderData = {
      orderId,
      customerId,
      customerDetails: {
        fullName: customerDetails?.name || customerDetails?.fullName || 'Guest Customer',
        email: email || 'guest@example.com',
        phoneNumber: customerDetails?.phone || customerDetails?.phoneNumber || '',
        address: customerDetails?.address || {},
      },
      productsPurchased: items.map((i) => ({
        productId: String(i.productId || i.id || 'PROD-01'),
        productName: i.productName || i.title || 'Product',
        price: Number(i.price || 0),
        quantity: Number(i.quantity || 1),
        productImage: i.productImage || i.image || '',
      })),
      totalAmount: Number(totalAmount),
      orderStatus: 'Confirmed',
      orderDate: new Date(),
      paymentId: transactionId,
    };

    const paymentData = {
      transactionId,
      orderId,
      customerId,
      paymentMethod: method,
      amount: Number(totalAmount),
      paymentStatus: 'SUCCESS',
      transactionDate: new Date(),
      paymentDetails: {
        maskedCard: paymentDetails?.cardNumber ? `•••• •••• •••• ${paymentDetails.cardNumber.slice(-4)}` : '',
        upiId: paymentDetails?.upiId || '',
        bankName: paymentDetails?.bank || paymentDetails?.bankName || '',
        gatewayResponse: 'Simulated Approval: 200 OK (Academic Demo)',
      },
    };

    if (isMongoConnected) {
      if (email) {
        const cust = await Customer.findOne({ email });
        if (cust) {
          customerId = cust.customerId;
          orderData.customerId = customerId;
          paymentData.customerId = customerId;
        }
      }

      const order = await Order.create(orderData);
      const payment = await Payment.create(paymentData);

      return res.status(201).json({
        success: true,
        message: 'Order and Payment records created in MongoDB',
        order,
        payment,
        storage: 'MongoDB (Collections: orders, payments)',
      });
    }

    // In-Memory Fallback
    const { memoryCustomers } = require('./adminController');
    const existingCust = memoryCustomers.find((c) => c.email === email);
    if (existingCust) {
      customerId = existingCust.customerId;
      orderData.customerId = customerId;
      paymentData.customerId = customerId;
    }

    memoryOrders.unshift(orderData);
    const { memoryPayments } = require('./paymentController');
    memoryPayments.unshift(paymentData);

    res.status(201).json({
      success: true,
      message: 'Order and Payment simulated successfully',
      order: orderData,
      payment: paymentData,
      storage: 'In-Memory Fallback',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Retrieve all customer order history
// @route   GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const orders = await Order.find().sort({ orderDate: -1 });
      return res.json({ success: true, count: orders.length, orders, storage: 'MongoDB' });
    }

    res.json({ success: true, count: memoryOrders.length, orders: memoryOrders, storage: 'In-Memory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Retrieve customer specific order history
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    const email = (req.customer?.email || req.query.email || '').toLowerCase().trim();
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const query = email ? { 'customerDetails.email': email } : {};
      const orders = await Order.find(query).sort({ orderDate: -1 });
      return res.json({ success: true, count: orders.length, orders, storage: 'MongoDB' });
    }

    const filtered = email
      ? memoryOrders.filter((o) => o.customerDetails?.email?.toLowerCase().trim() === email)
      : memoryOrders;
    res.json({ success: true, count: filtered.length, orders: filtered, storage: 'In-Memory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Retrieve single order by Order ID
// @route   GET /api/orders/:orderId
const getOrderById = async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;
    if (isMongoConnected) {
      const order = await Order.findOne({ orderId: req.params.orderId });
      if (order) return res.json({ success: true, order });
    }

    const mem = memoryOrders.find((o) => o.orderId === req.params.orderId);
    if (mem) return res.json({ success: true, order: mem });

    return res.status(404).json({ success: false, message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  memoryOrders,
};
