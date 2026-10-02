/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nSearch/search/test/logicalPhysicalSearchBinding
 * @description Verifies real model registration and generated service lookup retain logical identities with customized physical indexes.
 * @layer test
 * @owner nSearch
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../src/service/model/defaultSearchModelHandlerService');
const common = require('../src/service/common');

test('customized physical indexes preserve logical contributors, schema pointers and provider bookkeeping', async (t) => {
    const saved = { NODICS: global.NODICS, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    const priorFirst = String.prototype.toUpperCaseFirstChar;
    String.prototype.toUpperCaseFirstChar = function () { return this[0].toUpperCase() + this.slice(1); };
    t.after(() => {
        Object.assign(global, saved);
        if (priorFirst) String.prototype.toUpperCaseFirstChar = priorFirst;
        else delete String.prototype.toUpperCaseFirstChar;
    });
    const schemaModel = {};
    const moduleObject = { searchModels: { fixtureTenant: {} } };
    const active = new Set();
    let created = 0;
    let physicalContributor = 0;
    global.NODICS = { getModels: () => ({ SampleProjectionModel: schemaModel }) };
    global.SERVICE = { DefaultLoggerService: { createLogger: () => ({}) } };
    global.CLASSES = { SearchError: Error };
    const definitions = {
        default: { defineDefaultCreate: model => { model.doCreateIndex = async () => { created++; }; } },
        sampleProjection: { defineDefaultOwner: model => { model.contributor = 'logical'; } },
        fixture_sampleprojection: { defineDefaultLegacy: model => { physicalContributor++; model.contributor = 'legacy'; } },
    };
    const options = {
        moduleName: 'fixtureOwner', tntCode: 'fixtureTenant', moduleObject,
        moduleTenantSearchRawSchema: { sampleProjection: { indexName: 'fixture_sampleprojection', schemaName: 'sampleProjection' } },
        rawSearchModelDef: definitions,
        searchEngine: { isActiveIndex: name => active.has(name), addIndex: name => active.add(name) },
    };
    await handler.prepareTypeSearchModels({ ...options, indexNames: ['sampleProjection'] });
    const registered = moduleObject.searchModels.fixtureTenant.SampleProjectionSearchModel;
    assert.equal(registered.typeName, 'sampleProjection');
    assert.equal(registered.indexName, 'fixture_sampleprojection');
    assert.equal(registered.contributor, 'logical');
    assert.equal(physicalContributor, 0);
    assert.equal(schemaModel.typeName, 'sampleProjection');
    assert.equal(schemaModel.indexName, 'fixture_sampleprojection');
    assert.equal(schemaModel.searchModelName, 'SampleProjectionSearchModel');
    assert.deepEqual([...active], ['fixture_sampleprojection']);
    await handler.prepareTypeSearchModels({ ...options, indexNames: ['sampleProjection'] });
    assert.equal(created, 1);
    delete definitions.sampleProjection;
    await handler.prepareTypeSearchModels({ ...options, indexNames: ['sampleProjection'] });
    assert.equal(physicalContributor, 1);
    assert.equal(moduleObject.searchModels.fixtureTenant.SampleProjectionSearchModel.contributor, 'legacy');
});

test('generated services use logical defaults without rewriting explicit selectors or legacy schema pointers', (t) => {
    const saved = { NODICS: global.NODICS, CLASSES: global.CLASSES };
    t.after(() => Object.assign(global, saved));
    const schema = { typeName: 'sampleProjection', indexName: 'fixture_sampleprojection' };
    global.CLASSES = { SearchError: Error };
    global.NODICS = {
        getModels: () => ({ mdlnm: schema }),
        getSearchModel: (moduleName, tenant, logicalName) => {
            assert.equal(moduleName, 'fixtureOwner');
            assert.equal(tenant, 'fixtureTenant');
            assert.ok(['sampleProjection', 'alternateProjection', 'legacyProjection'].includes(logicalName));
            return { logicalName };
        },
    };
    const request = { moduleName: 'fixtureOwner', tenant: 'fixtureTenant' };
    assert.equal(common.getSearchModel(request).logicalName, 'sampleProjection');
    assert.equal(request.indexName, 'sampleProjection');
    assert.equal(schema.indexName, 'fixture_sampleprojection');
    assert.equal(common.getSearchModel({ ...request, indexName: 'alternateProjection' }).logicalName, 'alternateProjection');
    delete schema.typeName;
    schema.indexName = 'legacyProjection';
    assert.equal(common.getSearchModel({ moduleName: 'fixtureOwner', tenant: 'fixtureTenant' }).logicalName, 'legacyProjection');
    assert.throws(() => common.getSearchModel({ moduleName: 'fixtureOwner' }));
});
