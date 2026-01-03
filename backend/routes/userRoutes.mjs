const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET ALL USERS
router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// GET ONE USER
router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});

// UPDATE USER
router.put('/update/:id', async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "User updated" });
});

// DELETE USER
router.delete('/delete/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
});

module.exports = router;
