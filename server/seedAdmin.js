const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        const name = process.env.ADMIN_NAME || 'System Admin';
        const phone = process.env.ADMIN_PHONE || '9999999999';
        const location = process.env.ADMIN_LOCATION || 'Chennai';

        if (!email || !password) {
            console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD are required in environment variables');
            process.exit(1);
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminData = {
            name,
            email: email,
            password: hashedPassword,
            role: 'admin',
            phone,
            location
        };

        const result = await User.findOneAndUpdate(
            { email },
            { $set: adminData },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const action = result ? 'created/updated' : 'processed';
        console.log(`🚀 Admin user ${action} successfully!`);
        console.log(`Email: ${email}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating admin:', err.message);
        process.exit(1);
    }
};

createAdmin();
