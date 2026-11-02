const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const generateToken = require('../utils/generateToken');

// In-Memory fallback users cache for offline development
const memoryUsers = [
  {
    _id: 'admin_mem_001',
    name: 'Amazon Admin',
    email: 'admin@amazon.com',
    passwordHash: '$2a$10$wE9l17n6r6h9fI5wR50bB.p9e25Bv.HjP2ZgWk2Y6E7t5r4w8G5mO', // admin123
    role: 'admin',
    phone: '9999999999',
    address: { street: 'Amazon HQ', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
    createdAt: new Date(),
  },
];

const getMemoryUserById = (id) => {
  const user = memoryUsers.find((u) => u._id === id);
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

// @desc    Register a new customer
// @route   POST /api/auth/register
const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isMongoConnected = mongoose.connection.readyState === 1;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = role === 'admin' ? 'admin' : 'customer';

    if (isMongoConnected) {
      const userExists = await Customer.findOne({ email: normalizedEmail });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      }

      const customer = await Customer.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || '',
        address: address || {},
        role: userRole,
      });

      return res.status(201).json({
        success: true,
        message: 'Registration successful!',
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          role: customer.role,
          phone: customer.phone,
          address: customer.address,
        },
        token: generateToken(customer._id, customer.role),
        storage: 'MongoDB',
      });
    }

    // In-Memory Fallback
    const memExists = memoryUsers.find((u) => u.email === normalizedEmail);
    if (memExists) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const newMemUser = {
      _id: 'user_mem_' + Date.now(),
      name,
      email: normalizedEmail,
      passwordHash: hashedPassword,
      role: userRole,
      phone: phone || '',
      address: address || {},
      createdAt: new Date(),
    };
    memoryUsers.push(newMemUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      customer: {
        id: newMemUser._id,
        name: newMemUser.name,
        email: newMemUser.email,
        role: newMemUser.role,
        phone: newMemUser.phone,
        address: newMemUser.address,
      },
      token: generateToken(newMemUser._id, newMemUser.role),
      storage: 'In-Memory',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Customer & Admin login
// @route   POST /api/auth/login
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isMongoConnected = mongoose.connection.readyState === 1;

    // Hardcoded seed check for instant testing of admin
    if (normalizedEmail === 'admin@amazon.com' && password === 'admin123') {
      return res.json({
        success: true,
        message: 'Admin login successful!',
        customer: {
          id: 'admin_master_001',
          name: 'Amazon Administrator',
          email: 'admin@amazon.com',
          role: 'admin',
        },
        token: generateToken('admin_master_001', 'admin'),
      });
    }

    if (isMongoConnected) {
      const customer = await Customer.findOne({ email: normalizedEmail });
      if (customer && (await customer.matchPassword(password))) {
        return res.json({
          success: true,
          message: 'Login successful!',
          customer: {
            id: customer._id,
            name: customer.name,
            email: customer.email,
            role: customer.role,
            phone: customer.phone,
            address: customer.address,
          },
          token: generateToken(customer._id, customer.role),
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // In-Memory Fallback Check
    const memUser = memoryUsers.find((u) => u.email === normalizedEmail);
    if (memUser && (await bcrypt.compare(password, memUser.passwordHash))) {
      return res.json({
        success: true,
        message: 'Login successful!',
        customer: {
          id: memUser._id,
          name: memUser.name,
          email: memUser.email,
          role: memUser.role,
          phone: memUser.phone,
          address: memUser.address,
        },
        token: generateToken(memUser._id, memUser.role),
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer profile
// @route   GET /api/auth/profile
const getCustomerProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      customer: req.customer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  getMemoryUserById,
  memoryUsers,
};

