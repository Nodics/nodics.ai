/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/test/editorialOnlineProjectionService @description Qualifies Staged transport, original activation recovery and exact command acknowledgements without runtime data access. @layer test @owner editorial */
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const source = require('../src/service/defaultEditorialOnlineProjectionService');

function setup(t) {
    const original = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    t.after(() => Object.assign(global, original));
    const config = structuredClone(require('../config/properties').editorial);
    config.publication.runtimeRole = 'STAGED'; config.publication.targetTransportProvider = 'Transport';
    const publication = { code: 'publication-story-r2', domain: 'editorial', rootType: 'article', rootCode: 'story', sourceVersion: '2', revision: 5,
        activationOperation: { key: 'original-key', previousOnlineVersion: null, previousOnlineRevision: 0 } };
    const result = { version: 'story-site-ar-2,story-site-en-2', projectionCodes: ['story-site-ar-2', 'story-site-en-2'], receipt: {
        operationKey: 'original-key', publicationCode: publication.code, rootCode: 'story', sourceVersion: '2',
        targetVersion: 'story-site-ar-2,story-site-en-2', previousOnlineVersion: null, previousOnlineRevision: 0 } };
    const request = { tenant: 'tenantA', authData: Object.freeze({ principalId: 'original-author' }) }, calls = [];
    const state = { activation: { status: 'UNKNOWN' }, result, sourceReads: 0 };
    const pointer = () => ({ version: null, revision: 0, projectionCodes: [], deployment: null, activation: state.activation, ...state.pointer });
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.CONFIG = { get: key => key === 'editorial' ? config : undefined };
    global.SERVICE = { Transport: Object.fromEntries(['status', 'deploy', 'rollback', 'withdraw'].map(operation => [operation, async (payload, scope) => {
        assert.equal(scope, request); calls.push({ operation, payload });
        if (operation === 'status') return pointer();
        if (operation === 'deploy') return state.result;
        const kind = operation === 'rollback' ? 'ROLLBACK' : 'WITHDRAWAL', version = operation === 'rollback' ? payload.targetVersion : payload.publication.targetVersion;
        return { ...(operation === 'rollback' ? { version, restored: 2 } : { articleCode: 'story', withdrawn: 2 }), projectionCodes: version.split(','), receipt: {
            operationKey: payload.operationKey, publicationCode: publication.code, rootCode: 'story', sourceVersion: '2', operation: kind, targetVersion: version, affected: 2 } };
    }])),
        DefaultEditorialPublicationVersionProviderService: { getVersion: async () => {
            state.sourceReads++;
            return { code: 'story', revision: 2, status: 'APPROVED', contentTypeCode: 'NEWS', siteCodes: ['site'], embargoAt: new Date('2027-01-01T00:00:00Z') };
        } },
        DefaultEditorialArticleLocalizationService: { get: async input => {
            assert.equal(input.tenant, request.tenant); assert.equal(input.authData, request.authData);
            assert.deepEqual(input.query, { articleCode: 'story', revision: 2, status: 'READY' });
            return { code: 'SUC_FIND_00000', result: ['en', 'ar'].map(localeCode => ({ articleCode: 'story', revision: 2, status: 'READY', localeCode, slug: 'story', title: 'Approved ' + localeCode, summary: 'Saved copy', body: { blocks: [] } })) };
        } }
    };
    const command = (kind, version) => {
        publication.state = kind === 'ROLLBACK' ? 'ROLLING_BACK' : 'WITHDRAWING';
        publication.targetCommandOperation = { contractVersion: 1, operation: kind, operationKey: publication.code + (kind === 'ROLLBACK' ? ':rollback:' : ':withdraw:') + '5',
            publicationCode: publication.code, domain: publication.domain, rootType: publication.rootType, rootCode: publication.rootCode, sourceVersion: publication.sourceVersion,
            activationKey: publication.activationOperation.key, targetVersionHash: crypto.createHash('sha256').update(JSON.stringify(version)).digest('hex'), originRevision: 5 };
    };
    return { config, publication, result, request, calls, state, command };
}

test('fresh activation transports actual approved bilingual source, embargo and the retained absent-pointer token', async t => {
    const f = setup(t);
    assert.deepEqual(await source.activate(f.publication, f.request), f.result);
    assert.equal(f.state.sourceReads, 1); assert.deepEqual(f.calls.map(call => call.operation), ['status', 'deploy']);
    assert.equal(f.calls[1].payload.operationKey, 'original-key');
    assert.equal(f.calls[1].payload.publication, f.publication);
    assert.equal(f.calls[1].payload.projections.length, 2);
    assert(f.calls[1].payload.projections.every(row => row.payload.embargoAt.toISOString() === '2027-01-01T00:00:00.000Z'));
});

test('original committed activation is recovered without mutable source reads or new target deployment, even after visibility changes', async t => {
    const f = setup(t); f.state.activation = { status: 'COMMITTED', result: f.result, isCurrent: false };
    const advanced = { ...f.publication, revision: 9 };
    assert.deepEqual(await source.activate(advanced, f.request), f.result);
    assert.equal(f.state.sourceReads, 0); assert.deepEqual(f.calls.map(call => call.operation), ['status']);
    const inspected = await source.reconcile(advanced, f.request);
    assert.equal(inspected.status, 'COMMITTED'); assert.equal(inspected.repaired, false); assert.equal(inspected.originalActivation.isCurrent, false);
});

test('Staged without its transport and an unqualified runtime cannot substitute local writes', async t => {
    const f = setup(t);
    f.config.publication.targetTransportProvider = null;
    await assert.rejects(source.activate(f.publication, f.request), /distinct qualified Online/);
    await assert.rejects(source.activateLocal(f.publication, f.request, []), /cannot replace/);
    await assert.rejects(source.getActiveSet(f.publication, f.request), /Online runtime/);
    f.config.publication.runtimeRole = undefined;
    f.publication.targetVersion = f.result.version; f.command('WITHDRAWAL', f.result.version);
    await assert.rejects(source.withdraw(f.publication, f.request), /explicit Staged transport/);
    assert.equal(f.calls.length, 0); assert.equal(f.state.sourceReads, 0);
});

for (const corruption of ['negative', 'root', 'source', 'operation', 'previous-revision', 'missing-pointer-revision']) test('unverified activation evidence fails closed: ' + corruption, async t => {
    const f = setup(t), forged = structuredClone(f.result);
    if (corruption === 'negative') forged.success = false;
    if (corruption === 'root') forged.receipt.rootCode = 'other';
    if (corruption === 'source') forged.receipt.sourceVersion = '1';
    if (corruption === 'operation') forged.receipt.operationKey = 'new-key';
    if (corruption === 'previous-revision') forged.receipt.previousOnlineRevision = 1;
    if (corruption === 'missing-pointer-revision') global.SERVICE.Transport.status = async () => ({ version: null, projectionCodes: [], activation: { status: 'UNKNOWN' } });
    else f.state.activation = { status: 'COMMITTED', result: forged, isCurrent: false };
    await assert.rejects(source.activate(f.publication, f.request));
    assert.equal(f.state.sourceReads, 0); assert.equal(f.calls.some(call => call.operation === 'deploy'), false);
});

test('fresh activation rejects a changed or no longer approved saved source before target mutation', async t => {
    const f = setup(t);
    for (const article of [{ code: 'other', revision: 2, status: 'APPROVED' }, { code: 'story', revision: 3, status: 'APPROVED' }, { code: 'story', revision: 2, status: 'DRAFT' }]) {
        global.SERVICE.DefaultEditorialPublicationVersionProviderService.getVersion = async () => article;
        await assert.rejects(source.activate(f.publication, f.request), /saved approved/);
    }
    assert.equal(f.calls.some(call => call.operation === 'deploy'), false);
});

test('rollback and withdrawal reach the configured Online owner with exact original command identity', async t => {
    const f = setup(t); f.publication.targetVersion = f.result.version;
    f.command('ROLLBACK', 'previous-ar,previous-en');
    assert.equal((await source.rollback(f.publication, 'previous-ar,previous-en', f.request)).restored, 2);
    f.command('WITHDRAWAL', f.result.version);
    assert.equal((await source.withdraw(f.publication, f.request)).withdrawn, 2);
    assert.deepEqual(f.calls.map(call => call.operation), ['rollback', 'withdraw']);
    assert.equal(f.calls[0].payload.operationKey, f.publication.code + ':rollback:5');
    assert.equal(f.calls[1].payload.operationKey, f.publication.code + ':withdraw:5');
    global.SERVICE.Transport.withdraw = async () => ({ articleCode: 'story', withdrawn: 2 });
    await assert.rejects(source.withdraw(f.publication, f.request), /could not be confirmed/);
});

test('deployment evidence distinguishes qualified absence, deployed identity and unknown target data', async t => {
    const f = setup(t);
    assert.deepEqual(await source.getDeployment('story', f.request), { status: 'NONE', revision: 0 });
    f.state.pointer = { version: f.result.version, projectionCodes: f.result.projectionCodes, revision: 2,
        deployment: { publicationCode: f.publication.code, sourceRevision: 2, activationKey: 'original-key' } };
    assert.deepEqual(await source.getDeployment('story', f.request), { status: 'DEPLOYED', code: f.publication.code, sourceRevision: 2,
        activationKey: 'original-key', version: f.result.version, revision: 2 });
    for (const patch of [{ deployment: null }, { deployment: { ...f.state.pointer.deployment, sourceRevision: 0 } },
        { deployment: { ...f.state.pointer.deployment, activationKey: '' } }, { projectionCodes: [] }]) {
        const original = f.state.pointer; f.state.pointer = { ...original, ...patch };
        await assert.rejects(source.getDeployment('story', f.request)); f.state.pointer = original;
    }
    f.state.pointer = { deployment: undefined };
    await assert.rejects(source.getDeployment('story', f.request), /absence is unverified/);
});

for (const kind of ['ROLLBACK', 'WITHDRAWAL']) test('Staged ' + kind + ' transports its original key and actual advanced lifecycle revision', async t => {
    const f = setup(t), version = f.result.version;
    f.publication.targetVersion = version; f.command(kind, version);
    f.publication.revision = 9;
    const operation = kind === 'ROLLBACK' ? 'rollback' : 'withdraw';
    if (kind === 'ROLLBACK') await source.rollback(f.publication, version, f.request); else await source.withdraw(f.publication, f.request);
    assert.equal(f.calls.length, 1); assert.equal(f.calls[0].operation, operation);
    assert.equal(f.calls[0].payload.operationKey, f.publication.code + (kind === 'ROLLBACK' ? ':rollback:5' : ':withdraw:5'));
    assert.equal(f.calls[0].payload.publication.revision, 9);
    assert.equal(f.calls[0].payload.publication.targetCommandOperation, f.publication.targetCommandOperation);
    assert.equal(f.state.sourceReads, 0);
});

for (const defect of ['missing', 'kind', 'source', 'activation', 'hash', 'revision']) test('Staged command proof rejects ' + defect + ' before transport', async t => {
    const f = setup(t); f.publication.targetVersion = f.result.version; f.command('WITHDRAWAL', f.result.version);
    if (defect === 'missing') delete f.publication.targetCommandOperation;
    else Object.assign(f.publication.targetCommandOperation, {
        kind: { operation: 'ROLLBACK' }, source: { sourceVersion: '3' }, activation: { activationKey: 'other' },
        hash: { targetVersionHash: '0'.repeat(64) }, revision: { originRevision: 6 }
    }[defect]);
    await assert.rejects(source.withdraw(f.publication, f.request));
    assert.equal(f.calls.length, 0); assert.equal(f.state.sourceReads, 0);
});
