/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require('crypto');
/** @module customerReview/src/service/defaultCustomerReviewSyndicationService @description Validates traceable licensed review imports and provider-neutral reconciliation evidence. @layer service @owner customerReview @override Provider modules may map external payloads but must preserve origin, license, disclosure, target, moderation, and idempotency evidence. */
module.exports = {
    /** Maps one external review into quarantine-first syndication evidence. */
    receive: function (payload, command, policy) { policy = policy || {}; if (!payload.externalReviewId || !payload.externalTargetId || !command.targetCode) { let error = new Error('external identity and governed target mapping are required'); error.code = 'ERR_REVIEW_00019'; throw error; } if (policy.requireLicense !== false && !payload.licenseCode) { let error = new Error('review syndication license is required'); error.code = 'ERR_REVIEW_00020'; throw error; } if (policy.requireDisclosure !== false && !payload.disclosure) { let error = new Error('review origin disclosure is required'); error.code = 'ERR_REVIEW_00020'; throw error; } let sourceHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex'); return { tenant: command.tenant, direction: 'IMPORT', providerCode: command.providerCode, externalReviewId: payload.externalReviewId, externalTargetId: payload.externalTargetId, targetType: command.targetType, targetCode: command.targetCode, originUrl: payload.originUrl, licenseCode: payload.licenseCode, disclosure: payload.disclosure, sourceHash: sourceHash, mappingVersion: policy.mappingVersion || '1', moderationEvidence: { required: true, sourceStatus: payload.moderationStatus, receivedAt: command.now || new Date() }, status: 'QUARANTINED', correlationId: command.correlationId }; },
    /** Returns idempotent replay, reconcile, or conflict action. */
    replay: function (existing, incoming) { if (!existing) return { action: 'CREATE' }; if (existing.sourceHash === incoming.sourceHash && existing.mappingVersion === incoming.mappingVersion) return { action: 'SKIP', record: existing }; if (existing.externalReviewId === incoming.externalReviewId && existing.providerCode === incoming.providerCode) return { action: 'RECONCILE', previous: existing, incoming: incoming }; return { action: 'CREATE' }; },
    /** Reconciles external withdrawal without deleting internal audit evidence. */
    withdraw: function (record, now) { return Object.assign({}, record, { status: 'WITHDRAWN', lastReconciledAt: now || new Date() }); },
    /** Returns a disabled-by-default Google Customer Reviews reference adapter descriptor. */
    googleCustomerReviews: function (policy) { policy = policy || {}; return { providerCode: 'googleCustomerReviews', enabled: policy.enabled === true, mode: policy.mode || 'REFERENCE_ONLY', ownsReviewState: false, requiresMerchantConfiguration: true, requiresConsentAndDisclosure: true }; }
};
