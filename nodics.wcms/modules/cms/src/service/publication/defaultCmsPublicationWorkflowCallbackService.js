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
    /** Validates bounded Process evidence and advances the generic publication lifecycle. */
    applyDecision: async function (request) {
        let publication = (CONFIG.get('cms') || {}).publication || {};
        if (publication.runtimeRole !== 'STAGED') {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_SOURCE_ROLE_INVALID', 'Process decisions are accepted only by CMS Staged');
        }
        let decision = request.publicationDecision || {};
        if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(decision.publicationCode || '') ||
            !Number.isInteger(Number(decision.expectedRevision)) || typeof decision.approved !== 'boolean' ||
            decision.processDefinitionCode !== 'cmsPublicationApproval' || !Number.isInteger(Number(decision.processVersion)) ||
            Number(decision.processVersion) < 1 || !decision.processInstanceCode) {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_WORKFLOW_DECISION_INVALID', 'CMS publication workflow decision is invalid');
        }
        let lifecycleRequest = Object.assign({}, request, {
            publicationCode: decision.publicationCode,
            expectedRevision: Number(decision.expectedRevision),
            reason: decision.reason,
            correlationId: decision.correlationId || request.correlationId,
            workflowEvidence: { instanceCode: decision.processInstanceCode,
                definitionCode: decision.processDefinitionCode, version: Number(decision.processVersion) }
        });
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
