/**
 * Admin Panel Internationalization (i18n) System
 * Handles language switching and translation for the admin panel
 */

class AdminI18n {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.rtlLanguages = ['fa', 'ar', 'he'];
        
        this.init();
    }

    async init() {
        try {
            // Load saved language preference or detect from browser
            this.currentLanguage = this.getStoredLanguage() || this.detectBrowserLanguage();
            
            // Load translations
            await this.loadTranslations();
            
            // Apply initial translations immediately
            this.applyTranslations();
            
            // Setup language switcher (disabled - using HTML-based switchers)
            // this.setupLanguageSwitcher();
            
            // Setup HTML-based language switcher event listeners
            this.setupHtmlLanguageSwitchers();
            
            // Apply RTL/LTR direction
            this.applyDirection();
            
            // Update language display
            this.updateLanguageDisplay();
            
            // Mark as initialized
            this.initialized = true;
            
            // Force immediate re-application
            setTimeout(() => {
                this.applyTranslations();
            }, 100);
            
        } catch (error) {
            console.error('Admin i18n initialization error:', error);
            // Try to initialize with English as fallback
            try {
                this.currentLanguage = 'en';
                await this.loadTranslations();
                this.applyTranslations();
                this.initialized = true;
                
                // Force immediate re-application
                setTimeout(() => {
                    this.applyTranslations();
                }, 100);
            } catch (fallbackError) {
                console.error('Fallback initialization failed:', fallbackError);
            }
        }
    }

    getStoredLanguage() {
        return localStorage.getItem('admin-language') || localStorage.getItem('language');
    }

    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        return browserLang.startsWith('fa') ? 'fa' : 'en';
    }

    async loadTranslations() {
        try {
            // Determine the correct path based on current page location
            const isInPagesDir = window.location.pathname.includes('/pages/');
            const basePath = isInPagesDir ? '../languages/' : 'languages/';
            const url = `${basePath}${this.currentLanguage}.json`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${this.currentLanguage} translations`);
            }
            this.translations = await response.json();
        } catch (error) {
            console.error('Failed to load translations:', error);
            // Fallback to English
            if (this.currentLanguage !== 'en') {
                this.currentLanguage = 'en';
                await this.loadTranslations();
            }
        }
    }

    t(key, params = {}) {
        if (!this.translations) {
            console.warn('Translations not loaded yet for key:', key);
            return key;
        }
        
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }
        
        if (typeof value !== 'string') {
            console.warn(`Translation value is not a string: ${key}`);
            return key;
        }
        
        // Replace parameters in translation
        return this.replaceParams(value, params);
    }

    replaceParams(text, params) {
        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    async switchLanguage(lang) {
        if (lang === this.currentLanguage) return;
        
        this.currentLanguage = lang;
        localStorage.setItem('admin-language', lang);
        
        // Reload translations
        await this.loadTranslations();
        
        // Apply new translations
        this.applyTranslations();
        
        // Apply new direction
        this.applyDirection();
        
        // Update current language display
        this.updateLanguageDisplay();
        
        // Trigger custom event for page-specific updates
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
    }

    applyTranslations() {
        console.log('Applying translations, current language:', this.currentLanguage);
        const elements = document.querySelectorAll('[data-i18n]');
        console.log('Found', elements.length, 'elements to translate');
        
        // Translate elements with data-i18n attribute
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            console.log(`Translating ${key}: ${translation}`);
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translation;
            } else if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Translate elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            element.placeholder = translation;
        });

        // Translate elements with data-i18n-html attribute (for HTML content)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.t(key);
            element.innerHTML = translation;
        });

        // Translate title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.t(key);
            element.title = translation;
        });

        // Translate aria-label attributes
        document.querySelectorAll('[data-i18n-aria]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            const translation = this.t(key);
            element.setAttribute('aria-label', translation);
        });
    }

    applyDirection() {
        const isRTL = this.rtlLanguages.includes(this.currentLanguage);
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLanguage;
        
        // Add/remove RTL class to body
        document.body.classList.toggle('rtl', isRTL);
        document.body.classList.toggle('ltr', !isRTL);
    }

    updateLanguageDisplay() {
        const currentLanguageElement = document.getElementById('current-language');
        if (currentLanguageElement) {
            currentLanguageElement.textContent = this.currentLanguage.toUpperCase();
        }
    }

    setupHtmlLanguageSwitchers() {
        // HTML-based language switchers use onclick handlers
        // The global switchLanguage function is already exposed
        // No additional setup needed
    }

    setupLanguageSwitcher() {
        // Create language switcher if it doesn't exist
        let switcher = document.getElementById('language-switcher');
        if (!switcher) {
            switcher = this.createLanguageSwitcher();
            
            // Add to navbar
            const navbar = document.querySelector('.navbar-nav');
            if (navbar) {
                const li = document.createElement('li');
                li.className = 'nav-item dropdown';
                li.innerHTML = switcher.outerHTML;
                navbar.appendChild(li);
            }
        }
        
        // Setup switcher functionality
        const dropdownToggle = document.querySelector('#language-dropdown');
        const dropdownItems = document.querySelectorAll('.language-option');
        
        if (dropdownToggle) {
            dropdownItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const lang = item.dataset.lang;
                    this.switchLanguage(lang);
                });
            });
        }
    }

    createLanguageSwitcher() {
        const switcher = document.createElement('div');
        switcher.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="language-dropdown" 
               role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-globe me-2"></i>
                <span id="current-language">${this.currentLanguage.toUpperCase()}</span>
            </a>
            <ul class="dropdown-menu" aria-labelledby="language-dropdown">
                <li>
                    <a class="dropdown-item language-option ${this.currentLanguage === 'en' ? 'active' : ''}" 
                       href="#" data-lang="en">
                        <i class="bi bi-flag-us me-2"></i>English
                    </a>
                </li>
                <li>
                    <a class="dropdown-item language-option ${this.currentLanguage === 'fa' ? 'active' : ''}" 
                       href="#" data-lang="fa">
                        <i class="bi bi-flag me-2"></i>فارسی
                    </a>
                </li>
            </ul>
        `;
        return switcher;
    }

    // Helper method to get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Helper method to check if current language is RTL
    isRTL() {
        return this.rtlLanguages.includes(this.currentLanguage);
    }

    // Method to refresh translations (useful for dynamic content)
    refresh() {
        if (this.initialized && this.translations) {
            this.applyTranslations();
        } else {
            // If not initialized, try to initialize
            if (!this.initialized) {
                this.init();
            }
        }
    }
}

// Initialize global i18n instance immediately
window.adminI18n = new AdminI18n();

// Function to ensure translations are applied
function ensureTranslations() {
    if (window.adminI18n) {
        if (window.adminI18n.initialized) {
            window.adminI18n.refresh();
        } else {
            // Wait for initialization
            setTimeout(ensureTranslations, 100);
        }
    }
}

// Force immediate translation application
function forceTranslations() {
    if (window.adminI18n && window.adminI18n.translations) {
        window.adminI18n.applyTranslations();
    }
}

// Ensure translations are applied when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ensureTranslations();
    // Force immediate application
    setTimeout(forceTranslations, 50);
});

// Also re-apply translations after all scripts are loaded
window.addEventListener('load', () => {
    ensureTranslations();
    // Force immediate application
    setTimeout(forceTranslations, 100);
});

// Additional fallback - refresh after a short delay
setTimeout(() => {
    ensureTranslations();
    forceTranslations();
}, 500);

// Even more aggressive fallback
setTimeout(() => {
    forceTranslations();
}, 1000);

// Expose switchLanguage function globally
window.switchLanguage = (lang) => {
    if (window.adminI18n) {
        window.adminI18n.switchLanguage(lang);
    } else {
        console.warn('Admin i18n system not yet initialized');
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminI18n;
}
