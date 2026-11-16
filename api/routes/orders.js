const express = require('express');
const router = express.Router();
const dbAdapter = require('../services/dbAdapter');
const { auth } = require('../middleware/auth');

// @route   GET /api/orders
// @desc    Get orders (user's own or all if admin/farmer)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await dbAdapter.getOrders(userId, req.user.role);
    return res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await dbAdapter.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const userId = req.user.id || req.user._id;
    const isOwner = order.user_id === userId || order.userId === userId || order.user?.id === userId || order.user?._id === userId;
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'farmer';

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: 'Access denied to view this order' });
    }

    return res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ message: 'Server error fetching order' });
  }
});

// @route   POST /api/orders
// @desc    Create a new order from active cart with delivery slot scheduling
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'consumer') {
      return res.status(403).json({ message: 'Only consumers can place farm harvest delivery orders' });
    }

    const { shippingAddress, deliverySlotId, deliveryDate, deliveryTimeSlot, paymentMethod } = req.body;
    if (!shippingAddress || !shippingAddress.trim()) {
      return res.status(400).json({ message: 'Shipping delivery address in Mira Bhayandar is required' });
    }

    const userId = req.user.id || req.user._id;
    const order = await dbAdapter.createOrder({
      userId,
      shippingAddress: shippingAddress.trim(),
      deliverySlotId,
      deliveryDate,
      deliveryTimeSlot,
      paymentMethod: paymentMethod || 'cod'
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(400).json({ message: error.message || 'Error creating order' });
  }
});

// Cancel Order Handler
const handleCancelOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const result = await dbAdapter.cancelOrder(req.params.id, userId);
    return res.json(result);
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(400).json({ message: error.message || 'Error cancelling order' });
  }
};

// @route   DELETE /api/orders/:id
router.delete('/:id', auth, handleCancelOrder);

// @route   PUT /api/orders/:id/cancel
router.put('/:id/cancel', auth, handleCancelOrder);

// @route   PUT /api/orders/:id/status
// @desc    Update order tracking status across 6-stage lifecycle
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      'Pending',
      'Accepted',
      'Preparing',
      'Ready',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      // Legacy lowercase backwards compatibility
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await dbAdapter.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const userId = req.user.id || req.user._id;
    const isAdmin = req.user.role === 'admin';
    const isFarmer = req.user.role === 'farmer';

    if (!isAdmin && !isFarmer) {
      return res.status(403).json({ message: 'Only cultivators or admins can update order tracking stage' });
    }

    if (isFarmer) {
      const allowedFarmerStages = ['Accepted', 'Preparing', 'Ready', 'Cancelled', 'pending', 'processing', 'cancelled'];
      if (!allowedFarmerStages.includes(status)) {
        return res.status(403).json({
          message: 'Farmers can only update preparation stages (Accepted, Preparing, Ready). Dispatch & Delivery are handled exclusively by delivery logistics / administrators.'
        });
      }

      const isOwner = await dbAdapter.isOrderBelongingToFarmer(req.params.id, userId);
      if (!isOwner) {
        return res.status(403).json({ message: 'Access denied: You can only update orders for your own farm harvest.' });
      }
    }

    const updated = await dbAdapter.updateOrderStatus(req.params.id, status);
    return res.json(updated);
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: error.message || 'Server error updating status' });
  }
});

module.exports = router;
