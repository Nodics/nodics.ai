/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module engagementComms/src/service/defaultEngagementCommunicationService @description Translates bounded Engagement scenarios into the one-way provider-neutral Communication request port. @layer service @owner engagementComms @override Projects may map additional scenarios without taking template or transport authority. */
module.exports = {
    /** Resolves the Engagement source module for correlation only. */ sourceModule: function (domainType) { return { CONTACT: 'contactSubmission', FEEDBACK: 'customerFeedback', REVIEW: 'customerReview', TESTIMONIAL: 'testimonial' }[domainType] || 'engagementCore'; },
    /** Requests communication while guaranteeing provider failure cannot change domain state. */ request: async function (context, port, policy) { policy = policy || {}; if (!policy.enabled) return { status: 'DEFERRED', reason: 'BRIDGE_DISABLED', domainStateChanged: false, correlationId: context.correlationId }; let templateCode = context.templateCode || (policy.acknowledgementTemplates || {})[context.domainType]; if (!templateCode) throw new Error('engagement communication scenario is not mapped'); let purpose = context.purpose || 'TRANSACTIONAL'; if (!(policy.allowedPurposes || []).includes(purpose)) throw new Error('engagement communication purpose is not allowed'); let command = { tenant: context.tenant, sourceModule: this.sourceModule(context.domainType), sourceType: context.domainType, sourceCode: context.domainCode, templateCode: templateCode, recipientId: context.recipientId, recipientAddressReference: context.recipientAddressReference, purpose: purpose, channel: context.channel || policy.defaultChannel, locale: context.locale || 'en', variables: context.variables || {}, idempotencyKey: context.idempotencyKey || ['engagement', context.domainType, context.domainCode, templateCode].join(':'), expiresAt: context.expiresAt, correlationId: context.correlationId }; try { let result = await port.request(command); return { intentCode: result.intentCode, status: result.status, providerReference: result.providerReference, correlationId: result.correlationId }; } catch (error) { return { status: 'DEFERRED', reason: 'COMMUNICATION_UNAVAILABLE', errorCode: error.code, domainStateChanged: false, correlationId: context.correlationId }; } }
};
