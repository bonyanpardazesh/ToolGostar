/**
 * Create Default Products
 * Add real products from backup folder with actual data only
 */

require('dotenv').config();
const { sequelize, Product, ProductCategory } = require('./src/models');
const fs = require('fs');
const path = require('path');

async function createDefaultProducts() {
    try {
        console.log('🏭 Creating default products with real data...');

        // Get the first category (Water Treatment Systems)
        const waterTreatmentCategory = await ProductCategory.findOne({
            where: { slug: 'water-treatment-systems' }
        });

        if (!waterTreatmentCategory) {
            console.error('❌ Water Treatment Systems category not found');
            return;
        }

        // Real products from backup folder - only using actual data
        const realProducts = [
            {
                name: {
                    en: 'CO2 Generator',
                    fa: 'تولیدکننده CO2'
                },
                slug: 'co2-generator',
                categoryId: waterTreatmentCategory.id,
                status: 'active',
                shortDescription: {
                    en: 'CO2 Generator for water treatment applications',
                    fa: 'تولیدکننده CO2 برای کاربردهای تصفیه آب'
                },
                // Using actual image paths from backup
                featuredImage: '/default/products/co2-generator/CO2-Generator-En.jpg',
                galleryImages: [
                    '/default/products/co2-generator/CO2-Generator-En-1200x700.jpg',
                    '/default/products/co2-generator/CO2-Generator-En-800x450.jpg',
                    '/default/products/co2-generator/CO2-Generator-En-600x600.jpg'
                ],
                catalogUrl: '/default/products/co2-generator/CO2-Generator-Catalog.pdf',
                icon: 'fa-industry',
                featured: true,
                isActive: true,
                sortOrder: 1
            },
            {
                name: {
                    en: 'Float Highspeed Aerator',
                    fa: 'هواکش شناور سرعت بالا'
                },
                slug: 'float-highspeed-aerator',
                categoryId: waterTreatmentCategory.id,
                status: 'active',
                shortDescription: {
                    en: 'Float Highspeed Aerator for water treatment',
                    fa: 'هواکش شناور سرعت بالا برای تصفیه آب'
                },
                featuredImage: '/default/products/float-highspeed-aerator/Float-Highspeed-Aerator-En.jpg',
                galleryImages: [
                    '/default/products/float-highspeed-aerator/Float-Highspeed-Aerator-En-1200x700.jpg',
                    '/default/products/float-highspeed-aerator/Float-Highspeed-Aerator-En-800x450.jpg',
                    '/default/products/float-highspeed-aerator/Float-Highspeed-Aerator-En-600x600.jpg'
                ],
                catalogUrl: '/default/products/float-highspeed-aerator/Float-Highspeed-Aerator-Catalog.pdf',
                icon: 'fa-fan',
                featured: true,
                isActive: true,
                sortOrder: 2
            },
            {
                name: {
                    en: 'Flocculator',
                    fa: 'فلوکولاتور'
                },
                slug: 'flocculator',
                categoryId: waterTreatmentCategory.id,
                status: 'active',
                shortDescription: {
                    en: 'Flocculator for water treatment processes',
                    fa: 'فلوکولاتور برای فرآیندهای تصفیه آب'
                },
                featuredImage: '/default/products/flocculator/Flocculator-En.jpg',
                galleryImages: [
                    '/default/products/flocculator/Flocculator-En-1200x700.jpg',
                    '/default/products/flocculator/Flocculator-En-800x450.jpg',
                    '/default/products/flocculator/Flocculator-En-600x600.jpg'
                ],
                catalogUrl: '/default/products/flocculator/Flocculator-Catalog.pdf',
                icon: 'fa-cogs',
                featured: true,
                isActive: true,
                sortOrder: 3
            },
            {
                name: {
                    en: 'H-Mixer (11 kW)',
                    fa: 'همزن H (11 کیلووات)'
                },
                slug: 'h-mixer-11kw',
                categoryId: waterTreatmentCategory.id,
                status: 'active',
                shortDescription: {
                    en: 'H-Mixer with 11 kW power for mixing applications',
                    fa: 'همزن H با قدرت 11 کیلووات برای کاربردهای مخلوط کردن'
                },
                featuredImage: '/default/products/h-mixer-11kw/H-mIxer-11-kw-1.jpeg',
                galleryImages: [
                    '/default/products/h-mixer-11kw/H-mIxer-11-kw-1-780x450.jpeg',
                    '/default/products/h-mixer-11kw/H-mIxer-11-kw-1-600x600.jpeg',
                    '/default/products/h-mixer-11kw/H-mIxer-11-kw-1-768x1024.jpeg'
                ],
                catalogUrl: '/default/products/h-mixer-11kw/H-Mixer-Catalog.pdf',
                icon: 'fa-tools',
                featured: true,
                isActive: true,
                sortOrder: 4
            },
            {
                name: {
                    en: 'Ordinary Flash Mixer',
                    fa: 'همزن فلش معمولی'
                },
                slug: 'ordinary-flash-mixer',
                categoryId: waterTreatmentCategory.id,
                status: 'active',
                shortDescription: {
                    en: 'Ordinary Flash Mixer for water treatment',
                    fa: 'همزن فلش معمولی برای تصفیه آب'
                },
                featuredImage: '/default/products/ordinary-flash-mixer/Ordinary-Flash-Mixer-En.jpg',
                galleryImages: [
                    '/default/products/ordinary-flash-mixer/Ordinary-Flash-Mixer-En-1200x700.jpg',
                    '/default/products/ordinary-flash-mixer/Ordinary-Flash-Mixer-En-800x450.jpg',
                    '/default/products/ordinary-flash-mixer/Ordinary-Flash-Mixer-En-600x600.jpg'
                ],
                catalogUrl: '/default/products/ordinary-flash-mixer/Ordinary-Flash-Mixer-Catalog.pdf',
                icon: 'fa-mixer',
                featured: true,
                isActive: true,
                sortOrder: 5
            }
        ];

        // Create products in database
        for (const productData of realProducts) {
            const product = await Product.create(productData);
            console.log(`✅ Created product: ${productData.name.en}`);
        }

        console.log('✅ Default products created successfully');
        console.log(`📊 Total products in database: ${await Product.count()}`);

    } catch (error) {
        console.error('❌ Error creating default products:', error);
    } finally {
        await sequelize.close();
    }
}

// Run the script
createDefaultProducts();
