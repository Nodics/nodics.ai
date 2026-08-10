/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module engagementCore/config/properties
 * @description Defines provider-neutral Customer Engagement Core policy, schema access, lifecycle, protection, and integration defaults.
 * @layer config
 * @owner engagementCore
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    schemaPolicies: {
        engagementCore: {
            customerOwned: {
                accessGroups: {
                    adminGroup: 10,
                    serviceAccountUserGroup: 10,
                    customerUserGroup: 10
                },
                ownership: {
                    enabled: true,
                    ownerProperty: 'ownerId',
                    bypassGroups: {
                        adminGroup: true,
                        serviceAccountUserGroup: true
                    },
                    subjectGroups: {
                        customerUserGroup: true
                    },
                    principalTypes: {
                        customer: true
                    }
                }
            },
            operational: {
                accessGroups: {
                    adminGroup: 10,
                    serviceAccountUserGroup: 10,
                    employeeUserGroup: 10
                }
            }
        }
    },
    engagementCore: {
        automation: {
            enabled: true, aiEnabled: false, policyVersion: '1', minimumConfidence: 0.75,
            humanReviewCapabilities: ['MODERATION_RECOMMENDATION', 'FRAUD_SIGNAL', 'ANOMALY_SIGNAL', 'RESPONSE_DRAFT'],
            directActionAllowed: false, deterministicFallbackRequired: true,
            prohibitedInputFields: ['password', 'accessToken', 'refreshToken', 'providerSecret'],
            requiredEvidence: ['sourceHash', 'sourceRevision', 'policyVersion'],
            evaluation: { minimumSampleSize: 25, requiredMetrics: ['accuracy', 'precision', 'recall'], maximumErrorRate: 0.1 }
        },
        resilience: {
            policyVersion: '1', defaultRegion: 'home', allowedRegions: ['home'], maximumPageSize: 100, maximumBatchSize: 100,
            maximumInFlightDeliveries: 25, maximumDeliveryAttempts: 5, baseRetryMilliseconds: 1000, maximumRetryMilliseconds: 300000,
            recoveryPointObjectiveMinutes: 15, recoveryTimeObjectiveMinutes: 60, archiveAfterDays: 365,
            webhook: { signatureAlgorithm: 'sha256', replayWindowSeconds: 300 },
            compatibility: { supportedMajorVersions: [1], minimumDeprecationDays: 180 },
            performanceBudgets: { listP95Milliseconds: 500, commandP95Milliseconds: 1000, projectionLagSeconds: 60 }
        },
        lifecycle: {
            initialStatus: 'RECEIVED',
            requireExpectedRevision: true,
            transitions: {
                RECEIVED: ['VALIDATING', 'REJECTED', 'SPAM', 'DUPLICATE'],
                VALIDATING: ['ACCEPTED', 'REJECTED', 'SPAM', 'DUPLICATE'],
                ACCEPTED: ['TRIAGED', 'IN_PROGRESS', 'ON_HOLD'],
                TRIAGED: ['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'],
                ASSIGNED: ['IN_PROGRESS', 'ON_HOLD'],
                IN_PROGRESS: ['WAITING_CUSTOMER', 'WAITING_INTERNAL', 'ON_HOLD', 'ACTIONED', 'RESOLVED'],
                WAITING_CUSTOMER: ['IN_PROGRESS', 'RESOLVED'],
                WAITING_INTERNAL: ['IN_PROGRESS', 'RESOLVED'],
                ON_HOLD: ['TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'REJECTED'],
                ACTIONED: ['RESOLVED', 'CLOSED'],
                RESOLVED: ['IN_PROGRESS', 'CLOSED'],
                CLOSED: ['ARCHIVED'],
                REJECTED: ['ARCHIVED'],
                SPAM: ['ARCHIVED'],
                DUPLICATE: ['ARCHIVED'],
                ARCHIVED: []
            }
        },
        validation: {
            maximumPayloadBytes: 65536,
            maximumTextLength: 10000,
            allowedChannels: ['WEB', 'MOBILE', 'API', 'BACKOFFICE', 'IMPORT', 'INTEGRATION'],
            allowedAuthorityModes: ['ENGAGEMENT', 'EXTERNAL_CASE']
        },
        protection: {
            deniedEvidenceKeys: ['authorization', 'cookie', 'credential', 'password', 'secret', 'token'],
            maximumEvidenceDepth: 8,
            maximumCollectionItems: 100,
            maskFields: ['email', 'phone', 'mobile']
        },
        retention: {
            requireConfiguredPolicy: true,
            hardDeleteEnabled: false,
            legalHoldOverridesExpiry: true
        },
        providers: {
            riskAdapterService: null,
            classificationAdapterService: null,
            processAdapterService: null,
            publicationAdapterService: null,
            submissionRepositoryService: 'DefaultEngagementSubmissionService',
            activityRepositoryService: 'DefaultEngagementActivityService'
        },
        unifiedOperations: {
            enabled: true,
            policyVersion: '1',
            maximumBatchSize: 100,
            batchPreviewRequired: true,
            batchReasonRequired: true,
            maximumExportRecords: 10000,
            maskingPolicy: 'engagement-operator-export',
            allowedExportFields: ['domainType', 'domainCode', 'status', 'queueCode', 'priority', 'dueAt', 'projectedAt'],
            prohibitedWritableFields: ['status', 'queueCode', 'assigneeId', 'priority', 'dueAt', 'summary']
        }
    }
};
