const bcrypt = require('bcryptjs');
const Database = require('../database/database');

async function createAdminUser() {
    const db = new Database();
    
    try {
        await db.init();
        console.log('Database initialized');

        // Check if admin already exists
        const existingAdmin = await db.getUserByUsername('admin');
        if (existingAdmin) {
            console.log('Admin user already exists');
            console.log('Username: admin');
            console.log('To reset password, delete the user from the database and run this script again');
            return;
        }

        // Create admin user
        const username = 'admin';
        const password = 'uam2024!'; // Default password - should be changed after first login
        const email = 'admin@uamucalgary.ca';

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const result = await db.createUser(username, passwordHash, email, 'admin');

        console.log('✅ Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: uam2024!');
        console.log('Email: admin@uamucalgary.ca');
        console.log('');
        console.log('⚠️  IMPORTANT: Change the password after first login!');
        console.log('');
        console.log('Access the dashboard at:');
        console.log('- http://localhost:3001/login');
        console.log('- http://10.0.0.124:3001/login (from phone)');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        db.close();
    }
}

// Run if called directly
if (require.main === module) {
    createAdminUser();
}

module.exports = createAdminUser;

