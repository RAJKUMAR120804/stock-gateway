const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');

// Seed In-Memory fallback customers
const memoryCustomers = [
  {
    customerId: 'CUST-001-ADMIN',
    fullName: 'Stock Shop Administrator',
    email: 'admin@stockshop.com',
    phoneNumber: '9999999999',
    role: 'admin',
    address: { street: 'Stock Shop HQ, Outer Ring Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', country: 'India' },
    registrationDate: new Date(Date.now() - 86400000 * 30),
  },
  {
    customerId: 'CUST-002-RAGAVI',
    fullName: 'Ragavi M',
    email: 'ragavi@example.com',
    phoneNumber: '9876543210',
    role: 'customer',
    address: { street: 'Flat 402, Outer Ring Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560103', country: 'India' },
    registrationDate: new Date(Date.now() - 86400000 * 5),
  },
];

// @desc    Retrieve Admin Dashboard Summary from MongoDB (with In-Memory Fallback)
// @route   GET /api/admin/stats
const getAdminDashboardStats = async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const [totalCustomers, totalProducts, orders, payments] = await Promise.all([
        Customer.countDocuments({ role: 'customer' }),
        Product.countDocuments(),
        Order.find().sort({ orderDate: -1 }),
        Payment.find().sort({ transactionDate: -1 }),
      ]);

      const successfulPayments = payments.filter((p) => p.paymentStatus === 'SUCCESS').length;
      const failedPayments = payments.filter((p) => p.paymentStatus === 'FAILED').length;
      const pendingPayments = payments.filter((p) => p.paymentStatus === 'PENDING').length;
      const totalSalesRevenue = payments
        .filter((p) => p.paymentStatus === 'SUCCESS')
        .reduce((acc, p) => acc + (p.amount || 0), 0);

      return res.json({
        success: true,
        stats: {
          totalCustomers,
          totalProducts,
          totalOrders: orders.length,
          totalSalesRevenue,
          successfulPayments,
          failedPayments,
          pendingPayments,
          currency: 'INR',
        },
        recentOrders: orders.slice(0, 5),
        recentTransactions: payments.slice(0, 5),
        storage: 'MongoDB (Live Database)',
      });
    }

    // In-Memory Fallback if MongoDB daemon is not running locally
    const { memoryProducts } = require('./productController');
    const { memoryOrders } = require('./orderController');
    const { memoryPayments } = require('./paymentController');

    const successfulPayments = memoryPayments.filter((p) => p.paymentStatus === 'SUCCESS').length;
    const failedPayments = memoryPayments.filter((p) => p.paymentStatus === 'FAILED').length;
    const pendingPayments = memoryPayments.filter((p) => p.paymentStatus === 'PENDING').length;
    const totalSalesRevenue = memoryPayments
      .filter((p) => p.paymentStatus === 'SUCCESS')
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    return res.json({
      success: true,
      stats: {
        totalCustomers: memoryCustomers.filter((c) => c.role === 'customer').length,
        totalProducts: memoryProducts.length,
        totalOrders: memoryOrders.length,
        totalSalesRevenue,
        successfulPayments,
        failedPayments,
        pendingPayments,
        currency: 'INR',
      },
      recentOrders: memoryOrders.slice(0, 5),
      recentTransactions: memoryPayments.slice(0, 5),
      storage: 'In-Memory Fallback (Connect MongoDB to persist in Compass)',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Retrieve all registered customers (Admin)
// @route   GET /api/admin/customers
const getAllAdminCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      let query = {};
      if (search) {
        query.$or = [
          { fullName: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { customerId: new RegExp(search, 'i') },
          { phoneNumber: new RegExp(search, 'i') },
        ];
      }
      const customers = await Customer.find(query).select('-passwordHash').sort({ registrationDate: -1 });
      return res.json({ success: true, count: customers.length, customers, storage: 'MongoDB' });
    }

    let list = [...memoryCustomers];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.fullName?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.customerId?.toLowerCase().includes(q) ||
          c.phoneNumber?.includes(q)
      );
    }

    res.json({ success: true, count: list.length, customers: list, storage: 'In-Memory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Retrieve all products for management (Admin)
// @route   GET /api/admin/products
const getAllAdminProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      let query = {};
      if (category && category !== 'All') query.category = new RegExp(category, 'i');
      if (search) {
        query.$or = [
          { productName: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { productId: new RegExp(search, 'i') },
        ];
      }
      const products = await Product.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: products.length, products, storage: 'MongoDB' });
    }

    const { memoryProducts } = require('./productController');
    let list = [...memoryProducts];
    if (category && category !== 'All') {
      list = list.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.productName?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.productId?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: list.length, products: list, storage: 'In-Memory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new product (Admin)
// @route   POST /api/admin/products
const createAdminProduct = async (req, res) => {
  try {
    const { productName, description, category, price, stockQuantity, productImage, badge } = req.body;

    if (!productName || !category || !price) {
      return res.status(400).json({ success: false, message: 'Product name, category, and price are required' });
    }

    const productId = `PROD-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;
    const productData = {
      productId,
      productName: productName.trim(),
      description: description || '',
      category: category.trim(),
      price: Number(price),
      stockQuantity: Number(stockQuantity || 50),
      productImage: productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      badge: badge || 'New Arrival',
      rating: 4.5,
      reviewsCount: 1,
    };

    const isMongoConnected = mongoose.connection.readyState === 1;
    if (isMongoConnected) {
      const product = await Product.create(productData);
      return res.status(201).json({ success: true, message: 'Product saved in MongoDB', product });
    }

    const { memoryProducts } = require('./productController');
    memoryProducts.unshift(productData);
    res.status(201).json({ success: true, message: 'Product added successfully', product: productData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/admin/products/:id
const deleteAdminProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      await Product.findOneAndDelete({ $or: [{ productId: id }, { _id: id }] });
      return res.json({ success: true, message: 'Product deleted from MongoDB' });
    }

    const { memoryProducts } = require('./productController');
    const idx = memoryProducts.findIndex((p) => p.productId === id || String(p._id) === id);
    if (idx !== -1) {
      memoryProducts.splice(idx, 1);
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Retrieve all orders (Admin)
// @route   GET /api/admin/orders
const getAllAdminOrders = async (req, res) => {
  try {
    const { search, status } = req.query;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      let query = {};
      if (status && status !== 'All') query.orderStatus = status;
      if (search) {
        query.$or = [
          { orderId: new RegExp(search, 'i') },
          { 'customerDetails.email': new RegExp(search, 'i') },
          { 'customerDetails.fullName': new RegExp(search, 'i') },
          { paymentId: new RegExp(search, 'i') },
        ];
      }
      const orders = await Order.find(query).sort({ orderDate: -1 });
      return res.json({ success: true, count: orders.length, orders, storage: 'MongoDB' });
    }

    const { memoryOrders } = require('./orderController');
    let list = [...memoryOrders];
    if (status && status !== 'All') {
      list = list.filter((o) => (o.orderStatus || o.status)?.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderId?.toLowerCase().includes(q) ||
          o.paymentId?.toLowerCase().includes(q) ||
          o.customerDetails?.email?.toLowerCase().includes(q) ||
          o.customerDetails?.fullName?.toLowerCase().includes(q) ||
          o.customerDetails?.name?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: list.length, orders: list, storage: 'In-Memory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
const updateAdminOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const order = await Order.findOneAndUpdate(
        { $or: [{ orderId: id }, { _id: id }] },
        { orderStatus: status },
        { new: true }
      );
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, message: `Order updated to ${status}`, order });
    }

    const { memoryOrders } = require('./orderController');
    const order = memoryOrders.find((o) => o.orderId === id || String(o._id) === id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.orderStatus = status;
    res.json({ success: true, message: `Order updated to ${status}`, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Retrieve all payment transactions (Admin)
// @route   GET /api/admin/payments
const getAllAdminPayments = async (req, res) => {
  try {
    const { search, status } = req.query;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      let query = {};
      if (status && status !== 'All') query.paymentStatus = status;
      if (search) {
        query.$or = [
          { transactionId: new RegExp(search, 'i') },
          { orderId: new RegExp(search, 'i') },
          { customerId: new RegExp(search, 'i') },
          { paymentMethod: new RegExp(search, 'i') },
        ];
      }
      const payments = await Payment.find(query).sort({ transactionDate: -1 });
      return res.json({ success: true, count: payments.length, payments, storage: 'MongoDB' });
    }

    const { memoryPayments } = require('./paymentController');
    let list = [...memoryPayments];
    if (status && status !== 'All') {
      list = list.filter((p) => (p.paymentStatus || p.status) === status);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.transactionId?.toLowerCase().includes(q) ||
          p.orderId?.toLowerCase().includes(q) ||
          p.paymentMethod?.toLowerCase().includes(q) ||
          p.customerId?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: list.length, payments: list, storage: 'In-Memory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminDashboardStats,
  getAllAdminCustomers,
  getAllAdminProducts,
  createAdminProduct,
  deleteAdminProduct,
  getAllAdminOrders,
  updateAdminOrderStatus,
  getAllAdminPayments,
  memoryCustomers,
};
