/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
class NodicsError extends Error {}
global.CLASSES = { NodicsError };
global.CONFIG = { get: name => name === 'editorial' ? { workflow: { definitionCode: 'editorialApproval', processBaseUrl: 'http://process.local/' } } : {} };
let articleUpdates = [];
global.SERVICE = {
    DefaultEditorialReadinessService: { evaluate: () => ({ ready: true }) },
    DefaultEditorialArticleService: { update: request => { articleUpdates.push(request); return Promise.resolve({ modified: 1 }); } },
    DefaultProcessRuntimeLifecycleService: { startInstance: request => Promise.resolve({ data: { instance: { code: request.runtimeOperation.instanceCode } } }) }
};
const adapter = require('../src/service/defaultEditorialWorkflowAdapterService');
(async () => {
    let request = { editorial: { article: { code: 'article', internalName: 'Article', contentTypeCode: 'NEWS', status: 'READY', revision: 3 }, localizations: [] }, requestId: 'request' };
    let result = await adapter.submit(request);
    assert.equal(result.workflowInstanceCode, 'editorial-article-r3');
    assert.equal(result.articleRevision, 3);
    assert.equal(result.article.status, 'IN_REVIEW');
    assert.equal(result.article.publicationCode, undefined);
    assert.equal(articleUpdates[0].model.$set.status, 'IN_REVIEW');
    assert.equal(articleUpdates[0].model.$set.workflowInstanceCode, 'editorial-article-r3');
    assert.equal(articleUpdates[0].model.$unset.publicationCode, '');
    assert.equal(adapter.applyDecision({ code: 'article', revision: 3 }, { articleRevision: 3, action: 'APPROVE' }).status, 'APPROVED');
    assert.throws(() => adapter.applyDecision({ code: 'article', revision: 4 }, { articleRevision: 3, action: 'APPROVE' }));

    let reviewCalls = [];
    global.SERVICE.DefaultProcessOperationsInspectionService = {
        listTasks: () => Promise.resolve([{ code: 'task-1', instanceCode: 'editorial-article-r3', status: 'OPEN' }])
    };
    global.SERVICE.DefaultProcessRuntimeLifecycleService.claimTask = request => {
        reviewCalls.push({ operation: 'claim', taskCode: request.taskCode });
        return Promise.resolve({ taskCode: request.taskCode });
    };
    global.SERVICE.DefaultProcessRuntimeLifecycleService.completeTask = request => {
        reviewCalls.push({ operation: 'complete', taskCode: request.taskCode, body: request.httpRequest.body });
        return Promise.resolve({ taskCode: request.taskCode, status: 'COMPLETED' });
    };
    let reviewResult = await adapter.decideReview({ editorial: { article: { code: 'article', revision: 3, status: 'IN_REVIEW', workflowInstanceCode: 'editorial-article-r3' } }, httpRequest: { body: {} } }, 'APPROVE');
    assert.equal(reviewResult.article.status, 'APPROVED');
    assert.deepEqual(reviewCalls.map(item => item.operation), ['claim', 'complete']);

    let calls = [];
    let originalFetch = global.fetch;
    global.fetch = async (url, options) => {
        calls.push({ url, options });
        return { ok: true, text: async () => JSON.stringify({ data: { instance: { code: 'remote-instance' } } }) };
    };
    delete global.SERVICE.DefaultProcessRuntimeLifecycleService;
    let remoteResult = await adapter.submit(Object.assign({}, request, {
        httpRequest: { headers: { authorization: 'Bearer token', tenant: 'default', 'x-enterprise-code': 'default' } }
    }));
    assert.equal(remoteResult.workflowInstanceCode, 'remote-instance');
    assert.equal(calls[0].url, 'http://process.local/nodics/process/v0/instances');
    assert.equal(calls[0].options.headers.authorization, 'Bearer token');
    assert.equal(JSON.parse(calls[0].options.body).definitionCode, 'editorialApproval');
    global.fetch = originalFetch;
})().catch(error => { console.error(error); process.exitCode = 1; });
