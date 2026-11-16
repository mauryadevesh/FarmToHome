const express = require('express');
const router = express.Router();
const dbAdapter = require('../services/dbAdapter');
const { auth } = require('../middleware/auth');

// @route   GET /api/delivery/slots
// @desc    Get active delivery slots for date (optional ?date=YYYY-MM-DD)
router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query;
    const slots = await dbAdapter.getDeliverySlots(date);
    return res.json(slots);
  } catch (error) {
    console.error('Error fetching delivery slots:', error);
    return res.status(500).json({ message: 'Error retrieving delivery slots' });
  }
});

// @route   POST /api/delivery/slots
// @desc    Admin create custom delivery slot
router.post('/slots', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const newSlot = await dbAdapter.createDeliverySlot(req.body);
    return res.status(201).json(newSlot);
  } catch (error) {
    console.error('Error creating delivery slot:', error);
    return res.status(400).json({ message: error.message || 'Error creating delivery slot' });
  }
});

// @route   PUT /api/delivery/slots/:id
// @desc    Admin update slot capacity or active toggle
router.put('/slots/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const updated = await dbAdapter.updateDeliverySlot(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Delivery slot not found' });
    }
    return res.json(updated);
  } catch (error) {
    console.error('Error updating delivery slot:', error);
    return res.status(400).json({ message: error.message || 'Error updating delivery slot' });
  }
});

// @route   GET /api/delivery/track/:orderId
// @desc    Get live delivery tracking status & map coordinates
router.get('/track/:orderId', auth, async (req, res) => {
  try {
    const trackingData = await dbAdapter.getDeliveryByOrderId(req.params.orderId);
    if (!trackingData) {
      return res.status(404).json({ message: 'Order or tracking information not found' });
    }

    const userId = req.user.id || req.user._id;
    const isOwner = trackingData.order.user_id === userId || trackingData.order.userId === userId;
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'farmer';

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: 'Access denied to track this order' });
    }

    return res.json(trackingData);
  } catch (error) {
    console.error('Error fetching delivery tracking:', error);
    return res.status(500).json({ message: error.message || 'Error fetching tracking details' });
  }
});

// @route   PUT /api/delivery/status/:orderId
// @desc    Farmer or admin update delivery status (6-stage pipeline)
router.put('/status/:orderId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Only cultivators and platform administrators can update delivery stages' });
    }

    const { status, driverName, driverPhone, currentLat, currentLng, estimatedArrival } = req.body;
    const validStatuses = [
      'Pending',
      'Accepted',
      'Preparing',
      'Ready',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ];

    let normalizedStatus = status;
    const lower = (status || '').toLowerCase().replace(/[_-]/g, ' ').trim();
    if (lower === 'pending') normalizedStatus = 'Pending';
    else if (lower === 'accepted') normalizedStatus = 'Accepted';
    else if (lower === 'preparing') normalizedStatus = 'Preparing';
    else if (lower === 'ready') normalizedStatus = 'Ready';
    else if (lower === 'out for delivery') normalizedStatus = 'Out for Delivery';
    else if (lower === 'delivered') normalizedStatus = 'Delivered';
    else if (lower === 'cancelled') normalizedStatus = 'Cancelled';

    if (!normalizedStatus || !validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        message: `Invalid status: "${status}". Valid stages are: ${validStatuses.join(' → ')}`
      });
    }

    const userId = req.user.id || req.user._id;
    if (req.user.role === 'farmer') {
      const allowedFarmerStages = ['Accepted', 'Preparing', 'Ready', 'Cancelled'];
      if (!allowedFarmerStages.includes(normalizedStatus)) {
        return res.status(403).json({
          message: 'Farmers can only update preparation stages (Accepted, Preparing, Ready). Dispatch & Delivery are handled exclusively by delivery logistics / administrators.'
        });
      }

      const isOwner = await dbAdapter.isOrderBelongingToFarmer(req.params.orderId, userId);
      if (!isOwner) {
        return res.status(403).json({ message: 'Access denied: You can only update delivery status for orders containing your farm crops.' });
      }
    }

    const updated = await dbAdapter.updateDeliveryStatus(req.params.orderId, normalizedStatus, {
      driverName,
      driverPhone,
      currentLat,
      currentLng,
      estimatedArrival
    });

    return res.json(updated);
  } catch (error) {
    console.error('Error updating delivery stage:', error);
    return res.status(400).json({ message: error.message || 'Error updating delivery stage' });
  }
});

module.exports = router;
