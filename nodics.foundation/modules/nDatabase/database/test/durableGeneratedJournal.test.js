/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module database/test/durableGeneratedJournal @description Exercises private generated durable saves and conditional updates through the actual MongoDB model protocol without a live database. @layer test @owner nDatabase @override Preserve provider qualification, exact predicates, acknowledgement failure and unchanged ordinary behavior. */
const test = require('node:test');
const assert = require('node:assert/strict');
const save = require('../src/service/procs/save/defaultModelSaveInitializerService');
const update = require('../src/service/procs/update/defaultModelsUpdateInitializerService');
const mongo = require('../../mongodb/src/schemas/model').default;
const get = require('../src/service/procs/get/defaultModelsGetInitializerService');
const variantRoot = '../../../nService/vService/src/service/procs/';
const mergedSave = {
    ...save,
    ...require(variantRoot + 'save/defaultModelSaveInitializerService'),
    LOG: { debug() {}, error() {} },
};
const mergedUpdate = {
    ...update,
    ...require(variantRoot + 'update/defaultModelsUpdateInitializerService'),
    LOG: { debug() {}, error() {} },
};
const mergedGet = {
    ...get,
    ...require(variantRoot + 'get/defaultModelsGetInitializerService'),
    LOG: { debug() {} },
};

/** Runs the real merged pipeline node and exposes its ordinary response. */
function step(owner, method, request) {
    return new Promise((resolve, reject) =>
        owner[method](
            request,
            {},
            {
                nextSuccess: (input, output) => resolve(output.success),
                error: (input, output, error) => reject(error),
            },
        ),
    );
}

/** Builds the real model/pipeline with an isolated provider boundary. @param {Object} t Test cleanup context. @returns {Object} Request, model and captured calls. */
function fixture(t) {
    const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    t.after(() => Object.assign(global, previous));
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code, message) {
                super(message || code);
                this.code = code;
            }
        },
    };
    global.SERVICE = {
        DefaultModelValidatorService: {
            validateMandate: async () => {},
            validateDataType: async () => {},
        },
    };
    const calls = [];
    const model = {
        ...mongo,
        rawSchema: {
            router: { enabled: false },
            cache: { enabled: false },
            event: { enabled: false },
            definition: { code: { type: 'string' }, revision: { type: 'int' } },
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
        insertOne: async (record, options) => {
            calls.push({ record, options });
            return { acknowledged: true, insertedId: 'one' };
        },
        findOneAndUpdate: async (query, patch, options) => {
            calls.push({ query, patch, options });
            return { ok: 1, value: { code: query.code, ...patch.$set } };
        },
    };
    return {
        model,
        calls,
        request: {
            schemaModel: model,
            query: { code: 'one', revision: 1, propertyReadFence: null },
            model: { revision: 2 },
            internalPersistence: 'DURABLE_JOURNAL',
        },
    };
}

test('generated durable conditional update preserves all predicates and requests journaled majority write', async (t) => {
    const f = fixture(t);
    assert.deepEqual(await update.updateDurableJournal(f.request), {
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
    });
    assert.deepEqual(f.calls[0].query, f.request.query);
    assert.deepEqual(f.calls[0].options.writeConcern, {
        w: 'majority',
        j: true,
    });
    assert.equal(f.calls[0].options.upsert, false);
    assert.deepEqual(f.calls[0].options.collation, { locale: 'simple' });
});

test('generated durable reads normalize paging without leaking default driver options or using cache', async (t) => {
    const f = fixture(t);
    const input = {
        ...f.request,
        searchOptions: { pageSize: 2, pageNumber: 1 },
    };
    const owner = { ...get, LOG: { debug() {} } };
    const build = (request) =>
        new Promise((resolve, reject) =>
            owner.buildOptions(
                request,
                {},
                {
                    nextSuccess: () => resolve(),
                    error: (req, res, error) => reject(error),
                },
            ),
        );
    await build(input);
    assert.deepEqual(input.searchOptions, { limit: 2 });
    assert.equal(input.options.skipItemCache, true);
    f.model.find = (query, options) => {
        f.calls.push({ query, options });
        return [{ code: 'one', revision: 1 }];
    };
    f.model.cursorToArray = async (cursor) => cursor;
    f.model.countDocuments = async () => 1;
    assert.equal((await owner.readItems(input)).result[0].code, 'one');
    assert.equal(f.calls[0].options.readPreference, 'primary');
    assert.deepEqual(f.calls[0].options.readConcern, { level: 'majority' });
    for (const searchOptions of [
        { pageSize: 2, pageNumber: 2 },
        { pageSize: 0, pageNumber: 1 },
        { pageSize: 2, pageNumber: 1, readPreference: 'secondary' },
        { limit: 2 },
    ])
        await assert.rejects(build({ ...f.request, searchOptions }));
});

test('durable acknowledgement compares canonical schema dates without weakening stored-value checks', async (t) => {
    const f = fixture(t);
    f.model.rawSchema.definition.updatedAt = { type: 'date' };
    const updatedAt = '2026-10-04T12:00:00.000Z';
    f.request.model.updatedAt = updatedAt;
    assert.equal(
        (await update.updateDurableJournal(f.request)).matchedCount,
        1,
    );
    assert.equal(f.calls[0].patch.$set.updatedAt instanceof Date, true);
    assert.equal(f.calls[0].patch.$set.updatedAt.toISOString(), updatedAt);
    assert.equal(f.request.model.updatedAt, updatedAt);
    f.model.findOneAndUpdate = async (query, patch) => ({
        ok: 1,
        value: {
            ...patch.$set,
            code: query.code,
            updatedAt: new Date('2026-10-03T12:00:00.000Z'),
        },
    });
    await assert.rejects(
        update.updateDurableJournal(f.request),
        /not acknowledged/,
    );
});

test('durable insert remains create-only and requires explicit qualified mode', async (t) => {
    const f = fixture(t);
    const input = {
        ...f.request,
        query: { code: 'one' },
        model: { code: 'one', revision: 1 },
        options: { insertOnly: true },
    };
    assert.equal((await save.insertModel(input)).code, 'one');
    assert.deepEqual(f.calls[0].options.writeConcern, {
        w: 'majority',
        j: true,
    });
    for (const change of [
        { internalPersistence: 'UNKNOWN' },
        { transactionContext: {} },
    ])
        await assert.rejects(save.insertModel({ ...input, ...change }));
    f.model.dataBase.getCapabilities = () => ({});
    await assert.rejects(save.insertModel(input));
    assert.equal(f.calls.length, 1);
});

test('durable updates deny unsupported providers, managed/versioned schemas and broad or ambiguous intent before writes', async (t) => {
    const f = fixture(t);
    for (const patch of [
        { internalPersistence: 'UNKNOWN' },
        { transactionContext: {} },
        { query: {} },
        { query: { code: { $in: ['one'] } } },
        { query: { code: 'one', revision: { $gt: 0 } } },
        { model: [{ revision: 2 }] },
        { model: { $set: { revision: 2 } } },
        { options: { recursive: true } },
    ])
        await assert.rejects(
            update.updateDurableJournal({ ...f.request, ...patch }),
        );
    f.model.versioned = true;
    await assert.rejects(update.updateDurableJournal(f.request));
    f.model.versioned = false;
    SERVICE.DefaultModelConcurrencyService = { getField: () => 'revision' };
    await assert.rejects(update.updateDurableJournal(f.request));
    delete SERVICE.DefaultModelConcurrencyService;
    f.model.dataBase.getCapabilities = () => ({});
    await assert.rejects(update.updateDurableJournal(f.request));
    assert.equal(f.calls.length, 0);
});

test('zero-match and lost or contradictory durable update acknowledgements never authorize follow-on work', async (t) => {
    const f = fixture(t);
    f.model.findOneAndUpdate = async () => ({ ok: 1, value: null });
    assert.equal(
        (await update.updateDurableJournal(f.request)).matchedCount,
        0,
    );
    for (const result of [
        undefined,
        { ok: 0, value: { code: 'one', revision: 2 } },
        { ok: 1, value: { code: 'foreign', revision: 2 } },
        { ok: 1, value: { code: 'one', revision: 1 } },
        {
            ok: 1,
            value: { code: 'one', revision: 2 },
            writeConcernError: { code: 64 },
        },
        { ok: 1, value: { code: 'one', revision: 2 }, acknowledged: false },
    ]) {
        let attempts = 0;
        f.model.findOneAndUpdate = async () => {
            attempts++;
            return result;
        };
        await assert.rejects(update.updateDurableJournal(f.request));
        assert.equal(attempts, 1);
    }
});

test('durable mode cannot be applied to public, side-effecting or credential-managed schemas', async (t) => {
    const f = fixture(t);
    for (const change of [
        { router: { enabled: true } },
        { cache: { enabled: true } },
        { event: { enabled: true } },
        { credentialRetirement: { enabled: true } },
    ]) {
        const schemaModel = {
            ...f.model,
            rawSchema: { ...f.model.rawSchema, ...change },
        };
        const request = { ...f.request, schemaModel };
        await assert.rejects(update.updateDurableJournal(request));
        await assert.rejects(
            save.insertModel({
                ...request,
                query: { code: 'one' },
                model: { code: 'one' },
            }),
        );
        assert.throws(() => get.resolveReadMethod(request));
    }
    assert.equal(f.calls.length, 0);
});

test('merged vService journals retain base read qualification and native conditional update', async (t) => {
    const f = fixture(t);
    const response = await step(mergedUpdate, 'executeQuery', f.request);
    assert.equal(response.result.acknowledged, true);
    assert.equal(response.result.matchedCount, 1);
    assert.deepEqual(f.calls[0].options.writeConcern, {
        w: 'majority',
        j: true,
    });
    assert.equal(f.calls[0].options.upsert, false);
    for (const schemaModel of [
        { ...f.model, versioned: true },
        { ...f.model, persistenceCapabilities: () => ({}) },
        {
            ...f.model,
            rawSchema: { ...f.model.rawSchema, router: { enabled: true } },
        },
        {
            ...f.model,
            rawSchema: { ...f.model.rawSchema, cache: { enabled: true } },
        },
        {
            ...f.model,
            rawSchema: { ...f.model.rawSchema, event: { enabled: true } },
        },
        {
            ...f.model,
            rawSchema: { ...f.model.rawSchema, credentialRetirement: {} },
        },
    ]) {
        const request = { ...f.request, schemaModel };
        assert.throws(() => mergedGet.resolveReadMethod(request));
        await assert.rejects(step(mergedUpdate, 'executeQuery', request));
    }
    assert.equal(f.calls.length, 1);
});

test('merged vService durable insertion preserves majority acknowledgement and cannot use ordinary upsert', async (t) => {
    const f = fixture(t);
    const previous = global.UTILS;
    global.UTILS = { isArray: Array.isArray };
    t.after(() => {
        global.UTILS = previous;
    });
    const request = {
        ...f.request,
        query: { code: 'one' },
        model: { code: 'one', revision: 1 },
        options: { insertOnly: true },
    };
    assert.equal(
        (await step(mergedSave, 'saveModel', request)).result.code,
        'one',
    );
    assert.deepEqual(f.calls[0].options.writeConcern, {
        w: 'majority',
        j: true,
    });
    f.model.insertOne = async () => ({ acknowledged: false });
    await assert.rejects(step(mergedSave, 'saveModel', request));
});

test('merged vService cannot downgrade unknown protocols or private retirement to ordinary persistence', async (t) => {
    const f = fixture(t);
    assert.throws(() =>
        mergedGet.resolveReadMethod({
            ...f.request,
            internalPersistence: 'UNKNOWN',
        }),
    );
    await assert.rejects(
        step(mergedUpdate, 'executeQuery', {
            ...f.request,
            internalPersistence: 'UNKNOWN',
        }),
    );
    let retirements = 0;
    SERVICE.DefaultModelConcurrencyService = {
        ownsCredentialRetirement: () => true,
        executeCredentialRetirement: async (request) => {
            assert.equal(request, f.request);
            retirements++;
            return { matchedCount: 1 };
        },
        getField: () => {
            assert.fail('private retirement must retain its owning path');
        },
    };
    delete f.request.internalPersistence;
    assert.equal(
        (await step(mergedUpdate, 'executeQuery', f.request)).result
            .matchedCount,
        1,
    );
    assert.equal(retirements, 1);
    assert.equal(f.calls.length, 0);
});
