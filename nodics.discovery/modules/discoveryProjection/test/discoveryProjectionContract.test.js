/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const schemas = require('../src/schemas/schemas');
const builder = require('../src/service/defaultDiscoveryDocumentBuilderService');
const projectionService = require('../src/service/defaultDiscoveryDocumentProjectionService');

/** @module discoveryProjection/test/discoveryProjectionContract @description Verifies generic Discovery document projection. @layer test @owner discoveryProjection */

assert(schemas.discoveryProjection.discoveryDocumentProjection);
let doc = builder.build({ tenant: 'default', ownerType: 'PRODUCT', ownerCode: 'p1', indexConfigurationCode: 'productDiscovery', payload: { name: 'Product' } });
assert.equal(doc.code, 'PRODUCT|p1|productDiscovery');
assert.equal(doc.status, 'CURRENT');
assert(doc.sourceHash);

let experienceDoc = builder.build({
    tenant: 'default',
    ownerType: 'WCMS_EXPERIENCE',
    ownerCode: 'hero1',
    indexConfigurationCode: 'cmsExperiencePlacement',
    payload: { title: 'Collection hero' },
    site: 'agoraApparelSite',
    pageType: 'PRODUCT_LISTING',
    slot: 'hero',
    targetType: 'COLLECTION',
    targetCode: 'agoraNewArrivals',
    channel: 'web',
    device: 'desktop',
    deliveryStatus: 'ACTIVE',
    specificity: 90,
    priority: 10,
    indexVersion: 'cmsBaseline_agoraapparel_0_0_2_0_5'
});
assert.equal(experienceDoc.site, 'agoraApparelSite');
assert.equal(experienceDoc.pageType, 'PRODUCT_LISTING');
assert.equal(experienceDoc.targetType, 'COLLECTION');
assert.equal(experienceDoc.targetCode, 'agoraNewArrivals');
assert.equal(experienceDoc.specificity, 90);
assert.equal(experienceDoc.indexVersion, 'cmsBaseline_agoraapparel_0_0_2_0_5');

let pipelineSeen;
global.NODICS = {
    getModels: () => ({ DiscoveryDocumentProjectionModel: { indexName: 'discoveryDocumentProjection' } }),
    getSearchModel: (moduleName, tenant, indexName) => ({ moduleName, tenant, indexName })
};
global.SERVICE = {
    DefaultPipelineService: {
        start: async (pipelineName, request) => {
            pipelineSeen = { pipelineName, request };
            return { success: true, result: [] };
        }
    }
};
global.CLASSES = { SearchError: class SearchError extends Error {
    constructor(error) {
        super(error && error.message ? error.message : error);
        this.cause = error;
    }
} };

projectionService.doSave({ tenant: 'default', model: doc }).then(result => {
    assert.equal(result.success, true);
    assert.equal(pipelineSeen.pipelineName, 'doSaveModelsInitializerPipeline');
    assert.equal(pipelineSeen.request.moduleName, 'discoveryProjection');
    assert.equal(pipelineSeen.request.indexName, 'discoveryDocumentProjection');
    return projectionService.doSearch({ tenant: 'default', searchOptions: { limit: 10 } });
}).then(result => {
    assert.equal(result.success, true);
    assert.equal(pipelineSeen.pipelineName, 'doSearchModelInitializerPipeline');
    console.log('Discovery projection contract validated');
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
