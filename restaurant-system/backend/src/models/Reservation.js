const mongoose = require('mongoose');
const reservationSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  customerEmail: { type: String, default: '' },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  partySize: { type: Number, required: true, min: 1, max: 20 },
  zone: { type: String, default: 'Main Dining Hall' },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED'], default: 'PENDING' }
}, { timestamps: true });
reservationSchema.index({ date: 1, timeSlot: 1, status: 1 });
module.exports = mongoose.model('Reservation', reservationSchema);