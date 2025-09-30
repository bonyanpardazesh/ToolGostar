#!/usr/bin/env node

/**
 * Server Environment Setup Script
 * Creates production-ready .env file for server deployment
 */

const fs = require('fs');
const path = require('path');

const envContent = `# ToolGostar Backend Environment Configuration
# Production Configuration for Server Environment

# Application Configuration
NODE_ENV=production
PORT=3001
APP_NAME=ToolGostar Industrial Group
APP_VERSION=1.0.0

# Database Configuration
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
DB_LOGGING=false

# SQLite Configuration (Default - No additional setup needed)
# Database file will be created automatically at DB_STORAGE path

# JWT Configuration
JWT_SECRET=eed32686a59088e2c0c5e5424de0cae56006e95da530a2bbe72cb090762af20fdc785b094339a3e04214c8747f195fb29aa51671833cdae869582d4aa2833260
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (SMTP) - IMPORTANT: UPDATE THESE VALUES
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-production-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM_NAME=ToolGostar Industrial Group
EMAIL_FROM_ADDRESS=noreply@toolgostar.com

# Application URLs - IMPORTANT: UPDATE THESE FOR YOUR SERVER
# Replace with your actual server domain/IP
FRONTEND_URL=http://your-server-ip-or-domain
ADMIN_URL=http://your-server-ip-or-domain/toolgostar-admin
API_URL=http://your-server-ip-or-domain:3001/api/v1

# CORS Configuration - IMPORTANT: UPDATE FOR YOUR SERVER
# Add your server domain/IP to allow frontend connections
CORS_ORIGIN=http://your-server-ip-or-domain,http://localhost:3000,http://127.0.0.1:3000

# Admin and Sales Email Addresses
ADMIN_EMAIL=admin@toolgostar.com
SALES_EMAIL=sales@toolgostar.com
SUPPORT_EMAIL=support@toolgostar.com

# Redis Configuration (Optional - for caching and sessions)
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

# Analytics Configuration
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

function createServerEnv() {
    const envPath = path.join(__dirname, '.env');
    
    try {
        // Check if .env already exists
        if (fs.existsSync(envPath)) {
            console.log('⚠️  .env file already exists!');
            console.log('📝 Current .env file will be backed up as .env.backup');
            
            // Backup existing .env
            const backupPath = path.join(__dirname, '.env.backup');
            fs.copyFileSync(envPath, backupPath);
            console.log('✅ Backup created: .env.backup');
        }
        
        // Write new .env file
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Server .env file created successfully!');
        console.log('');
        console.log('🔧 IMPORTANT: Update the following values in .env:');
        console.log('   - FRONTEND_URL: Replace with your server domain/IP');
        console.log('   - ADMIN_URL: Replace with your server domain/IP');
        console.log('   - API_URL: Replace with your server domain/IP');
        console.log('   - CORS_ORIGIN: Add your server domain/IP');
        console.log('   - SMTP_USER: Add your email for contact forms');
        console.log('   - SMTP_PASSWORD: Add your email app password');
        console.log('');
        console.log('📋 Example for server with IP 192.168.1.100:');
        console.log('   FRONTEND_URL=http://192.168.1.100');
        console.log('   ADMIN_URL=http://192.168.1.100/toolgostar-admin');
        console.log('   API_URL=http://192.168.1.100:3001/api/v1');
        console.log('   CORS_ORIGIN=http://192.168.1.100,http://localhost:3000');
        
    } catch (error) {
        console.error('❌ Error creating .env file:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    createServerEnv();
}

module.exports = { createServerEnv };
