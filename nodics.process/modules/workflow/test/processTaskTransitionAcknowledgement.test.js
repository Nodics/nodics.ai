/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module workflow/test/processTaskTransitionAcknowledgement
 * @description Authored conditional cancellation and failed-acknowledgement fixtures; not cross-owner concurrency acceptance.
 * @layer test
 * @owner workflow
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('../src/service/operation/defaultProcessRuntimeLifecycleService');

test('failed envelopes cannot be converted into task success by an affected count', () => {
    global.CLASSES = { NodicsError: class extends Error {} };
    global.SERVICE = {
        DefaultModelsUpdateInitializerService: {
            getAffectedCount: (response) => response.result.matchedCount,
        },
    };
    for (const response of [
        {
            code: 'ERR_SYS_00000',
            result: { acknowledged: true, matchedCount: 1 },
        },
        {
            code: 'SUC_SYS_00000',
            result: { acknowledged: false, matchedCount: 1 },
        },
        {
            code: 'SUC_SYS_00000',
            result: { acknowledged: true, matchedCount: 0 },
        },
        {
            code: 'SUC_SYS_00000',
            error: {},
            result: { acknowledged: true, matchedCount: 1 },
        },
    ])
        assert.throws(() => source.assertTaskTransitionWrite(response));
});

test('a concurrent task change cannot be overwritten or audited by cancellation', async () => {
    global.CLASSES = { NodicsError: class extends Error {} };
    global.SERVICE = {
        DefaultModelsUpdateInitializerService: {
            getAffectedCount: (response) => response.result.matchedCount,
        },
    };
    let audited = false;
    const owner = {
        ...source,
        requireTask: async () => ({
            code: 'task',
            status: 'CLAIMED',
            assignee: 'reviewer',
            instanceCode: 'instance',
            nodeCode: 'review',
        }),
        requireInstance: async () => ({
            definitionCode: 'definition',
            version: 1,
        }),
        requireVersion: async () => ({ graph: {} }),
        findNode: () => ({}),
        policyOf: () => ({}),
        taskService: () => ({
            update: async (request) => {
                assert.equal(request.query.status, 'CLAIMED');
                assert.equal(request.query.assignee, 'reviewer');
                assert.equal(request.query.nodeCode, 'review');
                return {
                    code: 'SUC_SYS_00000',
                    result: { acknowledged: true, matchedCount: 0 },
                };
            },
        }),
        audit: async () => {
            audited = true;
        },
    };
    await assert.rejects(
        owner.cancelTask({
            tenant: 'tenant',
            taskCode: 'task',
            body: { reason: 'cancel' },
        }),
    );
    assert.equal(audited, false);
});

test('generic instance cancellation cannot bypass governed review policy', async () => {
    global.CLASSES = { NodicsError: class extends Error {} };
    let wrote = false;
    const owner = {
        ...source,
        requireInstance: async () => ({
            code: 'instance',
            status: 'WAITING',
            definitionCode: 'definition',
            version: 1,
        }),
        requireVersion: async () => ({
            graph: { nodes: [{ policy: { actorPolicy: {} } }] },
        }),
        instanceService: () => ({
            update: async () => {
                wrote = true;
            },
        }),
    };
    await assert.rejects(
        owner.cancelInstance({
            tenant: 'tenant',
            instanceCode: 'instance',
            body: {},
        }),
    );
    assert.equal(wrote, false);
});

test('completion readback drift cannot audit or advance a process', async () => {
    global.CLASSES = { NodicsError: class extends Error {} };
    global.SERVICE = {
        DefaultModelsUpdateInitializerService: {
            getAffectedCount: (response) => response.result.matchedCount,
        },
    };
    let advanced = false;
    let audited = false;
    const task = {
        code: 'task',
        status: 'CLAIMED',
        assignee: 'reviewer',
        instanceCode: 'instance',
        nodeCode: 'review',
    };
    const owner = {
        ...source,
        requireTask: async () => task,
        requireInstance: async () => ({
            code: 'instance',
            status: 'WAITING',
            definitionCode: 'definition',
            version: 1,
        }),
        requireVersion: async () => ({ graph: {} }),
        findNode: () => ({}),
        nextNode: () => undefined,
        assertTaskCompletionPolicy: () => ({}),
        taskService: () => ({
            update: async () => ({
                code: 'SUC_SYS_00000',
                result: { acknowledged: true, matchedCount: 1 },
            }),
        }),
        readTaskTransition: async () => ({
            ...task,
            status: 'COMPLETED',
            completedBy: 'other',
        }),
        audit: async () => {
            audited = true;
        },
        enterNode: async () => {
            advanced = true;
        },
    };
    await assert.rejects(
        owner.completeTask({
            tenant: 'tenant',
            taskCode: 'task',
            authData: { loginId: 'reviewer' },
            body: { decision: { approved: true } },
        }),
    );
    assert.equal(audited, false);
    assert.equal(advanced, false);
});

test('transition readback bypasses cache and rejects error envelopes and duplicate records', async () => {
    global.CLASSES = { NodicsError: class extends Error {} };
    let response = { code: 'ERR_SYS_00000', result: [{ code: 'task' }] };
    const owner = {
        ...source,
        taskService: () => ({
            get: async (request) => {
                assert.equal(request.options.skipItemCache, true);
                assert.equal(request.options.recursive, false);
                assert.equal(request.searchOptions.limit, 2);
                return response;
            },
        }),
    };
    await assert.rejects(
        owner.readTaskTransition({ tenant: 'tenant' }, 'task'),
    );
    response = {
        code: 'SUC_SYS_00000',
        result: [{ code: 'task' }, { code: 'task' }],
    };
    await assert.rejects(
        owner.readTaskTransition({ tenant: 'tenant' }, 'task'),
    );
    response = {
        code: 'SUC_SYS_00000',
        result: [{ code: 'task', status: 'COMPLETED' }],
    };
    assert.equal(
        (await owner.readTaskTransition({ tenant: 'tenant' }, 'task')).status,
        'COMPLETED',
    );
});
