/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module database/test/installedVersionMigrationLive @description Opt-in isolated MongoDB qualification of owner orchestration, durable importRun checkpoints and interrupted recovery. @layer test @owner database */
const assert = require('node:assert/strict');
const test = require('node:test');
const { randomUUID } = require('node:crypto');
const _ = require('lodash');
const orchestrator = require('../src/service/schema/defaultInstalledVersionMigrationService');
const provider = require('../../mongodb/src/service/model/defaultMongodbInstalledVersionMigrationService');
const journalMethods = require('../../../nData/nImport/import/src/service/history/defaultInstalledMigrationJournalService');

test('isolated MongoDB: journal interruption rolls back exact data; subsequent full migration preserves payloads', {
    skip: !process.env.NODICS_MONGODB_TEST_URI
}, async () => {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.NODICS_MONGODB_TEST_URI, { serverSelectionTimeoutMS: 5000 });
    const name = 'nodics_migration_integration_' + randomUUID().replaceAll('-', '');
    const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES, UTILS: global.UTILS };
    let created = false;
    try {
        global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
        global.UTILS = { isBlank: value => !value || Object.keys(value).length === 0 };
        global.SERVICE = {
            DefaultMongodbDatabaseModelHandlerService: require('../../mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService'),
            DefaultModelValidatorService: Object.assign({}, require('../src/service/model/defaultModelValidatorService'), { LOG: { debug() {} } })
        };
        SERVICE.DefaultMongodbDatabaseModelHandlerService.LOG = { debug() {}, error() {} };
        await client.connect();
        const db = client.db(name);
        const records = await db.createCollection('EntryModel'); created = true;
        await records.createIndex({ code: 1 }, { unique: true });
        await records.insertMany([{ code: 'a', title: 'First', revision: 7 }, { code: 'b', title: 'Second', revision: 11 }]);
        const history = await db.createCollection('ImportRunModel');
        await history.createIndex({ code: 1 }, { unique: true });
        const capabilities = await require('../../mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService').discoverCapabilities(db);
        const connection = { client, connection: db, capabilities };
        const sourceSchema = { model: true, definition: { code: { type: 'string', primary: true } } };
        const scope = { tenant: 'independent', channel: 'master', schemaName: 'entry', collection: 'EntryModel', database: name };
        const model = provider.bindMaintenanceModel({ connection, schema: sourceSchema, scope, databaseOptions: {} });
        const base = require('../src/schemas/schemas').default;
        const importSchema = require('../../../nData/nImport/import/src/schemas/schemas').import.importRun;
        const journalModel = provider.bindMaintenanceModel({ connection, schema: _.merge({}, base.super, base.base, importSchema),
            scope: { ...scope, schemaName: 'importRun', collection: 'ImportRunModel' }, databaseOptions: {} });
        const journal = Object.assign({}, journalMethods, { getMigrationModel: () => journalModel });
        const indexes = await provider.readIndexes(model);
        const input = { model, scope, expectedSchemaHash: provider.hash(sourceSchema), expectedIndexes: indexes,
            identityFields: ['code'], limits: { maxRecords: 10, pageSize: 1, maxBytes: 1048576 },
            transitions: [{ from: 'code_1', to: { name: 'code_1_versionId_1', key: { code: 1, versionId: 1 }, unique: true } }] };
        const context = { scope: { tenant: 'independent', database: name }, provider, journal,
            inputs: [input], assertOffline: async () => true };
        const plan = await orchestrator.plan(context);
        const request = { tenant: 'independent', migrationId: 'interrupted', executionId: 'attempt-a',
            requestedBy: 'isolated-test', correlationId: 'test-run', plan, checksum: journal.checksum(plan), direction: 'forward' };
        const checkpoint = journal.checkpointMigration;
        let count = 0;
        journal.checkpointMigration = async function (value) {
            if (++count === 2) throw new Error('simulated checkpoint outage');
            return checkpoint.call(this, value);
        };
        await assert.rejects(orchestrator.execute(context, request), /simulated checkpoint outage/);
        assert.equal(await records.countDocuments({ versionId: 0 }), 1);
        journal.checkpointMigration = checkpoint;
        const restored = await orchestrator.execute(context, { ...request, resume: true, direction: 'rollback',
            recovery: { previousWorkerStopped: true, evidence: { fixture: 'stopped isolated executor' } } });
        assert.equal(restored.status, 'ROLLED_BACK');
        assert.equal(await records.countDocuments({ versionId: { $exists: true } }), 0);
        assert.equal((await records.listIndexes().toArray()).find(index => index.name === 'code_1').unique, true);
        const completed = await orchestrator.execute(context, { ...request, migrationId: 'complete', executionId: 'attempt-b' });
        assert.equal(completed.status, 'COMPLETED');
        assert.equal(await records.countDocuments({ versionId: 0 }), 2);
        assert.deepEqual((await records.find({}).sort({ code: 1 }).toArray()).map(row => [row.code, row.title, row.revision]),
            [['a', 'First', 7], ['b', 'Second', 11]]);
        const saved = await history.findOne({ code: completed.migrationCode });
        assert.equal(saved.status, 'COMPLETED');
        assert.equal(saved.migration.entries.at(-1).operation.checkpoint.state, 'VERIFIED');
        const compensation = await orchestrator.execute(context, { ...request, migrationId: 'complete.compensation',
            executionId: 'attempt-c', direction: 'rollback', worker: { pid: process.pid, hostname: 'isolated-fixture' },
            original: { migrationId: 'complete', executionId: 'attempt-b', checksum: request.checksum } });
        assert.equal(compensation.status, 'ROLLED_BACK');
        assert.deepEqual(await history.findOne({ code: completed.migrationCode }), saved);
        assert.equal(await records.countDocuments({ versionId: { $exists: true } }), 0);
        assert.equal((await records.listIndexes().toArray()).find(index => index.name === 'code_1').unique, true);
    } finally {
        if (created) await client.db(name).dropDatabase();
        await client.close();
        for (const [key, value] of Object.entries(previous)) if (value === undefined) delete global[key]; else global[key] = value;
    }
});
