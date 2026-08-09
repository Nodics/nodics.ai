/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/test/processRuntimeLifecycleService
 * @description Validates backend-owned process instance start, task lifecycle, audit, and trigger metadata behavior without a live database.
 * @layer test
 * @owner flowCore
 * @override Customer process overlays may customize assignment or execution policy while preserving published-version runtime ownership and transition validation.
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

function createGeneratedService(store) {
    return {
        get: async function (request) {
            return { result: store.filter(item => matches(item, request.query)).map(clone) };
        },
        save: async function (request) {
            store.push(clone(request.model));
            return { result: clone(request.model) };
        },
        update: async function (request) {
            let update = request.model && request.model.$set || request.model || {};
            let count = 0;
            store.forEach(item => {
                if (matches(item, request.query)) {
                    Object.assign(item, clone(update));
                    count += 1;
                }
            });
            return { result: { n: count } };
        }
    };
}

const graph = {
    nodes: [
        { code: 'start', type: 'START', name: 'Start' },
        { code: 'review', type: 'TASK', name: 'Business Review', assignee: 'reviewQueue' },
        { code: 'end', type: 'END', name: 'End' }
    ],
    transitions: [
        { code: 'start_to_review', source: 'start', target: 'review' },
        { code: 'review_to_end', source: 'review', target: 'end' }
    ]
};
const definitions = [{ code: 'contentApproval', name: 'Content Approval', status: 'PUBLISHED', currentVersion: 1 }];
const versions = [{ code: 'contentApproval_v1', definitionCode: 'contentApproval', version: 1, name: 'Content Approval', status: 'PUBLISHED', graph: clone(graph) }];
const instances = [];
const tasks = [];
const auditEvents = [];
const triggers = [{ code: 'dailyContentApproval', definitionCode: 'contentApproval', triggerType: 'CRON', cronJobCode: 'dailyContentApprovalJob', status: 'ACTIVE' }];

global.SERVICE = {
    DefaultProcessDefinitionService: createGeneratedService(definitions),
    DefaultProcessDefinitionVersionService: createGeneratedService(versions),
    DefaultProcessInstanceService: createGeneratedService(instances),
    DefaultProcessTaskService: createGeneratedService(tasks),
    DefaultProcessAuditEventService: createGeneratedService(auditEvents),
    DefaultProcessTriggerService: createGeneratedService(triggers)
};

const runtimeService = require('../modules/workflow/modules/flowCore/src/service/operation/defaultProcessRuntimeLifecycleService');

(async function run() {
    let started = await runtimeService.startInstance({
        tenant: 'default',
        authData: { loginId: 'operator' },
        runtimeOperation: {
            definitionCode: 'contentApproval',
            instanceCode: 'contentApproval-001',
            context: { businessKey: 'page-123' }
        }
    });
    assert.strictEqual(started.code, 'SUC_PROCESS_00007');
    assert.strictEqual(instances.length, 1);
    assert.strictEqual(instances[0].status, 'WAITING');
    assert.strictEqual(instances[0].currentNode, 'review');
    assert.strictEqual(tasks.length, 1);
    assert.strictEqual(tasks[0].status, 'OPEN');
    assert.strictEqual(tasks[0].assignee, 'reviewQueue');
    assert.strictEqual(auditEvents[0].eventType, 'process.instance.started');
    assert.strictEqual(auditEvents[1].eventType, 'process.task.created');

    let claimed = await runtimeService.claimTask({
        tenant: 'default',
        authData: { loginId: 'reviewer' },
        taskCode: tasks[0].code
    });
    assert.strictEqual(claimed.code, 'SUC_PROCESS_00008');
    assert.strictEqual(tasks[0].status, 'CLAIMED');
    assert.strictEqual(tasks[0].assignee, 'reviewer');

    let completed = await runtimeService.completeTask({
        tenant: 'default',
        authData: { loginId: 'reviewer' },
        taskCode: tasks[0].code,
        runtimeOperation: { decision: { approved: true } }
    });
    assert.strictEqual(completed.code, 'SUC_PROCESS_00008');
    assert.strictEqual(tasks[0].status, 'COMPLETED');
    assert.strictEqual(instances[0].status, 'COMPLETED');
    assert.strictEqual(instances[0].currentNode, 'end');
    assert.strictEqual(auditEvents.some(event => event.eventType === 'process.task.completed'), true);
    assert.strictEqual(auditEvents.some(event => event.eventType === 'process.instance.completed'), true);

    let detail = await runtimeService.getInstanceDetail({ tenant: 'default', instanceCode: 'contentApproval-001' });
    assert.strictEqual(detail.data.instance.code, 'contentApproval-001');
    assert.strictEqual(detail.data.tasks.length, 1);
    assert(detail.data.auditEvents.length >= 4);

    let listedTriggers = await runtimeService.listTriggers({ tenant: 'default', query: { definitionCode: 'contentApproval' } });
    assert.strictEqual(listedTriggers.code, 'SUC_PROCESS_00010');
    assert.strictEqual(listedTriggers.data[0].cronJobCode, 'dailyContentApprovalJob');

    await assert.rejects(
        () => runtimeService.claimTask({ tenant: 'default', taskCode: tasks[0].code }),
        error => error.code === 'ERR_PROCESS_00012',
    );

    await assert.rejects(
        () => runtimeService.startInstance({
            tenant: 'default',
            runtimeOperation: { definitionCode: 'missingDefinition' }
        }),
        error => error.code === 'ERR_PROCESS_00002',
    );

    console.log('Process runtime lifecycle service contract passed');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
