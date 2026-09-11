/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module database/test/modelConcurrencyContract @description Exercises managed CRUD counters, preserved read tokens, scoped writes, no-ops, and customization. @layer test @owner database */
'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const definition = require('../src/service/schema/defaultModelConcurrencyService');
const importer = require('../../../nData/nImport/import/src/service/process/model/defaultModelImportProcessService');
global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
global.SERVICE = {};
const schema = { definition: { revision: { type: 'int' } }, backoffice: { concurrency: { field: 'revision', managed: true } } };

function fixture(initial) {
    let stored = initial && structuredClone(initial);
    let writes = 0;
    let race;
    const service = Object.assign({}, definition);
    const model = {
        primaryKey: 'code', rawSchema: schema,
        getItems: async input => {
            assert.equal(input.tenant, 'tenant-a');
            const matches = stored && Object.entries(input.query).every(([key, value]) => stored[key] === value);
            return { result: matches ? [structuredClone(stored)] : [] };
        },
        compareAndSetItem: async input => {
            writes++;
            if (race) { const callback = race; race = undefined; callback(stored); }
            if (input.operation === 'create') {
                if (stored) throw service.conflict();
                stored = structuredClone(input.model);
            } else {
                const matches = stored && Object.entries(input.query).every(([key, value]) =>
                    value && value.$exists === false ? stored[key] === undefined : stored[key] === value);
                if (!matches) return null;
                if (input.operation === 'remove') { const previous = stored; stored = undefined; return previous; }
                Object.assign(stored, structuredClone(input.model));
            }
            return structuredClone(stored);
        }
    };
    return { service, model, read: () => stored, writes: () => writes, race: callback => { race = callback; },
        request: (data, revision) => ({ tenant: 'tenant-a', schemaModel: model,
            query: { code: 'one', ...(revision !== undefined ? { revision } : {}) }, model: data,
            options: { returnModified: true } }) };
}

test('create initializes the counter and subsequent edits return the saved revision without client arithmetic', async () => {
    const f = fixture();
    const create = f.request({ code: 'one', name: 'First' });
    f.service.initializeSave(create);
    assert.equal((await f.service.execute(create, 'save')).revision, 1);
    const updated = await f.service.execute(f.request({ name: 'Second' }, 1), 'update');
    assert.equal(updated.models[0].revision, 2);
    assert.equal(updated.modifiedCount, 1);
    assert.equal(f.read().name, 'Second');
});

test('unchanged saves do not increment, write, or confuse modified and matched counts', async () => {
    const f = fixture({ code: 'one', revision: 4, name: 'Same', updated: new Date(0) });
    const result = await f.service.execute(f.request({ name: 'Same', updated: new Date() }, 4), 'update');
    assert.equal(result.matchedCount, 1);
    assert.equal(result.modifiedCount, 0);
    assert.equal(result.models[0].revision, 4);
    assert.equal(f.writes(), 0);
});

test('stale, missing, malformed and mid-write conflicting tokens cannot overwrite another editor', async () => {
    const f = fixture({ code: 'one', revision: 4, name: 'Original' });
    await assert.rejects(f.service.execute(f.request({ name: 'Lost' }, 3), 'update'), { code: 'ERR_CONCURRENCY_00001' });
    await assert.rejects(f.service.execute(f.request({ name: 'Lost' }), 'update'), { code: 'ERR_CONCURRENCY_00002' });
    await assert.rejects(f.service.execute(f.request({ name: 'Lost' }, { $gte: 0 }), 'update'), { code: 'ERR_CONCURRENCY_00003' });
    f.race(record => { record.revision = 5; record.name = 'Other editor'; });
    await assert.rejects(f.service.execute(f.request({ name: 'Lost' }, 4), 'update'), { code: 'ERR_CONCURRENCY_00001' });
    assert.equal(f.read().name, 'Other editor');
});

test('a default inserted by the save pipeline cannot manufacture an original token', async () => {
    const f = fixture({ code: 'one', revision: 1, name: 'Existing' });
    const req = f.request({ code: 'one', name: 'Lost' });
    f.service.initializeSave(req);
    assert.equal(req.model.revision, 1);
    await assert.rejects(f.service.execute(req, 'save'), { code: 'ERR_CONCURRENCY_00002' });
    assert.equal(f.read().name, 'Existing');
});

test('legacy missing counters migrate lazily through an exists predicate without resetting live counters', async () => {
    const f = fixture({ code: 'one', name: 'Before' });
    const result = await f.service.execute(f.request({ name: 'After' }, 0), 'update');
    assert.equal(result.models[0].revision, 1);
    await assert.rejects(f.service.execute(f.request({ name: 'Reset' }, 0), 'update'), { code: 'ERR_CONCURRENCY_00001' });
});

test('managed deletes preserve concurrency and selectors remain record scoped', async () => {
    const f = fixture({ code: 'one', revision: 2 });
    await assert.rejects(f.service.execute(f.request(undefined, 1), 'remove'), { code: 'ERR_CONCURRENCY_00001' });
    const broad = f.request({}, 2); broad.query = { revision: 2 };
    await assert.rejects(f.service.execute(broad, 'remove'), { code: 'ERR_CONCURRENCY_00003' });
    assert.equal((await f.service.execute(f.request(undefined, 2), 'remove')).deletedCount, 1);
    assert.equal(f.read(), undefined);
});

test('operator payloads and identity changes cannot bypass managed-field ownership', async () => {
    const f = fixture({ code: 'one', revision: 1 });
    await assert.rejects(f.service.execute(f.request({ $inc: { revision: -1 } }, 1), 'update'), { code: 'ERR_CONCURRENCY_00003' });
    await assert.rejects(f.service.execute(f.request({ code: 'another' }, 1), 'update'), { code: 'ERR_CONCURRENCY_00003' });
    assert.equal(f.writes(), 0);
});

test('domain revisions remain unchanged and a project can select a different technical field', () => {
    assert.equal(definition.getField({ definition: { revision: { type: 'int' } } }), undefined);
    assert.equal(definition.getField({ ...schema, backoffice: { concurrency: { managed: false } } }), undefined);
    assert.equal(definition.getField({ definition: { editCounter: { type: 'long' } },
        backoffice: { concurrency: { field: 'editCounter', managed: true } } }), 'editCounter');
    assert.throws(() => definition.getField({ ...schema, isVersionedEnabled: true }), { code: 'ERR_CONCURRENCY_00003' });
});

test('imports ignore source technical counters, preserve first snapshots across retries and keep business versions', async () => {
    global.SERVICE.DefaultModelConcurrencyService = definition;
    let reads = 0;
    let liveRevision = 8;
    const request = { tenant: 'tenant-a', header: { rawSchema: schema, query: { code: '$code' },
        options: { moduleName: 'store', schemaName: 'store', operation: 'saveAll', userGroups: ['importer'] } } };
    const generated = { get: async req => {
        reads++;
        assert.equal(req.tenant, 'tenant-a');
        assert.deepEqual(req.authData.userGroups, ['importer']);
        return { result: [{ code: 'one', revision: liveRevision }] };
    } };
    let records = await importer.reconcileManagedRevisions(request, generated, [{ code: 'one', revision: 1, businessVersion: 7 }]);
    assert.equal(records[0].revision, 8);
    assert.equal(records[0].businessVersion, 7);
    liveRevision = 9;
    records = await importer.reconcileManagedRevisions(request, generated, [{ code: 'one', revision: 1 }]);
    assert.equal(records[0].revision, 8);
    assert.equal(reads, 1);
    const fresh = { ...request };
    records = await importer.reconcileManagedRevisions(fresh, generated, [{ code: 'one' }]);
    assert.equal(records[0].revision, 9);
    const created = await importer.reconcileManagedRevisions({ ...request }, { get: async () => ({ result: [] }) }, [{ code: 'new' }]);
    assert.equal(created[0].revision, 0);
    await assert.rejects(importer.reconcileManagedRevisions({ ...request, header: {
        ...request.header, options: { ...request.header.options, operation: 'remove' }
    } }, generated, [{ code: 'one' }]), { code: 'ERR_CONCURRENCY_00003' });
});

test('ownership selectors survive the compare-and-set and inaccessible records cannot be updated', async () => {
    const f = fixture({ code: 'one', owner: 'alice', revision: 1, name: 'Private' });
    const wrongOwner = f.request({ name: 'Lost' }, 1);
    wrongOwner.query.owner = 'bob';
    await assert.rejects(f.service.execute(wrongOwner, 'update'), { code: 'ERR_CONCURRENCY_00001' });
    assert.equal(f.writes(), 0);
    const owner = f.request({ name: 'Changed' }, 1);
    owner.query.owner = 'alice';
    f.race(record => { record.owner = 'bob'; });
    await assert.rejects(f.service.execute(owner, 'update'), { code: 'ERR_CONCURRENCY_00001' });
    assert.equal(f.read().name, 'Private');
});

test('unchanged save skips generated post-save mutation effects', async () => {
    const f = fixture({ code: 'one', revision: 1, name: 'Same' });
    const request = f.request({ code: 'one', name: 'Same' }, 1);
    f.service.initializeSave(request);
    await f.service.execute(request, 'save');
    assert.equal(f.service.wasUnchanged(request), true);
    assert.equal(f.writes(), 0);
    global.SERVICE.DefaultModelConcurrencyService = f.service;
    const pipeline = require('../src/service/procs/save/defaultModelSaveInitializerService');
    for (const step of ['applyPostInterceptors', 'invalidateRouterCache', 'invalidateItemCache', 'triggerModelChangeEvent']) {
        let passed = false;
        pipeline[step](request, {}, { nextSuccess: () => { passed = true; } });
        assert.equal(passed, true, step);
    }
});

test('Workbench unwraps persisted nested results and never fabricates a successful stale record', () => {
    const workbench = require('../src/service/schema/defaultSchemaWorkbenchService');
    const persisted = { code: 'one', revision: 9, name: 'Saved' };
    assert.equal(workbench.extractMutationRecord({ code: 'SUC_UPD_00000', result: {
        matchedCount: 1, modifiedCount: 1, models: [persisted]
    } }), persisted);
    assert.equal(workbench.extractMutationRecord({ code: 'SUC_SAVE_00000', result: persisted }), persisted);
    assert.throws(() => workbench.extractMutationRecord({ result: { matchedCount: 0, models: [] } }),
        { code: 'ERR_CONCURRENCY_00001' });
    assert.throws(() => workbench.extractMutationRecord({ result: { modifiedCount: 1 } }),
        { code: 'ERR_DBS_00004' });
});
