/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module workflow/test/processRemoteActionAdapter @description Exercises the actual Process lifecycle, scoped remote claims and Editorial domain mutation using isolated stores. @layer test @owner workflow */
const assert = require('node:assert/strict');
const test = require('node:test');
const _ = require('lodash');
const registry = require('../src/service/operation/defaultProcessActionAdapterRegistryService');
const transport = require('../src/service/operation/defaultProcessRemoteActionAdapterService');
const lifecycle = require('../src/service/operation/defaultProcessRuntimeLifecycleService');
const defaults = require('../config/properties').process;
const editorialRoot = '../../../../nodics.wcms/modules/editorial/';
const controller = require(editorialRoot + 'src/controller/defaultEditorialProcessActionController');
const domain = require(editorialRoot + 'src/service/defaultEditorialWorkflowAdapterService');
const publication = require(editorialRoot + 'src/service/defaultEditorialPublicationService');
const editorialDefaults = require(editorialRoot + 'config/properties').editorial;
const tokenService = require('../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService');
const updateService = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService');
class NodicsError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
function principal(moduleName, instance) {
    return {
        tokenType: 'service',
        serviceId: instance,
        tenant: 'tenantA',
        entCode: 'enterpriseA',
        modules: [moduleName],
        runtimeInstanceId: instance,
        runtimeScope: {
            instanceCode: instance,
            projectCode: 'customerA',
            environmentCode: 'test',
            serverCode: instance,
            assignmentCode: instance + '-assignment',
        },
    };
}
const identity = require('../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultIdentityGovernanceService');
const identityDefaults = require('../../../../nodics.foundation/modules/nAuth/config/properties').identityGovernance;
const schemaAccess = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService');
const articleAccess = require(editorialRoot + 'config/properties').schemaPolicies.editorial.tenantOwned.accessGroups;
function fixture() {
    const settings = _.cloneDeep(defaults);
    settings.actionAdapters.allowedActions = ['editorial.applyDecision', 'editorial.publishApproved'];
    settings.remoteActions.targets = { editorial: { connectionName: 'contentStaged' } };
    let article = { code: 'article-1', revision: 2, workflowInstanceCode: 'review-1', status: 'IN_REVIEW' };
    let instance = {
        code: 'review-1',
        definitionCode: 'review',
        version: 1,
        status: 'WAITING',
        currentNode: 'task',
        context: { articleCode: 'article-1', articleRevision: 2 },
    };
    let task = {
        code: 'task-1',
        instanceCode: instance.code,
        nodeCode: 'task',
        status: 'CLAIMED',
        assignee: 'reviewer',
        approvalPolicy: { requiredApprovals: 2 },
    };
    const version = {
        definitionCode: 'review',
        version: 1,
        status: 'PUBLISHED',
        graph: {
            nodes: [
                { code: 'task', type: 'TASK' },
                {
                    code: 'decide',
                    type: 'ACTION',
                    action: { moduleName: 'editorial', operation: 'applyDecision' },
                },
                {
                    code: 'publish',
                    type: 'ACTION',
                    action: { moduleName: 'editorial', operation: 'publishApproved' },
                },
                { code: 'end', type: 'END' },
            ],
            transitions: [
                { source: 'task', target: 'decide' },
                { source: 'decide', target: 'end' },
            ],
        },
    };
    const processAuth = principal('workflow', 'process-1'),
        editorialAuth = principal('editorial', 'content-1');
    const request = {
        tenant: 'tenantA',
        authData: { loginId: 'reviewer', tenant: 'tenantA', entCode: 'enterpriseA' },
        taskCode: task.code,
        runtimeOperation: {
            decision: { approved: true, action: 'APPROVE', approvals: ['reviewer', 'secondReviewer'] },
        },
    };
    const state = {
        article,
        instance,
        task,
        version,
        settings,
        processAuth,
        editorialAuth,
        request,
        articleWrites: 0,
        internalAuthorizations: 0,
        publications: 0,
        callbacks: [],
        claims: [],
        beforeClaim: null,
        beforeCallback: null,
        failAfterMutation: false,
    };
    function matches(row, query) {
        return Object.entries(query || {}).every(([key, expected]) => {
            const actual = _.get(row, key);
            if (expected && typeof expected === 'object') {
                if ('$exists' in expected) return (actual !== undefined) === expected.$exists;
                if ('$gt' in expected) return actual > expected.$gt;
            }
            return _.isEqual(actual, expected);
        });
    }
    function service(row, kind) {
        function authorize(input) {
            if (kind !== 'article') return;
            assert.equal(input.authData.runtimeInstanceId, processAuth.runtimeInstanceId);
            assert.ok(schemaAccess.getAccessPoint(input.authData, articleAccess) >= 10);
        }
        return {
            get: async (input) => {
                authorize(input);
                return { result: input.tenant === 'tenantA' && matches(row, input.query) ? [_.cloneDeep(row)] : [] };
            },
            update: async (input) => {
                authorize(input);
                if (input.tenant !== 'tenantA' || !matches(row, input.query))
                    return { result: { modifiedCount: 0 } };
                for (const [key, value] of Object.entries(input.model.$set || input.model))
                    _.set(row, key, _.cloneDeep(value));
                if (kind === 'article') state.articleWrites++;
                return { result: { modifiedCount: 1 } };
            },
        };
    }
    global.CLASSES = { NodicsError };
    global.UTILS = { isBlank: _.isEmpty };
    global.CONFIG = {
        get: (key) => (key === 'process' ? settings : key === 'editorial' ? editorialDefaults : key === 'identityGovernance' ? identityDefaults : undefined),
    };
    global.NODICS = {
        getEnvironmentName: () => 'customerA',
        getSelectedEnvironmentName: () => 'test',
        getServerName: () => 'process-1',
        getInternalAuthToken: (tenant) => (tenant === 'tenantA' ? 'process-service-token' : undefined),
    };
    global.SERVICE = {
        DefaultIdentityGovernanceService: {
            getSystemAuthData: () => {
                state.internalAuthorizations++;
                assert.equal(instance.activeRemoteAction.status, 'CLAIMED');
                return identity.getSystemAuthData();
            },
        },
        DefaultServiceTokenService: tokenService,
        DefaultModelsUpdateInitializerService: updateService,
        DefaultProcessActionAdapterRegistryService: registry,
        DefaultProcessRemoteActionAdapterService: transport,
        DefaultProcessRuntimeLifecycleService: lifecycle,
        DefaultProcessInstanceService: service(instance),
        DefaultProcessTaskService: service(task),
        DefaultProcessDefinitionVersionService: service(version),
        DefaultEditorialArticleService: service(article, 'article'),
        DefaultProcessAuditEventService: { save: async (input) => ({ result: input.model }) },
        DefaultProcessIncidentService: { save: async (input) => ({ result: input.model }) },
        DefaultEditorialWorkflowAdapterService: domain,
        DefaultEditorialPublicationService: publication,
        DefaultAuthorizationProviderService: {
            authorizeToken: async (input) => {
                assert.equal(input.authToken, 'process-service-token');
                return { result: processAuth };
            },
        },
        DefaultModuleRegistrationAgentService: { getInstanceId: () => 'process-1' },
        DefaultPublicationLifecycleService: {
            get: async () => ({ state: 'ONLINE' }),
            publishApproved: async (input) => {
                state.publications++;
                return { code: input.publication.code, state: 'PUBLISHED' };
            },
        },
        DefaultModuleService: {
            invokeModule: async (options) => {
                assert.equal(options.local, false);
                assert.equal(options.maxAttempts, 1);
                if (options.moduleName === 'editorial') {
                    assert.equal(options.header.Authorization, 'Bearer process-service-token');
                    assert.equal(options.connectionName, 'contentStaged');
                    state.callbacks.push(_.cloneDeep(options.requestBody));
                    if (state.beforeCallback) await state.beforeCallback(options);
                    const callbackRequest = {
                        tenant: 'tenantA',
                        authData: processAuth,
                        httpRequest: { body: options.requestBody },
                    };
                    const result = await (options.apiName.endsWith('applyDecision')
                        ? controller.applyDecision(callbackRequest)
                        : controller.publishApproved(callbackRequest));
                    if (state.failAfterMutation) throw Error('response lost');
                    return result;
                }
                assert.equal(options.moduleName, 'workflow');
                assert.equal(
                    options.header.Authorization,
                    undefined,
                    'nService must use the target domain runtime credential, not forward the Process caller',
                );
                state.claims.push(_.cloneDeep(options.requestBody));
                if (state.beforeClaim) await state.beforeClaim(options);
                const claimed = await transport.claim({
                    tenant: options.tenant,
                    authData: editorialAuth,
                    instanceCode: decodeURIComponent(options.apiName.split('/')[2]),
                    runtimeOperation: options.requestBody,
                });
                return options.responseSelector(claimed);
            },
        },
    };
    return state;
}
function execution(f, node = 'decide') {
    return {
        instance: f.instance,
        version: f.version,
        node: f.version.graph.nodes.find((value) => value.code === node),
        decision: { action: 'REJECT', approved: false },
    };
}
function completedTask(f) {
    Object.assign(f.task, {
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: 'reviewer',
        decision: f.request.runtimeOperation.decision,
    });
}

test('actual task policy governs the remote callback and stored decision wins over caller input', async () => {
    const f = fixture();
    await assert.rejects(
        lifecycle.completeTask({ ...f.request, runtimeOperation: { decision: { approved: true } } }),
        /multiple approvals/,
    );
    assert.equal(f.callbacks.length, 0);
    assert.equal(f.articleWrites, 0);
    const result = await lifecycle.completeTask(f.request);
    assert.equal(result.data.instance.status, 'COMPLETED');
    assert.equal(f.article.status, 'APPROVED');
    assert.equal(f.instance.activeRemoteAction.status, 'COMPLETED');
    assert.equal(f.articleWrites, 1);
    assert.equal(f.article.decisionEvidence.actor, 'reviewer');
    assert.equal(f.article.decisionEvidence.nodeCode, 'decide');
    assert.deepEqual(Object.keys(f.callbacks[0]).sort(), ['executionCode', 'instanceCode']);
    await assert.rejects(
        controller.applyDecision({
            tenant: 'tenantA',
            authData: f.processAuth,
            httpRequest: { body: f.callbacks[0] },
        }),
        /unavailable|claimed/,
    );
    assert.equal(f.articleWrites, 1);
    assert.equal(f.internalAuthorizations, 1, 'Replay cannot reacquire persistence authority');
    assert.equal(f.processAuth.userGroups, undefined, 'Incoming principal must remain unchanged');
    const g = fixture();
    completedTask(g);
    await registry.execute(g.request, execution(g));
    assert.equal(g.article.status, 'APPROVED', 'persisted approval, not supplied REJECT, is authoritative');
});

test('callback rejects human, wrong-module, unbound and wrong-tenant principals before mutation', async () => {
    for (const mutate of [
        (a) => {
            a.tokenType = 'access';
        },
        (a) => {
            a.modules = ['cms'];
        },
        (a) => {
            delete a.runtimeScope;
        },
        (a) => {
            a.tenant = 'tenantB';
        },
    ]) {
        const f = fixture();
        const auth = _.cloneDeep(f.processAuth);
        mutate(auth);
        await assert.rejects(
            controller.applyDecision({
                tenant: 'tenantA',
                authData: auth,
                httpRequest: {
                    body: {
                        instance: {
                            code: 'review-1',
                            context: { articleCode: 'article-1', articleRevision: 2 },
                        },
                        body: { decision: { action: 'APPROVE' } },
                    },
                },
            }),
            /scoped runtime/,
        );
        assert.equal(f.articleWrites, 0);
        assert.equal(f.claims.length, 0);
        assert.equal(f.internalAuthorizations, 0);
    }
});

test('premature task, unpublished action, disabled selection and unknown action fail closed', async () => {
    let f = fixture();
    await assert.rejects(registry.execute(f.request, execution(f)), /completed Process task/);
    f = fixture();
    completedTask(f);
    f.version.status = 'DRAFT';
    await assert.rejects(registry.execute(f.request, execution(f)), /not published/);
    f = fixture();
    completedTask(f);
    f.settings.actionAdapters.enabled = false;
    await assert.rejects(registry.execute(f.request, execution(f)), /disabled/);
    f = fixture();
    f.settings.actionAdapters.allowedActions = [];
    await assert.rejects(registry.execute(f.request, execution(f)), /not registered/);
    assert.equal(f.articleWrites, 0);
});

test('forged handle, extra task/decision payload, wrong source runtime, expired and foreign-scope claims fail closed', async () => {
    for (const mutate of [
        (f) => {
            f.beforeCallback = async (o) => {
                o.requestBody.executionCode = '00000000-0000-0000-0000-000000000000';
            };
        },
        (f) => {
            f.beforeCallback = async (o) => {
                o.requestBody.taskCode = 'other-task';
            };
        },
        (f) => {
            f.beforeCallback = async () => {
                f.processAuth.runtimeInstanceId = 'process-other';
                f.processAuth.runtimeScope.instanceCode = 'process-other';
            };
        },
        (f) => {
            f.beforeClaim = async () => {
                f.instance.activeRemoteAction.expiresAt = Date.now() - 1;
            };
        },
        (f) => {
            f.editorialAuth.runtimeScope.environmentCode = 'foreign';
        },
        (f) => {
            f.editorialAuth.entCode = 'other-enterprise';
        },
        (f) => {
            f.editorialAuth.modules = ['cms'];
        },
        (f) => {
            f.beforeClaim = async (o) => {
                o.requestBody.actionKey = 'editorial.publishApproved';
            };
        },
    ]) {
        const f = fixture();
        completedTask(f);
        mutate(f);
        await assert.rejects(registry.execute(f.request, execution(f)));
        assert.equal(f.articleWrites, 0);
        assert.equal(f.instance.activeRemoteAction.status, 'FAILED');
    }
});

test('one concurrent claimant wins and a failed response can retry without a second domain mutation', async () => {
    const f = fixture();
    completedTask(f);
    const declaration = {
        ...f.settings.actionAdapters.definitions['editorial.applyDecision'].remote,
        actionKey: 'editorial.applyDecision',
    };
    const started = await transport.begin(f.request, execution(f), declaration, f.processAuth);
    const req = {
        tenant: 'tenantA',
        authData: f.editorialAuth,
        instanceCode: 'review-1',
        runtimeOperation: {
            executionCode: started.active.code,
            actionKey: 'editorial.applyDecision',
            sourceRuntimeInstanceId: 'process-1',
        },
    };
    const claims = await Promise.allSettled([transport.claim(req), transport.claim(req)]);
    assert.equal(claims.filter((value) => value.status === 'fulfilled').length, 1);
    const g = fixture();
    completedTask(g);
    g.failAfterMutation = true;
    await assert.rejects(registry.execute(g.request, execution(g)), /response lost/);
    assert.equal(g.articleWrites, 1);
    g.failAfterMutation = false;
    await registry.execute(g.request, execution(g));
    assert.equal(g.articleWrites, 1);
});

test('domain rejects wrong revision/workflow and publication without stored approval; successful retry reuses publication', async () => {
    for (const mutate of [
        (f) => {
            f.instance.context.articleRevision = 3;
        },
        (f) => {
            f.article.workflowInstanceCode = 'other-review';
        },
    ]) {
        const f = fixture();
        completedTask(f);
        mutate(f);
        await assert.rejects(registry.execute(f.request, execution(f)), /correlation/);
        assert.equal(f.articleWrites, 0);
    }
    let f = fixture();
    await assert.rejects(registry.execute(f.request, execution(f, 'publish')), /approved exact/);
    assert.equal(f.publications, 0);
    f = fixture();
    f.article.status = 'APPROVED';
    f.failAfterMutation = true;
    await assert.rejects(registry.execute(f.request, execution(f, 'publish')), /response lost/);
    assert.equal(f.publications, 1);
    f.failAfterMutation = false;
    await registry.execute(f.request, execution(f, 'publish'));
    assert.equal(f.publications, 1);
});

test('completed task and immutable version cannot be forged through generic authoring; concurrent completion advances once', async () => {
    const f = fixture();
    const schemas = require('../src/schemas/schemas').workflow;
    const policy = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaAuthoringPolicyService');
    NODICS.getModule = () => ({ rawSchema: schemas });
    for (const schema of ['processInstance', 'processTask', 'processDefinitionVersion']) {
        for (const operation of ['create', 'update', 'delete'])
            assert.throws(
                () => policy.assertMutationAllowed('workflow', schema, operation),
                /generic operation|read-only/,
            );
    }
    const results = await Promise.allSettled([
        lifecycle.completeTask(f.request),
        lifecycle.completeTask(f.request),
    ]);
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(f.callbacks.length, 1);
    assert.equal(f.articleWrites, 1);
});

test('outbound credential cannot authorize a different local deployment or caller enterprise', async () => {
    for (const mutate of [
        (f) => {
            f.processAuth.runtimeScope.environmentCode = 'foreign';
        },
        (f) => {
            f.processAuth.runtimeScope.projectCode = 'foreign';
        },
        (f) => {
            f.processAuth.runtimeScope.serverCode = 'foreign';
        },
        (f) => {
            f.request.authData.entCode = 'otherEnterprise';
        },
    ]) {
        const f = fixture();
        completedTask(f);
        mutate(f);
        await assert.rejects(registry.execute(f.request, execution(f)), /another deployment or enterprise/);
        assert.equal(f.callbacks.length, 0);
        assert.equal(f.instance.activeRemoteAction, undefined);
    }
});
