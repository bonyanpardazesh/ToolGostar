/**
 * Configuration for ToolGostar Admin Panel
 * Modify these settings for different environments
 */

const CONFIG = {
    // API Configuration
    API: {
        // Development API URL (when running locally)
        DEV_URL: 'http://localhost:3001/api/v1',
        
        // Production API URL (when deployed)
        PROD_URL: 'https://toolgostar.com/api/v1',
        
        // Auto-detect environment based on hostname
        getBaseURL: function() {
            const isLocalhost = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1' ||
                               window.location.hostname === '0.0.0.0';
            
            return isLocalhost ? this.DEV_URL : this.PROD_URL;
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
