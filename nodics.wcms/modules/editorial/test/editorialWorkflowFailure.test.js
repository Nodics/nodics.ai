/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module editorial/test/editorialWorkflowFailure
 * @description Distinguishes missing review setup, denials and uncertain Process outcomes without changing article state or replaying commands.
 * @layer test
 * @owner editorial
 * @override Extend failure fixtures while retaining owner status, exact scope and no-write assertions.
 */
const assert = require('node:assert/strict');
const { test, afterEach } = require('node:test');
const statuses = require('../src/utils/statusDefinitions');
const adapter = require('../src/service/defaultEditorialWorkflowAdapterService');
const previous = { CLASSES: global.CLASSES, CONFIG: global.CONFIG, SERVICE: global.SERVICE, fetch: global.fetch };
class NodicsError extends Error {
    constructor(code, detail) {
        super((statuses[code]?.message || code) + (detail ? ': ' + detail : ''));
        this.code = code;
        this.responseCode = Number(statuses[code]?.code || 500);
    }
}
afterEach(() => Object.assign(global, previous));
function fixture() {
    const article = { code: 'local-article', status: 'READY', revision: 3, internalName: 'Local article', contentTypeCode: 'BLOG' };
    const updates = [];
    const calls = [];
    global.CLASSES = { NodicsError };
    global.CONFIG = { get: () => ({ workflow: { definitionCode: 'editorialApproval', processBaseUrl: 'http://process.local' } }) };
    global.SERVICE = {
        ...require('./helpers/editorialOwnerServices.js'),
        DefaultEditorialArticleAuthoringService: { storedInput: async () => ({ article, contentType: {}, policy: {}, localizations: [] }) },
        DefaultEditorialReadinessService: { evaluate: () => ({ ready: true }) },
        DefaultEditorialArticleService: { update: async request => { updates.push(request); return { modifiedCount: 1 }; } },
    };
    const request = { tenant: 'tenant-one', httpRequest: { headers: { authorization: 'Bearer original-actor', tenant: 'tenant-one', 'x-enterprise-code': 'enterprise-one' } } };
    global.fetch = async (url, options) => { calls.push({ url, options }); return { ok: false, status: 404, text: async () => JSON.stringify({ code: 'ERR_PROCESS_00002', message: 'Process definition was not found' }) }; };
    return { article, updates, calls, request };
}
test('a missing remote definition reports incomplete setup, retains the READY revision and sends only one scoped command', async () => {
    const f = fixture();
    await assert.rejects(adapter.submit(f.request), error => error.code === 'ERR_EDT_00009' && error.responseCode === 409 && /Initialization data/.test(error.message) && !/article was not found/i.test(error.message));
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].options.headers.authorization, 'Bearer original-actor');
    assert.equal(f.calls[0].options.headers.tenant, 'tenant-one');
    assert.equal(f.calls[0].options.headers['x-enterprise-code'], 'enterprise-one');
    assert.equal(JSON.parse(f.calls[0].options.body).instanceCode, 'editorial-local-article-r3');
    assert.deepEqual(f.updates, []);
    assert.equal(f.article.status, 'READY');
});
test('the colocated typed missing-definition error receives the same setup projection without a network call', async () => {
    const f = fixture();
    global.SERVICE.DefaultProcessRuntimeLifecycleService = { startInstance: async () => { throw Object.assign(new Error('missing'), { code: 'ERR_PROCESS_00002' }); } };
    await assert.rejects(adapter.submit(f.request), { code: 'ERR_EDT_00009', responseCode: 409 });
    assert.deepEqual(f.calls, []);
    assert.deepEqual(f.updates, []);
});
for (const [status, code] of [[401, 'ERR_EDT_00012'], [403, 'ERR_EDT_00011']]) {
    test(`remote ${status} remains a denial even when the response body is not JSON`, async () => {
        const f = fixture();
        let calls = 0;
        global.fetch = async () => { calls++; return { ok: false, status, text: async () => { throw new Error('Denial body must not be consumed'); } }; };
        await assert.rejects(adapter.submit(f.request), { code, responseCode: status });
        assert.equal(calls, 1);
        assert.deepEqual(f.updates, []);
    });
}
for (const kind of ['network', 'malformed', 'upstream', 'other-not-found']) {
    test(`${kind} outcomes stay unconfirmed, never echo diagnostics and never update the saved article`, async () => {
        const f = fixture();
        let calls = 0;
        global.fetch = async () => {
            calls++;
            if (kind === 'network') throw new Error('private-provider-diagnostic');
            return { ok: kind === 'malformed', status: kind === 'other-not-found' ? 404 : kind === 'malformed' ? 200 : 500, text: async () => kind === 'malformed' ? '<html>private-provider-diagnostic</html>' : JSON.stringify({ code: 'ERR_PROCESS_00003', message: 'private-provider-diagnostic' }) };
        };
        await assert.rejects(adapter.submit(f.request), error => error.code === 'ERR_EDT_00010' && error.responseCode === 502 && !error.message.includes('private-provider-diagnostic') && /inspect/.test(error.message));
        assert.equal(calls, 1);
        assert.deepEqual(f.updates, []);
    });
}
test('a missing open review task requests saved-revision inspection rather than claiming the article is missing', async () => {
    const f = fixture();
    Object.assign(f.article, { status: 'IN_REVIEW', workflowInstanceCode: 'editorial-local-article-r3' });
    global.SERVICE.DefaultProcessOperationsInspectionService = { listTasks: async () => [] };
    await assert.rejects(adapter.decideReview({ editorial: { article: { ...f.article, status: 'IN_REVIEW', workflowInstanceCode: 'editorial-local-article-r3' } } }, 'APPROVE'), { code: 'ERR_EDT_00008', responseCode: 409 });
    assert.deepEqual(f.updates, []);
});
