const path = require('path');
const express = require('express');
const app = require('./api/index');

const PORT = parseInt(process.env.SERVER_PORT || process.env.BACKEND_PORT, 10) || 5001;

// If production React build exists, serve it
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

// For any non-API route, send back index.html for SPA client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  const indexPath = path.join(buildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // In development mode where build doesn't exist yet, return helpful JSON
      res.json({
        message: 'FarmToHome API Server is active.',
        info: 'Start frontend dev server with: npm run dev:frontend',
        port: PORT
      });
    }
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`  🌾 FarmToHome Server running on Port ${PORT}  `);
  console.log(`  API Health: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Port ${PORT} in use, trying ${PORT + 1}...`);
    app.listen(PORT + 1, '0.0.0.0');
  } else {
    console.error('Server error:', err);
  }
});

module.exports = server;
