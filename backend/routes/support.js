const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Support = require('../models/Support');
const { auth } = require('../middleware/auth');

// @route   GET /api/support
// @desc    Get user's support tickets
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tickets = await Support.find({ user: req.user.id })
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/support/:id
// @desc    Get single support ticket
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Support.findById(req.params.id)
      .populate('user', 'name email')
      .populate('respondedBy', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    // Check if user owns this ticket
    if (ticket.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/support
// @desc    Create new support ticket
// @access  Private
router.post('/', [
  auth,
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('category').optional().isIn(['order', 'product', 'payment', 'account', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, message, category, priority } = req.body;

    const ticket = await Support.create({
      user: req.user.id,
      subject,
      message,
      category: category || 'other',
      priority: priority || 'medium'
    });

    const populatedTicket = await Support.findById(ticket._id).populate('user', 'name email');
    
    res.status(201).json(populatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/support/:id/respond
// @desc    Respond to support ticket (admin/farmer response)
// @access  Private
router.put('/:id/respond', [
  auth,
  body('response').trim().notEmpty().withMessage('Response is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = await Support.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    // Check if user owns this ticket
    if (ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { response } = req.body;

    ticket.response = response;
    ticket.respondedBy = req.user.id;
    ticket.respondedAt = new Date();
    ticket.status = 'resolved';

    await ticket.save();

    const populatedTicket = await Support.findById(ticket._id)
      .populate('user', 'name email')
      .populate('respondedBy', 'name email');

    res.json(populatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
