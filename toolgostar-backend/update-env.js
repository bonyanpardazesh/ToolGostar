/**
 * Update .env file with secure JWT secret
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
  
  // Update other important settings for development
  envContent = envContent.replace('DEBUG=false', 'DEBUG=true');
  envContent = envContent.replace('NODE_ENV=production', 'NODE_ENV=development');
  
  // Write the updated content back
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env file updated successfully!');
  console.log('🔑 JWT secret generated and configured');
  console.log('🛠️  Debug mode enabled for development');
  
} catch (error) {
  console.error('❌ Failed to update .env file:', error.message);
  process.exit(1);
}

