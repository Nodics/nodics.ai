/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module discoveryProjection/test/customPhysicalIndexBinding
 * @description Verifies Discovery resolves logical models while provider indexes remain customized and scoped.
 * @layer test
 * @owner discoveryProjection
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/defaultDiscoveryDocumentProjectionService');

test('Discovery save resolves the logical schema identity without a physical registry alias', async (t) => {
    const saved = { NODICS: global.NODICS, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    t.after(() => Object.assign(global, saved));
    const schema = { typeName: 'discoveryDocumentProjection', indexName: 'fixture_discovery_projection' };
    const searchModel = { indexName: schema.indexName };
    global.CLASSES = { SearchError: Error };
    global.NODICS = {
        getModels: (moduleName, tenant) => {
            assert.equal(moduleName, 'discoveryProjection');
            assert.equal(tenant, 'fixtureTenant');
            return { DiscoveryDocumentProjectionModel: schema };
        },
        getSearchModel: (moduleName, tenant, logicalName) => {
            assert.equal(logicalName, 'discoveryDocumentProjection');
            return searchModel;
        },
    };
    global.SERVICE = { DefaultPipelineService: { start: async (name, request) => {
        assert.equal(name, 'doSaveModelsInitializerPipeline');
        assert.equal(request.indexName, 'discoveryDocumentProjection');
        assert.equal(request.searchModel.indexName, 'fixture_discovery_projection');
        return { acknowledged: true };
    } } };
    assert.deepEqual(await service.doSave({ tenant: 'fixtureTenant' }), { acknowledged: true });
    const pipelines = [];
    SERVICE.DefaultPipelineService.start = async (name, request) => {
        pipelines.push(name);
        assert.equal(request.indexName, 'discoveryDocumentProjection');
        return { code: 'SUC_SEARCH' };
    };
    await service.doRefresh({ tenant: 'fixtureTenant' });
    await service.doRemoveByQuery({ tenant: 'fixtureTenant', query: { term: { ownerType: 'fixture' } } });
    assert.deepEqual(pipelines, ['doRefreshIndexInitializerPipeline', 'doRemoveModelsByQueryInitializerPipeline']);
    assert.equal(schema.indexName, 'fixture_discovery_projection');
    delete schema.typeName;
    schema.indexName = 'discoveryDocumentProjection';
    assert.equal(service.getSearchModel({ tenant: 'fixtureTenant' }), searchModel);
    assert.throws(() => service.getSearchModel({}));
});
