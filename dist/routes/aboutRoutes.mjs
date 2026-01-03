const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');
router.get('/', aboutController.getAbout);
router.post('/', aboutController.updateAbout);
module.exports = router;
export {};
