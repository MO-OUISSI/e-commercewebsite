const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true,
        unique: true, // e.g., 'hero', 'about', 'banner'
        trim: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed, // Flexible structure for different sections
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

contentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Content', contentSchema);
