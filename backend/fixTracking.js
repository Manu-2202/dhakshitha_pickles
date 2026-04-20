require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dhakshitha_pickles');
  const oldOrders = await Order.find({ trackingId: { $exists: false } });
  
  for (const order of oldOrders) {
    order.trackingId = 'DP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    await order.save();
  }
  
  console.log(`Generated tracking IDs for ${oldOrders.length} old orders!`);
  process.exit();
}
fix();
