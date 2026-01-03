const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

// GET ALL PAYMENTS
router.get('/', async (req, res) => {
    res.json(await Payment.find());
});

// ADD PAYMENT
router.post('/add', async (req, res) => {
    const payment = new Payment(req.body);
    await payment.save();
    res.json({ message: "Payment done!" });
});

// GET PAYMENTS FOR ONE ORDER
router.get('/order/:orderId', async (req, res) => {
    res.json(await Payment.find({ orderId: req.params.orderId }));
});

module.exports = router;
