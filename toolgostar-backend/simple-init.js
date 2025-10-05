#!/usr/bin/env node

/**
 * Simple Database Initialization
 * Creates basic categories and products with correct data format
 */

require('dotenv').config();
const { sequelize, Product, ProductCategory, Project } = require('./src/models');

async function simpleInit() {
    try {
        console.log('🌱 Simple database initialization...');

        // Create basic categories
        console.log('📂 Creating basic categories...');
        
        const waterCategory = await ProductCategory.create({
            name: 'Water Treatment Systems',
            slug: 'water-treatment-systems',
            description: 'Complete water treatment solutions',
            status: 'active',
            sortOrder: 1
        });
        console.log('✅ Created: Water Treatment Systems');

        const filterCategory = await ProductCategory.create({
            name: 'Filtration Systems', 
            slug: 'filtration-systems',
            description: 'Advanced filtration technologies',
            status: 'active',
            sortOrder: 2
        });
        console.log('✅ Created: Filtration Systems');

        // Create basic products
        console.log('📦 Creating basic products...');
        
        const product1 = await Product.create({
            name: 'High-Efficiency Pressure Sand Filter',
            slug: 'high-efficiency-pressure-sand-filter',
            categoryId: waterCategory.id,
            status: 'active',
            shortDescription: 'Advanced pressure sand filter for industrial applications',
            fullDescription: 'Our high-efficiency pressure sand filter is designed for industrial water treatment applications.',
            featuredImage: '/uploads/products/sand-filter.jpg',
            iconEn: 'fa-filter'
        });
        console.log('✅ Created: High-Efficiency Pressure Sand Filter');

        const product2 = await Product.create({
            name: 'Industrial Water Softener',
            slug: 'industrial-water-softener', 
            categoryId: waterCategory.id,
            status: 'active',
            shortDescription: 'Professional water softening system for industrial use',
            fullDescription: 'Industrial water softener designed to remove hardness from water.',
            featuredImage: '/uploads/products/water-softener.jpg',
            iconEn: 'fa-tint'
        });
        console.log('✅ Created: Industrial Water Softener');

        // Create basic project
        console.log('🏗️ Creating basic project...');
        
        const project = await Project.create({
            title: JSON.stringify({ en: 'Industrial Water Treatment Plant', fa: 'کارخانه تصفیه آب صنعتی' }),
            slug: 'industrial-water-treatment-plant',
            status: 'completed',
            categoryId: 1, // Default category
            shortDescription: JSON.stringify({ en: 'Complete water treatment solution for industrial facility', fa: 'راه‌حل کامل تصفیه آب برای تأسیسات صنعتی' }),
            fullDescription: JSON.stringify({ en: 'A comprehensive water treatment plant designed for industrial applications.', fa: 'کارخانه تصفیه آب جامع طراحی شده برای کاربردهای صنعتی.' }),
            location: JSON.stringify({ en: 'Tehran, Iran', fa: 'تهران، ایران' }),
            capacity: '1000 m³/day',
            featuredImage: '/uploads/projects/water-treatment-plant.jpg'
        });
        console.log('✅ Created: Industrial Water Treatment Plant');

        console.log('✅ Simple initialization completed!');
        console.log(`📊 Database now has:`);
        console.log(`   - Categories: ${await ProductCategory.count()}`);
        console.log(`   - Products: ${await Product.count()}`);
        console.log(`   - Projects: ${await Project.count()}`);

    } catch (error) {
        console.error('❌ Initialization failed:', error.message);
    } finally {
        await sequelize.close();
    }
}

// Run the script
if (require.main === module) {
    simpleInit();
}

module.exports = { simpleInit };
