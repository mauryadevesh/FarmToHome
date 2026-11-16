const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbAdapter = require('../services/dbAdapter');
const { auth, JWT_SECRET } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user (farmer or consumer)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, address, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }

    if (!['farmer', 'consumer'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either farmer or consumer' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await dbAdapter.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await dbAdapter.createUser({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      address: address ? address.trim() : '',
      phone: phone ? phone.trim() : ''
    });

    const token = generateToken(user.id);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and return token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await dbAdapter.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Record login
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    await dbAdapter.recordUserLogin(user.id, ip, userAgent);

    const token = generateToken(user.id);

    return res.json({
      token,
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message || 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user profile
router.get('/me', auth, async (req, res) => {
  return res.json({
    id: req.user.id,
    _id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    address: req.user.address,
    phone: req.user.phone,
    last_login: req.user.last_login
  });
});

module.exports = router;
