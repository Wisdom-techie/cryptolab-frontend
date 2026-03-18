const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAllUsers,
  searchUsers,
  getUserDetails,
  updateUserBalance,
  updateUserBalances,
  getAllTransactions,
  getPendingWithdrawals,
  approveDeposit,
  approveWithdrawal,
  rejectWithdrawal
} = require('../controllers/adminController');

// All routes require authentication AND admin role
router.use(protect);
router.use(admin);

// ==================== USER ROUTES ====================

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/search
// @desc    Search users by email or name
// @access  Private/Admin
router.get('/users/search', searchUsers);

// @route   GET /api/admin/users/:id
// @desc    Get single user details
// @access  Private/Admin
router.get('/users/:id', getUserDetails);

// @route   PUT /api/admin/users/:userId/balance
// @desc    Update user balance (single currency - for AdminBalance page)
// @access  Private/Admin
router.put('/users/:userId/balance', updateUserBalance);

// @route   PUT /api/admin/users/:id/balances
// @desc    Update user balances (multiple currencies)
// @access  Private/Admin
router.put('/users/:id/balances', updateUserBalances);

// ==================== TRANSACTION ROUTES ====================

// @route   GET /api/admin/transactions
// @desc    Get all transactions
// @access  Private/Admin
router.get('/transactions', getAllTransactions);

// @route   PUT /api/admin/deposit/:id/approve
// @desc    Approve deposit
// @access  Private/Admin
router.put('/deposit/:id/approve', approveDeposit);

// ==================== WITHDRAWAL ROUTES ====================

// @route   GET /api/admin/withdrawals
// @desc    Get pending withdrawals
// @access  Private/Admin
router.get('/withdrawals', getPendingWithdrawals);

// @route   PUT /api/admin/withdrawal/:id/approve
// @desc    Approve withdrawal
// @access  Private/Admin
router.put('/withdrawal/:id/approve', approveWithdrawal);

// @route   PUT /api/admin/withdrawal/:id/reject
// @desc    Reject withdrawal
// @access  Private/Admin
router.put('/withdrawal/:id/reject', rejectWithdrawal);

module.exports = router;