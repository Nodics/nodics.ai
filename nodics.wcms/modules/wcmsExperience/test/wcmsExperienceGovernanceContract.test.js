/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const resolver = require('../src/service/defaultWcmsExperienceResolverService');
const projection = require('../src/service/defaultWcmsExperienceProjectionService');
const enums = require('../src/utils/enums');
const statusDefinitions = require('../src/utils/statusDefinitions');

/** @module wcmsExperience/test/wcmsExperienceGovernanceContract @description Freezes lifecycle, authority, security, performance, and delivery guardrails. @layer test @owner wcmsExperience */

const moduleRoot = path.resolve(__dirname, '..');
const governancePath = path.join(moduleRoot, 'llm/contracts/experience-governance-contract.md');
const requiredGovernancePhrases = [
    'Storefront/runtime delivery must not read draft or mutable Staged CMS records directly.',
    'cmsExperiencePlacement` is the targeting and placement source of truth.',
    'Discovery/Elasticsearch is the optimized delivery projection, not the authoring source.',
    'Indexing must be triggered only from committed CMS publication flow',
    'indexing the same release twice produces the same effective projection',
    'WCMS_EXPERIENCE_VIEW',
    'Public resolver responses may include only storefront-safe component projections',
    'Request-time resolution must query indexed placement projections and must not scan all CMS components.',
    'Every projected component must carry:',
    'previewMode=true` may resolve Staged projections for Axis preview.'
];

(async () => {
    assert.equal(fs.existsSync(governancePath), true, 'governance contract must exist');
    const governance = fs.readFileSync(governancePath, 'utf8');
    for (const phrase of requiredGovernancePhrases) {
        assert.match(governance, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }

    const readme = fs.readFileSync(path.join(moduleRoot, 'README.md'), 'utf8');
    const agentContract = fs.readFileSync(path.join(moduleRoot, 'AGENTS.md'), 'utf8');
    const contractReadme = fs.readFileSync(path.join(moduleRoot, 'llm/contracts/README.md'), 'utf8');
    assert.match(readme, /experience-governance-contract\.md/);
    assert.match(agentContract, /experience-governance-contract\.md/);
    assert.match(contractReadme, /experience-governance-contract\.md/);

    assert.equal(enums.WcmsExperienceSecurityScope.definition.VIEW, 'WCMS_EXPERIENCE_VIEW');
    assert.equal(enums.WcmsExperienceSecurityScope.definition.EDIT, 'WCMS_EXPERIENCE_EDIT');
    assert.equal(enums.WcmsExperienceSecurityScope.definition.PREVIEW, 'WCMS_EXPERIENCE_PREVIEW');
    assert.equal(enums.WcmsExperienceSecurityScope.definition.PUBLISH_STATUS, 'WCMS_EXPERIENCE_PUBLISH_STATUS');
    assert.equal(enums.WcmsExperienceSecurityScope.definition.OVERRIDE, 'WCMS_EXPERIENCE_OVERRIDE');
    assert.equal(enums.WcmsExperienceSlot.definition.HERO, 'hero');
    assert.equal(enums.WcmsExperienceSlot.definition.FEATURED_CAROUSEL, 'featuredCarousel');
    assert.equal(enums.WcmsExperienceSlot.definition.SEO_CONTENT, 'seoContent');
    assert.equal(statusDefinitions.SUC_WCMS_EXPERIENCE_00000.code, '200');
    assert.equal(statusDefinitions.ERR_WCMS_EXPERIENCE_INPUT_INVALID.code, '400');
    assert.equal(statusDefinitions.ERR_WCMS_EXPERIENCE_INDEX_SERVICE_UNAVAILABLE.code, '503');

    global.CONFIG = {
        get: key => key === 'wcmsExperience' ? {
            enabled: true,
            resolver: {
                fallbackTargetType: 'DEFAULT',
                fallbackTargetCode: '*',
                defaultLocale: 'en-US',
                defaultChannel: 'web',
                defaultDevice: 'desktop',
                maxComponents: 3
            },
            projection: {
                provider: 'DISCOVERY',
                ownerType: 'WCMS_EXPERIENCE',
                indexConfigurationCode: 'cmsExperiencePlacement',
                fixtureFallbackEnabled: false
            }
        } : undefined
    };

    let capturedSearch;
    global.SERVICE = {
        DefaultWcmsExperienceProjectionService: projection,
        DefaultDiscoveryRuntimeService: {
            search: async request => {
                capturedSearch = request;
                return [{
                    payload: {
                        code: 'draft-online-blocked',
                        site: 'agoraApparelSite',
                        pageType: 'PRODUCT_LISTING',
                        slot: 'hero',
                        targetType: 'DEFAULT',
                        targetCode: '*',
                        component: 'draftHero',
                        rendererKey: 'agora.heroBanner',
                        publicationStatus: 'STAGED',
                        deliveryStatus: 'ACTIVE'
                    }
                }];
            }
        },
        DefaultCmsComponentService: {
            find: () => { throw new Error('Resolver must not scan CMS components.'); },
            get: () => { throw new Error('Resolver must not read raw CMS components during delivery.'); }
        }
    };

    const publicResult = await resolver.resolve({ tenant: 'default', experience: {
        site: 'agoraApparelSite',
        pageType: 'PRODUCT_LISTING',
        targetType: 'DEFAULT',
        targetCode: '*'
    } });

    assert.equal(publicResult.diagnostics.placementCount, 0);
    assert.equal(capturedSearch.query.site, 'agoraApparelSite');
    assert.equal(capturedSearch.query.pageType, 'PRODUCT_LISTING');
    assert.deepEqual(capturedSearch.query.targetTypes, ['DEFAULT', 'DEFAULT']);
    assert.deepEqual(capturedSearch.query.targetCodes, ['*', '*']);
    assert.equal(capturedSearch.searchOptions.pageSize, 3);

    const previewResult = await resolver.resolve({ tenant: 'default', experience: {
        site: 'agoraApparelSite',
        pageType: 'PRODUCT_LISTING',
        targetType: 'DEFAULT',
        targetCode: '*',
        previewMode: true
    } });

    assert.equal(previewResult.diagnostics.placementCount, 1);
    assert.equal(previewResult.slots.hero[0].rendererKey, 'agora.heroBanner');
    assert.equal(Object.hasOwn(previewResult.slots.hero[0], 'targetType'), false);
    assert.equal(Object.hasOwn(previewResult.slots.hero[0], '_id'), false);

    console.log('WCMS Experience governance contract validated');
})().catch(error => { console.error(error); process.exit(1); });
