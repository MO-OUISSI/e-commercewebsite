const Order = require('../models/Order');
const Product = require('../models/Product');

// Create new order (public)
exports.createOrder = async (req, res, next) => {
    try {
        const { customerName, customerPhone, customerCity, shippingAddress, customerNote, items } = req.body;

        // Validate required fields
        if (!customerName || !customerPhone || !customerCity || !shippingAddress || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: customerName, customerPhone, customerCity, shippingAddress, and items'
            });
        }

        // Validate and process order items
        let subtotal = 0;
        const processedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product || !product.isActive) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found or inactive: ${item.productId}`
                });
            }

            // 1. Find the specific color variant
            const colorVariant = product.colors.find(c => c.name === item.colorName);
            if (!colorVariant) {
                return res.status(400).json({
                    success: false,
                    message: `Color ${item.colorName} not found for product ${product.name}`
                });
            }

            // 2. Find the specific size in the color variant
            const sizeVariant = colorVariant.sizes.find(s => s.label === item.size);
            if (!sizeVariant) {
                return res.status(400).json({
                    success: false,
                    message: `Size ${item.size} not available for color ${item.colorName} of product ${product.name}`
                });
            }

            // 3. Check stock
            if (sizeVariant.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${item.colorName}/${item.size} of product ${product.name}. Available: ${sizeVariant.stock}`
                });
            }

            // 4. Determine effective price (Security: Ignore frontend price)
            const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;

            processedItems.push({
                productId: product._id,
                productName: product.name,
                colorName: item.colorName,
                size: item.size,
                imageUrl: colorVariant.imageUrl,
                quantity: item.quantity,
                price: price
            });

            // 5. Update stock
            sizeVariant.stock -= item.quantity;
            product.markModified('colors');
            await product.save();
        }

        const shippingFee = subtotal > 1000 ? 0 : 30; // Example logic: Free shipping over 1000 MAD
        const totalAmount = subtotal + shippingFee;

        // Create order
        const order = new Order({
            customerName,
            customerPhone,
            customerCity,
            shippingAddress,
            customerNote,
            items: processedItems,
            subtotal,
            shippingFee,
            totalAmount,
            status: 'new',
            paymentStatus: 'pending'
        });

        await order.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};

// Get all orders with optional filtering (admin only)
exports.getAllOrders = async (req, res, next) => {
    try {
        const { status, startDate, endDate } = req.query;

        // Build query
        let query = {};

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        const orders = await Order.find(query)
            .populate('items.productId', 'name category')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: { orders }
        });
    } catch (error) {
        next(error);
    }
};

// Get single order by ID (admin only)
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.productId', 'name category images');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const validStatuses = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};


// Get order statistics (admin only)
exports.getOrderStats = async (req, res, next) => {
    try {
        const totalOrders = await Order.countDocuments();
        const newOrders = await Order.countDocuments({ status: 'new' });
        const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

        // Calculate total revenue from delivered orders
        const revenueResult = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                newOrders,
                confirmedOrders,
                deliveredOrders,
                cancelledOrders,
                totalRevenue
            }
        });
    } catch (error) {
        next(error);
    }
};
