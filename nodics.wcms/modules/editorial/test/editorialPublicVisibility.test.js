/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/test/editorialPublicVisibility @description Qualifies public scope, embargo, bounded reads and ambiguity failures independently of runtime data. @layer test @owner editorial */
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/defaultEditorialDeliveryService');

function setup(t) {
    const original = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    t.after(() => Object.assign(global, original));
    const calls = [], request = { tenant: 'tenantA', authData: Object.freeze({ principalId: 'trusted-delivery' }),
        delivery: { siteCode: 'siteA', localeCode: 'ar', channel: 'web', slug: 'story' } };
    const state = { result: { code: 'SUC_FIND_00000', result: [] } };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.CONFIG = { get: key => key === 'editorial' ? require('../config/properties').editorial : undefined };
    global.SERVICE = { DefaultEditorialOnlineArticleService: { get: async input => { calls.push(input); return state.result; } } };
    return { request, calls, state };
}

test('public visibility always binds trusted site/language, active current status and all three date windows', t => {
    const f = setup(t), query = service.visibilityQuery(f.request, { contentTypeCode: 'NEWS' });
    assert.equal(query.siteCode, 'siteA'); assert.equal(query.localeCode, 'ar'); assert.equal(query.active, true); assert.equal(query.status, 'CURRENT');
    assert.equal(query.contentTypeCode, 'NEWS'); assert.equal(query.$and.length, 3);
    for (const [index, field, operator] of [[0, 'embargoAt', '$lte'], [1, 'publishFrom', '$lte'], [2, 'publishUntil', '$gt']]) {
        assert.equal(query.$and[index].$or[0]['payload.' + field], null);
        assert(query.$and[index].$or[1]['payload.' + field][operator] instanceof Date);
    }
    const at = query.$and[0].$or[1]['payload.embargoAt'].$lte.getTime();
    const visible = payload => query.$and.every(clause => clause.$or.some(condition => Object.entries(condition).every(([key, expected]) => {
        const actual = payload[key.slice('payload.'.length)];
        if (expected === null) return actual == null;
        return '$lte' in expected ? new Date(actual).getTime() <= expected.$lte.getTime() : new Date(actual).getTime() > expected.$gt.getTime();
    })));
    assert.equal(visible({}), true);
    assert.equal(visible({ embargoAt: new Date(at + 60000) }), false);
    assert.equal(visible({ embargoAt: new Date(at - 60000) }), true);
    assert.equal(visible({ publishFrom: new Date(at + 60000) }), false);
    assert.equal(visible({ publishUntil: new Date(at - 60000) }), false);
});

test('public filters cannot inject operators, replace visibility or select a foreign scope', async t => {
    const f = setup(t);
    for (const filters of [{ status: 'SUPERSEDED' }, { siteCode: 'other' }, { localeCode: 'en' }, { active: false }, { $and: [] }, { slug: { $ne: null } }, { 'payload.authorCodes': { $in: ['someone'] } }, []]) {
        f.request.delivery.filters = filters;
        await assert.rejects(service.list(f.request));
    }
    for (const value of [{ $ne: null }, '', ' siteA ']) {
        await assert.rejects(service.list({ ...f.request, delivery: { ...f.request.delivery, siteCode: value } }));
    }
    assert.equal(f.calls.length, 0);
});

test('bounded listing preserves original tenant/principal and admits supported inert component filters', async t => {
    const f = setup(t); f.request.delivery.limit = '9999';
    f.request.delivery.filters = { 'payload.featuredMediaCode': { $ne: null }, 'payload.authorCodes': 'authorA' };
    f.state.result.result = [{ payload: { title: 'Approved public copy' } }];
    const result = await service.list(f.request);
    assert.equal(result.limit, 100); assert.equal(result.items[0].title, 'Approved public copy');
    assert.equal(f.calls[0].tenant, 'tenantA'); assert.equal(f.calls[0].authData, f.request.authData);
    assert.equal(f.calls[0].searchOptions.limit, 100);
    for (const limit of [0, -1, 1.5, 'invalid', {}]) {
        await assert.rejects(service.list({ ...f.request, delivery: { ...f.request.delivery, limit } }));
    }
});

test('failed or malformed owner reads are unavailable evidence, never an empty successful catalogue', async t => {
    const f = setup(t);
    for (const response of [null, {}, { code: 'ERR_AUTH_00003', result: [] }, { code: 'SUC_FIND_00000', success: false, result: [] }, { code: 'SUC_FIND_00000', result: {} }, { code: 'SUC_FIND_00000', result: [{}] }]) {
        f.state.result = response;
        await assert.rejects(service.list(f.request)); await assert.rejects(service.detail(f.request));
    }
});

test('duplicate public slug is an explicit ambiguity failure and a confirmed absence remains not found', async t => {
    const f = setup(t);
    await assert.rejects(service.detail(f.request), error => error.code === 'ERR_EDT_00003');
    f.state.result.result = [{ payload: { title: 'One' } }, { payload: { title: 'Two' } }];
    await assert.rejects(service.detail(f.request), error => error.code === 'ERR_EDT_00008');
    assert.equal(f.calls.at(-1).searchOptions.limit, 2);
});
