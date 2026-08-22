/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module contactSubmission/service/DefaultContactSubmissionBackofficeCapabilityService @description Publishes the concrete contactSubmission-owned BackOffice capability projection. @layer service @owner contactSubmission */
const capability = {
    "enabled": true,
    "capabilityId": "customer-engagement-contactSubmission",
    "displayName": "Contact Submissions",
    "category": "organization",
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
            "id": "contact-submissions",
            "parentId": "customer-engagement",
            "label": "Contact Submissions",
            "route": "/engagement/contact-submissions",
            "icon": "inbox",
            "order": 510,
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
                "engagement.operator.read"
            ],
            "workbenchTarget": {
                "moduleName": "contactSubmission",
                "schemaName": "contactRequest"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "code",
                    "type",
                    "subject",
                    "status",
                    "queueCode",
                    "priorityCode",
                    "submittedAt",
                    "dueAt"
                ],
                "hiddenFields": [
                    "message",
                    "contactEmail",
                    "contactPhone",
                    "ownerId"
                ],
                "quickFilters": [
                    {
                        "id": "open",
                        "label": "Open",
                        "field": "status",
                        "values": [
                            "OPEN",
                            "IN_PROGRESS",
                            "WAITING_CUSTOMER",
                            "WAITING_INTERNAL"
                        ]
                    },
                    {
                        "id": "verification",
                        "label": "Verification pending",
                        "field": "status",
                        "value": "VERIFICATION_PENDING"
                    },
                    {
                        "id": "resolved",
                        "label": "Resolved",
                        "field": "status",
                        "value": "RESOLVED"
                    }
                ]
            },
            "lifecycleActions": [
                {
                    "id": "attempt-contact",
                    "label": "Start work",
                    "intent": "UPDATE",
                    "permission": "engagement.operator.act",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/contact-submissions/:code/actions/ATTEMPT_CONTACT",
                    "targetStatuses": [
                        "OPEN",
                        "WAITING_CUSTOMER",
                        "WAITING_INTERNAL"
                    ],
                    "order": 10
                },
                {
                    "id": "request-information",
                    "label": "Request information",
                    "intent": "UPDATE",
                    "permission": "engagement.operator.act",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/contact-submissions/:code/actions/REQUEST_INFORMATION",
                    "targetStatuses": [
                        "OPEN",
                        "IN_PROGRESS"
                    ],
                    "order": 20
                },
                {
                    "id": "resolve",
                    "label": "Resolve",
                    "intent": "UPDATE",
                    "permission": "engagement.operator.act",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/contact-submissions/:code/actions/RESOLVE",
                    "targetStatuses": [
                        "OPEN",
                        "IN_PROGRESS",
                        "WAITING_CUSTOMER",
                        "WAITING_INTERNAL"
                    ],
                    "order": 30
                },
                {
                    "id": "close",
                    "label": "Close",
                    "intent": "UPDATE",
                    "permission": "engagement.operator.act",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/contact-submissions/:code/actions/CLOSE",
                    "targetStatuses": [
                        "RESOLVED"
                    ],
                    "order": 40
                },
                {
                    "id": "reopen",
                    "label": "Reopen",
                    "intent": "UPDATE",
                    "permission": "engagement.operator.act",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/contact-submissions/:code/actions/REOPEN",
                    "targetStatuses": [
                        "RESOLVED",
                        "CLOSED"
                    ],
                    "order": 50
                },
                {
                    "id": "mark-spam",
                    "label": "Mark spam",
                    "intent": "REJECT",
                    "permission": "engagement.operator.act",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/contact-submissions/:code/actions/MARK_SPAM",
                    "targetStatuses": [
                        "OPEN"
                    ],
                    "order": 60
                }
            ],
            "help": {
                "summary": "Triage, assign, action, resolve, and recover contact requests with tenant-scoped evidence and optimistic revision checks."
            },
            "parentModuleName": "engagementCore"
        },
        {
            "id": "contact-handoffs",
            "parentId": "customer-engagement",
            "label": "Process Handoffs",
            "route": "/engagement/contact-handoffs",
            "icon": "sync_problem",
            "order": 520,
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
                "engagement.handoff.recover"
            ],
            "workbenchTarget": {
                "moduleName": "contactSubmission",
                "schemaName": "contactHandoff"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "code",
                    "contactRequestCode",
                    "target",
                    "status",
                    "attempts",
                    "nextRetryAt",
                    "externalReference",
                    "updatedAt"
                ],
                "hiddenFields": [
                    "payload",
                    "leaseOwner"
                ],
                "quickFilters": [
                    {
                        "id": "pending",
                        "label": "Pending",
                        "field": "status",
                        "values": [
                            "PENDING",
                            "RETRY_PENDING",
                            "IN_PROGRESS"
                        ]
                    },
                    {
                        "id": "dead-letter",
                        "label": "Dead letter",
                        "field": "status",
                        "value": "DEAD_LETTER"
                    },
                    {
                        "id": "succeeded",
                        "label": "Succeeded",
                        "field": "status",
                        "value": "SUCCEEDED"
                    }
                ]
            },
            "lifecycleActions": [
                {
                    "id": "retry",
                    "label": "Retry",
                    "intent": "UPDATE",
                    "permission": "engagement.handoff.recover",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/handoffs/:code/retry",
                    "targetStatuses": [
                        "DEAD_LETTER"
                    ],
                    "order": 10
                },
                {
                    "id": "reconcile",
                    "label": "Reconcile",
                    "intent": "UPDATE",
                    "permission": "engagement.handoff.reconcile",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/handoffs/:code/reconcile",
                    "targetStatuses": [
                        "SUCCEEDED"
                    ],
                    "order": 20
                }
            ],
            "help": {
                "summary": "Inspect Process handoff delivery, retry dead letters, and reconcile provider terminal state. Recovery batches use the secured operator API."
            },
            "parentModuleName": "engagementCore"
        }
    ]
};

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('contactSubmission', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); }
};
