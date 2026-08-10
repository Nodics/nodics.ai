/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module customerFeedback/service/DefaultCustomerFeedbackBackofficeCapabilityService @description Publishes the concrete customerFeedback-owned BackOffice capability projection. @layer service @owner customerFeedback */
const capability = {
    "enabled": true,
    "capabilityId": "customer-engagement-customerFeedback",
    "displayName": "Customer Feedback",
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
            "id": "customer-feedback",
            "parentId": "customer-engagement",
            "label": "Customer Feedback",
            "route": "/engagement/customer-feedback",
            "icon": "feedback",
            "order": 650,
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
                "moduleName": "customerFeedback",
                "schemaName": "customerFeedback"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "code",
                    "type",
                    "targetType",
                    "targetCode",
                    "subject",
                    "status",
                    "priority",
                    "severity",
                    "queueCode",
                    "dueAt",
                    "submittedAt"
                ],
                "hiddenFields": [
                    "message",
                    "ownerId",
                    "structuredAnswers",
                    "scores",
                    "attachmentCodes"
                ]
            },
            "lifecycleActions": [
                {
                    "id": "triage",
                    "label": "Triage",
                    "intent": "UPDATE",
                    "permission": "engagement.feedback.act",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/feedback/:code/actions/TRIAGE",
                    "targetStatuses": [
                        "RECEIVED"
                    ],
                    "order": 10
                },
                {
                    "id": "assign",
                    "label": "Assign",
                    "intent": "UPDATE",
                    "permission": "engagement.feedback.act",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/feedback/:code/actions/ASSIGN",
                    "targetStatuses": [
                        "TRIAGED",
                        "ESCALATED"
                    ],
                    "order": 20
                },
                {
                    "id": "start",
                    "label": "Start",
                    "intent": "UPDATE",
                    "permission": "engagement.feedback.act",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/feedback/:code/actions/START",
                    "targetStatuses": [
                        "ASSIGNED",
                        "ESCALATED"
                    ],
                    "order": 30
                },
                {
                    "id": "resolve",
                    "label": "Resolve",
                    "intent": "UPDATE",
                    "permission": "engagement.feedback.act",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/feedback/:code/actions/RESOLVE",
                    "targetStatuses": [
                        "IN_PROGRESS",
                        "WAITING_CUSTOMER",
                        "WAITING_INTERNAL",
                        "ESCALATED"
                    ],
                    "order": 40
                },
                {
                    "id": "confirm",
                    "label": "Confirm closure",
                    "intent": "UPDATE",
                    "permission": "engagement.feedback.act",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/feedback/:code/actions/CONFIRM",
                    "targetStatuses": [
                        "RESOLVED"
                    ],
                    "order": 50
                },
                {
                    "id": "reopen",
                    "label": "Reopen",
                    "intent": "UPDATE",
                    "permission": "engagement.feedback.act",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/feedback/:code/actions/REOPEN",
                    "targetStatuses": [
                        "RESOLVED",
                        "CLOSED"
                    ],
                    "order": 60
                }
            ],
            "help": {
                "summary": "Triage suggestions, complaints, experience feedback, survey responses, and closed-loop outcomes."
            },
            "parentModuleName": "engagementCore"
        },
        {
            "id": "feedback-complaints",
            "parentId": "customer-engagement",
            "label": "Complaints",
            "route": "/engagement/feedback-complaints",
            "icon": "priority_high",
            "order": 660,
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
                "moduleName": "customerFeedback",
                "schemaName": "customerFeedback"
            },
            "workbenchPresentation": {
                "fixedFilters": [
                    {
                        "id": "complaints",
                        "label": "Complaints",
                        "field": "type",
                        "value": "COMPLAINT"
                    }
                ],
                "defaultColumns": [
                    "code",
                    "subject",
                    "status",
                    "priority",
                    "severity",
                    "queueCode",
                    "assigneeId",
                    "dueAt",
                    "submittedAt"
                ],
                "hiddenFields": [
                    "message",
                    "ownerId",
                    "attachmentCodes"
                ]
            },
            "help": {
                "summary": "Focus on complaint escalation, SLA, downstream handoff, resolution, confirmation, and reopening."
            },
            "parentModuleName": "engagementCore"
        },
        {
            "id": "feedback-follow-up",
            "parentId": "customer-engagement",
            "label": "Feedback Follow-up",
            "route": "/engagement/feedback-follow-up",
            "icon": "contact_phone",
            "order": 670,
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
                "engagement.feedback.read"
            ],
            "workbenchTarget": {
                "moduleName": "customerFeedback",
                "schemaName": "customerFeedbackFollowUp"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "feedbackCode",
                    "channel",
                    "status",
                    "attempt",
                    "outcomeCode",
                    "occurredAt"
                ],
                "hiddenFields": [
                    "providerReference"
                ]
            },
            "help": {
                "summary": "Measure offered, attempted, contacted, resolved, accepted, and no-response follow-up evidence."
            },
            "parentModuleName": "engagementCore"
        },
        {
            "id": "feedback-insights",
            "parentId": "customer-engagement",
            "label": "Feedback Insights",
            "route": "/engagement/feedback-insights",
            "icon": "insights",
            "order": 690,
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
                "engagement.feedback.insight"
            ],
            "workbenchTarget": {
                "moduleName": "customerFeedback",
                "schemaName": "customerFeedbackInsight"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "insightType",
                    "source",
                    "confidence",
                    "policyVersion",
                    "modelReference",
                    "status",
                    "generatedAt"
                ],
                "hiddenFields": [
                    "value",
                    "sourceFeedbackCodes",
                    "promptVersion"
                ]
            },
            "help": {
                "summary": "Review source-traceable topics, clusters, trends, anomalies, summaries, corrections, and deletion propagation."
            },
            "parentModuleName": "engagementCore"
        }
    ]
};

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('customerFeedback', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); }
};
