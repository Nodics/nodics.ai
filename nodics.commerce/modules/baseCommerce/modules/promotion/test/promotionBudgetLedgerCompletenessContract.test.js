/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module promotion/test/promotionBudgetLedgerCompletenessContract @description Exercises ledger completeness through real generated reads, pagination, Mongo counts and protected projection over isolated storage. No native persistence or qualification. @layer test @owner promotion */
const test = require('node:test'), assert = require('node:assert/strict');
const operation = require('../src/service/defaultPromotionOperationService');
const controller = require('../src/controller/defaultPromotionController');
const facade = require('../src/facade/defaultPromotionFacade');
const routers = require('../src/router/routers');
const budget = require('../src/service/defaultPromotionBudgetMutationService');
const generatedReads = require('./helpers/generatedCouponReadFixture');
const NodicsError = require('../../../../../../nodics.foundation/modules/nCommon/src/lib/nodicsError');
const statuses = require('../src/utils/statusDefinitions');
const readStatuses = require('../../../../../../nodics.foundation/modules/nDatabase/database/src/utils/statusDefinitions');
const commonStatuses = require('../../../../../../nodics.foundation/modules/nCommon/src/utils/statusDefinitions');
const authStatuses = require('../../../../../../nodics.foundation/modules/nAuth/src/utils/statusDefinitions');

/** Installs genuine generated ledger reads over isolated mutable rows and restores all globals. */
function fixture(t, rows = []) {
    const keys = ['CONFIG', 'SERVICE', 'CLASSES', 'FACADE'];
    const previous = Object.fromEntries(keys.map(key => [key, Object.getOwnPropertyDescriptor(global, key)]));
    t.after(() => {
        for (const key of keys) {
            if (previous[key]) Object.defineProperty(global, key, previous[key]); else delete global[key];
        }
    });
    global.CONFIG = { get: key => ({ defaultPageSize: 20, defaultErrorCodes: { NodicsError: 'ERR_SYS_00000' } }[key]) };
    global.CLASSES = { NodicsError };
    global.SERVICE = {
        DefaultStatusService: { get: code => {
            const status = statuses[code] || readStatuses[code] || commonStatuses[code] || authStatuses[code];
            assert(status, 'Status must be registered: ' + code);
            return status;
        } },
        DefaultPromotionBudgetMutationService: budget,
        DefaultPromotionOperationService: operation,
    };
    global.FACADE = { DefaultPromotionFacade: facade };
    const state = generatedReads(t, () => rows, ['promotionBudgetLedger']);
    global.UTILS = { ...require('../../../../../../nodics.foundation/modules/nCommon/src/utils/utils'), ...UTILS };
    return { state, rows, read: (query = {}, scope = {}) => operation.budgetLedger({
        tenant: 'runtime', enterpriseCode: 'issuer', promotionCode: 'campaign', query, ...scope,
    }) };
}
const row = (code, scope = {}) => ({ code, tenant: 'runtime', enterpriseCode: 'issuer',
    promotionCode: 'campaign', mutationType: 'COMMIT', amount: '10', beforeSpent: '0', afterSpent: '10',
    targetCode: 'redemption', idempotencyKey: 'redemption', budgetMutation: { private: 'PRIVATE_RECEIPT' }, ...scope });
const unconfirmed = { code: 'ERR_PROMOTION_BUDGET_LEDGER_UNCONFIRMED' };

/** Shapes the already-authenticated native router request without copying signed entCode into enterpriseCode. */
function nativeRequest() {
    return { tenant: 'runtime', entCode: 'issuer', auth: { entCode: 'issuer', type: 'bearer' },
        authData: { tenant: 'runtime', entCode: 'issuer', tokenType: 'access', principalType: 'human', loginId: 'issuer-admin' },
        httpRequest: { headers: { 'x-enterprise-code': 'issuer', 'x-tenant-code': 'runtime' },
            params: { promotionCode: 'campaign' }, query: { pageSize: '100' } } };
}

test('native controller facade generated read preserves signed entCode issuer even with zero rows', async t => {
    const f = fixture(t);
    const input = nativeRequest(), original = structuredClone(input);
    const route = routers.promotion.backoffice.budgetLedger;
    assert.equal(route.controller, 'DefaultPromotionController');
    assert.equal(route.operation, 'budgetLedger');
    assert.equal(route.permission, 'commerce.promotion.read');
    assert.equal(route.secured, true);
    const result = await controller[route.operation](input);
    assert.equal(result.status, 200);
    assert.deepEqual(result.data.completeness, { contractVersion: 1, tenant: 'runtime', enterpriseCode: 'issuer',
        promotionCode: 'campaign', totalCount: 0, returnedCount: 0, pageNumber: 1, pageSize: 100, complete: true });
    assert.deepEqual(f.state.reads[0].query, { tenant: 'runtime', enterpriseCode: 'issuer', promotionCode: 'campaign' });
    assert.deepEqual(input, original);
});

test('native enterpriseCode signed alias scopes actual rows and excludes same campaign from foreign issuer', async t => {
    const f = fixture(t, [row('a'), row('b', { enterpriseCode: 'other' })]);
    const input = nativeRequest();
    delete input.authData.entCode;
    input.authData.enterpriseCode = 'issuer';
    const result = await controller.budgetLedger(input);
    assert.deepEqual(result.data.entries.map(item => item.code), ['a']);
    assert.equal(result.data.completeness.enterpriseCode, 'issuer');
    assert.equal(result.data.completeness.totalCount, 1);
    assert.equal(f.state.current.authData.enterpriseCode, 'issuer');
});

test('matching independent signed and presented aliases retain original auth without token rewriting', async t => {
    const f = fixture(t);
    const input = nativeRequest();
    input.authData.tenantCode = input.authData.tenant;
    delete input.authData.tenant;
    input.authData.enterpriseCode = 'issuer';
    input.enterpriseCode = 'issuer';
    input.tenantCode = 'runtime';
    input.httpRequest.headers.entCode = 'issuer';
    input.httpRequest.body = { enterpriseCode: 'issuer', tenant: 'runtime' };
    input.httpRequest.query.entCode = 'issuer';
    const original = structuredClone(input), auth = input.authData;
    const mapped = facade.applyBudgetLedgerContext(controller.applyHttp(input));
    assert.strictEqual(mapped.authData, auth);
    assert.equal(mapped.tenant, 'runtime');
    assert.equal(mapped.enterpriseCode, 'issuer');
    const result = await controller.budgetLedger(input);
    assert.equal(result.data.completeness.enterpriseCode, 'issuer');
    assert.deepEqual(input, original);
    assert.equal(f.state.reads[0].query.tenant, 'runtime');
});

test('native signed and presented tenant enterprise conflicts refuse before any generated read', async t => {
    const f = fixture(t);
    for (const change of [r => { r.authData.enterpriseCode = 'other'; }, r => { r.authData.entCode = null; },
        r => { r.authData.tenantCode = 'other'; }, r => { r.enterpriseCode = 'other'; },
        r => { r.entCode = 'other'; }, r => { r.auth.entCode = 'other'; }, r => { r.tenant = 'other'; },
        r => { r.tenantCode = 'other'; }, r => { r.auth.tenantCode = 'other'; },
        r => { r.httpRequest.headers['x-enterprise-code'] = 'other'; },
        r => { r.httpRequest.headers.entCode = 'other'; }, r => { r.httpRequest.headers['X-Enterprise-Code'] = 'other'; },
        r => { r.httpRequest.headers['x-enterprise-code'] = ['issuer']; },
        r => { r.httpRequest.headers['x-tenant-code'] = 'other'; },
        r => { r.httpRequest.body = { enterpriseCode: 'other' }; },
        r => { r.httpRequest.query.entCode = 'other'; }, r => { r.httpRequest.query.tenant = 'other'; },
        r => { delete r.authData.entCode; }, r => { delete r.authData.tenant; },
        r => { delete r.authData.loginId; r.actorId = 'unsigned-actor'; },
        r => { r.authData.tokenType = 'refresh'; }]) {
        const input = nativeRequest(); change(input);
        await assert.rejects(controller.budgetLedger(input), unconfirmed);
    }
    assert.equal(f.state.findCalls, 0);
    assert.equal(f.state.countCalls, 0);
});

test('legacy authenticated UI without any enterprise claim or selector stays explicitly unscoped', async t => {
    const f = fixture(t, [row('a'), row('b', { enterpriseCode: 'other' })]);
    const result = await controller.budgetLedger({ authData: { tenant: 'runtime', principalId: 'legacy-operator' },
        httpRequest: { params: { promotionCode: 'campaign' }, query: {} } });
    assert.equal(result.data.entries.length, 2);
    assert.equal(result.data.completeness.enterpriseCode, null);
    assert.equal('enterpriseCode' in f.state.reads[0].query, false);
});

test('generated pagination returns a partial page with full query count and protected projection', async t => {
    const f = fixture(t, [row('c'), row('a'), row('b'), row('foreign', { enterpriseCode: 'other' }),
        row('foreign-tenant', { tenant: 'other' }), row('foreign-campaign', { promotionCode: 'other' })]);
    const first = await f.read({ pageSize: '2' });
    assert.deepEqual(first.entries.map(item => item.code), ['a', 'b']);
    assert.deepEqual(first.completeness, { contractVersion: 1, tenant: 'runtime', enterpriseCode: 'issuer',
        promotionCode: 'campaign', totalCount: 3, returnedCount: 2, pageNumber: 1, pageSize: 2, complete: false });
    const second = await f.read({ pageSize: 2, pageNumber: 2 });
    assert.deepEqual(second.entries.map(item => item.code), ['c']);
    assert.equal(second.completeness.totalCount, 3);
    assert.equal(second.completeness.complete, false);
    assert.equal(f.state.countCalls, 2);
    assert(f.state.sameRequest);
    assert.equal(f.state.reads[0].options.limit, 2);
    assert.equal(f.state.reads[1].options.skip, 2);
    assert.deepEqual(f.state.reads[0].options.sort, { code: 1 });
    assert.equal(f.state.current.options.skipItemCache, true);
    assert.equal(f.state.current.options.recursive, false);
    assert.equal(f.state.current.transactionContext, undefined);
    assert.equal(f.state.current.internalPersistence, undefined);
    assert(!JSON.stringify([first, second]).includes('PRIVATE_RECEIPT'));
});

test('generated empty read qualifies only explicit successful count zero', async t => {
    const f = fixture(t);
    const result = await f.read();
    assert.deepEqual(result.entries, []);
    assert.deepEqual(result.completeness, { contractVersion: 1, tenant: 'runtime', enterpriseCode: 'issuer',
        promotionCode: 'campaign', totalCount: 0, returnedCount: 0, pageNumber: 1, pageSize: 100, complete: true });
    assert.equal(f.state.countCalls, 1);
    assert(f.state.hooks.some(hook => hook.count === 0));
    assert.equal(f.state.reads[0].options.limit, 100);
    f.state.afterGet = value => { delete value.count; };
    await assert.rejects(f.read(), error => error instanceof NodicsError &&
        error.code === unconfirmed.code && error.responseCode === '409');
});

test('full first page qualifies at exact bound but later empty pages never qualify completeness', async t => {
    const f = fixture(t, [row('b'), row('a')]);
    const result = await f.read({ pageSize: 2 });
    assert.equal(result.completeness.complete, true);
    assert.equal(result.completeness.totalCount, 2);
    const later = await f.read({ pageSize: 2, pageNumber: 3 });
    assert.deepEqual(later.entries, []);
    assert.equal(later.completeness.totalCount, 2);
    assert.equal(later.completeness.complete, false);
});

test('legacy unscoped UI reads retain rows without asserting issuer scope', async t => {
    const f = fixture(t, [row('a'), row('b', { enterpriseCode: 'other' }), row('c', { enterpriseCode: undefined })]);
    const result = await f.read({}, { enterpriseCode: undefined });
    assert.equal(result.entries.length, 3);
    assert.equal(result.completeness.enterpriseCode, null);
    assert.equal(result.completeness.complete, true);
    assert.equal('enterpriseCode' in f.state.reads[0].query, false);
});

test('invalid pagination and transaction contexts refuse before generated dispatch', async t => {
    const f = fixture(t);
    for (const query of [{ pageSize: 0 }, { pageSize: 1001 }, { pageSize: 1.5 }, { pageSize: null },
        { pageSize: true }, { pageSize: [] }, { pageSize: '2x' }, { pageNumber: 0 }, { pageNumber: null },
        { pageNumber: -1 }, { pageNumber: 1.5 }, { pageNumber: Number.MAX_SAFE_INTEGER, pageSize: 1000 }])
        await assert.rejects(f.read(query), unconfirmed);
    await assert.rejects(f.read({}, { transactionContext: {} }), unconfirmed);
    await assert.rejects(f.read({}, { internalPersistence: 'DURABLE_JOURNAL' }), unconfirmed);
    assert.equal(f.state.findCalls, 0);
});

test('malformed generated envelopes and counts never imply empty or complete evidence', async t => {
    const f = fixture(t, [row('a')]);
    for (const change of [result => { delete result.code; }, result => { result.code = 'ERR_FIND_00000'; },
        result => { result.error = { code: 'ERR_FIND_00000' }; }, result => { delete result.count; },
        result => { result.count = '1'; }, result => { result.count = -1; }, result => { result.count = 0.5; },
        result => { result.count = NaN; }, result => { result.count = Infinity; }, result => { result.count = null; },
        result => { result.count = Number.MAX_SAFE_INTEGER + 1; }, result => { result.result = {}; },
        result => { result.count = 0; }, result => { result.count = 2; }, result => { delete result.options; },
        result => { result.options.skip = 1; }, result => { result.options.limit = 2; },
        result => { result.success = false; }, result => { result.errors = ['failed']; }]) {
        f.state.afterGet = change;
        await assert.rejects(f.read(), unconfirmed);
    }
});

test('unavailable native count never falls back to returned row length for protected ledger', async t => {
    const f = fixture(t, [row('a')]);
    delete NODICS.getModels().promotionBudgetLedgerModel.countDocuments;
    await assert.rejects(f.read(), { code: 'ERR_AUTH_00003' });
    assert.equal(f.state.countCalls, 0);
});

test('missing protected read owner refuses before any cursor or count', async t => {
    const f = fixture(t, [row('a')]);
    delete SERVICE.DefaultPromotionBudgetMutationService;
    await assert.rejects(f.read(), { code: 'ERR_AUTH_00003' });
    assert.equal(f.state.findCalls, 0);
    assert.equal(f.state.countCalls, 0);
});

test('foreign or duplicate projected rows refuse after the real generated read', async t => {
    const f = fixture(t, [row('a'), row('b')]);
    for (const change of [result => { result.result[0].tenant = 'other'; },
        result => { result.result[0].enterpriseCode = 'other'; },
        result => { result.result[0].promotionCode = 'other'; },
        result => { result.result[0].code = result.result[1].code; }]) {
        f.state.afterGet = change;
        await assert.rejects(f.read(), unconfirmed);
    }
});

test('missing generated owner refuses and later-layer read override retains the default invariant', async t => {
    const f = fixture(t, [row('a')]);
    let invoked = false;
    const override = { ...operation, budgetLedger: async function (request) {
        invoked = true;
        return operation.budgetLedger.call(this, request);
    } };
    assert.equal((await override.budgetLedger({ tenant: 'runtime', enterpriseCode: 'issuer', promotionCode: 'campaign' })).completeness.complete, true);
    assert(invoked);
    delete SERVICE.DefaultPromotionBudgetLedgerService;
    await assert.rejects(f.read(), unconfirmed);
});
