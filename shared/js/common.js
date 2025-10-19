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

    // Initialize Products mega menu
    initProductsMegaMenu();
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
document.addEventListener('languageChanged', (event) => {
    console.log('🔧 languageChanged event received:', event.detail);
    if (event.detail && event.detail.language) {
        updateDropdownTranslations(event.detail.language);
    } else {
        updateDropdownTranslations(); // Fallback
    }
    // re-render mega menu texts
    refreshMegaMenuTexts();
});

// Also re-run translations after i18n has fully initialized
document.addEventListener('i18nInitialized', () => {
    console.log('🔧 i18nInitialized event received');
    updateDropdownTranslations();
    refreshMegaMenuTexts();
});

// Delegate language button clicks to i18n switcher
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn');
    if (!btn) return;
    const targetLang = btn.getAttribute('data-lang') || 'en';
    if (window.i18n && typeof window.i18n.switchLanguage === 'function') {
        window.i18n.switchLanguage(targetLang);
    } else {
        // Fallback if i18n is not ready yet
        localStorage.setItem('language', targetLang);
        const detail = { language: targetLang };
        document.dispatchEvent(new CustomEvent('i18nInitialized'));
        // Dispatch on document so listeners receive the event
        document.dispatchEvent(new CustomEvent('languageChanged', { detail }));
        // Also dispatch on window for any legacy listeners
        window.dispatchEvent(new CustomEvent('languageChanged', { detail }));
        applyLanguageStyling(targetLang);
    }
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

// =========================
// Products Mega Menu Logic
// =========================
let megaMenuState = {
    cacheByCategory: {},
    open: false,
    hoverTimers: { open: null, close: null }
};

function initProductsMegaMenu() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const productsItem = navbar.querySelector('.nav-dropdown > a.nav-link[data-i18n="navigation.products"]');
    if (!productsItem) return;

    // Mark this dropdown as mega-only to suppress the small dropdown
    const productsDropdown = productsItem.parentElement;
    if (productsDropdown) {
        productsDropdown.classList.add('mega-only');
    }

    // Create mega menu container once
    let mega = document.querySelector('.mega-menu');
    if (!mega) {
        mega = document.createElement('div');
        mega.className = 'mega-menu';
        mega.innerHTML = getMegaMenuTemplate();
        navbar.appendChild(mega);
    }

    const show = () => {
        clearTimeout(megaMenuState.hoverTimers.close);
        megaMenuState.hoverTimers.open = setTimeout(() => {
            navbar.classList.add('mega-open');
            megaMenuState.open = true;
        }, 200); // open delay
    };

    const hide = () => {
        clearTimeout(megaMenuState.hoverTimers.open);
        megaMenuState.hoverTimers.close = setTimeout(() => {
            navbar.classList.remove('mega-open');
            megaMenuState.open = false;
        }, 400); // close delay
    };

    // Hover intent on desktop
    productsItem.addEventListener('mouseenter', show);
    productsItem.parentElement.addEventListener('mouseenter', show);
    navbar.addEventListener('mouseleave', hide);

    // Click toggle
    productsItem.addEventListener('click', (e) => {
        e.preventDefault();
        if (megaMenuState.open) {
            hide();
        } else {
            show();
        }
    });

    // Stop closing when hovering mega
    mega.addEventListener('mouseenter', () => {
        clearTimeout(megaMenuState.hoverTimers.close);
    });

    // Wire category buttons
    bindMegaCategoryButtons();

    // Initial texts
    refreshMegaMenuTexts();
}

function getMegaMenuTemplate() {
    return `
        <div class="mega-container">
            <div class="mega-col categories">
                <h4 data-i18n="products.title">Our Product Range</h4>
                <ul class="mega-categories-list">
                    <li><button class="mega-category-btn" data-category="storage-handling-solids" data-en="Storage & Handling of Bulk Solids" data-fa="تجهیزات انبارش و انتقال مواد جامد">Storage & Handling of Bulk Solids</button></li>
                    <li><button class="mega-category-btn" data-category="water-wastewater" data-en="Water & Wastewater Treatment" data-fa="تجهیزات و تصفیه خانه آب و فاضلاب">Water & Wastewater Treatment</button></li>
                    <li><button class="mega-category-btn" data-category="submersible-mixers" data-en="Submersible Mixers & Flow Makers" data-fa="میکسرها و جریان سازهای مستغرق">Submersible Mixers & Flow Makers</button></li>
                    <li><button class="mega-category-btn" data-category="pumps" data-en="Pumps" data-fa="پمپ ها">Pumps</button></li>
                    <li><button class="mega-category-btn" data-category="others" data-en="Others" data-fa="سایر">Others</button></li>
                </ul>
                <a class="mega-all-link" href="products.html" data-i18n="products.filters.all">All Products</a>
            </div>
            <div class="mega-col details">
                <div class="mega-details-header">
                    <h4 class="mega-details-title">Category</h4>
                    <a class="mega-all-link mega-details-all" href="#">View all</a>
                </div>
                <div class="mega-products" id="megaProducts"></div>
            </div>
        </div>
    `;
}

function refreshMegaMenuTexts() {
    const lang = getLanguage();
    document.querySelectorAll('.mega-category-btn').forEach(btn => {
        const en = btn.getAttribute('data-en');
        const fa = btn.getAttribute('data-fa');
        btn.textContent = lang === 'fa' ? (fa || en) : (en || fa);
    });
    // Translate simple headings if i18n is available
    const title = document.querySelector('.mega-col.categories h4');
    if (title && window.i18n?.t) title.textContent = window.i18n.t('products.title') || title.textContent;
    const all = document.querySelector('.mega-all-link');
    if (all && window.i18n?.t) all.textContent = window.i18n.t('products.filters.all') || all.textContent;
    const viewAll = document.querySelector('.mega-details-all');
    if (viewAll) viewAll.textContent = getLangText({ en: 'View all', fa: 'نمایش همه' });
}

function getLangText(map) {
    const lang = getLanguage();
    return map[lang] || map.en;
}

function bindMegaCategoryButtons() {
    const buttons = document.querySelectorAll('.mega-category-btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => loadMegaCategory(btn.dataset.category));
        btn.addEventListener('focus', () => loadMegaCategory(btn.dataset.category));
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            loadMegaCategory(btn.dataset.category);
        });
    });
    // Load first by default for fast feedback
    const first = buttons[0];
    if (first) loadMegaCategory(first.dataset.category);
}

async function loadMegaCategory(categorySlug) {
    // Map to backend categories if needed on products API
    const map = {
        'storage-handling-solids': 'storage-handling-solids',
        'water-wastewater': 'water-treatment',
        'submersible-mixers': 'mixers-aerators',
        'pumps': 'pumps-systems',
        'others': 'others'
    };
    const internal = map[categorySlug] || categorySlug;

    document.querySelectorAll('.mega-category-btn').forEach(b => b.classList.toggle('active', b.dataset.category === categorySlug));

    const title = document.querySelector('.mega-details-title');
    if (title) title.textContent = document.querySelector(`.mega-category-btn[data-category="${categorySlug}"]`)?.textContent || 'Category';

    const viewAll = document.querySelector('.mega-details-all');
    if (viewAll) viewAll.setAttribute('href', `products.html?category=${categorySlug}`);

    const productsEl = document.getElementById('megaProducts');
    if (!productsEl) return;

    // Cached?
    if (megaMenuState.cacheByCategory[categorySlug]) {
        renderMegaFromCache(megaMenuState.cacheByCategory[categorySlug], productsEl);
        return;
    }

    // Load via API if available, otherwise fallback to empty
    try {
        if (!window.ToolGostarAPI) throw new Error('No API');
        const api = new window.ToolGostarAPI();
        const resp = await api.getProducts();
        const products = (resp?.products || []).filter(p => {
            const cat = p.category?.slug || p.category?.name || 'general';
            return [internal].includes(cat);
        });
        // Pick up to 6 featured
        const featured = products.slice(0, 6);
        const packed = { featured };
        megaMenuState.cacheByCategory[categorySlug] = packed;
        renderMegaFromCache(packed, productsEl);
    } catch (e) {
        renderMegaFromCache({ featured: [] }, productsEl);
    }
}

function renderMegaFromCache(data, productsEl) {
    const lang = getLanguage();
    productsEl.innerHTML = (data.featured || []).map(p => {
        const name = (p.name?.[lang] || p.name?.en || p.name || 'Product');
        let img = p.featuredImage || p.galleryImages?.[0] || 'public/images/logo/logo.png';
        img = CommonApp.getImageUrl(img);
        const id = p.id || p.slug || '';
        return `<a class="mega-product-card" href="products.html#${id}">
                    <img src="${img}" alt="${name}" onerror="this.src='public/images/logo/logo.png'" />
                    <div class="mega-product-name">${name}</div>
                </a>`;
    }).join('');
}
