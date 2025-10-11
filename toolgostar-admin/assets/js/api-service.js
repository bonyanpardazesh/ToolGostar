/**
 * API Service for ToolGostar Admin Panel
 * Handles all API communications with the backend
 */

class APIService {
    constructor() {
        // Use configuration for API URL
        this.baseURL = window.CONFIG ? window.CONFIG.API.getBaseURL() : 'http://localhost:3001/api/v1';
        this.token = localStorage.getItem(window.CONFIG?.AUTH?.TOKEN_KEY || 'toolgostar_token') || 
                     localStorage.getItem(window.CONFIG?.AUTH?.FALLBACK_TOKEN_KEY || 'authToken');
        console.log('🔧 API Service initialized with token:', this.token ? this.token.substring(0, 20) + '...' : 'No token');
        console.log('🌐 API Base URL:', this.baseURL);
        console.log('🔍 Full token:', this.token);
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('toolgostar_token', token);
        localStorage.setItem('authToken', token);
        console.log('🔑 Token set successfully:', token ? token.substring(0, 20) + '...' : 'No token');
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('toolgostar_token');
        localStorage.removeItem('authToken');
    }

    // Get headers for API requests
    getHeaders(includeAuth = true, isFileUpload = false) {
        const headers = {
            'Accept': 'application/json'
        };

        // Don't set Content-Type for file uploads (let browser set it with boundary)
        if (!isFileUpload) {
            headers['Content-Type'] = 'application/json';
        }

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
            console.log('🔑 Using token for request:', this.token.substring(0, 20) + '...');
        } else if (includeAuth) {
            console.log('❌ No token available for authenticated request');
        }
        
        console.log('📤 Request headers:', headers);

        return headers;
    }

    // Generic API request method
    async request(method, endpoint, data = null, requireAuth = true, isFileUpload = false) {
        try {
            const config = {
                method,
                url: `${this.baseURL}${endpoint}`,
                headers: this.getHeaders(requireAuth, isFileUpload),
                timeout: isFileUpload ? 60000 : 10000 // Longer timeout for file uploads
            };

            if (data) {
                if (isFileUpload) {
                    config.data = data;
                } else {
                    config.data = data;
                }
            }

            const response = await axios(config);
            return {
                success: response.data.success !== undefined ? response.data.success : true,
                data: response.data.data !== undefined ? response.data.data : response.data,
                pagination: response.data.pagination,
                status: response.status
            };
        } catch (error) {
            console.error(`API Error [${method} ${endpoint}]:`, error);
            return {
                success: false,
                error: error.response?.data || error.message,
                status: error.response?.status || 0
            };
        }
    }

    // Authentication methods
    async login(email, password) {
        console.log('API Service login called with:', email);
        const result = await this.request('POST', '/auth/login', { email, password }, false);
        console.log('API Service login result:', result);
        if (result.success && result.data?.token) {
            this.setToken(result.data.token);
        }
        return result;
    }

    async logout() {
        const result = await this.request('POST', '/auth/logout');
        this.clearToken();
        return result;
    }

    async getProfile() {
        return await this.request('GET', '/auth/profile');
    }

    async getAuthStatus() {
        return await this.request('GET', '/auth/status', null, false);
    }

    // Health check
    async getHealth() {
        return await this.request('GET', '/health', null, false);
    }

    // Products methods
    async getProducts() {
        return await this.request('GET', '/products', null, false);
    }

    async getProduct(id) {
        return await this.request('GET', `/products/${id}`, null, false);
    }

    async createProduct(productData) {
        return await this.request('POST', '/products', productData, true, true);
    }

    async updateProduct(id, productData) {
        return await this.request('PUT', `/products/${id}`, productData, true, true);
    }

    async deleteProduct(id) {
        return await this.request('DELETE', `/products/${id}`);
    }

    async getProductCategories() {
        return await this.request('GET', '/products/categories', null, false);
    }

    // Projects methods
    async getProjects() {
        return await this.request('GET', '/projects', null, true);
    }

    async getProject(id) {
        return await this.request('GET', `/projects/${id}`, null, false);
    }

    async createProject(projectData) {
        return await this.request('POST', '/projects', projectData);
    }

    async updateProject(id, projectData) {
        return await this.request('PUT', `/projects/${id}`, projectData);
    }

    async deleteProject(id) {
        console.log('🗑️ Deleting project:', id);
        console.log('🔑 Token available:', !!this.token);
        console.log('🔑 Token preview:', this.token ? this.token.substring(0, 20) + '...' : 'No token');
        return await this.request('DELETE', `/projects/${id}`);
    }

    async getProjectCategories() {
        return await this.request('GET', '/projects/categories', null, false);
    }

    // Contact methods
    async getContacts() {
        return await this.request('GET', '/contact');
    }

    async getContact(id) {
        return await this.request('GET', `/contact/${id}`);
    }

    async submitContact(contactData) {
        return await this.request('POST', '/contact/submit', contactData, false);
    }

    async submitQuoteRequest(quoteData) {
        return await this.request('POST', '/contact/quote', quoteData, false);
    }

    async updateContactStatus(id, status) {
        return await this.request('PUT', `/contact/${id}/status`, { status });
    }

    async deleteContact(id) {
        return await this.request('DELETE', `/contact/${id}`);
    }

    async submitQuote(quoteData) {
        return await this.request('POST', '/contact/quote', quoteData, false);
    }

    async getContactStats() {
        return await this.request('GET', '/contact/stats');
    }

    // News Management
    async getNews(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request('GET', `/news${queryString ? '?' + queryString : ''}`);
    }

    async getNewsById(id) {
        return await this.request('GET', `/news/${id}`);
    }

    async getNewsBySlug(slug) {
        return await this.request('GET', `/news/slug/${slug}`);
    }

    async createNews(newsData) {
        return await this.request('POST', '/news', newsData);
    }

    async updateNews(id, newsData) {
        return await this.request('PUT', `/news/${id}`, newsData);
    }

    async deleteNews(id) {
        return await this.request('DELETE', `/news/${id}`);
    }

    async getNewsCategories() {
        return await this.request('GET', '/news/categories');
    }

    async getFeaturedNews(limit = 5) {
        return await this.request('GET', `/news/featured?limit=${limit}`);
    }

    async getNewsStats() {
        return await this.request('GET', '/news/stats');
    }

    // Media Management
    async getMedia(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request('GET', `/media${queryString ? '?' + queryString : ''}`);
    }

    async getMediaById(id) {
        return await this.request('GET', `/media/${id}`);
    }

    async uploadMedia(formData) {
        return await this.request('POST', '/media/upload', formData, true, true);
    }

    async updateMedia(id, mediaData) {
        return await this.request('PUT', `/media/${id}`, mediaData);
    }

    async deleteMedia(id) {
        return await this.request('DELETE', `/media/${id}`);
    }

    async getMediaStats() {
        return await this.request('GET', '/media/stats');
    }

    async getMediaByType(type, limit = 50) {
        return await this.request('GET', `/media/types/${type}?limit=${limit}`);
    }

    // Quote Management
    async getQuotes(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request('GET', `/quotes${queryString ? '?' + queryString : ''}`);
    }

    async getQuoteById(id) {
        return await this.request('GET', `/quotes/${id}`);
    }

    async updateQuote(id, quoteData) {
        return await this.request('PUT', `/quotes/${id}`, quoteData);
    }

    async deleteQuote(id) {
        return await this.request('DELETE', `/quotes/${id}`);
    }

    async updateQuoteStatus(id, status, notes = '') {
        return await this.request('PUT', `/quotes/${id}/status`, { status, notes });
    }

    async assignQuote(id, assignedTo) {
        return await this.request('PUT', `/quotes/${id}/assign`, { assignedTo });
    }

    async getQuoteStats() {
        return await this.request('GET', '/quotes/stats');
    }

    async exportQuotes(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request('GET', `/quotes/export${queryString ? '?' + queryString : ''}`);
    }

    // Site Settings Management
    async getSettings(category = null) {
        const params = category ? `?category=${category}` : '';
        return await this.request('GET', `/settings${params}`);
    }

    async getSettingByKey(key) {
        return await this.request('GET', `/settings/${key}`);
    }

    async updateSetting(key, value, type = null) {
        const data = { value };
        if (type) data.type = type;
        return await this.request('PUT', `/settings/${key}`, data);
    }

    async createSetting(key, value, type = 'string', category = 'general', description = '') {
        return await this.request('POST', '/settings', {
            key, value, type, category, description
        });
    }

    async deleteSetting(key) {
        return await this.request('DELETE', `/settings/${key}`);
    }

    async updateBulkSettings(settings) {
        return await this.request('PUT', '/settings/bulk', { settings });
    }

    async getSettingCategories() {
        return await this.request('GET', '/settings/categories');
    }

    async exportSettings() {
        return await this.request('GET', '/settings/export');
    }

    async importSettings(settings, overwrite = false) {
        return await this.request('POST', '/settings/import', { settings, overwrite });
    }

    // User Management
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request('GET', `/users${queryString ? '?' + queryString : ''}`);
    }

    async getUserById(id) {
        return await this.request('GET', `/users/${id}`);
    }

    async createUser(userData) {
        return await this.request('POST', '/users', userData);
    }

    async updateUser(id, userData) {
        return await this.request('PUT', `/users/${id}`, userData);
    }

    async deleteUser(id) {
        return await this.request('DELETE', `/users/${id}`);
    }

    async updateUserStatus(id, isActive) {
        return await this.request('PUT', `/users/${id}/status`, { isActive });
    }

    async resetUserPassword(id, newPassword) {
        return await this.request('PUT', `/users/${id}/password`, { newPassword });
    }

    async getUserStats() {
        return await this.request('GET', '/users/stats');
    }

    async exportUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request('GET', `/users/export${queryString ? '?' + queryString : ''}`);
    }

    // Dashboard methods
    async getDashboardData() {
        try {
            // Fetch all data in parallel for better performance
            const [productsResult, projectsResult, contactsResult, healthResult] = await Promise.all([
                this.getProducts(),
                this.getProjects(),
                this.getContacts(),
                this.getHealth()
            ]);

            // Calculate statistics
            const totalProducts = productsResult.success ? productsResult.data?.length || 0 : 0;
            const totalProjects = projectsResult.success ? projectsResult.data?.length || 0 : 0;
            
            let newContacts = 0;
            let pendingQuotes = 0;
            
            if (contactsResult.success && contactsResult.data.contacts) {
                const contacts = contactsResult.data.contacts;
                newContacts = contacts.filter(contact => 
                    contact.status === 'new' || contact.status === 'in_progress'
                ).length;
                
                // For now, we'll count all contacts as pending quotes since we don't have a separate quote system yet
                pendingQuotes = contacts.length;
            }

            return {
                success: true,
                data: {
                    totalProducts,
                    totalProjects,
                    newContacts,
                    pendingQuotes,
                    systemStatus: healthResult.success ? 'online' : 'offline',
                    lastUpdated: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Dashboard data fetch error:', error);
            return {
                success: false,
                error: error.message,
                data: {
                    totalProducts: 0,
                    totalProjects: 0,
                    newContacts: 0,
                    pendingQuotes: 0,
                    systemStatus: 'offline',
                    lastUpdated: new Date().toISOString()
                }
            };
        }
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token;
    }

    getToken() {
        return this.token;
    }

    // Error handling
    handleError(error, context = '') {
        console.error(`API Error ${context}:`, error);
        
        if (error.status === 401) {
            // Unauthorized - redirect to login
            this.clearToken();
            window.location.href = 'login.html';
            return;
        }
        
        if (error.status === 403) {
            // Forbidden - show access denied message
            this.showNotification('Access denied. You do not have permission to perform this action.', 'error');
            return;
        }
        
        if (error.status >= 500) {
            // Server error
            this.showNotification('Server error. Please try again later.', 'error');
            return;
        }
        
        // Default error message
        this.showNotification(error.message || 'An error occurred. Please try again.', 'error');
    }

    // Notification system
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Create global API service instance
window.apiService = new APIService();
