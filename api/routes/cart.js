const express = require('express');
const router = express.Router();
const dbAdapter = require('../services/dbAdapter');
const { auth } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const cart = await dbAdapter.getCart(userId);
    return res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ message: 'Server error fetching cart' });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'consumer') {
      return res.status(403).json({ message: 'Only consumers can maintain shopping carts and place orders' });
    }

    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const userId = req.user.id || req.user._id;
    const cart = await dbAdapter.addToCart(userId, productId, quantity || 1);
    return res.json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(400).json({ message: error.message || 'Error adding item to cart' });
  }
});

// @route   PUT /api/cart/:itemId
// @desc    Update item quantity in cart
router.put('/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const userId = req.user.id || req.user._id;
    const cart = await dbAdapter.updateCartItem(userId, req.params.itemId, quantity);
    return res.json(cart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(400).json({ message: error.message || 'Error updating cart item' });
  }
});

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const cart = await dbAdapter.removeFromCart(userId, req.params.itemId);
    return res.json(cart);
  } catch (error) {
    console.error('Error removing cart item:', error);
    return res.status(500).json({ message: error.message || 'Error removing item from cart' });
  }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
router.delete('/', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const result = await dbAdapter.clearCart(userId);
    return res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({ message: 'Error clearing cart' });
  }
});

module.exports = router;
