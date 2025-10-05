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
            // Default configuration (for production fallback)
            apiBaseUrl: 'https://toolgostar.com/api/v1',
            frontendBaseUrl: 'https://toolgostar.com',
            environment: 'production',
            debug: false,
            apiEnabled: true
        };

        // Check for environment-specific configuration
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;

        // Production server detection
        if (hostname === 'toolgostar.com' || hostname === 'www.toolgostar.com') {
            config.environment = 'production';
            config.debug = false;
            config.apiBaseUrl = 'https://toolgostar.com/api/v1';
            config.frontendBaseUrl = 'https://toolgostar.com';
            config.apiEnabled = true;
        }
        // Any other server (staging, testing, etc.)
        else if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('192.168')) {
            config.environment = 'production';
            config.debug = false;
            // Use standard API path without port (assumes Nginx proxy)
            config.apiBaseUrl = `${protocol}//${hostname}/api/v1`;
            config.frontendBaseUrl = `${protocol}//${hostname}`;
            config.apiEnabled = true;
        }
        // Development environment detection
        else if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168')) {
            config.environment = 'development';
            config.debug = true;
            
            // Check if backend is running on port 3001
            config.apiBaseUrl = 'http://localhost:3001/api/v1';
            config.frontendBaseUrl = `${protocol}//${hostname}${port ? ':' + port : ''}`;
            config.apiEnabled = true;
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

    isApiEnabled() {
        return this.config.apiEnabled;
    }

    async checkApiConnection() {
        if (!this.isApiEnabled()) {
            return false;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch(`${this.config.apiBaseUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('🌐 API connection timeout, using offline mode');
            } else {
                console.log('🌐 API not available, using offline mode');
            }
            return false;
        }
    }
}

// Create global instance
window.frontendConfig = new FrontendConfig();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrontendConfig;
}
