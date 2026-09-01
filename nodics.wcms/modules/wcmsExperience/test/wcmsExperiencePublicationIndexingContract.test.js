/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const indexing = require('../src/service/defaultWcmsExperiencePublicationIndexingService');
const builder = require('../../../../nodics.discovery/modules/discoveryProjection/src/service/defaultDiscoveryDocumentBuilderService');
const planner = require('../../../../nodics.discovery/modules/discoveryPublication/src/service/defaultDiscoveryPublicationPlannerService');

/** @module wcmsExperience/test/wcmsExperiencePublicationIndexingContract @description Verifies committed CMS publication events build idempotent Discovery documents. @layer test @owner wcmsExperience */

(async () => {
    let saved = [];
    let aliasSwitches = [];
    let loadedQueries = [];
    global.CONFIG = {
        get: key => key === 'wcmsExperience' ? {
            enabled: true,
            resolver: { maxComponents: 50 },
            indexing: {
                onlineAliasTemplate: 'cms_experience_${site}_online_current',
                stagedAliasTemplate: 'cms_experience_${site}_staged_current'
            },
            projection: {
                provider: 'DISCOVERY',
                ownerType: 'WCMS_EXPERIENCE',
                indexConfigurationCode: 'cmsExperiencePlacement',
                indexName: 'discoveryDocumentProjection',
                status: 'CURRENT',
                publicationPolicy: { batchSize: 25, aliasSwitch: true, rollbackEnabled: true }
            }
        } : key === 'discovery' ? { publication: { defaultBatchSize: 100 } } : undefined
    };
    global.SERVICE = {
        DefaultDiscoveryDocumentBuilderService: builder,
        DefaultDiscoveryPublicationPlannerService: planner,
        DefaultDiscoveryDocumentProjectionService: { doSave: async request => { saved.push(request); return { result: [request.model] }; } },
        DefaultDiscoveryIndexAliasService: { switchAlias: async request => { aliasSwitches.push(request); return { switched: true, aliasName: request.aliasName }; } },
        DefaultCmsPublicationManifestOrchestrationService: { getManifest: async code => ({
            code: code,
            publicationCode: 'agoraApparelContentCatalog',
            snapshot: { site: 'agoraApparelSite', locale: 'en-US', channel: 'web' }
        }) },
        DefaultCmsExperiencePlacementService: { get: async request => {
            loadedQueries.push(request.query);
            return { result: [
                {
                    code: 'heroPlacement',
                    site: 'agoraApparelSite',
                    pageType: 'PRODUCT_LISTING',
                    slot: 'hero',
                    targetType: 'DEFAULT',
                    targetCode: '*',
                    component: 'agoraApparelProductListingExperience',
                    rendererKey: 'agora.productListing',
                    contractVersion: 1,
                    properties: { heading: 'Shop the edit' },
                    publicationStatus: 'STAGED',
                    deliveryStatus: 'ACTIVE',
                    locale: 'en-US',
                    channel: 'web',
                    priority: 10,
                    specificity: 0
                }
            ] };
        } }
    };

    const event = {
        code: 'event-1',
        eventType: 'CMS_ONLINE_CHANGED',
        operation: 'DEPLOY',
        publicationCode: 'agoraApparelContentCatalog',
        manifestCode: 'manifest-v1'
    };
    const result = await indexing.handlePublicationEvent(event, { tenant: 'default', authData: { tokenType: 'service' } });

    assert.equal(result.skipped, false);
    assert.equal(result.documentCount, 1);
    assert.equal(result.savedCount, 1);
    assert.equal(loadedQueries[0].site, 'agoraApparelSite');
    assert.equal(saved[0].moduleName, 'discoveryProjection');
    assert.equal(saved[0].indexName, 'discoveryDocumentProjection');
    assert.equal(saved[0].options, undefined);
    assert.equal(saved[0].model.ownerType, 'WCMS_EXPERIENCE');
    assert.equal(saved[0].model.indexConfigurationCode, 'cmsExperiencePlacement');
    assert.equal(saved[0].model.site, 'agoraApparelSite');
    assert.equal(saved[0].model.pageType, 'PRODUCT_LISTING');
    assert.equal(saved[0].model.slot, 'hero');
    assert.equal(saved[0].model.targetType, 'DEFAULT');
    assert.equal(saved[0].model.targetCode, '*');
    assert.equal(saved[0].model.channel, 'web');
    assert.equal(saved[0].model.deliveryStatus, 'ACTIVE');
    assert.equal(saved[0].model.payload.publicationStatus, 'ONLINE');
    assert.equal(saved[0].model.payload.deliveryStatus, 'ACTIVE');
    assert.equal(saved[0].model.payload.rendererKey, 'agora.productListing');
    assert.equal(saved[0].model.payload.contractVersion, 1);
    assert.equal(saved[0].model.payload.properties.heading, 'Shop the edit');
    assert(saved[0].model.sourceHash);
    assert(saved[0].model.projectedAt instanceof Date);
    assert.match(saved[0].model.code, /^wcmsExperience\\|agoraApparelSite\\|PRODUCT_LISTING\\|hero\\|DEFAULT\\|\\*\\|en-US\\|web\\|manifest-v1$/);
    assert.equal(aliasSwitches.length, 1);
    assert.equal(aliasSwitches[0].aliasName, 'cms_experience_agoraApparelSite_online_current');
    assert.equal(aliasSwitches[0].rollbackEnabled, true);

    saved = [];
    aliasSwitches = [];
    const withdrawn = await indexing.handlePublicationEvent(Object.assign({}, event, { operation: 'WITHDRAW', manifestCode: 'manifest-v2' }),
        { tenant: 'default', authData: { tokenType: 'service' } });
    assert.equal(withdrawn.documentCount, 1);
    assert.equal(saved[0].model.active, false);
    assert.equal(saved[0].model.payload.publicationStatus, 'ARCHIVED');
    assert.equal(saved[0].model.payload.deliveryStatus, 'INACTIVE');

    global.SERVICE.DefaultDiscoveryDocumentProjectionService = {
        doSave: async () => ({ result: [], errors: [{ code: 'ERR_SRCH_00000' }] })
    };
    await assert.rejects(() => indexing.handlePublicationEvent(event, { tenant: 'default' }),
        error => error.code === 'ERR_WCMS_EXPERIENCE_INDEX_SERVICE_UNAVAILABLE');

    const skipped = await indexing.handlePublicationEvent({ eventType: 'OTHER', operation: 'DEPLOY' }, { tenant: 'default' });
    assert.equal(skipped.skipped, true);

    console.log('WCMS Experience publication indexing contract validated');
})().catch(error => { console.error(error); process.exit(1); });
