/**
 * Seed core categories for products, projects (gallery), and news
 */

require('dotenv').config();

const { connectDatabase, closeDatabase } = require('./src/utils/database');
const ProductCategory = require('./src/models/ProductCategory');
const ProjectCategory = require('./src/models/ProjectCategory');
const NewsCategory = require('./src/models/NewsCategory');

const log = (...args) => console.log('[seed-categories]', ...args);

async function upsertProductCategory({ name, slug, description = '', sortOrder = 0 }) {
  const existing = await ProductCategory.findOne({ where: { slug } });
  if (!existing) {
    await ProductCategory.create({ name, slug, description, sortOrder, isActive: true });
    log('Created product category:', slug);
  } else {
    await existing.update({ name, description, sortOrder, isActive: true });
    log('Updated product category:', slug);
  }
}

async function upsertProjectCategory({ name, slug, description = '' }) {
  const existing = await ProjectCategory.findOne({ where: { slug } });
  if (!existing) {
    await ProjectCategory.create({ name, slug, description });
    log('Created project category:', slug);
  } else {
    await existing.update({ name, description });
    log('Updated project category:', slug);
  }
}

async function upsertNewsCategory({ name, slug, description = '' }) {
  const existing = await NewsCategory.findOne({ where: { slug } });
  if (!existing) {
    await NewsCategory.create({ name, slug, description });
    log('Created news category:', slug);
  } else {
    await existing.update({ name, description });
    log('Updated news category:', slug);
  }
}

async function run() {
  await connectDatabase();

  // Requested categories (EN/FA)
  const requested = [
    {
      key: 'storage-handling-solids',
      en: 'Storage & Handling of Bulk Solids',
      fa: 'تجهیزات انبارش و انتقال مواد جامد'
    },
    {
      key: 'water-wastewater',
      en: 'Water & Wastewater Treatment',
      fa: 'تجهیزات و تصفیه خانه آب و فاضلاب'
    },
    {
      key: 'submersible-mixers',
      en: 'Submersible Mixers & Flow Makers',
      fa: 'میکسرها و جریان سازهای مستغرق'
    },
    { key: 'pumps', en: 'Pumps', fa: 'پمپ ها' },
    { key: 'others', en: 'Others', fa: 'سایر' }
  ];

  // Product categories slugs aligned with frontend internal mapping
  const productSlugMap = {
    'storage-handling-solids': 'storage-handling-solids',
    'water-wastewater': 'water-treatment',
    'submersible-mixers': 'mixers-aerators',
    'pumps': 'pumps-systems',
    'others': 'others'
  };

  // Seed ProductCategory
  let order = 1;
  for (const cat of requested) {
    const slug = productSlugMap[cat.key];
    await upsertProductCategory({ name: cat.en, slug, description: cat.fa, sortOrder: order++ });
  }

  // Seed ProjectCategory (gallery) - use same slugs as keys for consistency
  for (const cat of requested) {
    const slug = cat.key;
    // Store English name (model is single-language); description holds FA for reference
    await upsertProjectCategory({ name: cat.en, slug, description: cat.fa });
  }

  // Seed NewsCategory with multilingual name
  for (const cat of requested) {
    const slug = cat.key;
    await upsertNewsCategory({ name: { en: cat.en, fa: cat.fa }, slug, description: '' });
  }

  await closeDatabase();
  log('Completed seeding categories.');
}

run().catch(async (err) => {
  console.error('Seeding failed:', err);
  try { await closeDatabase(); } catch {}
  process.exit(1);
});


