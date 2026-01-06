const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public route to get active collections
router.get('/', collectionController.getCollections);

// Protected routes (Admin only)
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), collectionController.createCollection);
router.put('/reorder', authMiddleware, adminMiddleware, collectionController.updatePositions);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), collectionController.updateCollection);
router.delete('/:id', authMiddleware, adminMiddleware, collectionController.deleteCollection);

module.exports = router;
