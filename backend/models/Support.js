const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: [true, 'Please provide a subject'], trim: true },
  message: { type: String, required: [true, 'Please provide a message'], trim: true },
  category: { type: String, enum: ['order', 'product', 'payment', 'account', 'other'], default: 'other' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  response: { type: String, trim: true },
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  respondedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Support', supportSchema);
