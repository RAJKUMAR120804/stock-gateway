const Product = require('../models/Product');
const mongoose = require('mongoose');

const INITIAL_CATALOG = [
  {
    productId: 'PROD-001-MAC',
    productName: 'Apple MacBook Air 13" (M2 Chip, 8GB RAM, 256GB SSD)',
    description: 'Strikingly thin design, 13.6-inch Liquid Retina display, 18 hours of battery life.',
    category: 'Electronics',
    price: 89990,
    stockQuantity: 45,
    productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    badge: "Stock Shop's Choice",
    rating: 4.8,
    reviewsCount: 3420,
  },
  {
    productId: 'PROD-002-SONY',
    productName: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    description: 'Industry-leading noise cancellation with two processors and 8 microphones.',
    category: 'Audio',
    price: 26990,
    stockQuantity: 60,
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    badge: 'Best Seller',
    rating: 4.7,
    reviewsCount: 8150,
  },
  {
    productId: 'PROD-003-WATCH',
    productName: 'Apple Watch Series 9 GPS 45mm Starlight Aluminium',
    description: 'Advanced health sensors, Always-On Retina display, S9 SiP chip with Double Tap.',
    category: 'Wearables',
    price: 39999,
    stockQuantity: 30,
    productImage: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500',
    badge: 'Limited Deal',
    rating: 4.6,
    reviewsCount: 1940,
  },
  {
    productId: 'PROD-004-KINDLE',
    productName: 'Kindle Paperwhite (16 GB) – 6.8" display with warm light',
    description: 'Purpose-built for reading with a flush-front design and 300 ppi glare-free display.',
    category: 'E-Readers',
    price: 13999,
    stockQuantity: 100,
    productImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
    badge: 'Best Seller',
    rating: 4.9,
    reviewsCount: 14200,
  },
  {
    productId: 'PROD-005-PS5',
    productName: 'Sony PlayStation 5 Console (Slim Disc Edition)',
    description: 'Slim design packing 1TB SSD storage, Ray Tracing, and 4K-TV gaming.',
    category: 'Gaming',
    price: 54990,
    stockQuantity: 25,
    productImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
    badge: 'Top Rated',
    rating: 4.9,
    reviewsCount: 5820,
  },
  {
    productId: 'PROD-006-MOUSE',
    productName: 'Logitech MX Master 3S Wireless Performance Mouse',
    description: 'Quiet Clicks, 8K DPI track-on-glass sensor, electromagnetic MagSpeed wheel.',
    category: 'Accessories',
    price: 8995,
    stockQuantity: 80,
    productImage: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500',
    badge: "Stock Shop's Choice",
    rating: 4.7,
    reviewsCount: 4300,
  },
];

let memoryProducts = [...INITIAL_CATALOG];

// @desc    Retrieve all products from MongoDB
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      let query = {};
      if (category && category !== 'All') {
        query.category = new RegExp(category, 'i');
      }
      if (search) {
        query.$or = [
          { productName: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { category: new RegExp(search, 'i') },
        ];
      }

      let products = await Product.find(query);

      // Auto-seed collection if empty
      if (products.length === 0 && !search && (!category || category === 'All')) {
        await Product.insertMany(INITIAL_CATALOG);
        products = await Product.find({});
      }

      return res.json({
        success: true,
        count: products.length,
        products,
        storage: 'MongoDB',
      });
    }

    // In-Memory Fallback
    let result = memoryProducts;
    if (category && category !== 'All') {
      result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: result.length,
      products: result,
      storage: 'In-Memory',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Retrieve single product by ID
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;
    if (isMongoConnected) {
      const product = await Product.findOne({
        $or: [{ productId: req.params.id }, { _id: req.params.id }],
      });
      if (product) return res.json({ success: true, product });
    }

    const mem = memoryProducts.find(
      (p) => p.productId === req.params.id || p._id === req.params.id
    );
    if (mem) return res.json({ success: true, product: mem });

    return res.status(404).json({ success: false, message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new product (Admin Only)
// @route   POST /api/products
const addProduct = async (req, res) => {
  try {
    const { productName, name, description, category, price, stockQuantity, stock, productImage, image, badge } = req.body;

    const payload = {
      productName: (productName || name).trim(),
      description: description || '',
      category: category.trim(),
      price: Number(price),
      stockQuantity: Number(stockQuantity || stock || 50),
      productImage: productImage || image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      badge: badge || 'New',
    };

    const isMongoConnected = mongoose.connection.readyState === 1;
    if (isMongoConnected) {
      const prod = await Product.create(payload);
      return res.status(201).json({ success: true, message: 'Product added to MongoDB', product: prod });
    }

    const memProd = { productId: 'PROD-' + Date.now(), ...payload };
    memoryProducts.unshift(memProd);
    res.status(201).json({ success: true, message: 'Product added', product: memProd });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  memoryProducts,
};
