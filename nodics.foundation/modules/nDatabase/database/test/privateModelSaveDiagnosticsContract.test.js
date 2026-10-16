/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module database/test/privateModelSaveDiagnosticsContract
 * @description Exercises actual saveModel driver failures, private logger ingress and fixed HTTP errors in base and merged vService compositions without a database.
 * @layer test
 * @owner nDatabase
 * @override Preserve exact private-object and ordinary-error behavior when selecting the base initializer in later layers.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const base = require('../src/service/procs/save/defaultModelSaveInitializerService');
const variant = require('../../../nService/vService/src/service/procs/save/defaultModelSaveInitializerService');
const mongo = require('../../mongodb/src/schemas/model').default;
const logger = require('../../../nConfig/src/service/DefaultLoggerService');
const router = require('../../../nRouter/src/service/router/defaultRouterOperationService');
const statuses = require('../src/utils/statusDefinitions');

/** Builds a synthetic driver and real private logger boundary; restores all global state. */
function fixture(t, members) {
    const previous = ['SERVICE', 'CONFIG', 'CLASSES'].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]);
    t.after(() => previous.forEach(([key, descriptor]) => {
        if (descriptor) Object.defineProperty(global, key, descriptor);
        else delete global[key];
    }));
    global.CONFIG = { get: key => key === 'log' ? { requestPrivacy: { qualified: true, captureMode: 'disabled' } } : undefined };
    global.CLASSES = { NodicsError: class extends Error {
        constructor(code, message) { super(message || code); this.code = code; }
    } };
    global.SERVICE = {
        DefaultLoggerService: logger,
        DefaultStatusService: { get: code => statuses[code] || { code: '500', message: 'Request failed' } },
        DefaultModelValidatorService: { validateMandate: async () => {}, validateDataType: async () => {} },
    };
    const consoleCalls = [], loggerInputs = [], loggerRecords = [];
    for (const method of ['log', 'error', 'warn']) t.mock.method(console, method, (...args) => consoleCalls.push(args));
    const sink = logger.protectLoggerIngress({ write: info => loggerRecords.push(info) });
    const owner = { ...members, LOG: {
        debug() {},
        error: (...args) => { loggerInputs.push(args); sink.write({ level: 'error', message: args[0] }); },
    } };
    const diagnostic = 'SYNTHETIC_PRIVATE_DRIVER_DIAGNOSTIC';
    const driverError = Object.assign(new Error(diagnostic), { code: 'ERR_SAVE_00000', metadata: { driverDetail: diagnostic } });
    const request = {
        tenant: 'synthetic', model: { code: 'receipt-one' }, options: { recursive: false, insertOnly: true },
        internalPersistence: 'DURABLE_JOURNAL',
        schemaModel: {
            ...mongo,
            rawSchema: { router: { enabled: false }, cache: { enabled: false }, event: { enabled: false } },
            dataBase: { getCapabilities: () => ({ persistence: { contractVersion: 1, durableJournal: true, primaryMajorityReadback: true } }) },
            insertOne: async () => { throw driverError; },
        },
    };
    return { owner, request, driverError, diagnostic, consoleCalls, loggerInputs, loggerRecords };
}

/** Drives the actual generated save pipeline node and retains its original error identity. */
function save(owner, request) {
    return new Promise(resolve => owner.saveModel(request, {}, {
        nextSuccess: (input, output) => resolve({ input, output }),
        error: (input, output, error) => resolve({ input, output, error }),
    }));
}

/** Proves private response formatting through the canonical router, not a copied error projector. */
function privateResponse(request, error) {
    const response = { status(value) { this.statusCode = value; return this; }, json(value) { this.body = value; return this; } };
    assert.equal(router.sendPrivateError(request, response, error), true);
    return response;
}

for (const [name, members] of [
    ['base', base],
    ['merged vService selecting base saveModel', { ...base, ...variant, saveModel: base.saveModel }],
]) {
    test(name + ': private driver diagnostics never reach console/logger and HTTP errors remain fixed', async t => {
        const f = fixture(t, members);
        const result = await logger.runSensitiveOperation(f.request, () => save(f.owner, f.request));
        assert.equal(result.error, f.driverError);
        assert.equal(result.input, f.request);
        assert.deepEqual(f.consoleCalls, []);
        assert.deepEqual(f.loggerInputs, [['ERR_SAVE_00000']]);
        assert.equal(JSON.stringify(f.loggerRecords).includes(f.diagnostic), false);
        assert.equal(f.loggerRecords[0].message, '[SENSITIVE_REQUEST]');
        const response = privateResponse(f.request, result.error);
        assert.equal(response.statusCode, 500);
        assert.equal(response.body.code, 'ERR_SAVE_00000');
        assert.equal(response.body.message, statuses.ERR_SAVE_00000.message);
        assert.equal(JSON.stringify(response.body).includes(f.diagnostic), false);
        assert.equal(Object.hasOwn(response.body, 'metadata'), false);
        assert.equal(Object.hasOwn(response.body, 'stack'), false);
    });

    test(name + ': exact private requests stay safe outside their original async context', async t => {
        const f = fixture(t, members);
        logger.runSensitiveOperation(f.request, () => true);
        const result = await save(f.owner, f.request);
        assert.equal(result.error, f.driverError);
        assert.deepEqual(f.loggerInputs, [['ERR_SAVE_00000']]);
        assert.deepEqual(f.consoleCalls, []);
        assert.equal(JSON.stringify(f.loggerRecords).includes(f.diagnostic), false);
        assert.equal(JSON.stringify(privateResponse(f.request, result.error).body).includes(f.diagnostic), false);
    });

    test(name + ': ordinary failures retain original error identity and canonical diagnostic logging', async t => {
        const f = fixture(t, members);
        // Enumerable caller flags cannot select the private diagnostic branch.
        f.request.requestPrivacy = { sensitive: true };
        f.request.captureProtectionQualified = true;
        const result = await save(f.owner, f.request);
        assert.equal(result.error, f.driverError);
        assert.equal(result.input, f.request);
        assert.equal(result.output.success, undefined);
        assert.deepEqual(f.loggerInputs, [[f.driverError]]);
        assert.equal(JSON.stringify(f.loggerRecords).includes(f.diagnostic), true);
        assert.deepEqual(f.consoleCalls, []);
    });

    test(name + ': acknowledged insert preserves normal save success without error diagnostics', async t => {
        const f = fixture(t, members);
        f.request.schemaModel.insertOne = async () => ({ acknowledged: true, insertedId: 'synthetic-id' });
        const result = await save(f.owner, f.request);
        assert.equal(result.error, undefined);
        assert.equal(result.output.success.code, 'SUC_SAVE_00000');
        assert.equal(result.output.success.result.code, 'receipt-one');
        assert.deepEqual(f.loggerInputs, []);
        assert.deepEqual(f.consoleCalls, []);
    });
}
