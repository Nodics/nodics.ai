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

/** @module wcmsExperience/test/wcmsExperienceFallbackContract @description Verifies deterministic placement ordering and fallback rules. @layer test @owner wcmsExperience */

global.CONFIG = {
    get: key => key === 'wcmsExperience' ? {
        resolver: { fallbackTargetType: 'DEFAULT', fallbackTargetCode: '*' }
    } : undefined
};

let context = resolver.normalizeContext({ experience: {
    site: 'agora-apparel',
    pageType: 'PRODUCT_LISTING',
    targetType: 'COLLECTION',
    targetCode: 'summer-edit',
    now: '2026-08-31T10:00:00.000Z'
} });

assert.equal(resolver.matchesFallback(context, { targetType: 'DEFAULT', targetCode: '*' }), true);
assert.equal(resolver.matchesTarget(context, { targetType: 'COLLECTION', targetCode: 'summer-edit' }), true);
assert.equal(resolver.isActivePlacement(context, {
    site: 'agora-apparel',
    pageType: 'PRODUCT_LISTING',
    targetType: 'COLLECTION',
    targetCode: 'summer-edit',
    deliveryStatus: 'ACTIVE',
    publicationStatus: 'ONLINE',
    validFrom: '2026-08-30T00:00:00.000Z',
    validTo: '2026-09-30T00:00:00.000Z'
}), true);
assert.equal(resolver.isActivePlacement(context, {
    site: 'agora-apparel',
    pageType: 'PRODUCT_LISTING',
    targetType: 'COLLECTION',
    targetCode: 'summer-edit',
    deliveryStatus: 'ACTIVE',
    publicationStatus: 'ONLINE',
    validTo: '2026-08-30T00:00:00.000Z'
}), false);

let sorted = [
    { code: 'b', priority: 20, specificity: 10 },
    { code: 'a', priority: 10, specificity: 20 }
].sort((left, right) => resolver.comparePlacements(left, right));
assert.equal(sorted[0].code, 'a');

console.log('WCMS Experience fallback contract validated');
