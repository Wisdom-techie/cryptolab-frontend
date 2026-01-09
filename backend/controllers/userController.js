const User = require('../models/User');
const Activity = require('../models/Activity');
const fs = require('fs');
const path = require('path');

// @desc    Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
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
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneCode, phoneNumber, country, currency } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneCode) user.phoneCode = phoneCode;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (country) user.country = country;
    if (currency) user.currency = currency;

    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Profile Update',
      details: 'Updated personal information'
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneCode: user.phoneCode,
        phoneNumber: user.phoneNumber,
        country: user.country,
        currency: user.currency
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    
    // Delete old avatar if exists
    if (user.avatar) {
      const oldPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save new avatar path
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Profile Update',
      details: 'Changed profile picture'
    });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete avatar
exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.avatar) {
      const avatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    user.avatar = null;
    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Profile Update',
      details: 'Deleted profile picture'
    });

    res.json({
      success: true,
      message: 'Avatar deleted successfully'
    });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Security Update',
      details: 'Changed password'
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Enable 2FA
exports.enable2FA = async (req, res) => {
  try {
    const { code, password } = req.body;

    if (!code || code.length !== 6) {
      return res.status(400).json({ message: 'Invalid 2FA code' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const user = await User.findById(req.user._id);

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    user.twoFactorEnabled = true;
    user.twoFactorCode = code;
    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Security Update',
      details: 'Enabled 2FA'
    });

    res.json({
      success: true,
      message: '2FA enabled successfully'
    });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Disable 2FA
exports.disable2FA = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const user = await User.findById(req.user._id);

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorCode = null;
    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Security Update',
      details: 'Disabled 2FA'
    });

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Change 2FA code
exports.change2FA = async (req, res) => {
  try {
    const { newCode, password } = req.body;

    if (!newCode || newCode.length !== 6) {
      return res.status(400).json({ message: 'Invalid 2FA code' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const user = await User.findById(req.user._id);

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    user.twoFactorCode = newCode;
    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      action: 'Security Update',
      details: 'Changed 2FA code'
    });

    res.json({
      success: true,
      message: '2FA code changed successfully'
    });
  } catch (error) {
    console.error('Change 2FA error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user activities
exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user sessions (mock for now)
exports.getSessions = async (req, res) => {
  try {
    // In production, track real sessions
    const sessions = [
      {
        loginTime: req.user.lastLogin,
        device: 'Web Browser',
        status: 'Active'
      }
    ];

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

