/**
 * Add Test Products
 * This script adds sample products to the database for testing
 */

require('dotenv').config();
const { sequelize, Product, ProductCategory } = require('./src/models');

async function addTestProducts() {
    try {
        console.log('🌱 Adding test products...');

        // Get the first category (Water Treatment Systems)
        const waterTreatmentCategory = await ProductCategory.findOne({
            where: { slug: 'water-treatment-systems' }
        });

        if (!waterTreatmentCategory) {
            console.error('❌ Water Treatment Systems category not found');
            return;
        }

        // Test products
        const testProducts = [
            {
                name: {
                    en: 'High-Efficiency Pressure Sand Filter',
                    fa: 'فیلتر شنی فشار بالا با کارایی بالا'
                },
                slug: 'high-efficiency-pressure-sand-filter',
                categoryId: waterTreatmentCategory.id,
                status: 'active',
                shortDescription: {
                    en: 'Updated high-efficiency pressure sand filter with enhanced performance.',
                    fa: 'فیلتر شنی فشار بالا با کارایی بالا و عملکرد بهبود یافته.'
                },
                fullDescription: {
                    en: 'Our high-efficiency pressure sand filter is designed for industrial water treatment applications. It features advanced filtration technology and durable construction.',
                    fa: 'فیلتر شنی فشار بالا ما برای کاربردهای تصفیه آب صنعتی طراحی شده است. این فیلتر دارای فناوری پیشرفته فیلتراسیون و ساختار بادوام است.'
                },
                features: {
                    en: [
                        'High filtration efficiency',
                        'Durable construction',
                        'Easy maintenance',
                        'Low energy consumption'
                    ],
                    fa: [
                        'کارایی فیلتراسیون بالا',
                        'ساختار بادوام',
                        'نگهداری آسان',
                        'مصرف انرژی کم'
                    ]
                },
                applications: {
                    en: [
                        'Industrial water treatment',
                        'Municipal water systems',
                        'Wastewater treatment',
                        'Process water filtration'
                    ],
                    fa: [
                        'تصفیه آب صنعتی',
                        'سیستم‌های آب شهری',
                        'تصفیه فاضلاب',
                        'فیلتراسیون آب فرآیند'
                    ]
                },
                specifications: {
                    'Flow Rate': '50-500 m³/h',
                    'Pressure': '6-10 bar',
                    'Material': 'Carbon Steel',
                    'Efficiency': '99.5%'
                },
                icon: 'fa-filter',
                featured: true,
                isActive: true,
                sortOrder: 1
            },
            {
                name: {
                    en: 'Rotating Bridge System',
                    fa: 'سیستم پل چرخان'
                },
                slug: 'rotating-bridge-system',
                categoryId: waterTreatmentCategory.id,
                status: 'active',
                shortDescription: {
                    en: 'High-quality rotating bridge for water treatment applications. Features stainless steel construction and smooth rotation mechanism.',
                    fa: 'پل چرخان باکیفیت برای کاربردهای تصفیه آب. دارای ساختار فولاد ضدزنگ و مکانیزم چرخش روان.'
                },
                fullDescription: {
                    en: 'The rotating bridge system provides efficient water distribution and treatment. It is designed for large-scale water treatment facilities.',
                    fa: 'سیستم پل چرخان توزیع و تصفیه کارآمد آب را فراهم می‌کند. این سیستم برای تأسیسات تصفیه آب در مقیاس بزرگ طراحی شده است.'
                },
                features: {
                    en: [
                        'Stainless steel construction',
                        'Smooth rotation mechanism',
                        'Corrosion resistant',
                        'Low maintenance'
                    ],
                    fa: [
                        'ساختار فولاد ضدزنگ',
                        'مکانیزم چرخش روان',
                        'مقاوم در برابر خوردگی',
                        'نگهداری کم'
                    ]
                },
                applications: {
                    en: [
                        'Large water treatment plants',
                        'Municipal facilities',
                        'Industrial complexes',
                        'Wastewater treatment'
                    ],
                    fa: [
                        'کارخانه‌های بزرگ تصفیه آب',
                        'تأسیسات شهری',
                        'مجتمع‌های صنعتی',
                        'تصفیه فاضلاب'
                    ]
                },
                specifications: {
                    'Diameter': '20-50 meters',
                    'Material': 'Stainless Steel 316L',
                    'Rotation Speed': '0.5-2 RPM',
                    'Load Capacity': '50-200 tons'
                },
                icon: 'fa-bridge',
                featured: true,
                isActive: true,
                sortOrder: 2
            },
            {
                name: {
                    en: 'Advanced Screening System',
                    fa: 'سیستم غربالگری پیشرفته'
                },
                slug: 'advanced-screening-system',
                categoryId: waterTreatmentCategory.id,
                status: 'active',
                shortDescription: {
                    en: 'High-quality bar screen for wastewater screening applications. Features stainless steel construction and optimized screening performance.',
                    fa: 'غربال میله‌ای باکیفیت برای کاربردهای غربالگری فاضلاب. دارای ساختار فولاد ضدزنگ و عملکرد غربالگری بهینه.'
                },
                fullDescription: {
                    en: 'Our advanced screening system effectively removes large solids from wastewater streams. It is designed for high-flow applications.',
                    fa: 'سیستم غربالگری پیشرفته ما به طور مؤثر مواد جامد بزرگ را از جریان‌های فاضلاب حذف می‌کند. این سیستم برای کاربردهای جریان بالا طراحی شده است.'
                },
                features: {
                    en: [
                        'Automatic cleaning',
                        'Stainless steel bars',
                        'High flow capacity',
                        'Self-cleaning mechanism'
                    ],
                    fa: [
                        'تمیزکاری خودکار',
                        'میله‌های فولاد ضدزنگ',
                        'ظرفیت جریان بالا',
                        'مکانیزم خودتمیزکن'
                    ]
                },
                applications: {
                    en: [
                        'Wastewater treatment plants',
                        'Industrial pretreatment',
                        'Municipal facilities',
                        'Food processing'
                    ],
                    fa: [
                        'کارخانه‌های تصفیه فاضلاب',
                        'پیش‌تصفیه صنعتی',
                        'تأسیسات شهری',
                        'فرآوری مواد غذایی'
                    ]
                },
                specifications: {
                    'Bar Spacing': '6-25 mm',
                    'Material': 'Stainless Steel 304',
                    'Flow Rate': '100-1000 m³/h',
                    'Screen Angle': '30-60 degrees'
                },
                icon: 'fa-th',
                featured: true,
                isActive: true,
                sortOrder: 3
            },
            {
                name: {
                    en: 'Multi-Stage Filtration Unit',
                    fa: 'واحد فیلتراسیون چندمرحله‌ای'
                },
                slug: 'multi-stage-filtration-unit',
                categoryId: waterTreatmentCategory.id,
                status: 'active',
                shortDescription: {
                    en: 'High-efficiency pressure sand filter for water treatment applications. Features carbon steel construction and optimized filtration performance.',
                    fa: 'فیلتر شنی فشار بالا با کارایی بالا برای کاربردهای تصفیه آب. دارای ساختار فولاد کربن و عملکرد فیلتراسیون بهینه.'
                },
                fullDescription: {
                    en: 'The multi-stage filtration unit provides comprehensive water treatment through multiple filtration stages. It is ideal for industrial applications.',
                    fa: 'واحد فیلتراسیون چندمرحله‌ای تصفیه جامع آب را از طریق مراحل متعدد فیلتراسیون فراهم می‌کند. این واحد برای کاربردهای صنعتی ایده‌آل است.'
                },
                features: {
                    en: [
                        'Multi-stage filtration',
                        'Carbon steel construction',
                        'High efficiency',
                        'Easy operation'
                    ],
                    fa: [
                        'فیلتراسیون چندمرحله‌ای',
                        'ساختار فولاد کربن',
                        'کارایی بالا',
                        'عملکرد آسان'
                    ]
                },
                applications: {
                    en: [
                        'Industrial water treatment',
                        'Process water filtration',
                        'Cooling water systems',
                        'Boiler feed water'
                    ],
                    fa: [
                        'تصفیه آب صنعتی',
                        'فیلتراسیون آب فرآیند',
                        'سیستم‌های آب خنک‌کن',
                        'آب تغذیه بویلر'
                    ]
                },
                specifications: {
                    'Stages': '3-5 stages',
                    'Material': 'Carbon Steel',
                    'Flow Rate': '25-250 m³/h',
                    'Filtration Media': 'Sand, Anthracite, GAC'
                },
                icon: 'fa-filter',
                featured: true,
                isActive: true,
                sortOrder: 4
            }
        ];

        // Add products to database
        for (const productData of testProducts) {
            const product = await Product.create(productData);
            console.log(`✅ Created product: ${productData.name.en}`);
        }

        console.log('✅ Test products added successfully');
        console.log(`📊 Total products in database: ${await Product.count()}`);

    } catch (error) {
        console.error('❌ Error adding test products:', error);
    } finally {
        await sequelize.close();
    }
}

// Run the script
addTestProducts();
