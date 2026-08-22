/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module engagementApi/src/service/defaultEngagementPrivacyOperationsService @description Routes privacy execution to the record owner and persists purpose-bound evidence. @layer service @owner engagementApi */
module.exports = {
    /** Executes one purpose-bound privacy request through the domain owner and stores evidence. */
    execute: async function (request) { let domain = String(request.domainType || '').toUpperCase(); let service = { CONTACT: SERVICE.DefaultContactSubmissionOperationService, FEEDBACK: SERVICE.DefaultCustomerFeedbackOperationService, REVIEW: SERVICE.DefaultCustomerReviewOperationService, TESTIMONIAL: SERVICE.DefaultTestimonialOperationService }[domain]; if (!service || typeof service.privacy !== 'function') throw Object.assign(new Error('privacy domain is unsupported'), { code: 'ERR_ENG_PRIVACY_DOMAIN' }); let output = await service.privacy(request); let command = Object.assign({}, request.payload, { actorId: request.authData && (request.authData.principalId || request.authData.code), domainType: domain, correlationId: request.correlationId || request.requestId }); let evidence = SERVICE.DefaultEngagementPrivacyService.evidence(output.record, request.payload.operation, command, output.result); let saved = SERVICE.DefaultEngagementOperationsEvidenceRepositoryService.savePrivacy(evidence); saved = await saved; return Object.assign({}, evidence, { code: saved.code, data: request.payload.operation === 'EXPORT' ? output.result.data : undefined }); }
};
