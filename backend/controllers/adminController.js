const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');
const Activity = require('../models/Activity');

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

// @desc    Search users by email or name
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Search query must be at least 2 characters' 
      });
    }

    // Search by email or name
    const users = await User.find({
      $or: [
        { email: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ]
    })
    .select('-password -twoFactorCode -resetPasswordToken')
    .limit(10);

    // Format users with total balance in USD
    const formattedUsers = users.map(user => {
      let totalBalance = 0;
      if (user.balances) {
        // Sum all USDT balance (or convert all to USD in production)
        totalBalance = user.balances.get('USDT') || 0;
      }

      return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        balance: totalBalance,
        balances: Object.fromEntries(user.balances || new Map()),
        createdAt: user.createdAt
      };
    });

    res.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get single user details
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -twoFactorCode -resetPasswordToken');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Get user's recent transactions
    const transactions = await Transaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        balances: Object.fromEntries(user.balances || new Map())
      },
      recentTransactions: transactions
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update user balance (single currency - for AdminBalance page)
exports.updateUserBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newBalance, reason } = req.body;
    const currency = 'USDT'; // Default to USDT for now

    if (newBalance === undefined || newBalance === null) {
      return res.status(400).json({ 
        success: false,
        message: 'New balance is required' 
      });
    }

    if (!reason) {
      return res.status(400).json({ 
        success: false,
        message: 'Reason for balance change is required' 
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const oldBalance = user.balances.get(currency) || 0;
    const balanceChange = parseFloat(newBalance) - oldBalance;

    // Update balance
    user.balances.set(currency, parseFloat(newBalance));
    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Balance Updated by Admin',
      details: `Balance changed from ${oldBalance} to ${newBalance} ${currency}. Reason: ${reason}`,
      ipAddress: req.ip || req.connection.remoteAddress
    });

    // Create transaction record
    await Transaction.create({
      user: user._id,
      type: balanceChange > 0 ? 'deposit' : 'adjustment',
      asset: currency,
      amount: Math.abs(balanceChange),
      price: 1, // USDT is 1:1 with USD
      total: Math.abs(balanceChange),
      status: 'completed',
      paymentMethod: 'admin_adjustment',
      gateway: reason
    });

    res.json({
      success: true,
      message: 'Balance updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        oldBalance,
        newBalance: parseFloat(newBalance),
        currency,
        change: balanceChange
      }
    });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update user balances (multiple currencies)
exports.updateUserBalances = async (req, res) => {
  try {
    const { balances } = req.body;

    if (!balances || typeof balances !== 'object') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid balances data' 
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Update balances
    Object.entries(balances).forEach(([asset, amount]) => {
      if (amount >= 0) {
        user.balances.set(asset, parseFloat(amount));
      }
    });

    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Balance Updated by Admin',
      details: `Admin ${req.user.email} updated multiple balances`,
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({
      success: true,
      message: 'User balances updated successfully',
      balances: Object.fromEntries(user.balances)
    });
  } catch (error) {
    console.error('Update user balances error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
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
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
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
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Approve deposit
exports.approveDeposit = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('user');

    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        message: 'Transaction not found' 
      });
    }

    transaction.status = 'completed';
    await transaction.save();

    const user = transaction.user;
    const currentBalance = user.balances.get(transaction.asset) || 0;
    user.balances.set(transaction.asset, currentBalance + transaction.amount);
    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Deposit Approved',
      details: `Admin approved deposit of ${transaction.amount} ${transaction.asset}`,
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({
      success: true,
      message: 'Deposit approved successfully',
      transaction
    });
  } catch (error) {
    console.error('Approve deposit error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Approve withdrawal
exports.approveWithdrawal = async (req, res) => {
  try {
    const { txHash } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id).populate('user');

    if (!withdrawal) {
      return res.status(404).json({ 
        success: false,
        message: 'Withdrawal not found' 
      });
    }

    const user = withdrawal.user;
    const currentBalance = user.balances.get(withdrawal.asset) || 0;
    
    if (currentBalance < withdrawal.amount) {
      return res.status(400).json({ 
        success: false,
        message: 'User has insufficient balance' 
      });
    }

    user.balances.set(withdrawal.asset, currentBalance - withdrawal.amount);
    await user.save();

    withdrawal.status = 'completed';
    withdrawal.txHash = txHash || null;
    withdrawal.approvedBy = req.user._id;
    withdrawal.approvedAt = Date.now();
    await withdrawal.save();

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Withdrawal Approved',
      details: `Admin approved withdrawal of ${withdrawal.amount} ${withdrawal.asset}`,
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({
      success: true,
      message: 'Withdrawal approved successfully',
      withdrawal
    });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Reject withdrawal
exports.rejectWithdrawal = async (req, res) => {
  try {
    const { reason } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ 
        success: false,
        message: 'Withdrawal not found' 
      });
    }

    withdrawal.status = 'rejected';
    withdrawal.rejectionReason = reason || 'No reason provided';
    withdrawal.approvedBy = req.user._id;
    withdrawal.approvedAt = Date.now();
    await withdrawal.save();

    // Log activity
    await Activity.create({
      user: withdrawal.user,
      action: 'Withdrawal Rejected',
      details: `Admin rejected withdrawal. Reason: ${reason || 'No reason provided'}`,
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({
      success: true,
      message: 'Withdrawal rejected',
      withdrawal
    });
  } catch (error) {
    console.error('Reject withdrawal error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};