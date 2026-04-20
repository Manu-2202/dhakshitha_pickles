require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');

const picklesRouter = require('./routes/pickles');
const authRouter    = require('./routes/auth');
const paymentRouter = require('./routes/payment');
const ordersRouter  = require('./routes/orders');
const couponsRouter = require('./routes/coupons');

const app  = express();
const PORT = Number(process.env.PORT) || 5000;

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/pickles',  picklesRouter);
app.use('/api/auth',     authRouter);
app.use('/api/payment',  paymentRouter);
app.use('/api/orders',   ordersRouter);
app.use('/api/coupons',  couponsRouter);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dhakshitha Pickles API running 🌶️' });
});

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥', err.message);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// ── MongoDB + Start ───────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI ||
  'mongodb://manukamepalli8399_db_user:manu%4012345@ac-9m58rqe-shard-00-00.jutmhqc.mongodb.net:27017,ac-9m58rqe-shard-00-01.jutmhqc.mongodb.net:27017,ac-9m58rqe-shard-00-02.jutmhqc.mongodb.net:27017/?ssl=true&replicaSet=atlas-o0bv7h-shard-0&authSource=admin&appName=DakshithaPickles';

console.log('⏳ Connecting to MongoDB...');
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server on port ${PORT}`);
      console.log('📱 WhatsApp: Meta Business Cloud API');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB failed:', err.message);
    process.exit(1);
  });
