# Add Products Guide

Complete guide to add all 15 products to your ToolGostar database.

## Quick Start

```bash
cd toolgostar-backend

# Step 1: Copy product images (if needed)
node copy-product-images.js

# Step 2: Seed all products
node seed-all-products.js
```

## Products Overview

### Total: 15 Products across 4 Categories

#### Category 1: Water & Wastewater Treatment Equipment (7 products)
1. Sluice Gate (دریچه کشویی)
2. Fine Screen (صافی ریز)
3. Grit Separator (جداساز شن)
4. Penstock (پنستاک)
5. Pressure Vessel Filter (فیلتر مخزن تحت فشار)
6. Rotary Bridge (پل چرخشی)
7. Thickener (غلظت‌دهنده)

#### Category 2: Solid Material Storage & Transfer Equipment (1 product)
8. Screw Conveyor (نوار نقاله پیچی)

#### Category 3: Submersible Mixers & Flow Makers (4 products)
9. Aerator (هواکش)
10. CO2 Generator (تولیدکننده CO2)
11. Flash Mixer (همزن فلش)
12. Flocculator (فلوکولاتور)

#### Category 4: Pumps (3 products)
13. Submersible Sewage Pumps (پمپ‌های فاضلاب غوطه‌ور)
14. Flow Maker (سازنده جریان)
15. Hot Oil Pumps (پمپ‌های روغن داغ)

## Prerequisites

1. ✅ Categories migrated (run `migrate-product-categories.js` first)
2. ✅ Product images available in `public/default/products/`
3. ✅ Database backup created

## Step-by-Step Guide

### Step 1: Backup Database

```bash
cd toolgostar-backend
cp database.sqlite database.sqlite.backup-before-products
```

### Step 2: Copy Product Images (Optional)

If you don't have all product images, copy them from default-last version:

```bash
node copy-product-images.js
```

**Note:** You may need to adjust the source path in `copy-product-images.js` to match your folder structure.

### Step 3: Seed Products

```bash
node seed-all-products.js
```

Expected output:
```
🚀 ToolGostar Product Seeding
═══════════════════════════════════════════════════════════
🌱 Starting product seeding...
✅ All categories found

📦 Creating products...

✅ Created: Sluice Gate (دریچه کشویی)
✅ Created: Fine Screen (صافی ریز)
✅ Created: Grit Separator (جداساز شن)
...
🎉 Product seeding completed!
📊 Summary:
   - Water & Wastewater Treatment: 7 products
   - Solid Material Storage & Transfer: 1 product
   - Submersible Mixers & Flow Makers: 4 products
   - Pumps: 3 products
   - Total created: 15/15
```

### Step 4: Verify Products

Check if products were created successfully:

```bash
# Using the check-database script
node check-database.js

# Or manually check
sqlite3 database.sqlite "SELECT name FROM products;"
```

### Step 5: Restart Server

```bash
# If running locally
node app.js

# If on cPanel, restart via Application Manager
```

## Product Data Structure

Each product includes:

- ✅ **Bilingual names** (English & Farsi)
- ✅ **Unique slug** for URLs
- ✅ **Category assignment** (new 5-category structure)
- ✅ **Short descriptions** (bilingual)
- ✅ **Features list** (4 features, bilingual)
- ✅ **Featured image** path
- ✅ **Gallery images** (for selected products)
- ✅ **Catalog PDFs** (for selected products)
- ✅ **Icon** (Font Awesome class)
- ✅ **Status** (active)
- ✅ **Sort order**

## Image Paths

All images use the path format:
```
/default/products/{product-slug}/{image-file}
```

Example:
```
/default/products/co2-generator/CO2-Generator-En.jpg
/default/products/co2-generator/CO2-Generator-Catalog.pdf
```

## Troubleshooting

### Error: "Categories not found"

**Problem:** The new 5 categories don't exist in database.

**Solution:** Run the category migration first:
```bash
node migrate-product-categories.js
```

### Error: "Product already exists"

**Problem:** Some products already exist in database.

**Solution:** Either:
1. Delete existing products first, OR
2. Modify the script to skip existing products, OR
3. Use a fresh database

To delete all products:
```bash
sqlite3 database.sqlite "DELETE FROM products;"
```

### Images not showing

**Problem:** Image files not found or incorrect paths.

**Solutions:**
1. Check if images exist in `public/default/products/`
2. Run `copy-product-images.js` to copy images
3. Verify image paths in database match actual file locations
4. Check server static file configuration

### Database locked

**Problem:** Database is in use by another process.

**Solution:**
```bash
# Stop the Node.js server
pkill node

# Then run the script again
node seed-all-products.js
```

## Advanced Options

### Add Individual Products

You can modify `seed-all-products.js` to only create specific products by commenting out unwanted ones.

### Update Existing Products

To update products instead of creating new ones:

1. Modify the script to use `Product.upsert()` instead of `Product.create()`
2. Or use `Product.update()` with `where: { slug: 'product-slug' }`

### Custom Product Data

Edit the product arrays in `seed-all-products.js` to customize:
- Names and descriptions
- Features
- Images
- Sort order
- etc.

## Files

- **`seed-all-products.js`** - Main seeding script (15 products)
- **`copy-product-images.js`** - Copy images from default-last version
- **`ADD_PRODUCTS_README.md`** - This file

## Important Notes

⚠️ **Always backup before seeding products**

✅ Run category migration first

✅ Verify image files exist before seeding

✅ Products are created with `status: 'active'` and `isActive: true`

✅ All products are marked as `featured: true`

## Next Steps After Seeding

1. ✅ Verify products in admin panel
2. ✅ Test product pages on frontend
3. ✅ Check image display
4. ✅ Verify category filtering works
5. ✅ Test search functionality
6. ✅ Check product details modal

## Support

If you encounter issues:
1. Check console output for error messages
2. Verify categories exist in database
3. Check image file paths
4. Verify database is not locked
5. Review the product data structure

## Database Schema Reference

Products table structure:
- `id` - Auto-increment primary key
- `name` - JSON (en/fa)
- `slug` - Unique string
- `categoryId` - Foreign key to product_categories
- `status` - ENUM (active/inactive/draft)
- `shortDescription` - JSON (en/fa)
- `features` - JSON array (en/fa)
- `featuredImage` - String (path)
- `galleryImages` - JSON array
- `catalogUrl` - String (path)
- `icon` - String (Font Awesome class)
- `featured` - Boolean
- `isActive` - Boolean
- `sortOrder` - Integer
- `createdAt` - Timestamp
- `updatedAt` - Timestamp



