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
        get: async request => ({ code: 'SUC_DBS_00000', ...await model.getItems(request) }),
        save: async request => ({ code: 'SUC_DBS_00000', result: await concurrency.execute({ ...request, schemaModel: model }, 'save') }),
        update: async request => ({ code: 'SUC_DBS_00000', result: await concurrency.execute({ ...request, schemaModel: model }, 'update') })
    } };
    const release = { releaseCode: 'warehouse:core', moduleName: 'warehouse', dataType: 'core', version: '1.0.0', checksum: 'first' };
    const plan = { tenant: 'tenant-a', dataType: 'core', releases: [release] };
    const executor = () => ({ ...releaseService, activeExecutions: new Map(),
        resolveCompositionSources: async (plan, release) => [release],
        createImportRequest: () => ({}) });
    return { records, plan, release, executor, record: () => [...records.values()][0] };
}
function zeroWorkFixture() {
    const f = fixture(), owner = f.executor();
    const code = owner.installationCode(f.plan.tenant, f.release);
    f.records.set(code, { ...f.release, code, tenant: f.plan.tenant, status: 'CURRENT', revision: 2, runId: 'zero-run' });
    const run = { runId: 'zero-run', tenant: f.plan.tenant, dataType: f.plan.dataType, status: 'NO_DATA',
        modules: [f.release.moduleName], dataReleases: [structuredClone(f.release)], validationOnly: false,
        summary: Object.fromEntries(['recordsRead', 'recordsFinalized', 'recordsDispatched', 'recordsSucceeded', 'recordsFailed', 'recordsSkipped'].map(key => [key, 0])) };
    SERVICE.DefaultImportRunService = { get: async request => {
        assert.equal(request.tenant, f.plan.tenant);
        assert.deepEqual(request.query, { runId: 'zero-run' });
        assert.deepEqual(request.searchOptions, { pageSize: 2, pageNumber: 1 });
        assert.deepEqual(request.options, { recursive: false, skipItemCache: true });
        return { code: 'SUC_DBS_00000', result: [structuredClone(run)] };
    } };
    let imports = 0;
    owner.invokeImport = async request => {
        imports++;
        request.importRun = { runId: 'recovery-run', status: 'COMPLETED', summary: { recordsSucceeded: 1 } };
    };
    return { ...f, owner, code, run, request: { releaseRequest: { forceCurrent: true } }, imports: () => imports };
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
test('zero-work imports fail their claimed receipt instead of becoming current', async () => {
    for (const importRun of [{ status: 'NO_DATA' }, { status: 'COMPLETED', summary: { recordsSucceeded: 0 } }]) {
        const f = fixture(), owner = f.executor();
        owner.invokeImport = async request => { request.importRun = importRun; return true; };
        await assert.rejects(owner.executePreparedPlan({}, f.plan), /zero-work import/);
        assert.equal(f.record().status, 'FAILED');
        assert.equal(f.record().revision, 2);
        assert.equal(owner.activeExecutions.size, 0);
    }
});
test('explicit Local zero-work recovery preserves source and uses the normal fenced installation', async () => {
    const originalConfig = CONFIG;
    try {
        CONFIG = { get: key => key === 'environment' ? { class: 'LOCAL' } : {} };
        const f = fixture(), owner = f.executor();
        const code = owner.installationCode(f.plan.tenant, f.release);
        f.records.set(code, { ...f.release, code, tenant: f.plan.tenant, status: 'CURRENT', revision: 2, runId: 'zero-run' });
        const run = { runId: 'zero-run', tenant: f.plan.tenant, dataType: f.plan.dataType, status: 'NO_DATA',
            modules: [f.release.moduleName], dataReleases: [f.release], validationOnly: false,
            summary: Object.fromEntries(['recordsRead', 'recordsFinalized', 'recordsDispatched', 'recordsSucceeded', 'recordsFailed', 'recordsSkipped'].map(key => [key, 0])) };
        SERVICE.DefaultImportRunService = { get: async () => ({ code: 'SUC_DBS_00000', result: [structuredClone(run)] }) };
        let imports = 0;
        owner.invokeImport = async request => { imports++; request.importRun = { runId: 'recovery-run', status: 'COMPLETED', summary: { recordsSucceeded: 1 } }; };
        await assert.rejects(owner.executePreparedPlan({}, f.plan), /already current/);
        await owner.executePreparedPlan({ releaseRequest: { forceCurrent: true } }, f.plan);
        assert.equal(imports, 1);
        assert.equal(f.record().revision, 4);
        assert.equal(f.record().status, 'CURRENT');
        assert.equal(f.record().runId, 'recovery-run');
        assert.equal(f.record().checksum, f.release.checksum);
        assert.equal(f.record().version, f.release.version);
        await assert.rejects(owner.executePreparedPlan({ releaseRequest: { forceCurrent: true } }, f.plan), /already current/);
    } finally { global.CONFIG = originalConfig; }
});
test('zero-work recovery rejects writes, ambiguous history, foreign scope, changed source and non-Local execution', async () => {
    const originalConfig = CONFIG;
    try {
        for (const mutate of [
            run => { run.summary.recordsDispatched = 1; }, run => { run.summary.recordsSucceeded = 1; },
            run => { delete run.summary.recordsFailed; }, run => { run.status = 'COMPLETED'; },
            run => { run.validationOnly = true; }, run => { run.tenant = 'other'; },
            run => { run.dataReleases[0].checksum = 'other'; }, run => { run.dataReleases = []; },
            run => { CONFIG = { get: key => key === 'environment' ? { class: 'PRODUCTION' } : {} }; },
        ]) {
            CONFIG = { get: key => key === 'environment' ? { class: 'LOCAL' } : {} };
            const f = fixture(), owner = f.executor(), code = owner.installationCode(f.plan.tenant, f.release);
            f.records.set(code, { ...f.release, code, tenant: f.plan.tenant, status: 'CURRENT', revision: 2, runId: 'zero-run' });
            const run = { runId: 'zero-run', tenant: f.plan.tenant, dataType: f.plan.dataType, status: 'NO_DATA',
                modules: [f.release.moduleName], dataReleases: [structuredClone(f.release)], validationOnly: false,
                summary: Object.fromEntries(['recordsRead', 'recordsFinalized', 'recordsDispatched', 'recordsSucceeded', 'recordsFailed', 'recordsSkipped'].map(key => [key, 0])) };
            mutate(run);
            SERVICE.DefaultImportRunService = { get: async () => ({ code: 'SUC_DBS_00000', result: [run] }) };
            owner.invokeImport = async () => assert.fail('Rejected recovery must not import');
            await assert.rejects(owner.executePreparedPlan({ releaseRequest: { forceCurrent: true } }, f.plan), /already current/);
            assert.equal(f.record().revision, 2);
        }
    } finally { global.CONFIG = originalConfig; }
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
test('Local recovery refuses an unacknowledged RUNNING claim before import dispatch', async t => {
    const originalConfig = CONFIG;
    try {
        CONFIG = { get: key => key === 'environment' ? { class: 'LOCAL' } : {} };
        for (const [name, response] of [
            ['failed envelope', { code: 'ERR_DBS_00000', error: true }],
            ['explicit negative acknowledgement', { code: 'SUC_DBS_00000', acknowledged: false }],
            ['missing acknowledgement', undefined],
            ['missing result', { code: 'SUC_DBS_00000' }],
            ['missing match count', { code: 'SUC_DBS_00000', result: {} }],
            ['unmatched fence', { code: 'SUC_DBS_00000', result: { matchedCount: 0 } }],
            ['ambiguous match count', { code: 'SUC_DBS_00000', result: { matchedCount: 2 } }],
            ['nested negative acknowledgement', { code: 'SUC_DBS_00000', result: { matchedCount: 1, acknowledged: false } }],
            ['nested failure', { code: 'SUC_DBS_00000', result: { matchedCount: 1, success: false } }],
            ['nested errors', { code: 'SUC_DBS_00000', result: { matchedCount: 1, errors: [{}] } }],
        ]) await t.test(name, async () => {
            const f = zeroWorkFixture(), before = structuredClone(f.record());
            SERVICE.DefaultDataInstallationService.update = async () => response;
            await assert.rejects(f.owner.executePreparedPlan(f.request, f.plan));
            assert.equal(f.imports(), 0, 'No import may run without a positively acknowledged durable claim');
            assert.deepEqual(f.record(), before);
            assert.equal(f.owner.activeExecutions.size, 0);
        });
    } finally { global.CONFIG = originalConfig; }
});
test('Local recovery refuses failed receipt-read envelopes even when they contain a plausible CURRENT row', async () => {
    const originalConfig = CONFIG;
    try {
        CONFIG = { get: key => key === 'environment' ? { class: 'LOCAL' } : {} };
        const f = zeroWorkFixture(), before = structuredClone(f.record());
        const get = SERVICE.DefaultDataInstallationService.get;
        SERVICE.DefaultDataInstallationService.get = async request => ({ ...await get(request),
            code: 'ERR_DBS_00000', error: true, acknowledged: false });
        await assert.rejects(f.owner.executePreparedPlan(f.request, f.plan));
        assert.equal(f.imports(), 0);
        assert.deepEqual(f.record(), before);
    } finally { global.CONFIG = originalConfig; }
});
test('Local recovery requires successful unambiguous run evidence, not merely a matching result body', async t => {
    const originalConfig = CONFIG;
    try {
        CONFIG = { get: key => key === 'environment' ? { class: 'LOCAL' } : {} };
        for (const [name, response] of [
            ['missing response', () => undefined], ['missing success code', run => ({ result: [run] })],
            ['failed code with records', run => ({ code: 'ERR_DBS_00000', result: [run] })],
            ['error with records', run => ({ code: 'SUC_DBS_00000', error: true, result: [run] })],
            ['success false', run => ({ code: 'SUC_DBS_00000', success: false, result: [run] })],
            ['acknowledged false', run => ({ code: 'SUC_DBS_00000', acknowledged: false, result: [run] })],
            ['errors with records', run => ({ code: 'SUC_DBS_00000', errors: [{}], result: [run] })],
            ['missing result', () => ({ code: 'SUC_DBS_00000' })],
            ['empty result', () => ({ code: 'SUC_DBS_00000', result: [] })],
            ['ambiguous result', run => ({ code: 'SUC_DBS_00000', result: [run, structuredClone(run)] })],
        ]) await t.test(name, async () => {
            const f = zeroWorkFixture(), before = structuredClone(f.record());
            SERVICE.DefaultImportRunService.get = async () => response(structuredClone(f.run));
            await assert.rejects(f.owner.executePreparedPlan(f.request, f.plan));
            assert.equal(f.imports(), 0);
            assert.deepEqual(f.record(), before);
            assert.equal(f.owner.activeExecutions.size, 0);
        });
    } finally { global.CONFIG = originalConfig; }
});
test('all six zero-work counters must be present numeric zero and run source scope must match', async t => {
    const originalConfig = CONFIG;
    try {
        CONFIG = { get: key => key === 'environment' ? { class: 'LOCAL' } : {} };
        const mutations = [];
        for (const key of ['recordsRead', 'recordsFinalized', 'recordsDispatched', 'recordsSucceeded', 'recordsFailed', 'recordsSkipped']) {
            for (const value of [1, -1, '0', null]) mutations.push([key + '=' + JSON.stringify(value), run => { run.summary[key] = value; }]);
            mutations.push(['missing ' + key, run => { delete run.summary[key]; }]);
        }
        mutations.push(['wrong run identity', run => { run.runId = 'foreign-run'; }],
            ['wrong data type', run => { run.dataType = 'sample'; }],
            ['missing module', run => { run.modules = []; }],
            ['wrong release module', run => { run.dataReleases[0].moduleName = 'other'; }],
            ['wrong release version', run => { run.dataReleases[0].version = '2.0.0'; }]);
        for (const [name, mutate] of mutations) await t.test(name, async () => {
            const f = zeroWorkFixture(), before = structuredClone(f.record());
            mutate(f.run);
            await assert.rejects(f.owner.executePreparedPlan(f.request, f.plan), /already current/);
            assert.equal(f.imports(), 0);
            assert.deepEqual(f.record(), before);
        });
    } finally { global.CONFIG = originalConfig; }
});
test('standard recovery excludes custom installers and cannot be minted by serialized proof fields', async t => {
    const originalConfig = CONFIG;
    try {
        CONFIG = { get: key => key === 'environment' ? { class: 'LOCAL' } : {} };
        await t.test('custom installer never consults zero-work run evidence', async () => {
            const f = zeroWorkFixture(), before = structuredClone(f.record());
            f.release.installer = 'LOYALTY_SAMPLE_CREDITS';
            SERVICE.DefaultImportRunService.get = async () => assert.fail('Custom installer must be excluded before history access');
            await assert.rejects(f.owner.executePreparedPlan(f.request, f.plan), /already current/);
            assert.equal(f.imports(), 0);
            assert.deepEqual(f.record(), before);
        });
        await t.test('body and plan lookalikes cannot authorize direct fenced claim', async () => {
            const f = zeroWorkFixture(), before = structuredClone(f.record());
            const proof = { runId: 'zero-run', revision: 2, checksum: f.release.checksum };
            const plan = { ...structuredClone(f.plan), executionId: 'forged-attempt', forceCurrent: true,
                zeroWorkRecoveryPlans: new Map([[f.release.releaseCode, proof]]),
                zeroWorkRecoveries: { [f.release.releaseCode]: proof }, zeroWorkCodes: [f.release.releaseCode] };
            assert.equal(f.owner.isZeroWorkRecovery(plan, f.release, before), false);
            await assert.rejects(f.owner.recordInstallation(plan, f.release, undefined, 'RUNNING'), /no longer available/);
            assert.equal(f.imports(), 0);
            assert.deepEqual(f.record(), before);
        });
    } finally { global.CONFIG = originalConfig; }
});
test('private recovery proof rejects a changed receipt preimage before claiming or importing', async t => {
    const originalConfig = CONFIG;
    try {
        CONFIG = { get: key => key === 'environment' ? { class: 'LOCAL' } : {} };
        for (const [field, value] of [['revision', 3], ['runId', 'another-run'], ['checksum', 'another-checksum'],
            ['version', '2.0.0'], ['status', 'RUNNING']]) await t.test(field, async () => {
            const f = zeroWorkFixture();
            f.owner.recordInstallation = async function (...args) {
                f.record()[field] = value;
                return releaseService.recordInstallation.apply(this, args);
            };
            const expected = { ...structuredClone(f.record()), [field]: value };
            await assert.rejects(f.owner.executePreparedPlan(f.request, f.plan));
            assert.equal(f.imports(), 0);
            assert.deepEqual(f.record(), expected);
            assert.equal(f.owner.activeExecutions.size, 0);
        });
    } finally { global.CONFIG = originalConfig; }
});
test('contradictory duplicate release evidence cannot qualify an exact-source recovery', async () => {
    const originalConfig = CONFIG;
    try {
        CONFIG = { get: key => key === 'environment' ? { class: 'LOCAL' } : {} };
        const f = zeroWorkFixture(), before = structuredClone(f.record());
        f.run.dataReleases.push({ ...f.release, checksum: 'conflicting-source' });
        await assert.rejects(f.owner.executePreparedPlan(f.request, f.plan), /already current/);
        assert.equal(f.imports(), 0);
        assert.deepEqual(f.record(), before);
    } finally { global.CONFIG = originalConfig; }
});
test('initial receipt creation requires the returned claim identity and managed initial revision before effects', async t => {
    for (const [name, response] of [
        ['missing response', () => undefined],
        ['bare document', request => ({ ...request.model, revision: 1 })],
        ['wrong receipt', request => ({ code: 'SUC_DBS_00000', result: { ...request.model, code: 'other', revision: 1 } })],
        ['wrong attempt', request => ({ code: 'SUC_DBS_00000', result: { ...request.model, executionId: 'other', revision: 1 } })],
        ['wrong status', request => ({ code: 'SUC_DBS_00000', result: { ...request.model, status: 'CURRENT', revision: 1 } })],
        ['missing revision', request => ({ code: 'SUC_DBS_00000', result: request.model })],
        ['wrong revision', request => ({ code: 'SUC_DBS_00000', result: { ...request.model, revision: 2 } })],
    ]) await t.test(name, async () => {
        const f = fixture(), owner = f.executor();
        SERVICE.DefaultDataInstallationService.save = async request => response(request);
        owner.invokeImport = async () => assert.fail('Unconfirmed creation cannot authorize import effects');
        await assert.rejects(owner.executePreparedPlan({}, f.plan), { code: 'ERR_IMP_00004' });
        assert.equal(f.records.size, 0);
        assert.equal(owner.activeExecutions.size, 0);
    });
});
test('failed scoped receipt reads reject after recovery qualification without dispatch or mutation', async () => {
    const originalConfig = CONFIG;
    try {
        CONFIG = { get: key => key === 'environment' ? { class: 'LOCAL' } : {} };
        const f = zeroWorkFixture(), before = structuredClone(f.record());
        const get = SERVICE.DefaultDataInstallationService.get;
        SERVICE.DefaultDataInstallationService.get = async request => {
            const response = await get(request);
            return request.query.code ? { ...response, success: false } : response;
        };
        await assert.rejects(f.owner.executePreparedPlan(f.request, f.plan), { code: 'ERR_IMP_00004' });
        assert.equal(f.imports(), 0);
        assert.deepEqual(f.record(), before);
        assert.equal(f.owner.activeExecutions.size, 0);
    } finally { global.CONFIG = originalConfig; }
});
test('generic custom installers can complete with acknowledged receipts and no importRun', async () => {
    const f = fixture(), owner = f.executor();
    f.release.installer = 'EXAMPLE_OWNER';
    let imports = 0;
    owner.invokeImport = async request => {
        imports++;
        assert.equal(request.importRun, undefined);
        return { ownerReceipt: 'custom-owner-result' };
    };
    const result = await owner.executePreparedPlan({}, f.plan);
    assert.equal(imports, 1);
    assert.equal(result.code, 'SUC_IMP_00000');
    assert.equal(f.record().status, 'CURRENT');
    assert.equal(f.record().revision, 2);
    assert.equal(f.record().runId, undefined);
    assert.equal(result.data.importRun, undefined);
});
