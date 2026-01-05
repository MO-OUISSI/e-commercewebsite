const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// Get all active products (public)
exports.getAllProducts = async (req, res, next) => {
    try {
        const { category, search } = req.query;

        // Build query
        let query = { isActive: true };

        if (category) {
            query.category = category.toLowerCase();
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
        const product = await Product.findOne({ _id: req.params.id, isActive: true });

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
        const { name, description, price, category, sizes } = req.body;

        // Validate required fields
        if (!name || !description || !price || !category || !sizes) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, description, price, category, sizes'
            });
        }

        // Parse sizes - it should be an array of objects: [{ label: 'S', stock: 10 }]
        let processedSizes = sizes;
        if (typeof sizes === 'string') {
            try {
                processedSizes = JSON.parse(sizes);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Sizes must be a valid JSON array of objects with label and stock'
                });
            }
        }

        if (!Array.isArray(processedSizes) || processedSizes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Product must have at least one size with stock'
            });
        }

        // Handle uploaded images
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
        }

        // Create product
        const product = new Product({
            name,
            description,
            price: parseFloat(price),
            category: category.toLowerCase(),
            sizes: processedSizes,
            images: imageUrls,
            isActive: true
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
        const { name, description, price, category, sizes, stock, isActive } = req.body;

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
        if (category) product.category = category.toLowerCase();
        if (sizes) {
            let processedSizes = sizes;
            if (typeof sizes === 'string') {
                try {
                    processedSizes = JSON.parse(sizes);
                } catch (error) {
                    return res.status(400).json({
                        success: false,
                        message: 'Sizes must be a valid JSON array of objects with label and stock'
                    });
                }
            }
            product.sizes = processedSizes;
        }
        if (isActive !== undefined) product.isActive = isActive;

        // Handle new uploaded images
        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
            product.images = [...product.images, ...newImageUrls];
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

// Delete product (soft delete - admin only)
exports.deleteProduct = async (req, res, next) => {
    try {
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
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Delete product image (admin only)
exports.deleteProductImage = async (req, res, next) => {
    try {
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
