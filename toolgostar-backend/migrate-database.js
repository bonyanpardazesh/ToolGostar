/**
 * Database Migration Script
 * Creates tables for new models
 */

const { sequelize } = require('./src/config/database');
const { ContactAnalytics, QuoteRequest } = require('./src/models');

async function migrateDatabase() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    
    console.log('✅ Database migration completed successfully!');
    console.log('📊 Tables created/updated:');
    console.log('   - contact_analytics');
    console.log('   - quote_requests');
    console.log('   - contacts (updated)');
    
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateDatabase();
}

module.exports = migrateDatabase;

