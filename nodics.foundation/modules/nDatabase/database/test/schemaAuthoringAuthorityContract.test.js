/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module database/test/schemaAuthoringAuthorityContract @description Protects publication authoring and generic CRUD boundaries. @layer test @owner nDatabase */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const policy = require('../src/service/schema/defaultSchemaAuthoringPolicyService');
const workbench = require('./helpers/schemaApiHarness');
const defaults = require('../config/properties').schemaApi;
let stage = 'ONLINE';
let writes = 0;
const schema = {
    model: true, definition: { code: { type: 'string', primary: true } }, accessGroups: { adminGroup: 10 },
    backoffice: { mutationPolicy: { publishRequired: true }, bulkOperations: ['DELETE'],
        aggregateOperations: { change: { enabled: true, service: 'OwnerService', operation: 'change' } } },
};
global.CONFIG = { get: key => ({ runtimeRole: { publication: stage }, schemaApi: defaults,
    accessPoints: { readAccessPoint: 1, writeAccessPoint: 2, removeAccessPoint: 3 } })[key] };
global.NODICS = { getModule: () => ({ rawSchema: { schmanm: schema } }), isModuleActive: () => true };
global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
global.SERVICE = { DefaultSchemaAuthoringPolicyService: policy,
    DefaultSchemaAccessHandlerService: { getAccessPoint: () => 10 },
    DefaultSchemaUtilityService: require('../src/service/schema/defaultSchemaUtilityService'),
    DefaultSchemaSafeQueryService: require('../src/service/schema/defaultSchemaSafeQueryService'),
    OwnerService: { change: () => { writes++; } },
};
const controller = require('../../../nController/src/controller/common');
global.FACADE = { dsdName: Object.fromEntries(['save', 'saveAll', 'update', 'remove', 'removeById', 'removeByCode']
    .map(name => [name, () => { writes++; return Promise.resolve({ ok: true }); }])) };

test('only explicit publication metadata selects Staged authoring', () => {
    assert.equal(policy.describe({ versioned: true, definition: { revision: {}, versionId: {} } }).authoringAllowed, true);
    for (const role of ['ONLINE', 'OPERATIONAL', 'UNASSIGNED', undefined]) {
        stage = role;
        assert.equal(policy.describe(schema).authoringAllowed, false);
    }
    stage = 'STAGED';
    assert.equal(policy.describe(schema).authoringAllowed, true);
    assert.equal(policy.describe({ backoffice: { mutationMode: 'READ_ONLY' } }).authoringAllowed, false);
});

test('generated HTTP mutations fail before body-supplied identity or bypass flags are merged', async () => {
    stage = 'ONLINE'; writes = 0;
    for (const method of ['save', 'saveAll', 'update', 'remove', 'removeById', 'removeByCode']) {
        const request = { moduleName: 'cms', httpRequest: { params: { code: 'existing' }, body: {
            moduleName: 'operational', schemaName: 'other', publication: true, runtimeRole: { publication: 'STAGED' },
            options: { skipPublication: true }, model: { code: 'existing' },
        } } };
        await assert.rejects(controller[method](request), error => error.code === 'ERR_AUTH_00003');
        await new Promise(resolve => controller[method](request, error => {
            assert.equal(error.code, 'ERR_AUTH_00003'); resolve();
        }));
        assert.equal(request.moduleName, 'cms');
    }
    assert.equal(writes, 0);
    stage = 'STAGED';
    assert.deepEqual(await controller.save({ moduleName: 'cms', httpRequest: { body: { code: 'draft' } } }), { ok: true });
    assert.equal(writes, 1);
});

test('Workbench denies online create/update/delete, bulk without dispatch', async () => {
    stage = 'ONLINE'; writes = 0;
    const request = { moduleName: 'cms', authData: { userGroups: ['adminGroup'] },
        httpRequest: { params: { schema: 'schmanm' }, body: { operation: 'DELETE', identity: { code: 'x' }, identities: [{ code: 'x' }] } } };
    const descriptor = workbench.buildDescriptor(request, NODICS.getModule(), 'schmanm', 'cms');
    assert.deepEqual(descriptor.operations, ['search', 'read']);
    assert.equal(descriptor.mutationMode, 'READ_ONLY');
    assert.deepEqual(descriptor.bulkCapabilities.operations, []);
    assert.deepEqual(descriptor.aggregateOperations, []);
    assert.equal(descriptor.authoring.stage, 'ONLINE');
    for (const method of ['createRecord', 'updateRecord', 'deleteRecord', 'bulk']) {
        await assert.rejects(workbench[method](request));
    }
    assert.equal(writes, 0);
});

test('generated create and createAll cannot bypass an owning setup command', async () => {
    stage = 'STAGED'; writes = 0;
    schema.backoffice.form = { createOperation: 'setup' };
    try {
        for (const method of ['save', 'saveAll']) {
            await assert.rejects(controller[method]({ moduleName: 'cms', httpRequest: { body: { code: 'new' } } }));
        }
        assert.equal(writes, 0);
        await controller.update({ moduleName: 'cms', httpRequest: { body: { query: { code: 'existing' }, model: { code: 'existing' } } } });
        assert.equal(writes, 1);
    } finally {
        delete schema.backoffice.form;
    }
});

test('domain schema declarations protect source and projection records without reclassifying Store', () => {
    const sources = [
        [require('../../../../../nodics.wcms/modules/cms/src/schemas/schemas').cms, 'cmsPage', 'cmsOnlinePublicationPointer'],
        [require('../../../../../nodics.wcms/modules/editorial/src/schemas/schemas').editorial, 'editorialArticle', 'editorialOnlineArticle'],
        [require('../../../../../nodics.commerce/modules/baseCommerce/modules/product/src/schemas/schemas').product, 'product', 'productSearchProjection'],
    ];
    stage = 'ONLINE';
    for (const [schemas, source, projection] of sources) {
        assert.equal(policy.describe(schemas[source]).publishRequired, true);
        assert.equal(policy.describe(schemas[source]).authoringAllowed, false);
        assert.equal(policy.describe(schemas[projection]).authoringAllowed, false);
    }
    const store = require('../../../../../nodics.commerce/modules/baseCommerce/modules/store/src/schemas/schemas').store;
    assert.equal(policy.describe(store.pointOfService).publishRequired, false);
    assert.equal(policy.describe(store.pointOfService).authoringAllowed, true);
});
