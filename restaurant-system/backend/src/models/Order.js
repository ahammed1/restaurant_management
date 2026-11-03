const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });
const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [orderItemSchema], validate: v => v.length > 0 },
  orderType: { type: String, enum: ['DINE_IN', 'TAKEAWAY'], default: 'DINE_IN' },
  tableNumber: { type: Number, default: null },
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['RAZORPAY', 'COD'], required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'COD_PENDING'], default: 'PENDING' },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  status: { type: String, enum: ['RECEIVED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'], default: 'RECEIVED' }
}, { timestamps: true });
module.exports = mongoose.model('Order', orderSchema);