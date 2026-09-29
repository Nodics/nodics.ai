/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/installedMigrationJournalContract
 * @description Independent in-memory atomic persistence tests for strict importRun migration evidence.
 * @layer test
 * @owner import
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const _ = require('lodash');
const journal = require('../src/service/history/defaultInstalledMigrationJournalService');
const history = require('../src/service/history/defaultImportRunHistoryService');

/** Provides one atomic store shared by independent executors, without application database writes. */
function fixture() {
    const rows = new Map();
    const writes = [];
    const port = {
        primaryKey: 'code',
        persistenceCapabilities: () => ({ durableJournal: true, primaryMajorityReadback: true, contractVersion: 1 }),
        async getItems(input) {
            assert.equal(input.internalPersistence, 'DURABLE_JOURNAL');
            const row = rows.get(input.query.code);
            return { count: row ? 1 : 0, result: row ? [_.cloneDeep(row)] : [] };
        },
        async compareAndSetItem(input) {
            writes.push(_.cloneDeep(input));
            if (input.operation === 'create') {
                if (rows.has(input.model.code)) throw new Error('duplicate insert');
                const row = { ..._.cloneDeep(input.model), _id: 'persisted-' + input.model.code };
                rows.set(row.code, row);
                return _.cloneDeep(row);
            }
            const row = rows.get(input.query.code);
            if (!row || Object.entries(input.query).some(([key, value]) => !_.isEqual(_.get(row, key), value))) return null;
            Object.assign(row, _.cloneDeep(input.model));
            return _.cloneDeep(row);
        }
    };
    const service = () => Object.assign({}, journal, { getMigrationModel: () => port });
    const request = {
        tenant: 'isolated', migrationId: 'catalogue-v1', executionId: 'execution-a',
        requestedBy: 'operator-a', correlationId: 'corr-a',
        plan: { scope: { tenant: 'isolated', database: 'selected-database', channel: 'STAGED' },
            schemas: [{ schema: 'product', sourceHash: 'hash-a' }, { schema: 'category', sourceHash: 'hash-b' }] }
    };
    const checkpoint = { code: 'product-backfill-0', state: 'PREPARED', evidence: { batchHash: 'batch-a' } };
    return { rows, writes, port, service, request, checkpoint };
}

test('insert-only begin returns exact persisted state, canonical plan and provenance', async () => {
    const f = fixture();
    const first = await f.service().beginMigration(f.request);
    assert.deepEqual(first, f.rows.get(first.code));
    assert.equal(first.migrationRevision, 0);
    assert.equal(first.migrationAttempt, 1);
    assert.equal(first.migration.plan.schemas.length, 2);
    assert.equal(first.migration.executionId, f.request.executionId);
    assert.equal(first.migration.entries[0].operation.requestedBy, 'operator-a');
    assert.equal(f.writes[0].operation, 'create');
    assert.equal(first.code, journal.identity({ ...f.request, plan: {
        schemas: f.request.plan.schemas, scope: { channel: 'STAGED', database: 'selected-database', tenant: 'isolated' }
    } }).code);
    first.migration.plan.schemas[0].sourceHash = 'caller-mutation';
    assert.equal((await f.service().readMigration(f.request)).migration.plan.schemas[0].sourceHash, 'hash-a');
    await assert.rejects(f.service().beginMigration(f.request), /already exists/);
    const replay = await f.service().beginMigration({ ...f.request, replay: true });
    assert.equal(replay.migrationRevision, 0);
    assert.equal(f.writes.length, 1);
});

test('independent begin race has exactly one inserted winner; no implicit replay', async () => {
    const f = fixture();
    const results = await Promise.allSettled([f.service().beginMigration(f.request), f.service().beginMigration(f.request)]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(results.filter(result => result.status === 'rejected').length, 1);
    assert.equal(f.rows.size, 1);
});

test('checkpoint is persisted before caller effects and fences independent concurrent writers', async () => {
    const f = fixture();
    await f.service().beginMigration(f.request);
    const request = { ...f.request, expectedRevision: 0, expectedAttempt: 1, checkpoint: f.checkpoint };
    let effects = 0;
    const perform = async service => {
        const result = await service.checkpointMigration(request);
        assert.equal(f.rows.get(result.code).migrationRevision, 1);
        effects++;
        return result;
    };
    const results = await Promise.allSettled([perform(f.service()), perform(f.service())]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(effects, 1);
    const query = f.writes[1].query;
    assert.equal(query.migrationRevision, 0);
    assert.equal(query.migrationAttempt, 1);
    assert.equal(query['migration.executionId'], 'execution-a');
    await assert.rejects(f.service().checkpointMigration(request), /Stale/);
    const replay = await f.service().checkpointMigration({ ...request, replay: true });
    assert.equal(replay.migrationRevision, 1);
    await assert.rejects(f.service().checkpointMigration({ ...request, replay: true,
        checkpoint: { ...f.checkpoint, evidence: { batchHash: 'different' } } }), /replay/);
});

test('explicit resume retains plan and execution, increments attempt and fences stopped worker', async () => {
    const f = fixture();
    await f.service().beginMigration(f.request);
    const request = { ...f.request, expectedRevision: 0, expectedAttempt: 1,
        requestedBy: 'recovery-operator', correlationId: 'recovery-corr',
        recovery: { previousWorkerStopped: true, evidence: { maintenanceReport: 'verified-report' } } };
    const resumed = await f.service().resumeMigration(request);
    assert.equal(resumed.migrationRevision, 1);
    assert.equal(resumed.migrationAttempt, 2);
    assert.equal(resumed.requestedBy, 'operator-a');
    assert.equal(resumed.migration.entries[1].operation.requestedBy, 'recovery-operator');
    assert.deepEqual(resumed.migration.plan, f.request.plan);
    await assert.rejects(f.service().resumeMigration(request), /Stale/);
    assert.deepEqual(await f.service().resumeMigration({ ...request, replay: true }), resumed);
    await assert.rejects(f.service().checkpointMigration({ ...f.request, expectedRevision: 1, expectedAttempt: 1,
        checkpoint: f.checkpoint }), /Stale/);
    const saved = await f.service().checkpointMigration({ ...f.request, expectedRevision: 1, expectedAttempt: 2,
        checkpoint: f.checkpoint });
    assert.equal(saved.migrationRevision, 2);
});

test('recovery race permits one fenced attempt; time alone never authorizes takeover', async () => {
    const f = fixture();
    await f.service().beginMigration(f.request);
    const base = { ...f.request, expectedRevision: 0, expectedAttempt: 1 };
    for (const recovery of [undefined, {}, { previousWorkerStopped: false, evidence: { expired: true } },
        { previousWorkerStopped: true, evidence: {} }]) {
        await assert.rejects(f.service().resumeMigration({ ...base, recovery }), /stopped-worker/);
    }
    const request = { ...base, recovery: { previousWorkerStopped: true, evidence: { verified: 'maintenance-proof' } } };
    const results = await Promise.allSettled([f.service().resumeMigration(request), f.service().resumeMigration(request)]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal((await f.service().readMigration(f.request)).migrationAttempt, 2);
});

test('worker-tracked begin persists initial/current identity and requires current worker on checkpoints', async () => {
    const f = fixture();
    const worker = { pid: 101, hostname: 'maintenance-host' };
    const request = { ...f.request, worker };
    const begun = await f.service().beginMigration(request);
    assert.deepEqual(begun.migration.initialWorker, worker);
    assert.deepEqual(begun.migration.worker, worker);
    assert.deepEqual(begun.migration.entries[0].operation.worker, worker);
    assert.deepEqual((await f.service().readMigration(f.request)).migration.worker, worker);
    const checkpoint = { ...f.request, expectedRevision: 0, expectedAttempt: 1, checkpoint: f.checkpoint };
    await assert.rejects(f.service().checkpointMigration(checkpoint), /current worker/);
    await assert.rejects(f.service().checkpointMigration({ ...checkpoint, worker: { ...worker, pid: 202 } }), /current worker/);
    await assert.rejects(f.service().beginMigration({ ...request, replay: true,
        worker: { ...worker, pid: 202 } }), /cannot change worker/);
    const saved = await f.service().checkpointMigration({ ...checkpoint, worker });
    assert.deepEqual(saved.migration.worker, worker);
    assert.equal(f.writes.at(-1).query['migration.worker.pid'], worker.pid);
    assert.equal(f.writes.at(-1).query['migration.worker.hostname'], worker.hostname);
    assert.equal(f.writes.length, 2);
});

test('worker resume matches prior pid/hostname, preserves initial identity, and records replacement', async () => {
    const f = fixture();
    const original = { pid: 101, hostname: 'maintenance-host' };
    const replacement = { pid: 202, hostname: 'recovery-host' };
    await f.service().beginMigration({ ...f.request, worker: original });
    const request = { ...f.request, worker: replacement, expectedRevision: 0, expectedAttempt: 1,
        recovery: { previousWorkerStopped: true, evidence: { ...original, proof: 'verified-maintenance-report' } } };
    for (const evidence of [{ pid: 101 }, { ...original, pid: 999 }, { ...original, pid: '101' },
        { ...original, hostname: 'wrong-host' }]) {
        await assert.rejects(f.service().resumeMigration({ ...request,
            recovery: { previousWorkerStopped: true, evidence } }), /previous worker/);
    }
    await assert.rejects(f.service().resumeMigration({ ...request, worker: undefined }), /tracking/);
    assert.equal(f.writes.length, 1);
    const resumed = await f.service().resumeMigration(request);
    assert.deepEqual(resumed.migration.initialWorker, original);
    assert.deepEqual(resumed.migration.worker, replacement);
    assert.deepEqual(resumed.migration.entries[1].operation.worker, replacement);
    assert.equal(resumed.migrationAttempt, 2);
    assert.equal(f.writes.at(-1).query['migration.worker.pid'], original.pid);
    assert.deepEqual(await f.service().resumeMigration({ ...request, replay: true }), resumed);
    await assert.rejects(f.service().checkpointMigration({ ...f.request, worker: original,
        expectedRevision: 1, expectedAttempt: 2, checkpoint: f.checkpoint }), /current worker/);
    const checkpoint = { ...f.request, worker: replacement, expectedRevision: 1, expectedAttempt: 2, checkpoint: f.checkpoint };
    await f.service().checkpointMigration(checkpoint);
    await assert.rejects(f.service().checkpointMigration({ ...checkpoint, replay: true, worker: original }), /replay/);
});

test('competing replacement workers have one atomic winner and cannot steal its attempt', async () => {
    const f = fixture();
    const original = { pid: 101, hostname: 'host' };
    await f.service().beginMigration({ ...f.request, worker: original });
    const request = { ...f.request, expectedRevision: 0, expectedAttempt: 1,
        recovery: { previousWorkerStopped: true, evidence: original } };
    const results = await Promise.allSettled([202, 303].map(pid => f.service().resumeMigration({
        ...request, worker: { pid, hostname: 'host' }
    })));
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    const saved = await f.service().readMigration(f.request);
    const winner = results.find(result => result.status === 'fulfilled').value;
    assert.deepEqual(saved.migration.worker, winner.migration.worker);
    assert.equal(saved.migrationAttempt, 2);
    await assert.rejects(f.service().resumeMigration({ ...request, expectedRevision: 1, expectedAttempt: 2,
        worker: { pid: 404, hostname: 'host' } }), /previous worker/);
});

test('malformed worker requests and corrupted persisted worker/proof chains fail closed', async () => {
    const f = fixture();
    for (const worker of [null, {}, { pid: 0, hostname: 'host' }, { pid: 1.1, hostname: 'host' },
        { pid: '101', hostname: 'host' }, { pid: 101, hostname: '' }, { pid: 101, hostname: ' host ' },
        { pid: 101, hostname: 'host', ignored: true }]) {
        await assert.rejects(f.service().beginMigration({ ...f.request, worker }), /worker/);
    }
    assert.equal(f.writes.length, 0);
    const original = { pid: 101, hostname: 'host' };
    const begun = await f.service().beginMigration({ ...f.request, worker: original });
    await f.service().resumeMigration({ ...f.request, worker: { pid: 202, hostname: 'host' },
        expectedRevision: 0, expectedAttempt: 1,
        recovery: { previousWorkerStopped: true, evidence: original } });
    const valid = _.cloneDeep(f.rows.get(begun.code));
    for (const mutate of [
        row => { row.migration.initialWorker.pid = 999; },
        row => { row.migration.worker.pid = 999; },
        row => { delete row.migration.worker; },
        row => {
            const entry = row.migration.entries[1];
            entry.operation.recovery.evidence.pid = 999;
            entry.digest = journal.checksum(entry.operation);
        }
    ]) {
        const row = _.cloneDeep(valid); mutate(row); f.rows.set(begun.code, row);
        await assert.rejects(f.service().readMigration(f.request));
    }
});

test('untracked fixtures remain supported but cannot silently acquire worker tracking on resume', async () => {
    const f = fixture();
    const begun = await f.service().beginMigration(f.request);
    assert.equal(begun.migration.worker, null);
    await assert.rejects(f.service().resumeMigration({ ...f.request, expectedRevision: 0, expectedAttempt: 1,
        worker: { pid: 101, hostname: 'host' },
        recovery: { previousWorkerStopped: true, evidence: { proof: 'report' } } }), /tracking/);
    const legacy = f.rows.get(begun.code);
    delete legacy.migration.worker;
    delete legacy.migration.initialWorker;
    delete legacy.migration.entries[0].operation.worker;
    legacy.migration.entries[0].digest = journal.checksum(legacy.migration.entries[0].operation);
    assert.equal((await f.service().readMigration(f.request)).migrationRevision, 0);
});

test('different plan, checksum, execution, tenant and malformed JSON fail without writes', async () => {
    const f = fixture();
    await f.service().beginMigration(f.request);
    for (const change of [
        { executionId: 'other' }, { plan: { ...f.request.plan, schemas: [] } }, { checksum: 'wrong' },
        { tenant: 'other' }, { requestedBy: '' }, { correlationId: null }, { replay: 'true' },
        { plan: { scope: f.request.plan.scope, invalid: undefined } },
        { plan: { scope: f.request.plan.scope, invalid: new Date() } },
        { plan: { scope: f.request.plan.scope, invalid: NaN } }
    ]) await assert.rejects(f.service().beginMigration({ ...f.request, replay: true, ...change }));
    assert.equal(f.writes.length, 1);
    await assert.rejects(f.service().readMigration({ ...f.request, migrationId: 'missing' }), /missing/);
    await assert.rejects(f.service().beginMigration({ ...f.request, migrationId: 'missing', replay: true }), /missing/);
    const cycle = { scope: f.request.plan.scope }; cycle.self = cycle;
    await assert.rejects(f.service().beginMigration({ ...f.request, plan: cycle }), /acyclic/);
});

test('missing providers, malformed read envelopes and provider failures cannot create evidence', async () => {
    const f = fixture();
    for (const port of [undefined, {}, { getItems() {} }, { ...f.port, versioned: true }, { ...f.port, primaryKey: 'other' }]) {
        await assert.rejects(Object.assign({}, journal, { getMigrationModel: () => port }).beginMigration(f.request), /atomic persistence/);
    }
    for (const result of [undefined, {}, [], { result: [] }, { count: '0', result: [] },
        { count: 1, result: [] }, { count: 2, result: [{}, {}] }, { count: 1, result: [{}] }]) {
        const service = Object.assign({}, journal, { getMigrationModel: () => ({ ...f.port, getItems: async () => result }) });
        await assert.rejects(service.beginMigration(f.request));
    }
    const failure = new Error('provider read denied');
    await assert.rejects(Object.assign({}, journal, { getMigrationModel: () => ({ ...f.port,
        getItems: async () => { throw failure; } }) }).beginMigration(f.request), error => error === failure);
    assert.equal(f.writes.length, 0);
});

test('unacknowledged, missing, malformed and failed write evidence rejects without optimistic success', async () => {
    for (const result of [undefined, null, {}, { acknowledged: true }, { success: true }]) {
        const f = fixture();
        f.port.compareAndSetItem = async () => result;
        await assert.rejects(f.service().beginMigration(f.request), /evidence/);
    }
    const f = fixture();
    const failure = new Error('provider write denied');
    f.port.compareAndSetItem = async () => { throw failure; };
    await assert.rejects(f.service().beginMigration(f.request), error => error === failure);
    const g = fixture();
    g.port.compareAndSetItem = async input => ({ ...input.model, _id: 'invented' });
    await assert.rejects(g.service().beginMigration(g.request), /missing/);
});

test('post-write read failure remains uncertain, recoverable only by explicit persisted replay', async () => {
    const f = fixture();
    const read = f.port.getItems;
    let count = 0;
    f.port.getItems = async input => {
        if (++count === 2) throw new Error('readback unavailable');
        return read(input);
    };
    await assert.rejects(f.service().beginMigration(f.request), /readback unavailable/);
    assert.equal(f.rows.size, 1);
    f.port.getItems = read;
    assert.equal((await f.service().beginMigration({ ...f.request, replay: true })).migrationRevision, 0);
    assert.equal(f.writes.length, 1);
});

test('wrong postimage, explicit non-acknowledgement and changed readback never report success', async () => {
    for (const change of [row => { row.acknowledged = false; }, row => { row.ok = 0; },
        row => { row.migration.entries[0].operation.requestedBy = 'wrong'; }]) {
        const f = fixture();
        const write = f.port.compareAndSetItem;
        f.port.compareAndSetItem = async input => { const saved = await write(input); change(saved); return saved; };
        await assert.rejects(f.service().beginMigration(f.request));
    }
    const f = fixture();
    await f.service().beginMigration(f.request);
    const write = f.port.compareAndSetItem;
    f.port.compareAndSetItem = async input => ({ ...await write(input), _id: 'different-record' });
    await assert.rejects(f.service().checkpointMigration({ ...f.request, expectedRevision: 0, expectedAttempt: 1,
        checkpoint: f.checkpoint }), /exact evidence/);
    const g = fixture();
    const get = g.port.getItems;
    let reads = 0;
    g.port.getItems = async input => {
        const result = await get(input);
        if (++reads === 2) result.result[0]._id = 'different-record';
        return result;
    };
    await assert.rejects(g.service().beginMigration(g.request), /durably readable/);
});

test('qualified MongoDB journal provider and actual validator are reused without a live database', async () => {
    const f = fixture();
    const provider = require('../../../../nDatabase/mongodb/src/schemas/model').default;
    const validator = require('../../../../nDatabase/database/src/service/model/defaultModelValidatorService');
    const baseSchemas = require('../../../../nDatabase/database/src/schemas/schemas').default;
    const runSchema = require('../src/schemas/schemas').import.importRun;
    const previousService = global.SERVICE;
    const previousClasses = global.CLASSES;
    let validations = 0;
    try {
        global.CLASSES = { NodicsError: class extends Error {} };
        const actualValidator = Object.assign({}, validator, { LOG: { debug() {} } });
        f.port.rawSchema = _.merge({}, baseSchemas.super, baseSchemas.base, runSchema);
        global.SERVICE = { DefaultModelValidatorService: {
            validateMandate: async (model, schema) => {
                assert.equal(schema, f.port.rawSchema);
                for (const [key, property] of Object.entries(schema.definition)) {
                    if (!property.required) continue;
                    assert.notEqual(model[key], undefined, 'inherited required field ' + key);
                }
                validations++;
                return actualValidator.validateMandate(model, schema);
            },
            validateDataType: async (model, schema) => {
                assert.ok(model.created instanceof Date);
                assert.ok(model.updated instanceof Date);
                for (const key of ['migrationRevision', 'migrationAttempt']) {
                    assert.equal(schema.definition[key].type, 'int');
                    assert.equal(schema.definition[key].required, false);
                    assert.equal(typeof model[key], 'number');
                    assert.ok(Number.isSafeInteger(model[key]));
                }
                validations++;
                return actualValidator.validateDataType(model, schema);
            }
        } };
        const atomic = f.port.compareAndSetItem;
        f.port.compareAndSetItem = provider.compareAndSetItem;
        f.port.internalPersistenceOptions = provider.internalPersistenceOptions;
        f.port.validateDurableAcknowledgement = provider.validateDurableAcknowledgement;
        f.port.transactionOptions = () => ({});
        f.port.normalizeModelForWrite = _.cloneDeep;
        f.port.insertOne = async (model, options) => {
            assert.deepEqual(options.writeConcern, { w: 'majority', j: true });
            const saved = await atomic({ operation: 'create', model });
            return { acknowledged: true, insertedId: saved._id };
        };
        f.port.findOneAndUpdate = async (query, update, options) => {
            assert.equal(options.upsert, false);
            assert.equal(options.returnDocument, 'after');
            assert.deepEqual(options.writeConcern, { w: 'majority', j: true });
            return { ok: 1, value: await atomic({ operation: 'update', query, model: update.$set }) };
        };
        const begun = await f.service().beginMigration(f.request);
        assert.equal(validations, 2);
        const saved = await f.service().checkpointMigration({ ...f.request, expectedRevision: begun.migrationRevision,
            expectedAttempt: begun.migrationAttempt, checkpoint: f.checkpoint });
        assert.equal(saved.migrationRevision, 1);
        assert.deepEqual(saved, f.rows.get(saved.code));
    } finally { global.SERVICE = previousService; global.CLASSES = previousClasses; }
});

test('linked completed compensation creates a new journal and preserves terminal original bytes', async () => {
    const f = fixture();
    const original = { ...f.request, worker: { pid: 101, hostname: 'host' } };
    await f.service().beginMigration(original);
    const completed = await f.service().checkpointMigration({ ...original, expectedRevision: 0, expectedAttempt: 1,
        status: 'COMPLETED', checkpoint: { code: 'verified', state: 'VERIFIED', evidence: { matched: true } } });
    const untouched = _.cloneDeep(f.rows.get(completed.code));
    const request = { ...f.request, migrationId: f.request.migrationId + '.compensation', executionId: 'compensation-one',
        worker: { pid: 202, hostname: 'host' },
        original: { migrationId: f.request.migrationId, executionId: f.request.executionId, checksum: completed.checksum },
        compensationEvidence: { outage: { verified: 'report' }, unchangedTargetState: { verified: 'target-hash' } } };
    const linked = await f.service().beginCompensation(request);
    assert.notEqual(linked.code, completed.code);
    assert.equal(linked.migration.compensation.originalCode, completed.code);
    assert.equal(linked.migration.compensation.status, 'COMPLETED');
    assert.deepEqual(linked.migration.compensation.scope, original.plan.scope);
    assert.equal(linked.migration.compensation.direction, 'rollback');
    assert.deepEqual(await f.service().beginCompensation({ ...request, replay: true }), linked);
    await assert.rejects(f.service().beginMigration(request), /beginCompensation/);
    await assert.rejects(f.service().checkpointMigration({ ...request, expectedRevision: 0, expectedAttempt: 1,
        status: 'COMPLETED', checkpoint: { code: 'undo', state: 'VERIFIED', evidence: { restored: true } } }), /ROLLED_BACK/);
    const restored = await f.service().checkpointMigration({ ...request, expectedRevision: 0, expectedAttempt: 1,
        status: 'ROLLED_BACK', checkpoint: { code: 'undo', state: 'VERIFIED', evidence: { restored: true } } });
    assert.equal(restored.status, 'ROLLED_BACK');
    assert.deepEqual(f.rows.get(completed.code), untouched);
    assert.equal(f.rows.size, 2);
});

test('compensation rejects mismatched identity, scope, checksum, missing proof and nonterminal originals', async () => {
    const f = fixture();
    const begun = await f.service().beginMigration(f.request);
    const request = { ...f.request, migrationId: f.request.migrationId + '.compensation', executionId: 'undo-one',
        worker: { pid: 202, hostname: 'host' },
        original: { migrationId: f.request.migrationId, executionId: f.request.executionId, checksum: begun.checksum },
        compensationEvidence: { outage: { verified: true }, unchangedTargetState: { verified: true } } };
    await assert.rejects(f.service().beginCompensation(request), /COMPLETED/);
    await f.service().checkpointMigration({ ...f.request, expectedRevision: 0, expectedAttempt: 1,
        status: 'COMPLETED', checkpoint: { code: 'done', state: 'VERIFIED', evidence: { verified: true } } });
    const writes = f.writes.length;
    for (const change of [
        { migrationId: 'unreserved-name' }, { executionId: f.request.executionId }, { worker: undefined },
        { original: { ...request.original, checksum: 'a'.repeat(64) } },
        { original: { ...request.original, executionId: 'wrong' } },
        { plan: { ...request.plan, scope: { ...request.plan.scope, database: 'other' } } },
        { compensationEvidence: {} }, { compensationEvidence: { outage: { verified: true }, unchangedTargetState: {} } }
    ]) await assert.rejects(f.service().beginCompensation({ ...request, ...change }));
    assert.equal(f.writes.length, writes);
    const races = await Promise.allSettled(['undo-one', 'undo-two'].map(executionId =>
        f.service().beginCompensation({ ...request, executionId })));
    assert.equal(races.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(f.rows.size, 2);
});

test('ordinary CAS alone is not accepted as durable migration evidence', async () => {
    const f = fixture();
    const ordinary = { ...f.port, compareAndSetItem: f.port.compareAndSetItem };
    delete ordinary.persistenceCapabilities;
    await assert.rejects(Object.assign({}, journal, { getMigrationModel: () => ordinary }).beginMigration(f.request), /atomic persistence/);
    assert.equal(f.writes.length, 0);
});

test('missing or incomplete durable capabilities reject before reads and writes', async () => {
    const f = fixture();
    for (const capability of [null, {}, { durableJournal: true, primaryMajorityReadback: false, contractVersion: 1 },
        { durableJournal: false, primaryMajorityReadback: true, contractVersion: 1 },
        { durableJournal: true, primaryMajorityReadback: true, contractVersion: 2 }]) {
        f.port.persistenceCapabilities = () => capability;
        await assert.rejects(f.service().beginMigration(f.request), /qualified durable/);
    }
    assert.equal(f.writes.length, 0);
});

test('real replica-set journal uses actual bound model, durable writes/readback and linked compensation', {
    skip: !process.env.NODICS_MONGODB_TEST_URI
}, async () => {
    const { MongoClient } = require('mongodb');
    const { randomUUID } = require('node:crypto');
    const client = new MongoClient(process.env.NODICS_MONGODB_TEST_URI, { serverSelectionTimeoutMS: 5000 });
    const db = client.db('nodics_import_journal_test_' + randomUUID().replaceAll('-', ''));
    const previousService = global.SERVICE;
    const previousClasses = global.CLASSES;
    const migrationProvider = require('../../../../nDatabase/mongodb/src/service/model/defaultMongodbInstalledVersionMigrationService');
    const connectionProvider = require('../../../../nDatabase/mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService');
    const validator = require('../../../../nDatabase/database/src/service/model/defaultModelValidatorService');
    const base = require('../../../../nDatabase/database/src/schemas/schemas').default;
    const schema = _.merge({}, base.super, base.base, require('../src/schemas/schemas').import.importRun);
    try {
        await client.connect();
        const capabilities = await connectionProvider.discoverCapabilities(db);
        assert.equal(capabilities.persistence.durableJournal, true);
        global.CLASSES = { NodicsError: class extends Error {}, DataImportError: class extends Error {
            constructor(code, message) { super(message || code); this.code = code; }
        } };
        global.SERVICE = { DefaultModelValidatorService: Object.assign({}, validator, { LOG: { debug() {} } }) };
        await db.createCollection('ImportRunModel');
        await db.collection('ImportRunModel').createIndex({ code: 1 }, { unique: true });
        const model = migrationProvider.bindMaintenanceModel({ connection: { client, connection: db, capabilities }, schema,
            scope: { tenant: 'isolated', channel: 'master', schemaName: 'importRun', database: db.databaseName, collection: 'ImportRunModel' },
            databaseOptions: {} });
        const service = Object.assign({}, journal, { getMigrationModel: () => model });
        const request = { ...fixture().request, worker: { pid: process.pid, hostname: require('node:os').hostname() } };
        const begun = await service.beginMigration(request);
        assert.ok(begun.created instanceof Date);
        assert.ok(begun.updated instanceof Date);
        const completed = await service.checkpointMigration({ ...request, expectedRevision: 0, expectedAttempt: 1,
            status: 'COMPLETED', checkpoint: { code: 'done', state: 'VERIFIED', evidence: { verified: true } } });
        const compensation = { ...request,
            migrationId: request.migrationId + '.compensation', executionId: 'real-compensation',
            original: { migrationId: request.migrationId, executionId: request.executionId, checksum: completed.checksum },
            compensationEvidence: { outage: { isolatedFixture: true }, unchangedTargetState: { isolatedFixture: true } } };
        const linked = await service.beginCompensation(compensation);
        assert.equal(linked.migration.compensation.originalCode, completed.code);
        const rolledBack = await service.checkpointMigration({ ...compensation, expectedRevision: 0, expectedAttempt: 1,
            status: 'ROLLED_BACK', checkpoint: { code: 'fixture-restored', state: 'VERIFIED', evidence: { isolatedFixture: true } } });
        assert.equal(rolledBack.status, 'ROLLED_BACK');
        assert.equal((await service.readMigration(compensation)).status, 'ROLLED_BACK');
        await assert.rejects(service.resumeMigration({ ...compensation, expectedRevision: 1, expectedAttempt: 1,
            recovery: { previousWorkerStopped: true, evidence: request.worker } }), /terminal/);
        assert.deepEqual(await service.readMigration(request), completed);
        assert.equal(await db.collection('ImportRunModel').countDocuments(), 2);
    } finally {
        try { await db.dropDatabase(); } finally {
            await client.close(); global.SERVICE = previousService; global.CLASSES = previousClasses;
        }
    }
});

test('oversized initial plan and accumulated checkpoint evidence reject before atomic writes', async () => {
    const f = fixture();
    const payload = 'x'.repeat(5 * 1024 * 1024);
    await assert.rejects(f.service().beginMigration({ ...f.request, plan: { ...f.request.plan,
        oversized: payload + payload } }), /journal budget/);
    assert.equal(f.writes.length, 0);
    const begun = await f.service().beginMigration(f.request);
    const request = { ...f.request, expectedRevision: 0, expectedAttempt: 1,
        checkpoint: { code: 'batch-a', state: 'PREPARED', evidence: { payload } } };
    await f.service().checkpointMigration(request);
    const writes = f.writes.length;
    await assert.rejects(f.service().checkpointMigration({ ...request, expectedRevision: 1,
        checkpoint: { code: 'batch-b', state: 'PREPARED', evidence: { payload } } }), /journal budget/);
    assert.equal(f.writes.length, writes);
    assert.equal(f.rows.get(begun.code).migrationRevision, 1);
});

test('batched plan intent supports many source records without per-record journal appends', async () => {
    const f = fixture();
    const request = { ...f.request, plan: { ...f.request.plan,
        batches: Array.from({ length: 18 }, (_, batch) => ({ code: 'batch-' + batch,
            records: Array.from({ length: batch === 17 ? 62 : 100 }, (_, row) => ({
                identity: 'record-' + (batch * 100 + row), sourceHash: 'a'.repeat(64)
            })) }))
    } };
    let state = await f.service().beginMigration(request);
    for (const batch of request.plan.batches) {
        state = await f.service().checkpointMigration({ ...request, expectedRevision: state.migrationRevision,
            expectedAttempt: state.migrationAttempt, checkpoint: { code: batch.code, state: 'PREPARED',
                evidence: { plannedBatchChecksum: journal.checksum(batch), count: batch.records.length } } });
    }
    assert.equal(state.migrationRevision, 18);
    assert.equal(f.writes.length, 19);
    assert.equal(state.migration.plan.batches.flatMap(batch => batch.records).length, 1762);
});

test('terminal evidence is verified and immutable; corrupted stored chain fails closed', async () => {
    const f = fixture();
    await f.service().beginMigration(f.request);
    const request = { ...f.request, expectedRevision: 0, expectedAttempt: 1, status: 'COMPLETED',
        checkpoint: { ...f.checkpoint, state: 'VERIFIED' } };
    await assert.rejects(f.service().checkpointMigration({ ...request, checkpoint: f.checkpoint }), /verified/);
    const completed = await f.service().checkpointMigration(request);
    assert.equal(completed.status, 'COMPLETED');
    await assert.rejects(f.service().checkpointMigration({ ...request, expectedRevision: 1 }), /terminal/);
    assert.deepEqual(await f.service().checkpointMigration({ ...request, replay: true }), completed);
    f.rows.get(completed.code).migration.entries[1].operation.checkpoint.evidence.batchHash = 'tampered';
    await assert.rejects(f.service().readMigration(f.request), /chain/);
});

test('resolver uses only generated tenant-scoped importRun registry and supports owner override', async () => {
    const f = fixture();
    const previousNodics = global.NODICS;
    const previousUtils = global.UTILS;
    try {
        global.UTILS = { createModelName: name => { assert.equal(name, 'importRun'); return 'ImportRunModel'; } };
        global.NODICS = { getModels: (module, tenant) => {
            assert.equal(module, 'import'); assert.equal(tenant, 'isolated'); return { ImportRunModel: f.port };
        } };
        await journal.beginMigration(f.request);
        delete global.NODICS;
        await assert.rejects(journal.readMigration(f.request), /resolver/);
        assert.equal((await f.service().readMigration(f.request)).migrationRevision, 0);
    } finally { global.NODICS = previousNodics; global.UTILS = previousUtils; }
});

test('normal best-effort history remains available, and cannot overwrite migration namespace or fields', async () => {
    const writes = [];
    const service = Object.assign({}, history, {
        getImportRunService: () => ({ save: async input => { writes.push(input); return { saved: true }; } }),
        getImportGovernanceConfig: () => ({ duplicateProtection: false }), getDefaultTenant: () => 'isolated',
        warn() {}, error() {}
    });
    for (const importRun of [
        { code: 'installedMigration_any', status: 'COMPLETED' }, { runId: 'installedMigration_any', code: 'normal' },
        { code: 'INSTALLEDMIGRATION_any' }, { code: 'normal', migration: {} },
        { code: 'normal', migrationRevision: 0 }, { code: 'normal', migrationAttempt: 1 },
        { code: 'normal', dataType: 'INSTALLED_MIGRATION' }
    ]) assert.deepEqual(await service.recordRun({ importRun }), { skipped: true, reason: 'RESERVED_MIGRATION_HISTORY' });
    assert.equal(writes.length, 0);
    assert.deepEqual(await service.recordRun({ importRun: { code: 'normal', status: 'COMPLETED' } }), { saved: true });
    assert.equal(writes.length, 1);
    service.getImportRunService = () => undefined;
    assert.equal((await service.recordRun({ importRun: { code: 'ordinary' } })).skipped, true);
    service.getImportRunService = () => ({ save: async () => { throw new Error('normal history unavailable'); } });
    assert.equal((await service.recordRun({ importRun: { code: 'ordinary' } })).skipped, true);
    assert.equal((await service.recordRun({})).reason, 'MISSING_IMPORT_RUN');
});
