/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module customerReview/service/DefaultCustomerReviewBackofficeCapabilityService @description Publishes the concrete customerReview-owned BackOffice capability projection. @layer service @owner customerReview */
const capability = {
    "enabled": true,
    "capabilityId": "customer-engagement-customerReview",
    "displayName": "Customer Reviews",
    "category": "customer-experience",
    "icon": "feedback",
    "contractVersion": 1,
    "minimumClientContractVersion": 1,
    "roles": [
        "FUNCTIONAL_CAPABILITY_PROVIDER"
    ],
    "requiredPermissions": [
        "engagement.backoffice.view"
    ],
    "navigation": [
        {
            "id": "customer-reviews",
            "parentId": "customer-engagement",
            "label": "Customer Reviews",
            "route": "/engagement/customer-reviews",
            "icon": "rate_review",
            "order": 570,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.review.read"
            ],
            "workbenchTarget": {
                "moduleName": "customerReview",
                "schemaName": "customerReview"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "code",
                    "targetType",
                    "targetCode",
                    "overallRating",
                    "status",
                    "moderationMode",
                    "site",
                    "locale",
                    "submittedAt"
                ],
                "hiddenFields": [
                    "body",
                    "ownerId",
                    "orderCode",
                    "orderEntryCode",
                    "structuredAnswers"
                ]
            },
            "lifecycleActions": [
                {
                    "id": "approve",
                    "label": "Approve",
                    "intent": "UPDATE",
                    "permission": "engagement.review.moderate",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/reviews/:code/actions/APPROVE",
                    "targetStatuses": [
                        "SUBMITTED",
                        "PENDING_MODERATION",
                        "QUARANTINED"
                    ],
                    "order": 10
                },
                {
                    "id": "quarantine",
                    "label": "Quarantine",
                    "intent": "REJECT",
                    "permission": "engagement.review.moderate",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/reviews/:code/actions/QUARANTINE",
                    "targetStatuses": [
                        "SUBMITTED",
                        "PENDING_MODERATION",
                        "APPROVED"
                    ],
                    "order": 20
                },
                {
                    "id": "reject",
                    "label": "Reject",
                    "intent": "REJECT",
                    "permission": "engagement.review.moderate",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/reviews/:code/actions/REJECT",
                    "targetStatuses": [
                        "SUBMITTED",
                        "PENDING_MODERATION",
                        "QUARANTINED"
                    ],
                    "order": 30
                },
                {
                    "id": "restore",
                    "label": "Restore",
                    "intent": "UPDATE",
                    "permission": "engagement.review.moderate",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/reviews/:code/actions/RESTORE",
                    "targetStatuses": [
                        "QUARANTINED",
                        "REJECTED",
                        "HIDDEN",
                        "WITHDRAWN"
                    ],
                    "order": 40
                }
            ],
            "help": {
                "summary": "Moderate polymorphic customer reviews without suppressing unfavorable sentiment."
            },
            "parentModuleName": "engagementCore"
        },
        {
            "id": "review-moderation",
            "parentId": "customer-engagement",
            "label": "Review Moderation",
            "route": "/engagement/review-moderation",
            "icon": "policy",
            "order": 580,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.review.moderate"
            ],
            "workbenchTarget": {
                "moduleName": "customerReview",
                "schemaName": "customerReviewModeration"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "reviewCode",
                    "reviewVersion",
                    "action",
                    "fromStatus",
                    "toStatus",
                    "reasonCode",
                    "policyViolation",
                    "actorId",
                    "occurredAt"
                ],
                "hiddenFields": [
                    "internalNotes",
                    "evidence",
                    "sentiment"
                ]
            },
            "help": {
                "summary": "Inspect immutable policy reasons, escalation, and audit evidence for moderation actions."
            },
            "parentModuleName": "engagementCore"
        },
        {
            "id": "review-responses",
            "parentId": "customer-engagement",
            "label": "Business Responses",
            "route": "/engagement/review-responses",
            "icon": "forum",
            "order": 590,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.review.respond"
            ],
            "workbenchTarget": {
                "moduleName": "customerReview",
                "schemaName": "customerReviewResponse"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "reviewCode",
                    "version",
                    "status",
                    "authorId",
                    "teamCode",
                    "approvedBy",
                    "publishedAt"
                ],
                "hiddenFields": [
                    "body"
                ]
            },
            "help": {
                "summary": "Draft, approve, publish, hide, and version official business responses."
            },
            "parentModuleName": "engagementCore"
        },
        {
            "id": "review-abuse",
            "parentId": "customer-engagement",
            "label": "Review Abuse & Appeals",
            "route": "/engagement/review-abuse",
            "icon": "report",
            "order": 600,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.review.abuse.resolve"
            ],
            "workbenchTarget": {
                "moduleName": "customerReview",
                "schemaName": "customerReviewAbuseReport"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "reviewCode",
                    "reasonCode",
                    "status",
                    "resolutionCode",
                    "resolvedBy",
                    "resolvedAt"
                ],
                "hiddenFields": [
                    "comment",
                    "evidence",
                    "reporterId"
                ]
            },
            "help": {
                "summary": "Investigate duplicate-safe abuse reports and preserve appeal and reinstatement evidence."
            },
            "parentModuleName": "engagementCore"
        },
        {
            "id": "review-publications",
            "parentId": "customer-engagement",
            "label": "Published Reviews",
            "route": "/engagement/review-publications",
            "icon": "public",
            "order": 610,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.review.read"
            ],
            "workbenchTarget": {
                "moduleName": "customerReview",
                "schemaName": "customerReviewProjection"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "reviewCode",
                    "targetType",
                    "targetCode",
                    "variantCode",
                    "overallRating",
                    "status",
                    "helpfulCount",
                    "publishedAt"
                ],
                "hiddenFields": [
                    "body",
                    "media",
                    "businessResponse",
                    "authenticity",
                    "sourceHash"
                ]
            },
            "help": {
                "summary": "Inspect the sanitized, version-specific evidence currently eligible for shopper visibility."
            },
            "parentModuleName": "engagementCore"
        },
        {
            "id": "review-aggregates",
            "parentId": "customer-engagement",
            "label": "Rating Aggregates",
            "route": "/engagement/review-aggregates",
            "icon": "analytics",
            "order": 620,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.review.read"
            ],
            "workbenchTarget": {
                "moduleName": "customerReview",
                "schemaName": "customerReviewAggregate"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "targetType",
                    "targetCode",
                    "variantCode",
                    "site",
                    "locale",
                    "count",
                    "average",
                    "verifiedCount",
                    "status",
                    "calculatedAt"
                ],
                "hiddenFields": [
                    "sum",
                    "sourceHash",
                    "dimensions",
                    "distribution"
                ]
            },
            "help": {
                "summary": "Verify published-only rating totals, policy/calculation versions, drift evidence, and rebuild freshness."
            },
            "parentModuleName": "engagementCore"
        },
        {
            "id": "review-requests",
            "parentId": "customer-engagement",
            "label": "Review Requests",
            "route": "/engagement/review-requests",
            "icon": "outgoing_mail",
            "order": 630,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.review.read"
            ],
            "workbenchTarget": {
                "moduleName": "customerReview",
                "schemaName": "customerReviewRequest"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "sourceModule",
                    "sourceRecordCode",
                    "channel",
                    "status",
                    "eligibleAt",
                    "offeredAt",
                    "expiresAt",
                    "reminderCount"
                ],
                "hiddenFields": [
                    "ownerId",
                    "idempotencyKey",
                    "targetCodes"
                ]
            },
            "help": {
                "summary": "Inspect fulfillment-timed requests, delivery funnel state, reminders, suppression, and expiry without sentiment targeting."
            },
            "parentModuleName": "engagementCore"
        },
        {
            "id": "review-syndication",
            "parentId": "customer-engagement",
            "label": "Review Syndication",
            "route": "/engagement/review-syndication",
            "icon": "sync_alt",
            "order": 640,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.review.migrate"
            ],
            "workbenchTarget": {
                "moduleName": "customerReview",
                "schemaName": "customerReviewSyndication"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "direction",
                    "providerCode",
                    "externalReviewId",
                    "targetType",
                    "targetCode",
                    "licenseCode",
                    "status",
                    "lastReconciledAt"
                ],
                "hiddenFields": [
                    "sourceHash",
                    "moderationEvidence",
                    "originUrl",
                    "errors"
                ]
            },
            "help": {
                "summary": "Inspect licensed origin, disclosure, mapping, quarantine, reconciliation, and withdrawal evidence."
            },
            "parentModuleName": "engagementCore"
        }
    ]
};

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('customerReview', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); }
};
