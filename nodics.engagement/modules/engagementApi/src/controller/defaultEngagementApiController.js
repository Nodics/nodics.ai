/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module engagementApi/src/controller/defaultEngagementApiController @description Maps bounded HTTP inputs to the secured Engagement facade. @layer controller @owner engagementApi @override Later modules may add domain mappings while preserving correlation and DTO boundaries. */
module.exports = {
    /** Handles invoke within the module-owned contract. */
    invoke: function (operation, request, callback) {
        let http = request.httpRequest || {}; let params = http.params || {};
        request.definitionCode = params.definitionCode || request.definitionCode; request.submissionCode = params.submissionCode || request.submissionCode; request.handoffCode = params.handoffCode || request.handoffCode; request.providerCode = params.providerCode || request.providerCode; request.actionCode = params.actionCode || request.actionCode; request.consentCode = params.consentCode || request.consentCode; request.testimonialCode = params.testimonialCode || request.testimonialCode; request.reviewCode = params.reviewCode || request.reviewCode; request.requestCode = params.requestCode || request.requestCode; request.feedbackCode = params.feedbackCode || request.feedbackCode; request.dashboardCode = params.dashboardCode || request.dashboardCode; request.itemCode = params.itemCode || request.itemCode; request.targetType = params.targetType || request.targetType; request.targetCode = params.targetCode || request.targetCode; request.domainType = params.domainType || request.domainType; request.domainCode = params.domainCode || request.domainCode; request.privacyAction = params.privacyAction || request.privacyAction;
        request.query = http.query || request.query || {}; request.payload = http.body || request.payload || {}; if (request.privacyAction) request.payload.operation = String(request.privacyAction).toUpperCase();
        request.idempotencyKey = request.idempotencyKey || (http.headers && http.headers['idempotency-key']);
        let promise = FACADE.DefaultEngagementApiFacade[operation](request).then(result => ({ data: result }));
        if (!callback) return promise; promise.then(result => callback(null, result)).catch(callback);
    },
    /** Handles get active form within the module-owned contract. */
    getActiveForm: function (request, callback) { return this.invoke('getActiveForm', request, callback); },
    /** Handles submit contact within the module-owned contract. */
    submitContact: function (request, callback) { return this.invoke('submitContact', request, callback); },
    /** Lists published testimonials. */
    listTestimonials: function (request, callback) { return this.invoke('listTestimonials', request, callback); },
    /** Handles list own submissions within the module-owned contract. */
    listOwnSubmissions: function (request, callback) { return this.invoke('listOwnSubmissions', request, callback); },
    /** Handles get own submission within the module-owned contract. */
    getOwnSubmission: function (request, callback) { return this.invoke('getOwnSubmission', request, callback); },
    /** Handles list submissions within the module-owned contract. */
    listSubmissions: function (request, callback) { return this.invoke('listSubmissions', request, callback); },
    /** Handles get submission within the module-owned contract. */
    getSubmission: function (request, callback) { return this.invoke('getSubmission', request, callback); },
    /** Handles act on contact within the module-owned contract. */
    actOnContact: function (request, callback) { return this.invoke('actOnContact', request, callback); },
    /** Handles run handoff recovery within the module-owned contract. */
    runHandoffRecovery: function (request, callback) { return this.invoke('runHandoffRecovery', request, callback); },
    /** Handles retry handoff within the module-owned contract. */
    retryHandoff: function (request, callback) { return this.invoke('retryHandoff', request, callback); },
    /** Handles reconcile handoff within the module-owned contract. */
    reconcileHandoff: function (request, callback) { return this.invoke('reconcileHandoff', request, callback); },
    /** Gets customer-owned testimonial consent. */
    getOwnTestimonialConsent: function (request, callback) { return this.invoke('getOwnTestimonialConsent', request, callback); },
    /** Withdraws customer-owned testimonial consent. */
    withdrawOwnTestimonialConsent: function (request, callback) { return this.invoke('withdrawOwnTestimonialConsent', request, callback); },
    /** Executes a testimonial operator action. */
    actOnTestimonial: function (request, callback) { return this.invoke('actOnTestimonial', request, callback); },
    /** Submits a customer review. */
    submitReview: function (request, callback) { return this.invoke('submitReview', request, callback); },
    /** Lists customer-owned reviews. */
    listOwnReviews: function (request, callback) { return this.invoke('listOwnReviews', request, callback); },
    /** Gets a customer-owned review. */
    getOwnReview: function (request, callback) { return this.invoke('getOwnReview', request, callback); },
    /** Withdraws a customer-owned review. */
    withdrawOwnReview: function (request, callback) { return this.invoke('withdrawOwnReview', request, callback); },
    /** Reports review abuse. */
    reportReviewAbuse: function (request, callback) { return this.invoke('reportReviewAbuse', request, callback); },
    /** Executes an operator review action. */
    moderateReview: function (request, callback) { return this.invoke('moderateReview', request, callback); },
    /** Previews CRES migration mapping. */
    previewCresMigration: function (request, callback) { return this.invoke('previewCresMigration', request, callback); },
    /** Lists published reviews. */
    listReviews: function (request, callback) { return this.invoke('listReviews', request, callback); },
    /** Gets a public rating aggregate. */
    getReviewAggregate: function (request, callback) { return this.invoke('getReviewAggregate', request, callback); },
    /** Records one customer helpfulness vote. */
    voteReviewHelpfulness: function (request, callback) { return this.invoke('voteReviewHelpfulness', request, callback); },
    /** Gets one customer review request. */
    getOwnReviewRequest: function (request, callback) { return this.invoke('getOwnReviewRequest', request, callback); },
    /** Starts one review submission session. */
    startReviewSession: function (request, callback) { return this.invoke('startReviewSession', request, callback); },
    /** Creates one review request from service-owned eligibility evidence. */
    createReviewRequest: function (request, callback) { return this.invoke('createReviewRequest', request, callback); },
    /** Imports one licensed syndication record. */
    importSyndicatedReview: function (request, callback) { return this.invoke('importSyndicatedReview', request, callback); },
    /** Submits customer feedback. */ submitFeedback: function (request, callback) { return this.invoke('submitFeedback', request, callback); },
    /** Lists customer-owned feedback. */ listOwnFeedback: function (request, callback) { return this.invoke('listOwnFeedback', request, callback); },
    /** Lists operator feedback. */ listFeedback: function (request, callback) { return this.invoke('listFeedback', request, callback); },
    /** Executes a feedback lifecycle action. */ actOnFeedback: function (request, callback) { return this.invoke('actOnFeedback', request, callback); },
    /** Records feedback classification. */ classifyFeedback: function (request, callback) { return this.invoke('classifyFeedback', request, callback); },
    /** Derives a feedback insight. */ deriveFeedbackInsight: function (request, callback) { return this.invoke('deriveFeedbackInsight', request, callback); },
    /** Lists the unified engagement queue. */ listUnifiedQueue: function (request, callback) { return this.invoke('listUnifiedQueue', request, callback); },
    /** Gets an engagement dashboard. */ getEngagementDashboard: function (request, callback) { return this.invoke('getEngagementDashboard', request, callback); },
    /** Previews a batch command. */ previewEngagementBatch: function (request, callback) { return this.invoke('previewEngagementBatch', request, callback); },
    /** Previews an engagement export. */ previewEngagementExport: function (request, callback) { return this.invoke('previewEngagementExport', request, callback); },
    /** Previews an engagement repair. */ previewEngagementRepair: function (request, callback) { return this.invoke('previewEngagementRepair', request, callback); },
    /** Executes an approved engagement batch. */ executeEngagementBatch: function (request, callback) { return this.invoke('executeEngagementBatch', request, callback); },
    /** Executes an approved engagement export. */ executeEngagementExport: function (request, callback) { return this.invoke('executeEngagementExport', request, callback); },
    /** Executes an approved engagement repair. */ executeEngagementRepair: function (request, callback) { return this.invoke('executeEngagementRepair', request, callback); },
    /** Executes a purpose-bound privacy action. */ executeEngagementPrivacy: function (request, callback) { return this.invoke('executeEngagementPrivacy', request, callback); },
    /** Handles receive callback within the module-owned contract. */
    receiveCallback: function (request, callback) { return this.invoke('receiveCallback', request, callback); }
};
