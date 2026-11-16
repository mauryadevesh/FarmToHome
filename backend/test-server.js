const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock user storage (for testing without MongoDB)
const users = [
  {
    id: 1,
    name: 'John Consumer',
    email: 'consumer@test.com',
    password: 'password123',
    role: 'consumer',
    phone: '+91-9876543210',
    address: '123 Main St, Bangalore',
    createdAt: new Date()
  },
  {
    id: 2,
    name: 'Jane Farmer',
    email: 'farmer@test.com',
    password: 'password123',
    role: 'farmer',
    phone: '+91-8765432109',
    address: '456 Farm Road, Village',
    createdAt: new Date()
  },
  {
    id: 3,
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    phone: '+91-7654321098',
    address: '789 Office Complex, City',
    createdAt: new Date()
  }
];

// Mock product data - from your farmtohome_products.csv
const products = [
  {
    id: 1,
    name: 'Tomato',
    description: 'Fresh red tomatoes from local farm',
    price: 30,
    category: 'vegetables',
    farmer: 'Local Farm',
    farmerId: 1,
    stock: 100,
    unit: '1 kg',
    image: 'images/tomato.jpg',
    createdAt: new Date()
  },
  {
    id: 2,
    name: 'Onion',
    description: 'Fresh onions, perfect for cooking',
    price: 35,
    category: 'vegetables',
    farmer: 'Local Farm',
    farmerId: 1,
    stock: 80,
    unit: '1 kg',
    image: 'images/onion.jpg',
    createdAt: new Date()
  },
  {
    id: 3,
    name: 'Potato',
    description: 'Fresh potatoes, versatile vegetable',
    price: 25,
    category: 'vegetables',
    farmer: 'Root Farm',
    farmerId: 2,
    stock: 120,
    unit: '1 kg',
    image: 'images/potato.jpg',
    createdAt: new Date()
  },
  {
    id: 4,
    name: 'Carrot',
    description: 'Sweet and crunchy carrots',
    price: 50,
    category: 'vegetables',
    farmer: 'Root Farm',
    farmerId: 2,
    stock: 60,
    unit: '1 kg',
    image: 'images/carrot.jpg',
    createdAt: new Date()
  },
  {
    id: 5,
    name: 'Brinjal',
    description: 'Fresh brinjal (eggplant)',
    price: 40,
    category: 'vegetables',
    farmer: 'Veggie Farm',
    farmerId: 3,
    stock: 40,
    unit: '1 kg',
    image: 'images/brinjal.jpg',
    createdAt: new Date()
  },
  {
    id: 6,
    name: 'Cabbage',
    description: 'Fresh green cabbage',
    price: 30,
    category: 'vegetables',
    farmer: 'Veggie Farm',
    farmerId: 3,
    stock: 30,
    unit: '1 pc',
    image: 'images/cabbage.jpg',
    createdAt: new Date()
  },
  {
    id: 7,
    name: 'Cauliflower',
    description: 'Fresh cauliflower heads',
    price: 45,
    category: 'vegetables',
    farmer: 'Veggie Farm',
    farmerId: 3,
    stock: 25,
    unit: '1 pc',
    image: 'images/cauliflower.jpg',
    createdAt: new Date()
  },
  {
    id: 8,
    name: 'Green Chilli',
    description: 'Spicy green chillies',
    price: 80,
    category: 'vegetables',
    farmer: 'Spice Farm',
    farmerId: 4,
    stock: 50,
    unit: '250 g',
    image: 'images/green_chilli.jpg',
    createdAt: new Date()
  },
  {
    id: 9,
    name: 'Capsicum',
    description: 'Fresh green capsicum',
    price: 70,
    category: 'vegetables',
    farmer: 'Veggie Farm',
    farmerId: 3,
    stock: 35,
    unit: '500 g',
    image: 'images/capsicum.jpg',
    createdAt: new Date()
  },
  {
    id: 10,
    name: 'Red Chilli',
    description: 'Dried red chillies',
    price: 200,
    category: 'spices',
    farmer: 'Spice Farm',
    farmerId: 4,
    stock: 20,
    unit: '100 kg',
    image: 'images/red_chilli.jpg',
    createdAt: new Date()
  },
  {
    id: 11,
    name: 'Apple',
    description: 'Fresh red apples',
    price: 160,
    category: 'fruits',
    farmer: 'Orchard Farm',
    farmerId: 5,
    stock: 80,
    unit: '1 kg',
    image: 'images/apple.jpg',
    createdAt: new Date()
  },
  {
    id: 12,
    name: 'Banana',
    description: 'Fresh yellow bananas',
    price: 60,
    category: 'fruits',
    farmer: 'Tropical Farm',
    farmerId: 6,
    stock: 100,
    unit: '1 dozen',
    image: 'images/banana.jpg',
    createdAt: new Date()
  },
  {
    id: 13,
    name: 'Mango',
    description: 'Sweet ripe mangoes',
    price: 120,
    category: 'fruits',
    farmer: 'Tropical Farm',
    farmerId: 6,
    stock: 60,
    unit: '1 kg',
    image: 'images/mango.jpg',
    createdAt: new Date()
  },
  {
    id: 14,
    name: 'Grapes',
    description: 'Fresh green grapes',
    price: 90,
    category: 'fruits',
    farmer: 'Orchard Farm',
    farmerId: 5,
    stock: 40,
    unit: '1 kg',
    image: 'images/grapes.jpg',
    createdAt: new Date()
  },
  {
    id: 15,
    name: 'Pomegranate',
    description: 'Fresh pomegranates',
    price: 180,
    category: 'fruits',
    farmer: 'Orchard Farm',
    farmerId: 5,
    stock: 30,
    unit: '1 kg',
    image: 'images/pomegranate.jpg',
    createdAt: new Date()
  },
  {
    id: 16,
    name: 'Watermelon',
    description: 'Large fresh watermelons',
    price: 40,
    category: 'fruits',
    farmer: 'Tropical Farm',
    farmerId: 6,
    stock: 20,
    unit: '1 pc',
    image: 'images/watermelon.jpg',
    createdAt: new Date()
  },
  {
    id: 17,
    name: 'Rice',
    description: 'Premium quality rice',
    price: 55,
    category: 'grains',
    farmer: 'Grain Farm',
    farmerId: 7,
    stock: 200,
    unit: '1 kg',
    image: 'images/rice.jpg',
    createdAt: new Date()
  },
  {
    id: 18,
    name: 'Wheat',
    description: 'Fresh wheat grains',
    price: 30,
    category: 'grains',
    farmer: 'Grain Farm',
    farmerId: 7,
    stock: 150,
    unit: '1 kg',
    image: 'images/wheat.jpg',
    createdAt: new Date()
  },
  {
    id: 19,
    name: 'Maize',
    description: 'Fresh maize corn',
    price: 28,
    category: 'grains',
    farmer: 'Grain Farm',
    farmerId: 7,
    stock: 100,
    unit: '1 kg',
    image: 'images/maize.jpg',
    createdAt: new Date()
  }
];

// Generate simple token
const generateToken = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Routes
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, role = 'consumer', phone, address } = req.body;
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      role,
      phone,
      address,
      createdAt: new Date()
    };
    
    users.push(newUser);
    
    const token = generateToken();
    
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    console.log('Login request received');
    console.log('Request body:', req.body);
    
    // Handle different body formats
    let email, password;
    if (req.body) {
      email = req.body.email;
      password = req.body.password;
    }
    
    console.log('Extracted:', { email, password: password ? '***' : undefined });
    
    // Find user
    const user = users.find(u => u.email === email);
    console.log('User found:', !!user);
    
    if (!user || user.password !== password) {
      console.log('Authentication failed');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = generateToken();
    console.log('Token generated');
    
    const response = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
    console.log('Sending success response');
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', (req, res) => {
  // For testing, if there's an Authorization header, return a user
  const authHeader = req.headers.authorization;
  console.log('Auth me request received, authHeader:', authHeader ? 'Present' : 'Missing');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Return the first user as the logged-in user (simplified for testing)
    const user = users[0]; // You can customize this based on token parsing
    if (user) {
      console.log('Auth me: Returning user:', user.email);
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      console.log('Auth me: No users found');
      res.status(401).json({ message: 'User not found' });
    }
  } else {
    console.log('Auth me: No valid token');
    // Don't return error, just return null to allow persistence
    res.json(null);
  }
});

// Products endpoints
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// Admin stats endpoint
app.get('/api/admin/stats', (req, res) => {
  // Calculate stats from mock users
  const totalUsers = users.length;
  const farmers = users.filter(u => u.role === 'farmer').length;
  const consumers = users.filter(u => u.role === 'consumer').length;
  const admins = users.filter(u => u.role === 'admin').length;
  
  res.json({
    totalUsers,
    totalProducts: products.length,
    farmers,
    consumers,
    admins
  });
});

// Cart and Orders endpoints
const carts = {};
const orders = [];

// Cart endpoints
app.get('/api/cart', (req, res) => {
  // Mock cart for user ID 1
  const userCart = carts[1] || [];
  res.json(userCart);
});

app.post('/api/cart', (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const userId = 1; // Mock user ID
    if (!carts[userId]) {
      carts[userId] = [];
    }
    
    const existingItem = carts[userId].find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      carts[userId].push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image
      });
    }
    
    res.json(carts[userId]);
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/cart/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const userId = 1; // Mock user ID
    
    if (carts[userId]) {
      carts[userId] = carts[userId].filter(item => item.productId !== parseInt(productId));
    }
    
    res.json(carts[userId] || []);
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Orders endpoints
app.get('/api/orders', (req, res) => {
  // Mock orders for user ID 1
  const userOrders = orders.filter(order => order.userId === 1);
  res.json(userOrders);
});

app.post('/api/orders', (req, res) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;
    
    const newOrder = {
      id: orders.length + 1,
      userId: 1, // Mock user ID
      items,
      totalAmount,
      shippingAddress,
      status: 'pending',
      createdAt: new Date(),
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    };
    
    orders.push(newOrder);
    
    // Clear the cart
    carts[1] = [];
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json(order);
});

app.delete('/api/orders/:id', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order status to cancelled
    orders[orderIndex].status = 'cancelled';
    
    res.json({ message: 'Order cancelled successfully', order: orders[orderIndex] });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin endpoints
app.get('/api/admin/orders', (req, res) => {
  res.json(orders);
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    orders[orderIndex].status = status;
    res.json({ message: 'Order status updated', order: orders[orderIndex] });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/products/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update product with new data
    products[productIndex] = { ...products[productIndex], ...req.body };
    res.json({ message: 'Product updated successfully', product: products[productIndex] });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/products/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    products.splice(productIndex, 1);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/support', (req, res) => {
  res.json(supportTickets);
});

// Support endpoints
const supportTickets = [];

app.get('/api/support', (req, res) => {
  res.json(supportTickets);
});

app.post('/api/support', (req, res) => {
  try {
    const { subject, message, category = 'other', priority = 'medium' } = req.body;
    
    const newTicket = {
      id: supportTickets.length + 1,
      subject,
      message,
      category,
      priority,
      status: 'open',
      userId: 1, // Mock user ID
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    supportTickets.push(newTicket);
    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Support ticket creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/support/:id', (req, res) => {
  const ticket = supportTickets.find(t => t.id === parseInt(req.params.id));
  if (!ticket) {
    return res.status(404).json({ message: 'Support ticket not found' });
  }
  res.json(ticket);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'FarmToHome API is running!', emergencyContact: '+91-9876543210', supportToken: 'SUPPORT-2024-TOKEN' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
  console.log('Frontend can now connect to the backend');
});
