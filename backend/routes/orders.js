const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const isCancellable = (order) => {
  return ['ordered', 'pending', 'processing', 'shipped'].includes(order.status);
};

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private (Consumer only)
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id, status: { $ne: 'cancelled' } })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private (Consumer only)
router.get('/:id', [auth], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders
// @desc    Create a new order from cart
// @access  Private (Consumer only)
router.post('/', [
  auth,
  body('shippingAddress').trim().notEmpty().withMessage('Shipping address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shippingAddress } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock and prepare order items
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;

      if (!product.isAvailable) {
        return res.status(400).json({ 
          message: `Product "${product.name}" is no longer available` 
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for "${product.name}"` 
        });
      }

      const itemTotal = product.price * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity
      });

      // Update product stock
      product.stock -= cartItem.quantity;
      if (product.stock === 0) {
        product.isAvailable = false;
      }
      await product.save();
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    const populatedOrder = await Order.findById(order._id).populate('items.product', 'name image');
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Cancel (delete) an order if it is still pending/processing
// @access  Private (Consumer only)
const cancelOrderHandler = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!isCancellable(order)) {
      console.log(`Order status: ${order.status}, isCancellable: ${isCancellable(order)}`);
      return res.status(400).json({ message: 'Order can no longer be cancelled' });
    }

    order.status = 'cancelled';
    order.paymentStatus = 'pending';
    await order.save();

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        product.isAvailable = true;
        await product.save();
      }
    }

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

router.delete('/:id', [auth], cancelOrderHandler);
router.put('/:id/cancel', [auth], cancelOrderHandler);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (for tracking)
// @access  Private
router.put('/:id/status', [
  auth,
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status } = req.body;

    // Validate status transitions
    const validTransitions = {
      'ordered': ['processing', 'cancelled'],
      'pending': ['processing', 'cancelled'],
      'processing': ['out_for_delivery', 'cancelled'],
      'shipped': ['out_for_delivery', 'cancelled'],
      'out_for_delivery': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ message: `Cannot change status from ${order.status} to ${status}` });
    }

    order.status = status;
    await order.save();

    const populatedOrder = await Order.findById(order._id).populate('items.product', 'name image');
    res.json(populatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

