const Razorpay = require('razorpay');
const crypto = require('crypto');
const Request = require('../models/Request');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route  POST /api/payments/create-order
const createOrder = async (req, res) => {
  try {
    const { requestId, amount } = req.body; // amount in rupees

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay needs paise
      currency: 'INR',
      receipt: `receipt_${requestId}`,
    });

    await Request.findByIdAndUpdate(requestId, {
      'payment.amount': amount,
      'payment.razorpayOrderId': order.id,
    });

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// @route  POST /api/payments/verify
const verifyPayment = async (req, res) => {
  try {
    const { requestId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const request = await Request.findByIdAndUpdate(
      requestId,
      {
        'payment.status': 'paid',
        'payment.razorpayPaymentId': razorpay_payment_id,
      },
      { new: true }
    );

    res.json({ message: 'Payment verified', request });
  } catch (error) {
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

module.exports = { createOrder, verifyPayment };