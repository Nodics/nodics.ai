/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/service/publication/DefaultCmsPublicationWorkflowService
 * @description Submits one validated CMS publication request to the fixed Process approval workflow using internal authentication and idempotent correlation.
 * @layer service
 * @owner cms
 * @override Projects may customize Process connection and approval policy while retaining Staged authority and bounded workflow context.
 */
module.exports = {
    /** Returns the Process-owned deterministic instance reference for compatibility projections. */
    reference: function (publicationRequest) {
        let crypto = require('crypto');
        return 'cmsPublicationApproval-' + crypto.createHash('sha256')
            .update(publicationRequest.code + ':' + String(publicationRequest.revision)).digest('hex').slice(0, 24);
    },
    /** Builds and validates the immutable publication approval scope. */
    scope: function (publicationRequest, request) {
        let auth = request && request.authData || {};
        let tenantCode = request && request.tenant;
        if (!tenantCode || publicationRequest.tenantCode && publicationRequest.tenantCode !== tenantCode ||
            auth.tenant && auth.tenant !== tenantCode) {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_SCOPE_INVALID', 'CMS publication tenant scope is invalid');
        }
        let enterpriseCode = publicationRequest.enterpriseCode || auth.enterpriseCode || auth.entCode;
        if (publicationRequest.enterpriseCode && auth.enterpriseCode && publicationRequest.enterpriseCode !== auth.enterpriseCode) {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_SCOPE_INVALID', 'CMS publication enterprise scope is invalid');
        }
        return {
            tenantCode: tenantCode,
            enterpriseCode: enterpriseCode,
            environmentCode: publicationRequest.environmentCode || request.environment || request.environmentCode,
            profileCode: publicationRequest.profileCode,
            siteCode: publicationRequest.siteCode,
            catalogCode: publicationRequest.catalogCode
        };
    },
    /** Starts or replays the Process approval instance for one publication. */
    requestApproval: function (publicationRequest, request) {
        let publication = (CONFIG.get('cms') || {}).publication || {};
        let workflow = publication.workflow || {};
        let target = workflow.target || {};
        if (publication.runtimeRole !== 'STAGED') throw new CLASSES.NodicsError('CMS_PUBLICATION_SOURCE_ROLE_INVALID', 'Approval can start only from CMS Staged');
        if (!target.moduleName || !target.connectionName || target.connectionName === 'default') {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_WORKFLOW_UNAVAILABLE', 'CMS publication Process target is unavailable');
        }
        let token = NODICS.getInternalAuthToken(request.tenant);
        if (!token) throw new CLASSES.NodicsError('CMS_PUBLICATION_INTERNAL_AUTH_UNAVAILABLE', 'CMS publication workflow authentication is unavailable');
        let scope = this.scope(publicationRequest, request);
        let payload = {
            publicationCode: publicationRequest.code,
            publicationRevision: publicationRequest.revision,
            sourceVersion: publicationRequest.sourceVersion,
            tenantCode: scope.tenantCode,
            enterpriseCode: scope.enterpriseCode,
            environmentCode: scope.environmentCode,
            profileCode: scope.profileCode,
            siteCode: scope.siteCode,
            catalogCode: scope.catalogCode,
            correlationId: publicationRequest.correlationId || request.correlationId || request.requestId
        };
        let requestedBy = publicationRequest.requestedBy || request.authData && (request.authData.loginId || request.authData.principalId || request.authData.code);
        if (requestedBy) payload.requestedBy = requestedBy;
        let descriptor = SERVICE.DefaultModuleService.buildRequest({ moduleName: target.moduleName,
            connectionName: target.connectionName, connectionType: target.connectionType || 'abstract', methodName: 'POST',
            apiName: '/instances/publication-approval', requestBody: payload, timeoutMs: target.timeoutMs,
            maxAttempts: target.maxAttempts, idempotencyKey: publicationRequest.code + ':' + publicationRequest.revision,
            header: { Authorization: 'Bearer ' + token } });
        return SERVICE.DefaultModuleService.fetch(descriptor).then(response => response && (response.result || response.data || response));
    }
};
