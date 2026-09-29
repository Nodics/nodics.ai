/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Validates publication lifecycle success, concurrency, idempotency, provider, boundary, failure, and rollback behavior. */
const assert = require('assert');
const properties = require('../config/properties').publish;

class NodicsError extends Error {
    constructor(code, message) { super(message || code); this.code = code; }
}
global.CLASSES = { NodicsError: NodicsError };
global.CONFIG = { get: key => key === 'publish' ? properties : key === 'defaultTenant' ? 'default' : undefined };
global.SERVICE = {};

const records = new Map();
const audits = new Map();
const repository = {
    get: async code => records.get(code),
    create: async model => { if (!records.has(model.code)) records.set(model.code, Object.assign({}, model)); return records.get(model.code); },
    transition: async (publication, expected, patch) => {
        let current = records.get(publication.code);
        if (Number(current.revision) !== Number(expected)) throw new NodicsError('ERR_PUB_00004', 'Publication revision conflict');
        current = Object.assign({}, current, patch, { revision: Number(current.revision) + 1 });
        records.set(current.code, current);
        return current;
    },
    transitionWithAudit: async (publication, expected, patch, audit) => {
        let entry = Object.assign({}, audit, { revision: Number(publication.revision) + 1 });
        let updated = await repository.transition(publication, expected,
            Object.assign({}, patch, { auditTrail: [].concat(publication.auditTrail || [], [entry]) }));
        await repository.appendAudit(entry);
        return updated;
    },
    appendAudit: async audit => { audits.set(audit.publicationCode + '_' + audit.revision + '_' + audit.toState, audit); return audit; }
};
let activated = 0;
let rolledBack = 0;
let approvalRequests = 0;
const versionProvider = {
    getVersion: async publication => ({ code: publication.sourceVersion }),
    getOnlineVersion: async () => ({ version: 'v0' }),
    activate: async publication => { activated++; return { version: publication.sourceVersion, authorization: 'must-not-be-audited' }; },
    rollback: async (publication, target) => { rolledBack++; return { restored: target }; }
};
const adapter = {
    resolveDependencies: async () => ['component-a'],
    validate: async () => ({ valid: true, secret: 'must-not-be-audited' })
};
properties.providers.repositoryProvider = repository;
properties.providers.versionProvider = versionProvider;
properties.providers.domainAdapters = { cms: adapter };
properties.providers.workflowProvider = { requestApproval: async () => { approvalRequests++; } };

const service = require('../src/service/defaultPublicationLifecycleService');
const request = (revision, extra) => Object.assign({ tenant: 'tenant-a', publicationCode: 'page-home',
    expectedRevision: revision, authData: { principalId: 'editor-a' }, correlationId: 'correlation-a' }, extra || {});

(async () => {
    let created = await service.create(Object.assign(request(undefined), { publication: {
        code: 'page-home', domain: 'cms', rootType: 'page', rootCode: 'home', sourceVersion: '0'
    } }));
    assert.strictEqual(created.state, 'STAGED');
    assert.strictEqual(created.revision, 0);
    assert.strictEqual(created.auditTrail.length, 1);
    assert.strictEqual((await service.create(Object.assign(request(undefined), { publication: {
        code: 'page-home', domain: 'cms', rootType: 'page', rootCode: 'home', sourceVersion: '0'
    } }))).code, 'page-home', 'create must be idempotent');

    let validated = await service.validate(request(0));
    assert.strictEqual(validated.state, 'VALIDATED');
    assert.deepStrictEqual(validated.dependencies, ['component-a']);
    assert.strictEqual(validated.validation.secret, undefined, 'stored validation evidence must remove secrets');
    assert.strictEqual(validated.auditTrail.length, 3, 'state and authoritative audit journal must advance together');

    let pending = await service.requestApproval(request(2));
    assert.strictEqual((await service.requestApproval(request(pending.revision))).state, 'PENDING_APPROVAL');
    assert.strictEqual(approvalRequests, 2, 'approval retries must redeliver through an idempotent workflow provider');
    let approved = await service.approve(request(pending.revision, { workflowEvidence: {
        instanceCode: 'approval-instance-1', definitionCode: 'cmsPublicationApproval', version: 1
    } }));
    assert.strictEqual(approved.workflowRef, 'approval-instance-1');
    assert.strictEqual(approved.auditTrail.at(-1).details.workflow.instanceCode, 'approval-instance-1');
    let online = await service.activate(request(approved.revision));
    assert.strictEqual(online.state, 'ONLINE');
    assert.strictEqual(online.previousOnlineVersion, 'v0');
    assert.strictEqual(activated, 1);
    assert.strictEqual((await service.activate(request(online.revision))).state, 'ONLINE');
    assert.strictEqual(activated, 1, 'online replay must not activate twice');

    let replay = await service.publishApproved(Object.assign(request(undefined), { publication: {
        code: 'page-home', domain: 'cms', rootType: 'page', rootCode: 'home', sourceVersion: '0'
    } }));
    assert.strictEqual(replay.state, 'ONLINE', 'approved workflow replay must return the existing Online release');
    assert.strictEqual(activated, 1, 'approved workflow replay must not deploy twice');
    let refreshed = await service.validate(request(replay.revision));
    assert.strictEqual(refreshed.state, 'VALIDATED', 'online refresh must revalidate without withdrawing the current target');
    assert.strictEqual(activated, 1, 'online refresh preparation must not deploy before approval');
    let refreshPending = await service.requestApproval(request(refreshed.revision));
    assert.strictEqual(refreshPending.state, 'PENDING_APPROVAL', 'online refresh must still require approval before activation');
    let refreshApproved = await service.approve(request(refreshPending.revision, { workflowEvidence: {
        instanceCode: 'approval-instance-2', definitionCode: 'cmsPublicationApproval', version: 1
    } }));
    online = await service.activate(request(refreshApproved.revision));
    assert.strictEqual(online.state, 'ONLINE');
    assert.notStrictEqual(online.activationOperation.key, replay.activationOperation.key,
        'a completed Online refresh must start a new operation, not replay the completed one');
    assert.strictEqual(activated, 2, 'approved online refresh must activate exactly once');
    let originalGetOnlineVersion = versionProvider.getOnlineVersion;
    versionProvider.getOnlineVersion = async () => ({ partial: true, routeCount: 2 });
    records.set('partial-site-refresh', { code: 'partial-site-refresh', domain: 'cms', state: 'APPROVED',
        revision: 0, sourceVersion: '0' });
    let partialSiteRefresh = await service.activate(request(0, { publicationCode: 'partial-site-refresh' }));
    assert.strictEqual(partialSiteRefresh.state, 'ONLINE');
    assert.strictEqual(partialSiteRefresh.previousOnlineVersion, undefined,
        'partial site-bundle target evidence must not be stored as rollback version');
    versionProvider.getOnlineVersion = originalGetOnlineVersion;

    let rollback = await service.rollback(request(online.revision));
    assert.strictEqual(rollback.state, 'ROLLED_BACK');
    assert.strictEqual(rolledBack, 1);
    assert.strictEqual((await service.rollback(request(rollback.revision))).state, 'ROLLED_BACK');
    assert.strictEqual(rolledBack, 1, 'rollback replay must be idempotent');
    let resubmitted = await service.resubmit(request(rollback.revision));
    assert.strictEqual(resubmitted.state, 'VALIDATED', 'rollback recovery must revalidate before approval');
    let repending = await service.requestApproval(request(resubmitted.revision));
    assert.strictEqual(repending.state, 'PENDING_APPROVAL', 'rollback recovery must require approval again');
    assert([...audits.values()].every(audit => !JSON.stringify(audit).includes('must-not-be-audited')));

    records.set('invalid', { code: 'invalid', domain: 'cms', state: 'STAGED', revision: 0 });
    await assert.rejects(service.resubmit(request(0, { publicationCode: 'invalid' })), /Only a rolled back/);
    await assert.rejects(service.approve(request(0, { publicationCode: 'invalid' })), /Invalid publication transition/);
    await assert.rejects(service.validate(request(9, { publicationCode: 'invalid' })), /revision conflict/);

    records.set('failure', { code: 'failure', domain: 'cms', state: 'APPROVED', revision: 0, sourceVersion: '0' });
    let originalActivate = versionProvider.activate;
    versionProvider.activate = async () => { throw new NodicsError('PROVIDER_FAILED', 'Provider failed'); };
    await assert.rejects(service.activate(request(0, { publicationCode: 'failure' })), /Provider failed/);
    assert.strictEqual(records.get('failure').state, 'FAILED');
    versionProvider.activate = originalActivate;

    records.set('activation-recovery', { code: 'activation-recovery', domain: 'cms', state: 'ACTIVATING', revision: 4,
        sourceVersion: '0' });
    assert.strictEqual((await service.activate(request(4, { publicationCode: 'activation-recovery' }))).state, 'ONLINE',
        'activation retries must resume an in-progress provider operation');

    records.set('rollback-recovery', { code: 'rollback-recovery', domain: 'cms', state: 'ROLLING_BACK', revision: 7,
        sourceVersion: '0', previousOnlineVersion: '0' });
    assert.strictEqual((await service.rollback(request(7, { publicationCode: 'rollback-recovery' }))).state, 'ROLLED_BACK',
        'rollback retries must resume an in-progress provider operation');

    properties.lifecycle.maxDependencies = 0;
    records.set('bounded', { code: 'bounded', domain: 'cms', state: 'STAGED', revision: 0, sourceVersion: '0' });
    await assert.rejects(service.validate(request(0, { publicationCode: 'bounded' })), /dependency boundary/);
    assert.strictEqual(records.get('bounded').state, 'FAILED');
    properties.lifecycle.maxDependencies = 10000;

    records.set('lost-target-response', { code: 'lost-target-response', domain: 'cms', state: 'APPROVED', revision: 0, sourceVersion: 'v2' });
    versionProvider.getOnlineVersion = async () => ({ version: 'v0' });
    versionProvider.activate = async publication => {
        assert.deepStrictEqual(records.get(publication.code).activationOperation,
            { key: 'lost-target-response:activate:1', previousOnlineVersion: 'v0' });
        throw new Error('Target committed but response was lost');
    };
    await assert.rejects(service.activate(request(0, { publicationCode: 'lost-target-response' })), /response was lost/);
    assert.strictEqual(records.get('lost-target-response').activationOperation.key, 'lost-target-response:activate:1');
    assert.strictEqual(records.get('lost-target-response').targetVersion, undefined);

    // A recovered target receipt, not a fresh Online read, owns rollback lineage.
    records.set('receipt-replay', { code: 'receipt-replay', domain: 'cms', state: 'ACTIVATING', revision: 4,
        sourceVersion: 'v2', activationOperation: { key: 'receipt-replay:activate:4', previousOnlineVersion: 'v1' } });
    versionProvider.targetReceiptContract = 'v1';
    versionProvider.getOnlineVersion = async () => { throw new Error('Replay must not reread predecessor'); };
    versionProvider.activate = async publication => ({ version: 'v2', receipt: {
        operationKey: publication.activationOperation.key, publicationCode: publication.code,
        sourceVersion: 'v2', targetVersion: 'v2', previousOnlineVersion: 'v0'
    } });
    const replayed = await service.activate(request(4, { publicationCode: 'receipt-replay' }));
    assert.strictEqual(replayed.previousOnlineVersion, 'v0');
    assert.strictEqual(replayed.auditTrail.at(-1).details.receipt.operationKey, 'receipt-replay:activate:4');
    for (const field of ['operationKey', 'publicationCode', 'sourceVersion', 'targetVersion', 'previousOnlineVersion']) {
        const code = 'bad-receipt-' + field;
        records.set(code, { code, domain: 'cms', state: 'ACTIVATING', revision: 4, sourceVersion: 'v2',
            activationOperation: { key: code + ':activate:4', previousOnlineVersion: 'v0' } });
        versionProvider.activate = async publication => ({ version: 'v2', receipt: {
            operationKey: publication.activationOperation.key, publicationCode: code,
            sourceVersion: 'v2', targetVersion: 'v2', previousOnlineVersion: 'v0', [field]: undefined
        } });
        await assert.rejects(service.activate(request(4, { publicationCode: code })), /receipt is invalid/);
        assert.strictEqual(records.get(code).state, 'FAILED');
    }
    records.set('first-target', { code: 'first-target', domain: 'cms', state: 'ACTIVATING', revision: 1,
        sourceVersion: 'v2', activationOperation: { key: 'first-target:activate:1' }, previousOnlineVersion: 'stale' });
    versionProvider.activate = async publication => ({ version: 'v2', receipt: {
        operationKey: publication.activationOperation.key, publicationCode: publication.code,
        sourceVersion: 'v2', targetVersion: 'v2', previousOnlineVersion: null
    } });
    assert.strictEqual((await service.activate(request(1, { publicationCode: 'first-target' }))).previousOnlineVersion, null);
    delete versionProvider.targetReceiptContract;
    records.set('legacy-receipt', { code: 'legacy-receipt', domain: 'cms', state: 'ACTIVATING', revision: 4, sourceVersion: 'v2' });
    versionProvider.activate = async () => ({ version: 'v2', previousOnlineVersion: 'v0' });
    assert.strictEqual((await service.activate(request(4, { publicationCode: 'legacy-receipt' }))).previousOnlineVersion, 'v0');
    for (const revision of [0, 7, undefined]) {
        const code = 'predecessor-' + revision;
        records.set(code, { code, domain: 'cms', state: 'APPROVED', revision: 0, sourceVersion: 'v2' });
        versionProvider.getOnlineVersion = async () => ({ version: revision === 0 ? null : 'v0', revision });
        versionProvider.activate = async publication => {
            const retained = records.get(code).activationOperation;
            assert.strictEqual(retained.previousOnlineRevision, revision);
            assert.strictEqual(Object.hasOwn(retained, 'previousOnlineRevision'), revision !== undefined);
            return { version: 'v2' };
        };
        await service.activate(request(0, { publicationCode: code }));
        const stored = records.get(code);
        records.set(code, { ...stored, state: 'ACTIVATING' });
        versionProvider.getOnlineVersion = async () => { throw new Error('Replay must not refresh target revision'); };
        await service.activate(request(stored.revision, { publicationCode: code }));
    }
    for (const revision of [null, -1, 0.5, '7', Number.MAX_SAFE_INTEGER + 1]) {
        records.set('invalid-predecessor', { code: 'invalid-predecessor', domain: 'cms', state: 'APPROVED', revision: 0, sourceVersion: 'v2' });
        versionProvider.getOnlineVersion = async () => ({ version: 'v0', revision });
        versionProvider.activate = async () => { throw new Error('Must reject before target work'); };
        await assert.rejects(service.activate(request(0, { publicationCode: 'invalid-predecessor' })), /Target predecessor revision is invalid/);
        assert.strictEqual(records.get('invalid-predecessor').state, 'APPROVED');
    }
    for (const failure of ['response-loss', 'completion-hook', 'legacy-response-loss', 'first-target-response-loss']) {
        const code = 'retry-' + failure;
        const qualified = failure !== 'legacy-response-loss';
        if (qualified) versionProvider.targetReceiptContract = 'v1';
        else delete versionProvider.targetReceiptContract;
        records.set(code, { code, domain: 'cms', state: 'APPROVED', revision: 0, sourceVersion: 'v2' });
        const predecessor = failure === 'first-target-response-loss' ? null : 'v0';
        let pointer = predecessor;
        let reads = 0;
        let commits = 0;
        let receipt;
        let loseResponse = failure !== 'completion-hook';
        let failHook = failure === 'completion-hook';
        versionProvider.getOnlineVersion = async () => { reads++; return { version: pointer, revision: 7 }; };
        versionProvider.activate = async publication => {
            if (receipt) assert.strictEqual(publication.activationOperation.key, receipt.operationKey);
            else {
                receipt = { operationKey: publication.activationOperation.key, publicationCode: code,
                    sourceVersion: 'v2', targetVersion: 'v2', previousOnlineVersion: pointer };
                pointer = 'v2';
                commits++;
            }
            if (loseResponse) { loseResponse = false; throw new Error('Committed response lost'); }
            return qualified ? { version: 'v2', receipt } : { version: 'v2' };
        };
        adapter.afterActivate = async () => {
            if (failHook) { failHook = false; throw new Error('Completion hook failed'); }
        };
        await assert.rejects(service.activate(request(0, { publicationCode: code })), /lost|hook failed/);
        let failed = records.get(code);
        const operation = structuredClone(failed.activationOperation);
        assert.strictEqual(failed.state, 'FAILED');
        let retried = await service.retry(request(failed.revision, { publicationCode: code }));
        let pendingRetry = await service.requestApproval(request(retried.revision, { publicationCode: code }));
        let approvedRetry = await service.approve(request(pendingRetry.revision, { publicationCode: code }));
        const recovered = await service.activate(request(approvedRetry.revision, { publicationCode: code }));
        assert.strictEqual(recovered.state, 'ONLINE');
        assert.deepStrictEqual(recovered.activationOperation, operation);
        assert.strictEqual(recovered.previousOnlineVersion, predecessor);
        assert.strictEqual(reads, 1, 'retry must not replace the original predecessor with the committed target');
        assert.strictEqual(commits, 1);
        versionProvider.rollback = async (publication, previous) => {
            assert.strictEqual(previous, predecessor);
            pointer = previous;
            return { restored: previous };
        };
        const restored = await service.rollback(request(recovered.revision, { publicationCode: code }));
        assert.strictEqual(pointer, predecessor);
        const fresh = await service.resubmit(request(restored.revision, { publicationCode: code }));
        assert.strictEqual(fresh.activationOperation, null, 'completed rollback permits a new activation identity');
    }
    delete adapter.afterActivate;
    delete versionProvider.targetReceiptContract;
    console.log('nPublish lifecycle orchestration validated');
})().catch(error => { console.error(error); process.exit(1); });
