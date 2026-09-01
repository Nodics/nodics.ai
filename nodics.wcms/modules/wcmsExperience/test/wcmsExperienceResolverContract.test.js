/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const resolver = require('../src/service/defaultWcmsExperienceResolverService');
const projection = require('../src/service/defaultWcmsExperienceProjectionService');

/** @module wcmsExperience/test/wcmsExperienceResolverContract @description Verifies first-slice WCMS Experience resolution behavior. @layer test @owner wcmsExperience */

global.CONFIG = {
    get: key => key === 'wcmsExperience' ? {
        enabled: true,
        resolver: {
            fallbackTargetType: 'DEFAULT',
            fallbackTargetCode: '*',
            defaultLocale: 'en-US',
            defaultChannel: 'web',
            defaultDevice: 'desktop'
        },
        fixturePlacements: [
            {
                code: 'default-shop-hero',
                site: 'agora-apparel',
                pageType: 'PRODUCT_LISTING',
                slot: 'hero',
                targetType: 'DEFAULT',
                targetCode: '*',
                component: 'defaultShopHero',
                rendererKey: 'heroBanner',
                publicationStatus: 'ONLINE',
                deliveryStatus: 'ACTIVE',
                priority: 1,
                specificity: 1,
                properties: { title: 'Shop the latest styles' }
            },
            {
                code: 'default-featured-carousel',
                site: 'agora-apparel',
                pageType: 'PRODUCT_LISTING',
                slot: 'featuredCarousel',
                targetType: 'DEFAULT',
                targetCode: '*',
                component: 'defaultFeaturedCarousel',
                rendererKey: 'productCarousel',
                publicationStatus: 'ONLINE',
                deliveryStatus: 'ACTIVE',
                priority: 10,
                specificity: 1,
                properties: { title: 'Projected products' }
            },
            {
                code: 'summer-edit-hero',
                site: 'agora-apparel',
                pageType: 'PRODUCT_LISTING',
                slot: 'hero',
                targetType: 'COLLECTION',
                targetCode: 'summer-edit',
                component: 'summerEditHero',
                rendererKey: 'heroBanner',
                publicationStatus: 'ONLINE',
                deliveryStatus: 'ACTIVE',
                priority: 100,
                specificity: 60,
                properties: { title: 'Light layers for warm days' }
            },
            {
                code: 'inactive-summer-edit-hero',
                site: 'agora-apparel',
                pageType: 'PRODUCT_LISTING',
                slot: 'hero',
                targetType: 'COLLECTION',
                targetCode: 'summer-edit',
                component: 'inactiveSummerEditHero',
                rendererKey: 'heroBanner',
                publicationStatus: 'ONLINE',
                deliveryStatus: 'INACTIVE',
                priority: 200,
                specificity: 70,
                properties: { title: 'Inactive content' }
            }
        ]
    } : undefined
};
global.SERVICE = {
    DefaultWcmsExperienceProjectionService: projection
};

(async () => {
    let resolved = await resolver.resolve({ experience: {
        site: 'agora-apparel',
        pageType: 'PRODUCT_LISTING',
        targetType: 'COLLECTION',
        targetCode: 'summer-edit'
    } });
    assert.equal(resolved.diagnostics.matched, true);
    assert.equal(resolved.diagnostics.fallbackUsed, false);
    assert.equal(resolved.slots.hero[0].componentCode, 'summerEditHero');
    assert.equal(resolved.slots.hero[0].properties.title, 'Light layers for warm days');
    assert.equal(resolved.slots.featuredCarousel[0].componentCode, 'defaultFeaturedCarousel');

    let fallback = await resolver.resolve({ experience: {
        site: 'agora-apparel',
        pageType: 'PRODUCT_LISTING',
        targetType: 'COLLECTION',
        targetCode: 'unknown-edit'
    } });
    assert.equal(fallback.diagnostics.matched, false);
    assert.equal(fallback.diagnostics.fallbackUsed, true);
    assert.equal(fallback.slots.hero[0].componentCode, 'defaultShopHero');

    await assert.rejects(resolver.resolve({ experience: { pageType: 'PRODUCT_LISTING' } }),
        error => error.code === 'ERR_WCMS_EXPERIENCE_INPUT_INVALID');

    console.log('WCMS Experience resolver contract validated');
})().catch(error => { console.error(error); process.exit(1); });
