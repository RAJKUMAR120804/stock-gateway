const Customer = require('../models/Customer');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { memoryCustomers } = require('./adminController');

// @desc    Register new customer in MongoDB
// @route   POST /api/customers/register
const registerCustomer = async (req, res) => {
  try {
    const { fullName, name, email, password, phoneNumber, phone, address, role } = req.body;
    const custName = (fullName || name || '').trim();
    const custPhone = phoneNumber || phone || '';

    if (!custName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isMongoConnected = mongoose.connection.readyState === 1;

    // Hash password with bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (isMongoConnected) {
      const existing = await Customer.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A customer account with this email already exists',
        });
      }

      const customer = await Customer.create({
        fullName: custName,
        email: normalizedEmail,
        phoneNumber: custPhone,
        passwordHash,
        address: address || {},
        role: role === 'admin' ? 'admin' : 'customer',
        registrationDate: new Date(),
      });

      return res.status(201).json({
        success: true,
        message: 'Customer registered successfully in MongoDB',
        customer: {
          customerId: customer.customerId,
          fullName: customer.fullName,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          address: customer.address,
          role: customer.role,
          registrationDate: customer.registrationDate,
        },
        token: generateToken(customer._id, customer.role),
        storage: 'MongoDB',
      });
    }

    // In-Memory Fallback
    const memExists = memoryCustomers.find((c) => c.email === normalizedEmail);
    if (memExists) {
      return res.status(400).json({
        success: false,
        message: 'A customer account with this email already exists',
      });
    }

    const newMemCustomer = {
      customerId: `CUST-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: custName,
      email: normalizedEmail,
      phoneNumber: custPhone,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'customer',
      address: address || {},
      registrationDate: new Date(),
    };
    memoryCustomers.push(newMemCustomer);

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: newMemCustomer,
      token: generateToken(newMemCustomer.customerId, newMemCustomer.role),
      storage: 'In-Memory',
    });
  } catch (error) {
    console.error('Customer Register Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login customer & verify password hash
// @route   POST /api/customers/login
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const customer = await Customer.findOne({ email: normalizedEmail });
      if (customer && (await customer.matchPassword(password))) {
        return res.json({
          success: true,
          message: 'Login successful',
          customer: {
            customerId: customer.customerId,
            fullName: customer.fullName,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            address: customer.address,
            role: customer.role,
            registrationDate: customer.registrationDate,
          },
          token: generateToken(customer._id, customer.role),
          storage: 'MongoDB',
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // In-Memory Fallback
    const memCust = memoryCustomers.find((c) => c.email === normalizedEmail);
    if (memCust && (await bcrypt.compare(password, memCust.passwordHash || ''))) {
      return res.json({
        success: true,
        message: 'Login successful',
        customer: memCust,
        token: generateToken(memCust.customerId, memCust.role),
        storage: 'In-Memory',
      });
    }

    // Default Demo Logins
    if (normalizedEmail === 'admin@amazon.com' && password === 'admin123') {
      return res.json({
        success: true,
        message: 'Admin login successful',
        customer: memoryCustomers[0],
        token: generateToken(memoryCustomers[0].customerId, 'admin'),
        storage: 'In-Memory',
      });
    }

    if (normalizedEmail === 'ragavi@example.com' && (password === 'admin123' || password === 'demo123')) {
      return res.json({
        success: true,
        message: 'Demo customer login successful',
        customer: memoryCustomers[1],
        token: generateToken(memoryCustomers[1].customerId, 'customer'),
        storage: 'In-Memory',
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    console.error('Customer Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer profile (Protected)
// @route   GET /api/customers/profile
const getCustomerProfile = async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;
    if (isMongoConnected && req.customer?._id) {
      const customer = await Customer.findById(req.customer._id).select('-passwordHash');
      if (customer) return res.json({ success: true, customer, storage: 'MongoDB' });
    }
    return res.json({ success: true, customer: req.customer || memoryCustomers[1], storage: 'In-Memory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update customer details (Protected)
// @route   PUT /api/customers/profile
const updateCustomerProfile = async (req, res) => {
  try {
    const { fullName, name, phoneNumber, phone, address, password } = req.body;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected && req.customer?._id) {
      const customer = await Customer.findById(req.customer._id);
      if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

      if (fullName || name) customer.fullName = (fullName || name).trim();
      if (phoneNumber || phone) customer.phoneNumber = (phoneNumber || phone).trim();
      if (address) customer.address = { ...customer.address, ...address };
      if (password && password.length >= 6) {
        const salt = await bcrypt.genSalt(10);
        customer.passwordHash = await bcrypt.hash(password, salt);
      }

      const updated = await customer.save();
      return res.json({
        success: true,
        message: 'Customer profile updated in MongoDB',
        customer: updated,
      });
    }

    // In-Memory
    const targetCust = req.customer || memoryCustomers[1];
    if (fullName || name) targetCust.fullName = (fullName || name).trim();
    if (phoneNumber || phone) targetCust.phoneNumber = (phoneNumber || phone).trim();
    if (address) targetCust.address = { ...targetCust.address, ...address };

    res.json({
      success: true,
      message: 'Customer profile updated',
      customer: targetCust,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
};
