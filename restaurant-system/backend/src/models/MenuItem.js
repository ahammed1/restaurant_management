const mongoose = require('mongoose');
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: '' },
  badge: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  prepTime: { type: Number, default: 15, min: 1 }
}, { timestamps: true });
module.exports = mongoose.model('MenuItem', menuItemSchema);