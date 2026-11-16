const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Admin only
router.get('/stats', [auth, isAdmin], async (req, res) => {
  try {
    console.log('Admin stats request from user:', req.user._id);
    
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const farmers = await User.countDocuments({ role: 'farmer' });
    const consumers = await User.countDocuments({ role: 'consumer' });

    const stats = {
      totalUsers,
      totalProducts,
      farmers,
      consumers
    };
    
    console.log('Admin stats calculated:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update product (admin only)
// @access  Admin only
router.put('/products/:id', [auth, isAdmin], async (req, res) => {
  try {
    const { name, price, quantity, description, category, unit } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, quantity, description, category, unit },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete product (admin only)
// @access  Admin only
router.delete('/products/:id', [auth, isAdmin], async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders (admin only)
// @access  Admin only
router.get('/orders', [auth, isAdmin], async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status (admin only)
// @access  Admin only
router.put('/orders/:id/status', [auth, isAdmin], async (req, res) => {
  try {
    const { status } = req.body;
    console.log('Updating order status:', { orderId: req.params.id, status });
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      console.log('Order not found:', req.params.id);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('Order status updated successfully:', order._id);
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/support
// @desc    Get all support tickets (admin only)
// @access  Admin only
router.get('/support', [auth, isAdmin], async (req, res) => {
  try {
    const Support = require('../models/Support');
    const tickets = await Support.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/support/:id/respond
// @desc    Respond to support ticket (admin only)
// @access  Admin only
router.put('/support/:id/respond', [auth, isAdmin], async (req, res) => {
  try {
    const { response } = req.body;
    
    const Support = require('../models/Support');
    const ticket = await Support.findByIdAndUpdate(
      req.params.id,
      { 
        response,
        status: 'resolved',
        respondedBy: req.user._id,
        respondedAt: new Date()
      },
      { new: true }
    ).populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Respond to support ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Admin only
router.get('/users', [auth, isAdmin], async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role (admin only)
// @access  Admin only
router.put('/users/:id/role', [auth, isAdmin], async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['farmer', 'consumer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (admin only)
// @access  Admin only
router.delete('/users/:id', [auth, isAdmin], async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
