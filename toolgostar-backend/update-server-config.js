#!/usr/bin/env node

/**
 * Update Server Configuration Script
 * Updates .env file with toolgostar.com server information
 */

const fs = require('fs');
const path = require('path');

const serverConfig = {
    domain: 'toolgostar.com',
    frontendUrl: 'https://toolgostar.com',
    adminUrl: 'https://toolgostar.com/toolgostar-admin',
    apiUrl: 'https://toolgostar.com/api/v1',
    corsOrigin: 'https://toolgostar.com,https://www.toolgostar.com'
};

function updateEnvFile() {
    const envPath = path.join(__dirname, '.env');
    
    try {
        if (!fs.existsSync(envPath)) {
            console.log('❌ .env file not found! Run setup-server-env.js first.');
            return;
        }
        
        // Read current .env file
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Update the URLs with toolgostar.com information
        envContent = envContent.replace(
            /FRONTEND_URL=.*/,
            `FRONTEND_URL=${serverConfig.frontendUrl}`
        );
        
        envContent = envContent.replace(
            /ADMIN_URL=.*/,
            `ADMIN_URL=${serverConfig.adminUrl}`
        );
        
        envContent = envContent.replace(
            /API_URL=.*/,
            `API_URL=${serverConfig.apiUrl}`
        );
        
        envContent = envContent.replace(
            /CORS_ORIGIN=.*/,
            `CORS_ORIGIN=${serverConfig.corsOrigin}`
        );
        
        // Write updated .env file
        fs.writeFileSync(envPath, envContent);
        
        console.log('✅ Server configuration updated successfully!');
        console.log('');
        console.log('🌐 ToolGostar.com Configuration:');
        console.log(`   Domain: ${serverConfig.domain}`);
        console.log(`   Frontend URL: ${serverConfig.frontendUrl}`);
        console.log(`   Admin URL: ${serverConfig.adminUrl}`);
        console.log(`   API URL: ${serverConfig.apiUrl}`);
        console.log(`   CORS Origins: ${serverConfig.corsOrigin}`);
        console.log('');
        console.log('🎯 Your backend is now configured for toolgostar.com!');
        console.log('');
        console.log('📋 Next steps:');
        console.log('   1. Update SMTP credentials in .env');
        console.log('   2. Add Google Analytics ID if needed');
        console.log('   3. Add Facebook Pixel ID if needed');
        console.log('   4. Update WhatsApp URL with your number');
        console.log('   5. Start your backend server');
        
    } catch (error) {
        console.error('❌ Error updating .env file:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    updateEnvFile();
}

module.exports = { updateEnvFile, serverConfig };