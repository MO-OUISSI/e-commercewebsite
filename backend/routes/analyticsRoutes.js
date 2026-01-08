const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Public tracking routes (can be protected if needed, but usually public for frontend tracking)
router.post('/view/:productId', analyticsController.trackView);
router.post('/cart/:productId', analyticsController.trackCart);

// Admin only routes
// In a real app, apply adminMiddleware here. 
// Assuming this is requested for admin panel usage.
router.get('/product/:productId', analyticsController.getProductAnalytics);

module.exports = router;
