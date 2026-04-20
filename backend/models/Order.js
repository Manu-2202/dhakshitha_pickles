const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  trackingId: { type: String, unique: true, sparse: true },

  billingDetails: {
    firstName:     { type: String, required: true },
    lastName:      { type: String, required: true },
    companyName:   { type: String, default: '' },
    streetAddress: { type: String, required: true },
    apartment:     { type: String, default: '' },
    city:          { type: String, required: true },
    state:         { type: String, required: true },
    pinCode:       { type: String, required: true },
    phone:         { type: String, required: true },
    altPhone:      { type: String, default: '' },
    email:         { type: String, default: '' },
    country:       { type: String, default: 'India' },
  },

  items: [{
    pickleId: { type: String, default: '' },
    name:     { type: String, default: '' },
    weight:   { type: String, default: '500g' },
    price:    { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    category: { type: String, default: '' },
  }],

  subtotal: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 },
  total:    { type: Number, required: true, default: 0 },

  paymentDetails: {
    razorpayOrderId:   { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    isPaid:            { type: Boolean, default: false },
  },

  status: {
    type: String,
    enum: ['Ordered', 'Packed', 'Waiting for Transport', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Ordered',
  },

  wantsWhatsappUpdates: { type: Boolean, default: false },

  whatsappStatus: {
    type: String,
    enum: ['pending', 'sent', 'skipped', 'failed'],
    default: 'pending',
  },

  createdAt: { type: Date, default: Date.now },
}, {
  strict: true,  // Extra fields will be silently ignored (not rejected)
});

module.exports = mongoose.model('Order', orderSchema);
