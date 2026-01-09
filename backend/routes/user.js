const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  enable2FA,
  disable2FA,
  change2FA,
  getActivities,
  getSessions
} = require('../controllers/userController');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter
});

// All routes require authentication
router.use(protect);

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', getProfile);

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', updateProfile);

// @route   POST /api/user/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', upload.single('avatar'), uploadAvatar);

// @route   DELETE /api/user/avatar
// @desc    Delete user avatar
// @access  Private
router.delete('/avatar', deleteAvatar);

// @route   PUT /api/user/password
// @desc    Change password
// @access  Private
router.put('/password', changePassword);

// @route   POST /api/user/2fa/enable
// @desc    Enable 2FA
// @access  Private
router.post('/2fa/enable', enable2FA);

// @route   POST /api/user/2fa/disable
// @desc    Disable 2FA
// @access  Private
router.post('/2fa/disable', disable2FA);

// @route   PUT /api/user/2fa/change
// @desc    Change 2FA code
// @access  Private
router.put('/2fa/change', change2FA);

// @route   GET /api/user/activities
// @desc    Get user activity history
// @access  Private
router.get('/activities', getActivities);

// @route   GET /api/user/sessions
// @desc    Get user active sessions
// @access  Private
router.get('/sessions', getSessions);

module.exports = router;