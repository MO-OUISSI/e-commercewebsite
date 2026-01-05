const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes (admin only)
router.post('/', authMiddleware, upload.array('images', 5), productController.createProduct);
router.put('/:id', authMiddleware, upload.array('images', 5), productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);
router.delete('/:id/images/:imageUrl', authMiddleware, productController.deleteProductImage);

module.exports = router;
