/**
 * Database Seeder
 * Creates initial data for the ToolGostar database
 */

require('dotenv').config();
const { sequelize, User, NewsCategory, ProductCategory, ProjectCategory } = require('./src/models');
const bcrypt = require('bcrypt');

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Sync database (create tables)
        await sequelize.sync({ force: true });
        console.log('✅ Database tables created');

        // Create admin user
        const adminUser = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@toolgostar.com',
            passwordHash: 'admin123', // Will be hashed by the model's beforeCreate hook
            role: 'admin',
            isActive: true
        });
        console.log('✅ Admin user created');

        // Create news categories
        const newsCategories = [
            {
                name: 'Company News',
                slug: 'company-news',
                description: 'Latest news and updates from ToolGostar Industrial Group'
            },
            {
                name: 'Product Updates',
                slug: 'product-updates',
                description: 'New products, features, and improvements'
            },
            {
                name: 'Industry Insights',
                slug: 'industry-insights',
                description: 'Industry trends, analysis, and expert opinions'
            },
            {
                name: 'Project Showcases',
                slug: 'project-showcases',
                description: 'Featured projects and case studies'
            }
        ];

        for (const category of newsCategories) {
            await NewsCategory.create(category);
        }
        console.log('✅ News categories created');

        // Create product categories
        const productCategories = [
            {
                name: 'Water Treatment Systems',
                slug: 'water-treatment-systems',
                description: 'Complete water treatment solutions',
                sortOrder: 1
            },
            {
                name: 'Pumps',
                slug: 'pumps',
                description: 'Industrial and commercial pumps',
                sortOrder: 2
            },
            {
                name: 'Filters',
                slug: 'filters',
                description: 'Water filtration systems and components',
                sortOrder: 3
            },
            {
                name: 'Control Systems',
                slug: 'control-systems',
                description: 'Automation and control equipment',
                sortOrder: 4
            }
        ];

        for (const category of productCategories) {
            await ProductCategory.create(category);
        }
        console.log('✅ Product categories created');

        // Create project categories
        const projectCategories = [
            {
                name: 'Water Treatment Plants',
                slug: 'water-treatment-plants',
                description: 'Large-scale water treatment facilities'
            },
            {
                name: 'Industrial Projects',
                slug: 'industrial-projects',
                description: 'Industrial water and wastewater solutions'
            },
            {
                name: 'Municipal Projects',
                slug: 'municipal-projects',
                description: 'Municipal water and wastewater treatment'
            },
            {
                name: 'Commercial Projects',
                slug: 'commercial-projects',
                description: 'Commercial water treatment solutions'
            }
        ];

        for (const category of projectCategories) {
            await ProjectCategory.create(category);
        }
        console.log('✅ Project categories created');

        console.log('🎉 Database seeding completed successfully!');
        console.log('📧 Admin login: admin@toolgostar.com / admin123');

    } catch (error) {
        console.error('❌ Database seeding failed:', error);
    } finally {
        await sequelize.close();
    }
}

seedDatabase();
