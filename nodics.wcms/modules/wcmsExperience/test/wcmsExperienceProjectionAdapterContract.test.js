/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const projection = require('../src/service/defaultWcmsExperienceProjectionService');

/** @module wcmsExperience/test/wcmsExperienceProjectionAdapterContract @description Verifies WCMS Experience uses targeted Discovery lookup before fixture fallback. @layer test @owner wcmsExperience */

(async () => {
    let searchCalls = [];
    global.CONFIG = {
        get: key => key === 'wcmsExperience' ? {
            resolver: {
                fallbackTargetType: 'DEFAULT',
                fallbackTargetCode: '*',
                maxComponents: 25
            },
            projection: {
                provider: 'DISCOVERY',
                ownerType: 'WCMS_EXPERIENCE',
                indexConfigurationCode: 'cmsExperiencePlacement',
                status: 'CURRENT',
                fixtureFallbackEnabled: true
            },
            fixturePlacements: [{ code: 'fixture-default', site: 'agoraApparelSite', pageType: 'PRODUCT_LISTING' }]
        } : undefined
    };
    global.SERVICE = {
        DefaultDiscoveryRuntimeService: {
            search: async request => {
                searchCalls.push(request);
                return [{
                    code: 'indexed-placement',
                    payload: {
                        code: 'indexed-placement',
                        site: 'agoraApparelSite',
                        pageType: 'PRODUCT_LISTING',
                        slot: 'hero',
                        targetType: 'COLLECTION',
                        targetCode: 'agoraNewArrivals'
                    }
                }];
            }
        },
        DefaultCmsComponentService: {
            find: () => { throw new Error('Resolver must not scan CMS components for placement resolution.'); }
        }
    };

    let result = await projection.findPlacements({
        tenant: 'default',
        authData: { groups: ['anonymousGroup'] },
        site: 'agoraApparelSite',
        pageType: 'PRODUCT_LISTING',
        targetType: 'COLLECTION',
        targetCode: 'agoraNewArrivals',
        locale: 'en-US',
        channel: 'web',
        device: 'desktop',
        now: new Date('2026-08-31T10:00:00.000Z')
    });

    assert.equal(result[0].code, 'indexed-placement');
    assert.equal(searchCalls.length, 1);
    assert.equal(searchCalls[0].tenant, 'default');
    assert.equal(searchCalls[0].ownerType, 'WCMS_EXPERIENCE');
    assert.equal(searchCalls[0].indexConfigurationCode, 'cmsExperiencePlacement');
    assert.equal(searchCalls[0].query.site, 'agoraApparelSite');
    assert.equal(searchCalls[0].query.pageType, 'PRODUCT_LISTING');
    assert.deepEqual(searchCalls[0].query.targetType, ['COLLECTION', 'DEFAULT']);
    assert.deepEqual(searchCalls[0].query.targetCode, ['agoraNewArrivals', '*']);
    assert.equal(searchCalls[0].query.device, undefined);
    assert.equal(searchCalls[0].searchOptions.pageSize, 25);

    global.SERVICE.DefaultDiscoveryRuntimeService.search = async () => [];
    result = await projection.findPlacements({
        site: 'agoraApparelSite',
        pageType: 'PRODUCT_LISTING',
        targetType: 'COLLECTION',
        targetCode: 'unknown'
    });
    assert.equal(result[0].code, 'fixture-default');

    console.log('WCMS Experience projection adapter contract validated');
})().catch(error => { console.error(error); process.exit(1); });
