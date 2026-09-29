/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module vService/test/versionedReadResponseContract
 * @description Verifies opt-in current reads, exact versions, pre-cache rejection and unchanged generated response contracts.
 * @layer test
 * @owner vService
 */
const assert = require('node:assert/strict');
const test = require('node:test');
global.CLASSES = { NodicsError: class extends Error {
    constructor(code, message) { super(message); this.code = code; }
} };
global.UTILS = { isObject: value => value && typeof value === 'object' && !Array.isArray(value) };
const base = require('../../../nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService');
const variant = require('../src/service/procs/get/defaultModelsGetInitializerService');
const subject = Object.assign({}, base, variant, { LOG: { debug() {} } });

function fixture(mode, versioned = true) {
    const calls = [];
    const request = { tenant: 'tenant-a', authData: { tenant: 'tenant-a' }, query: { status: 'ACTIVE' },
        searchOptions: { limit: 2 }, schemaModel: { versioned, rawSchema: { versionedReadMode: mode } } };
    for (const method of ['getItems', 'getCurrentVersionItems']) {
        request.schemaModel[method] = async input => {
            assert.strictEqual(input, request);
            calls.push(method);
            return { query: input.query, options: input.searchOptions, count: 2, result: [{ code: 'a' }, { code: 'b' }] };
        };
    }
    return { request, calls };
}

function execute(service, request) {
    const response = {};
    return new Promise((resolve, reject) => service.executeQuery(request, response, {
        nextSuccess: () => resolve(response.success), error: (input, output, error) => reject(error)
    }));
}

test('ordinary and existing history readers retain their provider and response envelope', async () => {
    for (const [mode, versioned] of [[undefined, false], [undefined, true], ['HISTORY', true]]) {
        const { request, calls } = fixture(mode, versioned);
        const response = await execute(subject, request);
        assert.deepEqual(calls, ['getItems']);
        assert.equal(response.code, 'SUC_FIND_00000');
        assert.equal(response.count, 2);
        assert.strictEqual(response.query, request.query);
        assert.strictEqual(response.options, request.searchOptions);
    }
});

test('schema-selected CURRENT reads keep the original secured request and ignore request mode overrides', async () => {
    const { request, calls } = fixture('CURRENT');
    request.options = { versionedReadMode: 'HISTORY' };
    const response = await execute(subject, request);
    assert.deepEqual(calls, ['getCurrentVersionItems']);
    assert.equal(response.result.length, 2);
    assert.strictEqual(subject.checkAccess, base.checkAccess);
    assert.strictEqual(subject.populateSubModels, base.populateSubModels);
});

test('explicit scalar version reads preserve exact immutable lookup', async () => {
    for (const versionId of [0, 2]) {
        const { request, calls } = fixture('CURRENT');
        request.query = { code: 'a', versionId, enterpriseCode: 'authorized' };
        await execute(subject, request);
        assert.deepEqual(calls, ['getItems']);
        assert.equal(request.query.versionId, versionId);
    }
});

test('invalid policy, unsupported provider and malformed exact versions reject before reads or cache progress', async () => {
    const requests = [fixture('UNKNOWN').request, fixture(null).request, fixture('CURRENT', false).request];
    const missing = fixture('CURRENT').request;
    delete missing.schemaModel.getCurrentVersionItems;
    requests.push(missing);
    for (const versionId of [null, '0', -1, 0.5, { $exists: true }]) {
        const { request } = fixture('CURRENT'); request.query.versionId = versionId; requests.push(request);
    }
    for (const request of requests) {
        let failure;
        subject.validateRequest(request, {}, {
            nextSuccess() { assert.fail('invalid read must not proceed to cache or access stages'); },
            error(input, output, error) { failure = error; }
        });
        assert.equal(failure.code, 'ERR_FIND_00003');
        await assert.rejects(execute(subject, request), { code: 'ERR_FIND_00003' });
    }
    const baseOnly = Object.assign({}, base, { LOG: { debug() {} } });
    await assert.rejects(execute(baseOnly, fixture('CURRENT').request), { code: 'ERR_FIND_00003' });
});

test('later-layer provider selection and rejected reads retain the shared pipeline error path', async () => {
    const { request, calls } = fixture('CURRENT');
    await execute(Object.assign({}, subject, { resolveReadMethod: () => 'getItems' }), request);
    assert.deepEqual(calls, ['getItems']);
    const failure = new Error('provider unavailable');
    request.schemaModel.getCurrentVersionItems = async () => { throw failure; };
    await assert.rejects(execute(subject, request), error => error === failure);
});
