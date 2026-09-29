/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module database/test/installedVersionMigrationOrchestration @description Checks immutable scope, pre-effect batch evidence and fail-closed multi-schema recovery. @owner database @layer test */
const assert = require('node:assert/strict');
const test = require('node:test');
const service = require('../src/service/schema/defaultInstalledVersionMigrationService');
const journalMethods = require('../../../nData/nImport/import/src/service/history/defaultInstalledMigrationJournalService');
global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };

/** Supplies independent provider effects and acknowledged journal ports, not application data. */
function fixture() {
    const calls = [];
    const scope = { tenant: 'independent', owner: 'catalogue' };
    const schemas = ['entry', 'translation'].map(schemaName => ({
        scope: { tenant: scope.tenant, schemaName }, checksum: schemaName, limits: { pageSize: 5 },
        records: Array.from({ length: 10 }, (_, i) => ({ id: String(i), beforeHash: 'before-' + i, afterHash: 'after-' + i }))
    }));
    let current = { code: 'journal', status: 'RUNNING', migrationRevision: 0, migrationAttempt: 1 };
    const journal = { canonical: value => journalMethods.canonical(value), checksum: value => journalMethods.checksum(value),
        beginMigration: async () => { calls.push('begin'); return current; },
        beginCompensation: async request => { calls.push({ compensation: request }); return current; },
        readMigration: async () => current,
        resumeMigration: async () => { calls.push('resume'); return current = { ...current, migrationAttempt: 2 }; },
        checkpointMigration: async request => {
            assert.equal(request.expectedRevision, current.migrationRevision);
            calls.push(request.checkpoint);
            return current = { ...current, status: request.status || 'RUNNING', migrationRevision: current.migrationRevision + 1 };
        }
    };
    const provider = {
        hash: value => journal.checksum(value),
        plan: async input => schemas.find(plan => plan.scope.schemaName === input.scope.schemaName),
        validatePlan: input => assert.deepEqual(input.scope, input.plan.scope),
        recover: async input => {
            for (const record of input.plan.records) {
                const rollback = input.direction === 'rollback';
                const operation = { kind: rollback ? 'restore-record' : 'backfill-record', id: record.id,
                    beforeHash: rollback ? record.afterHash : record.beforeHash,
                    afterHash: rollback ? record.beforeHash : record.afterHash };
                const intent = { checksum: input.plan.checksum, scope: input.scope, operation,
                    operationId: provider.hash({ checksum: input.plan.checksum, operation }) };
                const ack = await input.checkpoint(intent);
                assert.equal(ack.operationId, intent.operationId);
                assert.equal(ack.durable, true);
                assert(calls.some(call => call.evidence?.operations?.includes(intent.operationId)), 'batch intent must be durable before effect');
                calls.push('effect');
            }
            return { verified: true };
        },
        verify: async input => ({ verified: true, checksum: input.plan.checksum }),
        rollback: async () => ({ restored: true })
    };
    const context = { scope, inputs: schemas.map(plan => ({ scope: plan.scope })), provider, journal, assertOffline: async () => true };
    const plan = { contractVersion: 1, scope, schemas };
    const request = { plan, checksum: journal.checksum(plan), direction: 'forward' };
    return { calls, context, request };
}

test('multi-schema capture is read-only and batch intents precede every effect', async () => {
    const { calls, context, request } = fixture();
    assert.deepEqual(await service.plan(context), request.plan);
    assert.deepEqual(calls, []);
    const result = await service.execute(context, request);
    assert.equal(result.status, 'COMPLETED');
    assert.equal(result.writersMayRestart, false);
    assert.equal(calls.filter(value => value === 'effect').length, 20);
    assert.equal(calls.filter(value => value.state === 'PREPARED').length, 4);
    assert.equal(result.evidence.length, 2);
});

test('journal failure prevents the corresponding effects and never reports completion', async () => {
    const { calls, context, request } = fixture();
    context.journal.checkpointMigration = async () => { throw new Error('journal unavailable'); };
    await assert.rejects(service.execute(context, request), /journal unavailable/);
    assert.deepEqual(calls, ['begin']);
});

test('scope, reviewed checksum, direction and outage fail before journal mutation', async () => {
    for (const update of [{ checksum: 'wrong' }, { direction: 'guess' }, { plan: { scope: {}, schemas: [] } }]) {
        const { calls, context, request } = fixture();
        await assert.rejects(service.execute(context, { ...request, ...update }));
        assert.deepEqual(calls, []);
    }
    const { calls, context, request } = fixture();
    context.assertOffline = async () => false;
    await assert.rejects(service.execute(context, request), /outage/i);
    assert.deepEqual(calls, []);
});

test('explicit recovery must prove stopped worker and reuses the immutable plan', async () => {
    const { calls, context, request } = fixture();
    await assert.rejects(service.execute(context, { ...request, resume: true }), /Stopped previous worker/);
    assert.deepEqual(calls, []);
    const result = await service.execute(context, { ...request, resume: true,
        recovery: { previousWorkerStopped: true, evidence: { pid: 98765 } } });
    assert.equal(calls[0], 'resume');
    assert.equal(result.status, 'COMPLETED');
});

test('completed compensation verifies all target scopes before creating a separate rollback journal', async () => {
    const { calls, context, request } = fixture();
    const verified = [];
    context.provider.verify = async input => { verified.push(input.scope.schemaName); return { verified: true }; };
    const result = await service.execute(context, { ...request, direction: 'rollback', original: { migrationId: 'original' } });
    assert.deepEqual(verified, ['entry', 'translation']);
    assert.equal(result.status, 'ROLLED_BACK');
    assert.equal(calls[0].compensation.compensationEvidence.unchangedTargetState.schemas.length, 2);
    assert.equal(calls.includes('begin'), false);
    assert.equal(calls.includes('resume'), false);
});

test('changed installed target prevents compensation journal and effects', async () => {
    const { calls, context, request } = fixture();
    context.provider.verify = async () => { throw new Error('successor detected'); };
    await assert.rejects(service.execute(context, { ...request, direction: 'rollback', original: { migrationId: 'original' } }), /successor/);
    assert.deepEqual(calls, []);
});
