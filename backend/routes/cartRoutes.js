const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Optional auth: handles both logged in and guest (via sessionId in headers/body)
const optionalAuth = (req, res, next) => {
    // We reuse authMiddleware logic but don't reject if token is missing
    // or we just check if it exists
    if (req.headers.authorization) {
        return authMiddleware(req, res, next);
    }
    next();
};

router.get('/', optionalAuth, cartController.getCart);
router.post('/add', optionalAuth, cartController.addToCart);
router.put('/update', optionalAuth, cartController.updateCartItem);

module.exports = router;
