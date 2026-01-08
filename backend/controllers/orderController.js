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
        const { status, startDate, endDate, isRead, isSeen } = req.query;

        // Build query
        let query = {};

        if (status) {
            query.status = status;
        }

        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }

        if (isSeen !== undefined) {
            query.isSeen = isSeen === 'true';
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

        // Strict Transition Logic
        const ALLOWED_TRANSITIONS = {
            'new': ['confirmed', 'cancelled'],
            'confirmed': ['shipped', 'cancelled'],
            'shipped': ['delivered'],
            'delivered': [], // Terminal state
            'cancelled': []  // Terminal state
        };

        const currentStatus = order.status;

        // Allow same status updates (idempotency)
        if (currentStatus !== status) {
            const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
            if (!allowedNext.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid transition from '${currentStatus}' to '${status}'. Allowed: ${allowedNext.join(', ') || 'None'}`
                });
            }
        }

        // Logic to restore stock if order is cancelled
        if (status === 'cancelled' && order.status !== 'cancelled') {
            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    const colorVariant = product.colors.find(c => c.name === item.colorName);
                    if (colorVariant) {
                        const sizeVariant = colorVariant.sizes.find(s => s.label === item.size);
                        if (sizeVariant) {
                            sizeVariant.stock += item.quantity;
                            await product.save();
                        }
                    }
                }
            }
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


// Get comprehensive dashboard statistics (admin only)
exports.getDashboardStats = async (req, res, next) => {
    try {
        const { period = '7d' } = req.query;
        let days = 7;
        const endDate = new Date();
        let startDate = new Date();

        if (period === '30d') {
            days = 30;
            startDate.setDate(endDate.getDate() - days);
        } else if (period === 'year') {
            // Stats from Jan 1st of current year
            startDate = new Date(endDate.getFullYear(), 0, 1);
            days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
        } else {
            // Default 7d
            days = 7;
            startDate.setDate(endDate.getDate() - days);
        }

        const prevStartDate = new Date(startDate);
        if (period === 'year') {
            prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
        } else {
            prevStartDate.setDate(prevStartDate.getDate() - (days || 1));
        }

        // 1. Basic counts (Period independent for totals, but we could filter if needed)
        // For now total products/collections are absolute totals
        const [totalProducts, totalOrders, totalCollections] = await Promise.all([
            require('../models/Product').countDocuments({ isActive: true }),
            Order.countDocuments(),
            require('../models/Collection').countDocuments()
        ]);

        // 2. Revenue and Trends
        const currentPeriodStats = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
            { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);

        const prevPeriodMatch = period === 'year'
            ? { createdAt: { $gte: prevStartDate, $lt: new Date(prevStartDate.getFullYear(), endDate.getMonth(), endDate.getDate()) }, status: { $ne: 'cancelled' } }
            : { createdAt: { $gte: prevStartDate, $lt: startDate }, status: { $ne: 'cancelled' } };

        const prevPeriodStats = await Order.aggregate([
            { $match: prevPeriodMatch },
            { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);

        const currentRevenue = currentPeriodStats[0]?.revenue || 0;
        const prevRevenue = prevPeriodStats[0]?.revenue || 0;
        const currentCount = currentPeriodStats[0]?.count || 0;
        const prevCount = prevPeriodStats[0]?.count || 0;

        const revenueTrend = prevRevenue === 0 ? 100 : Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100);
        const orderTrend = prevCount === 0 ? 100 : Math.round(((currentCount - prevCount) / prevCount) * 100);

        // 3. Chart Data
        let fullChartData = [];

        if (period === 'year') {
            // Monthly aggregation
            const monthlyData = await Order.aggregate([
                { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        revenue: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { "_id": 1 } }
            ]);

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            for (let i = 1; i <= 12; i++) {
                const monthMatch = monthlyData.find(d => d._id === i);
                fullChartData.push({
                    label: monthNames[i - 1],
                    revenue: monthMatch ? monthMatch.revenue : 0
                });
            }
        } else {
            // Daily aggregation
            const chartData = await Order.aggregate([
                { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        revenue: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { "_id": 1 } }
            ]);

            for (let i = 0; i <= days; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const matchingDay = chartData.find(d => d._id === dateStr);
                fullChartData.push({
                    date: dateStr,
                    label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    revenue: matchingDay ? matchingDay.revenue : 0
                });
            }
        }

        res.status(200).json({
            success: true,
            data: {
                totalProducts,
                totalOrders,
                totalCollections,
                totalRevenue: currentRevenue,
                revenueTrend: (revenueTrend >= 0 ? '+' : '') + revenueTrend + '%',
                orderTrend: (orderTrend >= 0 ? '+' : '') + orderTrend + '%',
                chartData: fullChartData
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get top selling products (admin only)
exports.getTopSellingProducts = async (req, res, next) => {
    try {
        const topSelling = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    name: { $first: '$items.productName' },
                    imageUrl: { $first: '$items.imageUrl' },
                    totalSales: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            {
                $addFields: {
                    productDetails: { $arrayElemAt: ['$productInfo', 0] },
                    isDeleted: { $eq: [{ $size: '$productInfo' }, 0] }
                }
            },
            {
                $addFields: {
                    isHidden: {
                        $cond: {
                            if: '$isDeleted',
                            then: false,
                            else: { $not: '$productDetails.isActive' }
                        }
                    },
                    name: {
                        $cond: {
                            if: '$isDeleted',
                            then: 'Deleted Product', // Could use '$name' (from group id) if available, but 'Deleted Product' is safer fallback
                            else: '$productDetails.name'
                        }
                    },
                    // Ensure we have a valid image url from the product if it exists
                    latestImageUrl: {
                        $cond: {
                            if: '$isDeleted',
                            then: null,
                            else: {
                                $let: {
                                    vars: { firstColor: { $arrayElemAt: ['$productDetails.colors', 0] } },
                                    in: '$$firstColor.imageUrl'
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    productInfo: 0,
                    productDetails: 0
                }
            },
            { $sort: { totalSales: -1, totalRevenue: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            success: true,
            data: { topSelling }
        });
    } catch (error) {
        next(error);
    }
};
// Mark single order as read (admin only)
exports.markOrderAsRead = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, data: { order } });
    } catch (error) {
        next(error);
    }
};

// Mark all unseen orders as seen (admin only)
exports.markOrdersAsSeen = async (req, res, next) => {
    try {
        await Order.updateMany(
            { isSeen: false },
            { isSeen: true }
        );

        res.status(200).json({ success: true, message: 'All orders marked as seen' });
    } catch (error) {
        next(error);
    }
};
