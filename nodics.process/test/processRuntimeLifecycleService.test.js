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
        { code: 'approvalDecision', type: 'DECISION', name: 'Approval Decision' },
        { code: 'notify', type: 'ACTION', name: 'Notify Domain', action: { moduleName: 'nodics.process', operation: 'noop' } },
        { code: 'waitForAudit', type: 'TIMER', name: 'Wait for audit window', timer: { delayMs: 0, autoContinue: true } },
        { code: 'childGovernance', type: 'SUB_PROCESS', name: 'Child Governance', subProcessDefinitionCode: 'childApproval' },
        { code: 'end', type: 'END', name: 'End' }
    ],
    transitions: [
        { code: 'start_to_review', source: 'start', target: 'review' },
        { code: 'review_to_decision', source: 'review', target: 'approvalDecision' },
        { code: 'decision_to_notify', source: 'approvalDecision', target: 'notify', condition: { field: 'approved', equals: true } },
        { code: 'decision_to_end', source: 'approvalDecision', target: 'end', default: true },
        { code: 'notify_to_wait', source: 'notify', target: 'waitForAudit' },
        { code: 'wait_to_child', source: 'waitForAudit', target: 'childGovernance' },
        { code: 'child_to_end', source: 'childGovernance', target: 'end' }
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
    DefaultProcessTriggerService: createGeneratedService(triggers),
    DefaultProcessActionAdapterRegistryService: require('../modules/workflow/modules/flowCore/src/service/operation/defaultProcessActionAdapterRegistryService')
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
    assert.strictEqual(auditEvents.some(event => event.eventType === 'process.node.entered' && event.metadata.nodeCode === 'review'), true);
    assert.strictEqual(auditEvents.some(event => event.eventType === 'process.task.created'), true);

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
    assert.strictEqual(auditEvents.some(event => event.eventType === 'process.decision.evaluated'), true);
    assert.strictEqual(auditEvents.some(event => event.eventType === 'process.action.executed'), true);
    assert.strictEqual(auditEvents.some(event => event.eventType === 'process.timer.observed'), true);
    assert.strictEqual(auditEvents.some(event => event.eventType === 'process.subProcess.referenced'), true);
    assert.strictEqual(auditEvents.some(event => event.eventType === 'process.instance.completed'), true);

    let detail = await runtimeService.getInstanceDetail({ tenant: 'default', instanceCode: 'contentApproval-001' });
    assert.strictEqual(detail.data.instance.code, 'contentApproval-001');
    assert.strictEqual(detail.data.tasks.length, 1);
    assert(detail.data.auditEvents.length >= 4);

    let listedTriggers = await runtimeService.listTriggers({ tenant: 'default', query: { definitionCode: 'contentApproval' } });
    assert.strictEqual(listedTriggers.code, 'SUC_PROCESS_00010');
    assert.strictEqual(listedTriggers.data[0].cronJobCode, 'dailyContentApprovalJob');

    let createdTrigger = await runtimeService.createTrigger({
        tenant: 'default',
        authData: { loginId: 'scheduler-admin' },
        runtimeOperation: {
            code: 'weeklyContentApproval',
            definitionCode: 'contentApproval',
            triggerType: 'CRON',
            cronJobCode: 'weeklyContentApprovalJob',
            status: 'ACTIVE',
            schedule: { expression: '0 0 * * 1' }
        }
    });
    assert.strictEqual(createdTrigger.code, 'SUC_PROCESS_00010');
    assert.strictEqual(triggers.length, 2);
    assert.strictEqual(triggers[1].code, 'weeklyContentApproval');
    assert.strictEqual(auditEvents.some(event => event.eventType === 'process.trigger.created'), true);

    let updatedTrigger = await runtimeService.updateTrigger({
        tenant: 'default',
        triggerCode: 'weeklyContentApproval',
        runtimeOperation: { status: 'PAUSED', cronJobCode: 'weeklyContentApprovalJob' }
    });
    assert.strictEqual(updatedTrigger.data.status, 'PAUSED');
    assert.strictEqual(triggers[1].status, 'PAUSED');

    let executedTrigger = await runtimeService.executeTrigger({
        tenant: 'default',
        authData: { loginId: 'scheduler-runtime' },
        triggerCode: 'dailyContentApproval',
        runtimeOperation: {
            correlationId: 'cron-fire-001',
            instanceCode: 'contentApproval-triggered-001'
        }
    });
    assert.strictEqual(executedTrigger.code, 'SUC_PROCESS_00011');
    assert.strictEqual(executedTrigger.data.correlationId, 'cron-fire-001');
    assert.strictEqual(instances.some(instance => instance.code === 'contentApproval-triggered-001'), true);
    assert.strictEqual(auditEvents.some(event => event.eventType === 'process.trigger.execution.requested'), true);
    assert.strictEqual(auditEvents.some(event => event.eventType === 'process.trigger.execution.completed'), true);

    let archivedTrigger = await runtimeService.archiveTrigger({
        tenant: 'default',
        triggerCode: 'weeklyContentApproval'
    });
    assert.strictEqual(archivedTrigger.data.status, 'ARCHIVED');
    assert.strictEqual(triggers[1].active, false);

    await assert.rejects(
        () => runtimeService.createTrigger({
            tenant: 'default',
            runtimeOperation: {
                code: 'badTriggerStatus',
                definitionCode: 'contentApproval',
                triggerType: 'CRON',
                status: 'RUNNING'
            }
        }),
        error => error.code === 'ERR_PROCESS_00015',
    );

    await assert.rejects(
        () => runtimeService.createTrigger({
            tenant: 'default',
            runtimeOperation: {
                code: 'missingDefinitionTrigger',
                definitionCode: 'missingDefinition',
                triggerType: 'CRON'
            }
        }),
        error => error.code === 'ERR_PROCESS_00002',
    );

    await assert.rejects(
        () => runtimeService.archiveTrigger({
            tenant: 'default',
            triggerCode: 'unknownTrigger'
        }),
        error => error.code === 'ERR_PROCESS_00016',
    );

    await assert.rejects(
        () => runtimeService.executeTrigger({
            tenant: 'default',
            triggerCode: 'weeklyContentApproval'
        }),
        error => error.code === 'ERR_PROCESS_00020',
    );

    await assert.rejects(
        () => runtimeService.updateTrigger({
            tenant: 'default',
            triggerCode: 'weeklyContentApproval',
            runtimeOperation: { status: 'ACTIVE' }
        }),
        error => error.code === 'ERR_PROCESS_00017',
    );

    versions.push({
        code: 'unsafeActionProcess_v1',
        definitionCode: 'unsafeActionProcess',
        version: 1,
        name: 'Unsafe Action Process',
        status: 'PUBLISHED',
        graph: {
            nodes: [
                { code: 'start', type: 'START' },
                { code: 'unsafe', type: 'ACTION', action: { moduleName: 'commerce', operation: 'chargeCustomer' } },
                { code: 'end', type: 'END' }
            ],
            transitions: [
                { code: 'start_to_unsafe', source: 'start', target: 'unsafe' },
                { code: 'unsafe_to_end', source: 'unsafe', target: 'end' }
            ]
        }
    });
    definitions.push({ code: 'unsafeActionProcess', name: 'Unsafe Action Process', status: 'PUBLISHED', currentVersion: 1 });
    await assert.rejects(
        () => runtimeService.startInstance({
            tenant: 'default',
            runtimeOperation: { definitionCode: 'unsafeActionProcess' }
        }),
        error => error.code === 'ERR_PROCESS_00019',
    );

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
