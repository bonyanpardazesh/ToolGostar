#!/usr/bin/env node

/**
 * Update Server Configuration Script
 * Updates .env file with actual server information
 */

const fs = require('fs');
const path = require('path');

const serverConfig = {
    domain: 'toolgostar.com',
    ip: '185.88.178.73',
    frontendUrl: 'https://toolgostar.com',
    adminUrl: 'https://toolgostar.com/toolgostar-admin',
    apiUrl: 'https://toolgostar.com:3001/api/v1',
    corsOrigin: 'https://toolgostar.com,http://localhost:3000,http://127.0.0.1:3000'
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
        
        // Update the URLs with actual server information
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
        console.log('🌐 Server Information:');
        console.log(`   Domain: ${serverConfig.domain}`);
        console.log(`   IP: ${serverConfig.ip}`);
        console.log(`   Frontend URL: ${serverConfig.frontendUrl}`);
        console.log(`   Admin URL: ${serverConfig.adminUrl}`);
        console.log(`   API URL: ${serverConfig.apiUrl}`);
        console.log(`   CORS Origins: ${serverConfig.corsOrigin}`);
        console.log('');
        console.log('🎯 Your backend is now configured for toolgostar.com!');
        
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
