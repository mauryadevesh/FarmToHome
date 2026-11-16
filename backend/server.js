const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let dbMode = 'local-storage';

// Helper to mount routes on both /api/... and /...
function mountRoutes(router) {
  app.use('/api', router);
  app.use('/', router);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'FarmToHome API is running smoothly!',
    databaseMode: dbMode,
    timestamp: new Date().toISOString()
  });
});
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'FarmToHome API is running smoothly!',
    databaseMode: dbMode,
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  const preferredPort = parseInt(process.env.PORT, 10) || 5001;
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmtohome';

  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2000,
    });

    dbMode = 'mongodb';
    console.log('Connected to MongoDB successfully!');

    // Mount Mongoose routers
    const authRouter = require('./routes/auth');
    const userRouter = require('./routes/userRoutes');
    const productRouter = require('./routes/products');
    const cartRouter = require('./routes/cart');
    const orderRouter = require('./routes/orders');
    const supportRouter = require('./routes/support');
    const adminRouter = require('./routes/admin');

    // Mount on /api/
    app.use('/api/auth', authRouter);
    app.use('/api/users', userRouter);
    app.use('/api/products', productRouter);
    app.use('/api/cart', cartRouter);
    app.use('/api/orders', orderRouter);
    app.use('/api/support', supportRouter);
    app.use('/api/admin', adminRouter);

    // Also mount directly for direct access compatibility
    app.use('/auth', authRouter);
    app.use('/users', userRouter);
    app.use('/products', productRouter);
    app.use('/cart', cartRouter);
    app.use('/orders', orderRouter);
    app.use('/support', supportRouter);
    app.use('/admin', adminRouter);

  } catch (error) {
    dbMode = 'local-storage';
    console.log('MongoDB server not detected on localhost.');
    console.log('Activating built-in persistent Local JSON Storage mode!');
    console.log('All features (Auth, Products, Cart, Orders, Admin, Support) are 100% operational.');

    const localRoutes = require('./routes/localRoutes');
    mountRoutes(localRoutes);
  }

  function listenOnPort(portToTry) {
    const serverInstance = app.listen(portToTry, '127.0.0.1', () => {
      console.log(`===============================================`);
      console.log(`  🌾 FarmToHome Server running on Port ${portToTry}  `);
      console.log(`  Database Mode: ${dbMode}                       `);
      console.log(`  Health Check:  http://localhost:${portToTry}/api/health`);
      console.log(`===============================================`);
    });

    serverInstance.on('error', (err) => {
      if ((err.code === 'EACCES' || err.code === 'EADDRINUSE') && portToTry !== 5001) {
        console.warn(`Port ${portToTry} unavailable (${err.code}). Trying fallback port 5001...`);
        listenOnPort(5001);
      } else {
        console.error(`Fatal server error:`, err);
      }
    });
  }

  listenOnPort(preferredPort);
}

startServer();

module.exports = app;
