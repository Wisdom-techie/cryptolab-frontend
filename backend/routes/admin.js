const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAllUsers,
  getAllTransactions,
  getPendingWithdrawals,
  approveDeposit,
  approveWithdrawal,
  rejectWithdrawal
} = require('../controllers/adminController');

// All routes require authentication AND admin role
router.use(protect);
router.use(admin);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', getAllUsers);

// @route   GET /api/admin/transactions
// @desc    Get all transactions
// @access  Private/Admin
router.get('/transactions', getAllTransactions);

// @route   GET /api/admin/withdrawals
// @desc    Get pending withdrawals
// @access  Private/Admin
router.get('/withdrawals', getPendingWithdrawals);

// @route   PUT /api/admin/deposit/:id/approve
// @desc    Approve deposit
// @access  Private/Admin
router.put('/deposit/:id/approve', approveDeposit);

// @route   PUT /api/admin/withdrawal/:id/approve
// @desc    Approve withdrawal
// @access  Private/Admin
router.put('/withdrawal/:id/approve', approveWithdrawal);

// @route   PUT /api/admin/withdrawal/:id/reject
// @desc    Reject withdrawal
// @access  Private/Admin
router.put('/withdrawal/:id/reject', rejectWithdrawal);

// @route   GET /api/admin/users/search
// @desc    Search users by email or ID
// @access  Private/Admin
router.get('/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query required' });
    
    const User = require('../models/User');
    const users = await User.find({
      $or: [
        { email: { $regex: q, $options: 'i' } },
        { _id: q }
      ]
    }).select('id firstName lastName email balance');
    
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/admin/users/:id/balance
// @desc    Update user balance
// @access  Private/Admin
router.put('/users/:id/balance', async (req, res) => {
  try {
    const { newBalance, reason } = req.body;
    const User = require('../models/User');
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { balance: newBalance },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
