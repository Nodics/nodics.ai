/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module vService/test/managedMutationLayerContract
 * @description Exercises effective base-plus-variant persistence nodes with the real concurrency and MongoDB CAS methods.
 * @layer test
 * @owner vService
 * @override Use simulated IO or an explicit isolated test URI; never access application databases.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const _ = require('lodash');
const database = '../../../nDatabase/database';
const concurrency = require(
    database + '/src/service/schema/defaultModelConcurrencyService',
);
const pipelines = require(database + '/src/pipelines/pipelines');
const mongo = require('../../../nDatabase/mongodb/src/schemas/model').default;
const log = { debug() {}, error() {} };
const save = _.merge(
    {},
    require(
        database + '/src/service/procs/save/defaultModelSaveInitializerService',
    ),
    require('../src/service/procs/save/defaultModelSaveInitializerService'),
    { LOG: log },
);
const update = _.merge(
    {},
    require(
        database +
            '/src/service/procs/update/defaultModelsUpdateInitializerService',
    ),
    require('../src/service/procs/update/defaultModelsUpdateInitializerService'),
    { LOG: log },
);

global.UTILS = { isArray: Array.isArray };
global.CLASSES = {
    NodicsError: class extends Error {
        constructor(error, message, code) {
            super(message || String(error));
            this.code = code || error;
            this.cause = error;
        }
    },
};
global.SERVICE = {
    DefaultModelConcurrencyService: concurrency,
    DefaultModelSaveInitializerService: save,
    DefaultModelsUpdateInitializerService: update,
    DefaultModelValidatorService: {
        validateMandate: async () => {},
        validateDataType: async () => {},
    },
};

function run(operation, request) {
    const pipeline =
        operation === 'save'
            ? pipelines.modelSaveInitializerPipeline
            : pipelines.modelsUpdateInitializerPipeline;
    const node =
        pipeline.nodes[operation === 'save' ? 'saveModel' : 'executeQuery'];
    const [owner, method] = node.handler.split('.');
    return new Promise((resolve, reject) =>
        SERVICE[owner][method](
            request,
            {},
            {
                nextSuccess: (input, output) => resolve(output.success),
                error: (input, output, error) => reject(error),
            },
        ),
    );
}

function fixture(managed = true, versioned = false) {
    let record;
    const calls = [];
    const model = {
        schemaName: 'fixture',
        primaryKey: 'code',
        versioned,
        rawSchema: {
            definition: { revision: { type: 'int' } },
            backoffice: { concurrency: { managed, field: 'revision' } },
        },
        normalizeModelForWrite: (value) => _.cloneDeep(value),
        transactionOptions: () => ({}),
        internalPersistenceOptions: () => ({}),
        compareAndSetItem: mongo.compareAndSetItem,
        getItems: async ({ query }) => ({
            result:
                record &&
                record.code === query.code &&
                record.tenant === query.tenant
                    ? [_.cloneDeep(record)]
                    : [],
        }),
        insertOne: async (value) => {
            calls.push('insert');
            record = _.cloneDeep(value);
            return { acknowledged: true, insertedId: 'id' };
        },
        findOneAndUpdate: async (query, patch, options) => {
            calls.push('cas');
            assert.equal(options.upsert, false);
            assert.equal(options.returnDocument, 'after');
            assert.equal(query.tenant, 'tenant-a');
            if (!record || query.revision !== record.revision)
                return { value: null };
            record = { ...record, ..._.cloneDeep(patch.$set) };
            return { value: _.cloneDeep(record) };
        },
        saveItems: async () => {
            calls.push('ordinary-save');
            return [{ code: 'ordinary' }];
        },
        updateItems: async () => {
            calls.push('ordinary-update');
            return { modifiedCount: 1 };
        },
        saveVersionedItems: async () => {
            calls.push('versioned-save');
            return [{ code: 'versioned', versionId: 2 }];
        },
        updateVersionedItems: async () => {
            calls.push('versioned-update');
            return { versionId: 3 };
        },
    };
    const request = (patch, revision) => ({
        schemaModel: model,
        tenant: 'tenant-a',
        authData: { userGroups: ['fixture'] },
        query: {
            code: 'pointer',
            tenant: 'tenant-a',
            ...(revision === undefined ? {} : { revision }),
        },
        model: patch,
    });
    return { model, calls, request, current: () => _.cloneDeep(record) };
}

test('merged managed save/update uses existing provider CAS, rejects stale tokens and preserves unchanged saves', async () => {
    const f = fixture();
    const create = f.request({
        code: 'pointer',
        tenant: 'tenant-a',
        revision: 0,
        version: 'v1',
    });
    concurrency.initializeSave(create);
    const saved = await run('save', create);
    assert.equal(saved.code, 'SUC_SAVE_00000');
    assert.equal(saved.success, true);
    assert.equal(saved.result.revision, 1);
    const result = await run(
        'update',
        f.request({ version: 'v2', receiptCode: 'receipt' }, 1),
    );
    assert.deepEqual(result, {
        success: true,
        code: 'SUC_UPD_00000',
        result: { matchedCount: 1, modifiedCount: 1 },
    });
    assert.equal(f.current().revision, 2);
    await assert.rejects(
        run('update', f.request({ version: 'stale' }, 1)),
        (error) => error.error.code === 'ERR_CONCURRENCY_00001',
    );
    const savePatch = f.request({ code: 'pointer', version: 'v3' }, 2);
    concurrency.initializeSave(savePatch);
    assert.equal((await run('save', savePatch)).result.revision, 3);
    const unchanged = f.request({ code: 'pointer', version: 'v3' }, 3);
    concurrency.initializeSave(unchanged);
    assert.equal((await run('save', unchanged)).result.revision, 3);
    assert.equal(concurrency.wasUnchanged(unchanged), true);
    await assert.rejects(
        run('save', f.request({ code: 'pointer', version: 'stale' }, 2)),
        (error) => error.cause.code === 'ERR_CONCURRENCY_00001',
    );
    assert.deepEqual(f.calls, ['insert', 'cas', 'cas']);
});

for (const versioned of [false, true]) {
    test(
        'merged ' +
            (versioned ? 'versioned' : 'unmanaged') +
            ' branch retains persistence selection and envelopes',
        async () => {
            const f = fixture(false, versioned);
            const saved = await run('save', f.request({ code: 'pointer' }));
            const updated = await run('update', f.request({ version: 'new' }));
            assert.equal(saved.success, true);
            assert.equal(saved.code, 'SUC_SAVE_00000');
            assert.equal(
                saved.result.code,
                versioned ? 'versioned' : 'ordinary',
            );
            assert.equal(updated.success, true);
            assert.equal(updated.code, 'SUC_UPD_00000');
            assert.deepEqual(
                f.calls,
                versioned
                    ? ['versioned-save', 'versioned-update']
                    : ['ordinary-save', 'ordinary-update'],
            );
        },
    );
}

test('merged managed update rejects a provider CAS miss after a successful pre-read', async () => {
    const f = fixture();
    await run(
        'save',
        f.request({
            code: 'pointer',
            tenant: 'tenant-a',
            version: 'v1',
            revision: 0,
        }),
    );
    f.model.findOneAndUpdate = async () => ({ value: null });
    await assert.rejects(
        run('update', f.request({ version: 'v2' }, 1)),
        (error) =>
            error.code === 'ERR_UPD_00000' &&
            error.error.code === 'ERR_CONCURRENCY_00001',
    );
    assert.equal(f.current().revision, 1);
    assert.equal(f.current().version, 'v1');
});

test('later concurrency service override remains effective and errors retain variant envelopes', async () => {
    const original = SERVICE.DefaultModelConcurrencyService;
    const f = fixture();
    const calls = [];
    SERVICE.DefaultModelConcurrencyService = {
        getField: () => 'revision',
        execute: async (request, operation) => {
            calls.push(operation);
            throw new Error('custom rejection');
        },
    };
    try {
        await assert.rejects(
            run('save', f.request({ code: 'pointer' }, 1)),
            (error) => error.code === 'ERR_SAVE_00000',
        );
        await assert.rejects(
            run('update', f.request({ version: 'next' }, 1)),
            (error) =>
                error.code === 'ERR_UPD_00000' &&
                error.error.message === 'custom rejection',
        );
        assert.deepEqual(calls, ['save', 'update']);
        assert.deepEqual(f.calls, []);
    } finally {
        SERVICE.DefaultModelConcurrencyService = original;
    }
});

async function withStartupServices(check) {
    const path = require('node:path');
    const initializer = require('../../../nConfig/src/service/DefaultFrameworkInitializerService');
    const files = require('../../../nConfig/src/service/defaultFilesLoaderService');
    const logger = require('../../../nConfig/src/service/DefaultLoggerService');
    const old = {
        processFiles: files.processFiles,
        createLogger: logger.createLogger,
        utils: global.UTILS,
        services: global.SERVICE,
        nodics: global.NODICS,
    };
    const names = [
        'DefaultModelSaveInitializerService',
        'DefaultModelsUpdateInitializerService',
        'DefaultModelsGetInitializerService',
    ];
    const databasePath = path.resolve(__dirname, database);
    const variantPath = path.resolve(__dirname, '..');
    global.NODICS = {
        getNodicsHome: () => path.resolve(__dirname, '../../../../..'),
    };
    const paths = [
        'procs/save/defaultModelSaveInitializerService.js',
        'procs/update/defaultModelsUpdateInitializerService.js',
        'procs/get/defaultModelsGetInitializerService.js',
    ];
    global.UTILS = {
        ...UTILS,
        getFileNameWithoutExtension: (file) => {
            const name = path.basename(file, '.js');
            return name[0].toUpperCase() + name.slice(1);
        },
    };
    global.SERVICE = {
        DefaultModelConcurrencyService: concurrency,
        DefaultModelValidatorService: old.services.DefaultModelValidatorService,
    };
    // Bound discovery to the three real owner artifacts; the actual startup merge/provenance path executes.
    files.processFiles = (directory, suffix, visit) =>
        paths.forEach((file) => visit(path.join(directory, file)));
    logger.createLogger = () => log;
    try {
        const loader = { ...initializer, LOG: log };
        await loader.loadServices({ name: 'database', path: databasePath });
        const baseValidate =
            SERVICE.DefaultModelsUpdateInitializerService.validateRequest;
        await loader.loadServices({ name: 'vService', path: variantPath });
        assert.equal(
            SERVICE.DefaultModelsUpdateInitializerService.validateRequest,
            baseValidate,
        );
        assert.equal(SERVICE[names[0]].saveModel, save.saveModel);
        assert.equal(SERVICE[names[1]].executeQuery, update.executeQuery);
        assert.equal(
            SERVICE[names[1]].xNodics.memberOrigins.executeQuery.sourceModule,
            'vService',
        );
        assert.equal(
            SERVICE[names[1]].xNodics.memberOrigins.validateRequest
                .sourceModule,
            'database',
        );
        assert.equal(
            SERVICE[names[0]].xNodics.memberOrigins.persistModel.sourceModule,
            'database',
        );
        assert.equal(
            SERVICE[names[0]].xNodics.memberOrigins.resolveSaveMethod
                .sourceModule,
            'vService',
        );
        assert.equal(
            SERVICE[names[1]].xNodics.memberOrigins.persistUpdates.sourceModule,
            'database',
        );
        assert.equal(
            SERVICE[names[2]].xNodics.memberOrigins.assertReadSafety
                .sourceModule,
            'database',
        );
        await check();
    } finally {
        files.processFiles = old.processFiles;
        logger.createLogger = old.createLogger;
        global.UTILS = old.utils;
        global.SERVICE = old.services;
        global.NODICS = old.nodics;
    }
}

test('startup loadServices composes database then vService and keeps managed save/update CAS', async () => {
    await withStartupServices(async () => {
        const f = fixture();
        assert.equal(
            (
                await run(
                    'save',
                    f.request({
                        code: 'pointer',
                        tenant: 'tenant-a',
                        revision: 0,
                    }),
                )
            ).result.revision,
            1,
        );
        await run(
            'update',
            f.request({ version: 'v1', receiptCode: 'receipt' }, 1),
        );
        assert.equal(f.current().revision, 2);
        assert.deepEqual(f.calls, ['insert', 'cas']);
    });
});

test('base-only and incomplete versioned providers cannot fall back to ordinary writes', async () => {
    const f = fixture(false, true);
    const request = f.request({ code: 'pointer' });
    const baseSave = require(
        database + '/src/service/procs/save/defaultModelSaveInitializerService',
    );
    const baseUpdate = require(
        database +
            '/src/service/procs/update/defaultModelsUpdateInitializerService',
    );
    await assert.rejects(baseSave.persistModel(request));
    await assert.rejects(baseUpdate.persistUpdates(request));
    delete f.model.saveVersionedItems;
    delete f.model.updateVersionedItems;
    await assert.rejects(run('save', request));
    await assert.rejects(run('update', request));
    assert.deepEqual(f.calls, []);
});

test('later save/update selectors stay effective without weakening private journal safeguards', async () => {
    const f = fixture(false, true);
    f.model.customSave = async () => ({ code: 'custom' });
    f.model.customUpdate = async () => ({ matchedCount: 1 });
    const customizedSave = { ...save, resolveSaveMethod: () => 'customSave' };
    const customizedUpdate = {
        ...update,
        resolveUpdateMethod: () => 'customUpdate',
    };
    const request = f.request({ code: 'pointer' });
    assert.equal((await customizedSave.persistModel(request)).code, 'custom');
    assert.equal(
        (await customizedUpdate.persistUpdates(request)).matchedCount,
        1,
    );
    request.internalPersistence = 'DURABLE_JOURNAL';
    await assert.rejects(customizedSave.persistModel(request));
    await assert.rejects(customizedUpdate.persistUpdates(request));
    assert.deepEqual(f.calls, []);
});

test(
    'isolated MongoDB preserves startup-composed journal insertion, conditional completion and majority readback',
    {
        skip: !process.env.NODICS_MONGODB_TEST_URI,
    },
    async () => {
        const { MongoClient } = require('mongodb');
        const databaseName =
            'nodics_vservice_journal_test_' +
            require('node:crypto').randomUUID().replaceAll('-', '');
        const client = new MongoClient(process.env.NODICS_MONGODB_TEST_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        let created = false;
        try {
            await client.connect();
            const collection = await client
                .db(databaseName)
                .createCollection('receipts');
            created = true;
            await collection.createIndex({ code: 1 }, { unique: true });
            await withStartupServices(async () => {
                const model = Object.assign(collection, mongo, {
                    primaryKey: 'code',
                    schemaName: 'receipt',
                    versioned: false,
                    rawSchema: {
                        router: { enabled: false },
                        cache: { enabled: false },
                        event: { enabled: false },
                        definition: {
                            code: { type: 'string' },
                            revision: { type: 'int' },
                        },
                    },
                    dataBase: {
                        getOptions: () => ({}),
                        getCapabilities: () => ({
                            persistence: {
                                contractVersion: 1,
                                durableJournal: true,
                                primaryMajorityReadback: true,
                            },
                        }),
                    },
                });
                const request = () => ({
                    schemaModel: model,
                    tenant: 'tenant-a',
                    internalPersistence: 'DURABLE_JOURNAL',
                    query: {
                        code: 'original',
                        tenant: 'tenant-a',
                        principalCode: 'employee',
                        state: 'STARTED',
                        revision: 1,
                    },
                    model: {
                        code: 'original',
                        tenant: 'tenant-a',
                        principalCode: 'employee',
                        state: 'STARTED',
                        revision: 1,
                    },
                    options: { insertOnly: true },
                });
                const claims = await Promise.allSettled([
                    run('save', request()),
                    run('save', request()),
                ]);
                assert.equal(
                    claims.filter((row) => row.status === 'fulfilled').length,
                    1,
                );
                const change = {
                    ...request(),
                    model: { state: 'COMPLETED', revision: 2 },
                    options: {},
                };
                const completed = await run('update', change);
                assert.equal(completed.result.matchedCount, 1);
                assert.equal(
                    (await run('update', change)).result.matchedCount,
                    0,
                );
                const read = {
                    ...request(),
                    query: {
                        code: 'original',
                        tenant: 'tenant-a',
                        principalCode: 'employee',
                    },
                    options: { skipItemCache: true },
                    searchOptions: { limit: 2 },
                };
                const result =
                    await SERVICE.DefaultModelsGetInitializerService.readItems(
                        read,
                    );
                assert.equal(result.result.length, 1);
                assert.equal(result.result[0].state, 'COMPLETED');
                assert.equal(result.result[0].revision, 2);
                await assert.rejects(
                    run('save', {
                        ...request(),
                        model: { ...request().model, state: 'REPLACED' },
                    }),
                );
                assert.equal(
                    (await collection.findOne({ code: 'original' })).state,
                    'COMPLETED',
                );
                model.rawSchema.router.enabled = true;
                assert.throws(() =>
                    SERVICE.DefaultModelsGetInitializerService.readItems(read),
                );
                await assert.rejects(run('update', change));
            });
        } finally {
            try {
                if (created) await client.db(databaseName).dropDatabase();
            } finally {
                await client.close();
            }
        }
    },
);

test(
    'isolated MongoDB proves startup-composed managed save/update, no-op, stale token and atomic CAS miss',
    {
        skip: !process.env.NODICS_MONGODB_TEST_URI,
    },
    async () => {
        const { MongoClient } = require('mongodb');
        const databaseName =
            'nodics_vservice_cas_test_' +
            require('node:crypto').randomUUID().replaceAll('-', '');
        const client = new MongoClient(process.env.NODICS_MONGODB_TEST_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        let created = false;
        try {
            await client.connect();
            const db = client.db(databaseName);
            const collection = await db.createCollection('records');
            created = true;
            await collection.createIndex(
                { tenant: 1, code: 1 },
                { unique: true },
            );
            await withStartupServices(async () => {
                const schema = fixture().model.rawSchema;
                const model = Object.assign(collection, mongo, {
                    rawSchema: schema,
                    primaryKey: 'code',
                    schemaName: 'fixture',
                    versioned: false,
                    dataBase: { getOptions: () => ({}) },
                });
                const request = (patch, revision) => ({
                    schemaModel: model,
                    tenant: 'tenant-a',
                    query: {
                        code: 'pointer',
                        tenant: 'tenant-a',
                        ...(revision === undefined ? {} : { revision }),
                    },
                    model: patch,
                });
                const read = async () =>
                    (
                        await model.getItems({
                            query: { code: 'pointer', tenant: 'tenant-a' },
                            searchOptions: { limit: 2 },
                        })
                    ).result[0];
                const create = request({
                    code: 'pointer',
                    tenant: 'tenant-a',
                    revision: 0,
                    version: 'v1',
                });
                concurrency.initializeSave(create);
                assert.equal((await run('save', create)).result.revision, 1);
                await run(
                    'update',
                    request({ version: 'v2', receiptCode: 'receipt' }, 1),
                );
                assert.equal((await read()).revision, 2);
                assert.equal(
                    (
                        await run(
                            'update',
                            request(
                                { version: 'v2', receiptCode: 'receipt' },
                                2,
                            ),
                        )
                    ).result.modifiedCount,
                    0,
                );
                assert.equal((await read()).revision, 2);
                const edit = request({ code: 'pointer', version: 'v3' }, 2);
                concurrency.initializeSave(edit);
                assert.equal((await run('save', edit)).result.revision, 3);
                const unchanged = request(
                    { code: 'pointer', version: 'v3' },
                    3,
                );
                concurrency.initializeSave(unchanged);
                assert.equal((await run('save', unchanged)).result.revision, 3);
                assert.equal(concurrency.wasUnchanged(unchanged), true);
                await assert.rejects(
                    run('update', request({ version: 'stale' }, 2)),
                    (error) => error.error.code === 'ERR_CONCURRENCY_00001',
                );
                await assert.rejects(
                    run(
                        'save',
                        request({ code: 'pointer', version: 'stale' }, 2),
                    ),
                    (error) => error.cause.code === 'ERR_CONCURRENCY_00001',
                );
                const providerCAS = model.compareAndSetItem;
                let raced = false;
                model.compareAndSetItem = async function (input) {
                    if (!raced && input.operation === 'update') {
                        raced = true;
                        // A competing write lands after the concurrency owner's pre-read.
                        await providerCAS.call(this, {
                            operation: 'update',
                            query: input.query,
                            model: { revision: 4, version: 'competitor' },
                        });
                    }
                    return providerCAS.call(this, input);
                };
                await assert.rejects(
                    run('update', request({ version: 'loser' }, 3)),
                    (error) => error.error.code === 'ERR_CONCURRENCY_00001',
                );
                const persisted = await read();
                assert.equal(persisted.revision, 4);
                assert.equal(persisted.version, 'competitor');
                assert.equal(persisted.tenant, 'tenant-a');
            });
        } finally {
            try {
                if (created) await client.db(databaseName).dropDatabase();
            } finally {
                await client.close();
            }
        }
    },
);
