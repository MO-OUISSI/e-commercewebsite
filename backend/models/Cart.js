const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    colorName: {
        type: String,
        required: true
    },
    sizeLabel: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1
    }
}, { _id: true });

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for guest carts
    },
    sessionId: {
        type: String, // For guest users if not logged in
        required: false
    },
    items: [cartItemSchema],
    lastModified: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure a cart is identified either by user or sessionId
cartSchema.index({ user: 1 }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });

module.exports = mongoose.model('Cart', cartSchema);
