const express = require('express');
const cors = require('cors');
require('dotenv').config();

const dbAdapter = require('./services/dbAdapter');
const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const deliveryRouter = require('./routes/delivery');
const reviewsRouter = require('./routes/reviews');
const supportRouter = require('./routes/support');
const adminRouter = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health Check
const healthHandler = (req, res) => {
  res.json({
    status: 'online',
    appName: 'Farm2Home',
    tagline: 'Fresh from Local Farms to Your Home',
    mission: 'Direct peri-urban agricultural network connecting Mira Bhayandar farmers directly with urban consumers.',
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
app.use('/api/delivery', deliveryRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/support', supportRouter);
app.use('/api/admin', adminRouter);

// Also mount without /api prefix for maximum proxy and serverless compatibility
app.use('/auth', authRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);
app.use('/orders', ordersRouter);
app.use('/delivery', deliveryRouter);
app.use('/reviews', reviewsRouter);
app.use('/support', supportRouter);
app.use('/admin', adminRouter);

// Export for Vercel Serverless Function
module.exports = app;
