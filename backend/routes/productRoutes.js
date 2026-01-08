const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/low-stock', productController.getLowStockProducts); // Moved up
router.get('/:id', productController.getProductById);

// Admin routes (Public for Development)
router.post('/', upload.array('images', 5), productController.createProduct);
router.put('/:id', upload.array('images', 5), productController.updateProduct);
router.delete('/:id', productController.hardDeleteProduct);
router.delete('/:id/hard', productController.hardDeleteProduct);
router.delete('/:id/images/:imageUrl', productController.deleteProductImage);

module.exports = router;
