/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/test/insertOnlySaveContract
 * @description Exercises generated primary-query save against the atomic adapter insertion path.
 * @layer test
 * @owner nDatabase
 * @override Preserve duplicate-race, query-constraint, acknowledgement and ordinary-save coverage.
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const _ = require('lodash');
const save = require('../src/service/procs/save/defaultModelSaveInitializerService');
const variant = require('../../../nService/vService/src/service/procs/save/defaultModelSaveInitializerService');
const query = require('../src/service/procs/query/defaultModelQueryBuilderPipelineService');
const mongo = require('../../mongodb/src/schemas/model').default;
global.UTILS = {
    isBlank: _.isEmpty,
    isObject: _.isPlainObject,
    isArray: Array.isArray,
};
global.CLASSES = {
    NodicsError: class extends Error {
        constructor(code, message) {
            super(message || String(code));
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
save.LOG = query.LOG = { debug() {} };

function step(owner, method, request) {
    return new Promise((resolve, reject) =>
        owner[method](
            request,
            {},
            {
                nextSuccess: (req, res) => resolve(res),
                stop: (req, res) => resolve(res),
                error: (req, res, error) => reject(error),
            },
        ),
    );
}

function fixture() {
    const rows = new Map(),
        calls = [];
    const model = {
        ...mongo,
        rawSchema: { definition: { code: { primary: true, type: 'string' } } },
        dataBase: { getOptions: () => ({}) },
        insertOne: async (record, options) => {
            calls.push({ kind: 'insert', options });
            if (rows.has(record.code))
                throw Object.assign(new Error('duplicate'), { code: 11000 });
            rows.set(record.code, structuredClone(record));
            return { acknowledged: true, insertedId: record.code };
        },
        findOneAndUpdate: async (selector, patch) => {
            calls.push({ kind: 'upsert' });
            rows.set(selector.code, structuredClone(patch.$set));
            return { ok: 1, value: rows.get(selector.code) };
        },
    };
    const request = (revision = 0) => ({
        tenant: 'test',
        schemaModel: model,
        options: { insertOnly: true },
        model: { code: 'once', revision },
    });
    return { model, rows, calls, request };
}

test('generated primary lookup cannot turn insert-only initialization into an upsert', async () => {
    const f = fixture();
    const requests = [f.request(1), f.request(2)];
    for (const request of requests) {
        await step(save, 'validateModel', request);
        await step(query, 'buildPrimeryQuery', request);
        assert.deepEqual(request.query, { code: 'once' });
    }
    const results = await Promise.allSettled(
        requests.map((request) => step(save, 'saveModel', request)),
    );
    assert.equal(
        results.filter((result) => result.status === 'fulfilled').length,
        1,
    );
    assert.equal(f.rows.get('once').revision, 1);
    assert(f.calls.every((call) => call.kind === 'insert'));
});

test('ordinary generated saves retain their existing upsert behavior', async () => {
    const f = fixture();
    for (const revision of [1, 2]) {
        const request = f.request(revision);
        delete request.options.insertOnly;
        await step(query, 'buildPrimeryQuery', request);
        await step(save, 'saveModel', request);
    }
    assert.equal(f.rows.get('once').revision, 2);
    assert(f.calls.every((call) => call.kind === 'upsert'));
});

test('conflicting or operator constraints, unsupported models and malformed intent reject before persistence', async () => {
    for (const change of [
        (request) => {
            request.query = { code: 'other' };
        },
        (request) => {
            request.query = { code: { $ne: null } };
        },
        (request) => {
            request.query = { $or: [] };
        },
        (request) => {
            request.query = { 'scope.tenant': 'test' };
        },
        (request) => {
            request.schemaModel.versioned = true;
        },
        (request) => {
            delete request.schemaModel.compareAndSetItem;
        },
        (request) => {
            request.options.insertOnly = 'true';
        },
        (request) => {
            request.options.recursive = true;
        },
        (request) => {
            request.options.replaceAllMatchesByQuery = true;
        },
    ]) {
        const f = fixture(),
            request = f.request();
        change(request);
        await assert.rejects(step(save, 'saveModel', request));
        assert.equal(f.calls.length, 0);
    }
});

test('scope constraints are preserved and matching attributed fields allow creation', async () => {
    const f = fixture(),
        request = f.request();
    request.model.owner = 'employee';
    request.query = { code: 'once', owner: 'employee' };
    await step(save, 'saveModel', request);
    assert.equal(f.rows.get('once').owner, 'employee');
    request.query.owner = 'someone-else';
    await assert.rejects(step(save, 'saveModel', request));
    assert.equal(f.calls.length, 1);
});

test('managed concurrency cannot be bypassed and transaction context reaches the provider unchanged', async () => {
    const f = fixture(),
        request = f.request();
    SERVICE.DefaultModelConcurrencyService = {
        getField: () => 'revision',
        credentialRetirementProjection: () => null,
    };
    try {
        await assert.rejects(step(save, 'saveModel', request));
    } finally {
        delete SERVICE.DefaultModelConcurrencyService;
    }
    assert.equal(f.calls.length, 0);
    const token = {};
    request.transactionContext = token;
    f.model.transactionOptions = (input) => {
        assert.equal(input.transactionContext, token);
        return { session: 'owned' };
    };
    await step(save, 'saveModel', request);
    assert.deepEqual(f.calls[0].options, { session: 'owned' });
});

test('lost, failed and partial insert acknowledgements never return a successful save', async () => {
    for (const result of [
        {},
        { acknowledged: false },
        { acknowledged: true, writeConcernError: {} },
        { acknowledged: true, writeErrors: [{ code: 1 }] },
        { ops: [{ _id: 'legacy' }] },
    ]) {
        const f = fixture();
        f.model.insertOne = async () => result;
        await assert.rejects(step(save, 'saveModel', f.request()));
    }
    const f = fixture();
    f.model.insertOne = async () => {
        throw new Error('lost acknowledgement');
    };
    await assert.rejects(step(save, 'saveModel', f.request()));
});

test('versioned service composition preserves insert-only claims and rejects duplicate initialization', async () => {
    const merged = { ...save, ...variant, LOG: { debug() {}, error() {} } };
    const f = fixture();
    for (const revision of [1, 2]) {
        const request = f.request(revision);
        await step(query, 'buildPrimeryQuery', request);
        if (revision === 1) await step(merged, 'saveModel', request);
        else await assert.rejects(step(merged, 'saveModel', request));
    }
    assert.equal(f.rows.get('once').revision, 1);
    assert(f.calls.every((call) => call.kind === 'insert'));
});

test('versioned service composition cannot bypass journal, intent or unsupported-model guards', async () => {
    const merged = { ...save, ...variant, LOG: { debug() {}, error() {} } };
    for (const change of [
        (request) => {
            request.options.insertOnly = 'true';
        },
        (request) => {
            request.internalPersistence = 'DURABLE_JOURNAL';
            delete request.options.insertOnly;
        },
        (request) => {
            request.internalPersistence = 'DURABLE_JOURNAL';
        },
        (request) => {
            request.schemaModel.versioned = true;
        },
        (request) => {
            request.query = { code: 'foreign' };
        },
        (request) => {
            request.options.recursive = true;
        },
    ]) {
        const f = fixture(),
            request = f.request();
        f.model.saveVersionedItems = async () => {
            f.calls.push({ kind: 'versioned' });
            return request.model;
        };
        change(request);
        await assert.rejects(step(merged, 'saveModel', request));
        assert.equal(f.calls.length, 0);
    }
});
