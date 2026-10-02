/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nPublish/service/DefaultPublicationApprovalCallbackService @description Claims Process-owned approval evidence before bounded publication transitions. @layer service @owner nPublish @override Preserve runtime principal verification, exact publication correlation, CAS transitions and committed-decision replay checks. */
module.exports = {
    /** Returns the configured bridge service through the loader-visible owner. */
    workflow: function () { return SERVICE.DefaultPublicationApprovalWorkflowService; },

    /** Claims a single current action; controller scope is trusted code, never request data. */
    claimExecution: async function (request, scope) {
        const workflow = this.workflow();
        const policy = workflow.policy(scope && scope.domain);
        workflow.assertSource(policy);
        if (!scope || scope.actionKey !== policy.actionKey) {
            throw new CLASSES.NodicsError('ERR_PUB_00002', 'Publication callback owner does not match');
        }
        const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'workflow');
        const input = request.httpRequest && request.httpRequest.body;
        if (!input || Array.isArray(input) || Object.keys(input).length !== 2 ||
            !Object.keys(input).every(key => ['instanceCode', 'executionCode'].includes(key)) ||
            typeof input.instanceCode !== 'string' || !/^publicationApproval-[a-f0-9]{64}$/.test(input.instanceCode) ||
            typeof input.executionCode !== 'string' ||
            !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(input.executionCode)) {
            throw new CLASSES.NodicsError('ERR_PUB_00000', 'Publication Process execution handle is invalid');
        }
        const target = workflow.target();
        const execution = await SERVICE.DefaultModuleService.invokeModule({
            moduleName: 'workflow', connectionName: target.connectionName,
            connectionType: target.connectionType, targetAuthority: { runtimeRole: target.runtimeRole },
            local: false, tenant: request.tenant,
            header: { tenant: request.tenant, 'x-enterprise-code': auth.entCode },
            methodName: 'POST', apiName: '/instances/' + encodeURIComponent(input.instanceCode) + '/actions/claim',
            requestBody: { executionCode: input.executionCode, actionKey: policy.actionKey,
                sourceRuntimeInstanceId: auth.runtimeInstanceId },
            timeoutMs: target.timeoutMs, maxAttempts: 1,
            responseSelector: response => response && (response.data || response.result) || response,
        });
        const instance = execution && execution.instance;
        const context = instance && instance.context;
        if (!instance || instance.code !== input.instanceCode || instance.definitionCode !== policy.definitionCode ||
            !Number.isSafeInteger(instance.version) || instance.version < 1 ||
            execution.executionCode !== input.executionCode || !execution.nodeCode || !execution.taskCode || !execution.actor ||
            !context || context.domain !== scope.domain || context.definitionCode !== policy.definitionCode ||
            context.actionKey !== policy.actionKey || context.ownerModule !== policy.ownerModule ||
            context.workflowRef !== instance.code || context.tenantCode !== request.tenant ||
            context.enterpriseCode !== auth.entCode) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Claimed publication Process context does not match');
        }
        workflow.requireText(context.publicationCode, 'code');
        workflow.requireText(context.correlationId, 'correlation');
        if (!Number.isSafeInteger(context.publicationRevision) || context.publicationRevision < 1) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Claimed publication revision is invalid');
        }
        ['nodeCode', 'taskCode', 'actor'].forEach(key => workflow.requireText(execution[key], key));
        const reference = workflow.reference({ code: context.publicationCode, domain: context.domain,
            rootType: context.rootType, rootCode: context.rootCode, sourceVersion: context.sourceVersion,
            correlationId: context.correlationId, revision: context.publicationRevision });
        if (reference !== instance.code) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Claimed publication source identity does not match');
        }
        return execution;
    },

    /** Accepts only a consistent completed Process task decision. */
    decision: function (execution) {
        const decision = execution.body && execution.body.decision || {};
        const action = decision.action ||
            (decision.approved === true ? 'APPROVE' : decision.approved === false ? 'REJECT' : undefined);
        if (!['APPROVE', 'REJECT'].includes(action) ||
            (decision.approved !== undefined && decision.approved !== (action === 'APPROVE'))) {
            throw new CLASSES.NodicsError('ERR_PUB_00000', 'Claimed publication decision is invalid');
        }
        return action;
    },

    /** Builds bounded evidence for nPublish's atomic transition journal. */
    evidence: function (execution, action) {
        const context = execution.instance.context;
        return { instanceCode: execution.instance.code, definitionCode: execution.instance.definitionCode,
            version: execution.instance.version, actionKey: context.actionKey,
            publicationCode: context.publicationCode, publicationRevision: context.publicationRevision,
            sourceVersion: context.sourceVersion, tenantCode: context.tenantCode,
            enterpriseCode: context.enterpriseCode, correlationId: context.correlationId,
            taskCode: execution.taskCode, nodeCode: execution.nodeCode, actor: execution.actor,
            executionCode: execution.executionCode, action };
    },

    /** Requires the committed decision, allowing only the execution handle to change on a governed retry. */
    assertCommitted: function (publication, evidence, state) {
        const entry = (publication.auditTrail || []).find(item =>
            item.toState === state && item.revision === evidence.publicationRevision + 1);
        const stored = entry && entry.details && entry.details.workflow;
        if (!entry || entry.publicationCode !== publication.code || entry.correlationId !== evidence.correlationId ||
            !stored || Object.keys(evidence).some(key => key !== 'executionCode' && stored[key] !== evidence[key])) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication has no matching committed Process decision');
        }
    },

    /** Applies only a claimed decision through existing nPublish approve/reject/activate operations. */
    applyDecision: async function (request, scope) {
        const execution = await this.claimExecution(request, scope);
        const action = this.decision(execution);
        const context = execution.instance.context;
        // Elevation is target-local and occurs only after Process grants the exact action.
        const local = { tenant: request.tenant, authData: Object.assign({}, request.authData,
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData()),
            publicationCode: context.publicationCode, correlationId: context.correlationId };
        const lifecycle = SERVICE.DefaultPublicationLifecycleService;
        let publication = await lifecycle.get(local);
        const expected = this.workflow().context(Object.assign({}, publication,
            { revision: context.publicationRevision }), local);
        if ((expected.workflowVersion !== undefined && execution.instance.version !== expected.workflowVersion) ||
            Object.keys(expected).some(key => context[key] !== expected[key])) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication no longer matches the claimed source');
        }
        const evidence = this.evidence(execution, action);
        const decisionState = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        local.workflowEvidence = evidence;
        if (publication.state === 'PENDING_APPROVAL') {
            if (publication.revision !== context.publicationRevision) {
                throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication approval revision conflict');
            }
            local.expectedRevision = publication.revision;
            publication = await lifecycle[action === 'APPROVE' ? 'approve' : 'reject'](local);
        }
        this.assertCommitted(publication, evidence, decisionState);
        const offsets = action === 'APPROVE' ? { APPROVED: 1, ACTIVATING: 2, ONLINE: 3 } : { REJECTED: 1 };
        if (!offsets[publication.state] || publication.revision !== context.publicationRevision + offsets[publication.state]) {
            throw new CLASSES.NodicsError('ERR_PUB_00005', 'Publication requires a new governed approval cycle');
        }
        if (action === 'APPROVE' && publication.state !== 'ONLINE') {
            publication = await lifecycle.activate(Object.assign({}, local, { expectedRevision: publication.revision }));
        }
        this.assertCommitted(publication, evidence, decisionState);
        if (publication.state !== (action === 'APPROVE' ? 'ONLINE' : 'REJECTED') ||
            publication.revision !== context.publicationRevision + (action === 'APPROVE' ? 3 : 1)) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication completion does not match the claimed decision');
        }
        return { status: 'COMPLETED', output: { publicationCode: publication.code, state: publication.state,
            revision: publication.revision, targetVersion: publication.targetVersion } };
    },
};
