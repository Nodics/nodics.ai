/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module mongodb/test/durableJournalPersistenceContract
 * @description Qualifies internal journaled-majority CAS and primary-majority readback without changing ordinary CRUD options.
 * @layer test
 * @owner mongodb
 * @override Preserve acknowledgement failures, caller-option isolation and standalone coverage.
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const { randomUUID } = require('node:crypto');
const methods = require('../src/schemas/model').default;
const connector = require('../src/service/connection/defaultMongodbDatabaseConnectionHandlerService');
const migration = require('../src/service/model/defaultMongodbInstalledVersionMigrationService');
global.CLASSES = { NodicsError: class extends Error {
    constructor(code, message) { super(message || String(code)); this.code = code; }
} };
global.SERVICE = { DefaultModelValidatorService: { validateMandate: async () => {}, validateDataType: async () => {} } };
const mode = { internalPersistence: 'DURABLE_JOURNAL' };
const capabilities = { persistence: { durableJournal: true, primaryMajorityReadback: true, contractVersion: 1 } };

function fixture() {
    const calls = [];
    const model = { ...methods, rawSchema: {}, versioned: false,
        dataBase: { getCapabilities: () => capabilities },
        insertOne: async (record, options) => { calls.push({ kind: 'insert', options }); return { acknowledged: true, insertedId: 'one' }; },
        findOneAndUpdate: async (query, patch, options) => {
            calls.push({ kind: 'update', options }); return { ok: 1, value: { _id: 'one', ...patch.$set } };
        },
        find: (query, options) => { calls.push({ kind: 'find', options }); return { toArray: async () => [{ code: 'one', revision: 1 }] }; },
        countDocuments: async (query, options) => { calls.push({ kind: 'count', options }); return 1; }
    };
    return { model, calls };
}

test('writable standalone qualifies independently of transaction support; failed topology fails closed', async () => {
    const standalone = await connector.discoverCapabilities({ command: async () => ({ isWritablePrimary: true, maxWireVersion: 17 }) });
    assert.equal(standalone.transaction.multiRecordAtomic, false);
    assert.equal(standalone.persistence.durableJournal, true);
    for (const topology of [{}, { isWritablePrimary: false, maxWireVersion: 17 },
        { isWritablePrimary: true, maxWireVersion: 17, readOnly: true }, { isWritablePrimary: true, maxWireVersion: 3 }]) {
        assert.equal((await connector.discoverCapabilities({ command: async () => topology })).persistence.durableJournal, false);
    }
    const failed = await connector.discoverCapabilities({ command: async () => { throw new Error('denied'); } });
    assert.equal(failed.persistence.durableJournal, false);
});

test('internal CAS enforces journaled majority and returns acknowledged postimages', async () => {
    const { model, calls } = fixture();
    assert.deepEqual(model.persistenceCapabilities(), { durableJournal: true, primaryMajorityReadback: true, contractVersion: 1 });
    await model.compareAndSetItem({ ...mode, operation: 'create', model: { code: 'one' }, writeConcern: { w: 0, j: false } });
    const saved = await model.compareAndSetItem({ ...mode, operation: 'update', query: { code: 'one', revision: 0 },
        model: { revision: 1 }, options: { writeConcern: { w: 0 }, upsert: true } });
    assert.equal(saved.revision, 1);
    for (const call of calls) {
        assert.deepEqual(call.options.writeConcern, { w: 'majority', j: true });
        if (call.kind === 'update') assert.deepEqual(call.options.collation, { locale: 'simple' });
        else assert.equal(call.options.collation, undefined);
    }
    assert.equal(calls[1].options.upsert, false);
    assert.equal(calls[1].options.includeResultMetadata, true);
});

test('ordinary CAS does not accept caller write concern or implicit internal mode', async () => {
    const { model, calls } = fixture();
    await model.compareAndSetItem({ operation: 'create', model: { code: 'one', internalPersistence: 'DURABLE_JOURNAL' },
        writeConcern: { w: 0 }, options: { writeConcern: { w: 0 } } });
    assert.deepEqual(calls[0].options, {});
});

test('unknown modes, missing capabilities, versioned models and transaction mixing reject before writes', async () => {
    for (const change of [
        (model, input) => { input.internalPersistence = { writeConcern: { w: 0 } }; },
        model => { model.dataBase = {}; },
        model => { model.versioned = true; },
        (model, input) => { input.transactionContext = {}; },
        (model, input) => { input.operation = 'remove'; }
    ]) {
        const { model, calls } = fixture();
        const input = { ...mode, operation: 'create', model: { code: 'one' } };
        change(model, input);
        await assert.rejects(model.compareAndSetItem(input));
        assert.equal(calls.length, 0);
    }
});

test('ambiguous or failed write-concern acknowledgements never return success', async () => {
    for (const result of [{ acknowledged: false }, { ops: [{ code: 'legacy' }] },
        { acknowledged: true, writeConcernError: { code: 64 } }]) {
        const { model } = fixture(); model.insertOne = async () => result;
        await assert.rejects(model.compareAndSetItem({ ...mode, operation: 'create', model: { code: 'one' } }), /acknowledged/);
    }
    for (const result of [null, { value: { code: 'one' } }, { ok: 0 }, { ok: 1 },
        { ok: 1, value: {}, writeConcernErrors: [{ code: 64 }] }, { ok: 1, value: {}, writeErrors: [{ code: 1 }] }]) {
        const { model } = fixture(); model.findOneAndUpdate = async () => result;
        await assert.rejects(model.compareAndSetItem({ ...mode, operation: 'update', model: {}, query: {} }), /acknowledged/);
    }
    const { model } = fixture(); model.findOneAndUpdate = async () => { throw new Error('journal fsync failed'); };
    await assert.rejects(model.compareAndSetItem({ ...mode, operation: 'update', model: {}, query: {} }), /fsync/);
});

test('durable readback forces primary majority for both query and count, without caller driver controls', async () => {
    const { model, calls } = fixture();
    const input = { ...mode, query: { code: 'one' }, searchOptions: { limit: 2 }, readPreference: 'secondary' };
    const response = await model.getItems(input);
    assert.equal(response.count, 1);
    for (const call of calls) {
        assert.equal(call.options.readPreference, 'primary');
        assert.deepEqual(call.options.readConcern, { level: 'majority' });
    }
    await assert.rejects(model.getItems({ ...input, searchOptions: { limit: 2, readPreference: 'secondary' } }));
    await assert.rejects(model.getItems({ ...input, searchOptions: {} }));
    model.countDocuments = async () => 0;
    await assert.rejects(model.getItems(input), /Inconsistent/);
});

test('optional isolated MongoDB acknowledges journaled-majority writes and reads exact primary-majority state', {
    skip: !process.env.NODICS_MONGODB_TEST_URI
}, async () => {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.NODICS_MONGODB_TEST_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const db = client.db('nodics_journal_test_' + randomUUID().replaceAll('-', ''));
    try {
        const discovered = await connector.discoverCapabilities(db);
        const model = migration.bindMaintenanceModel({ connection: { connection: db, client, capabilities: discovered },
            schema: { definition: { code: { type: 'string', primary: true } } },
            scope: { database: db.databaseName, collection: 'JournalFixture', tenant: 'fixture', channel: 'master', schemaName: 'journalFixture' },
            databaseOptions: {} });
        assert.equal(model.persistenceCapabilities().durableJournal, true);
        const initial = await model.compareAndSetItem({ ...mode, operation: 'create', model: { code: 'one', revision: 0 } });
        const saved = await model.compareAndSetItem({ ...mode, operation: 'update', query: { _id: initial._id, revision: 0 }, model: { revision: 1 } });
        assert.equal(saved.revision, 1);
        const readback = await model.getItems({ ...mode, query: { code: 'one' }, searchOptions: { limit: 2 } });
        assert.equal(readback.count, 1);
        assert.equal(readback.result[0].revision, 1);
        assert(initial._id.equals(readback.result[0]._id));
    } finally {
        await db.dropDatabase();
        await client.close();
    }
});
