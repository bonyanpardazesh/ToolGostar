/**
 * Copy Product Images
 * Copies all product images from default-last version to current project
 */

const fs = require('fs-extra');
const path = require('path');

async function copyProductImages() {
    try {
        console.log('📁 Starting product images copy...');
        console.log('═══════════════════════════════════════════════════════════');

        // Source and destination paths
        const sourcePath = path.join(__dirname, '..', '..', 'default-last', 'local4', 'local', 'ToolGostar-master', 'public', 'default', 'products');
        const destPath = path.join(__dirname, '..', 'public', 'default', 'products');

        // Check if source exists
        if (!fs.existsSync(sourcePath)) {
            console.error(`❌ Source path not found: ${sourcePath}`);
            console.error('\n💡 Please adjust the path in the script to match your folder structure.');
            return;
        }

        console.log(`📂 Source: ${sourcePath}`);
        console.log(`📂 Destination: ${destPath}`);

        // Create destination if it doesn't exist
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
            console.log('✅ Created destination directory');
        }

        // Get list of product folders to copy
        const productFolders = [
            'aerator',
            'co2-generator',
            'fine-screen',
            'flash-mixer',
            'float-highspeed-aerator',
            'flocculator',
            'flow-maker',
            'grit-separator',
            'h-mixer-11kw',
            'hot-oil-pumps',
            'ordinary-flash-mixer',
            'penstock',
            'pressure-vessel',
            'rotary-bridge',
            'screw-conveyor',
            'sluice-gate',
            'submersible-pumps',
            'thickener'
        ];

        console.log(`\n📦 Copying ${productFolders.length} product folders...\n`);

        let copiedCount = 0;
        let skippedCount = 0;

        for (const folder of productFolders) {
            const src = path.join(sourcePath, folder);
            const dest = path.join(destPath, folder);

            try {
                if (fs.existsSync(src)) {
                    // Copy folder
                    await fs.copy(src, dest, { overwrite: true });
                    console.log(`✅ Copied: ${folder}`);
                    copiedCount++;
                } else {
                    console.log(`⚠️  Skipped (not found): ${folder}`);
                    skippedCount++;
                }
            } catch (error) {
                console.error(`❌ Failed to copy ${folder}:`, error.message);
            }
        }

        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('🎉 Product images copy completed!');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`\n📊 Summary:`);
        console.log(`   - Copied: ${copiedCount} folders`);
        console.log(`   - Skipped: ${skippedCount} folders`);
        console.log(`   - Total: ${productFolders.length} folders`);

    } catch (error) {
        console.error('\n❌ Copy failed:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the script
console.log('🚀 ToolGostar Product Images Copy');
console.log('═══════════════════════════════════════════════════════════');
copyProductImages();



