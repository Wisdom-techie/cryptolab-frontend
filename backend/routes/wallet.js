const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getBalance,
  getTransactions,
  processDeposit,
  requestWithdrawal
} = require('../controllers/walletController');

// All routes require authentication
router.use(protect);

// @route   GET /api/wallet/balance
// @desc    Get user wallet balances
// @access  Private
router.get('/balance', getBalance);

// @route   GET /api/wallet/transactions
// @desc    Get user transaction history
// @access  Private
router.get('/transactions', getTransactions);

// @route   POST /api/wallet/deposit
// @desc    Process crypto deposit request
// @access  Private
router.post('/deposit', processDeposit);

// @route   POST /api/wallet/withdrawal
// @desc    Request crypto withdrawal
// @access  Private
router.post('/withdrawal', requestWithdrawal);

module.exports = router;