const express = require('express');
const cors = require('cors');
require('dotenv').config();

const dbAdapter = require('./services/dbAdapter');
const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const supportRouter = require('./routes/support');
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
const healthHandler = (req, res) => {
  res.json({
    status: 'online',
    message: 'FarmToHome API is operational',
    databaseEngine: dbAdapter.isSupabase() ? 'supabase' : 'fallback-storage',
    timestamp: new Date().toISOString()
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount routers on /api/...
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/support', supportRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);

// Also mount without /api prefix for maximum proxy and serverless compatibility
app.use('/auth', authRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);
app.use('/orders', ordersRouter);
app.use('/support', supportRouter);
app.use('/admin', adminRouter);
app.use('/users', usersRouter);

// Export for Vercel Serverless Function
module.exports = app;
