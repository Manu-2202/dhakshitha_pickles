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

    // wantsWhatsappUpdates comes from checkout toggle (true/false)
    // We do NOT send a WhatsApp message on order placement —
    // messages are sent ONLY when admin changes status below.
    const newOrder = new Order({
      ...req.body,
      trackingId: `DP-${trackNum}`,
      whatsappStatus: 'skipped'   // no "Ordered" message ever
    });
    await newOrder.save();

    // Deduct stock
    for (const item of newOrder.items) {
      const pickle = await Pickle.findById(item.pickleId);
      if (pickle) {
        const kg = item.weight === '500g' ? 0.5 : item.weight === '1kg' ? 1.0 : 0.25;
        pickle.stockInKg = Math.max(0, pickle.stockInKg - kg * item.quantity);
        if (pickle.stockInKg <= 0) pickle.inStock = false;
        await pickle.save();
      }
    }

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── CUSTOMER: Track order ─────────────────────────────────────
router.get('/track/:id', async (req, res) => {
  const searchId = req.params.id;
  try {
    let order = await Order.findOne({ trackingId: searchId });
    if (!order) {
      const all = await Order.find();
      order = all.find(o => o._id.toString().toUpperCase().endsWith(searchId.toUpperCase()));
    }
    if (!order) return res.status(404).json({ message: 'Order not found' });
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

    // Send WhatsApp for these admin-triggered statuses ONLY (never "Ordered")
    const notifyStatuses = ['Packed', 'Waiting for Transport', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (notifyStatuses.includes(status)) {
      const result = await sendOrderStatusMessage(order);
      order.whatsappStatus = result.sent ? 'sent' : result.skipped ? 'skipped' : 'failed';
    }

    await order.save();
    res.json(order);
  } catch (err) {
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

// ── Legacy bot routes (no longer active) ─────────────────────
router.get('/bot/pending', (req, res) => res.json([]));
router.patch('/bot/:id/whatsapp', async (req, res) => {
  try {
    const o = await Order.findByIdAndUpdate(req.params.id, { whatsappStatus: req.body.whatsappStatus }, { new: true });
    res.json(o);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
