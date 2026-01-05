const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['dresses', 'sets', 'bags', 'accessories', 'other'],
        lowercase: true
    },
    sizes: [
        {
            label: {
                type: String,
                required: [true, 'Size label is required']
            },
            stock: {
                type: Number,
                required: [true, 'Stock quantity for this size is required'],
                min: [0, 'Stock cannot be negative'],
                default: 0
            }
        }
    ],
    images: {
        type: [String],
        default: []
    },
    // We removed the main stock field in favor of size-specific stock
    // But we can add it back as a virtual if needed for filtering/displaying.
    isActive: {
        type: Boolean,
        default: true
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

// Update the updatedAt timestamp before saving
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Add a virtual field for total stock
productSchema.virtual('totalStock').get(function () {
    return this.sizes.reduce((total, s) => total + s.stock, 0);
});

// Setting toObject and toJSON to include virtuals
productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
