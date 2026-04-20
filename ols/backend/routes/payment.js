const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

router.post('/orders', async (req, res) => {
  try {
    const { amount } = req.body; // Amount should be passed from frontend

    const instance = new Razorpay({
      key_id: "rzp_live_SObidYdicroHKe",
      key_secret: "EFaRCo9DhhQQbTNlwyNo2y4b",
    });

    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", "EFaRCo9DhhQQbTNlwyNo2y4b")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

module.exports = router;
