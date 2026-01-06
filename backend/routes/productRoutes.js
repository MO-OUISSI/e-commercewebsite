const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes (admin only)
router.post('/', authMiddleware, adminMiddleware, upload.array('images', 5), productController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, upload.array('images', 5), productController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);
router.delete('/:id/hard', authMiddleware, adminMiddleware, productController.hardDeleteProduct);
router.delete('/:id/images/:imageUrl', authMiddleware, adminMiddleware, productController.deleteProductImage);

module.exports = router;
