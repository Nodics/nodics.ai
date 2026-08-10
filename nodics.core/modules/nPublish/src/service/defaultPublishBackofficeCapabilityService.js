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
    "contractVersion": 1,
    "minimumClientContractVersion": 1,
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
            "label": "Publishing",
            "route": "/publishing",
            "icon": "workflow",
            "order": 280,
            "group": {
                "id": "content",
                "label": "Content and Experience",
                "order": 200
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
                "summary": "Review and manage governed publication from staged authoring content to online delivery state.",
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
            "parentId": "publishing",
            "label": "Publishing Requests",
            "route": "/publishing/requests",
            "icon": "workflow",
            "order": 290,
            "group": {
                "id": "content",
                "label": "Content and Experience",
                "order": 200
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
            "id": "publishing-audit",
            "parentId": "publishing",
            "label": "Publishing Audit",
            "route": "/publishing/audit",
            "icon": "workflow",
            "order": 320,
            "group": {
                "id": "content",
                "label": "Content and Experience",
                "order": 200
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
