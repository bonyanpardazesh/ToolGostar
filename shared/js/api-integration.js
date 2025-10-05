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
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            this.isOnline = response.ok;
            console.log('🌐 Backend connection:', this.isOnline ? 'Online' : 'Offline');
        } catch (error) {
            this.isOnline = false;
            if (error.name === 'AbortError') {
                console.log('🌐 Backend connection: Timeout - Using offline data');
            } else {
                console.log('🌐 Backend connection: Offline - Using static data');
            }
        }
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
        if (!this.isOnline) {
            console.log('📦 Using offline products data');
            return this.getOfflineProducts();
        }

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

            return await response.json();
        } catch (error) {
            console.error('Products fetch error:', error);
            console.log('📦 Falling back to offline products data');
            return this.getOfflineProducts();
        }
    }

    /**
     * Get offline products data
     */
    getOfflineProducts() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    name: { en: 'High-Efficiency Pressure Sand Filter', fa: 'فیلتر شنی فشار بالا با کارایی بالا' },
                    slug: 'high-efficiency-pressure-sand-filter',
                    shortDescription: {
                        en: 'Advanced pressure sand filter for industrial applications',
                        fa: 'فیلتر شنی فشار بالا پیشرفته برای کاربردهای صنعتی'
                    },
                    featuredImage: '/public/images/products/sand-filter.jpg',
                    category: { name: { en: 'Water Treatment Systems', fa: 'سیستم‌های تصفیه آب' } },
                    status: 'active'
                },
                {
                    id: 2,
                    name: { en: 'Industrial Water Softener', fa: 'نرم‌کننده آب صنعتی' },
                    slug: 'industrial-water-softener',
                    shortDescription: {
                        en: 'Professional water softening system for industrial use',
                        fa: 'سیستم نرم‌سازی آب حرفه‌ای برای استفاده صنعتی'
                    },
                    featuredImage: '/public/images/products/water-softener.jpg',
                    category: { name: { en: 'Water Treatment Systems', fa: 'سیستم‌های تصفیه آب' } },
                    status: 'active'
                },
                {
                    id: 3,
                    name: { en: 'Submersible Mixer', fa: 'مخلوط‌کن غوطه‌ور' },
                    slug: 'submersible-mixer',
                    shortDescription: {
                        en: 'High-efficiency submersible mixing equipment',
                        fa: 'تجهیزات مخلوط‌کن غوطه‌ور با کارایی بالا'
                    },
                    featuredImage: '/public/images/products/mixer.jpg',
                    category: { name: { en: 'Mixers & Aerators', fa: 'مخلوط‌کن‌ها و هواده‌ها' } },
                    status: 'active'
                }
            ],
            offline: true
        };
    }

    /**
     * Get projects
     */
    async getProjects() {
        if (!this.isOnline) {
            console.log('🏗️ Using offline projects data');
            return this.getOfflineProjects();
        }

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

            return await response.json();
        } catch (error) {
            console.error('Projects fetch error:', error);
            console.log('🏗️ Falling back to offline projects data');
            return this.getOfflineProjects();
        }
    }

    /**
     * Get offline projects data
     */
    getOfflineProjects() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    title: { en: 'Industrial Water Treatment Plant', fa: 'کارخانه تصفیه آب صنعتی' },
                    slug: 'industrial-water-treatment-plant',
                    shortDescription: {
                        en: 'Complete water treatment solution for industrial facility',
                        fa: 'راه‌حل کامل تصفیه آب برای تأسیسات صنعتی'
                    },
                    featuredImage: '/public/images/projects/water-treatment-plant.jpg',
                    status: 'active'
                },
                {
                    id: 2,
                    title: { en: 'Municipal Wastewater Treatment', fa: 'تصفیه فاضلاب شهری' },
                    slug: 'municipal-wastewater-treatment',
                    shortDescription: {
                        en: 'Large-scale municipal wastewater treatment facility',
                        fa: 'تسهیلات تصفیه فاضلاب شهری در مقیاس بزرگ'
                    },
                    featuredImage: '/public/images/projects/wastewater-treatment.jpg',
                    status: 'active'
                }
            ],
            offline: true
        };
    }

    /**
     * Get news
     */
    async getNews() {
        if (!this.isOnline) {
            console.log('📰 Using offline news data');
            return this.getOfflineNews();
        }

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

            return await response.json();
        } catch (error) {
            console.error('News fetch error:', error);
            console.log('📰 Falling back to offline news data');
            return this.getOfflineNews();
        }
    }

    /**
     * Get offline news data
     */
    getOfflineNews() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    title: { en: 'New Water Treatment Technology', fa: 'فناوری جدید تصفیه آب' },
                    slug: 'new-water-treatment-technology',
                    excerpt: {
                        en: 'Latest advancements in water treatment technology and their applications in industrial settings.',
                        fa: 'آخرین پیشرفت‌ها در فناوری تصفیه آب و کاربردهای آن در محیط‌های صنعتی.'
                    },
                    featuredImage: '/public/images/news/water-treatment-tech.jpg',
                    publishedAt: new Date().toISOString(),
                    status: 'published'
                },
                {
                    id: 2,
                    title: { en: 'Product Launch: Advanced Mixers', fa: 'راه‌اندازی محصول: مخلوط‌کن‌های پیشرفته' },
                    slug: 'product-launch-advanced-mixers',
                    excerpt: {
                        en: 'Introducing our new line of high-efficiency mixing equipment for improved water treatment processes.',
                        fa: 'معرفی خط جدید تجهیزات مخلوط‌کن با کارایی بالا برای بهبود فرآیندهای تصفیه آب.'
                    },
                    featuredImage: '/public/images/news/advanced-mixers.jpg',
                    publishedAt: new Date().toISOString(),
                    status: 'published'
                }
            ],
            offline: true
        };
    }
}

/**
 * Form Handler Class
 */
class FormHandler {
    constructor() {
        this.api = new ToolGostarAPI();
        this.setupForms();
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
    constructor() {
        this.api = new ToolGostarAPI();
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
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form handler
    window.formHandler = new FormHandler();
    
    // Initialize data loader
    window.dataLoader = new DataLoader();
    
    // Load data based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html' || currentPage === 'home.html' || currentPage === '') {
        // Load products and projects for home page
        window.dataLoader.loadProducts();
        window.dataLoader.loadProjects();
    } else if (currentPage === 'products.html') {
        window.dataLoader.loadProducts();
    } else if (currentPage === 'gallery.html') {
        window.dataLoader.loadProjects();
    } else if (currentPage === 'news.html') {
        window.dataLoader.loadNews();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ToolGostarAPI, FormHandler, DataLoader };
}
