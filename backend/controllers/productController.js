const Product = require('../models/Product');
const Collection = require('../models/Collection');
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
            colors: processedColors,
            images: imageUrls,
            isActive: true,
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
        if (colors) {
            let processedColors = colors;
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
            product.colors = processedColors;
        }

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
            message: 'Product soft-deleted successfully (isActive set to false)'
        });
    } catch (error) {
        next(error);
    }
};

// Hard Delete product (Permanent - admin only)
exports.hardDeleteProduct = async (req, res, next) => {
    try {
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
