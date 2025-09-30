/**
 * Test Projects Data
 * This file contains the default projects from the gallery.html file,
 * properly formatted for the new multilingual backend structure.
 */

const testProjects = [
    {
        title: {
            en: 'Water Treatment Plant - Tehran',
            fa: 'تصفیه خانه آب - تهران'
        },
        description: {
            en: 'Complete water treatment facility with 1000 m³/day capacity serving industrial complex.',
            fa: 'تأسیسات کامل تصفیه آب با ظرفیت ۱۰۰۰ متر مکعب در روز برای مجتمع صنعتی.'
        },
        slug: 'water-treatment-plant-tehran',
        categoryId: 1, // Water Treatment category
        location: 'Tehran, Iran',
        clientName: 'Tehran Municipality',
        capacity: '1000 m³/day',
        projectType: 'Municipal',
        completionDate: '2023-12-15',
        durationMonths: 18,
        featuredImage: 'public/images/gallery/water-treatment-1.svg',
        galleryImages: [
            'public/images/gallery/water-treatment-1.svg',
            'public/images/gallery/mixer-installation-1.svg'
        ],
        beforeImages: [],
        afterImages: [],
        equipmentUsed: [],
        status: 'completed',
        isFeatured: true,
        isPublic: true,
        sortOrder: 1
    },
    {
        title: {
            en: 'Mixer Installation - Isfahan',
            fa: 'نصب مخلوط‌کن - اصفهان'
        },
        description: {
            en: 'High-efficiency submersible mixers installed in wastewater treatment plant.',
            fa: 'مخلوط‌کن‌های شناور با کارایی بالا نصب شده در تصفیه خانه فاضلاب.'
        },
        slug: 'mixer-installation-isfahan',
        categoryId: 2, // Mixers category
        location: 'Isfahan, Iran',
        clientName: 'Isfahan Industrial Complex',
        capacity: '500 m³/day',
        projectType: 'Industrial',
        completionDate: '2023-08-20',
        durationMonths: 12,
        featuredImage: 'public/images/gallery/mixer-installation-1.svg',
        galleryImages: [
            'public/images/gallery/mixer-installation-1.svg',
            'public/images/gallery/pump-station-1.svg'
        ],
        beforeImages: [],
        afterImages: [],
        equipmentUsed: [],
        status: 'completed',
        isFeatured: true,
        isPublic: true,
        sortOrder: 2
    },
    {
        title: {
            en: 'Pump Station - Shiraz',
            fa: 'ایستگاه پمپ - شیراز'
        },
        description: {
            en: 'Complete pumping station with redundant systems for municipal water supply.',
            fa: 'ایستگاه پمپ کامل با سیستم‌های پشتیبان برای تأمین آب شهری.'
        },
        slug: 'pump-station-shiraz',
        categoryId: 3, // Pumps category
        location: 'Shiraz, Iran',
        clientName: 'Shiraz Water Authority',
        capacity: '2000 m³/day',
        projectType: 'Municipal',
        completionDate: '2023-06-10',
        durationMonths: 15,
        featuredImage: 'public/images/gallery/pump-station-1.svg',
        galleryImages: [
            'public/images/gallery/pump-station-1.svg',
            'public/images/gallery/water-treatment-1.svg'
        ],
        beforeImages: [],
        afterImages: [],
        equipmentUsed: [],
        status: 'completed',
        isFeatured: true,
        isPublic: true,
        sortOrder: 3
    },
    {
        title: {
            en: 'Industrial Complex - Mashhad',
            fa: 'مجتمع صنعتی - مشهد'
        },
        description: {
            en: 'Integrated water treatment solution for large industrial manufacturing facility.',
            fa: 'راه‌حل یکپارچه تصفیه آب برای تأسیسات بزرگ تولید صنعتی.'
        },
        slug: 'industrial-complex-mashhad',
        categoryId: 1, // Water Treatment category
        location: 'Mashhad, Iran',
        clientName: 'Mashhad Industrial Group',
        capacity: '1500 m³/day',
        projectType: 'Industrial',
        completionDate: '2023-04-25',
        durationMonths: 20,
        featuredImage: 'public/images/gallery/mixer-installation-1.svg',
        galleryImages: [
            'public/images/gallery/mixer-installation-1.svg',
            'public/images/gallery/pump-station-1.svg'
        ],
        beforeImages: [],
        afterImages: [],
        equipmentUsed: [],
        status: 'completed',
        isFeatured: true,
        isPublic: true,
        sortOrder: 4
    },
    {
        title: {
            en: 'Aeration System - Tabriz',
            fa: 'سیستم هوادهی - تبریز'
        },
        description: {
            en: 'Surface aeration system for biological wastewater treatment process.',
            fa: 'سیستم هوادهی سطحی برای فرآیند تصفیه بیولوژیکی فاضلاب.'
        },
        slug: 'aeration-system-tabriz',
        categoryId: 2, // Mixers category
        location: 'Tabriz, Iran',
        clientName: 'Tabriz Environmental Services',
        capacity: '800 m³/day',
        projectType: 'Environmental',
        completionDate: '2023-02-15',
        durationMonths: 10,
        featuredImage: 'public/images/gallery/pump-station-1.svg',
        galleryImages: [
            'public/images/gallery/pump-station-1.svg',
            'public/images/gallery/mixer-installation-1.svg'
        ],
        beforeImages: [],
        afterImages: [],
        equipmentUsed: [],
        status: 'completed',
        isFeatured: true,
        isPublic: true,
        sortOrder: 5
    },
    {
        title: {
            en: 'Submersible Pumps - Ahvaz',
            fa: 'پمپ‌های شناور - اهواز'
        },
        description: {
            en: 'Heavy-duty submersible pumps for oil industry wastewater management.',
            fa: 'پمپ‌های شناور سنگین برای مدیریت فاضلاب صنعت نفت.'
        },
        slug: 'submersible-pumps-ahvaz',
        categoryId: 3, // Pumps category
        location: 'Ahvaz, Iran',
        clientName: 'National Iranian Oil Company',
        capacity: '3000 m³/day',
        projectType: 'Oil & Gas',
        completionDate: '2023-01-30',
        durationMonths: 24,
        featuredImage: 'public/images/gallery/water-treatment-1.svg',
        galleryImages: [
            'public/images/gallery/water-treatment-1.svg',
            'public/images/gallery/mixer-installation-1.svg'
        ],
        beforeImages: [],
        afterImages: [],
        equipmentUsed: [],
        status: 'completed',
        isFeatured: true,
        isPublic: true,
        sortOrder: 6
    }
];

module.exports = testProjects;
