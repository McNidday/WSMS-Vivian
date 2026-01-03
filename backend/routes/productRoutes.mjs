const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET ALL PRODUCTS
router.get('/', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// ADD PRODUCT
router.post('/add', async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.json({ message: "Product added" });
});

// UPDATE PRODUCT
router.put('/update/:id', async (req, res) => {
    await Product.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Product updated" });
});

// DELETE PRODUCT
router.delete('/delete/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
});

// LOW STOCK
router.get('/low-stock', async (req, res) => {
    const products = await Product.find({ quantity: { $lt: 10 } });
    res.json(products);
});

module.exports = router;
