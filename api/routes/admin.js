const express = require('express');
const router = express.Router();
const dbAdapter = require('../services/dbAdapter');
const { auth, isAdmin } = require('../middleware/auth');

// Apply admin guard to all routes in this router
router.use(auth);
router.use(isAdmin);

// @route   GET /api/admin/stats
// @desc    Get dashboard metrics & Idea Lab indicators
router.get('/stats', async (req, res) => {
  try {
    const stats = await dbAdapter.getAdminStats();
    return res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

// @route   GET /api/admin/farmers
// @desc    Get all registered farmers with approval status
router.get('/farmers', async (req, res) => {
  try {
    const farmers = await dbAdapter.getFarmers();
    return res.json(farmers);
  } catch (error) {
    console.error('Error fetching admin farmers:', error);
    return res.status(500).json({ message: 'Error retrieving farmers' });
  }
});

// @route   PUT /api/admin/farmers/:id/approve
// @desc    Approve or suspend a farmer account
router.put('/farmers/:id/approve', async (req, res) => {
  try {
    const isApproved = req.body.isApproved !== undefined ? Boolean(req.body.isApproved) : true;
    const updated = await dbAdapter.approveFarmer(req.params.id, isApproved);
    if (!updated) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    return res.json(updated);
  } catch (error) {
    console.error('Error toggling farmer approval:', error);
    return res.status(500).json({ message: error.message || 'Error updating approval status' });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all platform orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await dbAdapter.getOrders(null, 'admin');
    return res.json(orders);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      'Pending', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled',
      'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updated = await dbAdapter.updateOrderStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.json(updated);
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: error.message || 'Server error updating order status' });
  }
});

// @route   GET /api/admin/support
// @desc    Get all support tickets
router.get('/support', async (req, res) => {
  try {
    const tickets = await dbAdapter.getSupportTickets(null, 'admin');
    return res.json(tickets);
  } catch (error) {
    console.error('Error fetching admin support tickets:', error);
    return res.status(500).json({ message: 'Server error fetching support tickets' });
  }
});

// @route   PUT /api/admin/support/:id/respond
// @desc    Admin response to ticket
router.put('/support/:id/respond', async (req, res) => {
  try {
    const { response } = req.body;
    if (!response || !response.trim()) {
      return res.status(400).json({ message: 'Response is required' });
    }

    const ticket = await dbAdapter.respondToSupportTicket(req.params.id, response.trim(), req.user);
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    return res.json(ticket);
  } catch (error) {
    console.error('Error responding to ticket:', error);
    return res.status(500).json({ message: error.message || 'Server error responding to ticket' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users list
router.get('/users', async (req, res) => {
  try {
    const users = await dbAdapter.getAllUsers();
    return res.json(users);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['farmer', 'consumer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await dbAdapter.updateUserRole(req.params.id, role);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ message: error.message || 'Server error updating user role' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user account
router.delete('/users/:id', async (req, res) => {
  try {
    await dbAdapter.deleteUser(req.params.id);
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: error.message || 'Server error deleting user' });
  }
});

// @route   GET /api/admin/products
// @desc    Admin get all products (including out-of-stock and unavailable)
router.get('/products', async (req, res) => {
  try {
    const products = await dbAdapter.getProducts({});
    return res.json(products);
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return res.status(500).json({ message: 'Server error fetching products' });
  }
});

// @route   POST /api/admin/products
// @desc    Admin create new product
router.post('/products', async (req, res) => {
  try {
    const { name, description, price, category, image, stock, unit, isAvailable, originFarm, harvestDate } = req.body;
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
        unit: unit.trim(),
        originFarm: originFarm || 'Uttan Coastal Agro Farm',
        harvestDate: harvestDate || 'Morning Harvest (5:30 AM)',
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true
      },
      req.user
    );

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product as admin:', error);
    return res.status(500).json({ message: error.message || 'Server error creating product' });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Admin update product
router.put('/products/:id', async (req, res) => {
  try {
    const updated = await dbAdapter.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(updated);
  } catch (error) {
    console.error('Error updating product as admin:', error);
    return res.status(500).json({ message: error.message || 'Server error updating product' });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Admin delete product
router.delete('/products/:id', async (req, res) => {
  try {
    await dbAdapter.deleteProduct(req.params.id);
    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product as admin:', error);
    return res.status(500).json({ message: error.message || 'Server error deleting product' });
  }
});

module.exports = router;
