const User = require('../models/User');

/**
 * Initialize admin account on first run
 * Checks if admin exists, creates one if not
 */
const initializeAdmin = async () => {
    try {
        // Check if any admin user exists
        const adminCount = await User.countDocuments();

        if (adminCount > 0) {
            console.log('✓ Admin account already exists');
            return;
        }

        // Get admin credentials from environment variables or use defaults
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@store.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Create default admin account
        const admin = new User({
            email: adminEmail,
            password: adminPassword,
            role: 'admin'
        });

        await admin.save();

        console.log('✓ Default admin account created successfully');
        console.log(`  Email: ${adminEmail}`);
        console.log('  Please change the default password after first login!');
    } catch (error) {
        console.error('✗ Error initializing admin account:', error.message);
        throw error;
    }
};

module.exports = initializeAdmin;
