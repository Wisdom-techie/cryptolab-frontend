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

// Import and use routes only if they exist
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
} catch (err) {
  console.log('⚠️ Auth routes not found - skipping');
}

try {
  const userRoutes = require('./routes/user');
  app.use('/api/user', userRoutes);
} catch (err) {
  console.log('⚠️ User routes not found - skipping');
}

try {
  const walletRoutes = require('./routes/wallet');
  app.use('/api/wallet', walletRoutes);
} catch (err) {
  console.log('⚠️ Wallet routes not found - skipping');
}

try {
  const tradeRoutes = require('./routes/trade');
  app.use('/api/trade', tradeRoutes);
} catch (err) {
  console.log('⚠️ Trade routes not found - skipping');
}

// These routes you already have
const cryptoRoutes = require('./routes/crypto');
const adminRoutes = require('./routes/admin');

app.use('/api/crypto', cryptoRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Cryptolab API is running!',
    version: '1.0.0',
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
// routes/admin.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Protect all admin routes
router.use(protect);
router.use(admin);

// Users
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/balances', adminController.updateUserBalances);

// Transactions
router.get('/transactions', adminController.getAllTransactions);
router.post('/deposits/:id/approve', adminController.approveDeposit);

// Withdrawals
router.get('/withdrawals/pending', adminController.getPendingWithdrawals);
router.post('/withdrawals/:id/approve', adminController.approveWithdrawal);
router.post('/withdrawals/:id/reject', adminController.rejectWithdrawal);

module.exports = router;
// server.js or app.js
const adminRoutes = require('./routes/admin');

app.use('/api/admin', adminRoutes);