const express = require('express');
const router = express.Router();
const dbAdapter = require('../services/dbAdapter');
const { auth, isFarmerOrAdmin } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get available products (or all products if all=true)
router.get('/', async (req, res) => {
  try {
    const { category, all } = req.query;
    const filter = {};
    if (all !== 'true') {
      filter.isAvailable = true;
    }
    if (category) filter.category = category;

    const products = await dbAdapter.getProducts(filter);
    return res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Server error fetching products' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product details
router.get('/:id', async (req, res) => {
  try {
    const product = await dbAdapter.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ message: 'Server error fetching product' });
  }
});

// @route   POST /api/products
// @desc    Create a new product (Farmer or Admin)
router.post('/', [auth, isFarmerOrAdmin], async (req, res) => {
  try {
    const { name, description, price, category, image, stock, unit } = req.body;

    if (!name || !description || price === undefined || !category || stock === undefined || !unit) {
      return res.status(400).json({ message: 'Please provide all required product details' });
    }

    const newProduct = await dbAdapter.createProduct(
      {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
        stock: parseInt(stock, 10),
        unit: unit.trim()
      },
      req.user
    );

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: error.message || 'Server error creating product' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product (Farmer or Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const existing = await dbAdapter.getProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const userId = req.user.id || req.user._id;
    const isOwner = existing.farmer_id === userId || existing.farmer?.id === userId || existing.farmer?._id === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied. You can only edit your own products.' });
    }

    const updated = await dbAdapter.updateProduct(req.params.id, req.body);
    return res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ message: error.message || 'Server error updating product' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (Farmer or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await dbAdapter.getProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const userId = req.user.id || req.user._id;
    const isOwner = existing.farmer_id === userId || existing.farmer?.id === userId || existing.farmer?._id === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own products.' });
    }

    const result = await dbAdapter.deleteProduct(req.params.id);
    return res.json(result);
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: error.message || 'Server error deleting product' });
  }
});

module.exports = router;
