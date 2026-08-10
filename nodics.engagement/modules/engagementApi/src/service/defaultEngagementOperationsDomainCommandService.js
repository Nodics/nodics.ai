/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module engagementApi/src/service/defaultEngagementOperationsDomainCommandService @description Routes approved cross-domain commands back to the owning Engagement API services without accessing their persistence. @layer service @owner engagementApi */
module.exports = {
    /** Routes one approved operational command to its owning domain service. */
    dispatch: function (command, request) {
        let value = Object.assign({}, request, { actionCode: command.action, payload: Object.assign({}, request.payload, { expectedRevision: command.expectedRevision, reason: command.reason }), correlationId: command.correlationId });
        if (command.domainType === 'CONTACT') { value.submissionCode = command.domainCode; return SERVICE.DefaultContactSubmissionApiService.act(value); }
        if (command.domainType === 'FEEDBACK') { value.feedbackCode = command.domainCode; return SERVICE.DefaultCustomerFeedbackApiService.act(value); }
        if (command.domainType === 'REVIEW') { value.reviewCode = command.domainCode; return SERVICE.DefaultCustomerReviewApiService.moderate(value); }
        if (command.domainType === 'TESTIMONIAL') { value.testimonialCode = command.domainCode; return SERVICE.DefaultTestimonialApiService.act(value); }
        return Promise.reject(Object.assign(new Error('unsupported Engagement domain command'), { code: 'ERR_ENG_OPERATION_DOMAIN' }));
    }
};
