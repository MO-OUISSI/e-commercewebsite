const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public route to get active collections
router.get('/', collectionController.getCollections);

// Routes (Public for Development)
router.post('/', upload.single('image'), collectionController.createCollection);
router.put('/reorder', collectionController.updatePositions);
router.put('/:id', upload.single('image'), collectionController.updateCollection);
router.delete('/:id', collectionController.deleteCollection);

module.exports = router;
