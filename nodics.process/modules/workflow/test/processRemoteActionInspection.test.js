/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Proves target-runtime history scope, bounded persistence reads and non-mutating inspection. */
'use strict';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/operation/defaultProcessRemoteActionInspectionService');
const tokens = require('../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService');
let request, row, reads;
beforeEach(() => {
    reads = [];
    const scope = {
        projectCode: 'project',
        environmentCode: 'test',
        instanceCode: 'target',
        serverCode: 'copilot',
        assignmentCode: 'target',
    };
    request = {
        tenant: 'tenant',
        authData: {
            tokenType: 'service',
            tenant: 'tenant',
            entCode: 'enterprise',
            serviceId: 'copilot',
            runtimeInstanceId: 'target',
            runtimeScope: scope,
            modules: ['copilotApi'],
        },
        runtimeOperation: {
            moduleName: 'copilotApi',
            actionKey: 'copilotApi.refreshKnowledge',
            definitionCode: 'refresh',
            version: 1,
            page: 1,
            contextMatch: { sourceCode: 'docs' },
            expectedScope: {
                tenantCode: 'tenant',
                enterpriseCode: 'enterprise',
                projectCode: 'project',
                environmentCode: 'test',
            },
        },
    };
    row = {
        code: 'instance-1',
        definitionCode: 'refresh',
        version: 1,
        status: 'COMPLETED',
        startedAt: '2026-10-03T00:00:00Z',
        activeRemoteAction: {
            code: '12345678-1234-1234-1234-123456789012',
            moduleName: 'copilotApi',
            actionKey: 'copilotApi.refreshKnowledge',
            enterpriseCode: 'enterprise',
            runtimeScope: scope,
            status: 'COMPLETED',
            expiresAt: Date.now() + 1000,
            context: {
                sourceCode: 'docs',
                expectedPolicyDigest: 'a'.repeat(64),
            },
            decision: { private: 'not projected' },
        },
    };
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code, message) {
                super(message || code);
                this.code = code;
            }
        },
    };
    global.SERVICE = {
        DefaultServiceTokenService: tokens,
        DefaultProcessInstanceService: {
            get: async (input) => {
                reads.push(input);
                return { code: 'SUC_SYS_00000', count: 1, result: [row] };
            },
        },
    };
});
test('history binds every persisted filter and strips decisions, actors and claims', async () => {
    request.runtimeOperation.page = 3;
    const result = await service.history(request);
    assert.equal(reads[0].tenant, 'tenant');
    assert.equal(
        reads[0].query['activeRemoteAction.enterpriseCode'],
        'enterprise',
    );
    assert.equal(
        reads[0].query['activeRemoteAction.runtimeScope.environmentCode'],
        'test',
    );
    assert.equal(reads[0].searchOptions.pageNumber, 3);
    assert.equal(reads[0].searchOptions.pageSize, 25);
    assert.equal(result.data.items[0].status, 'COMPLETED');
    assert.equal(result.data.items[0].decision, undefined);
});
test('foreign principal, requested scope and injected filters never read persistence', async () => {
    for (const mutate of [
        (input) => {
            input.authData.tokenType = 'access';
        },
        (input) => {
            input.authData.modules = ['other'];
        },
        (input) => {
            input.runtimeOperation.expectedScope.enterpriseCode = 'foreign';
        },
        (input) => {
            input.runtimeOperation.contextMatch = { $where: 'docs' };
        },
        (input) => {
            input.runtimeOperation.contextMatch = {
                sourceCode: { $ne: 'docs' },
            };
        },
        (input) => {
            input.runtimeOperation.page = 1001;
        },
    ]) {
        const input = structuredClone(request);
        mutate(input);
        await assert.rejects(service.history(input));
    }
    assert.equal(reads.length, 0);
});
test('unexpected owner results cannot leak foreign rows or invent empty history', async () => {
    row.activeRemoteAction.enterpriseCode = 'foreign';
    await assert.rejects(service.history(request));
    for (const response of [
        undefined,
        { result: [] },
        { code: 'ERR_DB', result: [] },
        { code: 'SUC_SYS_00000' },
        { code: 'SUC_SYS_00000', count: 0, result: [], errors: ['partial'] },
        { code: 'SUC_SYS_00000', count: 0, result: [], success: false },
    ]) {
        SERVICE.DefaultProcessInstanceService.get = async () => response;
        await assert.rejects(service.history(request));
    }
});
test('page size uses generated-service pagination and owner count without an extra record', async () => {
    SERVICE.DefaultProcessInstanceService.get = async () => ({
        code: 'SUC_SYS_00000',
        count: 26,
        result: Array.from({ length: 25 }, (_, index) => ({
            ...row,
            code: 'instance-' + index,
            activeRemoteAction: {
                ...row.activeRemoteAction,
                code: require('node:crypto').randomUUID(),
            },
        })),
    });
    const result = await service.history(request);
    assert.equal(result.data.items.length, 25);
    assert.equal(result.data.hasMore, true);
});

test('attempt inspection preserves multiple actions per instance and historical versions with exact scoped queries', async () => {
    request.runtimeOperation.historyMode = 'ATTEMPTS';
    request.runtimeOperation.version = null;
    const attempt = {
        code: row.activeRemoteAction.code, instanceCode: row.code,
        definitionCode: 'refresh', version: 1, moduleName: 'copilotApi',
        actionKey: 'copilotApi.refreshKnowledge', enterpriseCode: 'enterprise',
        projectCode: 'project', environmentCode: 'test',
        context: row.activeRemoteAction.context, status: 'COMPLETED',
        startedAt: row.startedAt, completedAt: row.startedAt,
        expiresAt: row.activeRemoteAction.expiresAt,
        decision: { private: 'not returned' },
    };
    SERVICE.DefaultProcessActionAttemptService = require('../src/service/operation/defaultProcessActionAttemptService');
    SERVICE.DefaultProcessActionAttemptRecordService = { get: async input => {
        reads.push(input);
        return { code: 'SUC_DB', count: 2, result: [attempt,
            { ...attempt, code: '22345678-1234-1234-1234-123456789012', version: 2 }] };
    } };
    const result = await service.history(request);
    assert.equal(result.data.contractVersion, 2);
    assert.equal(result.data.evidence, 'PROCESS_ACTION_ATTEMPTS');
    assert.equal(result.data.items.length, 2);
    assert.equal(result.data.items[0].instanceCode, result.data.items[1].instanceCode);
    assert.equal(result.data.items[0].decision, undefined);
    assert.equal(reads[0].query.version, undefined);
    assert.equal(reads[0].query.enterpriseCode, 'enterprise');
    assert.equal(reads[0].query['context.sourceCode'], 'docs');
    assert.equal(reads[0].searchOptions.pageSize, 25);
    request.runtimeOperation.instanceCode = 'instance-1';
    await service.history(request);
    assert.equal(reads.at(-1).query.instanceCode, 'instance-1');
    request.runtimeOperation.instanceCode = 'other-instance';
    await assert.rejects(service.history(request));
    request.runtimeOperation.instanceCode = { $ne: 'instance-1' };
    const previousReads = reads.length;
    await assert.rejects(service.history(request));
    assert.equal(reads.length, previousReads);
    delete request.runtimeOperation.instanceCode;
    attempt.environmentCode = 'foreign';
    await assert.rejects(service.history(request));
    attempt.environmentCode = 'test';
    attempt.completedAt = null;
    await assert.rejects(service.history(request));
});
