/**
 * Product Categories Migration Script
 * Updates product categories to new structure:
 * - Water & Wastewater Treatment Equipment
 * - Solid Material Storage & Transfer Equipment
 * - Submersible Mixers & Flow Makers
 * - Pumps
 * - Others
 */

require('dotenv').config();
const { sequelize, ProductCategory, Product } = require('./src/models');

async function migrateProductCategories() {
    try {
        console.log('🔄 Starting product categories migration...');
        console.log('═══════════════════════════════════════════════════════════');

        // Start transaction
        const transaction = await sequelize.transaction();

        try {
            // Step 1: Get all existing categories
            const existingCategories = await ProductCategory.findAll({ transaction });
            console.log(`📊 Found ${existingCategories.length} existing categories`);

            // Step 2: Define new categories
            // Note: Using English names in 'name' field for now
            // Frontend will handle translation via i18n
            const newCategories = [
                {
                    name: 'Water & Wastewater Treatment Equipment',
                    slug: 'water-wastewater-treatment',
                    description: 'Complete water and wastewater treatment solutions including filters, separators, and clarifiers',
                    sortOrder: 1,
                    isActive: true
                },
                {
                    name: 'Solid Material Storage & Transfer Equipment',
                    slug: 'solid-material-storage-transfer',
                    description: 'Equipment for storage, handling, and transfer of solid materials including conveyors and thickeners',
                    sortOrder: 2,
                    isActive: true
                },
                {
                    name: 'Submersible Mixers & Flow Makers',
                    slug: 'submersible-mixers-flow-makers',
                    description: 'Submersible mixing and flow generation equipment for water treatment processes',
                    sortOrder: 3,
                    isActive: true
                },
                {
                    name: 'Pumps',
                    slug: 'pumps',
                    description: 'Industrial pumps including submersible sewage pumps and hot oil pumps',
                    sortOrder: 4,
                    isActive: true
                },
                {
                    name: 'Others',
                    slug: 'others',
                    description: 'Other industrial equipment and miscellaneous products',
                    sortOrder: 5,
                    isActive: true
                }
            ];

            // Corresponding Farsi names for reference
            const farsiNames = [
                'تجهیزات تصفیه خانه آب و فاضلاب',
                'تجهیزات انبارش و انتقال مواد جامد',
                'میکسر و جریان سازهای مستغرق',
                'پمپ ها',
                'سایر'
            ];

            // Step 3: Create mapping of old categories to new categories
            // This helps preserve product assignments
            const categoryMapping = {};

            // Map old categories to new ones based on their slugs/names
            for (const oldCat of existingCategories) {
                if (oldCat.slug.includes('water') || oldCat.slug.includes('wastewater') || 
                    oldCat.slug.includes('treatment')) {
                    categoryMapping[oldCat.id] = 'water-wastewater-treatment';
                } else if (oldCat.slug.includes('pump')) {
                    categoryMapping[oldCat.id] = 'pumps';
                } else if (oldCat.slug.includes('mixer') || oldCat.slug.includes('aerator')) {
                    categoryMapping[oldCat.id] = 'submersible-mixers-flow-makers';
                } else if (oldCat.slug.includes('conveyor') || oldCat.slug.includes('thickener')) {
                    categoryMapping[oldCat.id] = 'solid-material-storage-transfer';
                } else {
                    categoryMapping[oldCat.id] = 'others';
                }
            }

            console.log('📋 Category mapping created');

            // Step 4: Update products FIRST (before deleting categories)
            // This ensures no foreign key constraint issues
            const products = await Product.findAll({ transaction });
            console.log(`\n📦 Found ${products.length} products to update...`);

            // Step 5: Create new categories FIRST (so we have IDs to assign)
            const createdCategories = {};
            for (const categoryData of newCategories) {
                const category = await ProductCategory.create(categoryData, { transaction });
                createdCategories[category.slug] = category;
                console.log(`✅ Created category: ${category.name}`);
            }

            // Step 6: Update products to use new categories
            let updatedCount = 0;
            for (const product of products) {
                const oldCategoryId = product.categoryId;
                if (oldCategoryId && categoryMapping[oldCategoryId]) {
                    const newSlug = categoryMapping[oldCategoryId];
                    const newCategory = createdCategories[newSlug];
                    
                    if (newCategory) {
                        await product.update(
                            { categoryId: newCategory.id },
                            { transaction }
                        );
                        updatedCount++;
                    }
                }
            }
            console.log(`✅ Updated ${updatedCount} products with new categories`);

            // Step 7: NOW delete old categories (safe because products are already reassigned)
            const deletedCount = await ProductCategory.destroy({
                where: {
                    id: Object.keys(categoryMapping).map(id => parseInt(id))
                },
                transaction
            });
            console.log(`✅ Deleted ${deletedCount} old categories`);

            // Commit transaction
            await transaction.commit();
            console.log('\n═══════════════════════════════════════════════════════════');
            console.log('🎉 Product categories migration completed successfully!');
            console.log('═══════════════════════════════════════════════════════════');
            console.log('\n📊 Summary:');
            console.log(`   - Old categories deleted: ${deletedCount}`);
            console.log(`   - New categories created: ${newCategories.length}`);
            console.log(`   - Products updated: ${updatedCount}`);
            console.log('\n📝 New Categories:');
            newCategories.forEach((cat, index) => {
                console.log(`   ${index + 1}. ${cat.name}`);
                console.log(`      Farsi: ${farsiNames[index]}`);
                console.log(`      Slug: ${cat.slug}`);
            });
            console.log('\n✅ Migration completed cleanly - old categories permanently removed.');

        } catch (error) {
            // Rollback transaction on error
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        await sequelize.close();
        console.log('\n👋 Database connection closed');
    }
}

// Run the migration
console.log('🚀 ToolGostar Product Categories Migration');
console.log('═══════════════════════════════════════════════════════════');
migrateProductCategories();

