require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dhakshitha_pickles');
  await Order.updateMany({}, { $set: { wantsWhatsappUpdates: true }});
  console.log('Fixed old orders!');
  process.exit();
}
fix();
