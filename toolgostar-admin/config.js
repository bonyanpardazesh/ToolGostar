/**
 * Configuration for ToolGostar Admin Panel
 * Modify these settings for different environments
 */

const CONFIG = {
    // API Configuration
    API: {
        // Development API URL (when running locally)
        DEV_URL: 'http://localhost:3001/api/v1',
        
        // Production API URL (when deployed to toolgostar.com)
        PROD_URL: 'https://toolgostar.com/api/v1',
        
        // Auto-detect environment based on hostname
        getBaseURL: function() {
            const hostname = window.location.hostname;
            
            // Check if localhost
            const isLocalhost = hostname === 'localhost' || 
                               hostname === '127.0.0.1' ||
                               hostname === '0.0.0.0';
            
            // Return appropriate URL based on environment
            if (isLocalhost) {
                return this.DEV_URL;
            } else if (hostname === 'toolgostar.com' || hostname === 'www.toolgostar.com') {
                return this.PROD_URL;
            } else {
                // For any other server, use standard API path (assumes Nginx proxy)
                const protocol = window.location.protocol;
                return `${protocol}//${hostname}/api/v1`;
            }
        }
    },
    
    // Authentication Configuration
    AUTH: {
        TOKEN_KEY: 'toolgostar_token',
        FALLBACK_TOKEN_KEY: 'authToken'
    },
    
    // Application Configuration
    APP: {
        NAME: 'ToolGostar Admin Panel',
        VERSION: '1.0.0'
    }
};

// Make CONFIG available globally
window.CONFIG = CONFIG;
