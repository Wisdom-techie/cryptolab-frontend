const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');
const Activity = require('../models/Activity');

// @desc    Get user wallet balances
exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('balances');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert Map to object
    const balances = {};
    user.balances.forEach((value, key) => {
      balances[key] = value;
    });

    res.json({
      success: true,
      balances
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get transaction history
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Process crypto deposit
exports.processDeposit = async (req, res) => {
  try {
    const { asset, amount, price, paymentMethod, gateway, walletAddress, txHash } = req.body;

    if (!asset || !amount || !price) {
      return res.status(400).json({ message: 'Asset, amount, and price are required' });
    }

    const user = await User.findById(req.user._id);
    
    // Calculate total in USDT
    const total = parseFloat(amount) * parseFloat(price);

    // Create transaction
    const transaction = await Transaction.create({
      user: user._id,
      type: 'deposit',
      asset,
      amount: parseFloat(amount),
      price: parseFloat(price),
      total,
      status: 'pending', // Admin will confirm
      paymentMethod: paymentMethod || 'wallet',
      gateway: gateway || null,
      walletAddress: walletAddress || null,
      txHash: txHash || null
    });

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Deposit Request',
      details: `Requested deposit of ${amount} ${asset}`
    });

    res.json({
      success: true,
      message: 'Deposit request submitted. Awaiting admin confirmation.',
      transaction
    });
  } catch (error) {
    console.error('Process deposit error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Request withdrawal
exports.requestWithdrawal = async (req, res) => {
  try {
    const { asset, amount, network, walletAddress } = req.body;

    if (!asset || !amount || !network || !walletAddress) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findById(req.user._id);
    
    // Check if user has enough balance
    const currentBalance = user.balances.get(asset) || 0;
    const requestedAmount = parseFloat(amount);

    if (currentBalance < requestedAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Define withdrawal fees per asset (2% or fixed)
    const fees = {
      BTC: requestedAmount * 0.0005,
      ETH: requestedAmount * 0.005,
      USDT: Math.max(1, requestedAmount * 0.01),
      BNB: requestedAmount * 0.0005,
      SOL: requestedAmount * 0.01,
      // Add more as needed
    };

    const fee = fees[asset] || requestedAmount * 0.01;
    const total = requestedAmount - fee;

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      user: user._id,
      asset,
      amount: requestedAmount,
      fee,
      total,
      network,
      walletAddress,
      status: 'pending' // Admin will approve
    });

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Withdrawal Request',
      details: `Requested withdrawal of ${amount} ${asset}`
    });

    res.json({
      success: true,
      message: 'Withdrawal request submitted. Awaiting admin approval.',
      withdrawal
    });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

