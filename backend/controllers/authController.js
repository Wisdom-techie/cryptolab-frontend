const User = require('../models/User');
const Activity = require('../models/Activity');
const { generateToken } = require('../middleware/auth');
const crypto = require('crypto');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneCode,
      phoneNumber,
      country,
      currency,
      referralCode
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !phoneNumber || !country) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Generate unique referral code
    const userReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phoneCode: phoneCode || '+1',
      phoneNumber,
      country,
      currency: currency || 'USD',
      referralCode: userReferralCode,
      referredBy: referralCode || null,
      lastLogin: Date.now()
    });

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Account Created',
      details: 'New user registration',
      ipAddress: req.ip || req.connection.remoteAddress
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneCode: user.phoneCode,
        phoneNumber: user.phoneNumber,
        country: user.country,
        currency: user.currency,
        referralCode: user.referralCode,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      error: error.message 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(403).json({ 
          success: false,
          message: '2FA code required',
          requires2FA: true
        });
      }

      if (twoFactorCode !== user.twoFactorCode) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid 2FA code' 
        });
      }
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Login',
      details: 'User logged in successfully',
      ipAddress: req.ip || req.connection.remoteAddress
    });

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneCode: user.phoneCode,
        phoneNumber: user.phoneNumber,
        country: user.country,
        currency: user.currency,
        avatar: user.avatar,
        twoFactorEnabled: user.twoFactorEnabled,
        idVerified: user.idVerified,
        referralCode: user.referralCode,
        role: user.role,
        balances: user.balances,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: error.message 
    });
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email address' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If that email exists, a reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // await sendEmail({ ... });

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Password Reset Requested',
      details: 'User requested password reset',
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({
      success: true,
      message: 'Password reset link sent to email',
      // For development only - remove in production
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide token and new password' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired reset token' 
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Password Reset',
      details: 'Password was reset successfully',
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Verify 2FA code
// @route   POST /api/auth/verify-2fa
// @access  Public (but requires login attempt first)
exports.verify2FA = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and 2FA code are required' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ 
        success: false,
        message: '2FA is not enabled for this account' 
      });
    }

    if (code !== user.twoFactorCode) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid 2FA code' 
      });
    }

    res.json({
      success: true,
      message: '2FA verification successful'
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};