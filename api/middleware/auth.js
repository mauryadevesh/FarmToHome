const jwt = require('jsonwebtoken');
const dbAdapter = require('../services/dbAdapter');

const JWT_SECRET = process.env.JWT_SECRET || 'farmtohome_super_secret_jwt_key_2026_production';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    if (!token) {
      return res.status(401).json({ message: 'No authorization token, access denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }

    const user = await dbAdapter.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found for this token' });
    }

    // Do not leak password hash in request context
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

const isFarmer = (req, res, next) => {
  if (!req.user || req.user.role !== 'farmer') {
    return res.status(403).json({ message: 'Access denied. Farmer role required.' });
  }
  next();
};

const isConsumer = (req, res, next) => {
  if (!req.user || req.user.role !== 'consumer') {
    return res.status(403).json({ message: 'Access denied. Consumer role required.' });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

module.exports = {
  auth,
  isFarmer,
  isConsumer,
  isAdmin,
  JWT_SECRET,
};
