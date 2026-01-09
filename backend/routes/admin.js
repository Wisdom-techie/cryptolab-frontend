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

module.exports = router;