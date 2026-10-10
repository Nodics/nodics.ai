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
                version: options.requestBody.version || 1, context: options.requestBody.context } };
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

test('approval preserves native Process identity without implicitly enrolling in optional command receipts', async () => {
    const f = fixture('otherDomain', 'otherOwner');
    f.request.httpRequest.headers = { authorization: 'Bearer original-access-token' };
    const instanceCommands = require('../../../../nodics.process/modules/workflow/src/service/operation/defaultProcessInstanceCommandReceiptService');
    const receiptProtocol = require('../../nDatabase/database/src/service/schema/defaultModelCommandReceiptService');
    let nativeStarts = 0;
    SERVICE.DefaultModelCommandReceiptService = { ...receiptProtocol, enabled: () => false };
    SERVICE.DefaultProcessRuntimeLifecycleService = {
        bodyOf: request => request.httpRequest.body,
        assertCode: code => code,
        startInstance: async request => {
            nativeStarts += 1;
            const body = request.httpRequest.body;
            assert.equal(body.instanceCode, f.stored.workflowRef);
            return { instance: { code: body.instanceCode, definitionCode: body.definitionCode,
                version: body.version || 1, context: body.context } };
        }
    };
    SERVICE.DefaultModuleService.invokeModule = options => instanceCommands.execute({
        ...f.request,
        httpRequest: { body: options.requestBody, headers: options.idempotencyKey === undefined ? {} : { 'idempotency-key': options.idempotencyKey } }
    }, 'start');
    const result = await workflow.requestApproval(f.stored, f.request);
    assert.equal(nativeStarts, 1);
    assert.equal(result.instance.code, f.stored.workflowRef);
});

function requesterReader(f) {
    f.policy.reviewNodeCode = 'review';
    f.policy.reviewPermission = 'publish.lifecycle.approve';
    const invoke = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async options => {
        if (options.methodName !== 'GET') return invoke(options);
        const definition = { code: f.policy.definitionCode, ownerModule: f.policy.ownerModule,
            active: true, status: 'PUBLISHED', currentVersion: 2 };
        return options.apiName.endsWith('/versions') ? [{ definitionCode: definition.code,
            version: 2, active: true, status: 'PUBLISHED',
            policy: { actorPolicy: { permission: f.policy.reviewPermission,
                enterpriseContextField: 'enterpriseCode', requesterContextField: 'requestedBy' } },
            graph: { nodes: [{ code: 'review', type: 'TASK', policy: { decisionContract: {
                contractVersion: 1, kind: 'APPROVAL', approveLabel: 'Approve', rejectLabel: 'Reject',
                reasonLabel: 'Reason', rejectionReasonRequired: true, maximumReasonLength: 1000
            } } }] } }] : definition;
    };
}

async function bindRequester(f) {
    f.policy.requesterBinding = 'NATIVE_ACTOR';
    requesterReader(f);
    const human = { tenant: 'tenant-a', entCode: 'enterprise-a', tokenType: 'access',
        principalType: 'human', principalId: 'native-principal', loginId: 'maker@example.invalid' };
    const request = { tenant: 'tenant-a', authData: human,
        httpRequest: { headers: { authorization: 'Bearer human' }, body: { requestedBy: 'forged' } } };
    f.stored.requestedBy = human.principalId;
    const proof = await workflow.approvalEvidence(f.stored, request);
    f.stored.auditTrail.push({ toState: 'PENDING_APPROVAL', revision: f.stored.revision,
        details: { workflow: { ...proof, instanceCode: f.stored.workflowRef } } });
    f.execution.instance.context = workflow.context(f.stored, request);
    f.execution.instance.version = proof.workflowVersion;
    return request;
}

test('native requester uses stored publisher actor and authenticated login namespace, never body identity', async () => {
    const f = fixture();
    const human = await bindRequester(f);
    await workflow.requestApproval(f.stored, human);
    const transport = f.calls.find(call => call[0] === 'transport')[1];
    assert.equal(transport.requestBody.context.requestedBy, 'maker@example.invalid');
    assert.notEqual(transport.requestBody.context.requestedBy, f.stored.requestedBy);
    assert.equal(transport.requestBody.context.requestedActor, undefined);
    assert.equal(transport.requestBody.version, 2);
    assert.equal((await f.apply()).output.state, 'ONLINE');
    assert.equal((await f.apply()).output.state, 'ONLINE');
});

test('requester binding rejects wrong native actor, service/system callers and absent native login', async () => {
    for (const mutate of [
        request => { request.authData.principalId = 'foreign'; },
        request => { request.authData.tokenType = 'service'; },
        request => { request.authData.isSystem = true; },
        request => { delete request.authData.loginId; },
        request => { request.authData.entCode = 'foreign'; }
    ]) {
        const f = fixture();
        const human = await bindRequester(f);
        mutate(human);
        await assert.rejects(workflow.approvalEvidence(f.stored, human));
        assert.equal(f.calls.length, 0);
    }
});

test('real pending transition journals requester evidence atomically before Process transport', async () => {
    const f = fixture();
    f.policy.requesterBinding = 'NATIVE_ACTOR';
    requesterReader(f);
    f.settings.publish.providers.workflowProviders = { example: workflow };
    Object.assign(f.stored, { state: 'VALIDATED', revision: 2, requestedBy: 'native-principal' });
    const human = { tenant: 'tenant-a', expectedRevision: 2, publicationCode: f.stored.code,
        authData: { tenant: 'tenant-a', entCode: 'enterprise-a', tokenType: 'access',
            principalType: 'human', principalId: 'native-principal', loginId: 'maker' },
        httpRequest: { headers: { authorization: 'Bearer human' } } };
    f.repository.transitionWithAudit = async (item, expected, patch, audit) => {
        assert.equal(expected, 2);
        assert.equal(audit.details.workflow.requestedBy, 'maker');
        assert.equal(audit.details.workflow.requestedActor, item.requestedBy);
        assert.equal(f.calls.some(call => call[0] === 'transport'), false);
        Object.assign(f.stored, patch, { revision: 3 });
        f.stored.auditTrail.push({ ...audit, revision: 3 });
        return structuredClone(f.stored);
    };
    await SERVICE.DefaultPublicationLifecycleService.requestApproval(human);
    assert.equal(f.calls.find(call => call[0] === 'transport')[1].requestBody.context.requestedBy, 'maker');
});

test('claimed foreign requester and corrupted exact-revision journal cannot mutate publication', async () => {
    for (const mutate of [
        f => { f.execution.instance.context.requestedBy = 'foreign'; },
        f => { delete f.execution.instance.context.requestedBy; },
        f => { f.execution.instance.version = 1; },
        f => { delete f.stored.auditTrail[0].details.workflow.workflowVersion; },
        f => { f.stored.auditTrail[0].details.workflow.requestedActor = 'foreign'; },
        f => { f.stored.auditTrail.push(structuredClone(f.stored.auditTrail[0])); }
    ]) {
        const f = fixture();
        await bindRequester(f);
        mutate(f);
        await assert.rejects(f.apply());
        assert.equal(f.calls.some(call => call[0] === 'transition'), false);
    }
});

test('qualified start refuses an older pre-existing Process instance despite matching context', async () => {
    const f = fixture();
    const human = await bindRequester(f);
    SERVICE.DefaultModuleService.invokeModule = async options => ({ instance: {
        code: options.requestBody.instanceCode, definitionCode: options.requestBody.definitionCode,
        version: 1, context: options.requestBody.context
    } });
    await assert.rejects(workflow.requestApproval(f.stored, human), { code: 'ERR_PUB_00004' });
    assert.equal(f.calls.some(call => call[0] === 'transition'), false);
});

test('candidate denial, duplicate versions and pointer races stop before a pending write', async () => {
    for (const mode of ['denied', 'duplicate', 'legacy', 'race']) {
        const f = fixture();
        const human = await bindRequester(f);
        const original = SERVICE.DefaultModuleService.invokeModule;
        let definitions = 0;
        SERVICE.DefaultModuleService.invokeModule = async options => {
            if (mode === 'denied') throw new Error('read denied');
            const result = await original(options);
            if (Array.isArray(result)) {
                if (mode === 'duplicate') result.push(structuredClone(result[0]));
                if (mode === 'legacy') delete result[0].policy;
            } else if (++definitions === 2 && mode === 'race') result.currentVersion = 3;
            return result;
        };
        await assert.rejects(workflow.approvalEvidence(f.stored, human));
        assert.equal(f.calls.length, 0);
    }
});

test('legacy pending instances keep their old callback context but cannot silently start a new bound cycle', async () => {
    const f = fixture();
    f.policy.requesterBinding = 'NATIVE_ACTOR';
    requesterReader(f);
    f.stored.requestedBy = 'native-principal';
    const request = { tenant: 'tenant-a', authData: { tenant: 'tenant-a', entCode: 'enterprise-a',
        tokenType: 'access', principalType: 'human', principalId: 'native-principal', loginId: 'maker' },
        httpRequest: { headers: { authorization: 'Bearer human' } } };
    await assert.rejects(workflow.requestApproval(f.stored, request), { code: 'ERR_PUB_00004' });
    assert.equal(f.calls.length, 0);
    assert.equal((await f.apply()).output.state, 'ONLINE');
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

test('selected multi-enterprise deployment uses claimed business scope without rewriting signed identity', async () => {
    const f = fixture();
    Object.assign(f.request.authData, { entCode: 'deployment-owner', tokenType: 'service', principalType: 'service',
        runtimeScope: { instanceCode: 'process-instance-a' }, userGroups: [] });
    f.settings.publish.approvalWorkflow.runtimeEnterpriseScope = { enabled: true, enterpriseCodes: ['enterprise-a'] };
    const original = structuredClone(f.request);
    assert.equal((await f.apply()).output.state, 'ONLINE');
    assert.deepEqual(f.request, original);
    const local = f.calls.find(call => call[0] === 'get')[1];
    assert.equal(local.enterpriseCode, 'enterprise-a');
    assert.equal(local.authData.entCode, 'deployment-owner');
    assert.equal(local.authData.principalId, original.authData.principalId);
});

test('unselected or malformed multi-enterprise authority refuses before private persistence', async () => {
    for (const policy of [undefined, { enabled: false, enterpriseCodes: ['enterprise-a'] },
        { enabled: true, enterpriseCodes: ['foreign'] }, { enabled: true, enterpriseCodes: ['*'] },
        { enabled: true, enterpriseCodes: ['enterprise-a', 'enterprise-a'] }]) {
        const f = fixture();
        Object.assign(f.request.authData, { entCode: 'deployment-owner', tokenType: 'service', principalType: 'service',
            runtimeScope: { instanceCode: 'process-instance-a' }, userGroups: [] });
        f.settings.publish.approvalWorkflow.runtimeEnterpriseScope = policy;
        await assert.rejects(f.apply());
        assert.equal(f.calls.some(call => ['elevate', 'get', 'transition'].includes(call[0])), false);
    }
    const f = fixture();
    f.settings.publish.approvalWorkflow.runtimeEnterpriseScope = { enabled: true, enterpriseCodes: ['enterprise-a'] };
    assert.throws(() => workflow.context(f.stored, f.request, 'enterprise-a'));
});

test('legacy cross-enterprise journals require an independently qualified sealed source owner', async () => {
    for (const owner of [undefined, 'foreign', 'enterprise-a']) {
        const f = fixture();
        delete f.stored.entCode;
        Object.assign(f.request.authData, { entCode: 'deployment-owner', tokenType: 'service', principalType: 'service',
            runtimeScope: { instanceCode: 'process-instance-a' }, userGroups: [] });
        f.settings.publish.approvalWorkflow.runtimeEnterpriseScope = { enabled: true, enterpriseCodes: ['enterprise-a'] };
        if (owner !== undefined) f.provider.getPublicationEnterprise = async (publication, request) => {
            assert.equal(publication.sourceVersion, 'immutable-1');
            assert.equal(request.authData.entCode, 'deployment-owner');
            return owner;
        };
        if (owner === 'enterprise-a') {
            assert.equal((await f.apply()).output.state, 'ONLINE');
            assert.equal(f.stored.enterpriseCode, undefined);
            assert.equal(f.stored.entCode, undefined);
        } else {
            await assert.rejects(f.apply(), /sealed source owner/);
            assert.equal(f.calls.some(call => ['transition', 'activate'].includes(call[0])), false);
        }
    }
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
