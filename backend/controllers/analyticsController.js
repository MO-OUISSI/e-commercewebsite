const ProductAnalytics = require('../models/ProductAnalytics');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Helper to get today's date string YYYY-MM-DD
const getDateStr = () => new Date().toISOString().split('T')[0];

exports.trackView = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const ip = req.ip || req.connection.remoteAddress;
        const dateStr = getDateStr();
        const date = new Date(dateStr);

        // Atomic update with upsert
        await ProductAnalytics.findOneAndUpdate(
            { productId, dateStr },
            {
                $setOnInsert: { date, productId },
                $inc: { views: 1 },
                $addToSet: { uniqueIps: ip }
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        // Don't block the frontend if tracking fails
        console.error('Analytics track error:', error);
        res.status(200).json({ success: false });
    }
};

exports.trackCart = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const dateStr = getDateStr();
        const date = new Date(dateStr);

        await ProductAnalytics.findOneAndUpdate(
            { productId, dateStr },
            {
                $setOnInsert: { date, productId },
                $inc: { addToCart: 1 }
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Analytics cart track error:', error);
        res.status(200).json({ success: false });
    }
};


exports.getProductAnalytics = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { range = '7d' } = req.query; // 7d, 30d, all

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(404).json({ success: false, message: 'Invalid product ID' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Determine date range
        let queryDate = new Date();
        if (range === '7d') queryDate.setDate(queryDate.getDate() - 7);
        else if (range === '30d') queryDate.setDate(queryDate.getDate() - 30);
        else if (range === 'all') queryDate = new Date(0); // Beginning of time

        // 1. Fetch Analytics Data (Views, Carts)
        const analyticsDocs = await ProductAnalytics.find({
            productId,
            date: { $gte: queryDate }
        }).sort({ date: 1 });

        // 2. Fetch Order Data
        // Order items are embedded, need to unwind or filter
        const orders = await Order.find({
            "items.productId": productId,
            createdAt: { $gte: queryDate },
            status: { $ne: 'cancelled' } // Exclude cancelled orders
        });

        // 3. Aggregate Data
        let totalViews = 0;
        let uniqueViews = 0; // Sum of daily unique IPs (approximate)
        let totalAddToCart = 0;

        analyticsDocs.forEach(doc => {
            totalViews += doc.views;
            uniqueViews += doc.uniqueIps.length;
            totalAddToCart += doc.addToCart;
        });

        let totalOrders = 0;
        let totalRevenue = 0;

        // Group orders by date for chart
        const ordersMap = {};

        orders.forEach(order => {
            const dateStr = order.createdAt.toISOString().split('T')[0];

            // Find specific item in order to get quantity
            const item = order.items.find(i => i.productId.toString() === productId);
            if (item) {
                totalOrders += 1; // Count as 1 order event
                totalRevenue += (item.price * item.quantity);

                if (!ordersMap[dateStr]) ordersMap[dateStr] = { orders: 0, revenue: 0 };
                ordersMap[dateStr].orders += 1;
                ordersMap[dateStr].revenue += (item.price * item.quantity);
            }
        });

        // 4. Prepare Chart Data (Merge analytics + orders)
        // Create a map of all dates in the range
        const chartData = [];
        const endDate = new Date();
        const startDate = new Date(queryDate);

        // Loop valid dates
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];

            // Find analytics for this date
            const analytics = analyticsDocs.find(a => a.dateStr === dateStr);
            const orderStats = ordersMap[dateStr] || { orders: 0, revenue: 0 };

            chartData.push({
                date: dateStr,
                views: analytics ? analytics.views : 0,
                uniqueViews: analytics ? analytics.uniqueIps.length : 0,
                addToCart: analytics ? analytics.addToCart : 0,
                orders: orderStats.orders,
                revenue: orderStats.revenue
            });
        }

        const conversionRate = totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(2) : 0;

        // Stock Status
        let stockStatus = 'In Stock';
        if (product.totalStock === 0) stockStatus = 'Out of Stock';
        else if (product.totalStock <= 10) stockStatus = 'Low Stock';

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalViews,
                    uniqueViews,
                    totalAddToCart,
                    totalOrders,
                    totalRevenue,
                    conversionRate,
                    totalStock: product.totalStock,
                    stockStatus,
                    productName: product.name,
                    productImage: product.images[0] || product.colors[0]?.imageUrl
                },
                chartData
            }
        });

    } catch (error) {
        next(error);
    }
};
