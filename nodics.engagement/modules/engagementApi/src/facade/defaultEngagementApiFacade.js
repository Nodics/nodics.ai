/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module engagementApi/src/facade/defaultEngagementApiFacade @description Governs domain gateway calls through policy checks and DTO projection. @layer facade @owner engagementApi @override Later facades may enrich DTOs without bypassing policy or directly accessing persistence. */
module.exports = {
    /** Handles context within the module-owned contract. */
    context: function () { let configuration = CONFIG.get('engagementApi') || {}; return { configuration: configuration, policy: SERVICE.DefaultEngagementApiPolicyService, projection: SERVICE.DefaultEngagementApiProjectionService, gateway: SERVICE.DefaultEngagementDomainGatewayService }; },
    /** Handles invoke within the module-owned contract. */
    invoke: async function (operation, request, projectionName, mode) {
        let context = this.context(); request = context.policy.prepare(request, context.configuration);
        if (mode === 'integration') { context.policy.assertService(request); context.policy.assertPayload(request.payload, context.configuration); }
        let value = await context.gateway[operation](request);
        if (mode === 'customer') value = Array.isArray(value) ? value.map(record => context.policy.assertOwner(record, request)) : context.policy.assertOwner(value, request);
        if (mode === 'operator') value = Array.isArray(value) ? value.map(record => context.policy.assertTenant(record, request)) : context.policy.assertTenant(value, request);
        let fields = context.configuration.projections[projectionName];
        return Array.isArray(value) ? context.projection.projectMany(value, fields) : context.projection.project(value, fields);
    },
    /** Handles anonymous within the module-owned contract. */
    anonymous: function (operation, request, projectionName) { let context = this.context(); context.policy.assertAnonymousAllowed(operation, request, context.configuration); return this.invoke(operation, request, projectionName); },
    /** Handles get active form within the module-owned contract. */
    getActiveForm: function (request) { return this.anonymous('getActiveForm', request, 'publicForm'); },
    /** Handles submit contact within the module-owned contract. */
    submitContact: function (request) { return this.anonymous('submitContact', request, 'contactAcknowledgement'); },
    /** Lists safe published testimonial DTOs. */
    listTestimonials: function (request) { return this.anonymous('listTestimonials', request, 'publicTestimonial'); },
    /** Handles list own submissions within the module-owned contract. */
    listOwnSubmissions: function (request) { return this.invoke('listOwnSubmissions', request, 'customerSubmission', 'customer'); },
    /** Handles get own submission within the module-owned contract. */
    getOwnSubmission: function (request) { return this.invoke('getOwnSubmission', request, 'customerSubmission', 'customer'); },
    /** Handles list submissions within the module-owned contract. */
    listSubmissions: function (request) { return this.invoke('listSubmissions', request, 'operatorSubmission', 'operator'); },
    /** Handles get submission within the module-owned contract. */
    getSubmission: function (request) { return this.invoke('getSubmission', request, 'operatorSubmission', 'operator'); },
    /** Handles act on contact within the module-owned contract. */
    actOnContact: function (request) { return this.invoke('actOnContact', request, 'operatorSubmission', 'operator'); },
    /** Handles run handoff recovery within the module-owned contract. */
    runHandoffRecovery: function (request) { return this.invoke('runHandoffRecovery', request, 'handoffRecovery'); },
    /** Handles retry handoff within the module-owned contract. */
    retryHandoff: function (request) { return this.invoke('retryHandoff', request, 'handoffRecovery'); },
    /** Handles reconcile handoff within the module-owned contract. */
    reconcileHandoff: function (request) { return this.invoke('reconcileHandoff', request, 'handoffRecovery'); },
    /** Gets one customer-owned testimonial consent DTO. */
    getOwnTestimonialConsent: function (request) { return this.invoke('getOwnTestimonialConsent', request, 'testimonialConsent', 'customer'); },
    /** Withdraws one customer-owned testimonial consent. */
    withdrawOwnTestimonialConsent: function (request) { return this.invoke('withdrawOwnTestimonialConsent', request, 'testimonialAction'); },
    /** Executes one secured testimonial operator action. */
    actOnTestimonial: function (request) { return this.invoke('actOnTestimonial', request, 'testimonialAction', 'operator'); },
    /** Submits one customer review. */
    submitReview: function (request) { return this.invoke('submitReview', request, 'customerReview', 'customer'); },
    /** Lists customer-owned reviews. */
    listOwnReviews: function (request) { return this.invoke('listOwnReviews', request, 'customerReview', 'customer'); },
    /** Gets one customer-owned review. */
    getOwnReview: function (request) { return this.invoke('getOwnReview', request, 'customerReview', 'customer'); },
    /** Withdraws one customer-owned review. */
    withdrawOwnReview: function (request) { return this.invoke('withdrawOwnReview', request, 'customerReview', 'customer'); },
    /** Reports review abuse. */
    reportReviewAbuse: function (request) { return this.invoke('reportReviewAbuse', request, 'reviewAbuseReport'); },
    /** Executes one operator moderation action. */
    moderateReview: function (request) { return this.invoke('moderateReview', request, 'customerReview', 'operator'); },
    /** Previews one CRES migration mapping. */
    previewCresMigration: function (request) { return this.invoke('previewCresMigration', request, 'cresMigrationPreview'); },
    /** Lists published and sanitized review projections. */
    listReviews: function (request) { return this.anonymous('listReviews', request, 'publicReviewPage'); },
    /** Gets one public rating aggregate. */
    getReviewAggregate: function (request) { return this.anonymous('getReviewAggregate', request, 'publicReviewAggregate'); },
    /** Creates or replaces the authenticated customer's helpfulness vote. */
    voteReviewHelpfulness: function (request) { return this.invoke('voteReviewHelpfulness', request, 'reviewHelpfulness', 'customer'); },
    /** Gets one customer-owned solicitation request. */
    getOwnReviewRequest: function (request) { return this.invoke('getOwnReviewRequest', request, 'reviewRequest', 'customer'); },
    /** Starts one customer-owned multi-target review session. */
    startReviewSession: function (request) { return this.invoke('startReviewSession', request, 'reviewSession', 'customer'); },
    /** Accepts one service-authenticated eligibility decision. */
    createReviewRequest: function (request) { return this.invoke('createReviewRequest', request, 'reviewRequest', 'integration'); },
    /** Accepts one service-authenticated syndication record. */
    importSyndicatedReview: function (request) { return this.invoke('importSyndicatedReview', request, 'reviewSyndication', 'integration'); },
    /** Accepts one public feedback submission. */
    submitFeedback: function (request) { return this.anonymous('submitFeedback', request, 'feedbackAcknowledgement'); },
    /** Lists customer-owned feedback. */
    listOwnFeedback: function (request) { return this.invoke('listOwnFeedback', request, 'customerFeedback', 'customer'); },
    /** Lists tenant-scoped feedback for operators. */
    listFeedback: function (request) { return this.invoke('listFeedback', request, 'customerFeedback', 'operator'); },
    /** Applies one feedback lifecycle action. */
    actOnFeedback: function (request) { return this.invoke('actOnFeedback', request, 'customerFeedback', 'operator'); },
    /** Records one feedback classification. */
    classifyFeedback: function (request) { return this.invoke('classifyFeedback', request, 'feedbackClassification', 'operator'); },
    /** Derives one advisory source-traceable insight. */
    deriveFeedbackInsight: function (request) { return this.invoke('deriveFeedbackInsight', request, 'feedbackInsight', 'operator'); },
    /** Lists the rebuildable unified queue. */ listUnifiedQueue: function (request) { return this.invoke('listUnifiedQueue', request, 'unifiedQueue', 'operator'); },
    /** Gets one calculated engagement dashboard. */ getEngagementDashboard: function (request) { return this.invoke('getEngagementDashboard', request, 'engagementDashboard', 'operator'); },
    /** Previews domain-routed batch commands. */ previewEngagementBatch: function (request) { return this.invoke('previewEngagementBatch', request, 'engagementBatchPreview', 'operator'); },
    /** Previews a purpose-bound masked export. */ previewEngagementExport: function (request) { return this.invoke('previewEngagementExport', request, 'engagementExportPreview', 'operator'); },
    /** Previews one governed repair. */ previewEngagementRepair: function (request) { return this.invoke('previewEngagementRepair', request, 'engagementRepairPreview', 'operator'); },
    /** Handles receive callback within the module-owned contract. */
    receiveCallback: function (request) { return this.invoke('receiveCallback', request, 'integrationReceipt', 'integration'); }
};
