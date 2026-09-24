/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('crypto');

/** @module workflow/service/operation/DefaultProcessPublicationApprovalService @description Starts the fixed CMS publication approval workflow from bounded service-authenticated context. */
module.exports = {
    /** Builds a deterministic instance identity so response loss and retries cannot create duplicate approvals. */
    instanceCode: function (publicationCode, publicationRevision) {
        return 'cmsPublicationApproval-' + crypto.createHash('sha256')
            .update(publicationCode + ':' + String(publicationRevision)).digest('hex').slice(0, 24);
    },
    /** Resolves the publication approval diagnostic input without mutating Process runtime state. */
    diagnosticInput: function (request) {
        let input = request.publicationApprovalDiagnostic || request.publicationApproval || request.runtimeOperation || {};
        let workflowRef = input.workflowRef && String(input.workflowRef);
        let publicationCode = input.publicationCode && String(input.publicationCode);
        let publicationRevision = input.publicationRevision !== undefined ? Number(input.publicationRevision) : undefined;
        if (workflowRef && !/^cmsPublicationApproval-[A-Fa-f0-9]{24}$/.test(workflowRef)) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Publication approval workflow reference is invalid');
        }
        if (!workflowRef) {
            if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(publicationCode || '') ||
                !Number.isInteger(publicationRevision)) {
                throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Publication approval diagnostic request is invalid');
            }
            workflowRef = this.instanceCode(publicationCode, publicationRevision);
        }
        return { workflowRef: workflowRef, publicationCode: publicationCode, publicationRevision: publicationRevision };
    },
    /** Builds a stable operator-facing diagnostic payload for publication approval readiness. */
    diagnostic: function (status, input, instance, task, details) {
        details = details || {};
        let taskStatus = task && task.status ? String(task.status) : undefined;
        let assignee = task && task.assignee ? String(task.assignee) : undefined;
        let queue = task && (task.queue || task.candidateGroup || task.assignment)
            ? String(task.queue || task.candidateGroup || task.assignment) : undefined;
        let messages = {
            APPROVED: 'Publication approval is complete.',
            REJECTED: 'Publication approval was rejected.',
            WORKFLOW_DEFINITION_MISSING: 'The CMS publication approval workflow definition is not installed.',
            WORKFLOW_INSTANCE_MISSING: 'The publication approval workflow instance is missing.',
            TASK_REFERENCE_MISSING: 'Publication is pending approval, but no actionable Process task reference is available.',
            TASK_ASSIGNEE_MISSING: 'Publication approval task exists but has no assignee or review queue evidence.',
            TASK_NOT_ACTIONABLE: 'Publication approval workflow exists, but the known task is not open for decision.',
            WAITING_REVIEWER: 'Publication is waiting for reviewer decision.'
        };
        let actions = {
            APPROVED: 'Monitor Online publication',
            REJECTED: 'Resubmit publication approval',
            WORKFLOW_DEFINITION_MISSING: 'Install CMS publication approval workflow definition',
            WORKFLOW_INSTANCE_MISSING: 'Reconcile publication approval workflow instance',
            TASK_REFERENCE_MISSING: 'Reconcile publication approval task',
            TASK_ASSIGNEE_MISSING: 'Assign approval task',
            TASK_NOT_ACTIONABLE: 'Review Process workflow state',
            WAITING_REVIEWER: 'Review approval queue'
        };
        let disabled = {
            APPROVED: 'The governed Process approval has completed.',
            REJECTED: 'The governed Process approval was rejected; resubmit after correcting the source publication.',
            WORKFLOW_DEFINITION_MISSING: 'The owning Process workflow definition must be installed before approval can continue.',
            WORKFLOW_INSTANCE_MISSING: 'The owning Process workflow instance must be recreated or reconciled before approval can continue.',
            TASK_REFERENCE_MISSING: 'The publication has no actionable Process task reference; reconcile approval before continuing.',
            TASK_ASSIGNEE_MISSING: 'The Process task needs assignee or queue evidence before Axis can present a decision path.',
            TASK_NOT_ACTIONABLE: 'The Process task is not currently open, claimed, or escalated for decision.',
            WAITING_REVIEWER: 'The publication is waiting for a governed Process reviewer decision.'
        };
        return {
            source: 'PUBLICATION_APPROVAL',
            status: status,
            publicationCode: input.publicationCode,
            publicationRevision: input.publicationRevision,
            publicationState: details.publicationState,
            workflowRef: input.workflowRef,
            instanceStatus: instance && instance.status ? String(instance.status) : undefined,
            taskCode: task && task.code ? String(task.code) : undefined,
            taskStatus: taskStatus,
            assignee: assignee,
            queue: queue,
            message: messages[status] || 'Publication approval diagnostic is unavailable.',
            suggestedAction: actions[status] || 'Refresh publication approval readiness',
            disabledReason: disabled[status] || 'Process approval evidence is unavailable.',
            owner: 'PROCESS'
        };
    },
    /** Diagnoses an existing publication approval instance and task without repairing or installing anything. */
    diagnose: async function (request) {
        let input = this.diagnosticInput(request);
        let definition = await SERVICE.DefaultProcessDefinitionService.get({ tenant: request.tenant,
            query: { code: 'cmsPublicationApproval' }, searchOptions: { limit: 1 }, authData: request.authData })
            .then(response => response && response.result && response.result[0]);
        if (!definition) return { code: 'SUC_PROCESS_00008',
            data: this.diagnostic('WORKFLOW_DEFINITION_MISSING', input) };
        let instance = await SERVICE.DefaultProcessInstanceService.get({ tenant: request.tenant,
            query: { code: input.workflowRef }, searchOptions: { limit: 1 }, authData: request.authData })
            .then(response => response && response.result && response.result[0]);
        if (!instance) return { code: 'SUC_PROCESS_00008',
            data: this.diagnostic('TASK_REFERENCE_MISSING', input) };
        let taskResponse = await SERVICE.DefaultProcessTaskService.get({ tenant: request.tenant,
            query: { instanceCode: instance.code, status: { $in: ['OPEN', 'CLAIMED', 'ESCALATED'] } },
            searchOptions: { limit: 1 }, authData: request.authData });
        let task = taskResponse && taskResponse.result && taskResponse.result[0];
        if (!task) {
            let fallback = await SERVICE.DefaultProcessTaskService.get({ tenant: request.tenant,
                query: { instanceCode: instance.code }, searchOptions: { limit: 1 }, authData: request.authData });
            task = fallback && fallback.result && fallback.result[0];
        }
        if (['COMPLETED', 'APPROVED'].includes(String(instance.status || '').toUpperCase())) {
            return { code: 'SUC_PROCESS_00008', data: this.diagnostic('APPROVED', input, instance, task) };
        }
        if (String(instance.status || '').toUpperCase() === 'REJECTED') {
            return { code: 'SUC_PROCESS_00008', data: this.diagnostic('REJECTED', input, instance, task) };
        }
        if (!task) return { code: 'SUC_PROCESS_00008',
            data: this.diagnostic('TASK_REFERENCE_MISSING', input, instance) };
        if (!['OPEN', 'CLAIMED', 'ESCALATED'].includes(String(task.status || ''))) {
            return { code: 'SUC_PROCESS_00008', data: this.diagnostic('TASK_NOT_ACTIONABLE', input, instance, task) };
        }
        if (task.requiresAssignee === true && !task.assignee && !task.queue && !task.candidateGroup && !task.assignment) {
            return { code: 'SUC_PROCESS_00008', data: this.diagnostic('TASK_ASSIGNEE_MISSING', input, instance, task) };
        }
        return { code: 'SUC_PROCESS_00008', data: this.diagnostic('WAITING_REVIEWER', input, instance, task) };
    },
    /** Ensures the framework-owned approval definition through the governed nImport contribution installer. */
    ensureDefinition: async function (request) {
        let definition = await SERVICE.DefaultProcessDefinitionService.get({ tenant: request.tenant,
            query: { code: 'cmsPublicationApproval' }, searchOptions: { limit: 1 }, authData: request.authData })
            .then(response => response && response.result && response.result[0]);
        if (definition) return definition;
        await SERVICE.DefaultDataReleaseService.execute({ tenant: request.tenant, authData: request.authData,
            releaseRequest: { dataType: 'init', releaseCodes: ['cms:cmsPublicationApproval'],
                expectedReleases: { 'cms:cmsPublicationApproval': '1.0.0' } } });
        definition = await SERVICE.DefaultProcessDefinitionService.get({ tenant: request.tenant,
            query: { code: 'cmsPublicationApproval' }, searchOptions: { limit: 1 }, authData: request.authData })
            .then(response => response && response.result && response.result[0]);
        if (!definition) throw new CLASSES.NodicsError('ERR_PROCESS_00002', 'CMS publication approval definition installation failed');
        return definition;
    },
    /** Repairs only a missing human task for an existing waiting publication instance. */
    repairWaitingTask: async function (request, instance) {
        let lifecycle = SERVICE.DefaultProcessRuntimeLifecycleService;
        let taskResponse = await SERVICE.DefaultProcessTaskService.get({ tenant: request.tenant,
            query: { instanceCode: instance.code, status: { $in: ['OPEN', 'CLAIMED', 'ESCALATED'] } },
            searchOptions: { limit: 1 }, authData: request.authData });
        let existingTask = taskResponse && taskResponse.result && taskResponse.result[0];
        if (existingTask || instance.status !== 'WAITING' || !instance.currentNode) return existingTask;
        let version = await lifecycle.requireVersion(request, instance.definitionCode, instance.version);
        let node = lifecycle.findNode(version.graph || {}, instance.currentNode);
        if (!node || node.type !== 'TASK') {
            throw new CLASSES.NodicsError('ERR_PROCESS_00013', 'Waiting publication instance is not positioned at a human task');
        }
        return lifecycle.createTaskForNode(request, instance, node, {
            taskCode: (instance.code + '-' + node.code).slice(0, 128)
        });
    },
    /** Starts or returns the existing approval instance for one immutable publication request. */
    start: async function (request) {
        let input = request.publicationApproval || request.runtimeOperation || {};
        if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(input.publicationCode || '') ||
            !Number.isInteger(Number(input.publicationRevision)) || !input.sourceVersion || !input.correlationId) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Publication approval request is invalid');
        }
        await this.ensureDefinition(request);
        let instanceCode = this.instanceCode(input.publicationCode, Number(input.publicationRevision));
        let existing = await SERVICE.DefaultProcessInstanceService.get({ tenant: request.tenant, query: { code: instanceCode },
            searchOptions: { limit: 1 }, authData: request.authData }).then(response => response && response.result && response.result[0]);
        if (existing) {
            let task = await this.repairWaitingTask(request, existing);
            return { code: 'SUC_PROCESS_00007', data: { instance: existing, task: task, replay: true } };
        }
        let context = {
            publicationCode: input.publicationCode,
            publicationRevision: Number(input.publicationRevision),
            sourceVersion: String(input.sourceVersion),
            tenantCode: input.tenantCode && String(input.tenantCode),
            enterpriseCode: input.enterpriseCode && String(input.enterpriseCode),
            environmentCode: input.environmentCode && String(input.environmentCode),
            profileCode: input.profileCode && String(input.profileCode),
            siteCode: input.siteCode && String(input.siteCode),
            catalogCode: input.catalogCode && String(input.catalogCode),
            requestedBy: input.requestedBy && String(input.requestedBy),
            correlationId: String(input.correlationId)
        };
        Object.keys(context).forEach(key => context[key] === undefined && delete context[key]);
        if (Buffer.byteLength(JSON.stringify(context), 'utf8') > 65536) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Publication approval context exceeds the allowed boundary');
        }
        return SERVICE.DefaultProcessRuntimeLifecycleService.startInstance(Object.assign({}, request, {
            runtimeOperation: { definitionCode: 'cmsPublicationApproval', instanceCode: instanceCode,
                name: 'CMS Publication ' + input.publicationCode, context: context }
        }));
    }
};
