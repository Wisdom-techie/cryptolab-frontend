const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');

// @desc    Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get pending withdrawals
exports.getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: withdrawals.length,
      withdrawals
    });
  } catch (error) {
    console.error('Get pending withdrawals error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve deposit
exports.approveDeposit = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('user');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = 'completed';
    await transaction.save();

    const user = transaction.user;
    const currentBalance = user.balances.get(transaction.asset) || 0;
    user.balances.set(transaction.asset, currentBalance + transaction.amount);
    await user.save();

    res.json({
      success: true,
      message: 'Deposit approved successfully',
      transaction
    });
  } catch (error) {
    console.error('Approve deposit error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve withdrawal
exports.approveWithdrawal = async (req, res) => {
  try {
    const { txHash } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id).populate('user');

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    const user = withdrawal.user;
    const currentBalance = user.balances.get(withdrawal.asset) || 0;
    
    if (currentBalance < withdrawal.amount) {
      return res.status(400).json({ message: 'User has insufficient balance' });
    }

    user.balances.set(withdrawal.asset, currentBalance - withdrawal.amount);
    await user.save();

    withdrawal.status = 'completed';
    withdrawal.txHash = txHash || null;
    withdrawal.approvedBy = req.user._id;
    withdrawal.approvedAt = Date.now();
    await withdrawal.save();

    res.json({
      success: true,
      message: 'Withdrawal approved successfully',
      withdrawal
    });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject withdrawal
exports.rejectWithdrawal = async (req, res) => {
  try {
    const { reason } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    withdrawal.status = 'rejected';
    withdrawal.rejectionReason = reason || 'No reason provided';
    withdrawal.approvedBy = req.user._id;
    withdrawal.approvedAt = Date.now();
    await withdrawal.save();

    res.json({
      success: true,
      message: 'Withdrawal rejected',
      withdrawal
    });
  } catch (error) {
    console.error('Reject withdrawal error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
  // Add this to your adminController.js

const User = require('../models/User');
const Activity = require('../models/Activity');

// @desc    Update user balances
// @route   PUT /api/admin/users/:id/balances
// @access  Admin
exports.updateUserBalances = async (req, res) => {
  try {
    const { balances } = req.body;

    if (!balances || typeof balances !== 'object') {
      return res.status(400).json({ message: 'Invalid balances data' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clear existing balances
    user.balances.clear();

    // Set new balances
    Object.entries(balances).forEach(([asset, amount]) => {
      if (amount > 0) {
        user.balances.set(asset, parseFloat(amount));
      }
    });

    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Balance Updated by Admin',
      details: `Admin ${req.user.email} updated user balances`,
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({
      success: true,
      message: 'User balances updated successfully',
      balances: Object.fromEntries(user.balances)
    });
  } catch (error) {
    console.error('Update user balances error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Admin
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
};