const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const isFarmer = (req, res, next) => {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({ message: 'Access denied. Farmer role required.' });
  }
  next();
};

const isConsumer = (req, res, next) => {
  if (req.user.role !== 'consumer') {
    return res.status(403).json({ message: 'Access denied. Consumer role required.' });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

module.exports = { auth, isFarmer, isConsumer, isAdmin };


