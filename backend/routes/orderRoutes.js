const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

const rateLimit = require('express-rate-limit');

// Rate limiting for order creation (public)
const createOrderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many orders from this IP. Please try again later.' }
});

// Public routes
router.post('/', createOrderLimiter, orderController.createOrder);

// Protected routes (admin only)
router.get('/', authMiddleware, orderController.getAllOrders);
router.get('/dashboard-stats', authMiddleware, orderController.getDashboardStats);
router.get('/top-selling', authMiddleware, orderController.getTopSellingProducts);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.put('/mark-seen', authMiddleware, orderController.markOrdersAsSeen);
router.put('/:id/read', authMiddleware, orderController.markOrderAsRead);
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);

module.exports = router;
