/**
 * Seed All Products
 * Creates all 15 products from the default-last version
 * Properly categorized into new 5-category structure
 */

require('dotenv').config();
const { sequelize, Product, ProductCategory } = require('./src/models');

async function seedAllProducts() {
    try {
        console.log('🌱 Starting product seeding...');
        console.log('═══════════════════════════════════════════════════════════');

        // Get all categories
        const categories = {
            waterWastewater: await ProductCategory.findOne({ where: { slug: 'water-wastewater-treatment' }}),
            solidMaterial: await ProductCategory.findOne({ where: { slug: 'solid-material-storage-transfer' }}),
            mixers: await ProductCategory.findOne({ where: { slug: 'submersible-mixers-flow-makers' }}),
            pumps: await ProductCategory.findOne({ where: { slug: 'pumps' }}),
            others: await ProductCategory.findOne({ where: { slug: 'others' }})
        };

        // Verify all categories exist
        if (!categories.waterWastewater || !categories.solidMaterial || !categories.mixers || !categories.pumps || !categories.others) {
            console.error('❌ One or more categories not found. Please run migrate-product-categories.js first.');
            return;
        }

        console.log('✅ All categories found');
        console.log('\n📦 Creating products...\n');

        // =======================================================================
        // CATEGORY 1: Water & Wastewater Treatment Equipment (8 products)
        // =======================================================================

        const waterWastewaterProducts = [
            {
                name: { en: 'Sluice Gate', fa: 'دریچه کشویی' },
                slug: 'sluice-gate',
                categoryId: categories.waterWastewater.id,
                status: 'active',
                shortDescription: {
                    en: 'Isolation and cutting off the water flow at plants. Installation on canals, with none-rising shaft and rising shaft.',
                    fa: 'جداسازی و قطع جریان آب در کارخانه‌ها. نصب روی کانال‌ها، با شفت غیربالارونده و شفت بالارونده.'
                },
                features: {
                    en: ['Steel with protective layer', 'Stainless steel and EPDM', 'Single shaft: 400-1200mm', 'Two shafts: above 1200mm'],
                    fa: ['فولاد با لایه محافظ', 'فولاد ضد زنگ و EPDM', 'شفت تکی: 400-1200 میلی‌متر', 'دو شفت: بالای 1200 میلی‌متر']
                },
                featuredImage: '/default/products/sluice-gate/Sluice-Gate-Motorized.jpg',
                icon: 'fa-water',
                featured: true,
                isActive: true,
                sortOrder: 1
            },
            {
                name: { en: 'Fine Screen', fa: 'صافی ریز' },
                slug: 'fine-screen',
                categoryId: categories.waterWastewater.id,
                status: 'active',
                shortDescription: {
                    en: 'Fine screen trash removal with 10mm mesh.',
                    fa: 'حذف زباله با صافی ریز با مش 10 میلی‌متر.'
                },
                features: {
                    en: ['Stainless steel construction', 'Mesh: 5 to 10mm', '90 degree slope', 'High efficiency removal'],
                    fa: ['ساختار فولاد ضد زنگ', 'مش: 5 تا 10 میلی‌متر', 'شیب 90 درجه', 'حذف با کارایی بالا']
                },
                featuredImage: '/default/products/fine-screen/Fne-Screen.jpg',
                icon: 'fa-filter',
                featured: true,
                isActive: true,
                sortOrder: 2
            },
            {
                name: { en: 'Grit Separator', fa: 'جداساز شن' },
                slug: 'grit-separator',
                categoryId: categories.waterWastewater.id,
                status: 'active',
                shortDescription: {
                    en: 'Separation and removal of sand and grit from wastewater.',
                    fa: 'جداسازی و حذف شن و ماسه از فاضلاب.'
                },
                features: {
                    en: ['Stainless steel material', 'Circular or rectangular design', 'Mechanical rake system', 'Grit collection chamber'],
                    fa: ['جنس فولاد ضد زنگ', 'طراحی دایره‌ای یا مستطیلی', 'سیستم چنگک مکانیکی', 'محفظه جمع‌آوری شن']
                },
                featuredImage: '/default/products/grit-separator/Grit-Separator.jpg',
                icon: 'fa-recycle',
                featured: true,
                isActive: true,
                sortOrder: 3
            },
            {
                name: { en: 'Penstock', fa: 'پنستاک' },
                slug: 'penstock',
                categoryId: categories.waterWastewater.id,
                status: 'active',
                shortDescription: {
                    en: 'To cut off input flow on flange pipe with none-rising shaft.',
                    fa: 'برای قطع جریان ورودی روی لوله فلنج با شفت غیربالارونده.'
                },
                features: {
                    en: ['Steel with protective layer', 'Stainless steel and EPDM', 'Single shaft: 400-1200mm', 'Two shafts: above 1200mm'],
                    fa: ['فولاد با لایه محافظ', 'فولاد ضد زنگ و EPDM', 'شفت تکی: 400-1200 میلی‌متر', 'دو شفت: بالای 1200 میلی‌متر']
                },
                featuredImage: '/default/products/penstock/DSC00077.jpg',
                icon: 'fa-door-closed',
                featured: true,
                isActive: true,
                sortOrder: 4
            },
            {
                name: { en: 'Pressure Vessel Filter', fa: 'فیلتر مخزن تحت فشار' },
                slug: 'pressure-vessel',
                categoryId: categories.waterWastewater.id,
                status: 'active',
                shortDescription: {
                    en: 'Filtration through a sand filter, with a pressure vessel EN 13445 or ASME-VIII – div1.',
                    fa: 'فیلتراسیون از طریق فیلتر شنی، با مخزن تحت فشار EN 13445 یا ASME-VIII – div1.'
                },
                features: {
                    en: ['Steel with protection layer', 'ASME flanged & dished design', 'EN 13445 certified', 'Sand filtration system'],
                    fa: ['فولاد با لایه محافظ', 'طراحی فلنج و کاسه ASME', 'گواهی EN 13445', 'سیستم فیلتراسیون شنی']
                },
                featuredImage: '/default/products/pressure-vessel/scan0002.jpg',
                icon: 'fa-filter',
                featured: true,
                isActive: true,
                sortOrder: 5
            },
            {
                name: { en: 'Rotary Bridge', fa: 'پل چرخشی' },
                slug: 'rotary-bridge',
                categoryId: categories.waterWastewater.id,
                status: 'active',
                shortDescription: {
                    en: 'Full and Half Bridge Clarifier. Clarification of the Purity section with full and half model bridge.',
                    fa: 'کلاریفایر پل کامل و نیمه. شفاف‌سازی بخش خلوص با پل مدل کامل و نیمه.'
                },
                features: {
                    en: ['Steel with protection layer', 'Length: 8 to 40m', 'Full bridge or half bridge', 'Rotary mechanism'],
                    fa: ['فولاد با لایه محافظ', 'طول: 8 تا 40 متر', 'پل کامل یا نیمه', 'مکانیزم چرخشی']
                },
                featuredImage: '/default/products/rotary-bridge/HRBridge-01.jpg',
                icon: 'fa-bridge',
                featured: true,
                isActive: true,
                sortOrder: 6
            },
            {
                name: { en: 'Thickener', fa: 'غلظت‌دهنده' },
                slug: 'thickener',
                categoryId: categories.waterWastewater.id,
                status: 'active',
                shortDescription: {
                    en: 'Sludge thickener up to 4%, rotary movement with torque control.',
                    fa: 'غلظت‌دهنده لجن تا 4%، حرکت چرخشی با کنترل گشتاور.'
                },
                features: {
                    en: ['Steel with protection layer', 'Length: 4 to 40m', 'Diameter: 4m to 40m', 'Torque control system'],
                    fa: ['فولاد با لایه محافظ', 'طول: 4 تا 40 متر', 'قطر: 4 تا 40 متر', 'سیستم کنترل گشتاور']
                },
                featuredImage: '/default/products/thickener/header.jpg',
                icon: 'fa-circle-notch',
                featured: true,
                isActive: true,
                sortOrder: 7
            }
        ];

        // =======================================================================
        // CATEGORY 2: Solid Material Storage & Transfer Equipment (1 product)
        // =======================================================================

        const solidMaterialProducts = [
            {
                name: { en: 'Screw Conveyor', fa: 'نوار نقاله پیچی' },
                slug: 'screw-conveyor',
                categoryId: categories.solidMaterial.id,
                status: 'active',
                shortDescription: {
                    en: 'Transformation of dry and semi-dry material such as powder, sludge, and granola.',
                    fa: 'تبدیل مواد خشک و نیمه‌خشک مانند پودر، لجن و گرانولا.'
                },
                features: {
                    en: ['Steel with protection layer', 'Length: 1.5 to 20m', 'Slope: 0 to 25 degree', 'Suitable for powder, sludge'],
                    fa: ['فولاد با لایه محافظ', 'طول: 1.5 تا 20 متر', 'شیب: 0 تا 25 درجه', 'مناسب برای پودر، لجن']
                },
                featuredImage: '/default/products/screw-conveyor/PHOT0085.jpg',
                icon: 'fa-cog',
                featured: true,
                isActive: true,
                sortOrder: 8
            }
        ];

        // =======================================================================
        // CATEGORY 3: Submersible Mixers & Flow Makers (4 products)
        // =======================================================================

        const mixersProducts = [
            {
                name: { en: 'Aerator', fa: 'هواکش' },
                slug: 'aerator',
                categoryId: categories.mixers.id,
                status: 'active',
                shortDescription: {
                    en: 'To insert air and mix water in the Aerator section.',
                    fa: 'برای تزریق هوا و مخلوط کردن آب در بخش هواکش.'
                },
                features: {
                    en: ['Frame: Steel with protective layer', 'Blade: Composite or steel', 'Power: 11 to 22 kW', 'Speed: 50 to 100 rpm'],
                    fa: ['قاب: فولاد با لایه محافظ', 'تیغه: کامپوزیت یا فولاد', 'قدرت: 11 تا 22 کیلووات', 'سرعت: 50 تا 100 دور در دقیقه']
                },
                featuredImage: '/default/products/aerator/PICT0033.jpg',
                icon: 'fa-fan',
                featured: true,
                isActive: true,
                sortOrder: 9
            },
            {
                name: { en: 'CO2 Generator', fa: 'تولیدکننده CO2' },
                slug: 'co2-generator',
                categoryId: categories.mixers.id,
                status: 'active',
                shortDescription: {
                    en: 'Reduction of wastewater pH.',
                    fa: 'کاهش pH فاضلاب.'
                },
                features: {
                    en: ['Steel with protective layer', 'pH working range: 9 to 11', 'Automatic pH control', 'CO2 injection mechanism'],
                    fa: ['فولاد با لایه محافظ', 'محدوده کار pH: 9 تا 11', 'کنترل خودکار pH', 'مکانیزم تزریق CO2']
                },
                featuredImage: '/default/products/co2-generator/co2-3-1.jpg',
                galleryImages: [
                    '/default/products/co2-generator/CO2-Generator-En-1200x700.jpg',
                    '/default/products/co2-generator/CO2-Generator-En-800x450.jpg',
                    '/default/products/co2-generator/CO2-Generator-En-600x600.jpg'
                ],
                catalogUrl: '/default/products/co2-generator/CO2-Generator-Catalog.pdf',
                icon: 'fa-industry',
                featured: true,
                isActive: true,
                sortOrder: 10
            },
            {
                name: { en: 'Flash Mixer', fa: 'همزن فلش' },
                slug: 'flash-mixer',
                categoryId: categories.mixers.id,
                status: 'active',
                shortDescription: {
                    en: 'To full micturition of the vessel or container.',
                    fa: 'برای مخلوط کردن کامل مخزن یا ظرف.'
                },
                features: {
                    en: ['Steel with protective layer', 'Power: 0.18 to 37 kW', 'Speed: 50 to 700 rpm', 'Average gradient: 80 to 1000 l/s'],
                    fa: ['فولاد با لایه محافظ', 'قدرت: 0.18 تا 37 کیلووات', 'سرعت: 50 تا 700 دور در دقیقه', 'گرادیان متوسط: 80 تا 1000 لیتر بر ثانیه']
                },
                featuredImage: '/default/products/flash-mixer/DSC00010.jpg',
                catalogUrl: '/default/products/ordinary-flash-mixer/Ordinary-Flash-Mixer-Catalog.pdf',
                icon: 'fa-blender',
                featured: true,
                isActive: true,
                sortOrder: 11
            },
            {
                name: { en: 'Flocculator', fa: 'فلوکولاتور' },
                slug: 'flocculator',
                categoryId: categories.mixers.id,
                status: 'active',
                shortDescription: {
                    en: 'Smooth mixing for coagulation process.',
                    fa: 'مخلوط کردن نرم برای فرآیند انعقاد.'
                },
                features: {
                    en: ['Steel with protective layer', 'Gentle mixing mechanism', 'Variable speed control', 'Multiple paddle configurations'],
                    fa: ['فولاد با لایه محافظ', 'مکانیزم مخلوط کردن ملایم', 'کنترل سرعت متغیر', 'پیکربندی‌های متعدد پدال']
                },
                featuredImage: '/default/products/flocculator/DSC00038.jpg',
                galleryImages: [
                    '/default/products/flocculator/Flocculator-En-1200x700.jpg',
                    '/default/products/flocculator/Flocculator-En-800x450.jpg'
                ],
                catalogUrl: '/default/products/flocculator/Flocculator-Catalog.pdf',
                icon: 'fa-cogs',
                featured: true,
                isActive: true,
                sortOrder: 12
            }
        ];

        // =======================================================================
        // CATEGORY 4: Pumps (3 products)
        // =======================================================================

        const pumpsProducts = [
            {
                name: { en: 'Submersible Sewage Pumps', fa: 'پمپ‌های فاضلاب غوطه‌ور' },
                slug: 'submersible-sewage-pumps',
                categoryId: categories.pumps.id,
                status: 'active',
                shortDescription: {
                    en: 'High-performance submersible pumps designed for sewage and wastewater applications.',
                    fa: 'پمپ‌های غوطه‌ور با عملکرد بالا طراحی شده برای کاربردهای فاضلاب و پساب.'
                },
                features: {
                    en: ['Cast iron housing', 'Stainless steel impeller', 'Clog-free impeller', 'Thermal overload protection'],
                    fa: ['محفظه چدن', 'پروانه فولاد ضد زنگ', 'پروانه بدون گرفتگی', 'محافظت از اضافه بار حرارتی']
                },
                featuredImage: '/default/products/submersible-pumps/IMG_20220515_121737.jpg',
                icon: 'fa-tint',
                featured: true,
                isActive: true,
                sortOrder: 13
            },
            {
                name: { en: 'Flow Maker', fa: 'سازنده جریان' },
                slug: 'flow-maker',
                categoryId: categories.pumps.id,
                status: 'active',
                shortDescription: {
                    en: 'Specialized submersible mixer designed to create flow patterns in water treatment basins.',
                    fa: 'مخلوط‌کن غوطه‌ور تخصصی طراحی شده برای ایجاد الگوهای جریان در حوضچه‌های تصفیه آب.'
                },
                features: {
                    en: ['Stainless steel construction', 'Submersible mixer', 'Directional flow control', 'Low maintenance design'],
                    fa: ['ساختار فولاد ضد زنگ', 'مخلوط‌کن غوطه‌ور', 'کنترل جریان جهت‌دار', 'طراحی کم‌نگهداری']
                },
                featuredImage: '/default/products/flow-maker/IMG-20210731-WA0008.jpg',
                icon: 'fa-water',
                featured: true,
                isActive: true,
                sortOrder: 14
            },
            {
                name: { en: 'Hot Oil Pumps', fa: 'پمپ‌های روغن داغ' },
                slug: 'hot-oil-pumps',
                categoryId: categories.pumps.id,
                status: 'active',
                shortDescription: {
                    en: 'Specialized pumps designed for high-temperature oil circulation in industrial heating systems.',
                    fa: 'پمپ‌های تخصصی طراحی شده برای گردش روغن با دمای بالا در سیستم‌های گرمایش صنعتی.'
                },
                features: {
                    en: ['High-temperature resistant steel', 'Special sealing systems', 'Thermal expansion compensation', 'Mechanical seal cooling'],
                    fa: ['فولاد مقاوم در برابر دمای بالا', 'سیستم‌های آب‌بندی خاص', 'جبران انبساط حرارتی', 'خنک‌سازی آب‌بند مکانیکی']
                },
                featuredImage: '/default/products/hot-oil-pumps/IMG_20230111_103700.jpg',
                icon: 'fa-fire',
                featured: true,
                isActive: true,
                sortOrder: 15
            }
        ];

        // =======================================================================
        // CREATE ALL PRODUCTS
        // =======================================================================

        const allProducts = [
            ...waterWastewaterProducts,
            ...solidMaterialProducts,
            ...mixersProducts,
            ...pumpsProducts
        ];

        let createdCount = 0;
        for (const productData of allProducts) {
            try {
                await Product.create(productData);
                console.log(`✅ Created: ${productData.name.en} (${productData.name.fa})`);
                createdCount++;
            } catch (error) {
                console.error(`❌ Failed to create ${productData.name.en}:`, error.message);
            }
        }

        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('🎉 Product seeding completed!');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`\n📊 Summary:`);
        console.log(`   - Water & Wastewater Treatment: ${waterWastewaterProducts.length} products`);
        console.log(`   - Solid Material Storage & Transfer: ${solidMaterialProducts.length} product`);
        console.log(`   - Submersible Mixers & Flow Makers: ${mixersProducts.length} products`);
        console.log(`   - Pumps: ${pumpsProducts.length} products`);
        console.log(`   - Total created: ${createdCount}/${allProducts.length}`);
        console.log(`\n📦 Total products in database: ${await Product.count()}`);

    } catch (error) {
        console.error('\n❌ Product seeding failed:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        await sequelize.close();
        console.log('\n👋 Database connection closed');
    }
}

// Run the script
console.log('🚀 ToolGostar Product Seeding');
console.log('═══════════════════════════════════════════════════════════');
seedAllProducts();

