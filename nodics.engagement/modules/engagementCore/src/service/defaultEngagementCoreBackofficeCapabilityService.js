/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module engagementCore/service/DefaultEngagementCoreBackofficeCapabilityService @description Publishes the concrete engagementCore-owned BackOffice capability projection. @layer service @owner engagementCore */
const capability = {
    "enabled": true,
    "capabilityId": "customer-engagement",
    "displayName": "Customer Engagement",
    "category": "organization",
    "icon": "feedback",
    "contractVersion": 1,
    "minimumClientContractVersion": 1,
    "roles": [
        "FUNCTIONAL_CAPABILITY_PROVIDER"
    ],
    "discovery": {
        "openApiPath": "/nodics/system/v0/contract/openapi/internal",
        "contractVersion": 1
    },
    "requiredPermissions": [
        "engagement.backoffice.view"
    ],
    "navigation": [
        {
            "id": "customer-engagement",
            "label": "Customer Service and Engagement",
            "route": "/engagement",
            "icon": "feedback",
            "order": 460,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
                "order": 400
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.backoffice.view"
            ],
            "help": {
                "summary": "Operate governed customer submissions, approvals, publication decisions, and recovery through Engagement-owned contracts."
            }
        },
        {
            "id": "reviews-reputation",
            "label": "Reviews and Reputation",
            "route": "/engagement#reviews-reputation",
            "icon": "rate_review",
            "order": 470,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
                "order": 400
            },
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
                "engagement.backoffice.view"
            ],
            "help": {
                "summary": "Moderate reviews, responses, reports, appeals, ratings, requests, and publication evidence through Engagement-owned contracts."
            }
        },
        {
            "id": "testimonials-advocacy",
            "label": "Testimonials and Advocacy",
            "route": "/engagement#testimonials-advocacy",
            "icon": "format_quote",
            "order": 480,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
                "order": 400
            },
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
                "engagement.backoffice.view"
            ],
            "help": {
                "summary": "Govern testimonial candidates, editorial versions, consent, rights, scheduling, attribution, and expiry."
            }
        },
        {
            "id": "engagement-insights",
            "label": "Engagement Insights",
            "route": "/engagement#insights",
            "icon": "dashboard",
            "order": 495,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
                "order": 400
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.operations.read"
            ],
            "help": {
                "summary": "Review workload, SLA, feedback, complaints, review trends, sentiment evidence, overdue work, and resolution performance."
            }
        },
        {
            "id": "feedback-surveys",
            "parentId": "customer-engagement",
            "label": "Feedback Surveys",
            "route": "/engagement/feedback-surveys",
            "icon": "fact_check",
            "order": 680,
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
                "engagement.feedback.read"
            ],
            "workbenchTarget": {
                "moduleName": "engagementCore",
                "schemaName": "engagementFormDefinition"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "code",
                    "submissionType",
                    "targetCapability",
                    "status",
                    "currentVersion",
                    "sites",
                    "locales",
                    "channels"
                ],
                "hiddenFields": []
            },
            "help": {
                "summary": "Use Engagement-owned declarative form definitions for feedback and survey intake without creating a second forms platform."
            }
        },
        {
            "id": "engagement-unified-queue",
            "parentId": "customer-engagement",
            "label": "Unified Queue",
            "route": "/engagement/unified-queue",
            "icon": "view_list",
            "order": 700,
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
                "engagement.operations.read"
            ],
            "workbenchTarget": {
                "moduleName": "engagementCore",
                "schemaName": "engagementUnifiedQueueItem"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "domainType",
                    "domainCode",
                    "status",
                    "queueCode",
                    "assigneeId",
                    "priority",
                    "dueAt",
                    "projectedAt"
                ],
                "hiddenFields": [
                    "summary",
                    "relatedRecords",
                    "consentFlags",
                    "sourceHash"
                ]
            },
            "help": {
                "summary": "Work from one tenant-scoped, rebuildable view while each engagement domain retains command and lifecycle ownership."
            }
        },
        {
            "id": "engagement-dashboards",
            "parentId": "engagement-insights",
            "label": "Engagement Dashboards",
            "route": "/engagement/dashboards",
            "icon": "dashboard",
            "order": 710,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.operations.read"
            ],
            "workbenchTarget": {
                "moduleName": "engagementCore",
                "schemaName": "engagementDashboardSnapshot"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "dashboardCode",
                    "status",
                    "policyVersion",
                    "calculatedAt"
                ],
                "hiddenFields": [
                    "filters",
                    "metrics",
                    "sourceHashes"
                ]
            },
            "help": {
                "summary": "Inspect calculated workload, status, and overdue metrics with policy version and source-hash evidence."
            }
        },
        {
            "id": "engagement-repairs",
            "parentId": "customer-engagement",
            "label": "Repair Console",
            "route": "/engagement/repairs",
            "icon": "build",
            "order": 720,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.operations.repair"
            ],
            "workbenchTarget": {
                "moduleName": "engagementCore",
                "schemaName": "engagementRepairCase"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "domainType",
                    "domainCode",
                    "repairType",
                    "status",
                    "requestedBy"
                ],
                "hiddenFields": [
                    "expectedSourceHash",
                    "observedSourceHash",
                    "reason"
                ]
            },
            "help": {
                "summary": "Preview, approve, execute, and audit projection repairs while commands remain routed through the owning domain."
            }
        },
        {
            "id": "engagement-exports",
            "parentId": "customer-engagement",
            "label": "Engagement Exports",
            "route": "/engagement/exports",
            "icon": "download",
            "order": 730,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.operations.export"
            ],
            "workbenchTarget": {
                "moduleName": "engagementCore",
                "schemaName": "engagementExportEvidence"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "purpose",
                    "recordCount",
                    "maximumRecords",
                    "maskingPolicy",
                    "status"
                ],
                "hiddenFields": [
                    "filters",
                    "fields",
                    "requestedBy"
                ]
            },
            "help": {
                "summary": "Preview and execute bounded, purpose-bound, masked exports with checksum and audit evidence before external delivery."
            }
        },
        {
            "id": "engagement-privacy",
            "parentId": "privacy-customer-rights",
            "parentModuleName": "profile",
            "label": "Privacy Operations",
            "route": "/engagement/privacy",
            "icon": "privacy_tip",
            "order": 735,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.privacy.execute"
            ],
            "workbenchTarget": {
                "moduleName": "engagementCore",
                "schemaName": "engagementPrivacyCase"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "domainType",
                    "domainCode",
                    "operation",
                    "purpose",
                    "status",
                    "requestedBy",
                    "executedAt"
                ],
                "hiddenFields": [
                    "fields",
                    "checksum",
                    "result"
                ]
            },
            "help": {
                "summary": "Execute and audit purpose-bound customer-data exports, legal-hold-aware anonymization, and retention archive decisions through domain owners."
            }
        },
        {
            "id": "engagement-automation-decisions",
            "parentId": "customer-engagement",
            "label": "Automation Decisions",
            "route": "/engagement/automation-decisions",
            "icon": "psychology",
            "order": 740,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.automation.review"
            ],
            "workbenchTarget": {
                "moduleName": "engagementCore",
                "schemaName": "engagementAutomationDecision"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "capability",
                    "domainType",
                    "domainCode",
                    "source",
                    "confidence",
                    "status",
                    "policyVersion",
                    "decidedAt"
                ],
                "hiddenFields": [
                    "output",
                    "explanation",
                    "sourceHash",
                    "modelReference",
                    "promptVersion"
                ]
            },
            "help": {
                "summary": "Review, accept, override, or reject source-traceable automation proposals; no proposal executes a customer-impacting action."
            }
        },
        {
            "id": "engagement-automation-evaluations",
            "parentId": "customer-engagement",
            "label": "Automation Evaluations",
            "route": "/engagement/automation-evaluations",
            "icon": "science",
            "order": 750,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.automation.evaluate"
            ],
            "workbenchTarget": {
                "moduleName": "engagementCore",
                "schemaName": "engagementAutomationEvaluation"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "capability",
                    "providerCode",
                    "modelReference",
                    "promptVersion",
                    "datasetReference",
                    "sampleSize",
                    "passed",
                    "evaluatedAt"
                ],
                "hiddenFields": [
                    "metrics",
                    "thresholds"
                ]
            },
            "help": {
                "summary": "Compare versioned automation against governed datasets and thresholds before enabling or changing provider behavior."
            }
        },
        {
            "id": "engagement-delivery-attempts",
            "parentId": "customer-engagement",
            "label": "Provider Deliveries",
            "route": "/engagement/provider-deliveries",
            "icon": "hub",
            "order": 760,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.resilience.read"
            ],
            "workbenchTarget": {
                "moduleName": "engagementCore",
                "schemaName": "engagementDeliveryAttempt"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "providerCode",
                    "eventType",
                    "eventVersion",
                    "region",
                    "status",
                    "attempt",
                    "maximumAttempts",
                    "nextAttemptAt",
                    "deliveredAt"
                ],
                "hiddenFields": [
                    "payloadHash",
                    "endpointReference",
                    "idempotencyKey"
                ]
            },
            "help": {
                "summary": "Inspect signed provider delivery, backpressure, retry, dead-letter, idempotency, and region evidence without exposing payloads or secrets."
            }
        },
        {
            "id": "engagement-recovery-checkpoints",
            "parentId": "customer-engagement",
            "label": "Recovery Checkpoints",
            "route": "/engagement/recovery-checkpoints",
            "icon": "restore",
            "order": 770,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.resilience.read"
            ],
            "workbenchTarget": {
                "moduleName": "engagementCore",
                "schemaName": "engagementRecoveryCheckpoint"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "workloadCode",
                    "partitionKey",
                    "region",
                    "status",
                    "processedCount",
                    "failedCount",
                    "checkpointedAt"
                ],
                "hiddenFields": [
                    "cursor",
                    "sourceHash"
                ]
            },
            "help": {
                "summary": "Track restart-safe projection, archive, reconciliation, and disaster-recovery progress against regional recovery objectives."
            }
        },
        {
            "id": "engagement-compatibility",
            "parentId": "customer-engagement",
            "label": "Contract Compatibility",
            "route": "/engagement/compatibility",
            "icon": "difference",
            "order": 780,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.compatibility.read"
            ],
            "workbenchTarget": {
                "moduleName": "engagementCore",
                "schemaName": "engagementCompatibilityRecord"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "contractType",
                    "contractCode",
                    "version",
                    "compatibility",
                    "successorVersion",
                    "deprecatedAt",
                    "sunsetAt",
                    "evaluatedAt"
                ],
                "hiddenFields": [
                    "evidence"
                ]
            },
            "help": {
                "summary": "Review API, event, export, and provider version compatibility, deprecation notice, successor, and test evidence."
            }
        }
    ]
};

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('engagementCore', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); }
};
