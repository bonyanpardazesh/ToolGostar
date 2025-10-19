/**
 * Frontend API Integration
 * Handles communication with ToolGostar Backend API
 */

class ToolGostarAPI {
    constructor() {
        this.baseURL = window.frontendConfig.getApiBaseUrl();
        this.isOnline = false;
        this.checkConnection();
    }

    /**
     * Check if backend is available
     */
    async checkConnection() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            this.isOnline = response.ok;
            console.log('🌐 Backend connection:', this.isOnline ? 'Online' : 'Offline');
        } catch (error) {
            this.isOnline = false;
            console.log('🌐 Backend connection: Offline');
        }
        return this.isOnline;
    }

    /**
     * Submit contact form
     */
    async submitContact(formData) {
        if (!this.isOnline) {
            throw new Error('Backend server is not available. Please try again later.');
        }

        try {
            console.log('📤 Sending contact data to API:', JSON.stringify(formData, null, 2));
            
            const response = await fetch(`${this.baseURL}/contact/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('📡 API Response status:', response.status);
            console.log('📡 API Response headers:', response.headers);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ API Error response:', errorData);
                throw new Error(errorData.message || 'Failed to submit contact form');
            }

            const result = await response.json();
            console.log('✅ API Success response:', result);
            return result;
        } catch (error) {
            console.error('Contact form submission error:', error);
            throw error;
        }
    }

    /**
     * Submit quote request
     */
    async submitQuoteRequest(quoteData) {
        if (!this.isOnline) {
            throw new Error('Backend server is not available. Please try again later.');
        }

        try {
            const response = await fetch(`${this.baseURL}/contact/quote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(quoteData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit quote request');
            }

            return await response.json();
        } catch (error) {
            console.error('Quote request submission error:', error);
            throw error;
        }
    }

    /**
     * Get products
     */
    async getProducts() {
        try {
            const response = await fetch(`${this.baseURL}/products`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const result = await response.json();
            
            // Handle the API response structure
            if (result.success && result.data) {
                return {
                    products: result.data,
                    pagination: result.pagination,
                    success: true
                };
            } else if (result.products) {
                // Fallback for different response structure
                return {
                    products: result.products,
                    pagination: result.pagination,
                    success: true
                };
            } else {
                return { products: [], offline: false };
            }
        } catch (error) {
            console.error('Products fetch error:', error);
            return { products: [], offline: true };
        }
    }

    /**
     * Get single product by ID
     */
    async getProduct(productId) {
        if (!this.isOnline) {
            throw new Error('Backend server is not available. Please try again later.');
        }

        try {
            const response = await fetch(`${this.baseURL}/products/${productId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch product details');
            }

            const result = await response.json();
            
            // Handle the API response structure
            if (result.success && result.data) {
                return result.data;
            } else {
                throw new Error('Invalid product data received');
            }
        } catch (error) {
            console.error('Product fetch error:', error);
            throw error;
        }
    }

    /**
     * Get projects
     */
    async getProjects() {
        try {
            const response = await fetch(`${this.baseURL}/projects`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }

            const result = await response.json();
            
            // Handle the API response structure
            if (result.success && result.data) {
                return {
                    projects: result.data,
                    pagination: result.pagination,
                    success: true
                };
            } else if (result.projects) {
                // Fallback for different response structure
                return {
                    projects: result.projects,
                    pagination: result.pagination,
                    success: true
                };
            } else {
                return { projects: [], offline: false };
            }
        } catch (error) {
            console.error('Projects fetch error:', error);
            return { projects: [], offline: true };
        }
    }

    /**
     * Get news
     */
    async getNews() {
        try {
            const response = await fetch(`${this.baseURL}/news`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch news');
            }

            const result = await response.json();
            
            // Handle the API response structure
            if (result.success && result.data && result.data.news) {
                return {
                    news: result.data.news,
                    pagination: result.data.pagination,
                    success: true
                };
            } else if (result.news) {
                // Fallback for different response structure
                return {
                    news: result.news,
                    pagination: result.pagination,
                    success: true
                };
            } else {
                return { news: [], offline: false };
            }
        } catch (error) {
            console.error('News fetch error:', error);
            return { news: [], offline: true };
        }
    }
}

/**
 * Form Handler Class
 */
class FormHandler {
    constructor(apiInstance) {
        this.api = apiInstance || new ToolGostarAPI();
        // Wait for DOM to be ready before setting up forms
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupForms());
        } else {
            this.setupForms();
        }
    }

    setupForms() {
        const form = document.getElementById('contactForm');
        console.log('🔍 Contact form element:', form);
        if (form) {
            console.log('✅ Contact form found, adding event listener');
            // On the contact page, we only handle the general contact submission.
            form.addEventListener('submit', (e) => this.handleContactSubmit(e, form));
        } else {
            console.error('❌ Contact form not found!');
        }

        const quoteForm = document.getElementById('quoteForm'); // Assuming a dedicated quote form would have this ID
        if (quoteForm) {
            quoteForm.addEventListener('submit', (e) => this.handleQuoteSubmit(e, quoteForm));
        }
    }

    setupContactForm() {
        // This method is now obsolete and replaced by the more specific setupForms logic.
        // It's kept here to avoid breaking other parts of the site that might call it.
    }

    setupQuoteForm() {
        // This method is now obsolete and replaced by the more specific setupForms logic.
    }

    async handleContactSubmit(e, form) {
        console.log('🚀 Contact form submit event triggered');
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        console.log('🔍 Submit button found:', submitBtn);
        
        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Collect form data
            const formData = this.collectFormData(form);
            
            // Structure data according to backend expectations
            const structuredData = this.structureContactData(formData);
            
            // Submit to API
            const result = await this.api.submitContact(structuredData);
            
            // Show success message
            this.showFormMessage(form, 'Thank you! Your message has been sent successfully. We will contact you soon.', 'success');
            form.reset();
            
        } catch (error) {
            console.error('Contact form error:', error);
            
            // Show error message
            this.showFormMessage(form, error.message || 'Failed to send message. Please try again.', 'error');
            
        } finally {
            // Restore button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleQuoteSubmit(e, form) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Collect form data
            const formData = this.collectFormData(form);
            
            // Structure data for quote request
            const quoteData = this.structureQuoteData(formData);
            
            // Submit to API
            const result = await this.api.submitQuoteRequest(quoteData);
            
            // Show success message
            this.showFormMessage(form, 'Thank you! Your quote request has been submitted successfully. We will contact you within 24 hours.', 'success');
            form.reset();
            
        } catch (error) {
            console.error('Quote form error:', error);
            
            // Show error message
            this.showFormMessage(form, error.message || 'Failed to submit quote request. Please try again.', 'error');
            
        } finally {
            // Restore button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    collectFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    structureContactData(formData) {
        // Structure data according to backend API expectations
        const nameParts = (formData.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Validate required fields
        if (!formData.firstName || formData.firstName.trim() === '') {
            throw new Error('First name is required');
        }
        if (!formData.lastName || formData.lastName.trim() === '') {
            throw new Error('Last name is required');
        }
        if (!formData.email || formData.email.trim() === '') {
            throw new Error('Email is required');
        }
        if (!formData.subject || formData.subject.trim() === '') {
            throw new Error('Subject is required');
        }
        if (formData.subject && formData.subject.trim().length < 5) {
            throw new Error('Subject must be at least 5 characters long');
        }
        if (formData.subject && formData.subject.trim().length > 255) {
            throw new Error('Subject cannot exceed 255 characters');
        }
        if (!formData.message || formData.message.trim() === '') {
            throw new Error('Message is required');
        }

        const structuredData = {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            phone: formData.phone ? formData.phone.trim() : '',
            company: formData.company ? formData.company.trim() : '',
            industry: formData.industry && formData.industry !== '' ? formData.industry : 'other',
            projectType: formData.projectType && formData.projectType !== '' ? this.mapProjectType(formData.projectType) : 'new-installation',
            subject: formData.subject.trim(),
            message: formData.message.trim(),
            urgency: 'medium',
            preferredContactMethod: 'email',
            source: 'website',
            gdprConsent: true,
            marketingConsent: false,
            capacity: formData.capacity ? formData.capacity.trim() : '',
            budget: formData.budget && formData.budget !== '' ? formData.budget : 'not_specified',
            timeline: formData.timeline && formData.timeline !== '' ? formData.timeline : 'not_specified'
        };
        
        console.log('🔍 Form data received:', formData);
        console.log('🔍 Structured data being sent:', structuredData);
        
        return structuredData;
    }

    structureQuoteData(formData) {
        // Structure data according to backend API expectations
        return {
            contactInfo: {
                firstName: formData.firstName || formData.name?.split(' ')[0] || '',
                lastName: formData.lastName || formData.name?.split(' ').slice(1).join(' ') || '',
                email: formData.email,
                phone: formData.phone || '',
                company: formData.company || 'Not specified',
                industry: formData.industry || 'other',
                address: {
                    street: formData.street || 'Not specified',
                    city: formData.city || 'Not specified',
                    country: formData.country || 'Iran',
                    postalCode: formData.postalCode || '00000'
                }
            },
            projectDetails: {
                projectType: this.mapProjectType(formData.project || formData.projectType),
                applicationArea: this.mapApplicationArea(formData.category),
                requiredCapacity: formData.capacity || formData.requiredCapacity || 'Not specified',
                budget: formData.budget || 'not_specified',
                timeline: formData.timeline || 'not_specified',
                additionalRequirements: formData.message || ''
            },
            gdprConsent: true
        };
    }

    mapProjectType(frontendValue) {
        const mapping = {
            'new-installation': 'new-installation',
            'upgrade': 'upgrade',
            'maintenance': 'maintenance',
            'consultation': 'consultation',
            'spare-parts': 'other'
        };
        return mapping[frontendValue] || 'new-installation';
    }

    mapApplicationArea(frontendValue) {
        const mapping = {
            'water-wastewater': 'wastewater',
            'mixers-aerators': 'industrial_process',
            'pumps-submersible': 'industrial_process'
        };
        return mapping[frontendValue] || 'other';
    }

    showFormMessage(form, message, type) {
        // Remove existing messages
        const existingMessage = form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message form-message--${type}`;
        messageDiv.textContent = message;
        
        // Add to form
        form.appendChild(messageDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

/**
 * Data Loader Class
 */
class DataLoader {
    constructor(apiInstance) {
        this.api = apiInstance || new ToolGostarAPI();
    }

    async loadProducts() {
        try {
            const result = await this.api.getProducts();
            if (result.products && result.products.length > 0) {
                this.displayProducts(result.products);
            } else if (result.offline) {
                console.log('📦 Products: Using offline data');
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    }

    async loadProjects() {
        try {
            const result = await this.api.getProjects();
            if (result.projects && result.projects.length > 0) {
                this.displayProjects(result.projects);
            } else if (result.offline) {
                console.log('🏗️ Projects: Using offline data');
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    }

    async loadNews() {
        try {
            const result = await this.api.getNews();
            if (result.news && result.news.length > 0) {
                this.displayNews(result.news);
            } else if (result.offline) {
                console.log('📰 News: Using offline data');
            }
        } catch (error) {
            console.error('Failed to load news:', error);
        }
    }

    displayProducts(products) {
        // Implementation for displaying products
        console.log('📦 Displaying products:', products.length);
    }

    displayProjects(projects) {
        // Implementation for displaying projects
        console.log('🏗️ Displaying projects:', projects.length);
    }

    displayNews(news) {
        // Implementation for displaying news
        console.log('📰 Displaying news:', news.length);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    // Create a single shared API instance and await health check
    const sharedApi = new ToolGostarAPI();
    try {
        await sharedApi.checkConnection();
    } catch (e) {
        // proceed even if health check fails; fetch methods will fallback
    }

    // Initialize form handler and data loader with shared API
    window.formHandler = new FormHandler(sharedApi);
    window.dataLoader = new DataLoader(sharedApi);
    
    // Load data based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html' || currentPage === 'home.html' || currentPage === '') {
        // Load products and projects for home page
        await window.dataLoader.loadProducts();
        await window.dataLoader.loadProjects();
    } else if (currentPage === 'products.html') {
        await window.dataLoader.loadProducts();
    } else if (currentPage === 'gallery.html') {
        await window.dataLoader.loadProjects();
    } else if (currentPage === 'news.html') {
        await window.dataLoader.loadNews();
    }
});

// Export classes to window for browser use
window.ToolGostarAPI = ToolGostarAPI;
window.FormHandler = FormHandler;
window.DataLoader = DataLoader;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ToolGostarAPI, FormHandler, DataLoader };
}
