#!/usr/bin/env node

/**
 * Initialize Database with Essential Data
 * Creates categories and sample products for the application
 */

require('dotenv').config();
const { sequelize, Product, ProductCategory, Project } = require('./src/models');

async function initializeDatabase() {
    try {
        console.log('🌱 Initializing database with essential data...');

        // Create product categories
        console.log('📂 Creating product categories...');
        const categories = [
            {
                name: { en: 'Water Treatment Systems', fa: 'سیستم‌های تصفیه آب' },
                slug: 'water-treatment-systems',
                description: { en: 'Complete water treatment solutions', fa: 'راه‌حل‌های کامل تصفیه آب' },
                status: 'active'
            },
            {
                name: { en: 'Filtration Systems', fa: 'سیستم‌های فیلتراسیون' },
                slug: 'filtration-systems',
                description: { en: 'Advanced filtration technologies', fa: 'فناوری‌های پیشرفته فیلتراسیون' },
                status: 'active'
            },
            {
                name: { en: 'Pumps & Equipment', fa: 'پمپ‌ها و تجهیزات' },
                slug: 'pumps-equipment',
                description: { en: 'Industrial pumps and equipment', fa: 'پمپ‌ها و تجهیزات صنعتی' },
                status: 'active'
            }
        ];

        for (const categoryData of categories) {
            const [category, created] = await ProductCategory.findOrCreate({
                where: { slug: categoryData.slug },
                defaults: categoryData
            });
            console.log(`   ${created ? '✅ Created' : '📋 Found'} category: ${category.name.en}`);
        }

        // Create sample products
        console.log('📦 Creating sample products...');
        const waterTreatmentCategory = await ProductCategory.findOne({
            where: { slug: 'water-treatment-systems' }
        });

        const products = [
            {
                name: { en: 'High-Efficiency Pressure Sand Filter', fa: 'فیلتر شنی فشار بالا با کارایی بالا' },
                slug: 'high-efficiency-pressure-sand-filter',
                categoryId: waterTreatmentCategory.id,
                status: 'active',
                shortDescription: {
                    en: 'Advanced pressure sand filter for industrial applications',
                    fa: 'فیلتر شنی فشار بالا پیشرفته برای کاربردهای صنعتی'
                },
                fullDescription: {
                    en: 'Our high-efficiency pressure sand filter is designed for industrial water treatment applications. It features advanced filtration technology and durable construction.',
                    fa: 'فیلتر شنی فشار بالا ما برای کاربردهای تصفیه آب صنعتی طراحی شده است. این فیلتر دارای فناوری پیشرفته فیلتراسیون و ساختار بادوام است.'
                },
                features: {
                    en: ['High filtration efficiency', 'Durable construction', 'Easy maintenance', 'Low energy consumption'],
                    fa: ['کارایی فیلتراسیون بالا', 'ساختار بادوام', 'نگهداری آسان', 'مصرف انرژی کم']
                },
                applications: {
                    en: ['Industrial water treatment', 'Municipal water systems', 'Wastewater treatment'],
                    fa: ['تصفیه آب صنعتی', 'سیستم‌های آب شهری', 'تصفیه فاضلاب']
                },
                specifications: {
                    en: ['Flow rate: 50-500 m³/h', 'Pressure: 6-10 bar', 'Material: Stainless steel'],
                    fa: ['دبی: 50-500 متر مکعب در ساعت', 'فشار: 6-10 بار', 'جنس: فولاد ضد زنگ']
                },
                featuredImage: '/uploads/products/sand-filter.jpg',
                iconEn: 'fa-filter',
                iconFa: 'fa-filter'
            },
            {
                name: { en: 'Industrial Water Softener', fa: 'نرم‌کننده آب صنعتی' },
                slug: 'industrial-water-softener',
                categoryId: waterTreatmentCategory.id,
                status: 'active',
                shortDescription: {
                    en: 'Professional water softening system for industrial use',
                    fa: 'سیستم نرم‌سازی آب حرفه‌ای برای استفاده صنعتی'
                },
                fullDescription: {
                    en: 'Industrial water softener designed to remove hardness from water in industrial processes.',
                    fa: 'نرم‌کننده آب صنعتی طراحی شده برای حذف سختی آب در فرآیندهای صنعتی.'
                },
                features: {
                    en: ['Automatic regeneration', 'High capacity', 'Energy efficient', 'Easy operation'],
                    fa: ['بازسازی خودکار', 'ظرفیت بالا', 'صرفه‌جویی در انرژی', 'عملکرد آسان']
                },
                applications: {
                    en: ['Boiler feed water', 'Cooling systems', 'Process water'],
                    fa: ['آب تغذیه بویلر', 'سیستم‌های خنک‌کننده', 'آب فرآیند']
                },
                featuredImage: '/uploads/products/water-softener.jpg',
                iconEn: 'fa-tint',
                iconFa: 'fa-tint'
            }
        ];

        for (const productData of products) {
            const [product, created] = await Product.findOrCreate({
                where: { slug: productData.slug },
                defaults: productData
            });
            console.log(`   ${created ? '✅ Created' : '📋 Found'} product: ${product.name.en}`);
        }

        // Create sample projects
        console.log('🏗️ Creating sample projects...');
        const projects = [
            {
                title: { en: 'Industrial Water Treatment Plant', fa: 'کارخانه تصفیه آب صنعتی' },
                slug: 'industrial-water-treatment-plant',
                status: 'active',
                shortDescription: {
                    en: 'Complete water treatment solution for industrial facility',
                    fa: 'راه‌حل کامل تصفیه آب برای تأسیسات صنعتی'
                },
                fullDescription: {
                    en: 'A comprehensive water treatment plant designed for industrial applications with advanced filtration and treatment systems.',
                    fa: 'کارخانه تصفیه آب جامع طراحی شده برای کاربردهای صنعتی با سیستم‌های پیشرفته فیلتراسیون و تصفیه.'
                },
                location: { en: 'Tehran, Iran', fa: 'تهران، ایران' },
                capacity: '1000 m³/day',
                featuredImage: '/uploads/projects/water-treatment-plant.jpg',
                gallery: [
                    '/uploads/projects/plant-1.jpg',
                    '/uploads/projects/plant-2.jpg',
                    '/uploads/projects/plant-3.jpg'
                ]
            }
        ];

        for (const projectData of projects) {
            const [project, created] = await Project.findOrCreate({
                where: { slug: projectData.slug },
                defaults: projectData
            });
            console.log(`   ${created ? '✅ Created' : '📋 Found'} project: ${project.title.en}`);
        }

        console.log('✅ Database initialization completed successfully!');
        console.log('📊 Summary:');
        console.log(`   - Categories: ${await ProductCategory.count()}`);
        console.log(`   - Products: ${await Product.count()}`);
        console.log(`   - Projects: ${await Project.count()}`);

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run the script
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };
