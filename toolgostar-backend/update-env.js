/**
 * Update .env file with secure JWT secret and toolgostar.com configuration
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const jwtSecret = 'eed32686a59088e2c0c5e5424de0cae56006e95da530a2bbe72cb090762af20fdc785b094339a3e04214c8747f195fb29aa51671833cdae869582d4aa2833260';

try {
  // Read the current .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update JWT_SECRET
  envContent = envContent.replace(
    'JWT_SECRET=your-super-secret-jwt-key-change-this-in-production',
    `JWT_SECRET=${jwtSecret}`
  );
  
  // Update URLs for toolgostar.com
  envContent = envContent.replace(
    'FRONTEND_URL=http://localhost:3000',
    'FRONTEND_URL=https://toolgostar.com'
  );
  
  envContent = envContent.replace(
    'ADMIN_URL=http://localhost:3000/toolgostar-admin',
    'ADMIN_URL=https://toolgostar.com/toolgostar-admin'
  );
  
  envContent = envContent.replace(
    'API_URL=http://localhost:3001/api/v1',
    'API_URL=https://toolgostar.com/api/v1'
  );
  
  envContent = envContent.replace(
    'CORS_ORIGIN=http://localhost:3000',
    'CORS_ORIGIN=https://toolgostar.com,https://www.toolgostar.com'
  );
  
  // Update environment to production
  envContent = envContent.replace('NODE_ENV=development', 'NODE_ENV=production');
  envContent = envContent.replace('DEBUG=true', 'DEBUG=false');
  envContent = envContent.replace('MOCK_EMAIL=true', 'MOCK_EMAIL=false');
  
  // Write the updated content back
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env file updated successfully!');
  console.log('🔑 JWT secret generated and configured');
  console.log('🌐 URLs updated for toolgostar.com');
  console.log('🛠️  Production mode enabled');
  console.log('');
  console.log('📋 Updated configuration:');
  console.log('   Frontend URL: https://toolgostar.com');
  console.log('   Admin URL: https://toolgostar.com/toolgostar-admin');
  console.log('   API URL: https://toolgostar.com/api/v1');
  console.log('   CORS Origins: https://toolgostar.com, https://www.toolgostar.com');
  
} catch (error) {
  console.error('❌ Failed to update .env file:', error.message);
  process.exit(1);
}