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
        trim: true,
        lowercase: true
    },
    colors: [
        {
            name: {
                type: String,
                required: [true, 'Color name is required']
            },
            hexCode: {
                type: String,
                default: '#000000' // For visual indicators
            },
            imageUrl: {
                type: String,
                required: [true, 'Color-specific image URL is required']
            },
            sizes: [
                {
                    label: {
                        type: String,
                        required: [true, 'Size label is required']
                    },
                    stock: {
                        type: Number,
                        required: [true, 'Stock quantity for this variant is required'],
                        min: [0, 'Stock cannot be negative'],
                        default: 0
                    },
                    minThreshold: {
                        type: Number,
                        default: 5,
                        min: [0, 'Threshold cannot be negative']
                    }
                }
            ]
        }
    ],
    images: {
        type: [String],
        default: []
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isNewProduct: { // Using isNewProduct to avoid conflict with mongoose's isNew
        type: Boolean,
        default: false
    },
    isOnSale: {
        type: Boolean,
        default: false
    },
    salePrice: {
        type: Number,
        min: [0, 'Sale price cannot be negative']
    },
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
    if (!this.colors || !Array.isArray(this.colors)) return 0;
    return this.colors.reduce((total, color) => {
        if (!color.sizes || !Array.isArray(color.sizes)) return total;
        return total + color.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
    }, 0);
});

// Add a virtual field for discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (this.isOnSale && this.salePrice && this.price > 0) {
        return Math.round(((this.price - this.salePrice) / this.price) * 100);
    }
    return 0;
});

// Setting toObject and toJSON to include virtuals
productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
