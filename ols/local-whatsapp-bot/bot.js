const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');

// Read DB URI from backend folder if possible, else hardcode the known one
const MONGO_URI = 'mongodb://manukamepalli8399_db_user:manu%4012345@ac-9m58rqe-shard-00-00.jutmhqc.mongodb.net:27017,ac-9m58rqe-shard-00-01.jutmhqc.mongodb.net:27017,ac-9m58rqe-shard-00-02.jutmhqc.mongodb.net:27017/?ssl=true&replicaSet=atlas-o0bv7h-shard-0&authSource=admin&appName=DakshithaPickles';

// Order Model minimalist
const orderSchema = new mongoose.Schema({
  trackingId: String,
  billingDetails: Object,
  items: Array,
  total: Number,
  status: String,
  whatsappStatus: String,
  wantsWhatsappUpdates: Boolean
}, { strict: false });
const Order = mongoose.model('Order', orderSchema);

console.log('⏳ Connecting to Database...');
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch(err => { console.error('❌ DB Error:', err.message); process.exit(1); });

console.log('🤖 Starting Local WhatsApp Bot...');
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true, // Will run hidden on laptop
  }
});

client.on('qr', (qr) => {
  console.log('\n=============================================');
  console.log('📲 SCAN THIS QR CODE IN YOUR WHATSAPP APP!');
  console.log('Go to Linked Devices -> Link a Device');
  console.log('=============================================\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('🎉 BOT IS READY AND CONNECTED! Monitoring for orders...');
  setInterval(checkOrders, 10000); // Check every 10 seconds
});

client.on('auth_failure', msg => {
  console.error('❌ Authentication failed:', msg);
});

client.initialize();

function formatPhoneForWeb(rawPhone) {
  let clean = rawPhone.replace(/\D/g, '');
  if (clean.length === 10) clean = '91' + clean;
  if (clean.startsWith('0')) clean = '91' + clean.slice(1);
  return `${clean}@c.us`;
}

function buildMessage(order) {
  const { trackingId, _id, billingDetails, items, total, status } = order;
  const tId = trackingId || `DP-${_id.toString().slice(-4).toUpperCase()}`;

  let header = '';
  switch (status) {
    case 'Packed': header = `📦 *Your Order is Packed!*`; break;
    case 'Waiting for Transport': header = `🚚 *Awaiting Pickup!*`; break;
    case 'Out for Delivery': header = `🛵 *Out for Delivery!*`; break;
    case 'Delivered': header = `✅ *Delivered Successfully!*`; break;
    case 'Cancelled': header = `❌ *Order Cancelled*`; break;
    default: header = `📄 *Order Status Update*`;
  }

  let text = `${header}\n\nHi ${billingDetails?.firstName || 'Customer'},\nYour order *${tId}* status is now: *${status}*.\n\n*Items:*`;
  if (items) {
    items.forEach(i => {
      const w = i.weight === '250g' ? '(250g)' : i.weight === '500g' ? '(500g)' : '(1kg)';
      text += `\n▫️ ${i.name} ${w} x${i.quantity}`;
    });
  }

  text += `\n\n*Total:* ₹${total}`;
  if (status === 'Delivered') {
    text += `\n\nThank you for choosing Dhakshitha Pickles! Enjoy the authentic taste. ❤️`;
  } else {
    text += `\n\nYou can track your order at anytime:\nhttps://dakshitha-pickles.vercel.app/track`;
  }
  return text;
}

// Polling function
let isChecking = false;
async function checkOrders() {
  if (isChecking) return;
  isChecking = true;
  try {
    const pendingOrders = await Order.find({ whatsappStatus: 'pending' });
    if (pendingOrders.length > 0) {
      console.log(`📦 Found ${pendingOrders.length} orders waiting for WhatsApp notifications.`);
    }

    for (const order of pendingOrders) {
      if (!order.wantsWhatsappUpdates) {
        order.whatsappStatus = 'skipped';
        await order.save();
        continue;
      }
      
      const rawPhone = order.billingDetails?.phone;
      if (!rawPhone) {
        order.whatsappStatus = 'failed';
        await order.save();
        continue;
      }

      console.log(`Sending to ${rawPhone} for order ${order.trackingId}...`);
      const phone = formatPhoneForWeb(rawPhone);
      const text = buildMessage(order);

      try {
        await client.sendMessage(phone, text);
        console.log(`✅ Sent to ${rawPhone}!`);
        order.whatsappStatus = 'sent';
      } catch (err) {
        console.error(`❌ Failed to send to ${rawPhone}:`, err.message);
        order.whatsappStatus = 'failed'; // Don't infinite loop on broken numbers
      }
      await order.save();
      
      // Wait 3 seconds between messages to prevent spam ban
      await new Promise(r => setTimeout(r, 3000));
    }
  } catch (err) {
    console.error('Error checking orders:', err.message);
  } finally {
    isChecking = false;
  }
}
