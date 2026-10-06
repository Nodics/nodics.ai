/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/*
 * Nodics - Enterprise Micro-Services Management Framework
 * Copyright (c) 2026 Nodics. Governed by the root LICENSE.
 */

/**
 * @module workflow/test/processCompletedDecisionRetry
 * @description Exercises real incident retry, adapter selection and CMS callback over isolated owner records; no runtime, database or remote publication writes.
 * @layer test
 * @owner workflow
 */
const assert = require('assert');
const clone = value => structuredClone(value);
const lifecycle = require('../src/service/operation/defaultProcessRuntimeLifecycleService');
const registry = require('../src/service/operation/defaultProcessActionAdapterRegistryService');
const callback = require('../src/service/operation/defaultProcessPublicationDecisionCallbackService');
const defaults = require('../config/properties').process;
const definition = require('../../../../nodics.wcms/modules/cms/data/init-v001/records/process/cmsPublicationApprovalDefinitionData').definitions[0];
let checks = 0;
function fixture(approved = true) {
    const instance = { code: 'publication-1', definitionCode: definition.code, version: 1,
        status: 'FAILED', currentNode: 'applyDecision', incidentCode: 'incident-1',
        context: { publicationCode: 'baseline-1', publicationRevision: 4, correlationId: 'original-correlation' } };
    const task = { code: 'review-1', instanceCode: instance.code, nodeCode: 'publicationReview',
        status: 'COMPLETED', completedBy: 'original-reviewer', completedAt: '2026-10-01T10:00:00Z',
        decision: { approved, reason: approved ? 'Original approval' : 'Original rejection' } };
    const incident = { code: instance.incidentCode, instanceCode: instance.code, nodeCode: instance.currentNode,
        status: 'OPEN', attempt: 1, maximumAttempts: 3 };
    const version = { definitionCode: definition.code, version: 1, status: 'PUBLISHED', graph: clone(definition.graph) };
    const state = { instance, task, incident, version, taskRows: [task], descriptors: [], audits: [], failure: false };
    const owner = rows => ({
        get: async request => ({ code: 'SUC_DBS_00000', result: rows().filter(row =>
            Object.entries(request.query || {}).every(([key, value]) => row[key] === value)).map(clone) }),
        update: async request => {
            let count = 0;
            for (const row of rows()) if (Object.entries(request.query || {}).every(([key, value]) => row[key] === value)) {
                Object.assign(row, clone(request.model.$set || request.model)); count++;
            }
            return { code: 'SUC_DBS_00000', acknowledged: true, result: { n: count, acknowledged: true } };
        },
        save: async request => { state.audits.push(clone(request.model)); return { result: clone(request.model) }; },
    });
    const process = clone(defaults);
    process.actionAdapters.allowedActions = ['cms.applyPublicationDecision'];
    process.publicationDecisionCallback = { target: { moduleName: 'cms', connectionName: 'cmsStaged' } };
    global.CONFIG = { get: key => key === 'process' ? process : key === 'defaultTenant' ? 'default' : undefined };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
    global.NODICS = { getInternalAuthToken: () => 'test-runtime-token' };
    global.SERVICE = {
        DefaultModelsUpdateInitializerService: require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService'),
        DefaultProcessInstanceService: owner(() => [instance]), DefaultProcessTaskService: owner(() => state.taskRows),
        DefaultProcessIncidentService: owner(() => [incident]), DefaultProcessDefinitionVersionService: owner(() => [version]),
        DefaultProcessAuditEventService: owner(() => []), DefaultProcessRuntimeLifecycleService: lifecycle,
        DefaultProcessActionAdapterRegistryService: registry, DefaultProcessPublicationDecisionCallbackService: callback,
        DefaultModuleService: { invokeModule: async descriptor => {
            state.descriptors.push(clone(descriptor.requestBody));
            if (state.failure) throw new Error('Temporary callback transport failure');
            return descriptor.responseSelector({ code: 'SUC_CMS_00000' });
        } },
    };
    state.request = { tenant: 'default', authData: { loginId: 'recovery-operator' }, instanceCode: instance.code,
        runtimeOperation: { expectedAttempt: 1, decision: { approved: !approved, reason: 'Forged retry decision' },
            context: { publicationCode: 'wrong-publication' } } };
    return state;
}
(async () => {
    for (const approved of [true, false]) {
        const f = fixture(approved);
        f.version.policy = clone(definition.policy);
        f.instance.status = 'WAITING'; f.instance.currentNode = 'publicationReview';
        f.task.status = 'CLAIMED'; f.task.assignee = 'original-reviewer';
        f.request.authData.loginId = 'original-reviewer'; f.request.taskCode = f.task.code;
        const decision = { approved, outcome: approved ? 'approved-from-documentation-dashboard' : 'rejected-from-documentation-dashboard',
            reason: approved ? 'Framework documentation publication approved from Documentation publication center'
                : 'Framework documentation publication rejected from Documentation publication center' };
        f.request.runtimeOperation = { decision: clone(decision) };
        await lifecycle.completeTask(f.request);
        assert.strictEqual(f.instance.status, 'COMPLETED');
        assert.strictEqual(f.task.status, 'COMPLETED');
        assert.strictEqual(f.task.completedBy, 'original-reviewer');
        assert.deepStrictEqual(f.task.decision, decision);
        assert.strictEqual(f.descriptors[0].approved, approved);
        assert.strictEqual(f.descriptors[0].reason, decision.reason);
        assert.strictEqual(Object.hasOwn(f.descriptors[0], 'outcome'), false, 'descriptive outcome is not publication callback authority');
        checks++;
    }
    {
        const f = fixture(), original = clone(f.task);
        f.task.decision.outcome = 'approved-from-documentation-dashboard';
        original.decision.outcome = f.task.decision.outcome;
        f.request.runtimeOperation.decision.outcome = 'forged-retry-outcome';
        await lifecycle.retryInstance(f.request);
        assert.strictEqual(f.instance.status, 'COMPLETED');
        assert.deepStrictEqual(f.task, original);
        assert.strictEqual(f.descriptors[0].approved, true);
        assert.strictEqual(f.descriptors[0].reason, original.decision.reason);
        checks++;
    }
    for (const approved of [true, false]) {
        const f = fixture(approved), original = clone(f.task);
        const result = await lifecycle.retryInstance(f.request);
        assert.strictEqual(result.code, 'SUC_PROCESS_00012');
        assert.strictEqual(f.instance.status, 'COMPLETED');
        assert.strictEqual(f.incident.status, 'RESOLVED');
        assert.strictEqual(f.descriptors[0].approved, approved);
        assert.strictEqual(f.descriptors[0].reason, original.decision.reason);
        assert.strictEqual(f.descriptors[0].publicationCode, 'baseline-1');
        assert.strictEqual(f.descriptors[0].expectedRevision, 4);
        assert.strictEqual(f.descriptors[0].correlationId, 'original-correlation');
        assert.deepStrictEqual(f.task, original);
        assert(f.audits.every(item => item.actor === 'recovery-operator'));
        checks++;
    }
    for (const approved of [true, false]) {
        const f = fixture(approved);
        f.task.decision.action = approved ? 'APPROVE' : 'REJECT';
        const original = clone(f.task);
        await lifecycle.retryInstance(f.request);
        assert.strictEqual(f.instance.status, 'COMPLETED');
        assert.deepStrictEqual(f.task, original);
        assert.strictEqual(f.descriptors[0].approved, approved);
        assert.strictEqual(Object.hasOwn(f.descriptors[0], 'action'), false);
        checks++;
    }
    const invalid = [
        f => { f.task.status = 'CANCELLED'; },
        f => { f.task.instanceCode = 'other-instance'; },
        f => { f.task.completedBy = ''; },
        f => { f.task.completedAt = 'invalid'; },
        f => { f.task.completedAt = null; },
        f => { f.task.decision = {}; },
        f => { f.task.decision.outcome = { approved: true }; },
        f => { f.task.decision.outcome = 'x'.repeat(257); },
        f => { f.task.decision.outcome = ' '; },
        f => { f.task.decision.arbitraryGrant = true; },
        f => { f.task.decision.action = 'REJECT'; },
        f => { f.task.decision.action = 'APPROVE_AND_ACTIVATE'; },
        f => { f.task.decision.action = { approved: true }; },
        f => {
            f.task.decision.action = 'APPROVE';
            f.version.policy = { decisionContract: { contractVersion: 1, kind: 'APPROVAL', approveLabel: 'Approve',
                rejectLabel: 'Reject', reasonLabel: 'Reason', rejectionReasonRequired: true, maximumReasonLength: 1000 } };
        },
        f => {
            f.task.decision.outcome = 'approved-from-documentation-dashboard';
            f.version.policy = { decisionContract: { contractVersion: 1, kind: 'APPROVAL', approveLabel: 'Approve',
                rejectLabel: 'Reject', reasonLabel: 'Reason', rejectionReasonRequired: true, maximumReasonLength: 1000 } };
        },
        f => { f.taskRows.push({ ...clone(f.task), code: 'ambiguous-review' }); },
        f => { f.version.graph.transitions.find(t => t.code === 'review_to_decision').target = 'end'; },
        f => {
            f.version.graph.nodes.push({ code: 'anotherReview', type: 'TASK' });
            f.version.graph.transitions.push({ source: 'anotherReview', target: 'applyDecision' });
        },
    ];
    {
        const f = fixture(), original = clone(f.task);
        f.incident.attempt = 2;
        f.request.runtimeOperation.expectedAttempt = 2;
        await lifecycle.retryInstance(f.request);
        assert.strictEqual(f.incident.attempt, 3);
        assert.strictEqual(f.incident.status, 'RESOLVED');
        assert.strictEqual(f.instance.status, 'COMPLETED');
        assert.deepStrictEqual(f.task, original);
        assert.strictEqual(f.descriptors[0].approved, true);
        checks++;
    }
    for (const mutate of invalid) {
        const f = fixture(); mutate(f);
        await assert.rejects(lifecycle.retryInstance(f.request), error => error.code === 'ERR_PROCESS_00019');
        assert.strictEqual(f.descriptors.length, 0);
        assert.strictEqual(f.instance.status, 'FAILED');
        checks++;
    }
    {
        const f = fixture();
        SERVICE.DefaultProcessTaskService.get = async () => ({ code: 'ERR_DBS_00000', result: [clone(f.task)] });
        await assert.rejects(lifecycle.retryInstance(f.request), error => error.code === 'ERR_PROCESS_00019');
        assert.strictEqual(f.descriptors.length, 0);
        checks++;
    }
    {
        const f = fixture(), original = clone(f.task);
        f.instance.status = 'WAITING'; f.instance.currentNode = 'publicationReview';
        await lifecycle.executeActionNode(f.request, f.instance, f.version,
            lifecycle.findNode(f.version.graph, 'applyDecision'), f.request.runtimeOperation);
        assert.strictEqual(f.descriptors[0].approved, true);
        assert.deepStrictEqual(f.task, original);
        checks++;
    }
    {
        const f = fixture(), original = clone(f.task);
        f.failure = true;
        await assert.rejects(lifecycle.retryInstance(f.request), /Temporary callback transport failure/);
        assert.strictEqual(f.instance.status, 'FAILED');
        assert.deepStrictEqual(f.task, original);
        f.failure = false; f.request.runtimeOperation.expectedAttempt = 2;
        await lifecycle.retryInstance(f.request);
        assert.strictEqual(f.instance.status, 'COMPLETED');
        assert.deepStrictEqual(f.descriptors[0], f.descriptors[1]);
        checks++;
    }
    console.log('Completed decision retry: ' + checks + ' scenarios passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
