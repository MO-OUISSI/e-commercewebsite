const Product = require('../models/Product');
const Collection = require('../models/Collection');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Get all active products (public)
exports.getAllProducts = async (req, res, next) => {
    try {
        const { category, search, status } = req.query;

        // Build query
        let query = {};

        // Only filter by active unless explicitly asked to include hidden
        if (req.query.includeHidden !== 'true') {
            query.isActive = true;
        }

        if (category) {
            query.category = category.toLowerCase();
        }

        if (status === 'low-stock') {
            query['colors.sizes'] = {
                $elemMatch: {
                    $expr: { $lte: ['$stock', '$minThreshold'] }
                }
            };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            data: { products }
        });
    } catch (error) {
        next(error);
    }
};

// Get single product by ID (public)
exports.getProductById = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: 'Product not found (Invalid ID)'
            });
        }
        let query = { _id: req.params.id };
        if (req.query.includeHidden !== 'true') {
            query.isActive = true;
        }
        const product = await Product.findOne(query);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

// Create new product (admin only)
exports.createProduct = async (req, res, next) => {
    try {
        const { name, description, price, category, sizes, colors } = req.body;

        if (!name || !description || !price || !category || !colors) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, description, price, category, colors'
            });
        }

        // Validate if category exists in Collections
        const collectionExists = await Collection.findOne({ slug: category.toLowerCase() });
        if (!collectionExists) {
            return res.status(400).json({
                success: false,
                message: `Category '${category}' does not exist as a collection. Please create the collection first.`
            });
        }

        // Parse colors if provided as string
        let processedColors = colors || [];
        if (typeof colors === 'string') {
            try {
                processedColors = JSON.parse(colors);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Colors must be a valid JSON array of objects'
                });
            }
        }

        if (!Array.isArray(processedColors) || processedColors.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Product must have at least one color variant'
            });
        }

        // Validate nested sizes for each color
        for (const color of processedColors) {
            if (!color.sizes || !Array.isArray(color.sizes) || color.sizes.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `Color '${color.name}' must have at least one size variant with stock`
                });
            }
        }

        // Handle uploaded images and map them to colors
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            // Assume the order of files in req.files matches the order of colors provided
            // This is a standard way to handle multi-part uploads with nested arrays
            let fileIndex = 0;
            processedColors = processedColors.map(color => {
                // If the frontend sent an image for this color, assign it
                if (fileIndex < req.files.length) {
                    color.imageUrl = `/uploads/products/${req.files[fileIndex].filename}`;
                    fileIndex++;
                }
                return color;
            });

            imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
        }

        // Create product
        const product = new Product({
            name,
            description,
            price: parseFloat(price),
            category: category.toLowerCase(),
            colors: processedColors,
            images: imageUrls,
            isActive: req.body.isActive === 'false' ? false : true,
            isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
            isNewProduct: req.body.isNewProduct === 'true' || req.body.isNewProduct === true,
            isOnSale: req.body.isOnSale === 'true' || req.body.isOnSale === true,
            salePrice: req.body.salePrice ? parseFloat(req.body.salePrice) : undefined
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

// Update product (admin only)
exports.updateProduct = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: 'Product not found (Invalid ID)'
            });
        }
        const { name, description, price, category, sizes, stock, isActive, isFeatured, isNewProduct, isOnSale, salePrice, colors } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Update fields
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = parseFloat(price);
        if (category) {
            const collectionExists = await Collection.findOne({ slug: category.toLowerCase() });
            if (!collectionExists) {
                return res.status(400).json({
                    success: false,
                    message: `Category '${category}' does not exist as a collection.`
                });
            }
            product.category = category.toLowerCase();
        }
        if (isActive !== undefined) product.isActive = isActive;
        if (isFeatured !== undefined) product.isFeatured = isFeatured;
        if (isNewProduct !== undefined) product.isNewProduct = isNewProduct;
        if (isOnSale !== undefined) product.isOnSale = isOnSale;
        if (salePrice !== undefined) product.salePrice = parseFloat(salePrice);
        // ... existing code ...
        if (colors) {
            console.log('UpdateProduct - Received Colors Body:', colors); // DEBUG LOG
            let processedColors = colors;
            if (typeof colors === 'string') {
                try {
                    processedColors = JSON.parse(colors);
                    console.log('UpdateProduct - Parsed Colors:', JSON.stringify(processedColors, null, 2)); // DEBUG LOG
                } catch (error) {
                    console.error('UpdateProduct - JSON Parse Error:', error); // DEBUG LOG
                    return res.status(400).json({
                        success: false,
                        message: 'Colors must be a valid JSON array of objects'
                    });
                }
            }
            // Handle new uploaded images and map them to colors that need them
            if (req.files && req.files.length > 0) {
                let fileIndex = 0;
                processedColors = processedColors.map(color => {
                    // Check if color needs a new image (indicated by frontend)
                    // We'll use a specific convention: if imageUrl is 'new_upload', we use the next file
                    if (color.imageUrl === 'new_upload' && fileIndex < req.files.length) {
                        color.imageUrl = `/uploads/products/${req.files[fileIndex].filename}`;
                        fileIndex++;
                    }
                    return color;
                });

                const newImageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
                product.images = [...product.images, ...newImageUrls];
            }

            product.colors = processedColors;
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });
    } catch (error) {
        console.error('UpdateProduct - Error:', error); // DEBUG LOG
        // Send specific validation error if available
        const message = error.name === 'ValidationError'
            ? Object.values(error.errors).map(err => err.message).join(', ')
            : error.message || 'Failed to update product';

        res.status(400).json({
            success: false,
            message: message
        });
    }
};

// Get low stock products (admin only)
exports.getLowStockProducts = async (req, res, next) => {
    try {
        // Find all products and filter in application code
        // MongoDB $expr with nested arrays is complex, so we'll use aggregation
        const products = await Product.aggregate([
            { $match: { isActive: true } },
            { $unwind: '$colors' },
            { $unwind: '$colors.sizes' },
            {
                $match: {
                    $expr: { $lte: ['$colors.sizes.stock', '$colors.sizes.minThreshold'] }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    colors: { $push: '$colors' }
                }
            }
        ]);

        // Refine the result to only include relevant information for alerts
        const alerts = [];
        products.forEach(product => {
            product.colors.forEach(color => {
                if (color.sizes.stock <= color.sizes.minThreshold) {
                    alerts.push({
                        productId: product._id,
                        productName: product.name,
                        colorName: color.name,
                        sizeLabel: color.sizes.label,
                        currentStock: color.sizes.stock,
                        threshold: color.sizes.minThreshold,
                        image: color.imageUrl
                    });
                }
            });
        });

        res.status(200).json({
            success: true,
            count: alerts.length,
            data: { alerts }
        });
    } catch (error) {
        next(error);
    }
};

// Delete product (soft delete - admin only)
exports.deleteProduct = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: 'Product not found (Invalid ID)'
            });
        }
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Soft delete - just set isActive to false
        product.isActive = false;
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product soft-deleted successfully (isActive set to false)'
        });
    } catch (error) {
        next(error);
    }
};

// Hard Delete product (Permanent - admin only)
exports.hardDeleteProduct = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: 'Product not found (Invalid ID)'
            });
        }
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete images from filesystem
        if (product.images && product.images.length > 0) {
            product.images.forEach(imgUrl => {
                const imgPath = path.join(__dirname, '..', imgUrl);
                if (fs.existsSync(imgPath)) {
                    fs.unlinkSync(imgPath);
                }
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Product permanently deleted from database and filesystem'
        });
    } catch (error) {
        next(error);
    }
};

// Delete product image (admin only)
exports.deleteProductImage = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: 'Product not found (Invalid ID)'
            });
        }
        const { id, imageUrl } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Remove image from array
        const imageIndex = product.images.indexOf(imageUrl);
        if (imageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        product.images.splice(imageIndex, 1);
        await product.save();

        // Delete physical file
        const imagePath = path.join(__dirname, '..', imageUrl);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};
