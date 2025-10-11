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
            const hostname = window.location.hostname;
            const isLocalhost = hostname === 'localhost' || 
                               hostname === '127.0.0.1' ||
                               hostname === '0.0.0.0' ||
                               hostname.includes('192.168');
            
            const isProduction = hostname === 'toolgostar.com' || hostname === 'www.toolgostar.com';
            
            console.log('🔧 Admin Panel - Detected hostname:', hostname);
            console.log('🔧 Admin Panel - Is localhost:', isLocalhost);
            console.log('🔧 Admin Panel - Is production:', isProduction);
            
            if (isLocalhost) {
                console.log('🔧 Admin Panel - Using DEV URL:', this.DEV_URL);
                return this.DEV_URL;
            } else if (isProduction) {
                console.log('🔧 Admin Panel - Using PROD URL:', this.PROD_URL);
                return this.PROD_URL;
            } else {
                // Fallback to production for any other domain
                console.log('🔧 Admin Panel - Using PROD URL (fallback):', this.PROD_URL);
                return this.PROD_URL;
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
