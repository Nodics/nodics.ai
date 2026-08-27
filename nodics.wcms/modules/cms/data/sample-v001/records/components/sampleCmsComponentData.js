/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/data/sample-v001/records/components/sampleCmsComponentData
 * @description Sample CMS component records used for demo or development data loading.
 * @layer data
 * @owner cms
 * @override Project modules should provide their own sample component data rather than changing shared CMS samples.
 */
module.exports = {
    record0: {
        code: 'sampleLocalizedHomeBanner',
        active: true,
        typeCode: 'homePageBannerComponentType',
        renderer: 'component.home-banner',
        accessMode: 'PUBLIC',
        properties: {
            ctaUrl: '/discover',
            analyticsId: 'localized-home-hero'
        }
    }
};
