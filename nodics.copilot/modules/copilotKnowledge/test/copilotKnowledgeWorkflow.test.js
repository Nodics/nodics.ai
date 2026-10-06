/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Uses the real policy/group/runtime-principal contracts with an isolated Process claim and ingestion double. No schedules or indexes are provisioned. */
'use strict';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const workflow = require('../src/service/defaultCopilotKnowledgeWorkflowService');
const runtime = require('../src/service/defaultCopilotKnowledgeRuntimeService');
const registry = require('../src/service/defaultCopilotKnowledgeSourceRegistryService');
const groups = require('../src/service/defaultCopilotKnowledgeGroupService');
const policy = require('../../copilotPolicy/src/service/defaultCopilotPolicyService');
const serviceToken = require('../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService');
const history = require('../src/service/defaultCopilotKnowledgeHistoryService');
let configuration, request, execution, claims, writes, claimed;
beforeEach(() => {
    configuration = structuredClone(require('../config/properties').copilot);
    configuration.api = { enabled: true };
    configuration.policy =
        require('../../copilotPolicy/config/properties').copilot.policy;
    configuration.knowledge.ingestion.enabled = true;
    configuration.knowledge.sourceRegistry.definitions = [
        {
            code: 'runtime-docs',
            repository: 'repo',
            project: 'project',
            module: 'module',
            owner: 'owner',
            version: 'v1',
            sourceType: 'README',
            classification: 'RESTRICTED',
            paths: ['README.md'],
            secretScanPolicy: 'REQUIRED',
            allowedChannels: ['EMPLOYEE', 'SYSTEM'],
            requiredPermissions: ['copilot.knowledge.restricted.read'],
            tenantScopes: ['tenant'],
            enterpriseScopes: ['enterprise'],
            environmentScopes: ['test'],
            customerProjectScopes: ['project'],
            enabled: true,
        },
    ];
    configuration.knowledge.workflowRefresh = {
        enabled: true,
        actionAuthority: {
            connectionName: 'process-owner',
            runtimeRole: 'PROCESS',
            timeoutMs: 1000,
        },
        assignments: [
            {
                tenantCode: 'tenant',
                enterpriseCode: 'enterprise',
                projectCode: 'project',
                environmentCode: 'test',
                definitionCode: 'refresh-docs',
                version: 1,
                sourceCode: 'runtime-docs',
            },
        ],
    };
    configuration.knowledge.groups = {
        enabled: true,
        definitions: [
            {
                code: 'docs',
                name: 'Docs',
                active: true,
                sourceCodes: ['runtime-docs'],
            },
        ],
        assignments: [
            {
                tenantCode: 'tenant',
                enterpriseCode: 'enterprise',
                groupCodes: ['docs'],
                allowedSourceCodes: ['runtime-docs'],
            },
        ],
    };
    request = {
        tenant: 'tenant',
        body: {
            instanceCode: 'process-1',
            executionCode: '12345678-1234-1234-1234-123456789012',
        },
        authData: {
            tokenType: 'service',
            tenant: 'tenant',
            serviceId: 'workflow-runtime',
            entCode: 'enterprise',
            runtimeInstanceId: 'instance',
            runtimeScope: {
                instanceCode: 'instance',
                projectCode: 'project',
                environmentCode: 'test',
                serverCode: 'process',
                assignmentCode: 'assignment',
            },
            modules: ['workflow'],
            permissions: [
                'copilot.knowledge.source.manage',
                'copilot.knowledge.restricted.read',
            ],
        },
    };
    claims = [];
    writes = [];
    claimed = false;
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code) {
                super(code);
                this.code = code;
            }
        },
    };
    global.CONFIG = { get: () => configuration };
    global.SERVICE = {
        DefaultCopilotKnowledgeWorkflowService: workflow,
        DefaultCopilotPolicyService: policy,
        DefaultServiceTokenService: serviceToken,
        DefaultCopilotKnowledgeGroupService: groups,
        DefaultCopilotKnowledgeSourceRegistryService: registry,
        DefaultCopilotKnowledgeRuntimeService: {
            ...runtime,
            ingest: async (input) => {
                writes.push(input);
                const source = runtime.registry(configuration).sources[0];
                return {
                    sourceCode: source.code,
                    sourcePolicyDigest: source.sourcePolicyDigest,
                    state: 'PROJECTED',
                    filesRead: 1,
                    filesAccepted: 1,
                    filesRejected: 0,
                    chunksProjected: 1,
                };
            },
        },
        DefaultModuleService: {
            invokeModule: async (input) => {
                claims.push(input);
                if (claimed) throw new Error('already claimed');
                claimed = true;
                return {
                    code: 'SUC_PROCESS_00000',
                    data: structuredClone(execution),
                };
            },
        },
    };
    execution = {
        attemptRecorded: true,
        executionCode: request.body.executionCode,
        nodeCode: 'refresh',
        instance: {
            code: request.body.instanceCode,
            definitionCode: 'refresh-docs',
            version: 1,
            context: {
                sourceCode: 'runtime-docs',
                expectedPolicyDigest:
                    runtime.registry(configuration).sources[0]
                        .sourcePolicyDigest,
            },
        },
    };
});

test('a single Process claim uses exact published source context and original service authority', async () => {
    const result = await workflow.refresh(request);
    assert.equal(result.status, 'COMPLETED');
    assert.equal(result.output.sourceCode, 'runtime-docs');
    assert.equal(writes[0].authData, request.authData);
    assert.equal(writes[0].securityContext.channel, 'SYSTEM');
    assert.equal(claims[0].local, false);
    assert.equal(claims[0].maxAttempts, 1);
    assert.equal(
        claims[0].requestBody.actionKey,
        'copilotApi.refreshKnowledge',
    );
    assert.equal(claims[0].requestBody.sourceCode, undefined);
    await assert.rejects(workflow.refresh(request));
    assert.equal(writes.length, 1);
});

test('unverified principals, caller source overrides, disabled policy and missing management grants never claim', async () => {
    for (const patch of [
        { tokenType: 'access' },
        { tenant: 'foreign' },
        { modules: ['other'] },
        { permissions: [] },
    ])
        await assert.rejects(
            workflow.refresh({
                ...request,
                authData: { ...request.authData, ...patch },
            }),
        );
    await assert.rejects(
        workflow.refresh({
            ...request,
            body: { ...request.body, sourceCode: 'foreign' },
        }),
    );
    configuration.knowledge.workflowRefresh.enabled = false;
    await assert.rejects(workflow.refresh(request));
    assert.equal(claims.length, 0);
    assert.equal(writes.length, 0);
});

test('contradictory or partial claim envelopes cannot authorize ingestion or retry', async () => {
    for (const patch of [
        { error: 'failed' },
        { success: false },
        { acknowledged: false },
        { errors: ['failed'] },
        { errors: {} },
    ]) {
        for (const layer of ['root', 'data']) {
            let calls = 0;
            SERVICE.DefaultModuleService.invokeModule = async () => {
                calls += 1;
                const response = {
                    code: 'SUC_PROCESS_00000',
                    data: structuredClone(execution),
                };
                Object.assign(
                    layer === 'root' ? response : response.data,
                    patch,
                );
                return response;
            };
            await assert.rejects(workflow.refresh(request));
            assert.equal(calls, 1);
            assert.equal(writes.length, 0);
        }
    }
});

test('foreign or stale execution evidence and lost claim acknowledgements never ingest', async () => {
    for (const alteration of [
        (value) => {
            value.executionCode = 'foreign';
        },
        (value) => {
            value.instance.code = 'foreign';
        },
        (value) => {
            value.instance.version = 2;
        },
        (value) => {
            value.instance.context.expectedPolicyDigest = 'a'.repeat(64);
        },
        (value) => {
            value.instance.context.sourceCode = 'other';
        },
    ]) {
        const response = structuredClone(execution);
        alteration(response);
        SERVICE.DefaultModuleService.invokeModule = async () => ({
            code: 'SUC_PROCESS_00000',
            data: response,
        });
        await assert.rejects(workflow.refresh(request));
    }
    SERVICE.DefaultModuleService.invokeModule = async () => undefined;
    await assert.rejects(workflow.refresh(request));
    assert.equal(writes.length, 0);
});

test('service source grants and active enterprise group ceilings remain independent of Process authorization', async () => {
    request.authData.permissions = ['copilot.knowledge.source.manage'];
    await assert.rejects(workflow.refresh(request));
    request.authData.permissions.push('copilot.knowledge.restricted.read');
    claimed = false;
    configuration.knowledge.groups.assignments[0].activeGroupCodes = [];
    await assert.rejects(workflow.refresh(request));
    assert.equal(writes.length, 0);
});

test('projection uncertainty and policy drift after ingestion withhold completion and do not retry', async () => {
    SERVICE.DefaultCopilotKnowledgeRuntimeService.ingest = async (input) => {
        writes.push(input);
        throw new Error('private provider failure');
    };
    await assert.rejects(workflow.refresh(request), /ERR_CPK_00017/);
    assert.equal(writes.length, 1);
    claimed = false;
    SERVICE.DefaultCopilotKnowledgeRuntimeService.ingest = async (input) => {
        writes.push(input);
        configuration.knowledge.workflowRefresh.assignments = [];
        return {
            sourceCode: 'runtime-docs',
            sourcePolicyDigest: execution.instance.context.expectedPolicyDigest,
            state: 'PROJECTED',
        };
    };
    await assert.rejects(workflow.refresh(request), /ERR_CPK_00017/);
    assert.equal(writes.length, 2);
});

test('canonical Cron-to-Process context reaches one refresh without treating schedule metadata as authority', async () => {
    const cron = require('../../../../nodics.process/modules/cronjob/src/service/trigger/defaultCronJobTriggerHandlerService');
    const process = require('../../../../nodics.process/modules/workflow/src/service/operation/defaultProcessRuntimeLifecycleService');
    const processInput = structuredClone(execution.instance.context);
    SERVICE.DefaultProcessRuntimeLifecycleService = {
        ...process,
        requireTrigger: async () => ({
            code: 'docs-trigger',
            definitionCode: 'refresh-docs',
            version: 1,
            status: 'ACTIVE',
            cronJobCode: 'docs-job',
        }),
        audit: async () => ({}),
        startInstance: async (input) => {
            execution.instance.context = input.runtimeOperation.context;
            return {
                data: {
                    instance: { code: 'process-1' },
                    result: await workflow.refresh(request),
                },
            };
        },
    };
    await cron.executeProcessTriggerJob(
        {
            code: 'docs-job',
            tenant: 'tenant',
            startTime: new Date(),
            trigger: { expression: '0 * * * * *' },
            jobDetail: {
                processTrigger: {
                    triggerCode: 'docs-trigger',
                    context: processInput,
                },
            },
        },
        {},
        request.authData,
    );
    assert.equal(writes.length, 1);
    assert.equal(execution.instance.context.source, 'cronjob');
    execution.instance.context.cronJobTenant = 'foreign';
    claimed = false;
    await assert.rejects(workflow.refresh(request));
    assert.equal(writes.length, 1);
});

/** Builds the employee read and persisted owner response without any refresh invocation. */
function historyFixture() {
    const input = {
        tenant: 'tenant',
        sourceCode: 'runtime-docs',
        query: { page: '1' },
        securityContext: {
            channel: 'EMPLOYEE',
            principalType: 'USER',
            actor: 'reader',
            tenant: 'tenant',
            enterprise: 'enterprise',
            customerProject: 'project',
            environment: 'test',
            permissions: [
                'copilot.knowledge.internal.read',
                'copilot.knowledge.restricted.read',
            ],
        },
    };
    const response = {
        code: 'SUC_PROCESS_00000',
        data: {
            contractVersion: 2,
            evidence: 'PROCESS_ACTION_ATTEMPTS',
            page: 1,
            limit: 25,
            hasMore: false,
            scope: {
                tenantCode: 'tenant',
                enterpriseCode: 'enterprise',
                projectCode: 'project',
                environmentCode: 'test',
            },
            items: [
                {
                    definitionCode: 'refresh-docs',
                    version: 1,
                    instanceCode: 'process-1',
                    executionCode: request.body.executionCode,
                    context: execution.instance.context,
                    status: 'COMPLETED',
                    instanceStatus: 'COMPLETED',
                    startedAt: '2026-10-03T00:00:00Z',
                    completedAt: '2026-10-03T00:01:00Z',
                    expiresAt: 1,
                },
            ],
        },
    };
    SERVICE.DefaultModuleService.invokeModule = async (options) => {
        claims.push(options);
        return response;
    };
    return { input, response };
}

test('employee history reads durable evidence without management grants, content or index writes', async () => {
    const { input } = historyFixture();
    const result = await history.history(input);
    assert.equal(result.items[0].currentPolicy, true);
    assert.equal(result.items[0].context, undefined);
    assert.equal(result.items[0].executionCode, request.body.executionCode);
    assert.equal(claims[0].apiName, '/actions/history/query');
    assert.equal(claims[0].maxAttempts, 1);
    assert.equal(writes.length, 0);
});
test('history distinguishes uncertain actions and historical source policies without blind replay', async () => {
    const { input, response } = historyFixture();
    response.data.items[0].status = 'CLAIMED';
    response.data.items[0].context = {
        sourceCode: 'runtime-docs',
        expectedPolicyDigest: 'b'.repeat(64),
    };
    const result = await history.history(input);
    assert.equal(result.items[0].status, 'INSPECTION_REQUIRED');
    assert.equal(result.items[0].currentPolicy, false);
    assert.equal(result.items[0].recovery, 'PROCESS_INSPECTION');
    assert.equal(writes.length, 0);
});

test('history survives same-definition version upgrades but rejects duplicate, ambiguous or concurrently revoked assignments', async () => {
    const { input, response } = historyFixture();
    const assignments = configuration.knowledge.workflowRefresh.assignments;
    const original = assignments[0];
    assignments.push({ ...original, version: original.version + 1 });
    const result = await history.history(input);
    assert.equal(result.definitionVersion, original.version + 1);
    assert.equal(result.items[0].definitionVersion, 1);
    assignments.push({ ...original });
    await assert.rejects(history.history(input));
    assignments.pop();
    assignments[1].definitionCode = 'different-definition';
    await assert.rejects(history.history(input));
    assignments[1].definitionCode = original.definitionCode;
    SERVICE.DefaultModuleService.invokeModule = async () => {
        assignments.shift();
        return response;
    };
    await assert.rejects(history.history(input));
});
test('denied source, foreign scope and explicit empty group selection do not call Process', async () => {
    const { input } = historyFixture();
    for (const patch of [
        { permissions: [] },
        { enterprise: 'foreign' },
        { channel: 'PUBLIC' },
    ])
        await assert.rejects(
            history.history({
                ...input,
                securityContext: { ...input.securityContext, ...patch },
            }),
        );
    await assert.rejects(
        history.history({ ...input, knowledgeGroupCodes: [] }),
    );
    assert.equal(claims.length, 0);
});
test('history rejects missing or foreign acknowledgements and policy revocation during the read', async () => {
    const { input, response } = historyFixture();
    response.data.scope.enterpriseCode = 'foreign';
    await assert.rejects(history.history(input));
    response.data.scope.enterpriseCode = 'enterprise';
    response.errors = ['partial'];
    await assert.rejects(history.history(input));
    delete response.errors;
    SERVICE.DefaultModuleService.invokeModule = async () => {
        configuration.knowledge.workflowRefresh.actionAuthority.timeoutMs = 2000;
        return response;
    };
    await assert.rejects(history.history(input));
    SERVICE.DefaultModuleService.invokeModule = async () => {
        configuration.knowledge.groups.assignments[0].activeGroupCodes = [];
        return response;
    };
    await assert.rejects(history.history(input));
    assert.equal(writes.length, 0);
});
