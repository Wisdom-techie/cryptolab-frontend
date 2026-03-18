const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (avatars)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Import and use routes
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (err) {
  console.log('⚠️ Auth routes not found - skipping');
}

try {
  const userRoutes = require('./routes/user');
  app.use('/api/user', userRoutes);
  console.log('✅ User routes loaded');
} catch (err) {
  console.log('⚠️ User routes not found - skipping');
}

try {
  const walletRoutes = require('./routes/wallet');
  app.use('/api/wallet', walletRoutes);
  console.log('✅ Wallet routes loaded');
} catch (err) {
  console.log('⚠️ Wallet routes not found - skipping');
}

try {
  const tradeRoutes = require('./routes/trade');
  app.use('/api/trade', tradeRoutes);
  console.log('✅ Trade routes loaded');
} catch (err) {
  console.log('⚠️ Trade routes not found - skipping');
}

try {
  const cryptoRoutes = require('./routes/crypto');
  app.use('/api/crypto', cryptoRoutes);
  console.log('✅ Crypto routes loaded');
} catch (err) {
  console.log('⚠️ Crypto routes not found - skipping');
}

try {
  const adminRoutes = require('./routes/admin');
  app.use('/api/admin', adminRoutes);
  console.log('✅ Admin routes loaded');
} catch (err) {
  console.log('⚠️ Admin routes not found - skipping');
}

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Cryptolab API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check for monitoring
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    requestedUrl: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});