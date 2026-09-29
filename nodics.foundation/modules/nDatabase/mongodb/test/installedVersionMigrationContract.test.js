/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/**
 * @module mongodb/test/installedVersionMigrationContract
 * @description Independent fixture and optional isolated MongoDB migration recovery tests.
 * @layer test
 * @owner mongodb
 * @override Preserve checkpoint-before-effect, bounded BSON evidence and recovery assertions.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const BSON = require('bson');
const { randomUUID } = require('node:crypto');
const migration = require('../src/service/model/defaultMongodbInstalledVersionMigrationService');
const indexesOwner = require('../src/service/model/defaultMongodbDatabaseModelHandlerService');
const properties = require('../config/properties');
const _ = require('lodash');
global.CLASSES = { NodicsError: class extends Error {
    constructor(code, message) { super(message || code); this.code = code; }
} };

const clone = value => BSON.deserialize(BSON.serialize({ value }), { promoteValues: false }).value;
const scope = { tenant: 'fixture', channel: 'master', schemaName: 'example', database: 'isolated', collection: 'Example' };
const originalIndexes = () => [
    { v: 2, key: { _id: 1 }, name: '_id_' },
    { v: 2, key: { code: 1, locale: 1 }, name: 'logical_unique', unique: true },
    { v: 2, key: { description: 1 }, name: 'unrelated' }
];
const rows = () => [
    { _id: new BSON.ObjectId(), code: 'a', locale: 'en', revision: new BSON.Long(15),
        createdAt: new Date('2026-01-01'), payload: new BSON.Binary(Buffer.from([1, 2, 3])),
        decimal: BSON.Decimal128.fromString('1.25') },
    { _id: new BSON.ObjectId(), code: 'a', locale: 'fr', revision: new BSON.Int32(7), description: 'unchanged' }
];

test('inert provider selector and maintenance binding require no discovery or index effects', () => {
    assert.equal(properties.database.default.mongodb.options.installedVersionMigrationService,
        'DefaultMongodbInstalledVersionMigrationService');
    const f = fixture();
    const calls = [];
    const db = { databaseName: scope.database, collection: name => { calls.push(name); return f.input.model; } };
    const connection = { connection: db, client: {}, collections: [{ name: scope.collection }], capabilities: { transactions: false } };
    const schema = { definition: { code: { type: 'string', primary: true } } };
    const databaseOptions = { connectionHandler: 'SelectedConnectionHandler', modelSaveOptions: { upsert: false } };
    const model = migration.bindMaintenanceModel({ connection, schema, scope, databaseOptions });
    assert.deepEqual(calls, [scope.collection]);
    assert.deepEqual(f.events, []);
    assert.equal(model.dataBase.getConnection(), db);
    assert.equal(model.dataBase.getClient(), connection.client);
    assert.deepEqual(model.dataBase.getCollectionList(), [scope.collection]);
    assert.deepEqual(model.dataBase.getCapabilities(), connection.capabilities);
    assert.equal(model.primaryKey, 'code');
    assert.equal(model.rawSchema, schema);
    assert.equal(typeof model.compareAndSetItem, 'function');
    assert.equal(typeof model.cursorToArray, 'function');
    assert.equal(typeof model.getItems, 'function');
    databaseOptions.modelSaveOptions.upsert = true;
    assert.equal(model.dataBase.getOptions().modelSaveOptions.upsert, false);
    assert.throws(() => migration.bindMaintenanceModel({ connection, schema, scope: { ...scope, database: 'wrong' }, databaseOptions }), /scope/);
    assert.deepEqual(calls, [scope.collection]);
});

test('desired transitions reuse schema builder and preserve supplied target without index effects', async () => {
    global.UTILS = { isBlank: value => _.isEmpty(value) };
    const f = fixture();
    const targetSchema = {
        versioned: true,
        definition: { code: { type: 'string', primary: true }, locale: { type: 'string' }, versionId: { type: 'integer' } },
        indexes: { common: {
            version: { enabled: true, name: 'versionId' }, locale: { enabled: true, name: 'locale' }
        } }
    };
    const before = migration.hash(targetSchema);
    const service = { ...migration, indexService: () => indexesOwner };
    const result = await service.desiredTransitions({ model: f.input.model, targetSchema, tenant: scope.tenant,
        databaseOptions: properties.database.default.mongodb.options });
    assert.equal(result.targetSchemaHash, before);
    assert.equal(migration.hash(targetSchema), before);
    assert.deepEqual(result.transitions, [{ from: 'logical_unique', to: {
        key: { code: 1, versionId: 1, locale: 1 }, unique: true, name: 'code_1_versionId_1_locale_1'
    } }]);
    assert.deepEqual(f.events, []);
    delete targetSchema.indexes.common.version;
    await assert.rejects(service.desiredTransitions({ model: f.input.model, targetSchema, tenant: scope.tenant,
        databaseOptions: properties.database.default.mongodb.options }), /version-qualified/);
});

function fixture() {
    let documents = rows();
    let indexes = originalIndexes();
    const events = [];
    const model = {
        ...scope, modelName: scope.collection, collectionName: scope.collection,
        namespace: scope.database + '.' + scope.collection, rawSchema: { versioned: false, definition: { code: { type: 'string' } } },
        dataBase: { getConnection: () => ({ databaseName: scope.database }) },
        countDocuments: async (query, options) => {
            assert.equal(options.readPreference, 'primary');
            assert.equal(options.promoteValues, true);
            return documents.length;
        },
        listIndexes: () => ({ toArray: async () => indexes.map(index => ({ ...index })) }),
        find: (query, options) => {
            assert.equal(options.promoteValues, false);
            assert.deepEqual(options.collation, { locale: 'simple' });
            let offset = 0; let limit;
            const cursor = { sort: () => cursor, skip: value => { offset = value; return cursor; },
                limit: value => { limit = value; return cursor; }, toArray: async () => documents.slice(offset, offset + limit).map(clone) };
            return cursor;
        },
        findOne: async query => clone(documents.find(row => migration.hash(row._id) === migration.hash(query._id))),
        updateOne: async (query, update, options) => {
            events.push('write');
            assert.equal(options.upsert, false);
            assert.deepEqual(options.collation, { locale: 'simple' });
            const row = documents.find(row => migration.hash(row._id) === migration.hash(query._id));
            const matches = row && migration.hash(row) === migration.hash(query.$expr.$eq[1].$literal);
            if (!matches) return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
            if (update.$set) row.versionId = 0;
            else delete row.versionId;
            return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
        }
    };
    const service = { ...migration, indexService: () => ({
        createIndex: async (selected, spec) => {
            events.push('create:' + spec.options.name);
            assert(!indexes.some(index => index.name === spec.options.name));
            indexes.push({ v: 2, key: spec.fields, ...spec.options });
        },
        dropIndex: async (selected, name) => { events.push('drop:' + name); indexes = indexes.filter(index => index.name !== name); }
    }) };
    const input = {
        model, scope: { ...scope }, expectedSchemaHash: service.hash(model.rawSchema),
        expectedIndexes: originalIndexes(), identityFields: ['code', 'locale'],
        transitions: [{ from: 'logical_unique', to: { name: 'versioned_unique', key: { code: 1, locale: 1, versionId: 1 }, unique: true } }],
        limits: { maxRecords: 10, pageSize: 1, maxBytes: 10000 }, assertOffline: async () => true,
        checkpoint: async request => { events.push('checkpoint:' + request.operation.kind); return { ...request, durable: true }; }
    };
    return { service, input, events, documents: () => documents, indexes: () => indexes,
        setDocuments: value => { documents = value; } };
}

test('BSON-safe bounded plan, checkpointed backfill, localized uniqueness, full rollback', async () => {
    const f = fixture();
    const original = f.documents().map(row => migration.hash(row));
    f.input.plan = JSON.parse(JSON.stringify(await f.service.plan(f.input)));
    assert.equal(f.events.length, 0);
    assert.equal(f.input.plan.records.length, 2);
    await f.service.backfill(f.input);
    await f.service.transitionIndexes(f.input);
    assert.equal((await f.service.verify(f.input)).verified, true);
    assert.deepEqual(f.events, ['checkpoint:backfill-record', 'write', 'checkpoint:backfill-record', 'write',
        'checkpoint:create-index', 'create:versioned_unique', 'checkpoint:drop-index', 'drop:logical_unique']);
    await f.service.rollback(f.input);
    assert.deepEqual(f.documents().map(row => migration.hash(row)), original);
    assert(f.service.sameIndexes(f.indexes(), originalIndexes()));
});

test('bounds, scope, schema/index proof, mixed histories and duplicate identities fail before writes', async () => {
    for (const mutate of [
        f => { f.input.limits.maxRecords = 1; },
        f => { f.input.limits.maxBytes = 1; },
        f => { f.input.limits.pageSize = 0; },
        f => { f.input.scope.database = 'wrong'; },
        f => { f.input.expectedSchemaHash = 'wrong'; },
        f => { f.input.expectedIndexes = []; },
        f => { f.documents()[0].versionId = 0; },
        f => { f.documents()[1].locale = 'en'; },
        f => { f.input.transitions[0].to.name = 'logical_unique'; },
        f => { f.input.transitions = []; },
        f => { f.input.assertOffline = async () => false; }
    ]) {
        const f = fixture(); mutate(f);
        await assert.rejects(f.service.plan(f.input));
        assert.deepEqual(f.events, []);
    }
});

test('journal rejection prevents every effect and same-plan partial backfill can resume', async () => {
    const f = fixture(); f.input.plan = await f.service.plan(f.input);
    const checkpoint = f.input.checkpoint;
    let checkpoints = 0;
    f.input.checkpoint = async request => {
        if (++checkpoints === 2) throw new Error('journal unavailable');
        return checkpoint(request);
    };
    await assert.rejects(f.service.backfill(f.input), /journal unavailable/);
    assert.equal(f.documents()[0].versionId, 0);
    assert.equal(f.documents()[1].versionId, undefined);
    f.input.checkpoint = checkpoint;
    await f.service.recover({ ...f.input, direction: 'forward' });
    assert.equal(f.events.filter(event => event === 'write').length, 2);
    await f.service.recover({ ...f.input, direction: 'rollback' });
    assert(f.documents().every(row => !Object.hasOwn(row, 'versionId')));
});

test('tamper, missing/extra records, successors and unrelated index drift refuse recovery', async () => {
    for (const mutate of [
        f => { f.input.plan.records[0].beforeHash = 'tampered'; },
        f => { f.documents().pop(); },
        f => { f.documents().push({ _id: new BSON.ObjectId(), code: 'extra', locale: 'en' }); },
        f => { f.documents()[0].versionId = 1; },
        f => { f.documents()[0].revision = 99; },
        f => { f.indexes().push({ v: 2, name: 'unknown', key: { extra: 1 } }); }
    ]) {
        const f = fixture(); f.input.plan = await f.service.plan(f.input); mutate(f);
        await assert.rejects(f.service.recover({ ...f.input, direction: 'forward' }));
        await assert.rejects(f.service.rollback(f.input));
        assert.deepEqual(f.events, []);
    }
});

test('missing or mismatched durable acknowledgement never writes', async () => {
    for (const checkpoint of [undefined, async () => true, async request => ({ ...request, durable: false }),
        async request => ({ ...request, durable: true, checksum: 'wrong' })]) {
        const f = fixture(); f.input.plan = await f.service.plan(f.input); f.input.checkpoint = checkpoint;
        await assert.rejects(f.service.backfill(f.input));
        assert.deepEqual(f.events, []);
    }
});

test('lost acknowledgement after index create/drop resumes without duplicate effects', async () => {
    for (const operation of ['createIndex', 'dropIndex']) {
        const f = fixture(); f.input.plan = await f.service.plan(f.input);
        await f.service.backfill(f.input);
        const owner = f.service.indexService();
        let once = true;
        f.service.indexService = () => ({ ...owner, [operation]: async (...args) => {
            await owner[operation](...args);
            if (once) { once = false; throw new Error('lost response'); }
        } });
        await assert.rejects(f.service.transitionIndexes(f.input), /lost response/);
        assert.equal((await f.service.recover({ ...f.input, direction: 'forward' })).verified, true);
        assert.equal(f.events.filter(event => event === 'create:versioned_unique').length, 1);
        assert.equal(f.events.filter(event => event === 'drop:logical_unique').length, 1);
        await f.service.rollback(f.input);
    }
});

test('rollback resumes after interrupted conditional restoration and rejects stale CAS', async () => {
    const f = fixture(); f.input.plan = await f.service.plan(f.input);
    await f.service.recover({ ...f.input, direction: 'forward' });
    const checkpoint = f.input.checkpoint;
    let restored = 0;
    f.input.checkpoint = async request => {
        if (request.operation.kind === 'restore-record' && ++restored === 2) throw new Error('interrupted restore');
        return checkpoint(request);
    };
    await assert.rejects(f.service.rollback(f.input), /interrupted restore/);
    f.input.checkpoint = checkpoint;
    assert.equal((await f.service.rollback(f.input)).restored, true);
    const g = fixture(); g.input.plan = await g.service.plan(g.input);
    g.input.model.updateOne = async () => ({ acknowledged: true, matchedCount: 0, modifiedCount: 0 });
    await assert.rejects(g.service.backfill(g.input), /exactly once/);
});

test('BSON index predicates survive JSON journal round trip and hash distinguishes BSON types', async () => {
    const f = fixture();
    const filter = { revision: { $gte: BSON.Long.fromNumber(4) }, createdAt: { $gte: new Date('2025-01-01') } };
    f.indexes()[1].partialFilterExpression = filter;
    f.input.expectedIndexes = f.indexes();
    f.input.transitions[0].to.partialFilterExpression = filter;
    f.input.plan = JSON.parse(JSON.stringify(await f.service.plan(f.input)));
    assert.equal(f.service.hash(f.service.transitions(f.input.plan)[0].to.partialFilterExpression), f.service.hash(filter));
    assert.notEqual(f.service.hash(BSON.Long.fromNumber(4)), f.service.hash(4));
    assert.throws(() => f.service.recordHash({ payload: { deprecated: undefined } }), /lossy BSON/);
    await f.service.recover({ ...f.input, direction: 'forward' });
    await f.service.rollback(f.input);
});

test('optional isolated MongoDB executes and restores exact BSON records and localized indexes', {
    skip: !process.env.NODICS_MONGODB_TEST_URI
}, async () => {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.NODICS_MONGODB_TEST_URI);
    const databaseName = 'nodics_migration_test_' + randomUUID().replaceAll('-', '');
    await client.connect();
    const db = client.db(databaseName);
    try {
        const collection = db.collection('Fixture');
        await collection.insertMany(rows());
        await collection.createIndex({ code: 1, locale: 1 }, { unique: true, name: 'logical_unique' });
        await collection.createIndex({ description: 1 }, { name: 'unrelated' });
        const service = { ...migration, indexService: () => indexesOwner };
        const selectedScope = { ...scope, database: databaseName, collection: 'Fixture' };
        const model = service.bindMaintenanceModel({ connection: { connection: db, client },
            schema: { versioned: false }, scope: selectedScope, databaseOptions: properties.database.default.mongodb.options });
        const input = { ...fixture().input, model, scope: selectedScope,
            expectedSchemaHash: service.hash(model.rawSchema), expectedIndexes: await model.indexes() };
        input.plan = JSON.parse(JSON.stringify(await service.plan(input)));
        await service.backfill(input);
        await service.transitionIndexes(input);
        assert.equal((await service.verify(input)).verified, true);
        await service.rollback(input);
        assert.equal(await collection.countDocuments({ versionId: { $exists: true } }), 0);
        assert.equal(await collection.countDocuments({}), 2);
    } finally {
        await db.dropDatabase();
        await client.close();
    }
});
