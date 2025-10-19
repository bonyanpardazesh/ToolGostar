# Product Categories Migration Guide

## Overview

This migration script updates the product categories from the old structure to the new 5-category system.

## New Categories

1. **Water & Wastewater Treatment Equipment** (تجهیزات تصفیه خانه آب و فاضلاب)
   - Slug: `water-wastewater-treatment`
   - Includes: Filters, separators, clarifiers, gates, screens, etc.

2. **Solid Material Storage & Transfer Equipment** (تجهیزات انبارش و انتقال مواد جامد)
   - Slug: `solid-material-storage-transfer`
   - Includes: Conveyors, thickeners, storage systems

3. **Submersible Mixers & Flow Makers** (میکسر و جریان سازهای مستغرق)
   - Slug: `submersible-mixers-flow-makers`
   - Includes: Mixers, aerators, flocculators, flow makers

4. **Pumps** (پمپ ها)
   - Slug: `pumps`
   - Includes: All types of industrial pumps

5. **Others** (سایر)
   - Slug: `others`
   - Includes: Miscellaneous equipment

## How to Run the Migration

### Prerequisites

1. Make sure your database is backed up
2. Ensure you're in the `toolgostar-backend` directory
3. Node.js and dependencies are installed

### Steps

1. **Backup your database first:**
   ```bash
   cp database.sqlite database.sqlite.backup-before-category-migration
   ```

2. **Run the migration script:**
   ```bash
   node migrate-product-categories.js
   ```

3. **Verify the results:**
   The script will output:
   - Number of old categories deleted
   - Number of new categories created
   - Number of products updated
   - List of all new categories

### What the Script Does

1. ✅ **Cleans Database**: Old categories are permanently deleted
2. ✅ **Creates New Categories**: 5 new categories created with proper structure
3. ✅ **Updates Products**: All products are automatically reassigned to new categories
4. ✅ **Transaction Safe**: Uses database transactions (rollback on error)
5. ✅ **Smart Mapping**: Automatically maps old categories to new ones based on their names/slugs

### Category Mapping Logic

The script automatically maps old categories to new ones:

- Categories with "water", "wastewater", "treatment" → **Water & Wastewater Treatment**
- Categories with "pump" → **Pumps**
- Categories with "mixer", "aerator" → **Submersible Mixers & Flow Makers**
- Categories with "conveyor", "thickener" → **Solid Material Storage & Transfer**
- Everything else → **Others**

## After Migration

### 1. Update Frontend Files

You'll need to update:
- `products.html` - Category filter buttons
- `languages/en.json` - English translations
- `languages/fa.json` - Farsi translations
- Admin panel category dropdowns

### 2. Add Translations to Language Files

**In `languages/en.json`:**
```json
{
  "products": {
    "categories": {
      "water_wastewater_treatment": "Water & Wastewater Treatment Equipment",
      "solid_material_storage_transfer": "Solid Material Storage & Transfer Equipment",
      "submersible_mixers_flow_makers": "Submersible Mixers & Flow Makers",
      "pumps": "Pumps",
      "others": "Others"
    }
  }
}
```

**In `languages/fa.json`:**
```json
{
  "products": {
    "categories": {
      "water_wastewater_treatment": "تجهیزات تصفیه خانه آب و فاضلاب",
      "solid_material_storage_transfer": "تجهیزات انبارش و انتقال مواد جامد",
      "submersible_mixers_flow_makers": "میکسر و جریان سازهای مستغرق",
      "pumps": "پمپ ها",
      "others": "سایر"
    }
  }
}
```

### 3. Test the Changes

1. Check the admin panel - verify categories appear correctly
2. Check the products page - verify filter buttons work
3. Create a test product - verify category selection works
4. Check product assignment - verify products show correct categories

## Rollback (If Needed)

If you need to rollback:

1. **Restore database backup:**
   ```bash
   cp database.sqlite.backup-before-category-migration database.sqlite
   ```

2. **Restart the server:**
   ```bash
   node app.js
   ```

## Troubleshooting

### Error: "Cannot find module"
- Make sure you're in the `toolgostar-backend` directory
- Run `npm install` to install dependencies

### Error: "Database is locked"
- Stop the Node.js server before running migration
- Make sure no other processes are accessing the database

### Products not showing in categories
- Check the `categoryId` field in products table
- Verify new categories exist with `isActive: true`
- Check browser console for JavaScript errors

## Important Notes

⚠️ **Always backup before running migrations** - Old categories will be permanently deleted!

✅ Old categories are completely removed from database

✅ All products are automatically updated to new categories BEFORE deletion

✅ The script uses transactions (all-or-nothing approach - rollback on error)

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify database backup exists
3. Check that all products have valid category assignments
4. Review the migration script logs

## Script Location

- **Migration Script**: `toolgostar-backend/migrate-product-categories.js`
- **Database**: `toolgostar-backend/database.sqlite`
- **Backup**: `toolgostar-backend/database.sqlite.backup`

