/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.engagement/config/properties
 * @description Registers Customer Engagement as a discoverable preview capability without enabling business APIs or workflows.
 * @layer config
 * @owner nodics.engagement
 * @override Project, environment, server, node, tenant, or customer layers may refine presentation and feature policy without changing functional identity.
 */
module.exports = {
    backofficeCapabilities: {
        'nodics.engagement': {
            enabled: true,
            capabilityId: 'customer-engagement',
            displayName: 'Customer Engagement',
            category: 'customer-experience',
            icon: 'feedback',
            contractVersion: 1,
            minimumClientContractVersion: 1,
            roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'],
            discovery: {
                openApiPath: '/nodics/system/v0/contract/openapi/internal',
                contractVersion: 1
            },
            requiredPermissions: ['engagement.backoffice.view'],
            navigation: [
                {
                    id: 'customer-engagement', label: 'Customer Engagement', route: '/engagement', icon: 'feedback', order: 500,
                    group: { id: 'customer-experience', label: 'Customer Experience', order: 300 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE',
                    requiredPermissions: ['engagement.backoffice.view'],
                    help: { summary: 'Operate governed customer submissions, approvals, publication decisions, and recovery through Engagement-owned contracts.' }
                },
                {
                    id: 'contact-submissions', parentId: 'customer-engagement', label: 'Contact Submissions', route: '/engagement/contact-submissions', icon: 'inbox', order: 510,
                    group: { id: 'customer-experience', label: 'Customer Experience', order: 300 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE',
                    requiredPermissions: ['engagement.operator.read'],
                    workbenchTarget: { moduleName: 'contactSubmission', schemaName: 'contactRequest' },
                    workbenchPresentation: {
                        defaultColumns: ['code', 'type', 'subject', 'status', 'queueCode', 'priorityCode', 'submittedAt', 'dueAt'],
                        hiddenFields: ['message', 'contactEmail', 'contactPhone', 'ownerId'],
                        quickFilters: [
                            { id: 'open', label: 'Open', field: 'status', values: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_INTERNAL'] },
                            { id: 'verification', label: 'Verification pending', field: 'status', value: 'VERIFICATION_PENDING' },
                            { id: 'resolved', label: 'Resolved', field: 'status', value: 'RESOLVED' }
                        ]
                    },
                    lifecycleActions: [
                        { id: 'attempt-contact', label: 'Start work', intent: 'UPDATE', permission: 'engagement.operator.act', ownerModule: 'engagementApi', operationRoute: '/operator/contact-submissions/:code/actions/ATTEMPT_CONTACT', targetStatuses: ['OPEN', 'WAITING_CUSTOMER', 'WAITING_INTERNAL'], order: 10 },
                        { id: 'request-information', label: 'Request information', intent: 'UPDATE', permission: 'engagement.operator.act', ownerModule: 'engagementApi', operationRoute: '/operator/contact-submissions/:code/actions/REQUEST_INFORMATION', targetStatuses: ['OPEN', 'IN_PROGRESS'], order: 20 },
                        { id: 'resolve', label: 'Resolve', intent: 'UPDATE', permission: 'engagement.operator.act', ownerModule: 'engagementApi', operationRoute: '/operator/contact-submissions/:code/actions/RESOLVE', targetStatuses: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_INTERNAL'], order: 30 },
                        { id: 'close', label: 'Close', intent: 'UPDATE', permission: 'engagement.operator.act', ownerModule: 'engagementApi', operationRoute: '/operator/contact-submissions/:code/actions/CLOSE', targetStatuses: ['RESOLVED'], order: 40 },
                        { id: 'reopen', label: 'Reopen', intent: 'UPDATE', permission: 'engagement.operator.act', ownerModule: 'engagementApi', operationRoute: '/operator/contact-submissions/:code/actions/REOPEN', targetStatuses: ['RESOLVED', 'CLOSED'], order: 50 },
                        { id: 'mark-spam', label: 'Mark spam', intent: 'REJECT', permission: 'engagement.operator.act', ownerModule: 'engagementApi', operationRoute: '/operator/contact-submissions/:code/actions/MARK_SPAM', targetStatuses: ['OPEN'], order: 60 }
                    ],
                    help: { summary: 'Triage, assign, action, resolve, and recover contact requests with tenant-scoped evidence and optimistic revision checks.' }
                },
                {
                    id: 'contact-handoffs', parentId: 'customer-engagement', label: 'Process Handoffs', route: '/engagement/contact-handoffs', icon: 'sync_problem', order: 520,
                    group: { id: 'customer-experience', label: 'Customer Experience', order: 300 },
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE',
                    requiredPermissions: ['engagement.handoff.recover'],
                    workbenchTarget: { moduleName: 'contactSubmission', schemaName: 'contactHandoff' },
                    workbenchPresentation: {
                        defaultColumns: ['code', 'contactRequestCode', 'target', 'status', 'attempts', 'nextRetryAt', 'externalReference', 'updatedAt'],
                        hiddenFields: ['payload', 'leaseOwner'],
                        quickFilters: [
                            { id: 'pending', label: 'Pending', field: 'status', values: ['PENDING', 'RETRY_PENDING', 'IN_PROGRESS'] },
                            { id: 'dead-letter', label: 'Dead letter', field: 'status', value: 'DEAD_LETTER' },
                            { id: 'succeeded', label: 'Succeeded', field: 'status', value: 'SUCCEEDED' }
                        ]
                    },
                    lifecycleActions: [
                        { id: 'retry', label: 'Retry', intent: 'UPDATE', permission: 'engagement.handoff.recover', ownerModule: 'engagementApi', operationRoute: '/operator/handoffs/:code/retry', targetStatuses: ['DEAD_LETTER'], order: 10 },
                        { id: 'reconcile', label: 'Reconcile', intent: 'UPDATE', permission: 'engagement.handoff.reconcile', ownerModule: 'engagementApi', operationRoute: '/operator/handoffs/:code/reconcile', targetStatuses: ['SUCCEEDED'], order: 20 }
                    ],
                    help: { summary: 'Inspect Process handoff delivery, retry dead letters, and reconcile provider terminal state. Recovery batches use the secured operator API.' }
                },
                {
                    id: 'testimonial-candidates', parentId: 'customer-engagement', label: 'Testimonial Candidates', route: '/engagement/testimonial-candidates', icon: 'format_quote', order: 530,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE', requiredPermissions: ['engagement.testimonial.read'],
                    workbenchTarget: { moduleName: 'testimonial', schemaName: 'testimonialCandidate' },
                    workbenchPresentation: { defaultColumns: ['code', 'sourceType', 'status', 'materialRelationship', 'capturedAt'], hiddenFields: ['originalText', 'provenance', 'ownerId', 'evidenceReferences'] },
                    help: { summary: 'Curate provenance-safe candidates while preserving original customer evidence.' }
                },
                {
                    id: 'testimonial-editorial', parentId: 'customer-engagement', label: 'Editorial Versions', route: '/engagement/testimonial-editorial', icon: 'edit_note', order: 540,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE', requiredPermissions: ['engagement.testimonial.edit'],
                    workbenchTarget: { moduleName: 'testimonial', schemaName: 'testimonialVersion' },
                    workbenchPresentation: { defaultColumns: ['candidateCode', 'version', 'locale', 'variant', 'status', 'approvedAt'], hiddenFields: ['editorialText', 'sanitizedText', 'mediaCodes'] },
                    help: { summary: 'Manage immutable editorial versions, customer confirmation, and approval.' }
                },
                {
                    id: 'testimonial-consents', parentId: 'customer-engagement', label: 'Consent & Rights', route: '/engagement/testimonial-consents', icon: 'verified_user', order: 550,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE', requiredPermissions: ['engagement.testimonial.read'],
                    workbenchTarget: { moduleName: 'testimonial', schemaName: 'testimonialConsent' },
                    workbenchPresentation: { defaultColumns: ['candidateCode', 'status', 'channels', 'regions', 'policyVersion', 'validFrom', 'expiresAt', 'withdrawnAt'], hiddenFields: ['evidence', 'ownerId', 'attribution'] },
                    help: { summary: 'Inspect attribution, channel, region, duration, likeness, and media rights.' }
                },
                {
                    id: 'testimonial-publications', parentId: 'customer-engagement', label: 'Publication Calendar', route: '/engagement/testimonial-publications', icon: 'event_available', order: 560,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE', requiredPermissions: ['engagement.testimonial.publish'],
                    workbenchTarget: { moduleName: 'testimonial', schemaName: 'testimonialProjection' },
                    workbenchPresentation: { defaultColumns: ['candidateCode', 'projectionVersion', 'channel', 'region', 'locale', 'status', 'scheduledAt', 'publishedAt', 'expiresAt'], hiddenFields: ['publicText', 'attribution'] },
                    lifecycleActions: [
                        { id: 'emergency-hide', label: 'Emergency hide', intent: 'REJECT', permission: 'engagement.testimonial.act', ownerModule: 'engagementApi', operationRoute: '/operator/testimonials/:code/actions/EMERGENCY_HIDE', targetStatuses: ['PREVIEW', 'SCHEDULED', 'PUBLISHED'], order: 10 },
                        { id: 'reconcile', label: 'Reconcile', intent: 'UPDATE', permission: 'engagement.testimonial.act', ownerModule: 'engagementApi', operationRoute: '/operator/testimonials/:code/actions/RECONCILE', targetStatuses: ['PREVIEW', 'SCHEDULED', 'PUBLISHED', 'HIDDEN', 'WITHDRAWN', 'EXPIRED', 'FAILED'], order: 20 }
                    ],
                    help: { summary: 'Preview, schedule, publish, hide, expire, and repair testimonial projections through domain and nPublish contracts.' }
                },
                {
                    id: 'customer-reviews', parentId: 'customer-engagement', label: 'Customer Reviews', route: '/engagement/customer-reviews', icon: 'rate_review', order: 570,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise', 'site'], featureState: 'ACTIVE', requiredPermissions: ['engagement.review.read'],
                    workbenchTarget: { moduleName: 'customerReview', schemaName: 'customerReview' },
                    workbenchPresentation: { defaultColumns: ['code', 'targetType', 'targetCode', 'overallRating', 'status', 'moderationMode', 'site', 'locale', 'submittedAt'], hiddenFields: ['body', 'ownerId', 'orderCode', 'orderEntryCode', 'structuredAnswers'] },
                    lifecycleActions: [
                        { id: 'approve', label: 'Approve', intent: 'UPDATE', permission: 'engagement.review.moderate', ownerModule: 'engagementApi', operationRoute: '/operator/reviews/:code/actions/APPROVE', targetStatuses: ['SUBMITTED', 'PENDING_MODERATION', 'QUARANTINED'], order: 10 },
                        { id: 'quarantine', label: 'Quarantine', intent: 'REJECT', permission: 'engagement.review.moderate', ownerModule: 'engagementApi', operationRoute: '/operator/reviews/:code/actions/QUARANTINE', targetStatuses: ['SUBMITTED', 'PENDING_MODERATION', 'APPROVED'], order: 20 },
                        { id: 'reject', label: 'Reject', intent: 'REJECT', permission: 'engagement.review.moderate', ownerModule: 'engagementApi', operationRoute: '/operator/reviews/:code/actions/REJECT', targetStatuses: ['SUBMITTED', 'PENDING_MODERATION', 'QUARANTINED'], order: 30 },
                        { id: 'restore', label: 'Restore', intent: 'UPDATE', permission: 'engagement.review.moderate', ownerModule: 'engagementApi', operationRoute: '/operator/reviews/:code/actions/RESTORE', targetStatuses: ['QUARANTINED', 'REJECTED', 'HIDDEN', 'WITHDRAWN'], order: 40 }
                    ],
                    help: { summary: 'Moderate polymorphic customer reviews without suppressing unfavorable sentiment.' }
                },
                {
                    id: 'review-moderation', parentId: 'customer-engagement', label: 'Review Moderation', route: '/engagement/review-moderation', icon: 'policy', order: 580,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise', 'site'], featureState: 'ACTIVE', requiredPermissions: ['engagement.review.moderate'],
                    workbenchTarget: { moduleName: 'customerReview', schemaName: 'customerReviewModeration' },
                    workbenchPresentation: { defaultColumns: ['reviewCode', 'reviewVersion', 'action', 'fromStatus', 'toStatus', 'reasonCode', 'policyViolation', 'actorId', 'occurredAt'], hiddenFields: ['internalNotes', 'evidence', 'sentiment'] },
                    help: { summary: 'Inspect immutable policy reasons, escalation, and audit evidence for moderation actions.' }
                },
                {
                    id: 'review-responses', parentId: 'customer-engagement', label: 'Business Responses', route: '/engagement/review-responses', icon: 'forum', order: 590,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise', 'site'], featureState: 'ACTIVE', requiredPermissions: ['engagement.review.respond'],
                    workbenchTarget: { moduleName: 'customerReview', schemaName: 'customerReviewResponse' },
                    workbenchPresentation: { defaultColumns: ['reviewCode', 'version', 'status', 'authorId', 'teamCode', 'approvedBy', 'publishedAt'], hiddenFields: ['body'] },
                    help: { summary: 'Draft, approve, publish, hide, and version official business responses.' }
                },
                {
                    id: 'review-abuse', parentId: 'customer-engagement', label: 'Review Abuse & Appeals', route: '/engagement/review-abuse', icon: 'report', order: 600,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise', 'site'], featureState: 'ACTIVE', requiredPermissions: ['engagement.review.abuse.resolve'],
                    workbenchTarget: { moduleName: 'customerReview', schemaName: 'customerReviewAbuseReport' },
                    workbenchPresentation: { defaultColumns: ['reviewCode', 'reasonCode', 'status', 'resolutionCode', 'resolvedBy', 'resolvedAt'], hiddenFields: ['comment', 'evidence', 'reporterId'] },
                    help: { summary: 'Investigate duplicate-safe abuse reports and preserve appeal and reinstatement evidence.' }
                },
                {
                    id: 'review-publications', parentId: 'customer-engagement', label: 'Published Reviews', route: '/engagement/review-publications', icon: 'public', order: 610,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise', 'site'], featureState: 'ACTIVE', requiredPermissions: ['engagement.review.read'],
                    workbenchTarget: { moduleName: 'customerReview', schemaName: 'customerReviewProjection' },
                    workbenchPresentation: { defaultColumns: ['reviewCode', 'targetType', 'targetCode', 'variantCode', 'overallRating', 'status', 'helpfulCount', 'publishedAt'], hiddenFields: ['body', 'media', 'businessResponse', 'authenticity', 'sourceHash'] },
                    help: { summary: 'Inspect the sanitized, version-specific evidence currently eligible for shopper visibility.' }
                },
                {
                    id: 'review-aggregates', parentId: 'customer-engagement', label: 'Rating Aggregates', route: '/engagement/review-aggregates', icon: 'analytics', order: 620,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise', 'site'], featureState: 'ACTIVE', requiredPermissions: ['engagement.review.read'],
                    workbenchTarget: { moduleName: 'customerReview', schemaName: 'customerReviewAggregate' },
                    workbenchPresentation: { defaultColumns: ['targetType', 'targetCode', 'variantCode', 'site', 'locale', 'count', 'average', 'verifiedCount', 'status', 'calculatedAt'], hiddenFields: ['sum', 'sourceHash', 'dimensions', 'distribution'] },
                    help: { summary: 'Verify published-only rating totals, policy/calculation versions, drift evidence, and rebuild freshness.' }
                },
                {
                    id: 'review-requests', parentId: 'customer-engagement', label: 'Review Requests', route: '/engagement/review-requests', icon: 'outgoing_mail', order: 630,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise', 'site'], featureState: 'ACTIVE', requiredPermissions: ['engagement.review.read'],
                    workbenchTarget: { moduleName: 'customerReview', schemaName: 'customerReviewRequest' },
                    workbenchPresentation: { defaultColumns: ['sourceModule', 'sourceRecordCode', 'channel', 'status', 'eligibleAt', 'offeredAt', 'expiresAt', 'reminderCount'], hiddenFields: ['ownerId', 'idempotencyKey', 'targetCodes'] },
                    help: { summary: 'Inspect fulfillment-timed requests, delivery funnel state, reminders, suppression, and expiry without sentiment targeting.' }
                },
                {
                    id: 'review-syndication', parentId: 'customer-engagement', label: 'Review Syndication', route: '/engagement/review-syndication', icon: 'sync_alt', order: 640,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise', 'site'], featureState: 'ACTIVE', requiredPermissions: ['engagement.review.migrate'],
                    workbenchTarget: { moduleName: 'customerReview', schemaName: 'customerReviewSyndication' },
                    workbenchPresentation: { defaultColumns: ['direction', 'providerCode', 'externalReviewId', 'targetType', 'targetCode', 'licenseCode', 'status', 'lastReconciledAt'], hiddenFields: ['sourceHash', 'moderationEvidence', 'originUrl', 'errors'] },
                    help: { summary: 'Inspect licensed origin, disclosure, mapping, quarantine, reconciliation, and withdrawal evidence.' }
                },
                {
                    id: 'customer-feedback', parentId: 'customer-engagement', label: 'Customer Feedback', route: '/engagement/customer-feedback', icon: 'feedback', order: 650,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise', 'site'], featureState: 'ACTIVE', requiredPermissions: ['engagement.feedback.read'],
                    workbenchTarget: { moduleName: 'customerFeedback', schemaName: 'customerFeedback' },
                    workbenchPresentation: { defaultColumns: ['code', 'type', 'targetType', 'targetCode', 'subject', 'status', 'priority', 'severity', 'queueCode', 'dueAt', 'submittedAt'], hiddenFields: ['message', 'ownerId', 'structuredAnswers', 'scores', 'attachmentCodes'] },
                    lifecycleActions: [
                        { id: 'triage', label: 'Triage', intent: 'UPDATE', permission: 'engagement.feedback.act', ownerModule: 'engagementApi', operationRoute: '/operator/feedback/:code/actions/TRIAGE', targetStatuses: ['RECEIVED'], order: 10 },
                        { id: 'assign', label: 'Assign', intent: 'UPDATE', permission: 'engagement.feedback.act', ownerModule: 'engagementApi', operationRoute: '/operator/feedback/:code/actions/ASSIGN', targetStatuses: ['TRIAGED', 'ESCALATED'], order: 20 },
                        { id: 'start', label: 'Start', intent: 'UPDATE', permission: 'engagement.feedback.act', ownerModule: 'engagementApi', operationRoute: '/operator/feedback/:code/actions/START', targetStatuses: ['ASSIGNED', 'ESCALATED'], order: 30 },
                        { id: 'resolve', label: 'Resolve', intent: 'UPDATE', permission: 'engagement.feedback.act', ownerModule: 'engagementApi', operationRoute: '/operator/feedback/:code/actions/RESOLVE', targetStatuses: ['IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_INTERNAL', 'ESCALATED'], order: 40 },
                        { id: 'reopen', label: 'Reopen', intent: 'UPDATE', permission: 'engagement.feedback.act', ownerModule: 'engagementApi', operationRoute: '/operator/feedback/:code/actions/REOPEN', targetStatuses: ['RESOLVED', 'CLOSED'], order: 50 }
                    ],
                    help: { summary: 'Triage suggestions, complaints, experience feedback, survey responses, and closed-loop outcomes.' }
                },
                {
                    id: 'feedback-complaints', parentId: 'customer-engagement', label: 'Complaints', route: '/engagement/feedback-complaints', icon: 'priority_high', order: 660,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise', 'site'], featureState: 'ACTIVE', requiredPermissions: ['engagement.feedback.read'],
                    workbenchTarget: { moduleName: 'customerFeedback', schemaName: 'customerFeedback' },
                    workbenchPresentation: { fixedFilters: [{ id: 'complaints', label: 'Complaints', field: 'type', value: 'COMPLAINT' }], defaultColumns: ['code', 'subject', 'status', 'priority', 'severity', 'queueCode', 'assigneeId', 'dueAt', 'submittedAt'], hiddenFields: ['message', 'ownerId', 'attachmentCodes'] },
                    help: { summary: 'Focus on complaint escalation, SLA, downstream handoff, resolution, confirmation, and reopening.' }
                },
                {
                    id: 'feedback-follow-up', parentId: 'customer-engagement', label: 'Feedback Follow-up', route: '/engagement/feedback-follow-up', icon: 'contact_phone', order: 670,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE', requiredPermissions: ['engagement.feedback.read'],
                    workbenchTarget: { moduleName: 'customerFeedback', schemaName: 'customerFeedbackFollowUp' },
                    workbenchPresentation: { defaultColumns: ['feedbackCode', 'channel', 'status', 'attempt', 'outcomeCode', 'occurredAt'], hiddenFields: ['providerReference'] },
                    help: { summary: 'Measure offered, attempted, contacted, resolved, accepted, and no-response follow-up evidence.' }
                },
                {
                    id: 'feedback-surveys', parentId: 'customer-engagement', label: 'Feedback Surveys', route: '/engagement/feedback-surveys', icon: 'fact_check', order: 680,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise', 'site'], featureState: 'ACTIVE', requiredPermissions: ['engagement.feedback.read'],
                    workbenchTarget: { moduleName: 'engagementCore', schemaName: 'engagementFormDefinition' },
                    workbenchPresentation: { defaultColumns: ['code', 'submissionType', 'targetCapability', 'status', 'currentVersion', 'sites', 'locales', 'channels'], hiddenFields: [] },
                    help: { summary: 'Use Engagement-owned declarative form definitions for feedback and survey intake without creating a second forms platform.' }
                },
                {
                    id: 'feedback-insights', parentId: 'customer-engagement', label: 'Feedback Insights', route: '/engagement/feedback-insights', icon: 'insights', order: 690,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE', requiredPermissions: ['engagement.feedback.insight'],
                    workbenchTarget: { moduleName: 'customerFeedback', schemaName: 'customerFeedbackInsight' },
                    workbenchPresentation: { defaultColumns: ['insightType', 'source', 'confidence', 'policyVersion', 'modelReference', 'status', 'generatedAt'], hiddenFields: ['value', 'sourceFeedbackCodes', 'promptVersion'] },
                    help: { summary: 'Review source-traceable topics, clusters, trends, anomalies, summaries, corrections, and deletion propagation.' }
                },
                {
                    id: 'engagement-unified-queue', parentId: 'customer-engagement', label: 'Unified Queue', route: '/engagement/unified-queue', icon: 'view_list', order: 700,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise', 'site'], featureState: 'ACTIVE', requiredPermissions: ['engagement.operations.read'],
                    workbenchTarget: { moduleName: 'engagementCore', schemaName: 'engagementUnifiedQueueItem' },
                    workbenchPresentation: { defaultColumns: ['domainType', 'domainCode', 'status', 'queueCode', 'assigneeId', 'priority', 'dueAt', 'projectedAt'], hiddenFields: ['summary', 'relatedRecords', 'consentFlags', 'sourceHash'] },
                    help: { summary: 'Work from one tenant-scoped, rebuildable view while each engagement domain retains command and lifecycle ownership.' }
                },
                {
                    id: 'engagement-dashboards', parentId: 'customer-engagement', label: 'Engagement Dashboards', route: '/engagement/dashboards', icon: 'dashboard', order: 710,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE', requiredPermissions: ['engagement.operations.read'],
                    workbenchTarget: { moduleName: 'engagementCore', schemaName: 'engagementDashboardSnapshot' },
                    workbenchPresentation: { defaultColumns: ['dashboardCode', 'status', 'policyVersion', 'calculatedAt'], hiddenFields: ['filters', 'metrics', 'sourceHashes'] },
                    help: { summary: 'Inspect calculated workload, status, and overdue metrics with policy version and source-hash evidence.' }
                },
                {
                    id: 'engagement-repairs', parentId: 'customer-engagement', label: 'Repair Console', route: '/engagement/repairs', icon: 'build', order: 720,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE', requiredPermissions: ['engagement.operations.repair'],
                    workbenchTarget: { moduleName: 'engagementCore', schemaName: 'engagementRepairCase' },
                    workbenchPresentation: { defaultColumns: ['domainType', 'domainCode', 'repairType', 'status', 'requestedBy'], hiddenFields: ['expectedSourceHash', 'observedSourceHash', 'reason'] },
                    help: { summary: 'Preview and audit projection repairs; approval and execution remain routed through the owning domain.' }
                },
                {
                    id: 'engagement-exports', parentId: 'customer-engagement', label: 'Engagement Exports', route: '/engagement/exports', icon: 'download', order: 730,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE', requiredPermissions: ['engagement.operations.export'],
                    workbenchTarget: { moduleName: 'engagementCore', schemaName: 'engagementExportEvidence' },
                    workbenchPresentation: { defaultColumns: ['purpose', 'recordCount', 'maximumRecords', 'maskingPolicy', 'status'], hiddenFields: ['filters', 'fields', 'requestedBy'] },
                    help: { summary: 'Preview bounded, purpose-bound, masked exports and retain evidence before any external delivery.' }
                },
                {
                    id: 'engagement-automation-decisions', parentId: 'customer-engagement', label: 'Automation Decisions', route: '/engagement/automation-decisions', icon: 'psychology', order: 740,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE', requiredPermissions: ['engagement.automation.review'],
                    workbenchTarget: { moduleName: 'engagementCore', schemaName: 'engagementAutomationDecision' },
                    workbenchPresentation: { defaultColumns: ['capability', 'domainType', 'domainCode', 'source', 'confidence', 'status', 'policyVersion', 'decidedAt'], hiddenFields: ['output', 'explanation', 'sourceHash', 'modelReference', 'promptVersion'] },
                    help: { summary: 'Review, accept, override, or reject source-traceable automation proposals; no proposal executes a customer-impacting action.' }
                },
                {
                    id: 'engagement-automation-evaluations', parentId: 'customer-engagement', label: 'Automation Evaluations', route: '/engagement/automation-evaluations', icon: 'science', order: 750,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE', requiredPermissions: ['engagement.automation.evaluate'],
                    workbenchTarget: { moduleName: 'engagementCore', schemaName: 'engagementAutomationEvaluation' },
                    workbenchPresentation: { defaultColumns: ['capability', 'providerCode', 'modelReference', 'promptVersion', 'datasetReference', 'sampleSize', 'passed', 'evaluatedAt'], hiddenFields: ['metrics', 'thresholds'] },
                    help: { summary: 'Compare versioned automation against governed datasets and thresholds before enabling or changing provider behavior.' }
                },
                {
                    id: 'engagement-delivery-attempts', parentId: 'customer-engagement', label: 'Provider Deliveries', route: '/engagement/provider-deliveries', icon: 'hub', order: 760,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE', requiredPermissions: ['engagement.resilience.read'],
                    workbenchTarget: { moduleName: 'engagementCore', schemaName: 'engagementDeliveryAttempt' },
                    workbenchPresentation: { defaultColumns: ['providerCode', 'eventType', 'eventVersion', 'region', 'status', 'attempt', 'maximumAttempts', 'nextAttemptAt', 'deliveredAt'], hiddenFields: ['payloadHash', 'endpointReference', 'idempotencyKey'] },
                    help: { summary: 'Inspect signed provider delivery, backpressure, retry, dead-letter, idempotency, and region evidence without exposing payloads or secrets.' }
                },
                {
                    id: 'engagement-recovery-checkpoints', parentId: 'customer-engagement', label: 'Recovery Checkpoints', route: '/engagement/recovery-checkpoints', icon: 'restore', order: 770,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE', requiredPermissions: ['engagement.resilience.read'],
                    workbenchTarget: { moduleName: 'engagementCore', schemaName: 'engagementRecoveryCheckpoint' },
                    workbenchPresentation: { defaultColumns: ['workloadCode', 'partitionKey', 'region', 'status', 'processedCount', 'failedCount', 'checkpointedAt'], hiddenFields: ['cursor', 'sourceHash'] },
                    help: { summary: 'Track restart-safe projection, archive, reconciliation, and disaster-recovery progress against regional recovery objectives.' }
                },
                {
                    id: 'engagement-compatibility', parentId: 'customer-engagement', label: 'Contract Compatibility', route: '/engagement/compatibility', icon: 'difference', order: 780,
                    perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE', requiredPermissions: ['engagement.compatibility.read'],
                    workbenchTarget: { moduleName: 'engagementCore', schemaName: 'engagementCompatibilityRecord' },
                    workbenchPresentation: { defaultColumns: ['contractType', 'contractCode', 'version', 'compatibility', 'successorVersion', 'deprecatedAt', 'sunsetAt', 'evaluatedAt'], hiddenFields: ['evidence'] },
                    help: { summary: 'Review API, event, export, and provider version compatibility, deprecation notice, successor, and test evidence.' }
                }
            ]
        }
    },
    engagement: {
        capabilities: {
            contactSubmission: true,
            customerReview: false,
            customerFeedback: false,
            testimonial: false,
            communication: false
        }
    }
};
