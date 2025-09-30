#!/usr/bin/env node

/**
 * Minimal Database Initialization
 * Creates the absolute minimum data needed for the app to work
 */

require('dotenv').config();
const { sequelize, Product, ProductCategory, Project } = require('./src/models');

async function minimalInit() {
    try {
        console.log('🌱 Minimal database initialization...');

        // Create one basic category
        console.log('📂 Creating basic category...');
        
        const category = await ProductCategory.create({
            name: 'Water Treatment Systems',
            slug: 'water-treatment-systems',
            description: 'Water treatment equipment and systems',
            status: 'active',
            sortOrder: 1
        });
        console.log('✅ Created category:', category.name);

        // Create one basic product
        console.log('📦 Creating basic product...');
        
        const product = await Product.create({
            name: 'Industrial Water Filter',
            slug: 'industrial-water-filter',
            categoryId: category.id,
            status: 'active',
            shortDescription: 'High-efficiency industrial water filtration system',
            fullDescription: 'Professional water filtration system designed for industrial applications.',
            featuredImage: '/uploads/products/water-filter.jpg',
            iconEn: 'fa-filter'
        });
        console.log('✅ Created product:', product.name);

        console.log('✅ Minimal initialization completed!');
        console.log(`📊 Database now has:`);
        console.log(`   - Categories: ${await ProductCategory.count()}`);
        console.log(`   - Products: ${await Product.count()}`);

    } catch (error) {
        console.error('❌ Minimal initialization failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await sequelize.close();
    }
}

// Run the script
if (require.main === module) {
    minimalInit();
}

module.exports = { minimalInit };
