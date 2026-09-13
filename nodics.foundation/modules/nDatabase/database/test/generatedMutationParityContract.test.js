/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module database/test/generatedMutationParityContract @description Verifies generated mutation context and shared Workbench field rules. @layer test @owner nDatabase */
'use strict';
const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');
const controller = require('../../../nController/src/controller/common');
const utility = require('../src/service/schema/defaultSchemaUtilityService');
const workbench = require('./helpers/schemaApiHarness');
const authoring = require('../src/service/schema/defaultSchemaAuthoringPolicyService');
const defaults = require('../config/properties').schemaApi;
let schema, captured, request;
beforeEach(() => {
    schema = { model: true, definition: { code: { type: 'string', primary: true }, name: { type: 'string' },
        tenant: { type: 'string' }, enterpriseCode: { type: 'string' }, ownerId: { type: 'string' },
        locked: { type: 'string', readOnly: true }, revision: { type: 'int' }, password: { type: 'string' } },
        backoffice: { concurrency: { managed: true, field: 'revision' } }, accessGroups: { editor: 10 } };
    captured = [];
    global._ = require('lodash');
    global.UTILS = { isBlank: value => !value || Object.keys(value).length === 0 };
    global.CONFIG = { get: key => ({ schemaApi: defaults, runtimeRole: { publication: 'STAGED' },
        accessPoints: { readAccessPoint: 1, writeAccessPoint: 2, removeAccessPoint: 3 } })[key] };
    global.NODICS = { getModule: name => name === 'catalog' ? { rawSchema: { schmanm: schema } } : undefined,
        isModuleActive: name => name === 'catalog' };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.SERVICE = { DefaultSchemaUtilityService: utility, DefaultSchemaAuthoringPolicyService: authoring,
        DefaultSchemaAccessHandlerService: { getAccessPoint: auth => auth && auth.access || 0 },
        DefaultSchmanmService: Object.fromEntries(['save', 'update', 'remove'].map(operation => [operation, async input => {
            captured.push(input); return operation === 'remove' ? { deletedCount: 1 } : { code: 'one', ...input.model };
        }])) };
    global.FACADE = { dsdName: Object.fromEntries(['save', 'saveAll', 'update', 'remove', 'removeById', 'removeByCode', 'get']
        .map(operation => [operation, async input => { captured.push(input); return { code: 'one', ...input.model }; }])) };
    request = { moduleName: 'catalog', tenant: 'tenant-one', enterpriseCode: 'enterprise-one',
        authData: { access: 10, loginId: 'owner-one', principalType: 'CUSTOMER' }, correlationId: 'trace-one',
        httpRequest: { params: {}, headers: { 'idempotency-key': 'operation-one' }, get: () => undefined, body: {} } };
});

/** Supplies an update/removal envelope that must not replace secured request context. */
function hostileBody() {
    return { query: { code: 'one', revision: 4 }, model: { name: 'Changed' }, ids: ['one'], codes: ['one'],
        tenant: 'other', enterpriseCode: 'other', moduleName: 'other', schemaName: 'other', schemaModel: {},
        authData: { access: 999, isSystem: true }, transactionContext: { forged: true }, correlationId: 'forged',
        options: { recursive: false, returnModified: true, skipPublication: true },
        idempotencyKey: 'body-forgery', headers: { 'idempotency-key': 'forged-key' } };
}

test('generated envelope mapping preserves trusted scope for reads and every remove/update variant', async () => {
    for (const operation of ['get', 'update', 'remove', 'removeById', 'removeByCode']) {
        const originalAuth = request.authData;
        const originalHttp = request.httpRequest;
        const input = { ...request, httpRequest: { ...originalHttp, body: hostileBody() } };
        const verifiedScope = {};
        Object.defineProperty(input, 'verifiedScope', { value: verifiedScope, enumerable: false });
        await controller[operation](input);
        const received = captured.at(-1);
        assert.strictEqual(received, input, operation);
        assert.strictEqual(received.verifiedScope, verifiedScope, operation);
        assert.equal(received.moduleName, 'catalog', operation);
        assert.equal(received.tenant, 'tenant-one', operation);
        assert.equal(received.enterpriseCode, 'enterprise-one', operation);
        assert.strictEqual(received.authData, originalAuth, operation);
        assert.equal(received.transactionContext, undefined, operation);
        assert.equal(received.correlationId, 'trace-one', operation);
        assert.equal(received.options.skipPublication, undefined, operation);
    }
});

test('generated and Workbench creates apply the same writable fields and secured business context', async () => {
    const model = { code: 'one', name: 'One', tenant: 'forged', enterpriseCode: 'forged', ownerId: 'forged',
        locked: 'cannot change', password: 'hidden', unknown: 'ignored', revision: 4 };
    await controller.save({ ...request, httpRequest: { ...request.httpRequest, body: model } });
    await workbench.createRecord({ ...request, httpRequest: { ...request.httpRequest, params: { schema: 'schmanm' }, body: { model } } });
    assert.deepEqual(captured[0].model, captured[1].model);
    assert.deepEqual(captured[0].model, { code: 'one', name: 'One', tenant: 'tenant-one', enterpriseCode: 'enterprise-one', revision: 4 });
    assert.equal(captured[0].idempotencyKey, 'operation-one');
    assert.equal(captured[1].idempotencyKey, 'operation-one');
});

test('an explicit schema operation restriction cannot be bypassed by generated writes', async () => {
    schema.backoffice.operations = ['read', 'search'];
    for (const operation of ['save', 'saveAll', 'update', 'remove', 'removeById', 'removeByCode']) {
        await assert.rejects(controller[operation]({ ...request, httpRequest: { ...request.httpRequest, body: hostileBody() } }),
            error => error.code === 'ERR_AUTH_00003');
    }
    assert.equal(captured.length, 0);
});

/** Exercises real generated service/facade templates, access/ownership guards and managed concurrency against an in-memory provider. */
function persistenceFixture() {
    const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
    const compile = relative => {
        const filename = path.resolve(__dirname, relative);
        const generated = new Module(filename, module);
        generated.paths = module.paths;
        let source = fs.readFileSync(filename, 'utf8');
        for (const [key, value] of Object.entries({ mdulnm: 'catalog', mdlnm: 'itemModel', srvcName: 'DefaultSchmanmService' })) source = source.replaceAll(key, value);
        generated._compile(source, filename);
        return generated.exports;
    };
    const concurrency = require('../src/service/schema/defaultModelConcurrencyService');
    const guards = {
        save: require('../src/service/procs/save/defaultModelSaveInitializerService'),
        update: require('../src/service/procs/update/defaultModelsUpdateInitializerService'),
        remove: require('../src/service/procs/remove/defaultModelsRemoveInitializerService'),
    };
    const run = (owner, name, input) => new Promise((resolve, reject) => owner[name](input, {}, {
        nextSuccess: () => resolve(), error: (_request, _response, error) => reject(error),
    }));
    for (const guard of Object.values(guards)) guard.LOG = { debug: () => {} };
    schema.ownership = { enabled: true, principalTypes: ['CUSTOMER'], ownerProperty: 'ownerId' };
    let stored, writes = 0, blocked = false;
    const model = { rawSchema: schema, primaryKey: 'code',
        getItems: async input => ({ result: stored && input.tenant === stored.tenant &&
            Object.entries(input.query).every(([key, value]) => stored[key] === value) ? [structuredClone(stored)] : [] }),
        compareAndSetItem: async input => {
            writes++;
            if (input.operation === 'create') { if (stored) throw concurrency.conflict(); stored = structuredClone(input.model); }
            else {
                if (!stored || !Object.entries(input.query).every(([key, value]) => stored[key] === value)) return null;
                if (input.operation === 'remove') { const previous = stored; stored = undefined; return previous; }
                Object.assign(stored, structuredClone(input.model));
            }
            return structuredClone(stored);
        },
    };
    NODICS.getModels = (moduleName, tenant) => {
        assert.equal(moduleName, 'catalog');
        assert.equal(typeof tenant, 'string');
        return { itemModel: model };
    };
    SERVICE.DefaultRecordOwnershipPolicyService = require('../src/service/access/defaultRecordOwnershipPolicyService');
    SERVICE.DefaultReferenceIntegrityService = { enforceRemove: async () => {
        if (blocked) throw new CLASSES.NodicsError('ERR_DEL_00007');
    } };
    SERVICE.DefaultSchmanmService = compile('../../../nService/src/service/common.js');
    FACADE.dsdName = compile('../../../nFacade/src/facade/common.js');
    SERVICE.DefaultPipelineService = { start: async (pipeline, input) => {
        captured.push(input);
        const operation = { modelSaveInitializerPipeline: 'save', modelsUpdateInitializerPipeline: 'update', modelsRemoveInitializerPipeline: 'remove' }[pipeline];
        assert(operation, pipeline);
        await run(guards[operation], 'checkAccess', input);
        if (operation === 'remove') await run(guards.remove, 'enforceReferenceIntegrity', input);
        if (operation === 'save') concurrency.initializeSave(input);
        const result = await concurrency.execute(input, operation);
        return { code: { save: 'SUC_SAVE_00000', update: 'SUC_UPD_00000', remove: 'SUC_DEL_00000' }[operation], result };
    } };
    return { model, read: () => stored, writes: () => writes, block: () => { blocked = true; },
        reset: value => { stored = value && structuredClone(value); writes = 0; } };
}

/** Creates a Workbench mutation envelope from the same trusted principal context. */
function workbenchRequest(body) {
    return { ...request, httpRequest: { ...request.httpRequest, params: { schema: 'schmanm' }, body } };
}

/** Creates a generated HTTP mutation request with the same principal context. */
function generatedRequest(body) { return { ...request, httpRequest: { ...request.httpRequest, body } }; }

test('generated and Workbench writes return the same owned record and original-revision outcome', async () => {
    const fixture = persistenceFixture();
    const input = { code: 'one', name: 'First', locked: 'ignored', tenant: 'forged', enterpriseCode: 'forged' };
    const generated = await controller.save(generatedRequest(input));
    assert.equal(generated.result.ownerId, 'owner-one');
    assert.equal(generated.result.revision, 1);
    assert.equal(generated.result.locked, undefined);
    const original = structuredClone(fixture.read());
    fixture.reset();
    assert.deepEqual((await workbench.createRecord(workbenchRequest({ model: input }))).data, generated.result);
    const body = { query: { code: 'one', revision: 1 }, model: { name: 'Second', ownerId: 'forged', locked: 'ignored', revision: 99 },
        options: { returnModified: true, recursive: false } };
    const updated = await controller.update(generatedRequest(body));
    assert.equal(updated.result.models[0].revision, 2);
    fixture.reset(original);
    const legacy = await workbench.updateRecord(workbenchRequest({ identity: body.query, model: body.model }));
    assert.deepEqual(legacy.data, updated.result.models[0]);
    assert.equal(legacy.data.ownerId, 'owner-one');
    assert(captured.every(input => input.idempotencyKey === 'operation-one'));
});

test('missing, malformed and stale revisions reject identically without provider writes', async () => {
    const fixture = persistenceFixture();
    fixture.reset({ code: 'one', name: 'Before', revision: 4, tenant: request.tenant, ownerId: 'owner-one' });
    for (const [revision, code] of [[undefined, 'ERR_CONCURRENCY_00002'], ['4', 'ERR_CONCURRENCY_00003'], [3, 'ERR_CONCURRENCY_00001']]) {
        const identity = { code: 'one', ...(revision === undefined ? {} : { revision }) };
        await assert.rejects(controller.update(generatedRequest({ query: identity, model: { name: 'Lost' }, options: { returnModified: true } })), { code });
        await assert.rejects(async () => workbench.updateRecord(workbenchRequest({ identity, model: { name: 'Lost' } })), { code });
    }
    assert.equal(fixture.writes(), 0);
    assert.equal(fixture.read().name, 'Before');
});

test('schema access, record ownership and tenant scope survive generated-body forgery', async () => {
    const fixture = persistenceFixture();
    fixture.reset({ code: 'one', name: 'Before', revision: 4, tenant: request.tenant, ownerId: 'another-owner' });
    await assert.rejects(controller.update(generatedRequest(hostileBody())), { code: 'ERR_CONCURRENCY_00001' });
    await assert.rejects(async () => workbench.updateRecord(workbenchRequest({ identity: { code: 'one', revision: 4 }, model: { name: 'Lost' } })), { code: 'ERR_CONCURRENCY_00001' });
    request.authData.access = 0;
    await assert.rejects(controller.update(generatedRequest(hostileBody())), { code: 'ERR_AUTH_00003' });
    request.authData.access = 10;
    fixture.reset({ code: 'one', name: 'Before', revision: 4, tenant: 'another-tenant', ownerId: 'owner-one' });
    await assert.rejects(controller.update(generatedRequest(hostileBody())), { code: 'ERR_CONCURRENCY_00001' });
    assert.equal(fixture.writes(), 0);
});

test('delete keeps owner scope, reference protection and managed revision enforcement on both paths', async () => {
    const fixture = persistenceFixture();
    const original = { code: 'one', revision: 4, tenant: request.tenant, ownerId: 'owner-one' };
    const identity = { code: 'one', revision: 4 };
    fixture.reset(original);
    const generated = await controller.remove(generatedRequest({ query: identity }));
    assert.equal(generated.result.deletedCount, 1);
    fixture.reset(original);
    const legacy = await workbench.deleteRecord(workbenchRequest({ identity }));
    assert.deepEqual(legacy.data.result, generated.result);
    fixture.reset(original); fixture.block();
    await assert.rejects(controller.remove(generatedRequest({ query: identity })), { code: 'ERR_DEL_00007' });
    await assert.rejects(async () => workbench.deleteRecord(workbenchRequest({ identity })), { code: 'ERR_DEL_00007' });
    assert.equal(fixture.writes(), 0);
});

test('promise and callback paths share field filtering, scoped context and rejection', async () => {
    const body = { query: { code: 'one', revision: 4 }, model: { name: 'Changed', locked: 'ignored' } };
    const promiseResult = await controller.update(generatedRequest(body));
    const callbackResult = await new Promise((resolve, reject) => controller.update(generatedRequest(body),
        (error, result) => error ? reject(error) : resolve(result)));
    assert.deepEqual(callbackResult, promiseResult);
    assert.equal(captured[1].model.locked, undefined);
    schema.backoffice.operations = ['read'];
    await new Promise(resolve => controller.update(generatedRequest(body), error => {
        assert.equal(error.code, 'ERR_AUTH_00003'); resolve();
    }));
});

test('active API aliases resolve to the trusted schema owner before generated writes', async () => {
    const getModule = NODICS.getModule;
    NODICS.getModule = name => name === 'api' ? { metaData: { prefix: 'catalog' } } : getModule(name);
    NODICS.isModuleActive = name => ['api', 'catalog'].includes(name);
    await controller.save({ ...generatedRequest({ code: 'one' }), moduleName: 'api' });
    assert.equal(captured[0].moduleName, 'catalog');
});

test('bulk create maps each model and keeps internal runtime fields out of client control', async () => {
    await controller.saveAll(generatedRequest([{ code: 'one', locked: 'ignored', tenant: 'forged' }, { code: 'two', ownerId: 'forged' }]));
    assert.deepEqual(captured[0].models, [
        { code: 'one', tenant: 'tenant-one', enterpriseCode: 'enterprise-one' },
        { code: 'two', tenant: 'tenant-one', enterpriseCode: 'enterprise-one' },
    ]);
    await assert.rejects(controller.saveAll(generatedRequest({ code: 'not-an-array' })), { code: 'ERR_DBS_00003' });
});

test('managed concurrency cannot advertise optional tokens that its persistence owner requires', () => {
    schema.backoffice.concurrency.required = false;
    assert.equal(utility.buildConcurrency(schema, schema.backoffice).required, true);
});

test('missing mutation metadata fails closed through both controller completion styles', async () => {
    delete SERVICE.DefaultSchemaUtilityService;
    await assert.rejects(controller.save(generatedRequest({ code: 'one' })), { code: 'ERR_DBS_00004' });
    await new Promise(resolve => controller.update(generatedRequest({ query: { code: 'one' }, model: { name: 'Changed' } }), error => {
        assert.equal(error.code, 'ERR_DBS_00004'); resolve();
    }));
    assert.equal(captured.length, 0);
});

test('discovery exclusion does not invent an additional generic API authorization policy', async () => {
    schema.backoffice.enabled = false;
    await controller.save(generatedRequest({ code: 'one', locked: 'ignored' }));
    assert.equal(captured[0].model.locked, undefined);
    schema.backoffice.mutationMode = 'READ_ONLY';
    await assert.rejects(controller.save(generatedRequest({ code: 'two' })), { code: 'ERR_AUTH_00003' });
});


test('operator and dotted-path model patches cannot bypass shared writable-field filtering', async () => {
    for (const model of [{ $set: { locked: 'forged' } }, { 'locked.value': 'forged' }, { name: 'Allowed', $inc: { revision: 9 } }]) {
        await assert.rejects(controller.update(generatedRequest({ query: { code: 'one', revision: 4 }, model })), { code: 'ERR_DBS_00003' });
        await assert.rejects(async () => workbench.updateRecord(workbenchRequest({ identity: { code: 'one', revision: 4 }, model })), { code: 'ERR_DBS_00003' });
    }
    assert.equal(captured.length, 0);
});


test('fixed field metadata cannot manufacture or replace the original managed save token', async () => {
    const fixture = persistenceFixture();
    schema.backoffice.fields = { revision: { fixedValue: 1 } };
    fixture.reset({ code: 'one', name: 'Before', revision: 1, tenant: request.tenant, ownerId: 'owner-one' });
    await assert.rejects(controller.save(generatedRequest({ code: 'one', name: 'Lost' })), { code: 'ERR_CONCURRENCY_00002' });
    await assert.rejects(async () => workbench.createRecord(workbenchRequest({ model: { code: 'one', name: 'Lost' } })), { code: 'ERR_CONCURRENCY_00002' });
    await assert.rejects(controller.save(generatedRequest({ code: 'one', name: 'Lost', revision: 9 })), { code: 'ERR_CONCURRENCY_00001' });
    assert.equal(fixture.writes(), 0);
});


test('selective schema APIs require one valid identity and preserve only its original revision', async () => {
    request.router = { schemaGoverned: true };
    for (const query of [{}, { code: { $ne: null }, revision: 4 }, { code: 'one' }, { code: 'one', revision: -1 }]) {
        for (const action of ['update', 'remove']) await assert.rejects(controller[action](generatedRequest({ query, model: { name: 'Changed' } })));
    }
    assert.equal(captured.length, 0);
    await controller.update(generatedRequest({ query: { code: 'one', revision: 4, $or: [{}], tenant: 'forged' }, model: { name: 'Changed' } }));
    assert.deepEqual(captured[0].query, { code: 'one', revision: 4 });
    assert.equal(captured[0].tenant, 'tenant-one');
});

test('selective schema APIs cannot mutate excluded or inaccessible schema metadata', async () => {
    request.router = { schemaGoverned: true };
    schema.backoffice.enabled = false;
    await assert.rejects(controller.save(generatedRequest({ code: 'one', name: 'One' })), { code: 'ERR_AUTH_00003' });
    schema.backoffice.enabled = true;
    request.authData.access = 0;
    await assert.rejects(controller.save(generatedRequest({ code: 'one', name: 'One' })), { code: 'ERR_AUTH_00003' });
    assert.equal(captured.length, 0);
});
