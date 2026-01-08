const mongoose = require('mongoose');

const productAnalyticsSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    dateStr: { // YYYY-MM-DD for easy querying
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    uniqueIps: {
        type: [String],
        default: []
    },
    addToCart: {
        type: Number,
        default: 0
    }
});

// Compound index for efficient lookup
productAnalyticsSchema.index({ productId: 1, dateStr: 1 }, { unique: true });

module.exports = mongoose.model('ProductAnalytics', productAnalyticsSchema);
