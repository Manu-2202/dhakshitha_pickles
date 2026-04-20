const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  secretKey: { type: String, required: true, unique: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Admin', adminSchema);
