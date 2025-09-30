/**
 * Insert Test Projects Script
 * This script inserts the default gallery projects into the database
 * as test data, properly formatted for the new multilingual structure.
 */

const { Project, ProjectCategory } = require('./src/models');
const testProjects = require('./test-projects-data');

async function insertTestProjects() {
    try {
        console.log('🚀 Starting test projects insertion...');
        
        // First, ensure we have the required categories
        const categories = await ProjectCategory.findAll();
        console.log('📋 Found categories:', categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
        
        if (categories.length === 0) {
            console.log('⚠️  No categories found. Please run the database migration first.');
            return;
        }
        
        // Check if test projects already exist
        const existingProjects = await Project.findAll({
            where: { slug: testProjects.map(p => p.slug) }
        });
        
        if (existingProjects.length > 0) {
            console.log('⚠️  Some test projects already exist. Skipping insertion.');
            console.log('Existing projects:', existingProjects.map(p => p.slug));
            return;
        }
        
        // Insert test projects
        console.log('📝 Inserting test projects...');
        
        for (const projectData of testProjects) {
            try {
                const project = await Project.create(projectData);
                console.log(`✅ Created project: ${project.title.en} (ID: ${project.id})`);
            } catch (error) {
                console.error(`❌ Failed to create project ${projectData.title.en}:`, error.message);
            }
        }
        
        console.log('🎉 Test projects insertion completed!');
        
        // Display summary
        const totalProjects = await Project.count();
        const publicProjects = await Project.count({ where: { isPublic: true } });
        const featuredProjects = await Project.count({ where: { isFeatured: true } });
        
        console.log('\n📊 Database Summary:');
        console.log(`Total projects: ${totalProjects}`);
        console.log(`Public projects: ${publicProjects}`);
        console.log(`Featured projects: ${featuredProjects}`);
        
    } catch (error) {
        console.error('❌ Error inserting test projects:', error);
    } finally {
        process.exit(0);
    }
}

// Run the script
insertTestProjects();
