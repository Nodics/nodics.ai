/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nPublish/test/publicationApprovalBridge @description Isolated approval bridge security, scope, transition and replay contracts over the real publication lifecycle. @layer test @owner nPublish */
const assert = require('node:assert/strict');
const { test, after } = require('node:test');
const workflow = require('../src/service/defaultPublicationApprovalWorkflowService');
const callback = require('../src/service/defaultPublicationApprovalCallbackService');
const lifecycle = require('../src/service/defaultPublicationLifecycleService');
const defaults = require('../config/properties');
const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
after(() => {
    Object.entries(previous).forEach(([key, value]) => {
        if (value === undefined) delete global[key];
        else global[key] = value;
    });
});

function fixture(domain = 'example', owner = 'exampleOwner') {
    const policy = { ownerModule: owner, definitionCode: 'exampleReview',
        actionKey: owner + '.applyPublicationDecision', sourceRuntimeRole: 'EXAMPLE_STAGED' };
    const settings = structuredClone(defaults);
    settings.runtimeRole = { code: 'EXAMPLE_STAGED', publication: 'STAGED' };
    settings.publish.approvalWorkflow = { domains: { [domain]: policy },
        target: { connectionName: 'process', connectionType: 'abstract', runtimeRole: 'PROCESS', timeoutMs: 5000 } };
    global.CONFIG = { get: key => settings[key] };
    global.CLASSES = { NodicsError: class extends Error {
        constructor(code, message) { super(message); this.code = code; }
    } };
    const calls = [];
    let stored = { code: 'catalogue-release', domain, rootType: 'catalogue', rootCode: 'catalogue-a',
        sourceVersion: 'immutable-1', correlationId: 'correlation-a', revision: 3,
        state: 'PENDING_APPROVAL', auditTrail: [], entCode: 'enterprise-a' };
    stored.workflowRef = workflow.reference(stored);
    const auth = { tenant: 'tenant-a', entCode: 'enterprise-a', runtimeInstanceId: 'process-instance-a',
        principalId: 'process-principal-a', userGroups: ['userGroup'] };
    const request = { tenant: 'tenant-a', authData: auth,
        httpRequest: { body: { instanceCode: stored.workflowRef,
            executionCode: '00000000-0000-4000-8000-000000000001' } } };
    const context = workflow.context(stored, request);
    const execution = { instance: { code: stored.workflowRef, definitionCode: policy.definitionCode,
        version: 1, context }, executionCode: request.httpRequest.body.executionCode,
        nodeCode: 'apply', taskCode: 'review-task-a', actor: 'reviewer-a', body: { decision: { approved: true } } };
    const repository = {
        get: async (code, local) => {
            calls.push(['get', structuredClone(local)]);
            assert.equal(local.tenant, 'tenant-a');
            return code === stored.code ? structuredClone(stored) : null;
        },
        transitionWithAudit: async (item, expected, patch, audit, local) => {
            assert.equal(local.authData.isSystem, true);
            assert.equal(local.authData.principalId, 'process-principal-a');
            if (stored.revision !== expected) throw new CLASSES.NodicsError('ERR_PUB_00004', 'CAS conflict');
            const entry = Object.assign({}, audit, { revision: expected + 1 });
            stored = Object.assign({}, stored, patch, { revision: expected + 1,
                auditTrail: [...stored.auditTrail, entry] });
            calls.push(['transition', patch.state]);
            return structuredClone(stored);
        },
    };
    const provider = { getOnlineVersion: async () => null, activate: async () => {
        calls.push(['activate']);
        return { version: 'online-immutable-1' };
    } };
    settings.publish.providers.repositoryProvider = repository;
    settings.publish.providers.versionProviders = { [domain]: provider };
    settings.publish.providers.domainAdapters = { [domain]: {} };
    global.SERVICE = {
        DefaultPublicationApprovalWorkflowService: workflow,
        DefaultPublicationLifecycleService: Object.assign({}, lifecycle),
        DefaultServiceTokenService: { requireRuntimePrincipal: (input, module) => {
            calls.push(['principal', module]);
            assert.equal(input, request);
            assert.equal(module, 'workflow');
            return auth;
        } },
        DefaultIdentityGovernanceService: { getSystemAuthData: () => {
            calls.push(['elevate']);
            return { isSystem: true, userGroups: ['systemUserGroup'], permissions: [] };
        } },
        DefaultModuleService: { invokeModule: async options => {
            calls.push(['transport', options]);
            if (options.apiName === '/instances') return { instance: {
                code: options.requestBody.instanceCode, definitionCode: options.requestBody.definitionCode,
                version: 1, context: options.requestBody.context } };
            return structuredClone(execution);
        } },
    };
    return { settings, policy, request, execution, calls, provider, repository,
        scope: { domain, actionKey: policy.actionKey }, get stored() { return stored; },
        apply: () => callback.applyDecision(request, { domain, actionKey: policy.actionKey }) };
}

test('approval uses configured domain and original caller on the existing Process start API', async () => {
    const f = fixture('otherDomain', 'otherOwner');
    f.request.httpRequest.headers = { authorization: 'Bearer original-access-token' };
    const result = await workflow.requestApproval(f.stored, f.request);
    const transport = f.calls.find(call => call[0] === 'transport')[1];
    assert.equal(transport.apiName, '/instances');
    assert.equal(transport.header.Authorization, 'Bearer original-access-token');
    assert.equal(transport.local, false);
    assert.equal(transport.maxAttempts, 1);
    assert.equal(transport.requestBody.context.domain, 'otherDomain');
    assert.equal(result.instance.code, f.stored.workflowRef);
    assert.equal(f.calls.some(call => call[0] === 'elevate'), false);
    assert.equal(workflow.reference(f.stored), workflow.reference(structuredClone(f.stored)));
    assert.notEqual(workflow.reference({ ...f.stored, revision: 4 }), f.stored.workflowRef);
});

test('source start fails closed for missing caller, wrong role, missing policy and invalid Process response', async () => {
    for (const mutate of [
        () => {},
        f => { f.request.httpRequest.headers = { authorization: 'Bearer access' }; f.settings.runtimeRole.publication = 'ONLINE'; },
        f => { delete f.settings.publish.approvalWorkflow.domains.example; },
        f => { f.request.httpRequest.headers = { authorization: 'Bearer access' };
            SERVICE.DefaultModuleService.invokeModule = async () => ({ instance: { code: 'foreign' } }); },
    ]) {
        const f = fixture();
        mutate(f);
        await assert.rejects(workflow.requestApproval(f.stored, f.request));
        assert.equal(f.calls.some(call => call[0] === 'elevate'), false);
    }
});

test('claimed approval reaches Online through real lifecycle and preserves the incoming principal', async () => {
    const f = fixture();
    const original = structuredClone(f.request);
    assert.equal((await f.apply()).output.state, 'ONLINE');
    assert.deepEqual(f.calls.filter(call => call[0] === 'transition').map(call => call[1]),
        ['APPROVED', 'ACTIVATING', 'ONLINE']);
    assert.deepEqual(f.request, original);
    const transport = f.calls.find(call => call[0] === 'transport')[1];
    assert.equal(transport.header.Authorization, undefined);
    assert.deepEqual(transport.requestBody, { executionCode: original.httpRequest.body.executionCode,
        actionKey: f.policy.actionKey, sourceRuntimeInstanceId: 'process-instance-a' });
    assert.ok(f.calls.findIndex(call => call[0] === 'transport') < f.calls.findIndex(call => call[0] === 'elevate'));
    const evidence = f.stored.auditTrail[0].details.workflow;
    assert.equal(evidence.actor, 'reviewer-a');
    assert.equal(evidence.taskCode, 'review-task-a');
});

test('claimed rejection never activates and its committed replay is idempotent', async () => {
    const f = fixture();
    f.execution.body.decision = { approved: false, action: 'REJECT' };
    assert.equal((await f.apply()).output.state, 'REJECTED');
    assert.equal((await f.apply()).output.state, 'REJECTED');
    assert.equal(f.calls.filter(call => call[0] === 'transition').length, 1);
    assert.equal(f.calls.some(call => call[0] === 'activate'), false);
});

test('lost response retry with a fresh Process handle does not publish a second time', async () => {
    const f = fixture();
    await f.apply();
    f.request.httpRequest.body.executionCode = '00000000-0000-4000-8000-000000000002';
    f.execution.executionCode = f.request.httpRequest.body.executionCode;
    assert.equal((await f.apply()).output.state, 'ONLINE');
    assert.equal(f.calls.filter(call => call[0] === 'activate').length, 1);
});

test('callback rejects decision injection and scope injection before claiming or elevating', async () => {
    for (const mutate of [
        f => { f.request.httpRequest.body.approved = true; },
        f => { f.request.httpRequest.body.domain = 'other'; },
        f => { f.request.httpRequest.body.executionCode = 'forged'; },
        f => { f.scope.actionKey = 'otherOwner.applyPublicationDecision'; },
    ]) {
        const f = fixture();
        mutate(f);
        await assert.rejects(callback.applyDecision(f.request, f.scope));
        assert.equal(f.calls.some(call => ['transport', 'elevate', 'transition'].includes(call[0])), false);
    }
});

test('failed, expired or already consumed Process claim never grants local persistence authority', async () => {
    const f = fixture();
    SERVICE.DefaultModuleService.invokeModule = async () => { throw new Error('claim unavailable'); };
    await assert.rejects(f.apply(), /claim unavailable/);
    assert.equal(f.calls.some(call => ['elevate', 'get', 'transition'].includes(call[0])), false);
});

test('runtime principal denial stops before transport and local persistence', async () => {
    const f = fixture();
    SERVICE.DefaultServiceTokenService.requireRuntimePrincipal = () => { throw new Error('runtime denied'); };
    await assert.rejects(f.apply(), /runtime denied/);
    assert.deepEqual(f.calls, []);
});

test('claim response must bind source, definition, scope, completed task and execution handle', async () => {
    for (const mutate of [
        f => { delete f.execution.instance.definitionCode; },
        f => { f.execution.instance.definitionCode = 'wrong'; },
        f => { delete f.execution.instance.version; },
        f => { f.execution.instance.context.tenantCode = 'tenant-b'; },
        f => { f.execution.instance.context.enterpriseCode = 'enterprise-b'; },
        f => { f.execution.instance.context.sourceVersion = 'changed'; },
        f => { f.execution.instance.context.publicationCode = 'other'; },
        f => { f.execution.instance.context.publicationRevision = 4; },
        f => { f.execution.instance.context.correlationId = 'other'; },
        f => { f.execution.instance.context.actionKey = 'other'; },
        f => { f.execution.executionCode = 'other'; },
        f => { delete f.execution.taskCode; },
        f => { delete f.execution.actor; },
        f => { f.execution.body.decision = { approved: false, action: 'APPROVE' }; },
        f => { f.execution.body.decision = {}; },
    ]) {
        const f = fixture();
        mutate(f);
        await assert.rejects(f.apply());
        assert.equal(f.calls.some(call => ['elevate', 'transition'].includes(call[0])), false);
    }
});

test('persisted source/version/workflow/revision/scope changes reject without lifecycle mutations', async () => {
    for (const [key, value] of [['sourceVersion', 'other'], ['workflowRef', 'other'],
        ['revision', 4], ['correlationId', 'other'], ['entCode', 'enterprise-b'], ['rootCode', 'other']]) {
        const f = fixture();
        f.stored[key] = value;
        await assert.rejects(f.apply());
        assert.equal(f.calls.some(call => ['transition', 'activate'].includes(call[0])), false);
    }
});

test('replay requires exact journal evidence, not merely an Online or Approved status', async () => {
    for (const mutate of [
        f => { f.stored.auditTrail = []; },
        f => { f.stored.auditTrail[0].details.workflow.taskCode = 'another-task'; },
        f => { f.stored.revision += 1; },
        f => { f.execution.body.decision = { approved: false }; },
    ]) {
        const f = fixture();
        await f.apply();
        mutate(f);
        await assert.rejects(f.apply());
        assert.equal(f.calls.filter(call => call[0] === 'activate').length, 1);
    }
});

test('activation failure remains failed and requires a new approval cycle', async () => {
    const f = fixture();
    f.provider.activate = async () => { throw new Error('target unavailable'); };
    await assert.rejects(f.apply(), /target unavailable/);
    assert.equal(f.stored.state, 'FAILED');
    await assert.rejects(f.apply(), /new governed approval cycle/);
});

test('concurrent decisions use publication revision CAS; at most one activation commits', async () => {
    const f = fixture();
    const results = await Promise.allSettled([f.apply(), f.apply()]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(f.calls.filter(call => call[0] === 'activate').length, 1);
    assert.equal(f.stored.state, 'ONLINE');
});
