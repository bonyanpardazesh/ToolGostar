/**
 * Frontend Configuration
 * Centralized configuration for API endpoints and server settings
 */

class FrontendConfig {
    constructor() {
        this.config = this.loadConfig();
    }

    loadConfig() {
        // Try to get configuration from multiple sources
        const config = {
            // Default configuration
            apiBaseUrl: 'https://toolgostar.com/api/v1',
            frontendBaseUrl: 'https://toolgostar.com',
            environment: 'production',
            debug: false
        };

        // Check for environment-specific configuration
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;

        // Production server detection
        if (hostname === 'toolgostar.com' || hostname === 'www.toolgostar.com') {
            config.environment = 'production';
            config.debug = false;
            config.apiBaseUrl = 'https://toolgostar.com:3001/api/v1';
            config.frontendBaseUrl = 'https://toolgostar.com';
        }
        // Development environment detection
        else if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168')) {
            config.environment = 'development';
            config.debug = true;
            
            // Use current server for API calls in development
            if (port) {
                config.apiBaseUrl = `${protocol}//${hostname}:${port}/api/v1`;
            } else {
                config.apiBaseUrl = `${protocol}//${hostname}/api/v1`;
            }
            config.frontendBaseUrl = `${protocol}//${hostname}${port ? ':' + port : ''}`;
        }

        // Check for custom configuration in window object
        if (window.TOOLGOSTAR_CONFIG) {
            Object.assign(config, window.TOOLGOSTAR_CONFIG);
        }

        // Check for configuration in meta tags
        const apiUrlMeta = document.querySelector('meta[name="api-base-url"]');
        if (apiUrlMeta) {
            config.apiBaseUrl = apiUrlMeta.getAttribute('content');
        }

        const frontendUrlMeta = document.querySelector('meta[name="frontend-base-url"]');
        if (frontendUrlMeta) {
            config.frontendBaseUrl = frontendUrlMeta.getAttribute('content');
        }

        console.log('🔧 Frontend Configuration:', config);
        return config;
    }

    getApiBaseUrl() {
        return this.config.apiBaseUrl;
    }

    getFrontendBaseUrl() {
        return this.config.frontendBaseUrl;
    }

    getImageUrl(imagePath) {
        if (!imagePath) return '';
        
        // If it's already a full URL, return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // If it starts with /, it's an absolute path from the API base
        if (imagePath.startsWith('/')) {
            return `${this.config.apiBaseUrl.replace('/api/v1', '')}${imagePath}`;
        }
        
        // Otherwise, it's a relative path
        return `${this.config.apiBaseUrl.replace('/api/v1', '')}/${imagePath}`;
    }

    isDevelopment() {
        return this.config.environment === 'development';
    }

    isDebug() {
        return this.config.debug;
    }
}

// Create global instance
window.frontendConfig = new FrontendConfig();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrontendConfig;
}
