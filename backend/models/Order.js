const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    colorName: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    customerPhone: {
        type: String,
        required: [true, 'Customer phone is required'],
        trim: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid phone number (10 digits)']
    },
    customerCity: {
        type: String,
        required: [true, 'Customer city is required'],
        trim: true
    },
    shippingAddress: {
        type: String,
        required: [true, 'Shipping address is required'],
        trim: true
    },
    customerNote: {
        type: String,
        trim: true
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'Order must have at least one item'
        }
    },
    subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative']
    },
    shippingFee: {
        type: Number,
        required: true,
        default: 30
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },
    status: {
        type: String,
        enum: ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'new'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate unique order number before saving
orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        // Count orders created today
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const count = await mongoose.model('Order').countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const orderNum = String(count + 1).padStart(4, '0');
        this.orderNumber = `ORD${year}${month}${day}${orderNum}`;
    }

    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Order', orderSchema);
