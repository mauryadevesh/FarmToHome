const express = require('express');
const localStore = require('../services/localStorage');

const router = express.Router();

// Auth Middleware for local mode
function authMiddleware(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No authorization token, access denied' });
  }

  const decoded = localStore.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const user = localStore.getUserById(decoded.id);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  req.user = user;
  next();
}

function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires one of: ${allowedRoles.join(', ')}` });
    }
    next();
  };
}

// ----------------- AUTH -----------------
router.post('/auth/register', (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const result = localStore.registerUser({ name, email, password, role, phone, address });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const result = localStore.loginUser(email, password);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/auth/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

// ----------------- USERS (ADMIN) -----------------
router.get('/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  res.json(localStore.getAllUsers());
});

router.get('/admin/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  res.json(localStore.getAllUsers());
});

// ----------------- PRODUCTS -----------------
// Public browsing!
router.get('/products', (req, res) => {
  res.json(localStore.getProducts());
});

router.get('/products/:id', (req, res) => {
  const prod = localStore.getProductById(req.params.id);
  if (!prod) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(prod);
});

router.post('/products', authMiddleware, roleMiddleware(['farmer', 'admin']), (req, res) => {
  try {
    const newProduct = localStore.createProduct(req.body, req.user);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/products/:id', authMiddleware, (req, res) => {
  try {
    const updated = localStore.updateProduct(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/products/:id', authMiddleware, roleMiddleware(['farmer', 'admin']), (req, res) => {
  try {
    const result = localStore.deleteProduct(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ----------------- CART -----------------
router.get('/cart', authMiddleware, (req, res) => {
  res.json(localStore.getCart(req.user.id));
});

router.post('/cart', authMiddleware, (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = localStore.addToCart(req.user.id, productId, quantity || 1);
    res.json(cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/cart/:itemId', authMiddleware, (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = localStore.updateCartItem(req.user.id, req.params.itemId, quantity);
    res.json(cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/cart/:itemId', authMiddleware, (req, res) => {
  try {
    const cart = localStore.removeFromCart(req.user.id, req.params.itemId);
    res.json(cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ----------------- ORDERS -----------------
router.get('/orders', authMiddleware, (req, res) => {
  res.json(localStore.getOrders(req.user.id, req.user.role));
});

router.get('/orders/:id', authMiddleware, (req, res) => {
  const order = localStore.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json(order);
});

router.post('/orders', authMiddleware, (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const order = localStore.createOrder(req.user.id, shippingAddress);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/orders/:id', authMiddleware, (req, res) => {
  try {
    const result = localStore.cancelOrder(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/orders/:id/status', authMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    const updated = localStore.updateOrderStatus(req.params.id, status);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ----------------- SUPPORT -----------------
router.get('/support', authMiddleware, (req, res) => {
  res.json(localStore.getSupportTickets(req.user.id, req.user.role));
});

router.get('/support/:id', authMiddleware, (req, res) => {
  const ticket = localStore.getSupportTicketById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: 'Support ticket not found' });
  }
  res.json(ticket);
});

router.post('/support', authMiddleware, (req, res) => {
  try {
    const ticket = localStore.createSupportTicket(req.user.id, req.body);
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ----------------- ADMIN -----------------
router.get('/admin/stats', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  res.json(localStore.getAdminStats());
});

router.put('/admin/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  try {
    const updated = localStore.updateProduct(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/admin/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  try {
    const result = localStore.deleteProduct(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/admin/orders', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  res.json(localStore.getOrders(req.user.id, 'admin'));
});

router.put('/admin/orders/:id/status', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  try {
    const { status } = req.body;
    const updated = localStore.updateOrderStatus(req.params.id, status);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/admin/support', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  res.json(localStore.getSupportTickets(req.user.id, 'admin'));
});

router.put('/admin/support/:id/respond', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  try {
    const { response } = req.body;
    const ticket = localStore.respondToSupportTicket(req.params.id, response, req.user);
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
