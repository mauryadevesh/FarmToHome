const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['farmer', 'consumer', 'admin'],
    required: [true, 'Please select a role']
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  loginHistory: [{
    loginTime: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String
  }],
  lastLogin: { type: Date }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add login record
userSchema.methods.addLoginRecord = function(ip, userAgent) {
  this.loginHistory.push({
    loginTime: new Date(),
    ipAddress: ip,
    userAgent: userAgent
  });
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);


