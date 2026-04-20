const mongoose = require('mongoose');

const pickleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['veg', 'non-veg'], required: true },
  price250g: { type: Number, required: true },
  price500g: { type: Number, required: true },
  price1kg: { type: Number, required: true },
  stockInKg: { type: Number, default: 0 }, // remaining stock in kg
  imageUrl: { type: String, default: '' },
  spiceLevel: { type: String, enum: ['mild', 'medium', 'hot', 'extra-hot'], default: 'medium' },
  inStock: { type: Boolean, default: true },
  isBestseller: { type: Boolean, default: false },
  ingredients: { type: String, default: '' },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Pickle', pickleSchema);
