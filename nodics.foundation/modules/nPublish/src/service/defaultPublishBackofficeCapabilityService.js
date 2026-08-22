/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module publish/service/DefaultPublishBackofficeCapabilityService @description Publishes the concrete publish-owned BackOffice capability projection. @layer service @owner publish */
const capability = {
    "enabled": true,
    "capabilityId": "content-management-publish",
    "displayName": "Publishing",
    "category": "content",
    "icon": "content",
    "contractVersion": 0,
    "minimumClientContractVersion": 0,
    "roles": [
        "UI_COMPOSITION_PROVIDER",
        "FUNCTIONAL_CAPABILITY_PROVIDER"
    ],
    "requiredPermissions": [
        "cms.backoffice.view"
    ],
    "navigation": [
        {
            "id": "publishing",
            "label": "Publishing Workspace",
            "route": "/publishing",
            "icon": "workflow",
            "order": 280,
            "group": {
                "id": "publishing",
                "label": "Publishing",
                "order": 1700
            },
            "perspectives": [
                "operations",
                "content"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site",
                "catalog"
            ],
            "workbenchTarget": {
                "moduleName": "publish",
                "schemaName": "publicationRequest"
            },
            "help": {
                "summary": "Review ready-for-review changes, validation/approval required, scheduled/publishing, failed/partial, live-with-new-changes, recently completed, withdrawn, and rollback states.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "publishing"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "publishing-requests",
            "label": "Publication Requests",
            "route": "/publishing/requests",
            "icon": "workflow",
            "order": 290,
            "group": {
                "id": "publishing",
                "label": "Publishing",
                "order": 1700
            },
            "perspectives": [
                "operations",
                "content"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site",
                "catalog"
            ],
            "workbenchTarget": {
                "moduleName": "publish",
                "schemaName": "publicationRequest"
            },
            "help": {
                "summary": "Create and inspect publication requests that move approved content toward online delivery.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "publishing-requests"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "publishing-approval-tasks",
            "label": "Approval Queue",
            "route": "/process/tasks",
            "icon": "tasks",
            "order": 295,
            "group": {
                "id": "publishing",
                "label": "Publishing",
                "order": 1700
            },
            "perspectives": [
                "operations",
                "content"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Review human workflow tasks that approve or reject governed publication requests.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "publishing-approval-tasks"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "process.backoffice.view"
            ]
        },
        {
            "id": "publishing-audit",
            "label": "Publishing Audit",
            "route": "/publishing/audit",
            "icon": "workflow",
            "order": 320,
            "group": {
                "id": "publishing",
                "label": "Publishing",
                "order": 1700
            },
            "perspectives": [
                "operations",
                "content"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site",
                "catalog"
            ],
            "workbenchTarget": {
                "moduleName": "publish",
                "schemaName": "publicationAudit"
            },
            "help": {
                "summary": "Review publishing audit records for operational traceability and content governance evidence.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "publishing-audit"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "scheduled-publications",
            "label": "Scheduled Publications",
            "route": "/publishing/scheduled",
            "icon": "workflow",
            "order": 340,
            "group": {
                "id": "publishing",
                "label": "Publishing",
                "order": 1700
            },
            "perspectives": [
                "operations",
                "content"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site",
                "catalog"
            ],
            "help": {
                "summary": "Planned upcoming, approval, paused, missed, executing, completed, and cancelled scheduled-publication workspace."
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "online-publications",
            "label": "Online Publications",
            "route": "/publishing/online",
            "icon": "workflow",
            "order": 350,
            "group": {
                "id": "publishing",
                "label": "Publishing",
                "order": 1700
            },
            "perspectives": [
                "operations",
                "content"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site",
                "catalog"
            ],
            "help": {
                "summary": "Planned live, live-with-changes, scheduled replacement, expiring, withdrawn, superseded, receipt, comparison, and dependency workspace."
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "publication-dependencies",
            "label": "Publication Dependencies",
            "route": "/publishing/dependencies",
            "icon": "workflow",
            "order": 360,
            "group": {
                "id": "publishing",
                "label": "Publishing",
                "order": 1700
            },
            "perspectives": [
                "operations",
                "content"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site",
                "catalog"
            ],
            "help": {
                "summary": "Planned satisfied, missing, invalid, conflict, unavailable, manifest, and follow-up dependency workspace."
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "publishing-failures-recovery",
            "label": "Failures & Recovery",
            "route": "/publishing/failures",
            "icon": "workflow",
            "order": 370,
            "group": {
                "id": "publishing",
                "label": "Publishing",
                "order": 1700
            },
            "perspectives": [
                "operations",
                "content"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site",
                "catalog"
            ],
            "help": {
                "summary": "Planned validation, approval, transfer, verification, partial deployment, projection, reconciliation, retry, rollback, and acknowledgement workspace."
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "withdrawals-rollbacks",
            "label": "Withdrawals & Rollbacks",
            "route": "/publishing/withdrawals-rollbacks",
            "icon": "workflow",
            "order": 380,
            "group": {
                "id": "publishing",
                "label": "Publishing",
                "order": 1700
            },
            "perspectives": [
                "operations",
                "content"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site",
                "catalog"
            ],
            "help": {
                "summary": "Planned withdrawal request, approval, scheduling, history, rollback candidate, execution, and verification workspace."
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "publishing-configuration",
            "label": "Publishing Configuration",
            "route": "/publishing/configuration",
            "icon": "workflow",
            "order": 390,
            "group": {
                "id": "publishing",
                "label": "Publishing",
                "order": 1700
            },
            "perspectives": [
                "operations",
                "content"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise",
                "site",
                "catalog"
            ],
            "help": {
                "summary": "Planned restricted publishable-domain, adapter, version-provider, target, approval, scheduling, dependency, retry, recovery, retention, verification, event, and projection policy workspace."
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        }
    ]
};

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('publish', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); }
};
