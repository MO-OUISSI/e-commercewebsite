const Collection = require('../models/Collection');
const fs = require('fs');
const path = require('path');

// Get all collections (Public filtered by isActive, Admin all)
exports.getCollections = async (req, res, next) => {
    try {
        const query = req.user ? {} : { isActive: true };
        const collections = await Collection.find(query).sort({ position: 1, name: 1 });

        res.status(200).json({
            success: true,
            count: collections.length,
            data: { collections }
        });
    } catch (error) {
        next(error);
    }
};

// Create collection (Admin only)
exports.createCollection = async (req, res, next) => {
    try {
        const { name, slug, isActive, position } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Collection name is required'
            });
        }

        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/collections/${req.file.filename}`;
        }

        const collection = new Collection({
            name,
            slug: slug || name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            isActive: isActive !== undefined ? isActive : true,
            position: position || 0,
            image: imageUrl
        });

        await collection.save();

        res.status(201).json({
            success: true,
            message: 'Collection created successfully',
            data: { collection }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Collection name or slug already exists'
            });
        }
        next(error);
    }
};

// Update collection (Admin only)
exports.updateCollection = async (req, res, next) => {
    try {
        const { name, slug, isActive, position } = req.body;
        const collection = await Collection.findById(req.params.id);

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Collection not found'
            });
        }

        if (name) collection.name = name;
        if (slug) collection.slug = slug;
        if (isActive !== undefined) collection.isActive = isActive;
        if (position !== undefined) collection.position = position;

        if (req.file) {
            // Delete old image if exists
            if (collection.image) {
                const oldPath = path.join(__dirname, '..', collection.image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            collection.image = `/uploads/collections/${req.file.filename}`;
        }

        await collection.save();

        res.status(200).json({
            success: true,
            message: 'Collection updated successfully',
            data: { collection }
        });
    } catch (error) {
        next(error);
    }
};

// Delete collection (Admin only)
exports.deleteCollection = async (req, res, next) => {
    try {
        const collection = await Collection.findById(req.params.id);

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Collection not found'
            });
        }

        // Delete image file
        if (collection.image) {
            const imagePath = path.join(__dirname, '..', collection.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await collection.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Collection deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Bulk update positions (Admin only)
exports.updatePositions = async (req, res, next) => {
    try {
        const { positions } = req.body; // Array of { id: string, position: number }

        if (!positions || !Array.isArray(positions)) {
            return res.status(400).json({
                success: false,
                message: 'Positions array is required'
            });
        }

        const updates = positions.map(item =>
            Collection.findByIdAndUpdate(item.id, { position: item.position })
        );

        await Promise.all(updates);

        res.status(200).json({
            success: true,
            message: 'Collection order updated successfully'
        });
    } catch (error) {
        next(error);
    }
};
