/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module vMongodb/test/currentVersionReadContract
 * @description Verifies latest-before-filter reads, bounded pagination, scoped provider context and optional isolated MongoDB execution.
 * @layer test
 * @owner vMongodb
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const { randomUUID } = require('node:crypto');
global.CLASSES = {
    NodicsError: class extends Error {
        constructor(code, message) {
            super(message || String(code));
            this.code = code;
        }
    },
};
global.UTILS = {
    isBlank: (value) => !value || Object.keys(value).length === 0,
};
global.SERVICE = {};
const base = require('../../src/schemas/model').default;
const versioned = require('../src/schemas/model').default;
const readPolicy = require('../../../database/src/service/schema/defaultSchemaReadAccessPolicyService');

function fixture() {
    const calls = [];
    const model = Object.assign({}, base, versioned, {
        primaryKey: 'code',
        transactionOptions: (input) =>
            input.transactionContext
                ? { session: 'opaque-provider-session' }
                : {},
        aggregate(pipeline, options) {
            calls.push({ pipeline, options });
            return {
                toArray: async () => [
                    { metadata: [{ count: 3 }], result: [{ code: 'b' }] },
                ],
            };
        },
    });
    const input = {
        query: { status: 'ACTIVE', enterpriseCode: 'authorized' },
        searchOptions: {
            limit: 1,
            skip: 1,
            sort: { name: 1 },
            projection: { code: 1, _id: 0 },
            maxTimeMS: 1000,
        },
    };
    return { model, input, calls };
}

test('current selection precedes all business filters, paging and projection', async () => {
    const { model, input, calls } = fixture();
    const original = structuredClone(input);
    const result = await model.getCurrentVersionItems(input);
    assert.deepEqual(calls[0].pipeline, [
        { $sort: { code: 1, versionId: -1 } },
        { $group: { _id: '$code', record: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$record' } },
        { $match: input.query },
        {
            $facet: {
                metadata: [{ $count: 'count' }],
                result: [
                    { $sort: { name: 1, code: 1 } },
                    { $skip: 1 },
                    { $limit: 1 },
                    { $project: { code: 1, _id: 0 } },
                ],
            },
        },
    ]);
    assert.deepEqual(calls[0].options, {
        maxTimeMS: 1000,
        collation: { locale: 'simple' },
    });
    assert.deepEqual(input, original);
    assert.equal(result.count, 3);
    assert.deepEqual(result.result, [{ code: 'b' }]);
    assert.strictEqual(result.query, input.query);
});

test('trusted session and alternate logical identities retain provider-owned dispatch', async () => {
    const { model, input, calls } = fixture();
    model.primaryKey = 'identifier';
    input.transactionContext = {};
    input.searchOptions.session = 'untrusted-session';
    await model.getCurrentVersionItems(input);
    assert.equal(calls[0].options.session, 'opaque-provider-session');
    assert.equal(calls[0].pipeline[1].$group._id, '$identifier');
});

test('invalid paging and unsupported projection shapes reject before a provider read', async () => {
    for (const patch of [
        { limit: undefined },
        { limit: 0 },
        { limit: -1 },
        { limit: 1.5 },
        { skip: -1 },
        { sort: { name: 'asc' } },
        { projection: { variants: { $slice: 1 } } },
        { collation: { locale: 'en', strength: 2 } },
    ]) {
        const { model, input, calls } = fixture();
        Object.assign(input.searchOptions, patch);
        await assert.rejects(model.getCurrentVersionItems(input), {
            code: 'ERR_MDL_00000',
        });
        assert.equal(calls.length, 0);
    }
});

test('failed or malformed aggregation never becomes an empty catalogue', async () => {
    for (const output of [
        null,
        [],
        [{}],
        [{ metadata: [null], result: [] }],
        [{ metadata: [{ count: -1 }], result: [] }],
        [{ metadata: [], result: [{}] }],
        [{ metadata: [{ count: 3 }], result: [] }],
    ]) {
        const { model, input } = fixture();
        model.aggregate = () => ({ toArray: async () => output });
        await assert.rejects(model.getCurrentVersionItems(input), {
            code: 'ERR_MDL_00000',
        });
    }
    const { model, input } = fixture();
    const failure = new Error('aggregation failed');
    model.aggregate = () => ({
        toArray: async () => {
            throw failure;
        },
    });
    await assert.rejects(
        model.getCurrentVersionItems(input),
        (error) => error === failure,
    );
    model.aggregate = () => ({
        toArray: async () => [{ metadata: [], result: [] }],
    });
    assert.equal((await model.getCurrentVersionItems(input)).count, 0);
});

test('current reads use native prepared-schema authorization before aggregation and project its result', async (t) => {
    const previous = global.SERVICE;
    t.after(() => {
        global.SERVICE = previous;
    });
    const { model, input, calls } = fixture();
    model.rawSchema = {
        readProtection: { owner: 'DefaultFixtureReadService' },
    };
    let allowed = false,
        projected = 0;
    global.SERVICE = {
        DefaultSchemaReadAccessPolicyService: readPolicy,
        DefaultFixtureReadService: {
            providerRead: async (request, receiver) => {
                assert.equal(request, input);
                assert.equal(receiver, model);
                return allowed;
            },
            providerResult: async (request, response, receiver) => {
                assert.equal(request, input);
                assert.equal(receiver, model);
                projected++;
                response.success.result = response.success.result.map(() => ({
                    redacted: true,
                }));
                return true;
            },
        },
    };
    await assert.rejects(model.getCurrentVersionItems(input), {
        code: 'ERR_AUTH_00003',
    });
    assert.equal(calls.length, 0);
    allowed = true;
    const result = await model.getCurrentVersionItems(input);
    assert.deepEqual(result.result, [{ redacted: true }]);
    assert.equal(projected, 1);
    assert.equal(calls.length, 1);
    delete SERVICE.DefaultFixtureReadService;
    await assert.rejects(model.getCurrentVersionItems(input), {
        code: 'ERR_AUTH_00003',
    });
    assert.equal(calls.length, 1);
    delete SERVICE.DefaultSchemaReadAccessPolicyService;
    await assert.rejects(model.getCurrentVersionItems(input), {
        code: 'ERR_AUTH_00003',
    });
    assert.equal(calls.length, 1);
});

test('current reads reject revoked result access and private journal modes without returning raw data', async (t) => {
    const previous = global.SERVICE;
    t.after(() => {
        global.SERVICE = previous;
    });
    const { model, input, calls } = fixture();
    model.rawSchema = {
        readProtection: { owner: 'DefaultFixtureReadService' },
    };
    global.SERVICE = {
        DefaultSchemaReadAccessPolicyService: readPolicy,
        DefaultFixtureReadService: {
            providerRead: async () => true,
            providerResult: async () => false,
        },
    };
    await assert.rejects(model.getCurrentVersionItems(input), {
        code: 'ERR_AUTH_00003',
    });
    assert.equal(calls.length, 1);
    for (const internalPersistence of ['DURABLE_JOURNAL', 'UNKNOWN'])
        await assert.rejects(
            model.getCurrentVersionItems({ ...input, internalPersistence }),
        );
    assert.equal(calls.length, 1);
});

test(
    'isolated MongoDB: latest state and ownership filter cannot resurrect history; count and paging use logical records',
    {
        skip: !process.env.NODICS_MONGODB_TEST_URI,
    },
    async () => {
        const { MongoClient } = require('mongodb');
        const client = new MongoClient(process.env.NODICS_MONGODB_TEST_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        const databaseName =
            'nodics_versioned_read_test_' + randomUUID().replaceAll('-', '');
        let created = false;
        try {
            await client.connect();
            const database = client.db(databaseName);
            const collection = await database.createCollection('records', {
                collation: { locale: 'en', strength: 2 },
            });
            created = true;
            await collection.createIndex(
                { code: 1, versionId: 1 },
                { unique: true, collation: { locale: 'simple' } },
            );
            await collection.insertMany([
                {
                    code: 'a',
                    versionId: 0,
                    status: 'ACTIVE',
                    enterpriseCode: 'e1',
                    name: 'Same',
                },
                {
                    code: 'a',
                    versionId: 1,
                    status: 'ARCHIVED',
                    enterpriseCode: 'e1',
                    name: 'Same',
                },
                {
                    code: 'b',
                    versionId: 0,
                    status: 'ACTIVE',
                    enterpriseCode: 'e1',
                    name: 'Same',
                },
                {
                    code: 'b',
                    versionId: 1,
                    status: 'ACTIVE',
                    enterpriseCode: 'e2',
                    name: 'Same',
                },
                {
                    code: 'c',
                    versionId: 0,
                    status: 'ACTIVE',
                    enterpriseCode: 'e1',
                    name: 'Same',
                },
                {
                    code: 'd',
                    versionId: 0,
                    status: 'ACTIVE',
                    enterpriseCode: 'e1',
                    name: 'Same',
                },
            ]);
            const model = Object.assign(collection, base, versioned, {
                primaryKey: 'code',
            });
            const input = {
                query: { status: 'ACTIVE', enterpriseCode: 'e1' },
                searchOptions: {
                    limit: 1,
                    skip: 0,
                    sort: { name: 1 },
                    projection: { code: 1, versionId: 1, _id: 0 },
                },
            };
            const first = await model.getCurrentVersionItems(input);
            assert.equal(first.count, 2);
            assert.deepEqual(first.result, [{ code: 'c', versionId: 0 }]);
            const historical = await model.getItems(input);
            assert.equal(
                historical.count,
                4,
                'legacy history reads remain distinct from current-record selection',
            );
            const second = await model.getCurrentVersionItems({
                ...input,
                searchOptions: { ...input.searchOptions, skip: 1 },
            });
            assert.equal(second.count, 2);
            assert.deepEqual(second.result, [{ code: 'd', versionId: 0 }]);
            const emptyPage = await model.getCurrentVersionItems({
                ...input,
                searchOptions: { ...input.searchOptions, skip: 2 },
            });
            assert.equal(emptyPage.count, 2);
            assert.deepEqual(emptyPage.result, []);
            const exact = await model.getItems({
                query: { code: 'a', versionId: 0 },
                searchOptions: { limit: 1 },
            });
            assert.equal(exact.result[0].status, 'ACTIVE');
            assert.equal(
                await collection.countDocuments({}),
                6,
                'reads preserve every history row',
            );
            await collection.insertOne({
                code: 'C',
                versionId: 0,
                status: 'ACTIVE',
                enterpriseCode: 'e1',
                name: 'Same',
            });
            const identities = await model.getCurrentVersionItems({
                ...input,
                searchOptions: { limit: 10 },
            });
            assert.equal(
                identities.count,
                3,
                'collection collation cannot collapse distinct logical identities',
            );
            assert.deepEqual(
                identities.result.map((row) => row.code),
                ['C', 'c', 'd'],
            );
            await model.updateVersionedItems({
                query: { code: 'a' },
                searchOptions: { limit: 10 },
                model: { name: 'Updated' },
            });
            assert.equal(
                await collection.countDocuments({ code: 'a' }),
                3,
                'history selection inserts exactly one successor',
            );
            await assert.rejects(
                model.updateVersionedItems({
                    query: { code: 'a', versionId: 0 },
                    searchOptions: { limit: 10 },
                    model: { name: 'Stale' },
                }),
                { code: 'ERR_MDL_00004' },
            );
            assert.equal(
                await collection.countDocuments({ code: 'a' }),
                3,
                'stale selection cannot create a successor',
            );
            const updated = await collection.findOne({
                code: 'a',
                versionId: 2,
            });
            assert.equal(updated.name, 'Updated');
            assert.equal(updated.status, 'ARCHIVED');
        } finally {
            // This test can only drop the unique database it created, never a configured application database.
            if (created) await client.db(databaseName).dropDatabase();
            await client.close();
        }
    },
);
