const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.post('/', orderController.createOrder);

// Protected routes (admin only)
router.get('/', authMiddleware, orderController.getAllOrders);
router.get('/stats', authMiddleware, orderController.getOrderStats);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);
router.get('/:id/whatsapp', authMiddleware, orderController.generateWhatsAppLink);

module.exports = router;
