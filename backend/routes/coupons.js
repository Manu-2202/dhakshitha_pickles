const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// Get all coupons (Admin)
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new coupon (Admin)
router.post('/', async (req, res) => {
  try {
    const { code, discountAmount } = req.body;
    const newCoupon = new Coupon({ code, discountAmount });
    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a coupon
router.delete('/:id', async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Validate coupon (Public)
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon code.' });
    }

    res.json({ valid: true, discountAmount: coupon.discountAmount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
