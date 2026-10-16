/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/BackofficeRegistryBatchSnapshot
 * @description Qualifies bounded batch snapshot work, partial-write recovery,
 * authority checks and interleaved registration through the actual registry owner.
 * @layer test
 * @owner backoffice
 * @override Layered registry implementations must retain these snapshot and admission contracts.
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const definition = require('../src/service/registry/defaultBackofficeRegistryService');
const contracts = require('../src/service/contract/defaultBackofficeContractService');

function deferred() {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
}

function fixture(hooks = {}) {
    const records = new Map();
    const snapshots = [];
    const audits = [];
    let scans = 0;
    let claimChecks = 0;
    const store = {
        get: async key => records.get(key),
        set: async (key, value) => {
            await hooks.beforeSet?.(key, value);
            records.set(key, value);
            await hooks.afterSet?.(key, value);
            return value;
        },
        values: async () => {
            scans++;
            await hooks.beforeScan?.();
            return [...records].map(([key, value]) => ({ key, value }));
        },
    };
    global.CONFIG = { get: key => key === 'backofficeRegistry' ? {
        leaseTtlMs: 30000, operationalStateTtlMs: 30000,
        maxModulesPerRegistration: 512, allowedSchemes: ['http', 'https'],
    } : undefined };
    global.CLASSES = { NodicsError: class extends Error {
        constructor(code, message) { super(message); this.code = code; }
    } };
    global.SERVICE = {
        DefaultBackofficeContractService: contracts,
        DefaultRuntimeRegistryResolverService: {
            refreshSnapshot: leases => {
                hooks.onSnapshot?.(leases);
                snapshots.push(leases.map(lease => ({ ...lease })));
            },
        },
        DefaultBackofficeAuditService: { record: async event => {
            await hooks.beforeAudit?.(event);
            audits.push(event);
            return true;
        } },
        DefaultFunctionalModuleCatalogueService: {
            buildLeaseFunctionalModuleIndex: batch => Object.fromEntries(
                batch.registrations.map(item => [item.moduleName, 'fixtureFunctional'])),
            reconcileRuntimeBatch: async batch => {
                await hooks.reconcileRuntime?.(batch);
                return [{ functionalModule: 'fixtureFunctional',
                    registrationState: 'REGISTERED', enabled: true, catalogueRevision: 1 }];
            },
            reconcileActiveRuntimeLeases: async (...args) => hooks.reconcileActive?.(...args),
        },
    };
    const registry = Object.assign({}, definition, { _store: store,
        _metrics: { registrations: 0, renewals: 0, rejected: 0 } });
    registry.assertAuthorityClaimsAvailable = async function (...args) {
        claimChecks++;
        return definition.assertAuthorityClaimsAvailable.apply(this, args);
    };
    function batch(instanceId, names) {
        return { instanceId, project: 'fixtureProject', environment: 'fixtureEnvironment',
            server: instanceId + 'Server', registrations: names.map(moduleName => ({
                moduleName, displayName: moduleName, canonicalIdentity: moduleName, instanceId,
                clientCallable: true, endpoint: 'http://127.0.0.1:4300',
            })) };
    }
    function auth(batchValue) {
        return { tokenType: 'service', runtimeInstanceId: batchValue.instanceId,
            modules: batchValue.registrations.map(item => item.moduleName), runtimeScope: {
                assignmentCode: 'fixtureAssignment', projectCode: batchValue.project,
                environmentCode: batchValue.environment, serverCode: batchValue.server,
                instanceCode: batchValue.instanceId,
            } };
    }
    function standalone(batchValue) {
        return registry.register({ body: batchValue.registrations[0], authData: auth(batchValue) });
    }
    return { registry, records, snapshots, audits, batch, auth, standalone,
        get scans() { return scans; }, get claimChecks() { return claimChecks; } };
}

test('72-module registration and renewal each publish one consolidated snapshot', async () => {
    const f = fixture();
    const batch = f.batch('batch', Array.from({ length: 72 }, (_, i) => 'module' + i));
    let overrideCalls = 0;
    f.registry.register = function (request) {
        overrideCalls++;
        return definition.register.call(this, request);
    };
    for (let attempt = 1; attempt <= 2; attempt++) {
        const result = await f.registry.registerBatch(batch, f.auth(batch));
        assert.equal(result.data.registeredModules, 72);
        assert(result.data.operationalState.modules.every(item => item.enabled));
        assert.equal(f.scans, attempt);
        assert.equal(f.snapshots.length, attempt);
        assert.equal(f.snapshots.at(-1).length, 72);
        assert.equal(f.claimChecks, attempt * 72);
        assert.equal(overrideCalls, attempt * 72);
    }
    assert.equal(f.registry._metrics.registrations, 72);
    assert.equal(f.registry._metrics.renewals, 72);
    assert.deepEqual(f.audits.map(event => event.outcome), ['registered', 'renewed']);
});

test('partial failure waits for late sibling writes before refreshing persisted leases', async () => {
    const late = deferred();
    const entered = deferred();
    const failure = new Error('isolated write failure');
    const f = fixture({ beforeSet: async key => {
        if (key.startsWith('failed:')) throw failure;
        if (key.startsWith('late:')) { entered.resolve(); await late.promise; }
    } });
    const batch = f.batch('partial', ['early', 'failed', 'late']);
    let settled = false;
    const result = f.registry.registerBatch(batch, f.auth(batch));
    const checked = assert.rejects(result, error => error === failure);
    result.then(() => { settled = true; }, () => { settled = true; });
    await entered.promise;
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(settled, false);
    assert.equal(f.snapshots.length, 0);
    late.resolve();
    await checked;
    assert.equal(f.scans, 1);
    assert.deepEqual(f.snapshots[0].map(item => item.moduleName).sort(), ['early', 'late']);
    assert.equal(f.audits.length, 0);
});

test('failed write acknowledgement still refreshes a lease that was persisted', async () => {
    const failure = new Error('isolated acknowledgement failure');
    const f = fixture({ afterSet: async () => { throw failure; } });
    const batch = f.batch('acknowledgement', ['persisted']);
    await assert.rejects(f.registry.registerBatch(batch, f.auth(batch)), error => error === failure);
    assert.equal(f.records.size, 1);
    assert.equal(f.snapshots[0][0].moduleName, 'persisted');
});

test('catalogue reconciliation failures retain one coherent lease snapshot', async () => {
    for (const hook of ['reconcileRuntime', 'reconcileActive']) {
        const failure = new Error('isolated reconciliation failure');
        const f = fixture({ [hook]: async () => { throw failure; } });
        const batch = f.batch('reconciliation', ['persisted']);
        await assert.rejects(f.registry.registerBatch(batch, f.auth(batch)), error => error === failure);
        assert.equal(f.scans, 1);
        assert.equal(f.snapshots.length, 1);
        assert.equal(f.snapshots[0][0].moduleName, 'persisted');
    }
});

test('recovery refresh failures preserve both errors and never report success', async () => {
    const writeFailure = new Error('isolated write failure');
    const refreshFailure = new Error('isolated snapshot failure');
    const f = fixture({ afterSet: async () => { throw writeFailure; },
        onSnapshot: () => { throw refreshFailure; } });
    const batch = f.batch('failure', ['persisted']);
    await assert.rejects(f.registry.registerBatch(batch, f.auth(batch)), error => {
        assert(error instanceof AggregateError);
        assert.deepEqual(error.errors, [writeFailure, refreshFailure]);
        return true;
    });
    assert.equal(f.snapshots.length, 0);
});

test('concurrent batches never suppress standalone registration refreshes', async () => {
    const late = deferred();
    const entered = deferred();
    const f = fixture({ beforeSet: async key => {
        if (key === 'late:batchA') { entered.resolve(); await late.promise; }
    } });
    const a = f.batch('batchA', ['early', 'late']);
    const b = f.batch('batchB', ['other']);
    const single = f.batch('standalone', ['single']);
    const pendingA = f.registry.registerBatch(a, f.auth(a));
    await entered.promise;
    await f.registry.registerBatch(b, f.auth(b));
    assert.equal(f.snapshots.length, 1);
    await f.standalone(single);
    assert.equal(f.snapshots.length, 2);
    assert(f.snapshots.at(-1).some(item => item.moduleName === 'single'));
    late.resolve();
    await pendingA;
    assert.equal(f.snapshots.length, 3);
    assert.equal(f.scans, 3);
    assert.equal(f.snapshots.at(-1).length, 4);
});

test('a slow reconciliation cannot publish an older snapshot over a concurrent registration', async () => {
    const resume = deferred();
    const entered = deferred();
    let calls = 0;
    const f = fixture({ reconcileActive: async () => {
        if (++calls === 1) { entered.resolve(); await resume.promise; }
    } });
    const a = f.batch('batchA', ['early']);
    const b = f.batch('batchB', ['later']);
    const pendingA = f.registry.registerBatch(a, f.auth(a));
    await entered.promise;
    await f.registry.registerBatch(b, f.auth(b));
    resume.resolve();
    await pendingA;
    assert.equal(f.snapshots.length, 2);
    assert.deepEqual(f.snapshots.at(-1).map(item => item.moduleName).sort(), ['early', 'later']);
});

test('every authority claim is still checked, including duplicate rejection', async () => {
    const f = fixture();
    const owner = f.batch('owner', ['claimed']);
    owner.registrations[0].authorityClaims = [{ kind: 'schema', moduleName: 'claimed',
        claimName: 'claimedItem', authorityContext: 'fixture.claimed' }];
    await f.standalone(owner);
    const challenger = f.batch('challenger', ['claimed', 'independent']);
    challenger.registrations[0].authorityClaims = owner.registrations[0].authorityClaims;
    await assert.rejects(f.registry.registerBatch(challenger, f.auth(challenger)),
        error => error.code === 'ERR_BOF_00000');
    assert.equal(f.claimChecks, 3);
    assert.equal(f.records.has('claimed:challenger'), false);
    assert.equal(f.records.has('independent:challenger'), true);
    assert.equal(f.snapshots.at(-1).length, 2);
    assert(f.audits.some(event => event.reasonCode === 'DUPLICATE_AUTHORITY_CLAIM'));
});

test('claim-bearing batches retain per-item authority scans but only one snapshot refresh', async () => {
    const f = fixture();
    const batch = f.batch('claims', Array.from({ length: 72 }, (_, i) => 'module' + i));
    for (const item of batch.registrations) {
        item.authorityClaims = [{ kind: 'schema', moduleName: item.moduleName,
            claimName: item.moduleName + 'Item', authorityContext: 'fixture.' + item.moduleName }];
    }
    await f.registry.registerBatch(batch, f.auth(batch));
    assert.equal(f.claimChecks, 72);
    assert.equal(f.scans, 73);
    assert.equal(f.snapshots.length, 1);
});

test('a transient snapshot failure repairs coherence without acknowledging the failed batch', async () => {
    const failure = new Error('isolated transient snapshot failure');
    let attempts = 0;
    const f = fixture({ onSnapshot: () => { if (++attempts === 1) throw failure; } });
    const batch = f.batch('snapshot', ['persisted']);
    await assert.rejects(f.registry.registerBatch(batch, f.auth(batch)), error => error === failure);
    assert.equal(attempts, 2);
    assert.equal(f.scans, 2);
    assert.equal(f.snapshots.length, 1);
    assert.equal(f.snapshots[0][0].moduleName, 'persisted');
    assert.equal(f.audits.length, 0);
});

test('an audit failure after snapshot publication does not rescan or report success', async () => {
    const failure = new Error('isolated audit failure');
    const f = fixture();
    f.registry.audit = async () => { throw failure; };
    const batch = f.batch('audit', ['persisted']);
    await assert.rejects(f.registry.registerBatch(batch, f.auth(batch)), error => error === failure);
    assert.equal(f.scans, 1);
    assert.equal(f.snapshots.length, 1);
    assert.equal(f.snapshots[0][0].moduleName, 'persisted');
});

test('body-chosen private flags and invalid scope cannot defer snapshots or write leases', async () => {
    const f = fixture();
    const batch = f.batch('admission', ['module']);
    const auth = f.auth(batch);
    await assert.rejects(f.registry.register({ body: { ...batch.registrations[0],
        _batchRegistration: true }, authData: auth }), error => error.code === 'ERR_BOF_00000');
    await assert.rejects(f.registry.registerBatch({ ...batch, _batchRegistration: true }, auth),
        error => error.code === 'ERR_BOF_00000');
    await assert.rejects(f.registry.registerBatch(batch, { ...auth, modules: [] }),
        error => error.code === 'ERR_BOF_00000');
    assert.equal(f.records.size, 0);
    assert.equal(f.scans, 0);
    assert.equal(f.snapshots.length, 0);
    await f.standalone(batch);
    assert.equal(f.scans, 1);
    assert.equal(f.snapshots.length, 1);
});
