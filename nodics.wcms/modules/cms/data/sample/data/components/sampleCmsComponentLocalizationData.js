/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cms/data/sample/sampleCmsComponentLocalizationData @description Provides bilingual property variants for the representative localized banner sample. @layer data @owner cms */
module.exports = {
    record0: {
        code: 'sampleLocalizedHomeBanner-en',
        componentCode: 'sampleLocalizedHomeBanner',
        locale: 'en',
        properties: {
            heading: 'Build experiences without duplicating pages',
            subheading: 'One component identity serves every supported language.',
            ctaLabel: 'Discover Nodics'
        },
        status: 'READY',
        active: true
    },
    record1: {
        code: 'sampleLocalizedHomeBanner-ar',
        componentCode: 'sampleLocalizedHomeBanner',
        locale: 'ar',
        properties: {
            heading: 'أنشئ تجارب دون تكرار الصفحات',
            subheading: 'هوية مكوّن واحدة تخدم كل لغة مدعومة.',
            ctaLabel: 'اكتشف نوديكس'
        },
        status: 'READY',
        active: true
    }
};
