/**
 * Development Configuration
 * Use this to override settings for local development
 */

// Override configuration for local development
window.TOOLGOSTAR_CONFIG = {
    // Set to false to disable API calls and use offline data
    apiEnabled: false,
    
    // Force offline mode for development
    forceOffline: true,
    
    // Development settings
    debug: true,
    environment: 'development'
};

console.log('🔧 Development mode: API disabled, using offline data');
