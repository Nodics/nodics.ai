/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/data/sample/sampleProductLocalizationData @description English and Arabic content for one Product identity. @layer data @owner product @override Projects supply later catalogue releases. */
module.exports = {
    record0: {
        code: 'sampleRunningShoe-en', tenant: 'default', productCode: 'sampleRunningShoe', locale: 'en',
        name: 'Nodics Running Shoe', description: 'A lightweight sample running shoe.', slug: 'nodics-running-shoe',
        seo: { title: 'Nodics Running Shoe', description: 'Lightweight running shoe' },
        media: { primaryAlt: 'Blue Nodics running shoe' }, status: 'READY', revision: 1, active: true
    },
    record1: {
        code: 'sampleRunningShoe-ar', tenant: 'default', productCode: 'sampleRunningShoe', locale: 'ar',
        name: 'حذاء نوديكس للجري', description: 'حذاء جري تجريبي خفيف الوزن.', slug: 'nodics-running-shoe-ar',
        seo: { title: 'حذاء نوديكس للجري', description: 'حذاء جري خفيف الوزن' },
        media: { primaryAlt: 'حذاء نوديكس أزرق للجري' }, status: 'READY', revision: 1, active: true
    }
};
