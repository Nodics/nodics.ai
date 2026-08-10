/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module engagementApi/config/properties
 * @description Defines secured-by-default Engagement API exposure, projection, payload, and anonymous allow-list policies.
 * @layer config
 * @owner engagementApi
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    engagementApi: {
        anonymousRouteAllowList: ['getActiveForm', 'submitContact', 'listTestimonials', 'listReviews', 'getReviewAggregate', 'submitFeedback'],
        limits: { maximumPayloadBytes: 65536, maximumQueryLimit: 100, defaultQueryLimit: 25 },
        projections: {
            publicForm: ['code', 'submissionType', 'version', 'structure', 'sites', 'locales', 'channels'],
            customerSubmission: ['code', 'type', 'status', 'subject', 'preferredChannel', 'submittedAt', 'resolvedAt', 'closedAt', 'correlationId'],
            operatorSubmission: ['code', 'revision', 'type', 'reasonCode', 'status', 'subject', 'preferredChannel', 'ownerId', 'queueCode', 'teamCode', 'priorityCode', 'dueAt', 'submittedAt', 'resolvedAt', 'closedAt', 'correlationId'],
            integrationReceipt: ['referenceCode', 'status', 'receivedAt', 'correlationId']
            , contactAcknowledgement: ['referenceCode', 'duplicate', 'verificationRequired'],
            handoffRecovery: ['code', 'status', 'reconciled', 'workerId', 'examined', 'succeeded', 'retryPending', 'deadLetter', 'skipped', 'results'],
            publicTestimonial: ['candidateCode', 'versionCode', 'projectionVersion', 'publicText', 'attribution', 'disclosures', 'channel', 'region', 'locale', 'wcmsPlacementCodes', 'publishedAt', 'expiresAt'],
            testimonialConsent: ['code', 'candidateCode', 'status', 'attribution', 'channels', 'regions', 'likenessAllowed', 'mediaAllowed', 'policyVersion', 'validFrom', 'expiresAt', 'withdrawnAt'],
            testimonialAction: ['testimonialCode', 'status', 'hiddenCount', 'examined', 'repaired', 'projections', 'withdrawnAt']
            , customerReview: ['code', 'targetType', 'targetCode', 'overallRating', 'dimensionRatings', 'title', 'body', 'advantages', 'disadvantages', 'recommendation', 'mediaCodes', 'site', 'locale', 'channel', 'status', 'moderationMode', 'revision', 'submittedAt', 'withdrawnAt', 'correlationId']
            , reviewAbuseReport: ['code', 'reviewCode', 'reasonCode', 'status', 'resolutionCode', 'resolvedAt', 'correlationId']
            , cresMigrationPreview: ['review', 'migration']
            , publicReviewPage: ['items', 'total', 'offset', 'limit', 'appliedFilters', 'sort']
            , publicReviewAggregate: ['targetType', 'targetCode', 'variantCode', 'site', 'locale', 'count', 'average', 'distribution', 'dimensions', 'verifiedCount', 'unverifiedCount', 'policyVersion', 'calculationVersion', 'calculatedAt']
            , reviewHelpfulness: ['reviewCode', 'helpful', 'status', 'revision', 'correlationId']
            , reviewRequest: ['code', 'targetCodes', 'channel', 'status', 'eligibleAt', 'offeredAt', 'expiresAt', 'reminderCount', 'policyVersion', 'correlationId']
            , reviewSession: ['code', 'requestCode', 'targetCodes', 'completedTargetCodes', 'status', 'startedAt', 'completedAt', 'expiresAt', 'revision', 'correlationId']
            , reviewSyndication: ['code', 'direction', 'providerCode', 'externalReviewId', 'externalTargetId', 'targetType', 'targetCode', 'reviewCode', 'originUrl', 'licenseCode', 'disclosure', 'mappingVersion', 'status', 'lastReconciledAt', 'correlationId']
            , customerFeedback: ['code', 'type', 'targetType', 'targetCode', 'subject', 'structuredAnswers', 'scores', 'desiredOutcome', 'preferredChannel', 'status', 'category', 'topic', 'sentiment', 'priority', 'severity', 'queueCode', 'dueAt', 'revision', 'submittedAt', 'resolvedAt', 'closedAt', 'correlationId']
            , feedbackAcknowledgement: ['code', 'status', 'submittedAt', 'correlationId']
            , feedbackClassification: ['code', 'feedbackCode', 'category', 'topic', 'sentiment', 'priority', 'severity', 'source', 'confidence', 'policyVersion', 'classifiedAt', 'correlationId']
            , feedbackInsight: ['code', 'insightType', 'sourceFeedbackCodes', 'value', 'confidence', 'source', 'policyVersion', 'modelReference', 'status', 'generatedAt', 'correlationId']
            , unifiedQueue: ['code', 'domainType', 'domainCode', 'sourceRevision', 'status', 'queueCode', 'assigneeId', 'priority', 'dueAt', 'summary', 'relatedRecords', 'consentFlags', 'integrationStatus', 'projectedAt', 'correlationId']
            , engagementDashboard: ['dashboardCode', 'filters', 'metrics', 'policyVersion', 'calculatedAt', 'status', 'correlationId']
            , engagementBatchPreview: ['preview', 'count', 'commands', 'requiresApproval', 'directMutation']
            , engagementExportPreview: ['purpose', 'fields', 'maskingPolicy', 'recordCount', 'maximumRecords', 'status', 'correlationId']
            , engagementRepairPreview: ['domainType', 'domainCode', 'repairType', 'expectedSourceHash', 'observedSourceHash', 'status', 'reason', 'correlationId']
            , engagementBatchRun: ['idempotencyKey', 'action', 'status', 'total', 'succeeded', 'failed', 'cursor', 'results', 'correlationId', 'startedAt', 'completedAt', 'duplicate']
            , engagementExportResult: ['purpose', 'fields', 'maskingPolicy', 'recordCount', 'status', 'checksum', 'generatedAt', 'expiresAt', 'rows', 'correlationId']
            , engagementRepairResult: ['domainType', 'domainCode', 'repairType', 'status', 'reason', 'result', 'repairedAt', 'correlationId']
            , engagementPrivacyResult: ['code', 'domainType', 'domainCode', 'operation', 'purpose', 'status', 'fields', 'checksum', 'result', 'data', 'correlationId', 'executedAt']
        },
        permissions: {
            customerRead: 'engagement.customer.read',
            operatorRead: 'engagement.operator.read',
            integrationCallback: 'engagement.integration.callback',
            formRead: 'engagement.form.read'
        }
    }
};
