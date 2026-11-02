const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  addProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin Only
router.post('/', protect, adminOnly, addProduct);

module.exports = router;

