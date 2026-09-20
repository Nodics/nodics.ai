/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module rulesDefinition/src/service/defaultRuleAuditService
 * @description Persists bounded append-only Rules lifecycle/governance evidence through the generated audit service.
 * @layer service
 * @owner rulesDefinition
 */
module.exports = {
    actor: function (request) {
        let auth = request && request.authData || {};
        return auth.loginId || auth.code || auth.userId || auth.serviceId;
    },

    serviceRequest: function (request, additions) {
        return Object.assign({
            tenant: request && request.tenant,
            authData: request && request.authData,
            options: { recursive: false }
        }, additions || {});
    },

    record: async function (request, event) {
        event = event || {};
        let model = {
            ruleSetCode: event.ruleSetCode,
            bandSetCode: event.bandSetCode,
            version: event.version,
            draftRevision: event.draftRevision,
            eventType: event.eventType,
            outcome: event.outcome || 'SUCCESS',
            actor: event.actor || this.actor(request),
            correlationId: event.correlationId || request && (request.correlationId || request.requestId),
            reason: event.reason,
            metadata: event.metadata || {},
            createdAt: new Date()
        };
        Object.keys(model).forEach(key => model[key] === undefined && delete model[key]);
        if (!model.eventType) throw new Error('Rules audit event type is required');
        if (!SERVICE.DefaultRuleAuditEventService) return model;
        let response = await SERVICE.DefaultRuleAuditEventService.save(
            this.serviceRequest(request, { model: model })
        );
        return response && response.result || response;
    }
};
