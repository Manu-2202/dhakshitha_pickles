const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  trackingId: { type: String, unique: true },
  billingDetails: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    streetAddress: { type: String, required: true },
    apartment: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    phone: { type: String, required: true },
    altPhone: { type: String },
    email: { type: String }
  },
  items: [{
    pickleId: String,
    name: String,
    weight: String,
    price: Number,
    quantity: Number,
    category: String
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    isPaid: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['Ordered', 'Packed', 'Waiting for Transport', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Ordered'
  },
  wantsWhatsappUpdates: { type: Boolean, default: false },
  whatsappStatus: {
    type: String,
    enum: ['pending', 'sent', 'skipped', 'failed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
