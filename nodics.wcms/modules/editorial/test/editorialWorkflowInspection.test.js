/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module editorial/test/editorialWorkflowInspection
 * @description Composes the HTTP controller, facade and scoped source owner to inspect only the saved article review without writes or caller-selected workflow authority.
 * @layer test
 * @owner editorial
 * @override Extend read-only review cases while preserving source correlation and original employee scope.
 */
const assert = require('node:assert/strict');
const { test, afterEach } = require('node:test');
const statuses = require('../src/utils/statusDefinitions');
const controller = require('../src/controller/defaultEditorialAuthoringController');
const facade = require('../src/facade/defaultEditorialAuthoringFacade');
const adapter = require('../src/service/defaultEditorialWorkflowAdapterService');
const drafts = require('../src/service/defaultEditorialDraftCommandService');
const previous = Object.fromEntries(['CLASSES', 'CONFIG', 'SERVICE', 'FACADE', 'fetch'].map(key => [key, global[key]]));
class NodicsError extends Error {
    constructor(code, detail) {
        super((statuses[code]?.message || code) + (detail ? ': ' + detail : ''));
        this.code = code;
        this.responseCode = Number(statuses[code]?.code || 500);
    }
}
afterEach(() => Object.assign(global, previous));
function fixture() {
    const article = { code: 'local-article', revision: 4, status: 'WITHDRAWN', workflowInstanceCode: 'editorial-local-article-r4' };
    const reads = [], calls = [];
    const authData = { principalType: 'human', tokenType: 'access', type: 'Employee', tenant: 'tenant-one', enterpriseCode: 'enterprise-one', loginId: 'reviewer', userGroups: ['employeeUserGroup'] };
    const request = { tenant: 'tenant-one', authData, httpRequest: { params: { articleCode: article.code }, headers: { authorization: 'Bearer original-actor', tenant: 'tenant-one', 'x-enterprise-code': 'enterprise-one' }, body: { workflowInstanceCode: 'foreign-instance', article: { code: 'foreign-article', revision: 99 } } } };
    global.CLASSES = { NodicsError };
    global.CONFIG = { get: () => ({ publication: { runtimeRole: 'STAGED' }, workflow: { processBaseUrl: 'http://process.local' } }) };
    global.SERVICE = {
        DefaultEditorialWorkflowAdapterService: adapter,
        DefaultEditorialDraftCommandService: drafts,
        DefaultSecuredRequestPipelineService: {
            getEffectiveUserGroupCodes: groups => groups,
            getGrantedPermissions: () => ['editorial.workflow.read'],
            isPermissionGranted: (permission, permissions) => permissions.includes(permission),
        },
        DefaultEditorialArticleService: {
            get: async input => { reads.push(input); return { code: 'SUC_SYS_00000', result: [structuredClone(article)] }; },
            update: () => { throw new Error('Inspection must never write'); },
        },
    };
    global.FACADE = { DefaultEditorialAuthoringFacade: facade };
    global.fetch = async (url, options) => {
        calls.push({ url, options });
        return { ok: true, status: 200, text: async () => JSON.stringify({ data: { instance: { code: 'editorial-local-article-r4', status: 'COMPLETED', context: { ownerModule: 'editorial', articleCode: 'local-article', articleRevision: 4 } }, tasks: [], auditEvents: [] } }) };
    };
    return { article, reads, calls, request };
}
test('HTTP GET resolves the saved review, ignores caller pointers and retains original scoped read authority', async () => {
    const f = fixture();
    const result = await controller.inspectWorkflow(f.request);
    assert.equal(result.instance.code, 'editorial-local-article-r4');
    assert.equal(result.instance.status, 'COMPLETED');
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].url, 'http://process.local/nodics/process/v0/instances/editorial-local-article-r4/detail');
    assert.equal(f.calls[0].options.method, 'GET');
    assert.equal(f.calls[0].options.body, undefined);
    assert.equal(f.calls[0].options.headers.authorization, 'Bearer original-actor');
    assert.equal(f.calls[0].options.headers['x-enterprise-code'], 'enterprise-one');
    assert.equal(f.reads.length, 2);
    for (const read of f.reads) {
        assert.equal(read.tenant, 'tenant-one');
        assert.equal(read.authData, f.request.authData);
        assert.deepEqual(read.query, { code: 'local-article' });
    }
});
test('an uncertain source transition inspects only the deterministic current saved revision without starting a review', async () => {
    const f = fixture();
    delete f.article.workflowInstanceCode;
    f.article.status = 'READY';
    assert.equal((await controller.inspectWorkflow(f.request)).instance.code, 'editorial-local-article-r4');
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].options.method, 'GET');
});
test('typed remote instance absence is a review-specific 404 and never an article-not-found or uncertain outcome', async () => {
    const f = fixture();
    global.fetch = async (url, options) => {
        f.calls.push({ url, options });
        return { ok: false, status: 404, text: async () => JSON.stringify({ code: 'ERR_PROCESS_00007' }) };
    };
    await assert.rejects(controller.inspectWorkflow(f.request), { code: 'ERR_EDT_00013', responseCode: 404 });
    assert.equal(f.calls.length, 1);
});
test('colocated inspection uses the same source correlation and typed absence without HTTP', async () => {
    const f = fixture();
    global.SERVICE.DefaultProcessRuntimeLifecycleService = { getInstanceDetail: async input => {
        assert.equal(input.instanceCode, 'editorial-local-article-r4');
        assert.equal(input.authData, f.request.authData);
        throw Object.assign(new Error('absent'), { code: 'ERR_PROCESS_00007' });
    } };
    await assert.rejects(controller.inspectWorkflow(f.request), { code: 'ERR_EDT_00013', responseCode: 404 });
    assert.deepEqual(f.calls, []);
});
for (const kind of ['permission', 'missing-source', 'ambiguous-source', 'foreign-reference', 'invalid-revision']) {
    test(`${kind} fails before any Process read`, async () => {
        const f = fixture();
        if (kind === 'permission') global.SERVICE.DefaultSecuredRequestPipelineService.getGrantedPermissions = () => [];
        if (kind === 'missing-source') global.SERVICE.DefaultEditorialArticleService.get = async () => ({ code: 'SUC_SYS_00000', result: [] });
        if (kind === 'ambiguous-source') global.SERVICE.DefaultEditorialArticleService.get = async () => ({ code: 'SUC_SYS_00000', result: [f.article, f.article] });
        if (kind === 'foreign-reference') f.article.workflowInstanceCode = 'editorial-other-article-r4';
        if (kind === 'invalid-revision') f.article.revision = 0;
        await assert.rejects(controller.inspectWorkflow(f.request));
        assert.deepEqual(f.calls, []);
    });
}
for (const kind of ['foreign-instance', 'foreign-context', 'changed-source']) {
    test(`${kind} cannot return misleading review evidence`, async () => {
        const f = fixture();
        const fetchDetail = global.fetch;
        global.fetch = async (...args) => {
            const response = await fetchDetail(...args);
            const data = JSON.parse(await response.text());
            if (kind === 'foreign-instance') data.data.instance.code = 'editorial-foreign-r4';
            if (kind === 'foreign-context') data.data.instance.context.articleCode = 'foreign';
            if (kind === 'changed-source') f.article.revision = 5;
            return { ...response, text: async () => JSON.stringify(data) };
        };
        await assert.rejects(controller.inspectWorkflow(f.request), { code: 'ERR_EDT_00008' });
        assert.equal(f.calls.length, 1);
    });
}
for (const [status, code] of [[401, 'ERR_EDT_00012'], [403, 'ERR_EDT_00011'], [500, 'ERR_EDT_00010']]) {
    test(`inspection preserves Process ${status} without turning it into absent review evidence`, async () => {
        const f = fixture();
        global.fetch = async () => ({ ok: false, status, text: async () => '{}' });
        await assert.rejects(controller.inspectWorkflow(f.request), { code });
    });
}
