const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const Pickle  = require('../models/Pickle');
const { sendOrderStatusMessage } = require('../services/whatsapp');

// ── CUSTOMER: Create new order ────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const body = req.body;

    // Explicitly pick only the fields we know — avoids Mongoose strict-mode rejections
    const billingDetails = {
      firstName:     body.billingDetails?.firstName     || '',
      lastName:      body.billingDetails?.lastName      || '',
      streetAddress: body.billingDetails?.streetAddress || '',
      apartment:     body.billingDetails?.apartment     || '',
      city:          body.billingDetails?.city          || '',
      state:         body.billingDetails?.state         || '',
      pinCode:       body.billingDetails?.pinCode       || '',
      phone:         body.billingDetails?.phone         || '',
      altPhone:      body.billingDetails?.altPhone      || '',
      email:         body.billingDetails?.email         || '',
    };

    // Sanitise items — pick only schema fields
    const items = (body.items || []).map(i => ({
      pickleId: i.pickleId || i._id || '',
      name:     i.name     || '',
      weight:   i.weight   || '500g',
      price:    Number(i.price)    || 0,
      quantity: Number(i.quantity) || 1,
      category: i.category || '',
    }));

    // Auto-increment tracking ID — find true MAX across all orders to avoid E11000
    const allTrackOrders = await Order.find({ trackingId: { $regex: /^DP-\d+$/ } })
      .select('trackingId').lean();
    let maxNum = 1000;
    for (const o of allTrackOrders) {
      const n = parseInt((o.trackingId || '').replace('DP-', ''));
      if (!isNaN(n) && n > maxNum) maxNum = n;
    }
    const trackNum = maxNum + 1;

    const newOrder = new Order({
      trackingId:          `DP-${trackNum}`,
      billingDetails,
      items,
      subtotal:            Number(body.subtotal) || 0,
      discount:            Number(body.discount) || 0,
      total:               Number(body.total)    || 0,
      wantsWhatsappUpdates: Boolean(body.wantsWhatsappUpdates),
      paymentDetails: {
        razorpayOrderId:   body.paymentDetails?.razorpayOrderId   || '',
        razorpayPaymentId: body.paymentDetails?.razorpayPaymentId || '',
        razorpaySignature: body.paymentDetails?.razorpaySignature || '',
        isPaid:            Boolean(body.paymentDetails?.isPaid),
      },
      whatsappStatus: 'pending',
      status: 'Ordered',
    });

    // Save with retry — if another order grabbed the same trackNum between our query and save,
    // increment and try again (handles race conditions on concurrent orders)
    let savedOrder;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        newOrder.trackingId = `DP-${trackNum + attempt}`;
        savedOrder = await newOrder.save();
        break;
      } catch (dupErr) {
        if (dupErr.code === 11000 && attempt < 4) {
          console.warn(`[Orders] TrackingId DP-${trackNum + attempt} taken, retrying with DP-${trackNum + attempt + 1}`);
          continue;
        }
        throw dupErr;
      }
    }

    // Deduct stock (non-blocking — don't fail order if this errors)
    for (const item of savedOrder.items) {
      try {
        if (!item.pickleId) continue;
        const pickle = await Pickle.findById(item.pickleId);
        if (pickle) {
          const kg = item.weight === '500g' ? 0.5 : item.weight === '1kg' ? 1.0 : 0.25;
          pickle.stockInKg = Math.max(0, (pickle.stockInKg || 0) - kg * item.quantity);
          if (pickle.stockInKg <= 0) pickle.inStock = false;
          await pickle.save();
        }
      } catch (stockErr) {
        console.warn('[Orders] Stock deduct failed for:', item.name, stockErr.message);
      }
    }

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('[Orders] Create failed:', err.message, err.errors || '');
    // Return the actual validation message so frontend can display it
    const message = err.errors
      ? Object.values(err.errors).map(e => e.message).join(', ')
      : err.message;
    res.status(400).json({ message });
  }
});

// ── CUSTOMER: Track order ─────────────────────────────────────
router.get('/track/:id', async (req, res) => {
  const searchId = req.params.id.trim().toUpperCase();
  try {
    let order = await Order.findOne({ trackingId: { $regex: new RegExp(`^${searchId}$`, 'i') } }).lean();
    if (!order) {
      const all = await Order.find().lean();
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
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
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

    const notifyStatuses = ['Packed', 'Waiting for Transport', 'Out for Delivery', 'Delivered', 'Cancelled'];
    let whatsappResult = null;

    if (notifyStatuses.includes(status)) {
      whatsappResult = await sendOrderStatusMessage(order);
      if (whatsappResult.sent)         order.whatsappStatus = 'sent';
      else if (whatsappResult.skipped) order.whatsappStatus = 'skipped';
      else                             order.whatsappStatus = 'failed';
    }

    await order.save();
    res.json({ ...order.toObject(), _whatsappResult: whatsappResult });
  } catch (err) {
    console.error('[Orders] Status update failed:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// ── ADMIN: Retry WhatsApp ─────────────────────────────────────
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

// ── ADMIN: Get WhatsApp message text for manual send ──────────
router.get('/:id/wa-message', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const { buildMessageText } = require('../services/whatsapp');
    const text = buildMessageText(order);
    const rawPhone = order.billingDetails?.phone || '';
    let phone = rawPhone.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = phone.slice(1);
    if (phone.length === 10) phone = '91' + phone;
    if (!phone.startsWith('91')) phone = '91' + phone;
    res.json({ phone, text, waUrl: `https://wa.me/${phone}?text=${encodeURIComponent(text)}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
