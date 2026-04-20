const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const Pickle  = require('../models/Pickle');
const { sendOrderStatusMessage } = require('../services/whatsapp');

// ── CUSTOMER: Create new order ────────────────────────────────
router.post('/', async (req, res) => {
  try {
    // Auto-increment tracking ID
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    let trackNum = 1001;
    if (lastOrder?.trackingId) {
      const n = parseInt(lastOrder.trackingId.replace('DP-', ''));
      if (!isNaN(n)) trackNum = n + 1;
    }

    const newOrder = new Order({
      ...req.body,
      trackingId: `DP-${trackNum}`,
      whatsappStatus: 'pending'
    });
    await newOrder.save();

    // Deduct stock
    for (const item of newOrder.items) {
      try {
        const pickle = await Pickle.findById(item.pickleId);
        if (pickle) {
          const kg = item.weight === '500g' ? 0.5 : item.weight === '1kg' ? 1.0 : 0.25;
          pickle.stockInKg = Math.max(0, pickle.stockInKg - kg * item.quantity);
          if (pickle.stockInKg <= 0) pickle.inStock = false;
          await pickle.save();
        }
      } catch (stockErr) {
        console.warn('[Orders] Stock update failed for item:', item.name, stockErr.message);
      }
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('[Orders] Create failed:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// ── CUSTOMER: Track order ─────────────────────────────────────
router.get('/track/:id', async (req, res) => {
  const searchId = req.params.id.trim().toUpperCase();
  try {
    // Try tracking ID first (e.g. DP-1001)
    let order = await Order.findOne({ trackingId: { $regex: new RegExp(`^${searchId}$`, 'i') } });

    // Try last 6 chars of MongoDB _id
    if (!order) {
      const all = await Order.find();
      order = all.find(o => o._id.toString().toUpperCase().endsWith(searchId));
    }

    if (!order) return res.status(404).json({ message: 'Order not found. Please check your tracking ID.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ADMIN: Get all orders ─────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ADMIN: Update order status → sends WhatsApp if opted in ──
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;

    // Send WhatsApp for these admin-triggered statuses ONLY
    const notifyStatuses = ['Packed', 'Waiting for Transport', 'Out for Delivery', 'Delivered', 'Cancelled'];
    let whatsappResult = null;

    if (notifyStatuses.includes(status)) {
      whatsappResult = await sendOrderStatusMessage(order);
      if (whatsappResult.sent)    order.whatsappStatus = 'sent';
      else if (whatsappResult.skipped) order.whatsappStatus = 'skipped';
      else                        order.whatsappStatus = 'failed';
    }

    await order.save();

    // Return both order and whatsapp result so admin UI can show notification
    res.json({ ...order.toObject(), _whatsappResult: whatsappResult });
  } catch (err) {
    console.error('[Orders] Status update failed:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// ── ADMIN: Retry WhatsApp for an order ───────────────────────
router.post('/:id/retry-whatsapp', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const result = await sendOrderStatusMessage(order);
    order.whatsappStatus = result.sent ? 'sent' : result.skipped ? 'skipped' : 'failed';
    await order.save();

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
