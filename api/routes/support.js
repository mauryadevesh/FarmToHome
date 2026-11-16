const express = require('express');
const router = express.Router();
const dbAdapter = require('../services/dbAdapter');
const { auth, isAdmin } = require('../middleware/auth');

// @route   GET /api/support
// @desc    Get support tickets for logged-in user (or all if admin)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const tickets = await dbAdapter.getSupportTickets(userId, req.user.role);
    return res.json(tickets);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return res.status(500).json({ message: 'Server error fetching tickets' });
  }
});

// @route   GET /api/support/:id
// @desc    Get single support ticket
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await dbAdapter.getSupportTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    const userId = req.user.id || req.user._id;
    const isOwner = ticket.user_id === userId || ticket.user?.id === userId || ticket.user?._id === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return res.status(500).json({ message: 'Server error fetching ticket' });
  }
});

// @route   POST /api/support
// @desc    Create a new support ticket
router.post('/', auth, async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const userId = req.user.id || req.user._id;
    const ticket = await dbAdapter.createSupportTicket({
      userId,
      subject: subject.trim(),
      message: message.trim(),
      category: category || 'other',
      priority: priority || 'medium'
    });

    return res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({ message: error.message || 'Server error creating ticket' });
  }
});

// @route   PUT /api/support/:id/respond
// @desc    Respond to a support ticket (Admin only)
router.put('/:id/respond', [auth, isAdmin], async (req, res) => {
  try {
    const { response } = req.body;
    if (!response || !response.trim()) {
      return res.status(400).json({ message: 'Response message is required' });
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

module.exports = router;
