const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phoneCode: { type: String, default: '+1' },
  phoneNumber: { type: String, required: true },
  country: { type: String, required: true },
  currency: { type: String, default: 'USD' },
  avatar: { type: String, default: null },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorCode: { type: String, default: null },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  idVerified: { type: Boolean, default: false },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: String, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  balances: {
    type: Map,
    of: Number,
    default: {}
  },
  lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);