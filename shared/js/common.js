// Shared JavaScript for all pages
class CommonApp {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.isInitialLoad = !sessionStorage.getItem('isNavigating');
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupMobileMenu();
        this.setupPageLoading();
        this.setupScrollEffects();
        this.addActiveNavLink();
        // Font loading is now handled by CSS with font-display: swap
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        if (filename === 'index.html' || filename === 'loading.html' || filename === 'home.html' || filename === '' || filename === '/') {
            return 'home';
        } else if (filename.includes('products')) {
            return 'products';
        } else if (filename.includes('gallery')) {
            return 'gallery';
        } else if (filename.includes('contact')) {
            return 'contact';
        } else if (filename.includes('about')) {
            return 'about';
        } else if (filename.includes('news')) {
            return 'news';
        }
        
        return 'home';
    }

    // Helper function to convert relative image URLs to absolute URLs
    static getImageUrl(imagePath, fallback = 'public/images/logo/logo.png') {
        if (!imagePath) return fallback;
        
        // If it's already an absolute URL, return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // If it's a relative upload path, convert to absolute
        if (imagePath.startsWith('/uploads/')) {
            // Detect environment
            const hostname = window.location.hostname;
            if (hostname === 'toolgostar.com' || hostname === 'www.toolgostar.com') {
                // Production: use toolgostar.com
                return 'https://toolgostar.com' + imagePath;
            } else {
                // Development: use localhost
                return 'http://localhost:3001' + imagePath;
            }
        }
        
        // If it's already a relative path (like public/images/...), return as is
        return imagePath;
    }

    setupNavigation() {
        // Handle navigation clicks with smooth transition
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href$=".html"]');
            if (link && !link.target) {
                e.preventDefault();
                this.navigateToPage(link.href);
            }
        });

        // Handle logo click
        const logo = document.querySelector('.nav-logo');
        if (logo) {
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToPage('index.html');
            });
        }
    }

    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-mobile');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close menu when clicking on links
            navMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        }
    }

    setupPageLoading() {
        // Only show loading if we're coming from a navigation (not initial page load)
        const isNavigation = sessionStorage.getItem('isNavigating') === 'true';
        
        if (isNavigation) {
            this.showLoading();
        }
        
        // Clear navigation flag
        sessionStorage.removeItem('isNavigating');
        
        // Hide loading when page is ready
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hideLoading();
            }, 500);
        });
        
        // Also hide loading after a maximum time to prevent stuck loading
        setTimeout(() => {
            this.hideLoading();
        }, 3000);
    }

    showLoading() {
        // Prevent multiple loaders
        let loader = document.querySelector('.page-loading');
        if (loader) {
            loader.classList.remove('hidden');
            return;
        }
        
        loader = document.createElement('div');
        loader.className = 'page-loading';
        loader.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.querySelector('.page-loading');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.remove();
            }, 500);
        }
    }

    setupScrollEffects() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Scroll effects disabled - header and logo stay the same
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    addActiveNavLink() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            const href = link.getAttribute('href');
            if (href) {
                const linkPage = this.getPageFromHref(href);
                if (linkPage === this.currentPage) {
                    link.classList.add('active');
                }
            }
        });
        
        // Also handle the case where we're on home page but link points to loading.html
        if (this.currentPage === 'home') {
            const homeLinks = document.querySelectorAll('a[href*="loading.html"], a[href*="home.html"]');
            homeLinks.forEach(link => {
                link.classList.add('active');
            });
        }
    }

    getPageFromHref(href) {
        if (href.includes('index.html') || href.includes('loading.html') || href.includes('home.html') || href === '/') {
            return 'home';
        } else if (href.includes('products')) {
            return 'products';
        } else if (href.includes('gallery')) {
            return 'gallery';
        } else if (href.includes('contact')) {
            return 'contact';
        } else if (href.includes('about')) {
            return 'about';
        } else if (href.includes('news')) {
            return 'news';
        }
        return 'home';
    }

    navigateToPage(url) {
        // Set navigation flag before redirecting
        sessionStorage.setItem('isNavigating', 'true');
        
        // Add a small delay for better UX
        setTimeout(() => {
            window.location.href = url;
        }, 200);
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Animate elements on scroll
    animateOnScroll() {
        const elements = document.querySelectorAll('[data-animate]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(el => {
            observer.observe(el);
        });
    }

    // Font loading is now handled by CSS with font-display: swap
    // This ensures better performance and avoids conflicts with CSS rules

    // Form helpers (now handled by API integration)
    setupForms() {
        // Forms are now handled by api-integration.js
        // This method is kept for compatibility but does nothing
        console.log('📝 Forms will be handled by API integration');
    }
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', () => {
    window.commonApp = new CommonApp();
    const navbar = document.querySelector('nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Update dropdown translations
    updateDropdownTranslations();
    
    // Also try to update dropdowns after a short delay to ensure DOM is ready
    setTimeout(() => {
        console.log('🔧 Delayed dropdown translation attempt');
        updateDropdownTranslations();
    }, 1000);
});

function getLanguage() {
    console.log('🔍 getLanguage() called');
    if (window.i18n && window.i18n.getCurrentLanguage) {
        const lang = window.i18n.getCurrentLanguage();
        console.log('🔍 i18n.getCurrentLanguage():', lang);
        if (lang) return lang;
    }
    if (window.i18n && window.i18n.currentLanguage) {
        console.log('🔍 i18n.currentLanguage:', window.i18n.currentLanguage);
        return window.i18n.currentLanguage;
    }
    const storedLang = localStorage.getItem('language');
    console.log('🔍 localStorage language:', storedLang);
    if (storedLang) {
        return storedLang;
    }
    if (document.body.classList.contains('fa')) {
        console.log('🔍 body has fa class');
        return 'fa';
    }
    console.log('🔍 Defaulting to en');
    return 'en';
}

function updateDropdownTranslations(lang) {
    const language = lang || getLanguage();
    console.log('🔧 updateDropdownTranslations called with language:', language);
    const dropdownItems = document.querySelectorAll('.dropdown-menu a, .dropdown-menu-mobile a');
    console.log('🔍 Found dropdown items:', dropdownItems.length);
    dropdownItems.forEach((item, index) => {
        const enText = item.getAttribute('data-en');
        const faText = item.getAttribute('data-fa');
        console.log(`🔍 Item ${index}: en="${enText}", fa="${faText}"`);
        if (enText && faText) {
            const newText = language === 'fa' ? faText : enText;
            console.log(`✅ Setting item ${index} to: "${newText}"`);
            item.textContent = newText;
        }
    });
}

// Listen for language changes to update dropdowns
window.addEventListener('languageChanged', (event) => {
    console.log('🔧 languageChanged event received:', event.detail);
    if (event.detail && event.detail.language) {
        updateDropdownTranslations(event.detail.language);
    } else {
        updateDropdownTranslations(); // Fallback
    }
});

// Also re-run translations after i18n has fully initialized
document.addEventListener('i18nInitialized', () => {
    console.log('🔧 i18nInitialized event received');
    updateDropdownTranslations();
});

// Global dropdown functions
function navigateToProductCategory(category) {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'products.html') {
        // If on products page, filter directly
        if (window.filterProductsByCategory) {
            window.filterProductsByCategory(category);
        }
    } else {
        // If on other pages, redirect with category
        window.location.href = `products.html?category=${category}`;
    }
}

function toggleMobileDropdown(element) {
    const dropdown = element.closest('.nav-dropdown-mobile');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Manual function to test dropdown translations
window.testDropdownTranslations = function() {
    console.log('🧪 Manual dropdown translation test');
    updateDropdownTranslations();
};
