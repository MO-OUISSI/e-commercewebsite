const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public route to get content (Storefront)
router.get('/:section', contentController.getContent);

// Protected route to update content (Admin)
router.put('/:section', authMiddleware, contentController.updateContent);

module.exports = router;
