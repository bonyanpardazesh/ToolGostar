/**
 * Internationalization (i18n) System for ToolGostar
 * Supports English and Farsi languages
 */

class I18n {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || 'en';
        console.log('🔧 I18n constructor - current language set to:', this.currentLanguage);
        this.translations = {};
        this.isRTL = false;
        this.initialized = false;
        this.switcherSetup = false;
        // Don't initialize here - wait for DOM ready
    }

    /**
     * Initialize the i18n system
     */
    async init() {
        if (this.initialized) {
            console.log('⏭️ i18n system already initialized, skipping...');
            return;
        }
        
        try {
            // Load translations
            await this.loadTranslations();
            
            // Set up language switching
            this.setupLanguageSwitcher();
            
            // Update active button state
            this.updateActiveButton(this.currentLanguage);
            
            // Apply initial language
            this.applyLanguage(this.currentLanguage);
            
            this.initialized = true;
            document.dispatchEvent(new CustomEvent('i18nInitialized'));
            console.log('✅ i18n system initialized');
        } catch (error) {
            console.error('❌ Failed to initialize i18n system:', error);
        }
    }

    /**
     * Load translation files
     */
    async loadTranslations() {
        const languages = ['en', 'fa'];
        
        for (const lang of languages) {
            try {
                const response = await fetch(`languages/${lang}.json`);
                if (response.ok) {
                    this.translations[lang] = await response.json();
                    console.log(`✅ Loaded ${lang} translations:`, this.translations[lang]);
                } else {
                    console.warn(`⚠️ Could not load ${lang}.json`);
                }
            } catch (error) {
                console.error(`❌ Error loading ${lang}.json:`, error);
            }
        }
    }

    /**
     * Get translation for a key
     * @param {string} key - Translation key (e.g., 'home.hero.title')
     * @param {object} params - Parameters for interpolation
     * @returns {string} Translated text
     */
    t(key, params = {}) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                console.warn(`⚠️ Translation missing for key: ${key}`);
                return key; // Return the key if translation not found
            }
        }
        
        // Handle string interpolation
        if (typeof translation === 'string') {
            return this.interpolate(translation, params);
        }
        
        return translation || key;
    }

    /**
     * Interpolate parameters in translation strings
     * @param {string} str - String with placeholders
     * @param {object} params - Parameters to interpolate
     * @returns {string} Interpolated string
     */
    interpolate(str, params) {
        return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] || match;
        });
    }

    /**
     * Switch language
     * @param {string} language - Language code (en, fa)
     */
    async switchLanguage(language) {
        console.log(`🔄 switchLanguage called with: ${language}`);
        console.log(`Current language: ${this.currentLanguage}`);
        
        if (this.currentLanguage === language) {
            console.log('⏭️ Same language, skipping switch');
            return;
        }
        
        console.log(`🔄 Switching language from ${this.currentLanguage} to ${language}`);
        
        this.currentLanguage = language;
        this.isRTL = language === 'fa';
        
        // Store language preference
        this.storeLanguage(language);
        console.log(`💾 Language stored in localStorage: ${language}`);
        
        // Apply language changes
        console.log('🔧 Applying language changes...');
        this.applyLanguage(language);
        
        console.log(`✅ Language switch completed. Current language: ${this.currentLanguage}`);
        
        // Update active button
        console.log('🔧 Updating active button...');
        this.updateActiveButton(language);
        
        // Trigger custom event
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language, isRTL: this.isRTL }
        }));
        
        console.log(`🌐 Language switched to: ${language}, RTL: ${this.isRTL}`);
        console.log(`📄 Page title: ${document.title}`);
        console.log(`🔤 Document direction: ${document.documentElement.getAttribute('dir')}`);
    }

    /**
     * Apply language to the page
     * @param {string} language - Language code
     */
    applyLanguage(language) {
        console.log(`🔧 applyLanguage called with: ${language}`);
        console.log(`📄 Current page title: ${document.title}`);
        console.log(`🔍 Current URL: ${window.location.href}`);
        console.log(`🔍 About to check for about page elements...`);
        
        // Update current language and RTL status
        this.currentLanguage = language;
        this.isRTL = language === 'fa';
        
        // Set document direction
        document.documentElement.setAttribute('dir', this.isRTL ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', language);
        console.log(`🔤 Document direction set to: ${this.isRTL ? 'rtl' : 'ltr'}`);
        
        // Update all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        console.log(`🔍 Found ${elements.length} elements with data-i18n attributes`);
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = language === 'fa' ? 
                    this.convertToFarsiNumbers(translation) : 
                    this.convertToEnglishNumbers(translation);
            } else if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = language === 'fa' ? 
                    this.convertToFarsiNumbers(translation) : 
                    this.convertToEnglishNumbers(translation);
            } else {
                element.innerHTML = language === 'fa' ? 
                    this.convertToFarsiNumbers(translation) : 
                    this.convertToEnglishNumbers(translation);
            }
        });
        
        // Apply basic translations to common elements even without data-i18n
        console.log('🔧 Applying basic translations...');
        this.applyBasicTranslations(language);
        
        // Update title and meta description
        const titleKey = document.querySelector('meta[name="i18n-title"]');
        if (titleKey) {
            document.title = this.t(titleKey.getAttribute('content'));
        }
        
        const descKey = document.querySelector('meta[name="i18n-description"]');
        if (descKey) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', this.t(descKey.getAttribute('content')));
            }
        }
        
        // Translate specific pages with delay to ensure DOM is ready
        setTimeout(() => {
            console.log('🔄 Applying page-specific translations with delay...');
            this.applyPageSpecificTranslations(language);
        }, 200);

        // Also try again after a longer delay for dynamic content
        setTimeout(() => {
            console.log('🔄 Applying page-specific translations with longer delay...');
            this.applyPageSpecificTranslations(language);
        }, 1000);

        // Translate about page if on about page
        console.log('🔍 Checking for about page elements...');
        console.log('🔍 About to call translateAboutPage...');
        
        // Check elements multiple times with delays
        const aboutHero = document.querySelector('.hero-about');
        const aboutContent = document.querySelector('.about-content');
        console.log('🔍 About hero found:', !!aboutHero);
        console.log('🔍 About content found:', !!aboutContent);
        
        // Also check for any section elements
        const allSections = document.querySelectorAll('section');
        console.log('🔍 All sections found:', allSections.length);
        allSections.forEach((section, index) => {
            console.log(`🔍 Section ${index}: class="${section.className}"`);
        });
        
        // Check if elements exist in the DOM with different selectors
        const heroAboutExists = document.querySelector('section.hero-about');
        const aboutContentExists = document.querySelector('section.about-content');
        const heroAboutAlt = document.querySelector('.hero-about');
        const aboutContentAlt = document.querySelector('.about-content');
        const aboutTextAlt = document.querySelector('.about-text');
        const statsSectionAlt = document.querySelector('.stats-section');
        
        console.log('🔍 Hero-about section exists (section.hero-about):', !!heroAboutExists);
        console.log('🔍 About-content section exists (section.about-content):', !!aboutContentExists);
        console.log('🔍 Hero-about exists (.hero-about):', !!heroAboutAlt);
        console.log('🔍 About-content exists (.about-content):', !!aboutContentAlt);
        console.log('🔍 About-text exists (.about-text):', !!aboutTextAlt);
        console.log('🔍 Stats-section exists (.stats-section):', !!statsSectionAlt);
        
        console.log('🔍 Current page title:', document.title);
        console.log('🔍 Calling translateAboutPage now...');
        
        // Add a small delay to ensure DOM is fully loaded
        setTimeout(() => {
            console.log('🔍 Delayed call to translateAboutPage...');
            this.translateAboutPage(language);
            console.log('🔍 translateAboutPage call completed');
            
        // Also try direct translation as fallback
        console.log('🔍 Trying direct translation fallback...');
        this.translateAboutPageDirect(language);
    }, 100);

        console.log(`✅ applyLanguage completed for: ${language}`);
    }

    /**
     * Apply page-specific translations
     * @param {string} language - Language code
     */
    applyPageSpecificTranslations(language) {
        try {
            this.translateProductsPage(language);
        } catch (error) {
            console.log('Products page translation failed:', error);
        }

        try {
            this.translateGalleryPage(language);
        } catch (error) {
            console.log('Gallery page translation failed:', error);
        }

        try {
            this.translateNewsPage(language);
        } catch (error) {
            console.log('News page translation failed:', error);
        }

        try {
            this.translateContactPage(language);
        } catch (error) {
            console.log('Contact page translation failed:', error);
        }
    }

    /**
     * Apply basic translations to common elements
     * @param {string} language - Language code
     */
    applyBasicTranslations(language) {
        console.log(`🔧 applyBasicTranslations called with: ${language}`);
        
        // Update navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        console.log(`🔍 Found ${navLinks.length} navigation links`);
        const navTranslations = {
            'Home': { en: 'Home', fa: 'خانه' },
            'خانه': { en: 'Home', fa: 'خانه' },
            'Products': { en: 'Products', fa: 'محصولات' },
            'محصولات': { en: 'Products', fa: 'محصولات' },
            'Gallery': { en: 'Executive Records', fa: 'سوابق اجرایی' },
            'گالری': { en: 'Executive Records', fa: 'سوابق اجرایی' },
            'About': { en: 'About', fa: 'درباره ما' },
            'درباره ما': { en: 'About', fa: 'درباره ما' },
            'Contact': { en: 'Contact', fa: 'تماس' },
            'تماس': { en: 'Contact', fa: 'تماس' },
            'News': { en: 'News', fa: 'اخبار' },
            'اخبار': { en: 'News', fa: 'اخبار' }
        };
        
        navLinks.forEach((link, index) => {
            const text = link.textContent.trim();
            console.log(`🔗 Nav link ${index}: "${text}"`);
            if (navTranslations[text]) {
                const newText = language === 'fa' ? navTranslations[text].fa : navTranslations[text].en;
                link.innerHTML = language === 'fa' ? 
                    this.convertToFarsiNumbers(newText) : 
                    this.convertToEnglishNumbers(newText);
                console.log(`✅ Translated "${text}" to "${newText}"`);
            }
        });

        // Update page title
        if (document.title.includes('ToolGostar')) {
            document.title = language === 'fa' ? 
                'گروه صنعتی طول گستر - راه‌حل‌های پیشرفته تصفیه آب' : 
                'ToolGostar Industrial Group - Advanced Water Treatment Solutions';
        }

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', language === 'fa' ? 
                'تولیدکننده پیشرو سیستم‌های تصفیه آب صنعتی، مخلوط‌کن‌های با کارایی بالا و پمپ‌های شناور قابل اعتماد برای کاربردهای صنعتی در سراسر جهان.' :
                'Leading provider of industrial water treatment systems, high-efficiency mixers, and reliable submersible pumps for industrial applications worldwide.');
        }

        // Update sections with error handling
        try {
            this.translateHeroSection(language);
        } catch (error) {
            console.warn('⚠️ Error in translateHeroSection:', error);
        }
        
        try {
            this.translateFeaturesSection(language);
        } catch (error) {
            console.warn('⚠️ Error in translateFeaturesSection:', error);
        }
        
        try {
            this.translateProductsSection(language);
        } catch (error) {
            console.warn('⚠️ Error in translateProductsSection:', error);
        }
        
        try {
            this.translateCTASection(language);
        } catch (error) {
            console.warn('⚠️ Error in translateCTASection:', error);
        }
        
        try {
            this.translateFooter(language);
        } catch (error) {
            console.warn('⚠️ Error in translateFooter:', error);
        }
        
        // Also call the specific about footer translation
        try {
            this.translateAboutFooter(language);
        } catch (error) {
            console.warn('⚠️ Error in translateAboutFooter:', error);
        }
        
        try {
            this.translateProductsPage(language);
        } catch (error) {
            console.warn('⚠️ Error in translateProductsPage:', error);
        }
        
        try {
            this.translateGalleryPage(language);
        } catch (error) {
            console.warn('⚠️ Error in translateGalleryPage:', error);
        }
    }

    /**
     * Translate hero section
     */
    translateHeroSection(language) {
        // Hero badge
        const heroBadge = document.querySelector('.hero-badge span');
        if (heroBadge) {
            heroBadge.innerHTML = language === 'fa' ? 'پیشرو صنعت از ۱۹۹۵' : 'Industry Leader Since 1995';
        }

        // Hero title
        const heroTitleMain = document.querySelector('.hero-title-main');
        if (heroTitleMain) {
            heroTitleMain.innerHTML = language === 'fa' ? 'تصفیه آب پیشرفته' : 'Advanced Water Treatment';
        }

        const heroTitleSub = document.querySelector('.hero-title-sub');
        if (heroTitleSub) {
            heroTitleSub.innerHTML = language === 'fa' ? 'راه‌حل‌های صنعتی' : 'Solutions for Industry';
        }

        // Hero description
        const heroDescription = document.querySelector('.hero-description');
        if (heroDescription) {
            heroDescription.innerHTML = language === 'fa' ? 
                'فرآیندهای صنعتی خود را با سیستم‌های پیشرفته تصفیه آب، مخلوط‌کن‌های با کارایی بالا و راه‌حل‌های پمپاژ قابل اعتماد ما که توسط شرکت‌های سراسر جهان مورد اعتماد است، متحول کنید.' :
                'Transform your industrial processes with our cutting-edge water treatment systems, high-efficiency mixers, and reliable pumping solutions trusted by companies worldwide.';
        }

        // Hero buttons
        const exploreBtnIcon = document.querySelector('.btn-hero .fas.fa-rocket');
        if (exploreBtnIcon && exploreBtnIcon.parentElement) {
            const exploreBtn = exploreBtnIcon.parentElement;
            const span = exploreBtn.querySelector('span');
            if (span) {
                span.innerHTML = language === 'fa' ? 'محصولات ما' : 'Our Products';
            }
        }

        const quoteBtnIcon = document.querySelector('.btn-hero .fas.fa-phone');
        if (quoteBtnIcon && quoteBtnIcon.parentElement) {
            const quoteBtn = quoteBtnIcon.parentElement;
            const span = quoteBtn.querySelector('span');
            if (span) {
                span.innerHTML = language === 'fa' ? 'تماس با ما' : 'Get in Contact';
            }
        }
    }

    /**
     * Translate features section
     */
    translateFeaturesSection(language) {
        // Section header
        const featuresTitle = document.querySelector('.features-section h2');
        if (featuresTitle) {
            featuresTitle.innerHTML = language === 'fa' ? 'چرا طول گستر را انتخاب کنید؟' : 'Why Choose ToolGostar?';
        }

        const featuresSubtitle = document.querySelector('.features-section .section-header p');
        if (featuresSubtitle) {
            featuresSubtitle.innerHTML = language === 'fa' ? 
                'نوآوری، قابلیت اعتماد و تعالی در هر راه‌حلی که ارائه می‌دهیم' :
                'Innovation, reliability, and excellence in every solution we provide';
        }

        // Feature cards - translate by index to ensure consistency
        const featureCards = document.querySelectorAll('.feature-card');
        const featureData = [
            {
                title: { en: 'Advanced Technology', fa: 'فناوری پیشرفته' },
                description: { 
                    en: 'State-of-the-art equipment and cutting-edge solutions for modern industrial needs.',
                    fa: 'تجهیزات پیشرفته و راه‌حل‌های نوآورانه برای نیازهای صنعتی مدرن.'
                }
            },
            {
                title: { en: 'Reliable Performance', fa: 'عملکرد قابل اعتماد' },
                description: { 
                    en: 'Durable and dependable systems designed to withstand demanding industrial environments.',
                    fa: 'سیستم‌های بادوام و قابل اعتماد طراحی شده برای مقاومت در محیط‌های صنعتی سخت.'
                }
            },
            {
                title: { en: 'Expert Support', fa: 'پشتیبانی تخصصی' },
                description: { 
                    en: 'Dedicated technical support and maintenance services from our experienced team.',
                    fa: 'پشتیبانی فنی اختصاصی و خدمات نگهداری از تیم با تجربه ما.'
                }
            }
        ];

        featureCards.forEach((card, index) => {
            const title = card.querySelector('h3');
            const description = card.querySelector('p');
            
            if (title && description && featureData[index]) {
                title.innerHTML = language === 'fa' ? featureData[index].title.fa : featureData[index].title.en;
                description.innerHTML = language === 'fa' ? featureData[index].description.fa : featureData[index].description.en;
            }
        });
    }

    /**
     * Translate products preview section
     */
    translateProductsSection(language) {
        // Section header
        const productsTitle = document.querySelector('.products-preview h2');
        if (productsTitle) {
            productsTitle.innerHTML = language === 'fa' ? 'محدوده محصولات ما' : 'Our Product Range';
        }

        const productsSubtitle = document.querySelector('.products-preview .section-header p');
        if (productsSubtitle) {
            productsSubtitle.innerHTML = language === 'fa' ? 
                'راه‌حل‌های جامع برای تمام نیازهای تصفیه آب شما' :
                'Comprehensive solutions for all your water treatment needs';
        }

        // Product cards - translate by index to ensure consistency
        const productCards = document.querySelectorAll('.product-card');
        const productData = [
            {
                title: { en: 'Water Treatment Systems', fa: 'سیستم‌های تصفیه آب' },
                description: { 
                    en: 'Advanced filtration and purification systems for industrial applications.',
                    fa: 'سیستم‌های پیشرفته فیلتراسیون و تصفیه برای کاربردهای صنعتی.'
                }
            },
            {
                title: { en: 'High-Efficiency Mixers', fa: 'مخلوط‌کن‌های با کارایی بالا' },
                description: { 
                    en: 'Precision mixing equipment for optimal process efficiency and quality.',
                    fa: 'تجهیزات مخلوط‌کن دقیق برای کارایی و کیفیت بهینه فرآیند.'
                }
            },
            {
                title: { en: 'Submersible Pumps', fa: 'پمپ‌های شناور' },
                description: { 
                    en: 'Reliable pumping solutions for various industrial and commercial applications.',
                    fa: 'راه‌حل‌های پمپاژ قابل اعتماد برای کاربردهای مختلف صنعتی و تجاری.'
                }
            }
        ];

        productCards.forEach((card, index) => {
            const title = card.querySelector('h3');
            const description = card.querySelector('p');
            const button = card.querySelector('.btn-outline');
            
            if (title && description && productData[index]) {
                title.innerHTML = language === 'fa' ? productData[index].title.fa : productData[index].title.en;
                description.innerHTML = language === 'fa' ? productData[index].description.fa : productData[index].description.en;
            }
            
            if (button) {
                button.innerHTML = language === 'fa' ? 'بیشتر بدانید' : 'Learn More';
            }
        });
    }

    /**
     * Translate CTA section
     */
    translateCTASection(language) {
        const ctaTitle = document.querySelector('.cta-section h2');
        if (ctaTitle) {
            ctaTitle.innerHTML = language === 'fa' ? 
                'آماده متحول کردن فرآیند تصفیه آب خود هستید؟' : 
                'Ready to Transform Your Water Treatment Process?';
        }

        const ctaDescription = document.querySelector('.cta-section p');
        if (ctaDescription) {
            ctaDescription.innerHTML = language === 'fa' ? 
                'امروز با متخصصان ما تماس بگیرید تا راه‌حل سفارشی‌ای که نیازهای خاص شما را برآورده می‌کند، دریافت کنید.' :
                'Contact our experts today for a customized solution that meets your specific requirements.';
        }

        const ctaButtons = document.querySelectorAll('.cta-section .btn');
        ctaButtons.forEach((button, index) => {
            const buttonTexts = [
                { en: 'Contact Us Now', fa: 'اکنون با ما تماس بگیرید' },
                { en: 'View Products', fa: 'مشاهده محصولات' }
            ];
            
            if (buttonTexts[index]) {
                button.innerHTML = language === 'fa' ? buttonTexts[index].fa : buttonTexts[index].en;
            }
        });
    }

    /**
     * Translate footer
     */
    translateFooter(language) {
        // Company name and description
        const footerCompanyName = document.querySelector('.footer-section h3');
        if (footerCompanyName) {
            footerCompanyName.innerHTML = language === 'fa' ? 'گروه صنعتی طول گستر' : 'ToolGostar Industrial Group';
        }

        const footerDescription = document.querySelector('.footer-section p');
        if (footerDescription) {
            // Check if we're on products page for more specific description
            if (document.title.includes('Products') || document.title.includes('محصولات')) {
                footerDescription.innerHTML = language === 'fa' ? 
                    'تولیدکننده پیشرو تجهیزات تصفیه آب صنعتی، مخلوط‌کن‌ها، هواده‌ها و پمپ‌های شناور.' :
                    'Leading manufacturer of industrial water treatment solutions, mixers, aerators, and submersible pumps.';
            } else {
                footerDescription.innerHTML = language === 'fa' ? 
                    'تولیدکننده پیشرو راه‌حل‌های تصفیه آب صنعتی با تعهد به نوآوری و تعالی.' :
                    'Leading provider of industrial water treatment solutions with a commitment to innovation and excellence.';
            }
        }

        // Section headers
        const sectionHeaders = document.querySelectorAll('.footer-section h3, .footer-section h4');
        const headerTexts = [
            { en: 'ToolGostar Industrial Group', fa: 'گروه صنعتی طول گستر' },
            { en: 'Company', fa: 'شرکت' },
            { en: 'Contact Info', fa: 'اطلاعات تماس' },
            { en: 'Follow Us', fa: 'ما را دنبال کنید' },
            { en: 'Quick Access', fa: 'دسترسی سریع' },
            { en: 'Quick Links', fa: 'لینک‌های سریع' },
            { en: 'Products', fa: 'محصولات' }
        ];
        
        sectionHeaders.forEach((header, index) => {
            if (headerTexts[index]) {
                header.innerHTML = language === 'fa' ? headerTexts[index].fa : headerTexts[index].en;
            }
        });

        // Footer links - translate by checking current content
        const footerLinks = document.querySelectorAll('.footer-section a');
        const linkTranslations = {
            'Home': { en: 'Home', fa: 'خانه' },
            'خانه': { en: 'Home', fa: 'خانه' },
            'About Us': { en: 'About Us', fa: 'درباره ما' },
            'درباره ما': { en: 'About Us', fa: 'درباره ما' },
            'Our Team': { en: 'Our Team', fa: 'تیم ما' },
            'تیم ما': { en: 'Our Team', fa: 'تیم ما' },
            'Our Values': { en: 'Our Values', fa: 'ارزش‌های ما' },
            'ارزش‌های ما': { en: 'Our Values', fa: 'ارزش‌های ما' },
            'Careers': { en: 'Careers', fa: 'فرصت‌های شغلی' },
            'فرصت‌های شغلی': { en: 'Careers', fa: 'فرصت‌های شغلی' },
            'Products': { en: 'Products', fa: 'محصولات' },
            'محصولات': { en: 'Products', fa: 'محصولات' },
            'Gallery': { en: 'Executive Records', fa: 'سوابق اجرایی' },
            'گالری': { en: 'Executive Records', fa: 'سوابق اجرایی' },
            'Contact': { en: 'Contact', fa: 'تماس' },
            'تماس': { en: 'Contact', fa: 'تماس' },
            'Water Treatment': { en: 'Water Treatment', fa: 'تصفیه آب' },
            'تصفیه آب': { en: 'Water Treatment', fa: 'تصفیه آب' },
            'Mixers & Aerators': { en: 'Mixers & Aerators', fa: 'مخلوط‌کن‌ها و هواده‌ها' },
            'مخلوط‌کن‌ها و هواده‌ها': { en: 'Mixers & Aerators', fa: 'مخلوط‌کن‌ها و هواده‌ها' },
            'Pumps & Systems': { en: 'Pumps & Systems', fa: 'پمپ‌ها و سیستم‌ها' },
            'پمپ‌ها و سیستم‌ها': { en: 'Pumps & Systems', fa: 'پمپ‌ها و سیستم‌ها' },
            'Custom Solutions': { en: 'Custom Solutions', fa: 'راه‌حل‌های سفارشی' },
            'راه‌حل‌های سفارشی': { en: 'Custom Solutions', fa: 'راه‌حل‌های سفارشی' },
            'Water Treatment Systems': { en: 'Water Treatment Systems', fa: 'سیستم‌های تصفیه آب' },
            'سیستم‌های تصفیه آب': { en: 'Water Treatment Systems', fa: 'سیستم‌های تصفیه آب' },
            'Mixers': { en: 'Mixers', fa: 'مخلوط‌کن‌ها' },
            'مخلوط‌کن‌ها': { en: 'Mixers', fa: 'مخلوط‌کن‌ها' },
            'Submersible Pumps': { en: 'Submersible Pumps', fa: 'پمپ‌های شناور' },
            'پمپ‌های شناور': { en: 'Submersible Pumps', fa: 'پمپ‌های شناور' },
            'Accessories': { en: 'Accessories', fa: 'لوازم جانبی' },
            'لوازم جانبی': { en: 'Accessories', fa: 'لوازم جانبی' }
        };

        footerLinks.forEach(link => {
            const text = link.textContent.trim();
            if (linkTranslations[text]) {
                link.innerHTML = language === 'fa' ? linkTranslations[text].fa : linkTranslations[text].en;
            }
        });

        // Social media links now only contain icons, no text translation needed
        
        // Translate contact information
        this.translateContactInfo(language);

        // Copyright
        const copyright = document.querySelector('.footer-bottom p');
        if (copyright) {
            copyright.innerHTML = language === 'fa' ? 
                '© ۲۰۲۵ گروه صنعتی طول گستر. تمام حقوق محفوظ است.' :
                '© 2025 ToolGostar Industrial Group. All rights reserved.';
        }
    }

    /**
     * Translate Products page specific content
     */
    translateProductsPage(language) {
        console.log(`🔧 translateProductsPage called with language: ${language}`);
        console.log(`📄 Current page title: "${document.title}"`);
        
        // Check if this is the products page by looking for products-specific elements
        const productsIntro = document.querySelector('.products-intro');
        const productCategories = document.querySelectorAll('.product-category');
        
        console.log(`🔍 Found products intro: ${!!productsIntro}`);
        console.log(`🔍 Found ${productCategories.length} product categories`);
        
        // Only run on products page (check for products-specific elements instead of title)
        if (!productsIntro && productCategories.length === 0) {
            console.log('⏭️ Not on products page, skipping products-specific translations');
            return;
        }
        
        console.log('✅ Products page detected, proceeding with translations...');
        
        // Update page title and meta (check original title or current title)
        const currentTitle = document.title;
        if (currentTitle.includes('Products - ToolGostar') || currentTitle.includes('محصولات - گروه صنعتی طول گستر')) {
            document.title = language === 'fa' ? 
                'محصولات - گروه صنعتی طول گستر' : 
                'Products - ToolGostar Industrial Equipment';
            console.log(`📄 Page title updated to: ${document.title}`);
        }

        // Products Introduction Section
        const productsIntroTitle = document.querySelector('.products-intro h1');
        console.log(`🔍 Found products intro title:`, productsIntroTitle);
        if (productsIntroTitle) {
            productsIntroTitle.innerHTML = language === 'fa' ? 'محدوده محصولات ما' : 'Our Product Range';
            console.log(`✅ Products intro title translated`);
        }

        const productsIntroDesc = document.querySelector('.products-intro p');
        if (productsIntroDesc) {
            productsIntroDesc.innerHTML = language === 'fa' ? 
                'مجموعه جامع تجهیزات تصفیه آب صنعتی ما را کشف کنید که برای برآورده کردن نیازهای سختگیرانه کاربردهای صنعتی مدرن طراحی شده است.' :
                'Discover our comprehensive collection of industrial water treatment equipment, designed to meet the demanding requirements of modern industrial applications.';
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        const filterTexts = [
            { en: 'All Products', fa: 'همه محصولات' },
            { en: 'Water Treatment', fa: 'تصفیه آب' },
            { en: 'Mixers & Aerators', fa: 'مخلوط‌کن‌ها و هواده‌ها' },
            { en: 'Pumps & Systems', fa: 'پمپ‌ها و سیستم‌ها' }
        ];

        filterButtons.forEach((btn, index) => {
            if (filterTexts[index]) {
                btn.innerHTML = language === 'fa' ? filterTexts[index].fa : filterTexts[index].en;
            }
        });

        // Product Categories - DISABLED to allow dynamic data from database
        console.log('🔧 Product categories translation disabled - using dynamic data from database');
        // this.translateProductCategories(language);

        // Why Choose Section
        console.log('🔧 Translating why choose section...');
        this.translateWhyChooseSection(language);

        // Product Modal
        console.log('🔧 Translating product modal...');
        this.translateProductModal(language);
    }

    /**
     * Translate product categories
     */
    translateProductCategories(language) {
        const productCategories = document.querySelectorAll('.product-category');
        console.log(`🔍 Found ${productCategories.length} product categories`);
        
        const categoryData = [
            {
                title: { en: 'Water & Wastewater Treatment Equipment', fa: 'تجهیزات تصفیه آب و فاضلاب' },
                description: { 
                    en: 'Advanced water treatment systems including filtration, disinfection, and purification equipment for industrial applications.',
                    fa: 'سیستم‌های پیشرفته تصفیه آب شامل فیلتراسیون، ضدعفونی و تجهیزات تصفیه برای کاربردهای صنعتی.'
                },
                specs: {
                    capacity: { en: 'Capacity:', fa: 'ظرفیت:' },
                    powerRange: { en: 'Power Range:', fa: 'محدوده قدرت:' },
                    material: { en: 'Material:', fa: 'جنس:' }
                },
                features: [
                    { en: 'Multi-stage filtration process', fa: 'فرآیند فیلتراسیون چندمرحله‌ای' },
                    { en: 'UV disinfection technology', fa: 'فناوری ضدعفونی UV' },
                    { en: 'Automated control system', fa: 'سیستم کنترل خودکار' },
                    { en: 'Energy efficient design', fa: 'طراحی با کارایی انرژی' },
                    { en: 'Easy maintenance access', fa: 'دسترسی آسان برای نگهداری' }
                ]
            },
            {
                title: { en: 'Mixers & Aerators', fa: 'مخلوط‌کن‌ها و هواده‌ها' },
                description: { 
                    en: 'High-efficiency mixing and aeration equipment for optimal water treatment processes and oxygen transfer.',
                    fa: 'تجهیزات مخلوط‌کن و هوادهی با کارایی بالا برای فرآیندهای بهینه تصفیه آب و انتقال اکسیژن.'
                },
                specs: {
                    powerRange: { en: 'Power Range:', fa: 'محدوده قدرت:' },
                    flowRate: { en: 'Flow Rate:', fa: 'نرخ جریان:' },
                    efficiency: { en: 'Efficiency:', fa: 'کارایی:' }
                },
                features: [
                    { en: 'Stainless steel construction', fa: 'ساخت فولاد ضدزنگ' },
                    { en: 'High mixing efficiency', fa: 'کارایی مخلوط‌کن بالا' },
                    { en: 'Low maintenance design', fa: 'طراحی کم‌نگهداری' },
                    { en: 'Variable speed control', fa: 'کنترل سرعت متغیر' },
                    { en: 'Corrosion resistant', fa: 'مقاوم در برابر خوردگی' }
                ]
            },
            {
                title: { en: 'Pumps & Submersible Systems', fa: 'پمپ‌ها و سیستم‌های شناور' },
                description: { 
                    en: 'Robust pumping solutions and submersible mixing systems for reliable water circulation and treatment.',
                    fa: 'راه‌حل‌های پمپاژ قوی و سیستم‌های مخلوط‌کن شناور برای گردش و تصفیه قابل اعتماد آب.'
                },
                specs: {
                    powerRange: { en: 'Power Range:', fa: 'محدوده قدرت:' },
                    flowRate: { en: 'Flow Rate:', fa: 'نرخ جریان:' },
                    head: { en: 'Head:', fa: 'ارتفاع:' }
                },
                features: [
                    { en: 'High efficiency design', fa: 'طراحی با کارایی بالا' },
                    { en: 'Corrosion resistant materials', fa: 'مواد مقاوم در برابر خوردگی' },
                    { en: 'Easy maintenance', fa: 'نگهداری آسان' },
                    { en: 'Variable speed control', fa: 'کنترل سرعت متغیر' },
                    { en: 'Long service life', fa: 'عمر طولانی سرویس' }
                ]
            }
        ];

        productCategories.forEach((category, index) => {
            if (categoryData[index]) {
                console.log(`🔧 Translating category ${index + 1}...`);
                const title = category.querySelector('h3');
                const description = category.querySelector('p');
                const specLabels = category.querySelectorAll('.spec-label');
                const featureItems = category.querySelectorAll('.product-features li');
                const buttons = category.querySelectorAll('.btn');
                
                console.log(`🔍 Category ${index + 1} elements:`, {
                    title: !!title,
                    description: !!description,
                    specLabels: specLabels.length,
                    featureItems: featureItems.length,
                    buttons: buttons.length
                });

                // Title and description
                if (title) {
                    title.innerHTML = language === 'fa' ? categoryData[index].title.fa : categoryData[index].title.en;
                }
                if (description) {
                    description.innerHTML = language === 'fa' ? categoryData[index].description.fa : categoryData[index].description.en;
                }

                // Spec labels
                specLabels.forEach(label => {
                    const text = label.textContent.trim();
                    if (text === 'Capacity:') {
                        label.innerHTML = language === 'fa' ? categoryData[index].specs.capacity.fa : categoryData[index].specs.capacity.en;
                    } else if (text === 'Power Range:') {
                        label.innerHTML = language === 'fa' ? categoryData[index].specs.powerRange.fa : categoryData[index].specs.powerRange.en;
                    } else if (text === 'Material:') {
                        label.innerHTML = language === 'fa' ? categoryData[index].specs.material.fa : categoryData[index].specs.material.en;
                    } else if (text === 'Flow Rate:') {
                        label.innerHTML = language === 'fa' ? categoryData[index].specs.flowRate.fa : categoryData[index].specs.flowRate.en;
                    } else if (text === 'Efficiency:') {
                        label.innerHTML = language === 'fa' ? categoryData[index].specs.efficiency.fa : categoryData[index].specs.efficiency.en;
                    } else if (text === 'Head:') {
                        label.innerHTML = language === 'fa' ? categoryData[index].specs.head.fa : categoryData[index].specs.head.en;
                    }
                });

                // Features
                featureItems.forEach((item, featureIndex) => {
                    if (categoryData[index].features[featureIndex]) {
                        item.innerHTML = language === 'fa' ? 
                            categoryData[index].features[featureIndex].fa : 
                            categoryData[index].features[featureIndex].en;
                    }
                });

                // Buttons
                buttons.forEach(button => {
                    const text = button.textContent.trim();
                    if (text.includes('View Details')) {
                        button.innerHTML = language === 'fa' ? 
                            '<i class="fas fa-eye"></i> مشاهده جزئیات' : 
                            '<i class="fas fa-eye"></i> View Details';
                    } else if (text.includes('Get Quote') || text.includes('Order Request')) {
                        button.innerHTML = language === 'fa' ? 
                            '<i class="fas fa-shopping-cart"></i> درخواست سفارش' : 
                            '<i class="fas fa-shopping-cart"></i> Order Request';
                    }
                });
            }
        });
    }

    /**
     * Translate Why Choose section
     */
    translateWhyChooseSection(language) {
        console.log('🔧 translateWhyChooseSection called');
        
        const whyChooseTitle = document.querySelector('.why-choose-section h2');
        console.log(`🔍 Found why choose title:`, !!whyChooseTitle);
        if (whyChooseTitle) {
            whyChooseTitle.innerHTML = language === 'fa' ? 'چرا تجهیزات ما را انتخاب کنید؟' : 'Why Choose Our Equipment?';
            console.log('✅ Why choose title translated');
        }

        const whyChooseSubtitle = document.querySelector('.why-choose-section .page-header p');
        console.log(`🔍 Found why choose subtitle:`, !!whyChooseSubtitle);
        if (whyChooseSubtitle) {
            whyChooseSubtitle.innerHTML = language === 'fa' ? 
                'مزایایی که تجهیزات صنعتی ما را از رقبا متمایز می‌کند را کشف کنید' :
                'Discover the advantages that set our industrial equipment apart from the competition';
            console.log('✅ Why choose subtitle translated');
        }

        const whyChooseItems = document.querySelectorAll('.why-choose-item');
        console.log(`🔍 Found ${whyChooseItems.length} why choose items`);
        const whyChooseData = [
            {
                title: { en: 'ISO Certified Quality', fa: 'کیفیت گواهی شده ISO' },
                description: { 
                    en: 'All our products meet international quality standards with ISO 9001:2015 certification.',
                    fa: 'تمام محصولات ما استانداردهای کیفیت بین‌المللی با گواهی ISO 9001:2015 را برآورده می‌کنند.'
                }
            },
            {
                title: { en: 'Expert Engineering', fa: 'مهندسی تخصصی' },
                description: { 
                    en: 'Designed by experienced engineers with deep knowledge of industrial applications.',
                    fa: 'طراحی شده توسط مهندسان با تجربه با دانش عمیق از کاربردهای صنعتی.'
                }
            },
            {
                title: { en: '24/7 Support', fa: 'پشتیبانی ۲۴/۷' },
                description: { 
                    en: 'Comprehensive technical support and maintenance services worldwide.',
                    fa: 'پشتیبانی فنی جامع و خدمات نگهداری در سراسر جهان.'
                }
            },
            {
                title: { en: 'Fast Delivery', fa: 'تحویل سریع' },
                description: { 
                    en: 'Quick delivery and installation services to minimize downtime.',
                    fa: 'خدمات تحویل و نصب سریع برای به حداقل رساندن زمان توقف.'
                }
            }
        ];

        whyChooseItems.forEach((item, index) => {
            if (whyChooseData[index]) {
                const title = item.querySelector('h4');
                const description = item.querySelector('p');

                if (title) {
                    title.innerHTML = language === 'fa' ? whyChooseData[index].title.fa : whyChooseData[index].title.en;
                }
                if (description) {
                    description.innerHTML = language === 'fa' ? whyChooseData[index].description.fa : whyChooseData[index].description.en;
                }
            }
        });
    }

    /**
     * Translate product modal
     */
    translateProductModal(language) {
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle && modalTitle.textContent === 'Product Details') {
            modalTitle.innerHTML = language === 'fa' ? 'جزئیات محصول' : 'Product Details';
        }

        const modalButtons = document.querySelectorAll('.product-modal .btn');
        modalButtons.forEach(button => {
            const text = button.textContent.trim();
            if (text.includes('Request Quote') || text.includes('Order Request')) {
                button.innerHTML = language === 'fa' ? 
                    '<i class="fas fa-shopping-cart"></i> درخواست سفارش' : 
                    '<i class="fas fa-shopping-cart"></i> Order Request';
            } else if (text.includes('Close')) {
                button.innerHTML = language === 'fa' ? 
                    '<i class="fas fa-times"></i> بستن' : 
                    '<i class="fas fa-times"></i> Close';
            }
        });
    }

    /**
     * Setup language switcher
     */
    setupLanguageSwitcher() {
        // Check if already set up
        if (this.switcherSetup) {
            console.log('⏭️ Language switcher already set up, skipping...');
            return;
        }
        
        // Setup language switcher buttons
        const langButtons = document.querySelectorAll('.lang-btn');
        console.log('Found language buttons:', langButtons.length);
        
        if (langButtons.length === 0) {
            console.log('⚠️ No language buttons found, retrying in 100ms...');
            setTimeout(() => this.setupLanguageSwitcher(), 100);
            return;
        }
        
        // Remove any existing event listeners to prevent duplication
        langButtons.forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
        
        // Re-select buttons after cloning
        const freshButtons = document.querySelectorAll('.lang-btn');
        freshButtons.forEach(button => {
            console.log('Setting up button:', button.getAttribute('data-lang'));
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const lang = event.currentTarget.getAttribute('data-lang');
                console.log('Language button clicked:', lang);
                this.switchLanguage(lang);
            });
        });
        
        this.switcherSetup = true;
        console.log('✅ Language switcher setup complete');
    }


    /**
     * Update active language button
     * @param {string} language - Language code
     */
    updateActiveButton(language) {
        const langButtons = document.querySelectorAll('.lang-btn');
        console.log('🔧 Updating active button for language:', language);
        
        langButtons.forEach(button => {
            const buttonLang = button.getAttribute('data-lang');
            if (buttonLang === language) {
                button.classList.add('active');
                button.style.opacity = '1';
                button.style.transform = 'scale(1.1)';
                console.log(`✅ Activated button for ${buttonLang}`);
            } else {
                button.classList.remove('active');
                button.style.opacity = '0.7';
                button.style.transform = 'scale(1)';
            }
        });
    }

    /**
     * Store language preference in localStorage
     * @param {string} language - Language code
     */
    storeLanguage(language) {
        try {
            localStorage.setItem('toolgostar-language', language);
        } catch (error) {
            console.warn('⚠️ Could not store language preference:', error);
        }
    }

    /**
     * Get stored language preference
     * @returns {string|null} Stored language or null
     */
    getStoredLanguage() {
        try {
            const stored = localStorage.getItem('toolgostar-language');
            console.log('🔍 Retrieved stored language:', stored);
            return stored;
        } catch (error) {
            console.warn('⚠️ Could not retrieve language preference:', error);
            return null;
        }
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Check if current language is RTL
     * @returns {boolean} True if RTL
     */
    isRTLLanguage() {
        return this.isRTL;
    }

    /**
     * Get available languages
     * @returns {array} Array of available language codes
     */
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }

    /**
     * Convert numbers to Farsi format
     * @param {string|number} text - Text containing numbers
     * @returns {string} Text with Farsi numbers
     */
    convertToFarsiNumbers(text) {
        if (typeof text !== 'string') {
            text = String(text);
        }
        
        const farsiNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        
        for (let i = 0; i < 10; i++) {
            text = text.replace(new RegExp(englishNumbers[i], 'g'), farsiNumbers[i]);
        }
        
        return text;
    }

    /**
     * Convert numbers to English format
     * @param {string|number} text - Text containing Farsi numbers
     * @returns {string} Text with English numbers
     */
    convertToEnglishNumbers(text) {
        if (typeof text !== 'string') {
            text = String(text);
        }
        
        const farsiNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        
        for (let i = 0; i < 10; i++) {
            text = text.replace(new RegExp(farsiNumbers[i], 'g'), englishNumbers[i]);
        }
        
        return text;
    }

    /**
     * Translate Gallery page specific content
     */
    translateGalleryPage(language) {
        console.log(`🔧 translateGalleryPage called with language: ${language}`);
        
        // Check if this is the gallery page by looking for gallery-specific elements
        const galleryIntro = document.querySelector('.gallery-intro');
        const gallerySection = document.querySelector('.gallery-section');
        
        console.log(`🔍 Found gallery intro: ${!!galleryIntro}`);
        console.log(`🔍 Found gallery section: ${!!gallerySection}`);
        
        // Only run on gallery page
        if (!galleryIntro && !gallerySection) {
            console.log('⏭️ Not on gallery page, skipping gallery-specific translations');
            return;
        }
        
        console.log('✅ Gallery page detected, proceeding with translations...');
        
        // Update page title
        const currentTitle = document.title;
        if (currentTitle.includes('Gallery - ToolGostar') || currentTitle.includes('سوابق اجرایی - گروه صنعتی طول گستر')) {
            document.title = language === 'fa' ? 
                'سوابق اجرایی - گروه صنعتی طول گستر' : 
                'Executive Records - ToolGostar Project Showcase';
            console.log(`📄 Page title updated to: ${document.title}`);
        }

        // Gallery Introduction Section
        const galleryIntroTitle = document.querySelector('.gallery-intro h1');
        console.log(`🔍 Found gallery intro title:`, !!galleryIntroTitle);
        if (galleryIntroTitle) {
            galleryIntroTitle.innerHTML = language === 'fa' ? 'سوابق اجرایی' : 'Executive Records';
            console.log('✅ Gallery intro title translated');
        }

        const galleryIntroDesc = document.querySelector('.gallery-intro p');
        if (galleryIntroDesc) {
            galleryIntroDesc.innerHTML = language === 'fa' ? 
                'نمونه کارهای موفق نصب و راه‌اندازی سیستم‌های تصفیه آب صنعتی و پروژه‌های تکمیل شده در سراسر جهان را کاوش کنید.' :
                'Explore our portfolio of successful industrial water treatment installations and projects completed worldwide.';
        }

        // Gallery Filter buttons
        const galleryFilterButtons = document.querySelectorAll('.gallery-filters .filter-btn');
        const galleryFilterTexts = [
            { en: 'All Projects', fa: 'همه پروژه‌ها' },
            { en: 'Water Treatment', fa: 'تصفیه آب' },
            { en: 'Mixers & Aerators', fa: 'مخلوط‌کن‌ها و هواده‌ها' },
            { en: 'Pumps & Systems', fa: 'پمپ‌ها و سیستم‌ها' }
        ];

        galleryFilterButtons.forEach((btn, index) => {
            if (galleryFilterTexts[index]) {
                btn.innerHTML = language === 'fa' ? galleryFilterTexts[index].fa : galleryFilterTexts[index].en;
            }
        });

        // Gallery Stats Section
        this.translateGalleryStats(language);

        // Re-render gallery if renderGallery function exists
        if (typeof window.renderGallery === 'function') {
            console.log('🔄 Re-rendering gallery with new language...');
            window.renderGallery();
        }

    }


    /**
     * Translate News page specific content
     */
    translateNewsPage(language) {
        console.log(`🔧 translateNewsPage called with language: ${language}`);
        
        // Check if this is the news page by looking for news-specific elements
        const newsHero = document.querySelector('.hero-news');
        const newsGrid = document.querySelector('.news-grid');
        
        console.log(`🔍 Found news hero: ${!!newsHero}`);
        console.log(`🔍 Found news grid: ${!!newsGrid}`);
        
        // Only run on news page
        if (!newsHero && !newsGrid) {
            console.log('⏭️ Not on news page, skipping news-specific translations');
            return;
        }
        
        console.log('✅ News page detected, proceeding with translations...');
        
        // Update page title
        const currentTitle = document.title;
        if (currentTitle.includes('News & Updates - ToolGostar') || currentTitle.includes('اخبار و به‌روزرسانی‌ها - گروه صنعتی طول گستر')) {
            document.title = language === 'fa' ? 
                'اخبار و به‌روزرسانی‌ها - گروه صنعتی طول گستر' : 
                'News & Updates - ToolGostar Industrial Group';
            console.log(`📄 Page title updated to: ${document.title}`);
        }

        // News Hero Section
        const newsHeroSection = document.querySelector('.hero-news');
        if (newsHeroSection) {
            const newsHeroTitle = newsHeroSection.querySelector('h1');
            console.log(`🔍 Found news hero title:`, !!newsHeroTitle);
            if (newsHeroTitle) {
                const currentText = newsHeroTitle.textContent;
                console.log(`📝 Current hero title text: "${currentText}"`);
                // Only translate if it's the correct hero title
                if (currentText.includes('News & Updates') || currentText.includes('اخبار و به‌روزرسانی‌ها')) {
                    newsHeroTitle.innerHTML = language === 'fa' ? 'اخبار و به‌روزرسانی‌ها' : 'News & Updates';
                    console.log('✅ News hero title translated');
                } else {
                    console.log('⚠️ Hero title text does not match expected content, skipping translation');
                }
            } else {
                console.log('❌ News hero title element not found!');
            }

            const newsHeroDesc = newsHeroSection.querySelector('p');
            console.log(`🔍 Found news hero description:`, !!newsHeroDesc);
            if (newsHeroDesc) {
                const currentDesc = newsHeroDesc.textContent;
                console.log(`📝 Current hero description: "${currentDesc.substring(0, 50)}..."`);
                // Only translate if it's the correct hero description
                if (currentDesc.includes('Stay informed') || currentDesc.includes('با آخرین مقالات')) {
                    newsHeroDesc.innerHTML = language === 'fa' ? 
                        'با آخرین مقالات، اعلان‌های محصولات و اخبار شرکت از طول گستر به‌روز بمانید.' :
                        'Stay informed with the latest articles, product announcements, and company news from ToolGostar.';
                    console.log('✅ News hero description translated');
                } else {
                    console.log('⚠️ Hero description text does not match expected content, skipping translation');
                }
            } else {
                console.log('❌ News hero description element not found!');
            }
        } else {
            console.log('❌ News hero section not found!');
        }

        // Translate static news cards
        this.translateStaticNewsCards(language);

        // Re-render news if renderNews function exists
        if (typeof window.renderNews === 'function') {
            console.log('🔄 Re-rendering news with new language...');
            console.log('🔍 Current language before re-render:', language);
            console.log('🔍 window.i18n.currentLanguage:', window.i18n ? window.i18n.currentLanguage : 'undefined');
            
            // Add a small delay to ensure the translation happens after dynamic content
            setTimeout(() => {
                window.renderNews();
                console.log('✅ Dynamic news content re-rendered with new language');
                
                // Verify the translation worked
                setTimeout(() => {
                    this.verifyNewsTranslation(language);
                }, 100);
            }, 50);
        } else {
            console.log('⚠️ renderNews function not found, using static content only');
        }
    }

    /**
     * Translate static news cards
     */
    translateStaticNewsCards(language) {
        const newsCards = document.querySelectorAll('.news-card');
        console.log(`🔍 Found ${newsCards.length} static news cards to translate`);
        
        if (newsCards.length === 0) {
            console.log('⚠️ No static news cards found - dynamic content may have overwritten them');
            return;
        }

        const newsTranslations = {
            'ToolGostar Unveils New High-Efficiency Submersible Pump': {
                en: 'ToolGostar Unveils New High-Efficiency Submersible Pump',
                fa: 'طول گستر پمپ شناور جدید با کارایی بالا را معرفی می‌کند'
            },
            'Expansion into European Market Completed': {
                en: 'Expansion into European Market Completed',
                fa: 'گسترش به بازار اروپا تکمیل شد'
            },
            'The Future of Sustainable Water Treatment': {
                en: 'The Future of Sustainable Water Treatment',
                fa: 'آینده تصفیه پایدار آب'
            }
        };

        const excerptTranslations = {
            'Our latest TG-SP-500 model sets a new industry standard for performance, reliability, and energy efficiency in demanding industrial applications...': {
                en: 'Our latest TG-SP-500 model sets a new industry standard for performance, reliability, and energy efficiency in demanding industrial applications...',
                fa: 'مدل جدید TG-SP-500 ما استاندارد جدیدی در صنعت برای عملکرد، قابلیت اطمینان و کارایی انرژی در کاربردهای صنعتی سخت تعیین می‌کند...'
            },
            'We are excited to announce the opening of our new regional headquarters in Germany, enhancing our service and support for European clients...': {
                en: 'We are excited to announce the opening of our new regional headquarters in Germany, enhancing our service and support for European clients...',
                fa: 'ما خوشحالیم که افتتاح مقر منطقه‌ای جدید ما در آلمان را اعلام کنیم که خدمات و پشتیبانی ما را برای مشتریان اروپایی بهبود می‌بخشد...'
            },
            'Our CTO, Sara Hosseini, shares her insights on the innovative technologies and strategies shaping the future of sustainable industrial water management...': {
                en: 'Our CTO, Sara Hosseini, shares her insights on the innovative technologies and strategies shaping the future of sustainable industrial water management...',
                fa: 'مدیر فنی ما، سارا حسینی، بینش‌های خود را در مورد فناوری‌ها و استراتژی‌های نوآورانه که آینده مدیریت پایدار آب صنعتی را شکل می‌دهند، به اشتراک می‌گذارد...'
            }
        };

        const categoryTranslations = {
            'Product News': { en: 'Product News', fa: 'اخبار محصولات' },
            'Company News': { en: 'Company News', fa: 'اخبار شرکت' },
            'Industry Insights': { en: 'Industry Insights', fa: 'بینش‌های صنعتی' }
        };

        const buttonTranslations = {
            'Read More': { en: 'Read More', fa: 'ادامه مطلب' }
        };

        newsCards.forEach((card, index) => {
            // Translate title
            const titleElement = card.querySelector('.news-card-title');
            if (titleElement) {
                const titleText = titleElement.textContent.trim();
                if (newsTranslations[titleText]) {
                    const newTitle = language === 'fa' ? 
                        newsTranslations[titleText].fa : 
                        newsTranslations[titleText].en;
                    titleElement.innerHTML = language === 'fa' ? 
                        this.convertToFarsiNumbers(newTitle) : 
                        this.convertToEnglishNumbers(newTitle);
                    console.log(`✅ Translated news title: "${titleText}" → "${newTitle}"`);
                }
            }

            // Translate excerpt
            const excerptElement = card.querySelector('.news-card-excerpt');
            if (excerptElement) {
                const excerptText = excerptElement.textContent.trim();
                if (excerptTranslations[excerptText]) {
                    const newExcerpt = language === 'fa' ? 
                        excerptTranslations[excerptText].fa : 
                        excerptTranslations[excerptText].en;
                    excerptElement.innerHTML = language === 'fa' ? 
                        this.convertToFarsiNumbers(newExcerpt) : 
                        this.convertToEnglishNumbers(newExcerpt);
                    console.log(`✅ Translated news excerpt: "${excerptText}" → "${newExcerpt}"`);
                }
            }

            // Translate category
            const categoryElement = card.querySelector('.news-card-category');
            if (categoryElement) {
                const categoryText = categoryElement.textContent.trim();
                if (categoryTranslations[categoryText]) {
                    const newCategory = language === 'fa' ? 
                        categoryTranslations[categoryText].fa : 
                        categoryTranslations[categoryText].en;
                    categoryElement.innerHTML = newCategory;
                    console.log(`✅ Translated news category: "${categoryText}" → "${newCategory}"`);
                }
            }

            // Translate "Read More" buttons
            const readMoreButtons = card.querySelectorAll('.btn, .news-card-link');
            readMoreButtons.forEach(btn => {
                const btnText = btn.textContent.trim();
                if (btnText.includes('Read More')) {
                    btn.innerHTML = language === 'fa' ? 
                        'ادامه مطلب <i class="fas fa-arrow-left"></i>' : 
                        'Read More <i class="fas fa-arrow-right"></i>';
                }
            });
        });
    }

    /**
     * Verify that news translation worked correctly
     */
    verifyNewsTranslation(language) {
        console.log('🔍 Verifying news translation...');
        
        // Check hero section
        const heroTitle = document.querySelector('.hero-news h1');
        if (heroTitle) {
            const titleText = heroTitle.textContent;
            console.log(`🔍 Hero title after translation: "${titleText}"`);
            if (language === 'fa' && titleText.includes('اخبار')) {
                console.log('✅ Hero title correctly translated to Farsi');
            } else if (language === 'en' && titleText.includes('News')) {
                console.log('✅ Hero title correctly translated to English');
            } else {
                console.log('❌ Hero title translation failed');
            }
        }
        
        // Check news cards
        const newsCards = document.querySelectorAll('.news-card');
        console.log(`🔍 Found ${newsCards.length} news cards to verify`);
        
        newsCards.forEach((card, index) => {
            const title = card.querySelector('.news-card-title');
            if (title) {
                const titleText = title.textContent;
                console.log(`🔍 Card ${index + 1} title: "${titleText}"`);
                if (language === 'fa' && titleText.includes('راه‌اندازی')) {
                    console.log(`✅ Card ${index + 1} title correctly translated to Farsi`);
                } else if (language === 'en' && titleText.includes('Product Launch')) {
                    console.log(`✅ Card ${index + 1} title correctly translated to English`);
                } else {
                    console.log(`❌ Card ${index + 1} title translation failed`);
                }
            }
        });
    }

    /**
     * Direct translation method for About page - targets elements by text content
     */
    translateAboutPageDirect(language) {
        console.log('🔧 translateAboutPageDirect called');
        
        // Translate H1 title
        const h1Elements = document.querySelectorAll('h1');
        h1Elements.forEach(h1 => {
            if (h1.textContent.includes('About ToolGostar')) {
                h1.innerHTML = language === 'fa' ? 'درباره طول گستر' : 'About ToolGostar';
                console.log('✅ H1 title translated directly');
            }
        });
        
        // Translate H2 titles
        const h2Elements = document.querySelectorAll('h2');
        h2Elements.forEach(h2 => {
            if (h2.textContent.includes('Our Story')) {
                h2.innerHTML = language === 'fa' ? 'داستان ما' : 'Our Story';
                console.log('✅ Our Story title translated directly');
            } else if (h2.textContent.includes('Our Mission')) {
                h2.innerHTML = language === 'fa' ? 'ماموریت ما' : 'Our Mission';
                console.log('✅ Our Mission title translated directly');
            } else if (h2.textContent.includes('Our Achievements')) {
                h2.innerHTML = language === 'fa' ? 'دستاوردهای ما' : 'Our Achievements';
                console.log('✅ Our Achievements title translated directly');
            }
        });
        
        // Translate paragraphs
        const pElements = document.querySelectorAll('p');
        console.log('🔍 Found paragraph elements:', pElements.length);
        pElements.forEach((p, index) => {
            const text = p.textContent;
            console.log(`🔍 Paragraph ${index}: "${text.substring(0, 50)}..."`);
            if (text.includes('Leading the way in industrial water treatment')) {
                p.innerHTML = language === 'fa' ? 
                    'پیشرو در راه‌حل‌های تصفیه آب صنعتی با بیش از ۱۵ سال تعالی مهندسی و نوآوری' : 
                    'Leading the way in industrial water treatment solutions with over 15 years of engineering excellence and innovation';
                console.log('✅ Hero subtitle translated directly');
            } else if (text.includes('Founded in 2009')) {
                p.innerHTML = language === 'fa' ? 
                    'تأسیس شده در سال ۲۰۰۹، گروه صنعتی طول گستر از یک شرکت مهندسی کوچک به یک تولیدکننده پیشرو تجهیزات تصفیه آب صنعتی تبدیل شده است. سفر ما با یک مأموریت ساده آغاز شد: ارائه راه‌حل‌های قابل اعتماد، کارآمد و نوآورانه برای چالش‌های تصفیه آب.' : 
                    'Founded in 2009, ToolGostar Industrial Group has grown from a small engineering firm to a leading manufacturer of industrial water treatment equipment. Our journey began with a simple mission: to provide reliable, efficient, and innovative solutions for water treatment challenges.';
                console.log('✅ Story paragraph 1 translated directly');
            } else if (text.includes('Today, we serve clients')) {
                p.innerHTML = language === 'fa' ? 
                    'امروز، ما به مشتریان در بیش از ۱۵ کشور خدمت می‌کنیم و در هر پروژه فناوری پیشرفته و تخصص بی‌نظیر ارائه می‌دهیم. تعهد ما به کیفیت و نوآوری ما را به شریک قابل اعتمادی برای صنایع در سراسر جهان تبدیل کرده است.' : 
                    'Today, we serve clients across 15+ countries, delivering cutting-edge technology and unmatched expertise in every project. Our commitment to quality and innovation has made us a trusted partner for industries worldwide.';
                console.log('✅ Story paragraph 2 translated directly');
            } else if (text.includes('To provide innovative, reliable')) {
                p.innerHTML = language === 'fa' ? 
                    'ارائه راه‌حل‌های نوآورانه، قابل اعتماد و پایدار تصفیه آب که به مشتریان ما کمک می‌کند تا به اهداف عملیاتی خود دست یابند و در عین حال از محیط زیست محافظت کنند. ما متعهد به تعالی مهندسی، رضایت مشتری و بهبود مستمر هستیم.' : 
                    'To provide innovative, reliable, and sustainable water treatment solutions that help our clients achieve their operational goals while protecting the environment. We are committed to engineering excellence, customer satisfaction, and continuous improvement.';
                console.log('✅ Mission paragraph 1 translated directly');
            } else if (text.includes('Our vision is to be')) {
                p.innerHTML = language === 'fa' ? 
                    'چشم‌انداز ما تبدیل شدن به رهبر جهانی در فناوری تصفیه آب صنعتی است و استانداردهای جدیدی برای کارایی، قابلیت اعتماد و مسئولیت زیست‌محیطی تعیین می‌کند.' : 
                    'Our vision is to be the global leader in industrial water treatment technology, setting new standards for efficiency, reliability, and environmental responsibility.';
                console.log('✅ Mission paragraph 2 translated directly');
            } else if (text.includes('Numbers that speak')) {
                p.innerHTML = language === 'fa' ? 
                    'اعدادی که نشان‌دهنده تجربه و تعهد ما به تعالی است' : 
                    'Numbers that speak to our experience and commitment to excellence';
                console.log('✅ Achievements subtitle translated directly');
            } else {
                console.log(`🔍 Paragraph ${index} did not match any translation patterns`);
            }
        });
        
        // Translate stat labels
        const statLabels = document.querySelectorAll('.stat-label');
        const statTranslations = [
            { en: 'Projects Completed', fa: 'پروژه تکمیل شده' },
            { en: 'Expert Engineers', fa: 'مهندس متخصص' },
            { en: 'Years Experience', fa: 'سال تجربه' }
        ];
        
        statLabels.forEach((label, index) => {
            if (statTranslations[index]) {
                label.innerHTML = language === 'fa' ? statTranslations[index].fa : statTranslations[index].en;
                console.log(`✅ Stat label ${index} translated directly`);
            }
        });
        
        console.log('✅ Direct translation completed');
    }

    /**
     * Translate Contact page specific content
     */
    translateContactPage(language) {
        console.log(`🔧 translateContactPage called with language: ${language}`);
        
        // Check if this is the contact page by looking for contact-specific elements
        const contactHero = document.querySelector('.contact-hero');
        const contactContent = document.querySelector('.contact-content');
        const contactForm = document.querySelector('.contact-form');
        
        console.log(`🔍 Found contact hero: ${!!contactHero}`);
        console.log(`🔍 Found contact content: ${!!contactContent}`);
        console.log(`🔍 Found contact form: ${!!contactForm}`);
        
        // Check if we're on the contact page by URL or elements
        const isContactPage = window.location.href.includes('contact.html') || 
                             window.location.pathname.includes('contact') ||
                             contactHero || contactContent || contactForm;
        
        if (!isContactPage) {
            console.log('⏭️ Not on contact page, skipping contact-specific translations');
            return;
        }
        
        console.log('✅ Contact page detected, proceeding with translations...');
        
        // Update page title
        const currentTitle = document.title;
        if (currentTitle.includes('Contact Us - ToolGostar') || currentTitle.includes('تماس با ما - گروه صنعتی طول گستر')) {
            document.title = language === 'fa' ? 
                'تماس با ما - گروه صنعتی طول گستر' : 
                'Contact Us - ToolGostar Industrial Group';
            console.log(`📄 Page title updated to: ${document.title}`);
        }

        // Hero Section
        this.translateContactHero(language);
        
        // Contact Form
        this.translateContactForm(language);
        
        // Contact Information
        this.translateContactInfo(language);
        
        // Facilities Section
        this.translateContactFacilities(language);
        
        // Map Section
        this.translateContactMap(language);
        
        // Team Section
        this.translateContactTeam(language);
    }

    /**
     * Translate Contact Hero section
     */
    translateContactHero(language) {
        const heroTitle = document.querySelector('.contact-hero h1');
        if (heroTitle) {
            heroTitle.innerHTML = language === 'fa' ? 'تماس با ما' : 'Contact Us';
            console.log('✅ Contact hero title translated');
        }

        const heroDesc = document.querySelector('.contact-hero p');
        if (heroDesc) {
            heroDesc.innerHTML = language === 'fa' ? 
                'با متخصصان ما برای مشاوره، سفارشات و پشتیبانی فنی در زمینه تصفیه آب تماس بگیرید' :
                'Get in touch with our experts for consultation, orders, and technical support for your water treatment needs.';
            console.log('✅ Contact hero description translated');
        }
    }

    /**
     * Translate Contact Form
     */
    translateContactForm(language) {
        const formTitle = document.querySelector('.contact-form h2');
        if (formTitle) {
            formTitle.innerHTML = language === 'fa' ? 'پیام خود را ارسال کنید' : 'Send Us a Message';
            console.log('✅ Contact form title translated');
        }

        // Form labels
        const labels = document.querySelectorAll('.contact-form label');
        labels.forEach(label => {
            const text = label.textContent.trim();
            if (text.includes('First Name')) {
                label.innerHTML = language === 'fa' ? 'نام *' : 'First Name *';
            } else if (text.includes('Last Name')) {
                label.innerHTML = language === 'fa' ? 'نام خانوادگی *' : 'Last Name *';
            } else if (text.includes('Email Address')) {
                label.innerHTML = language === 'fa' ? 'آدرس ایمیل *' : 'Email Address *';
            } else if (text.includes('Phone Number')) {
                label.innerHTML = language === 'fa' ? 'شماره تلفن' : 'Phone Number';
            } else if (text.includes('Company Name')) {
                label.innerHTML = language === 'fa' ? 'نام شرکت' : 'Company Name';
            } else if (text.includes('Industry')) {
                label.innerHTML = language === 'fa' ? 'صنعت' : 'Industry';
            } else if (text.includes('Project Type')) {
                label.innerHTML = language === 'fa' ? 'نوع پروژه' : 'Project Type';
            } else if (text.includes('Subject')) {
                label.innerHTML = language === 'fa' ? 'موضوع *' : 'Subject *';
            } else if (text.includes('Message')) {
                label.innerHTML = language === 'fa' ? 'پیام *' : 'Message *';
            } else if (text.includes('Required Capacity')) {
                label.innerHTML = language === 'fa' ? 'ظرفیت مورد نیاز' : 'Required Capacity';
            } else if (text.includes('Budget Range')) {
                label.innerHTML = language === 'fa' ? 'محدوده بودجه' : 'Budget Range';
            } else if (text.includes('Project Timeline')) {
                label.innerHTML = language === 'fa' ? 'زمان‌بندی پروژه' : 'Project Timeline';
            }
        });

        // Form placeholders
        const placeholders = document.querySelectorAll('.contact-form input, .contact-form textarea');
        placeholders.forEach(input => {
            const placeholder = input.getAttribute('placeholder');
            if (placeholder) {
                if (placeholder.includes('Please describe your requirements')) {
                    input.setAttribute('placeholder', language === 'fa' ? 
                        'لطفاً نیازمندی‌ها، ظرفیت مورد نیاز و سوالات خاص خود را شرح دهید...' : 
                        'Please describe your requirements, capacity needs, and any specific questions...');
                } else if (placeholder.includes('e.g., 1000 m³/day')) {
                    input.setAttribute('placeholder', language === 'fa' ? 
                        'مثال: ۱۰۰۰ متر مکعب در روز' : 
                        'e.g., 1000 m³/day');
                }
            }
        });

        // Form options
        this.translateFormOptions(language);

        // Submit button
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            const btnText = submitBtn.textContent.trim();
            if (btnText.includes('Send Message')) {
                submitBtn.innerHTML = language === 'fa' ? 
                    '<i class="fas fa-paper-plane"></i> ارسال پیام' : 
                    '<i class="fas fa-paper-plane"></i> Send Message';
            } else if (btnText.includes('Sending')) {
                submitBtn.innerHTML = language === 'fa' ? 
                    '<i class="fas fa-spinner fa-spin"></i> در حال ارسال...' : 
                    '<i class="fas fa-spinner fa-spin"></i> Sending...';
            }
            console.log('✅ Contact form submit button translated');
        }
    }

    /**
     * Translate Form Options
     */
    translateFormOptions(language) {
        // Industry options
        const industryOptions = document.querySelectorAll('#industry option');
        industryOptions.forEach(option => {
            const value = option.value;
            if (value === 'manufacturing') {
                option.textContent = language === 'fa' ? 'تولید' : 'Manufacturing';
            } else if (value === 'chemical') {
                option.textContent = language === 'fa' ? 'پردازش شیمیایی' : 'Chemical Processing';
            } else if (value === 'pharmaceutical') {
                option.textContent = language === 'fa' ? 'داروسازی' : 'Pharmaceutical';
            } else if (value === 'food-beverage') {
                option.textContent = language === 'fa' ? 'غذا و نوشیدنی' : 'Food & Beverage';
            } else if (value === 'municipal') {
                option.textContent = language === 'fa' ? 'شهرداری' : 'Municipal';
            } else if (value === 'mining') {
                option.textContent = language === 'fa' ? 'معدن' : 'Mining';
            } else if (value === 'power') {
                option.textContent = language === 'fa' ? 'تولید برق' : 'Power Generation';
            } else if (value === 'other') {
                option.textContent = language === 'fa' ? 'سایر' : 'Other';
            } else if (value === '') {
                option.textContent = language === 'fa' ? 'انتخاب صنعت' : 'Select Industry';
            }
        });

        // Project type options
        const projectOptions = document.querySelectorAll('#project option');
        projectOptions.forEach(option => {
            const value = option.value;
            if (value === 'new-installation') {
                option.textContent = language === 'fa' ? 'نصب جدید' : 'New Installation';
            } else if (value === 'upgrade') {
                option.textContent = language === 'fa' ? 'ارتقای سیستم' : 'System Upgrade';
            } else if (value === 'maintenance') {
                option.textContent = language === 'fa' ? 'نگهداری' : 'Maintenance';
            } else if (value === 'consultation') {
                option.textContent = language === 'fa' ? 'مشاوره' : 'Consultation';
            } else if (value === 'spare-parts') {
                option.textContent = language === 'fa' ? 'قطعات یدکی' : 'Spare Parts';
            } else if (value === '') {
                option.textContent = language === 'fa' ? 'انتخاب نوع پروژه' : 'Select Project Type';
            }
        });

        // Budget options
        const budgetOptions = document.querySelectorAll('#budget option');
        budgetOptions.forEach(option => {
            const value = option.value;
            if (value === 'under_10k') {
                option.textContent = language === 'fa' ? 'زیر ۱۰,۰۰۰ دلار' : 'Under $10,000';
            } else if (value === '10k_50k') {
                option.textContent = language === 'fa' ? '۱۰,۰۰۰ - ۵۰,۰۰۰ دلار' : '$10,000 - $50,000';
            } else if (value === '50k_100k') {
                option.textContent = language === 'fa' ? '۵۰,۰۰۰ - ۱۰۰,۰۰۰ دلار' : '$50,000 - $100,000';
            } else if (value === '100k_500k') {
                option.textContent = language === 'fa' ? '۱۰۰,۰۰۰ - ۵۰۰,۰۰۰ دلار' : '$100,000 - $500,000';
            } else if (value === '500k_1m') {
                option.textContent = language === 'fa' ? '۵۰۰,۰۰۰ - ۱,۰۰۰,۰۰۰ دلار' : '$500,000 - $1,000,000';
            } else if (value === 'over_1m') {
                option.textContent = language === 'fa' ? 'بالای ۱,۰۰۰,۰۰۰ دلار' : 'Over $1,000,000';
            } else if (value === '') {
                option.textContent = language === 'fa' ? 'انتخاب محدوده بودجه' : 'Select Budget Range';
            }
        });

        // Timeline options
        const timelineOptions = document.querySelectorAll('#timeline option');
        timelineOptions.forEach(option => {
            const value = option.value;
            if (value === 'immediate') {
                option.textContent = language === 'fa' ? 'فوری' : 'Immediate';
            } else if (value === 'within_month') {
                option.textContent = language === 'fa' ? 'ظرف ۱ ماه' : 'Within 1 Month';
            } else if (value === 'within_quarter') {
                option.textContent = language === 'fa' ? 'ظرف ۳ ماه' : 'Within 3 Months';
            } else if (value === 'within_6_months') {
                option.textContent = language === 'fa' ? 'ظرف ۶ ماه' : 'Within 6 Months';
            } else if (value === 'within_year') {
                option.textContent = language === 'fa' ? 'ظرف ۱ سال' : 'Within 1 Year';
            } else if (value === '') {
                option.textContent = language === 'fa' ? 'انتخاب زمان‌بندی' : 'Select Timeline';
            }
        });

        console.log('✅ Contact form options translated');
    }

    /**
     * Translate Contact Information
     */
    translateContactInfo(language) {
        const infoTitle = document.querySelector('.contact-info h2');
        if (infoTitle) {
            infoTitle.innerHTML = language === 'fa' ? 'با ما در تماس باشید' : 'Get in Touch';
            console.log('✅ Contact info title translated');
        }

        // Contact item titles
        const contactItems = document.querySelectorAll('.contact-item h3');
        contactItems.forEach(item => {
            const text = item.textContent.trim();
            if (text.includes('Head Office')) {
                item.innerHTML = language === 'fa' ? 'دفتر مرکزی' : 'Head Office';
            } else if (text.includes('Phone & Fax')) {
                item.innerHTML = language === 'fa' ? 'تلفن و فکس' : 'Phone & Fax';
            } else if (text.includes('Email')) {
                item.innerHTML = language === 'fa' ? 'ایمیل' : 'Email';
            } else if (text.includes('Business Hours')) {
                item.innerHTML = language === 'fa' ? 'ساعات کاری' : 'Business Hours';
            }
        });

        // Contact details
        const contactDetails = document.querySelectorAll('.contact-details p');
        contactDetails.forEach(detail => {
            const text = detail.innerHTML;
            if (text.includes('Phone:')) {
                detail.innerHTML = language === 'fa' ? 
                    'تلفن: <a href="tel:+982122357761">۰۲۱-۲۲۳۵۷۷۶۱-۳</a><br>فکس: ۰۲۱-۲۲۳۵۷۷۶۲<br>موبایل: <a href="tel:+989108108132">۰۹۱۰۸۱۰۸۱۳۲</a>' :
                    'Phone: <a href="tel:+982122357761">021-22357761-3</a><br>Fax: 021-22357762<br>Mobile: <a href="tel:+989108108132">09108108132</a>';
            } else if (text.includes('General Inquiries:')) {
                detail.innerHTML = language === 'fa' ? 
                    'سوالات عمومی:<br><a href="mailto:toolgostar@yahoo.com">toolgostar@yahoo.com</a><br><br>فروش و سفارشات:<br><a href="mailto:sales@toolgostar.com">sales@toolgostar.com</a>' :
                    'General Inquiries:<br><a href="mailto:toolgostar@yahoo.com">toolgostar@yahoo.com</a><br><br>Sales & Orders:<br><a href="mailto:sales@toolgostar.com">sales@toolgostar.com</a>';
            } else if (text.includes('Saturday - Wednesday:')) {
                detail.innerHTML = language === 'fa' ? 
                    'شنبه تا چهارشنبه: ۸:۰۰ - ۱۷:۰۰<br>پنج‌شنبه: ۸:۰۰ - ۱۳:۰۰<br>جمعه: تعطیل<br><small>زمان استاندارد ایران</small>' :
                    'Saturday - Wednesday: 8:00 AM - 5:00 PM<br>Thursday: 8:00 AM - 1:00 PM<br>Friday: Closed<br><small>Iran Standard Time (IRST)</small>';
            }
        });

        console.log('✅ Contact information translated');
    }

    /**
     * Translate Contact Facilities
     */
    translateContactFacilities(language) {
        const facilitiesTitle = document.querySelector('.offices-section h2');
        if (facilitiesTitle) {
            facilitiesTitle.innerHTML = language === 'fa' ? 'تسهیلات ما' : 'Our Facilities';
            console.log('✅ Facilities title translated');
        }

        const facilitiesSubtitle = document.querySelector('.offices-section .page-header p');
        if (facilitiesSubtitle) {
            facilitiesSubtitle.innerHTML = language === 'fa' ? 
                'چندین مکان برای خدمت‌رسانی بهتر' : 
                'Multiple locations to serve you better';
            console.log('✅ Facilities subtitle translated');
        }

        // Office cards
        const officeCards = document.querySelectorAll('.office-card h3');
        officeCards.forEach(card => {
            const text = card.textContent.trim();
            if (text.includes('Head Office')) {
                card.innerHTML = language === 'fa' ? 'دفتر مرکزی' : 'Head Office';
            } else if (text.includes('Manufacturing Plant')) {
                card.innerHTML = language === 'fa' ? 'کارخانه تولید' : 'Manufacturing Plant';
            } else if (text.includes('Service Center')) {
                card.innerHTML = language === 'fa' ? 'مرکز خدمات' : 'Service Center';
            }
        });

        // Office descriptions
        const officeDescriptions = document.querySelectorAll('.office-card p');
        officeDescriptions.forEach(desc => {
            const text = desc.innerHTML;
            if (text.includes('Administration, Sales, and Engineering')) {
                desc.innerHTML = language === 'fa' ? 'اداره، فروش و مهندسی' : 'Administration, Sales, and Engineering';
            } else if (text.includes('Production and Quality Control')) {
                desc.innerHTML = language === 'fa' ? 'تولید و کنترل کیفیت' : 'Production and Quality Control';
            } else if (text.includes('Regional Support')) {
                desc.innerHTML = language === 'fa' ? 'پشتیبانی منطقه‌ای' : 'Regional Support';
            } else if (text.includes('Maintenance and Technical Support')) {
                desc.innerHTML = language === 'fa' ? 'نگهداری و پشتیبانی فنی' : 'Maintenance and Technical Support';
            } else if (text.includes('24/7 Emergency Service Available')) {
                desc.innerHTML = language === 'fa' ? 'خدمات اضطراری ۲۴/۷' : '24/7 Emergency Service Available';
            }
        });

        console.log('✅ Contact facilities translated');
    }

    /**
     * Translate Contact Map
     */
    translateContactMap(language) {
        const mapTitle = document.querySelector('.map-section h2');
        if (mapTitle) {
            mapTitle.innerHTML = language === 'fa' ? 'ما را پیدا کنید' : 'Find Us';
            console.log('✅ Map title translated');
        }

        const mapSubtitle = document.querySelector('.map-section .page-header p');
        if (mapSubtitle) {
            mapSubtitle.innerHTML = language === 'fa' ? 
                'از دفتر مرکزی ما در تهران بازدید کنید' : 
                'Visit our head office in Tehran';
            console.log('✅ Map subtitle translated');
        }

        const mapPlaceholder = document.querySelector('.map-container p');
        if (mapPlaceholder && mapPlaceholder.textContent.includes('Interactive map integration')) {
            mapPlaceholder.innerHTML = language === 'fa' ? 
                'ادغام نقشه تعاملی در اینجا اضافه خواهد شد' : 
                'Interactive map integration would be added here';
            console.log('✅ Map placeholder translated');
        }

        const mapService = document.querySelector('.map-container p:last-child');
        if (mapService && mapService.textContent.includes('Google Maps')) {
            mapService.innerHTML = language === 'fa' ? 
                'سرویس نقشه گوگل یا مشابه' : 
                'Google Maps or similar mapping service';
            console.log('✅ Map service text translated');
        }

        console.log('✅ Contact map translated');
    }

    /**
     * Translate About page specific content
     */
    translateAboutPage(language) {
        console.log(`🔧 translateAboutPage called with language: ${language}`);
        
        // Check if this is the about page by looking for about-specific elements
        const aboutHero = document.querySelector('.hero-about');
        const aboutContent = document.querySelector('.about-content');
        
        console.log(`🔍 Found about hero: ${!!aboutHero}`);
        console.log(`🔍 Found about content: ${!!aboutContent}`);
        console.log(`🔍 Current URL: ${window.location.href}`);
        console.log(`🔍 Current page title: ${document.title}`);
        
        // Also check for other about page elements
        const aboutText = document.querySelector('.about-text');
        const statsSection = document.querySelector('.stats-section');
        const teamSection = document.querySelector('.team-section');
        
        console.log(`🔍 Found about text: ${!!aboutText}`);
        console.log(`🔍 Found stats section: ${!!statsSection}`);
        console.log(`🔍 Found team section: ${!!teamSection}`);
        
        // Check if we're on the about page by URL or elements
        const isAboutPage = window.location.href.includes('about.html') || 
                           window.location.pathname.includes('about') ||
                           aboutHero || aboutContent || aboutText || statsSection || teamSection;
        
        console.log('🔍 About page detection results:');
        console.log('🔍 URL includes about.html:', window.location.href.includes('about.html'));
        console.log('🔍 Pathname includes about:', window.location.pathname.includes('about'));
        console.log('🔍 aboutHero found:', !!aboutHero);
        console.log('🔍 aboutContent found:', !!aboutContent);
        console.log('🔍 aboutText found:', !!aboutText);
        console.log('🔍 statsSection found:', !!statsSection);
        console.log('🔍 teamSection found:', !!teamSection);
        console.log('🔍 Final isAboutPage result:', isAboutPage);
        
        // Force about page detection if URL contains about.html
        if (window.location.href.includes('about.html')) {
            console.log('🔍 Forcing about page detection based on URL');
            // Continue with translations even if elements not found
        } else if (!isAboutPage) {
            console.log('⏭️ Not on about page, skipping about-specific translations');
            return;
        }
        
        console.log('✅ About page detected, proceeding with translations...');
        
        // Debug: List all h1 and h2 elements to see what's on the page
        const allH1s = document.querySelectorAll('h1');
        const allH2s = document.querySelectorAll('h2');
        console.log('🔍 All H1 elements on page:', Array.from(allH1s).map(h => h.textContent));
        console.log('🔍 All H2 elements on page:', Array.from(allH2s).map(h => h.textContent));
        
        // Update page title
        const currentTitle = document.title;
        if (currentTitle.includes('About Us - ToolGostar') || currentTitle.includes('درباره ما - گروه صنعتی طول گستر')) {
            document.title = language === 'fa' ? 
                'درباره ما - گروه صنعتی طول گستر' : 
                'About Us - ToolGostar Industrial Group';
            console.log(`📄 Page title updated to: ${document.title}`);
        }

        // Hero Section
        this.translateAboutHero(language);
        
        // About Content Sections
        this.translateAboutContent(language);
        
        // Stats Section
        this.translateAboutStats(language);
        
        // Team Section
        this.translateAboutTeam(language);
        
        // Values Section
        this.translateAboutValues(language);
        
        // Certifications Section
        this.translateAboutCertifications(language);
    }

    /**
     * Translate About Hero section
     */
    translateAboutHero(language) {
        const heroTitle = document.querySelector('.hero-about h1');
        if (heroTitle) {
            heroTitle.innerHTML = language === 'fa' ? 'درباره طول گستر' : 'About ToolGostar';
            console.log('✅ About hero title translated');
        }

        const heroDesc = document.querySelector('.hero-about p');
        if (heroDesc) {
            heroDesc.innerHTML = language === 'fa' ? 
                'پیشگام در راه‌حل‌های تصفیه آب صنعتی با بیش از ۱۵ سال تعالی مهندسی و نوآوری.' :
                'Leading the way in industrial water treatment solutions with over 15 years of engineering excellence and innovation.';
            console.log('✅ About hero description translated');
        }
    }

    /**
     * Translate About Content sections
     */
    translateAboutContent(language) {
        console.log('🔧 translateAboutContent called');
        
        // Our Story section - find by position (first h2 in about-text)
        const aboutTextSections = document.querySelectorAll('.about-text');
        console.log('🔍 Found about-text sections:', aboutTextSections.length);
        
        if (aboutTextSections.length >= 1) {
            const storyTitle = aboutTextSections[0].querySelector('h2');
            console.log('🔍 Found story title:', !!storyTitle);
            if (storyTitle) {
                storyTitle.innerHTML = language === 'fa' ? 'داستان ما' : 'Our Story';
                console.log('✅ Story title translated');
            }
        }

        const storyParagraphs = document.querySelectorAll('.about-text p');
        if (storyParagraphs.length >= 2) {
            if (language === 'fa') {
                storyParagraphs[0].innerHTML = 'تأسیس شده در سال ۲۰۰۹، گروه صنعتی طول گستر از یک شرکت مهندسی کوچک به یک تولیدکننده پیشرو در تجهیزات تصفیه آب صنعتی تبدیل شده است. سفر ما با یک مأموریت ساده آغاز شد: ارائه راه‌حل‌های قابل اعتماد، کارآمد و نوآورانه برای چالش‌های تصفیه آب.';
                storyParagraphs[1].innerHTML = 'امروز، ما به مشتریان در بیش از ۱۵ کشور خدمت می‌کنیم و فناوری پیشرفته و تخصص بی‌نظیر را در هر پروژه ارائه می‌دهیم. تعهد ما به کیفیت و نوآوری ما را به یک شریک قابل اعتماد برای صنایع در سراسر جهان تبدیل کرده است.';
            } else {
                storyParagraphs[0].innerHTML = 'Founded in 2009, ToolGostar Industrial Group has grown from a small engineering firm to a leading manufacturer of industrial water treatment equipment. Our journey began with a simple mission: to provide reliable, efficient, and innovative solutions for water treatment challenges.';
                storyParagraphs[1].innerHTML = 'Today, we serve clients across 15+ countries, delivering cutting-edge technology and unmatched expertise in every project. Our commitment to quality and innovation has made us a trusted partner for industries worldwide.';
            }
        }

        // Our Mission section - find by position (second h2 in about-text)
        if (aboutTextSections.length >= 2) {
            const missionTitle = aboutTextSections[1].querySelector('h2');
            if (missionTitle) {
                missionTitle.innerHTML = language === 'fa' ? 'ماموریت ما' : 'Our Mission';
                console.log('✅ Mission title translated');
            }
        }

        const missionParagraphs = document.querySelectorAll('.about-text p');
        if (missionParagraphs.length >= 2) {
            if (language === 'fa') {
                missionParagraphs[0].innerHTML = 'ارائه راه‌حل‌های نوآورانه، قابل اعتماد و پایدار تصفیه آب که به مشتریان ما در دستیابی به اهداف عملیاتی خود کمک می‌کند و در عین حال از محیط زیست محافظت می‌کند. ما متعهد به تعالی مهندسی، رضایت مشتری و بهبود مستمر هستیم.';
                missionParagraphs[1].innerHTML = 'چشم‌انداز ما این است که رهبر جهانی در فناوری تصفیه آب صنعتی باشیم و استانداردهای جدیدی برای کارایی، قابلیت اطمینان و مسئولیت‌پذیری زیست‌محیطی تعیین کنیم.';
            } else {
                missionParagraphs[0].innerHTML = 'To provide innovative, reliable, and sustainable water treatment solutions that help our clients achieve their operational goals while protecting the environment. We are committed to engineering excellence, customer satisfaction, and continuous improvement.';
                missionParagraphs[1].innerHTML = 'Our vision is to be the global leader in industrial water treatment technology, setting new standards for efficiency, reliability, and environmental responsibility.';
            }
        }

        console.log('✅ About content sections translated');
    }

    /**
     * Translate About Stats section
     */
    translateAboutStats(language) {
        const statsTitle = document.querySelector('.stats-section h2');
        if (statsTitle) {
            statsTitle.innerHTML = language === 'fa' ? 'دستاوردهای ما' : 'Our Achievements';
        }

        const statsSubtitle = document.querySelector('.stats-section .page-header p');
        if (statsSubtitle) {
            statsSubtitle.innerHTML = language === 'fa' ? 
                'اعدادی که نشان‌دهنده تجربه و تعهد ما به تعالی است' :
                'Numbers that speak to our experience and commitment to excellence';
        }

        const statLabels = document.querySelectorAll('.stats-section .stat-label');
        const statTranslations = [
            { en: 'Projects Completed', fa: 'پروژه تکمیل شده' },
            { en: 'Expert Engineers', fa: 'مهندس متخصص' },
            { en: 'Years Experience', fa: 'سال تجربه' }
        ];

        statLabels.forEach((label, index) => {
            if (statTranslations[index]) {
                const translatedText = language === 'fa' ? statTranslations[index].fa : statTranslations[index].en;
                label.innerHTML = language === 'fa' ? 
                    this.convertToFarsiNumbers(translatedText) : 
                    this.convertToEnglishNumbers(translatedText);
            }
        });

        // Convert stat numbers to Farsi
        const statNumbers = document.querySelectorAll('.stats-section .stat-number');
        statNumbers.forEach(statNumber => {
            const originalText = statNumber.textContent;
            statNumber.innerHTML = language === 'fa' ? 
                this.convertToFarsiNumbers(originalText) : 
                this.convertToEnglishNumbers(originalText);
        });

        console.log('✅ About stats section translated');
    }

    /**
     * Translate About Team section
     */
    translateAboutTeam(language) {
        const teamTitle = document.querySelector('.team-section h2');
        if (teamTitle) {
            teamTitle.innerHTML = language === 'fa' ? 'تیم رهبری ما' : 'Our Leadership Team';
        }

        const teamSubtitle = document.querySelector('.team-section .page-header p');
        if (teamSubtitle) {
            teamSubtitle.innerHTML = language === 'fa' ? 
                'با متخصصانی آشنا شوید که موفقیت و نوآوری شرکت ما را هدایت می‌کنند' :
                'Meet the experts who drive our company\'s success and innovation';
        }

        const positions = document.querySelectorAll('.team-member .position');
        const positionTranslations = [
            { en: 'Chief Executive Officer', fa: 'مدیرعامل' },
            { en: 'Chief Technology Officer', fa: 'مدیر فناوری' },
            { en: 'Operations Director', fa: 'مدیر عملیات' },
            { en: 'Engineering Manager', fa: 'مدیر مهندسی' }
        ];

        positions.forEach((position, index) => {
            if (positionTranslations[index]) {
                position.innerHTML = language === 'fa' ? positionTranslations[index].fa : positionTranslations[index].en;
            }
        });

        const teamDescriptions = document.querySelectorAll('.team-member p');
        const descriptionTranslations = [
            {
                en: 'Leading ToolGostar with over 20 years of experience in industrial engineering and water treatment technology.',
                fa: 'هدایت طول گستر با بیش از ۲۰ سال تجربه در مهندسی صنعتی و فناوری تصفیه آب.'
            },
            {
                en: 'Expert in advanced water treatment technologies with PhD in Environmental Engineering from Tehran University.',
                fa: 'متخصص در فناوری‌های پیشرفته تصفیه آب با مدرک دکتری مهندسی محیط زیست از دانشگاه تهران.'
            },
            {
                en: 'Manages global operations and project delivery with expertise in international business development.',
                fa: 'مدیریت عملیات جهانی و تحویل پروژه با تخصص در توسعه کسب‌وکار بین‌المللی.'
            },
            {
                en: 'Leads our engineering team in developing innovative solutions for complex water treatment challenges.',
                fa: 'هدایت تیم مهندسی ما در توسعه راه‌حل‌های نوآورانه برای چالش‌های پیچیده تصفیه آب.'
            }
        ];

        teamDescriptions.forEach((desc, index) => {
            if (descriptionTranslations[index]) {
                const translatedText = language === 'fa' ? descriptionTranslations[index].fa : descriptionTranslations[index].en;
                desc.innerHTML = language === 'fa' ? 
                    this.convertToFarsiNumbers(translatedText) : 
                    this.convertToEnglishNumbers(translatedText);
            }
        });

        console.log('✅ About team section translated');
    }

    /**
     * Translate About Values section
     */
    translateAboutValues(language) {
        const valuesTitle = document.querySelector('.values-section h2');
        if (valuesTitle) {
            valuesTitle.innerHTML = language === 'fa' ? 'ارزش‌های اصلی ما' : 'Our Core Values';
        }

        const valuesSubtitle = document.querySelector('.values-section .page-header p');
        if (valuesSubtitle) {
            valuesSubtitle.innerHTML = language === 'fa' ? 
                'اصولی که همه کارهای ما را هدایت می‌کند' :
                'The principles that guide everything we do';
        }

        const valueTitles = document.querySelectorAll('.value-item h3');
        const valueTitleTranslations = [
            { en: 'Excellence', fa: 'تعالی' },
            { en: 'Innovation', fa: 'نوآوری' },
            { en: 'Integrity', fa: 'صداقت' },
            { en: 'Sustainability', fa: 'پایداری' }
        ];

        valueTitles.forEach((title, index) => {
            if (valueTitleTranslations[index]) {
                title.innerHTML = language === 'fa' ? valueTitleTranslations[index].fa : valueTitleTranslations[index].en;
            }
        });

        const valueDescriptions = document.querySelectorAll('.value-item p');
        const valueDescTranslations = [
            {
                en: 'We strive for the highest standards in everything we do, from product design to customer service.',
                fa: 'ما برای بالاترین استانداردها در همه کارهایمان تلاش می‌کنیم، از طراحی محصول تا خدمات مشتری.'
            },
            {
                en: 'We continuously invest in research and development to bring cutting-edge solutions to our clients.',
                fa: 'ما به طور مداوم در تحقیق و توسعه سرمایه‌گذاری می‌کنیم تا راه‌حل‌های پیشرفته را به مشتریانمان ارائه دهیم.'
            },
            {
                en: 'We conduct business with honesty, transparency, and respect for all stakeholders.',
                fa: 'ما کسب‌وکار را با صداقت، شفافیت و احترام به همه ذینفعان انجام می‌دهیم.'
            },
            {
                en: 'We are committed to environmental responsibility and sustainable business practices.',
                fa: 'ما متعهد به مسئولیت‌پذیری زیست‌محیطی و شیوه‌های کسب‌وکار پایدار هستیم.'
            }
        ];

        valueDescriptions.forEach((desc, index) => {
            if (valueDescTranslations[index]) {
                desc.innerHTML = language === 'fa' ? valueDescTranslations[index].fa : valueDescTranslations[index].en;
            }
        });

        console.log('✅ About values section translated');
    }

    /**
     * Translate About Certifications section
     */
    translateAboutCertifications(language) {
        const certTitle = document.querySelector('.certifications-section h2');
        if (certTitle) {
            certTitle.innerHTML = language === 'fa' ? 'گواهینامه‌ها و استانداردها' : 'Certifications & Standards';
        }

        const certSubtitle = document.querySelector('.certifications-section .page-header p');
        if (certSubtitle) {
            certSubtitle.innerHTML = language === 'fa' ? 
                'تعهد ما به کیفیت توسط گواهینامه‌های بین‌المللی تأیید شده است' :
                'Our commitment to quality is validated by international certifications';
        }

        const certDescriptions = document.querySelectorAll('.cert-description');
        const certDescTranslations = [
            { en: 'Quality Management System', fa: 'سیستم مدیریت کیفیت' },
            { en: 'Environmental Management', fa: 'مدیریت زیست‌محیطی' },
            { en: 'Occupational Health & Safety', fa: 'سلامت و ایمنی شغلی' },
            { en: 'European Conformity', fa: 'انطباق اروپایی' }
        ];

        certDescriptions.forEach((desc, index) => {
            if (certDescTranslations[index]) {
                desc.innerHTML = language === 'fa' ? certDescTranslations[index].fa : certDescTranslations[index].en;
            }
        });

        console.log('✅ About certifications section translated');
    }

    /**
     * Translate About page footer specifically
     */
    translateAboutFooter(language) {
        console.log('🔧 translateAboutFooter called with language:', language);
        
        // Company section links
        const companyLinks = document.querySelectorAll('.footer-section a');
        companyLinks.forEach(link => {
            const text = link.textContent.trim();
            if (text === 'About Us' || text === 'درباره ما') {
                link.innerHTML = language === 'fa' ? 'درباره ما' : 'About Us';
            } else if (text === 'Our Team' || text === 'تیم ما') {
                link.innerHTML = language === 'fa' ? 'تیم ما' : 'Our Team';
            } else if (text === 'Our Values' || text === 'ارزش‌های ما') {
                link.innerHTML = language === 'fa' ? 'ارزش‌های ما' : 'Our Values';
            } else if (text === 'Careers' || text === 'فرصت‌های شغلی') {
                link.innerHTML = language === 'fa' ? 'فرصت‌های شغلی' : 'Careers';
            }
        });
        
        console.log('✅ translateAboutFooter completed');
    }

    /**
     * Translate contact information in footer
     */
    translateContactInfo(language) {
        console.log('🔧 translateContactInfo called with language:', language);
        
        // Contact info labels
        const contactLabels = {
            'Main Office': { en: 'Main Office', fa: 'دفتر مرکزی' },
            'Factory': { en: 'Factory', fa: 'کارخانه' },
            'Phone': { en: 'Phone', fa: 'تلفن' },
            'Mobile': { en: 'Mobile', fa: 'موبایل' },
            'Fax': { en: 'Fax', fa: 'فکس' },
            'Email': { en: 'Email', fa: 'ایمیل' }
        };
        
        // Find all contact label elements
        const contactLabelElements = document.querySelectorAll('.contact-label');
        contactLabelElements.forEach(element => {
            const text = element.textContent.trim();
            if (contactLabels[text]) {
                const translation = contactLabels[text];
                element.innerHTML = language === 'fa' ? translation.fa : translation.en;
            }
        });
        
        console.log('✅ translateContactInfo completed');
    }

    /**
     * Translate contact team section
     */
    translateContactTeam(language) {
        console.log('🔧 translateContactTeam called with language:', language);
        console.log('🔧 Available translations:', this.translations[language]);
        console.log('🔧 Contact team translations:', this.translations[language]?.contact?.team);
        
        // Team section title and subtitle
        const teamTitle = document.querySelector('[data-i18n="contact.team.title"]');
        const teamSubtitle = document.querySelector('[data-i18n="contact.team.subtitle"]');
        
        console.log('🔧 Found team title element:', !!teamTitle);
        console.log('🔧 Found team subtitle element:', !!teamSubtitle);
        
        if (teamTitle) {
            if (this.translations[language]?.contact?.team?.title) {
                teamTitle.textContent = this.translations[language].contact.team.title;
                console.log('✅ Team title translated:', this.translations[language].contact.team.title);
            } else {
                // Fallback to default text
                teamTitle.textContent = language === 'fa' ? 'با تیم ما آشنا شوید' : 'Meet Our Team';
                console.log('⚠️ Using fallback for team title');
            }
        }
        
        if (teamSubtitle) {
            if (this.translations[language]?.contact?.team?.subtitle) {
                teamSubtitle.textContent = this.translations[language].contact.team.subtitle;
                console.log('✅ Team subtitle translated:', this.translations[language].contact.team.subtitle);
            } else {
                // Fallback to default text
                teamSubtitle.textContent = language === 'fa' ? 
                    'متخصصان با تجربه ما آماده کمک به نیازهای تصفیه آب شما هستند' : 
                    'Our experienced professionals are ready to help with your water treatment needs';
                console.log('⚠️ Using fallback for team subtitle');
            }
        }
        
        // Sales team section
        const salesTitle = document.querySelector('[data-i18n="contact.team.sales.title"]');
        const salesDescription = document.querySelector('[data-i18n="contact.team.sales.description"]');
        
        if (salesTitle) {
            if (this.translations[language]?.contact?.team?.sales?.title) {
                salesTitle.textContent = this.translations[language].contact.team.sales.title;
            } else {
                salesTitle.textContent = language === 'fa' ? 'فروش و توسعه کسب‌وکار' : 'Sales & Business Development';
            }
        }
        
        if (salesDescription) {
            if (this.translations[language]?.contact?.team?.sales?.description) {
                salesDescription.textContent = this.translations[language].contact.team.sales.description;
            } else {
                salesDescription.textContent = language === 'fa' ? 
                    'تیم فروش ما آماده بحث در مورد نیازمندی‌های پروژه شما و ارائه پیش‌فاکتورهای دقیق برای راه‌حل‌های تصفیه آب است.' : 
                    'Our sales team is ready to discuss your project requirements and provide detailed quotes for water treatment solutions.';
            }
        }
        
        // Technical team section
        const technicalTitle = document.querySelector('[data-i18n="contact.team.technical.title"]');
        const technicalDescription = document.querySelector('[data-i18n="contact.team.technical.description"]');
        
        if (technicalTitle) {
            if (this.translations[language]?.contact?.team?.technical?.title) {
                technicalTitle.textContent = this.translations[language].contact.team.technical.title;
            } else {
                technicalTitle.textContent = language === 'fa' ? 'پشتیبانی فنی و مهندسی' : 'Technical Support & Engineering';
            }
        }
        
        if (technicalDescription) {
            if (this.translations[language]?.contact?.team?.technical?.description) {
                technicalDescription.textContent = this.translations[language].contact.team.technical.description;
            } else {
                technicalDescription.textContent = language === 'fa' ? 
                    'تیم مهندسی ما مشاوره فنی، طراحی سیستم و پشتیبانی مداوم برای تمام چالش‌های تصفیه آب شما ارائه می‌دهد.' : 
                    'Our engineering team provides technical consultation, system design, and ongoing support for all your water treatment challenges.';
            }
        }
        
        // Contact and email labels
        const contactLabels = document.querySelectorAll('[data-i18n="contact.team.contact"]');
        const emailLabels = document.querySelectorAll('[data-i18n="contact.team.email"]');
        
        contactLabels.forEach(label => {
            if (this.translations[language]?.contact?.team?.contact) {
                label.textContent = this.translations[language].contact.team.contact;
            } else {
                label.textContent = language === 'fa' ? 'تماس:' : 'Contact:';
            }
        });
        
        emailLabels.forEach(label => {
            if (this.translations[language]?.contact?.team?.email) {
                label.textContent = this.translations[language].contact.team.email;
            } else {
                label.textContent = language === 'fa' ? 'ایمیل:' : 'Email:';
            }
        });
        
        console.log('✅ translateContactTeam completed');
    }

}

// Create global instance and initialize when DOM is ready
console.log('🔧 Creating i18n instance...');
window.i18n = new I18n();
console.log('✅ i18n instance created:', window.i18n);

// Ensure initialization happens after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.i18n && !window.i18n.initialized) {
            window.i18n.init();
        }
    });
} else {
    // DOM is already ready
    if (window.i18n && !window.i18n.initialized) {
        window.i18n.init();
    }

}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}
