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
global.CONFIG = { get: name => name === 'editorial' ? { publication: { runtimeRole: 'STAGED', maximumDependencies: 500 }, workflow: { definitionCode: 'editorialApproval', processBaseUrl: 'http://process.local/' } } : {} };
let articleUpdates = [];
global.SERVICE = {
        ...require('./helpers/editorialOwnerServices.js'),
    DefaultEditorialReadinessService: { evaluate: () => ({ ready: true }) },
    DefaultEditorialArticleAuthoringService: require('../src/service/defaultEditorialArticleAuthoringService'),
    DefaultModelsUpdateInitializerService: require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService'),
    DefaultEditorialArticleService: {
        get: async () => ({ result: [{ code: 'article', internalName: 'Article', contentTypeCode: 'NEWS', status: 'READY', revision: 3 }] }),
        update: request => { articleUpdates.push(request); return Promise.resolve({ modifiedCount: 1 }); }
    },
    DefaultEditorialArticleLocalizationService: { get: async () => ({ result: [] }) },
    DefaultEditorialContentTypeService: { get: async () => ({ result: [{ code: 'NEWS', active: true }] }) },
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
    assert.equal(articleUpdates[0].model.$unset, undefined, 'review submission never clears retained publication ownership');
    assert.equal(adapter.applyDecision({ code: 'article', revision: 3 }, { articleRevision: 3, action: 'APPROVE' }).status, 'APPROVED');
    assert.equal(adapter.applyDecision({ code: 'article', revision: 3 }, { articleRevision: 3, action: 'REJECT', reason: '  Clarify the scope.  ' }).decisionEvidence.reason, 'Clarify the scope.');
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
    const readyArticle = global.SERVICE.DefaultEditorialArticleService.get;
    global.SERVICE.DefaultEditorialArticleService.get = async () => ({ result: [{ code: 'article', contentTypeCode: 'NEWS', status: 'IN_REVIEW', revision: 3, workflowInstanceCode: 'editorial-article-r3' }] });
    let reviewResult = await adapter.decideReview({ editorial: { article: { code: 'article', revision: 3, status: 'IN_REVIEW', workflowInstanceCode: 'editorial-article-r3' } }, httpRequest: { body: {} } }, 'APPROVE');
    assert.equal(reviewResult.article.status, 'APPROVED');
    assert.deepEqual(reviewCalls.map(item => item.operation), ['claim', 'complete']);
    await assert.rejects(adapter.decideReview({ editorial: { article: { code: 'article', revision: 2, status: 'IN_REVIEW', workflowInstanceCode: 'editorial-article-r3' } } }, 'APPROVE'));
    assert.equal(reviewCalls.length, 2);
    global.SERVICE.DefaultEditorialArticleService.get = readyArticle;

    let calls = [];
    let originalFetch = global.fetch;
    global.fetch = async (url, options) => {
        calls.push({ url, options });
        return { ok: true, text: async () => JSON.stringify({ data: { instance: { code: 'editorial-article-r3' } } }) };
    };
    delete global.SERVICE.DefaultProcessRuntimeLifecycleService;
    let remoteResult = await adapter.submit(Object.assign({}, request, {
        httpRequest: { headers: { authorization: 'Bearer token', tenant: 'default', 'x-enterprise-code': 'default' } }
    }));
    assert.equal(remoteResult.workflowInstanceCode, 'editorial-article-r3');
    assert.equal(calls[0].url, 'http://process.local/nodics/process/v0/instances');
    assert.equal(calls[0].options.headers.authorization, 'Bearer token');
    assert.equal(JSON.parse(calls[0].options.body).definitionCode, 'editorialApproval');
    global.fetch = originalFetch;
})().catch(error => { console.error(error); process.exitCode = 1; });
