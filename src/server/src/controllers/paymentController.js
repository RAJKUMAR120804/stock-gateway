const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');

const memoryPayments = [];

// @desc    Simulate Payment Gateway Transaction
// @route   POST /api/payments/process
const processPaymentSimulation = async (req, res) => {
  try {
    const {
      orderId,
      customerId,
      customerDetails,
      items,
      amount,
      paymentMethod,
      paymentDetails,
      simulationOutcome, // 'SUCCESS' | 'FAILED' | 'PENDING'
    } = req.body;

    // 1. Validate incoming request
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount.',
      });
    }

    if (!customerDetails || !customerDetails.fullName || !customerDetails.email) {
      return res.status(400).json({
        success: false,
        message: 'Customer information (full name and email) is required.',
      });
    }

    const method = (paymentMethod || 'DEBIT_CARD').toUpperCase();
    const validMethods = ['UPI', 'DEBIT_CARD', 'CREDIT_CARD', 'NETBANKING'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${validMethods.join(', ')}`,
      });
    }

    // 2. Generate unique Transaction ID & Order ID (if not provided)
    const finalOrderId = orderId || `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transactionId = `TXN-DEMO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const now = new Date();

    // 3. Determine simulation outcome (default: SUCCESS, or user-chosen test toggle)
    const outcome = simulationOutcome || 'SUCCESS'; // 'SUCCESS' | 'FAILED' | 'PENDING'

    // Mask card details for academic privacy (NEVER store real cards)
    let maskedIdentifier = '';
    if (method === 'CREDIT_CARD' || method === 'DEBIT_CARD') {
      const rawCard = String(paymentDetails?.cardNumber || '4532892012345678').replace(/\s+/g, '');
      maskedIdentifier = `•••• •••• •••• ${rawCard.slice(-4)}`;
    } else if (method === 'UPI') {
      maskedIdentifier = paymentDetails?.upiId || 'demo@upi';
    } else if (method === 'NETBANKING') {
      maskedIdentifier = `NetBanking: ${paymentDetails?.bankName || 'HDFC Bank'}`;
    }

    let gatewayMessage = '';
    if (outcome === 'SUCCESS') {
      gatewayMessage = 'Simulated Gateway Approval: Funds captured successfully (Academic Demo)';
    } else if (outcome === 'FAILED') {
      gatewayMessage = 'Simulated Gateway Decline: Insufficient funds or card declined by test bank';
    } else {
      gatewayMessage = 'Simulated Gateway Pending: Awaiting confirmation from test banking network';
    }

    // 4. Prepare Payment Transaction Record
    const paymentRecord = {
      transactionId,
      orderId: finalOrderId,
      customerId: customerId || 'CUST-DEMO',
      paymentMethod: method,
      amount: Number(amount),
      paymentStatus: outcome,
      transactionDate: now,
      paymentDetails: {
        maskedCard: maskedIdentifier,
        upiId: method === 'UPI' ? maskedIdentifier : '',
        bankName: method === 'NETBANKING' ? (paymentDetails?.bankName || 'HDFC Bank') : '',
        gatewayResponse: gatewayMessage,
      },
    };

    // 5. Prepare Order Record with Updated Status
    const orderRecord = {
      orderId: finalOrderId,
      customerId: customerId || 'CUST-DEMO',
      customerDetails: {
        fullName: customerDetails.fullName.trim(),
        email: customerDetails.email.toLowerCase().trim(),
        phoneNumber: customerDetails.phoneNumber || customerDetails.phone || '',
        address: customerDetails.address || {},
      },
      productsPurchased: (items || []).map((i) => ({
        productId: String(i.productId || i.id || 'PROD-01'),
        productName: i.productName || i.title || 'Product',
        price: Number(i.price || 0),
        quantity: Number(i.quantity || 1),
        productImage: i.productImage || i.image || '',
      })),
      totalAmount: Number(amount),
      orderStatus: outcome === 'SUCCESS' ? 'Confirmed' : outcome === 'PENDING' ? 'Processing' : 'Cancelled',
      orderDate: now,
      paymentId: transactionId,
    };

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      // Save Payment in MongoDB
      const savedPayment = await Payment.create(paymentRecord);

      // Save / Update Order in MongoDB
      const savedOrder = await Order.create(orderRecord);

      return res.status(outcome === 'FAILED' ? 400 : 200).json({
        success: outcome !== 'FAILED',
        outcome,
        message: gatewayMessage,
        transaction: savedPayment,
        order: savedOrder,
        storage: 'MongoDB (Collection: payments & orders)',
      });
    }

    // In-Memory Fallback
    memoryPayments.unshift(paymentRecord);
    const { memoryOrders } = require('./orderController');
    memoryOrders.unshift(orderRecord);

    return res.status(outcome === 'FAILED' ? 400 : 200).json({
      success: outcome !== 'FAILED',
      outcome,
      message: gatewayMessage,
      transaction: paymentRecord,
      order: orderRecord,
      storage: 'In-Memory Fallback (Academic Simulation)',
    });
  } catch (error) {
    console.error('Payment Gateway Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error processing simulated payment: ' + error.message,
    });
  }
};

// @desc    Retrieve all payment records
// @route   GET /api/payments/history
const getAllPayments = async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;
    if (isMongoConnected) {
      const payments = await Payment.find().sort({ transactionDate: -1 });
      return res.json({ success: true, count: payments.length, payments, storage: 'MongoDB' });
    }

    res.json({ success: true, count: memoryPayments.length, payments: memoryPayments, storage: 'In-Memory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  processPaymentSimulation,
  getAllPayments,
  memoryPayments,
};
