/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module export/test/exportWorkspaceAvailability
 * @description Proves read-only export availability without exposing files or bypassing generation permission.
 * @layer test
 * @owner export
 * @override Extend for additional qualified formats and runtime collaborators.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const service = require('../src/service/DataExportService');
const controller = require('../src/controller/DataExportController');
const facade = require('../src/facade/DataExportFacade');
const routers = require('../src/router/routers').export.dataExport;
const defaults = require('../config/properties');

const collaborators = [
    ['DefaultSchemaUtilityService', 'getSchema'],
    ['DefaultSchemaSafeQueryService', 'searchGenerated'],
    ['DefaultSchemaReadAccessPolicyService', 'applyExportPolicies'],
    ['DefaultMediaUploadService', 'upload'],
];

/** Builds active runtime metadata whose collaborators must never execute on a status read. */
function runtime(values = {}) {
    let calls = 0;
    global.CONFIG = {
        get: key => ({ dataExport: { ...defaults.dataExport, ...values.dataExport }, apiExposure: { categories: { dataExport: { enabled: values.exposed === true } } } })[key],
    };
    global.SERVICE = Object.fromEntries(collaborators.map(([name, method]) => [name, {
        [method]: () => { calls++; throw new Error('Availability must not read records or write media'); },
    }]));
    global.CLASSES = { NodicsError: class extends Error {
        constructor(code, message) { super(message); this.code = code; }
    } };
    return { service: Object.assign({}, service), calls: () => calls };
}

test('default HTTP opt-out is reported before generation without performing any operation', async () => {
    const active = runtime();
    const result = await active.service.workspace({ export: { available: true, moduleName: 'foreign' } });
    assert.equal(result.data.contractVersion, 1);
    assert.equal(result.data.kind, 'GOVERNED_EXPORT');
    assert.equal(result.data.availability, 'DISABLED');
    assert.ok(result.data.reason);
    assert.deepEqual(result.data.formats, ['csv', 'json']);
    assert.equal(active.calls(), 0);
});

test('an intentional exposure opt-in reports only supported configured formats when collaborators exist', async () => {
    const active = runtime({ exposed: true, dataExport: { allowedFormats: ['json', 'json', 'unimplemented'] } });
    const result = await active.service.workspace({});
    assert.equal(result.data.availability, 'AVAILABLE');
    assert.deepEqual(result.data.formats, ['json']);
    assert.equal(result.data.reason, undefined);
    assert.equal(active.calls(), 0);
});

test('engine opt-out and missing formats cannot be overridden by HTTP exposure', async () => {
    assert.equal((await runtime({ exposed: true, dataExport: { enabled: false } }).service.workspace({})).data.availability, 'DISABLED');
    assert.equal((await runtime({ exposed: true, dataExport: { allowedFormats: [] } }).service.workspace({})).data.availability, 'UNAVAILABLE');
});

test('malformed engine enablement cannot report availability or admit a direct command', async () => {
    const active = runtime({ exposed: true, dataExport: { enabled: 'false' } });
    assert.equal((await active.service.workspace({})).data.availability, 'UNAVAILABLE');
    assert.throws(() => active.service.normalizeRequest({ tenant: 'default', authData: { entCode: 'default' },
        export: { moduleName: 'editorial', schemaName: 'editorialAuthor', format: 'json' } }),
        error => error.code === 'ERR_EXP_00001');
});

test('execution also refuses a missing export-policy collaborator instead of returning unfiltered copies', async () => {
    const active = runtime({ exposed: true });
    delete global.SERVICE.DefaultSchemaReadAccessPolicyService;
    await assert.rejects(Promise.resolve().then(() => active.service.applyExportAccessPolicies({}, [{ code: 'synthetic-sensitive-record' }])),
        error => error.code === 'ERR_EXP_00001');
});

for (const [name] of collaborators) {
    test('missing ' + name + ' keeps export unavailable', async () => {
        const active = runtime({ exposed: true });
        delete global.SERVICE[name];
        const result = await active.service.workspace({});
        assert.equal(result.data.availability, 'UNAVAILABLE');
        assert.equal(active.calls(), 0);
        assert.ok(!JSON.stringify(result).includes(name));
    });
}

test('configuration observation failures return bounded unavailable evidence without private errors', async () => {
    const active = runtime({ exposed: true });
    global.CONFIG.get = () => { throw new Error('private runtime details'); };
    const result = await active.service.workspace({});
    assert.equal(result.data.availability, 'UNAVAILABLE');
    assert.deepEqual(result.data.formats, []);
    assert.ok(!JSON.stringify(result).includes('private runtime details'));
});

test('workspace keeps the generation permission and a distinct read-only exposure category', async () => {
    const route = routers.exportWorkspaceGet;
    assert.equal(route.method, 'GET');
    assert.equal(route.key, '/workspace');
    assert.equal(route.secured, true);
    assert.equal(route.permission, routers.exportPost.permission);
    assert.equal(route.apiExposure, 'dataExportStatus');
    assert.equal(defaults.apiExposure.categories.dataExport.enabled, false);
    assert.equal(defaults.apiExposure.categories.dataExportStatus.enabled, true);
});

test('controller and facade delegate the read without converting it into an export command', async () => {
    const active = runtime();
    global.SERVICE.DataExportService = active.service;
    global.FACADE = { DataExportFacade: facade };
    assert.equal((await controller.workspace({ httpRequest: { body: { format: 'json' } } })).data.availability, 'DISABLED');
    const callbackResult = await new Promise((resolve, reject) => controller.workspace({}, (error, result) => error ? reject(error) : resolve(result)));
    assert.equal(callbackResult.data.availability, 'DISABLED');
    assert.equal(active.calls(), 0);
});
