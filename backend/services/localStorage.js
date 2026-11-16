const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DB_FILE = path.join(__dirname, '..', 'db.json');
const CSV_FILE = fs.existsSync(path.join(__dirname, '..', '..', 'farmtohome_products.csv'))
  ? path.join(__dirname, '..', '..', 'farmtohome_products.csv')
  : path.join(__dirname, '..', '..', 'farm2home_products.csv');

const JWT_SECRET = process.env.JWT_SECRET || 'farmtohome_super_secret_jwt_key_2026_production';

function loadInitialProducts() {
  const defaultCategoryMap = {
    tomato: 'vegetables',
    onion: 'vegetables',
    potato: 'vegetables',
    carrot: 'vegetables',
    brinjal: 'vegetables',
    cabbage: 'vegetables',
    cauliflower: 'vegetables',
    'green chilli': 'vegetables',
    capsicum: 'vegetables',
    'red chilli': 'spices',
    apple: 'fruits',
    banana: 'fruits',
    mango: 'fruits',
    grapes: 'fruits',
    pomegranate: 'fruits',
    watermelon: 'fruits',
    rice: 'grains',
    wheat: 'grains',
    maize: 'grains',
    sugarcane: 'grains',
    groundnut: 'pulses',
    'tur dal': 'pulses',
    'moong dal': 'pulses',
    'chana dal': 'pulses',
    milk: 'dairy',
    curd: 'dairy',
    eggs: 'dairy'
  };

  const products = [];
  if (fs.existsSync(CSV_FILE)) {
    try {
      const content = fs.readFileSync(CSV_FILE, 'utf-8').trim();
      const lines = content.split(/\r?\n/).filter(Boolean);
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim());
        if (parts.length >= 3) {
          const name = parts[0];
          const price = parseFloat(parts[1]) || 40;
          const qtyUnit = parts[2] || '1 kg';
          const imagePath = parts[3] || '';

          const lower = name.toLowerCase();
          const category = defaultCategoryMap[lower] || 'vegetables';

          // parse stock and unit
          const match = qtyUnit.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
          const stock = 100;
          const unit = match ? `${match[1]} ${match[2]}` : qtyUnit;

          products.push({
            _id: `prod_${i}`,
            id: `prod_${i}`,
            name,
            description: `Fresh, crisp, pesticide-free ${name} sourced directly from verified local family farms.`,
            price,
            category,
            farmer: {
              _id: 'user_farmer',
              name: 'Kisan Ramesh Kumar',
              email: 'farmer@farmtohome.com'
            },
            stock,
            unit,
            image: imagePath,
            isAvailable: true,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.error('Error loading CSV products:', e.message);
    }
  }

  return products;
}

function getInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);

  const defaultUsers = [
    {
      _id: 'user_admin',
      id: 'user_admin',
      name: 'Admin Desk',
      email: 'admin@farmtohome.com',
      password: adminPasswordHash,
      role: 'admin',
      phone: '+91 76710 14068',
      address: 'FarmToHome Operations Center, Sector 4, Bengaluru',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'user_farmer',
      id: 'user_farmer',
      name: 'Kisan Ramesh Kumar',
      email: 'farmer@farmtohome.com',
      password: defaultPasswordHash,
      role: 'farmer',
      phone: '+91 98765 12345',
      address: 'Green Valley Organic Farms, Doddaballapura, Karnataka',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'user_consumer',
      id: 'user_consumer',
      name: 'Priya Sharma',
      email: 'consumer@farmtohome.com',
      password: defaultPasswordHash,
      role: 'consumer',
      phone: '+91 98765 43210',
      address: 'Flat 302, Palm Grove Apts, Indiranagar, Bengaluru',
      createdAt: new Date().toISOString()
    }
  ];

  return {
    users: defaultUsers,
    products: loadInitialProducts(),
    carts: {
      user_consumer: {
        _id: 'cart_consumer',
        user: 'user_consumer',
        items: []
      }
    },
    orders: [
      {
        _id: 'order_1001',
        id: 'order_1001',
        user: 'user_consumer',
        items: [
          {
            product: {
              _id: 'prod_1',
              name: 'Tomato',
              price: 30,
              unit: '1 kg',
              image: 'images/tomato.jpg'
            },
            name: 'Tomato',
            price: 30,
            quantity: 2
          },
          {
            product: {
              _id: 'prod_2',
              name: 'Onion',
              price: 35,
              unit: '1 kg',
              image: 'images/onion.jpg'
            },
            name: 'Onion',
            price: 35,
            quantity: 1
          }
        ],
        totalAmount: 95,
        shippingAddress: 'Flat 302, Palm Grove Apts, Indiranagar, Bengaluru',
        status: 'out_for_delivery',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ],
    supportTickets: [
      {
        _id: 'ticket_1',
        id: 'ticket_1',
        user: {
          _id: 'user_consumer',
          name: 'Priya Sharma',
          email: 'consumer@farmtohome.com'
        },
        subject: 'Delivery time inquiry',
        message: 'Could my morning vegetables be delivered before 8:30 AM tomorrow?',
        category: 'order',
        priority: 'medium',
        status: 'resolved',
        response: 'Yes! Our morning farm delivery slot runs from 6:30 AM to 8:30 AM.',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ]
  };
}

class LocalStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    let loaded = null;
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        loaded = JSON.parse(raw);
      } catch (e) {
        loaded = null;
      }
    }

    if (!loaded || !Array.isArray(loaded.products) || loaded.products.length === 0) {
      this.data = getInitialData();
      this.save();
    } else {
      this.data = {
        users: loaded.users || [],
        products: loaded.products || [],
        carts: loaded.carts || {},
        orders: loaded.orders || [],
        supportTickets: loaded.supportTickets || []
      };
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      // In-memory fallback if disk write is temporarily restricted
    }
  }

  generateToken(user) {
    return jwt.sign(
      { id: user._id || user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return null;
    }
  }

  // Auth Operations
  registerUser({ name, email, password, role = 'consumer', phone = '', address = '' }) {
    const existing = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('User already exists with this email address');
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const newUser = {
      _id: id,
      id,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: ['farmer', 'consumer', 'admin'].includes(role) ? role : 'consumer',
      phone,
      address,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.save();

    const token = this.generateToken(newUser);
    return {
      token,
      user: {
        id: newUser._id,
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address
      }
    };
  }

  loginUser(email, password) {
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password');
    }

    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = bcrypt.compareSync(password, user.password);
    } else {
      isMatch = user.password === password;
    }

    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user);
    return {
      token,
      user: {
        id: user._id || user.id,
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    };
  }

  getUserById(id) {
    const user = this.data.users.find(u => (u._id === id || u.id === id));
    if (!user) return null;
    return {
      id: user._id || user.id,
      _id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt
    };
  }

  getAllUsers() {
    return this.data.users.map(u => ({
      id: u._id || u.id,
      _id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      address: u.address,
      lastLogin: u.lastLogin || u.createdAt,
      createdAt: u.createdAt
    }));
  }

  // Product Operations
  getProducts(query = {}) {
    let result = [...this.data.products];
    if (query.isAvailable !== undefined) {
      result = result.filter(p => p.isAvailable === query.isAvailable);
    }
    return result;
  }

  getProductById(id) {
    return this.data.products.find(p => (p._id === id || p.id === id || String(p.id) === String(id))) || null;
  }

  createProduct(productData, user) {
    const id = `prod_${Date.now()}`;
    const newProduct = {
      _id: id,
      id,
      name: productData.name,
      description: productData.description || 'Farm-fresh harvest',
      price: parseFloat(productData.price) || 0,
      category: productData.category || 'vegetables',
      farmer: {
        _id: user._id || user.id,
        name: user.name,
        email: user.email
      },
      stock: parseInt(productData.stock !== undefined ? productData.stock : productData.quantity, 10) || 50,
      unit: productData.unit || '1 kg',
      image: productData.image || '',
      isAvailable: true,
      createdAt: new Date().toISOString()
    };

    this.data.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  updateProduct(id, updates) {
    const index = this.data.products.findIndex(p => (p._id === id || p.id === id || String(p.id) === String(id)));
    if (index === -1) {
      throw new Error('Product not found');
    }

    const current = this.data.products[index];
    const stockVal = updates.stock !== undefined ? updates.stock : (updates.quantity !== undefined ? updates.quantity : current.stock);

    const updated = {
      ...current,
      ...updates,
      price: updates.price !== undefined ? parseFloat(updates.price) : current.price,
      stock: parseInt(stockVal, 10),
      isAvailable: stockVal > 0
    };

    this.data.products[index] = updated;
    this.save();
    return updated;
  }

  deleteProduct(id) {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => (p._id !== id && p.id !== id && String(p.id) !== String(id)));
    if (this.data.products.length === initialLen) {
      throw new Error('Product not found');
    }
    this.save();
    return { message: 'Product removed successfully' };
  }

  // Cart Operations
  getCart(userId) {
    if (!this.data.carts) this.data.carts = {};
    if (!this.data.carts[userId]) {
      this.data.carts[userId] = {
        _id: `cart_${userId}`,
        user: userId,
        items: []
      };
      this.save();
    }

    // Populate product details
    const cart = this.data.carts[userId];
    const populatedItems = (cart.items || []).map(item => {
      const prodId = item.product?._id || item.product?.id || item.product;
      const product = this.getProductById(prodId);
      return {
        _id: item._id || `item_${prodId}`,
        product: product || { _id: prodId, name: 'Fresh Farm Item', price: item.price || 0 },
        quantity: item.quantity || 1
      };
    });

    return {
      _id: cart._id,
      user: userId,
      items: populatedItems
    };
  }

  addToCart(userId, productId, quantity = 1) {
    const product = this.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock for this product');
    }

    const cart = this.getCart(userId);
    const existingIndex = cart.items.findIndex(i => {
      const pId = i.product?._id || i.product?.id || i.product;
      return String(pId) === String(productId);
    });

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        _id: `item_${Date.now()}`,
        product: product,
        quantity
      });
    }

    this.data.carts[userId] = {
      _id: cart._id,
      user: userId,
      items: cart.items.map(i => ({
        _id: i._id,
        product: i.product?._id || i.product,
        quantity: i.quantity
      }))
    };
    this.save();
    return this.getCart(userId);
  }

  updateCartItem(userId, itemId, quantity) {
    const cart = this.getCart(userId);
    const itemIndex = cart.items.findIndex(i => (i._id === itemId || String(i.product?._id) === String(itemId)));

    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    this.data.carts[userId] = {
      _id: cart._id,
      user: userId,
      items: cart.items.map(i => ({
        _id: i._id,
        product: i.product?._id || i.product,
        quantity: i.quantity
      }))
    };
    this.save();
    return this.getCart(userId);
  }

  removeFromCart(userId, itemId) {
    const cart = this.getCart(userId);
    cart.items = cart.items.filter(i => (i._id !== itemId && String(i.product?._id) !== String(itemId)));

    this.data.carts[userId] = {
      _id: cart._id,
      user: userId,
      items: cart.items.map(i => ({
        _id: i._id,
        product: i.product?._id || i.product,
        quantity: i.quantity
      }))
    };
    this.save();
    return this.getCart(userId);
  }

  // Order Operations
  createOrder(userId, shippingAddress) {
    const cart = this.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new Error('Your cart is empty');
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const prod = item.product;
      const price = prod.price || 0;
      totalAmount += price * item.quantity;

      // reduce product stock
      this.updateProduct(prod._id || prod.id, { stock: Math.max(0, (prod.stock || 50) - item.quantity) });

      orderItems.push({
        product: prod,
        name: prod.name,
        price,
        quantity: item.quantity
      });
    }

    const orderId = `order_${Date.now()}`;
    const newOrder = {
      _id: orderId,
      id: orderId,
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress: shippingAddress || 'Home Address',
      status: 'ordered',
      createdAt: new Date().toISOString()
    };

    if (!this.data.orders) this.data.orders = [];
    this.data.orders.unshift(newOrder);

    // clear cart
    this.data.carts[userId] = { _id: cart._id, user: userId, items: [] };
    this.save();

    return newOrder;
  }

  getOrders(userId, userRole) {
    if (!this.data.orders) this.data.orders = [];
    if (userRole === 'admin') {
      return [...this.data.orders];
    }
    return this.data.orders.filter(o => o.user === userId && o.status !== 'cancelled');
  }

  getOrderById(orderId) {
    return this.data.orders.find(o => (o._id === orderId || o.id === orderId)) || null;
  }

  cancelOrder(userId, orderId) {
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.user !== userId) {
      throw new Error('Access denied');
    }

    order.status = 'cancelled';
    this.save();
    return { message: 'Order cancelled successfully' };
  }

  updateOrderStatus(orderId, status) {
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    order.status = status;
    this.save();
    return order;
  }

  // Support Operations
  getSupportTickets(userId, userRole) {
    if (!this.data.supportTickets) this.data.supportTickets = [];
    if (userRole === 'admin') {
      return [...this.data.supportTickets];
    }
    return this.data.supportTickets.filter(t => (t.user?._id === userId || t.user === userId));
  }

  getSupportTicketById(id) {
    return this.data.supportTickets.find(t => (t._id === id || t.id === id)) || null;
  }

  createSupportTicket(userId, ticketData) {
    const user = this.getUserById(userId);
    const id = `ticket_${Date.now()}`;
    const newTicket = {
      _id: id,
      id,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email
      },
      subject: ticketData.subject,
      message: ticketData.message,
      category: ticketData.category || 'other',
      priority: ticketData.priority || 'medium',
      status: 'open',
      createdAt: new Date().toISOString()
    };

    if (!this.data.supportTickets) this.data.supportTickets = [];
    this.data.supportTickets.unshift(newTicket);
    this.save();
    return newTicket;
  }

  respondToSupportTicket(ticketId, responseText, adminUser) {
    const ticket = this.getSupportTicketById(ticketId);
    if (!ticket) {
      throw new Error('Support ticket not found');
    }

    ticket.response = responseText;
    ticket.status = 'resolved';
    ticket.respondedBy = {
      _id: adminUser._id || adminUser.id,
      name: adminUser.name
    };
    ticket.respondedAt = new Date().toISOString();
    this.save();
    return ticket;
  }

  // Admin Stats
  getAdminStats() {
    const totalUsers = this.data.users.length;
    const farmers = this.data.users.filter(u => u.role === 'farmer').length;
    const consumers = this.data.users.filter(u => u.role === 'consumer').length;
    const totalProducts = this.data.products.length;
    const totalOrders = (this.data.orders || []).length;

    return {
      totalUsers,
      totalProducts,
      farmers,
      consumers,
      totalOrders
    };
  }
}

const localStore = new LocalStore();
module.exports = localStore;
