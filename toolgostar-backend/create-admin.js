const { User } = require('./src/models');
const bcrypt = require('bcrypt');

async function createAdminUser() {
    try {
        console.log('🔍 Checking if admin user exists...');
        
        // Check if admin user already exists
        const existingAdmin = await User.findByEmail('admin@toolgostar.com');
        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            return existingAdmin;
        }
        
        console.log('👤 Creating admin user...');
        
        // Create admin user
        const adminUser = await User.create({
            email: 'admin@toolgostar.com',
            passwordHash: 'admin123', // This will be hashed by the beforeCreate hook
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            isActive: true
        });
        
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email:', adminUser.email);
        console.log('🔑 Password: admin123');
        console.log('👤 Role:', adminUser.role);
        
        return adminUser;
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        throw error;
    }
}

// Run the function
createAdminUser()
    .then(() => {
        console.log('🎉 Admin user setup complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Failed to create admin user:', error);
        process.exit(1);
    });
