const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// GET ALL ORDERS
router.get('/', async (req, res) => {
    res.json(await Order.find().populate("items.product"));
});

// CREATE ORDER + Reduce Inventory
router.post('/create', async (req, res) => {
    const order = new Order(req.body);
    await order.save();

    // Reduce product quantity
    for (let item of req.body.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { quantity: -item.quantity }
        });
    }

    res.json({ message: "Order created" });
});

// UPDATE ORDER
router.put('/update/:id', async (req, res) => {
    await Order.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Order updated" });
});

// DELETE ORDER
router.delete('/delete/:id', async (req, res) => {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
});

module.exports = router;
