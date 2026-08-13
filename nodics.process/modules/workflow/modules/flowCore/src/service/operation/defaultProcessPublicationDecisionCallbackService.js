/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module flowCore/service/operation/DefaultProcessPublicationDecisionCallbackService
 * @description Returns a bounded workflow decision to the configured domain publication authority using internal service authentication.
 * @layer service
 * @owner flowCore
 * @override Projects may replace transport or connection coordinates while preserving allowlisted context, service identity, idempotency, and domain ownership.
 */
module.exports = {
    /** Sends the CMS publication decision without carrying CMS content through Process. */
    applyPublicationDecision: function (request, execution) {
        let policy = ((CONFIG.get('process') || {}).publicationDecisionCallback) || {};
        let target = policy.target || {};
        let context = execution && execution.context || {};
        let decision = execution && execution.decision || {};
        if (!context.publicationCode || typeof decision.approved !== 'boolean') {
            throw new CLASSES.NodicsError('ERR_PROCESS_00019', 'Publication decision callback context is invalid');
        }
        if (!target.moduleName || !target.connectionName || target.connectionName === 'default') {
            throw new CLASSES.NodicsError('ERR_PROCESS_00019', 'Publication decision callback target is unavailable');
        }
        let token = NODICS.getInternalAuthToken(request.tenant);
        if (!token) throw new CLASSES.NodicsError('ERR_PROCESS_00019', 'Publication decision callback authentication is unavailable');
        let payload = {
            publicationCode: context.publicationCode,
            expectedRevision: context.publicationRevision,
            approved: decision.approved,
            reason: decision.reason,
            processInstanceCode: execution.instance && execution.instance.code,
            processDefinitionCode: execution.instance && execution.instance.definitionCode,
            processVersion: execution.instance && execution.instance.version,
            correlationId: context.correlationId || request.correlationId || request.requestId
        };
        let descriptor = SERVICE.DefaultModuleService.buildRequest({
            moduleName: target.moduleName,
            connectionName: target.connectionName,
            connectionType: target.connectionType || 'abstract',
            methodName: 'POST',
            apiName: '/publication/process/decision',
            requestBody: payload,
            timeoutMs: target.timeoutMs,
            maxAttempts: target.maxAttempts,
            idempotencyKey: payload.processInstanceCode + ':' + payload.publicationCode,
            header: { Authorization: 'Bearer ' + token }
        });
        return SERVICE.DefaultModuleService.fetch(descriptor).then(response => ({
            status: 'COMPLETED',
            adapter: 'cms.applyPublicationDecision',
            output: { publicationCode: payload.publicationCode, approved: payload.approved,
                resultCode: response && response.code }
        }));
    }
};
