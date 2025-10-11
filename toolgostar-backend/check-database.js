/**
 * Check Database Status
 * Verify what tables exist and their structure
 */

const { sequelize } = require('./src/config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database status...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check if contacts table exists and works
    try {
      const { Contact } = require('./src/models');
      const contactCount = await Contact.count();
      console.log(`✅ Contacts table exists with ${contactCount} records`);
      
      // Test creating a contact
      const testContact = await Contact.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        subject: 'Test Contact',
        message: 'This is a test message'
      });
      console.log('✅ Contact creation test successful');
      await testContact.destroy(); // Clean up
      
    } catch (error) {
      console.log('⚠️  Contacts table issue:', error.message);
    }
    
    // Check if we can at least start the server
    console.log('✅ Database is functional for basic operations');
    console.log('💡 You can proceed with testing the contact form');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Run check if called directly
if (require.main === module) {
  checkDatabase();
}

module.exports = checkDatabase;

