#!/usr/bin/env node

/**
 * ToolGostar.com Deployment Script
 * Automated deployment configuration for toolgostar.com
 */

const fs = require('fs');
const path = require('path');

const deploymentConfig = {
    domain: 'toolgostar.com',
    frontendUrl: 'https://toolgostar.com',
    adminUrl: 'https://toolgostar.com/toolgostar-admin',
    apiUrl: 'https://toolgostar.com:3001/api/v1',
    corsOrigin: 'https://toolgostar.com,https://www.toolgostar.com',
    environment: 'production'
};

function createProductionEnv() {
    const envPath = path.join(__dirname, '.env');
    const backupPath = path.join(__dirname, '.env.backup');
    
    try {
        // Backup existing .env if it exists
        if (fs.existsSync(envPath)) {
            fs.copyFileSync(envPath, backupPath);
            console.log('✅ Existing .env backed up as .env.backup');
        }
        
        // Create production .env content
        const envContent = `# ToolGostar Backend Environment Configuration
# Production Configuration for toolgostar.com

# Application Configuration
NODE_ENV=${deploymentConfig.environment}
PORT=3001
APP_NAME=ToolGostar Industrial Group
APP_VERSION=1.0.0

# Database Configuration
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
DB_LOGGING=false

# JWT Configuration
JWT_SECRET=eed32686a59088e2c0c5e5424de0cae56006e95da530a2bbe72cb090762af20fdc785b094339a3e04214c8747f195fb29aa51671833cdae869582d4aa2833260
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (SMTP) - UPDATE THESE VALUES
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-production-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM_NAME=ToolGostar Industrial Group
EMAIL_FROM_ADDRESS=noreply@toolgostar.com

# Application URLs - CONFIGURED FOR TOOLGOSTAR.COM
FRONTEND_URL=${deploymentConfig.frontendUrl}
ADMIN_URL=${deploymentConfig.adminUrl}
API_URL=${deploymentConfig.apiUrl}

# CORS Configuration - CONFIGURED FOR TOOLGOSTAR.COM
CORS_ORIGIN=${deploymentConfig.corsOrigin}

# Admin and Sales Email Addresses
ADMIN_EMAIL=admin@toolgostar.com
SALES_EMAIL=sales@toolgostar.com
SUPPORT_EMAIL=support@toolgostar.com

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# File Upload Configuration
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=100
CONTACT_RATE_LIMIT_MAX=5
QUOTE_RATE_LIMIT_MAX=2

# Security Configuration
HELMET_ENABLED=true
COMPRESSION_ENABLED=true

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5

# Analytics Configuration - ADD YOUR IDs
GOOGLE_ANALYTICS_ID=
FACEBOOK_PIXEL_ID=

# Social Media Configuration
FACEBOOK_URL=https://facebook.com/toolgostar
LINKEDIN_URL=https://linkedin.com/company/toolgostar
WHATSAPP_URL=https://wa.me/your-whatsapp-number
TELEGRAM_URL=https://t.me/toolgostar

# Company Information
COMPANY_NAME=ToolGostar Industrial Group
COMPANY_ADDRESS=No. 10, Soheil Complex, Alameh Tabatabaie St, Saadat Abad, Tehran, Iran
COMPANY_PHONE=+98-21-22357761-3
COMPANY_FAX=+98-21-22357762
COMPANY_MOBILE=+98-910-810-8132
COMPANY_EMAIL=toolgostar@yahoo.com
COMPANY_WEBSITE=https://toolgostar.com

# Factory Information
FACTORY_ADDRESS=Sanat 3 St, Takestan, Ghazvin, Iran
FACTORY_PHONE=+98-28-32234567

# Business Hours
BUSINESS_HOURS_SAT_WED=8:00 AM - 5:00 PM
BUSINESS_HOURS_THU=8:00 AM - 1:00 PM
BUSINESS_HOURS_FRI=Closed
TIMEZONE=Asia/Tehran

# Production Settings
DEBUG=false
MOCK_EMAIL=false`;

        // Write the .env file
        fs.writeFileSync(envPath, envContent);
        
        console.log('✅ Production .env file created successfully!');
        console.log('');
        console.log('🌐 ToolGostar.com Configuration:');
        console.log(`   Domain: ${deploymentConfig.domain}`);
        console.log(`   Frontend URL: ${deploymentConfig.frontendUrl}`);
        console.log(`   Admin URL: ${deploymentConfig.adminUrl}`);
        console.log(`   API URL: ${deploymentConfig.apiUrl}`);
        console.log(`   CORS Origins: ${deploymentConfig.corsOrigin}`);
        console.log('');
        console.log('🔧 IMPORTANT: Update the following values in .env:');
        console.log('   - SMTP_USER: Add your email for contact forms');
        console.log('   - SMTP_PASSWORD: Add your email app password');
        console.log('   - GOOGLE_ANALYTICS_ID: Add your Google Analytics ID');
        console.log('   - FACEBOOK_PIXEL_ID: Add your Facebook Pixel ID');
        console.log('   - WHATSAPP_URL: Update with your WhatsApp number');
        console.log('');
        console.log('📋 Deployment Checklist:');
        console.log('   ✅ Environment configured for toolgostar.com');
        console.log('   ✅ JWT secret generated');
        console.log('   ✅ URLs updated for production');
        console.log('   ✅ CORS configured for toolgostar.com');
        console.log('   ⚠️  Update email credentials');
        console.log('   ⚠️  Add analytics IDs if needed');
        console.log('   ⚠️  Update social media URLs');
        console.log('');
        console.log('🚀 Ready for deployment to toolgostar.com!');
        
    } catch (error) {
        console.error('❌ Error creating production .env file:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    createProductionEnv();
}

module.exports = { createProductionEnv, deploymentConfig };
