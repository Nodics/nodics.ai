/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/test/processOperationsInspectionService
 * @description Validates bounded runtime instance, task, and audit inspection behavior without requiring a live database.
 * @layer test
 * @owner workflow
 * @override Customer process overlays may add filters or redaction without weakening safe limits or not-found semantics.
 */
const assert = require('assert');

global.CONFIG = {
    get: function (key) {
        if (key === 'defaultTenant') return 'default';
        return undefined;
    }
};

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function matches(model, query) {
    return Object.keys(query || {}).every(key => model[key] === query[key]);
}

function createGeneratedService(store, captures) {
    return {
        get: async function (request) {
            captures.push(clone(request));
            return { result: store.filter(item => matches(item, request.query)).map(clone) };
        }
    };
}

const instances = [
    { code: 'instance-1', definitionCode: 'contentApproval', status: 'RUNNING', startedAt: new Date('2026-08-09T08:00:00Z') },
    { code: 'instance-2', definitionCode: 'contentApproval', status: 'COMPLETED', startedAt: new Date('2026-08-09T07:00:00Z') }
];
const tasks = [
    { code: 'task-1', instanceCode: 'instance-1', nodeCode: 'review', assignee: 'content-admin', status: 'OPEN' },
    { code: 'task-2', instanceCode: 'instance-2', nodeCode: 'approve', assignee: 'ops-admin', status: 'COMPLETED' }
];
const auditEvents = [
    { code: 'audit-1', definitionCode: 'contentApproval', instanceCode: 'instance-1', eventType: 'task.created', outcome: 'success' }
];
const captures = [];

global.SERVICE = {
    DefaultProcessInstanceService: createGeneratedService(instances, captures),
    DefaultProcessTaskService: createGeneratedService(tasks, captures),
    DefaultProcessAuditEventService: createGeneratedService(auditEvents, captures)
};

const inspectionService = require('../modules/workflow/src/service/operation/defaultProcessOperationsInspectionService');

(async function run() {
    let listedInstances = await inspectionService.listInstances({
        tenant: 'default',
        query: { definitionCode: 'contentApproval', status: 'RUNNING', limit: '500', unsafe: 'ignored' }
    });
    assert.strictEqual(listedInstances.code, 'SUC_PROCESS_00000');
    assert.strictEqual(listedInstances.data.length, 1);
    assert.deepStrictEqual(captures[0].query, { definitionCode: 'contentApproval', status: 'RUNNING' });
    assert.strictEqual(captures[0].searchOptions.limit, 100);

    let instance = await inspectionService.getInstance({ tenant: 'default', instanceCode: 'instance-1' });
    assert.strictEqual(instance.data.code, 'instance-1');

    let listedTasks = await inspectionService.listTasks({
        tenant: 'default',
        query: { instanceCode: 'instance-1', assignee: 'content-admin', limit: '2' }
    });
    assert.strictEqual(listedTasks.data.length, 1);
    assert.deepStrictEqual(captures[2].query, { instanceCode: 'instance-1', assignee: 'content-admin' });
    assert.strictEqual(captures[2].searchOptions.limit, 2);

    let task = await inspectionService.getTask({ tenant: 'default', taskCode: 'task-1' });
    assert.strictEqual(task.data.code, 'task-1');

    let audit = await inspectionService.listAuditEvents({
        tenant: 'default',
        query: { definitionCode: 'contentApproval', instanceCode: 'instance-1', eventType: 'task.created' }
    });
    assert.strictEqual(audit.data.length, 1);
    assert.deepStrictEqual(captures[4].query, {
        definitionCode: 'contentApproval',
        instanceCode: 'instance-1',
        eventType: 'task.created'
    });

    await assert.rejects(
        () => inspectionService.getInstance({ tenant: 'default', instanceCode: '../bad' }),
        error => error.code === 'ERR_PROCESS_00006',
    );
    await assert.rejects(
        () => inspectionService.getTask({ tenant: 'default', taskCode: 'missing-task' }),
        error => error.code === 'ERR_PROCESS_00008',
    );

    console.log('Process operations inspection service contract passed');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
