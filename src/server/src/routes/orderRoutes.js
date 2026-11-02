const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Flexible middleware: checks token if supplied, otherwise proceeds to query filtering
const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

// Place order (Supports authenticated or checkout payload)
router.post('/', createOrder);

// Get all orders (History tracking & admin)
router.get('/', getAllOrders);

// Get customer specific order history
router.get('/myorders', optionalProtect, getMyOrders);

// Get specific order by Order ID
router.get('/:orderId', getOrderById);

module.exports = router;
