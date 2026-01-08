const Content = require('../models/Content');

// Get content by section
exports.getContent = async (req, res, next) => {
    try {
        const { section } = req.params;
        const content = await Content.findOne({ section });

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content section not found'
            });
        }

        res.status(200).json({
            success: true,
            data: content.data
        });
    } catch (error) {
        next(error);
    }
};

// Update content by section
exports.updateContent = async (req, res, next) => {
    try {
        const { section } = req.params;
        const { data } = req.body;

        const content = await Content.findOneAndUpdate(
            { section },
            { section, data, updatedAt: Date.now() },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Content updated successfully',
            data: content.data
        });
    } catch (error) {
        next(error);
    }
};
