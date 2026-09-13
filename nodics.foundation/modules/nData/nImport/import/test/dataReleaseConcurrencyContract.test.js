/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/dataReleaseConcurrencyContract
 * @description Exercises independent release executors against the real managed-counter owner and an atomic persistence fixture.
 * @layer test
 * @owner import
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const releaseService = require('../src/service/release/defaultDataReleaseService');
const concurrency = require('../../../../nDatabase/database/src/service/schema/defaultModelConcurrencyService');
const schema = require('../src/schemas/schemas').import.dataInstallation;
global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
global.NODICS = { getSelectedEnvironmentName: () => 'isolatedEnvironment' };
global.CONFIG = { get: () => ({}) };
function fixture() {
    const records = new Map();
    const matches = (record, query) => Object.entries(query || {}).every(([key, value]) =>
        value && value.$exists === false ? record[key] === undefined : record[key] === value);
    const model = {
        primaryKey: 'code', rawSchema: schema,
        getItems: async input => ({ result: [...records.values()].filter(record => matches(record, input.query)).map(record => structuredClone(record)) }),
        compareAndSetItem: async input => {
            if (input.operation === 'create') {
                if (records.has(input.model.code)) throw concurrency.conflict();
                records.set(input.model.code, structuredClone(input.model));
                return structuredClone(input.model);
            }
            const record = records.get(input.query.code);
            if (!record || !matches(record, input.query)) return null;
            Object.assign(record, structuredClone(input.model));
            return structuredClone(record);
        }
    };
    global.SERVICE = { DefaultDataInstallationService: {
        get: request => model.getItems(request),
        save: request => concurrency.execute({ ...request, schemaModel: model }, 'save'),
        update: request => concurrency.execute({ ...request, schemaModel: model }, 'update')
    } };
    const release = { releaseCode: 'warehouse:core', moduleName: 'warehouse', dataType: 'core', version: '1.0.0', checksum: 'first' };
    const plan = { tenant: 'tenant-a', dataType: 'core', releases: [release] };
    const executor = () => ({ ...releaseService, activeExecutions: new Map(),
        resolveCompositionSources: async (plan, release) => [release],
        createImportRequest: () => ({}) });
    return { records, plan, release, executor, record: () => [...records.values()][0] };
}
test('two independent runtimes race an absent receipt; only one imports and the loser cannot fail it', async () => {
    const f = fixture();
    let imports = 0;
    const first = f.executor(), second = f.executor();
    first.invokeImport = second.invokeImport = async () => { imports++; return true; };
    const results = await Promise.allSettled([first.executePreparedPlan({}, f.plan), second.executePreparedPlan({}, f.plan)]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(imports, 1);
    assert.equal(f.record().status, 'CURRENT');
    assert.equal(f.record().revision, 2);
});
test('competing updates to an existing receipt are fenced and stale completion is rejected', async () => {
    const f = fixture(), first = f.executor(), second = f.executor();
    const code = first.installationCode(f.plan.tenant, f.release);
    f.records.set(code, { code, tenant: f.plan.tenant, status: 'FAILED', revision: 8 });
    const left = { ...f.plan, executionId: 'left' }, right = { ...f.plan, executionId: 'right' };
    const claims = await Promise.allSettled([
        first.recordInstallation(left, f.release, undefined, 'RUNNING'),
        second.recordInstallation(right, f.release, undefined, 'RUNNING')
    ]);
    assert.equal(claims.filter(result => result.status === 'fulfilled').length, 1);
    const winner = f.record().executionId === 'left' ? left : right;
    const loser = winner === left ? right : left;
    assert.equal(f.record().revision, 9);
    await assert.rejects(first.recordInstallation(loser, f.release, undefined, 'CURRENT'), /no longer owns/);
    await first.recordInstallation(winner, f.release, undefined, 'CURRENT');
    assert.equal(f.record().revision, 10);
    await assert.rejects(first.recordInstallation(winner, f.release, undefined, 'FAILED'), /no longer owns/);
    assert.equal(f.record().status, 'CURRENT');
});
test('import failure marks only the claimed release; pending deltas retain no false receipt', async () => {
    const f = fixture(), owner = f.executor();
    owner.invokeImport = async () => { throw new Error('controlled importer failure'); };
    f.plan.releases.push({ ...f.release, releaseCode: 'warehouse:coreNext', version: '2.0.0' });
    await assert.rejects(owner.executePreparedPlan({}, f.plan), /controlled importer failure/);
    assert.equal(f.records.size, 1);
    assert.equal(f.record().status, 'FAILED');
    assert.equal(f.record().revision, 2);
    assert.equal(owner.activeExecutions.size, 0);
});
test('missing storage and failed reads never create or report successful installation', async () => {
    const f = fixture(), owner = f.executor();
    delete SERVICE.DefaultDataInstallationService;
    await assert.rejects(owner.executePreparedPlan({}, f.plan), /unavailable/);
    let writes = 0;
    SERVICE.DefaultDataInstallationService = { get: async () => { throw new Error('database unavailable'); }, save: async () => { writes++; }, update: async () => { writes++; } };
    await assert.rejects(owner.recordInstallation({ ...f.plan, executionId: 'attempt' }, f.release, undefined, 'RUNNING'), /database unavailable/);
    assert.equal(writes, 0);
});
