/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require('crypto');
const UTILS = require('../utils/utils');

/** @module engagementCore/src/service/defaultEngagementIntakeService @description Coordinates validation, protection, idempotent persistence, and auditable acceptance. @layer service @owner engagementCore @override Later modules may decorate intake while preserving ordering and fail-closed controls. */
module.exports = {
    /** Handles submit within the module-owned contract. */
    submit: async function (request, context) {
        context = context || {};
        let validated = context.validationService.validate(request, context.configuration || {});
        let protectedResult = await context.protectionService.protect(validated, (context.configuration || {}).protection || {}, context.riskAdapter);
        let normalized = protectedResult.request;
        let requestHash = crypto.createHash('sha256').update(JSON.stringify(normalized.payload || {})).digest('hex');
        let existing = await context.repository.findByIdempotencyKey(normalized.tenant, normalized.idempotencyKey);
        if (existing) return { submission: context.validationService.assertReplay(existing, requestHash), duplicate: true, reasonCode: 'ENG_DUPLICATE' };
        let timestamp = UTILS.now(normalized);
        let submission = ['tenant', 'enterprise', 'site', 'channel', 'locale', 'source', 'domainType', 'domainCode', 'correlationId', 'idempotencyKey', 'processDefinitionCode', 'processInstanceCode', 'processTaskCode', 'retentionPolicyCode', 'legalHold', 'closedAt'].reduce((model, key) => {
            if (normalized[key] !== undefined) model[key] = normalized[key];
            return model;
        }, {});
        ['enterprise', 'site'].forEach(key => { if (submission[key] && typeof submission[key] === 'object') submission[key] = submission[key].code; });
        Object.assign(submission, { ownerId: normalized.ownerId || UTILS.resolvePrincipalId(normalized), processingStatus: 'RECEIVED', revision: 0, requestHash: requestHash, receivedAt: timestamp });
        submission = await context.repository.create(submission);
        return { submission: submission, duplicate: false, reasonCode: 'ENG_ACCEPTED', risk: protectedResult.risk, event: { type: 'engagement.submission.accepted', tenant: submission.tenant, aggregateCode: submission.code, correlationId: submission.correlationId } };
    }
};
