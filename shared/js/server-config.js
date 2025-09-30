/**
 * Server-Specific Configuration
 * Override configuration for toolgostar.com server
 */

// Override configuration for toolgostar.com server
if (window.location.hostname === 'toolgostar.com' || window.location.hostname === 'www.toolgostar.com') {
    console.log('🌐 Detected toolgostar.com server - applying production configuration');
    
    // Override the frontend configuration
    if (window.frontendConfig) {
        window.frontendConfig.config.apiBaseUrl = 'https://toolgostar.com:3001/api/v1';
        window.frontendConfig.config.frontendBaseUrl = 'https://toolgostar.com';
        window.frontendConfig.config.environment = 'production';
        window.frontendConfig.config.debug = false;
        
        console.log('✅ Server configuration applied:', {
            apiBaseUrl: window.frontendConfig.config.apiBaseUrl,
            frontendBaseUrl: window.frontendConfig.config.frontendBaseUrl,
            environment: window.frontendConfig.config.environment
        });
    }
    
    // Also set global configuration for immediate use
    window.TOOLGOSTAR_CONFIG = {
        apiBaseUrl: 'https://toolgostar.com:3001/api/v1',
        frontendBaseUrl: 'https://toolgostar.com',
        environment: 'production',
        debug: false
    };
}
