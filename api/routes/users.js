const express = require('express');
const router = express.Router();
const dbAdapter = require('../services/dbAdapter');
const { auth, isAdmin } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users list (admin only)
router.get('/', [auth, isAdmin], async (req, res) => {
  try {
    const users = await dbAdapter.getAllUsers();
    return res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
router.get('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const user = await dbAdapter.findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, ...safe } = user;
    return res.json(safe);
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ message: 'Server error fetching user' });
  }
});

module.exports = router;
