/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/service/publication/DefaultCmsPublicationWorkflowCallbackService
 * @description Applies an authenticated Process decision to the Staged nPublish lifecycle and activates only approved immutable releases.
 * @layer service
 * @owner cms
 * @override Projects may narrow workflow policy while retaining exact definition/version binding, optimistic revision, idempotency, and Staged-only authority.
 */
module.exports = {
    /** Verifies replay against this exact decision and its uninterrupted committed lifecycle journal. */
    assertDecisionReceipt: function (publication, decision) {
        const expected = Number(decision.expectedRevision);
        const approved = decision.approved;
        const states = approved ? ['APPROVED', 'ACTIVATING', 'ONLINE'] : ['REJECTED'];
        const offset = states.indexOf(publication.state);
        const entries = [].concat(publication.auditTrail || []).filter(entry => entry.revision > expected);
        if (offset < 0 || publication.revision !== expected + offset + 1 || entries.length !== offset + 1)
            throw new CLASSES.NodicsError('CMS_PUBLICATION_WORKFLOW_DECISION_INVALID', 'The original publication decision is not current');
        for (let index = 0; index < entries.length; index++) {
            const entry = entries[index];
            if (entry.publicationCode !== publication.code || entry.revision !== expected + index + 1 ||
                entry.fromState !== (index === 0 ? 'PENDING_APPROVAL' : states[index - 1]) ||
                entry.toState !== states[index] || entry.correlationId !== publication.correlationId)
                throw new CLASSES.NodicsError('CMS_PUBLICATION_WORKFLOW_DECISION_INVALID', 'The original publication decision journal is incomplete');
        }
        const evidence = entries[0].details?.workflow;
        if (!evidence || evidence.instanceCode !== decision.processInstanceCode ||
            evidence.definitionCode !== decision.processDefinitionCode || evidence.version !== Number(decision.processVersion) ||
            entries[0].reason !== decision.reason || publication.state === 'ONLINE' &&
            (!publication.targetVersion || entries.at(-1).details?.version !== publication.targetVersion))
            throw new CLASSES.NodicsError('CMS_PUBLICATION_WORKFLOW_DECISION_INVALID', 'Publication decision replay does not match its committed evidence');
    },
    /** Validates bounded Process evidence and advances the generic publication lifecycle. */
    applyDecision: async function (request) {
        let publication = (CONFIG.get('cms') || {}).publication || {};
        if (publication.runtimeRole !== 'STAGED') {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_SOURCE_ROLE_INVALID', 'Process decisions are accepted only by CMS Staged');
        }
        SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'workflow');
        let decision = request.publicationDecision || {};
        if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(decision.publicationCode || '') ||
            !Number.isSafeInteger(Number(decision.expectedRevision)) || Number(decision.expectedRevision) < 0 || typeof decision.approved !== 'boolean' ||
            decision.processDefinitionCode !== 'cmsPublicationApproval' || !Number.isInteger(Number(decision.processVersion)) ||
            Number(decision.processVersion) < 1 || decision.processInstanceCode !==
                SERVICE.DefaultCmsPublicationWorkflowService.reference({
                    code: decision.publicationCode,
                    revision: Number(decision.expectedRevision)
                })) {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_WORKFLOW_DECISION_INVALID', 'CMS publication workflow decision is invalid');
        }
        // Elevation is local to CMS Staged and occurs only after the fixed Process runtime and
        // deterministic workflow identity have both been verified.
        let lifecycleRequest = Object.assign({}, request, {
            authData: Object.assign({}, request.authData,
                SERVICE.DefaultIdentityGovernanceService.getSystemAuthData()),
            publicationCode: decision.publicationCode,
            expectedRevision: Number(decision.expectedRevision),
            reason: decision.reason,
            correlationId: decision.correlationId || request.correlationId,
            workflowEvidence: { instanceCode: decision.processInstanceCode,
                definitionCode: decision.processDefinitionCode, version: Number(decision.processVersion) }
        });
        const current = await SERVICE.DefaultPublicationLifecycleService.get(lifecycleRequest);
        if (current.domain !== 'cms' || current.workflowRef !== decision.processInstanceCode ||
            !decision.correlationId || current.correlationId !== decision.correlationId)
            throw new CLASSES.NodicsError('CMS_PUBLICATION_WORKFLOW_DECISION_INVALID', 'Publication decision does not match the pending workflow');
        if (current.state !== 'PENDING_APPROVAL') {
            this.assertDecisionReceipt(current, decision);
            if (['ONLINE', 'REJECTED'].includes(current.state)) return {
                publicationCode: current.code, state: current.state, revision: current.revision,
                ...(current.state === 'ONLINE' ? { targetVersion: current.targetVersion } : {})
            };
            const online = await SERVICE.DefaultPublicationLifecycleService.activate(Object.assign({}, lifecycleRequest, {
                expectedRevision: current.revision
            }));
            return { publicationCode: online.code, state: online.state, revision: online.revision, targetVersion: online.targetVersion };
        }
        if (current.revision !== Number(decision.expectedRevision))
            throw new CLASSES.NodicsError('CMS_PUBLICATION_WORKFLOW_DECISION_INVALID', 'Publication decision revision changed');
        if (!decision.approved) {
            let rejected = await SERVICE.DefaultPublicationLifecycleService.reject(lifecycleRequest);
            return { publicationCode: rejected.code, state: rejected.state, revision: rejected.revision };
        }
        let approved = await SERVICE.DefaultPublicationLifecycleService.approve(lifecycleRequest);
        let online = await SERVICE.DefaultPublicationLifecycleService.activate(Object.assign({}, lifecycleRequest, {
            expectedRevision: approved.revision
        }));
        return { publicationCode: online.code, state: online.state, revision: online.revision,
            targetVersion: online.targetVersion };
    }
};
