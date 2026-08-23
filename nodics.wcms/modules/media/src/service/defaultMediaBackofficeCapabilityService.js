/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module media/service/DefaultMediaBackofficeCapabilityService @description Publishes the concrete media-owned BackOffice capability projection. @layer service @owner media */
const capability = {
    "enabled": true,
    "capabilityId": "media-management",
    "displayName": "Media Management",
    "category": "platform",
    "icon": "media",
    "contractVersion": 0,
    "minimumClientContractVersion": 0,
    "roles": [
        "FUNCTIONAL_CAPABILITY_PROVIDER"
    ],
    "discovery": {
        "openApiPath": "/nodics/system/v0/contract/openapi/internal",
        "contractVersion": 0
    },
    "requiredPermissions": [
        "media.storage.policy.view"
    ],
    "navigation": [
        {
            "id": "media-management",
            "label": "Media Workspace",
            "route": "/media",
            "icon": "media",
            "order": 300,
            "group": {
                "id": "media-management",
                "label": "Media Management",
                "order": 300
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Review governed media overview, upload entry points, recent uploads, attention states, provider health, usage alerts, and lifecycle signals.",
                "documentationRoute": "/docs/reference/media",
                "documentationFragment": "what-media-means-in-nodics"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "media.storage.policy.view"
            ]
        },
        {
            "id": "media-library",
            "label": "Media Library",
            "route": "/media/library",
            "icon": "media",
            "order": 310,
            "group": {
                "id": "media-management",
                "label": "Media Management",
                "order": 300
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Search, filter, upload, preview, inspect, download, retire, restore, and classify governed media assets.",
                "documentationRoute": "/docs/reference/media",
                "documentationFragment": "current-implementation-scope"
            },
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "media.storage.policy.view"
            ]
        },
        {
            "id": "media-overview",
            "parentId": "media-management",
            "label": "Media Overview",
            "route": "/media#overview",
            "icon": "dashboard",
            "order": 261,
            "group": {
                "id": "media-management",
                "label": "Media Management",
                "order": 300
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED",
            "requiredPermissions": [
                "media.storage.policy.view"
            ]
        },
        {
            "id": "upload-media",
            "parentId": "media-management",
            "label": "Upload Media",
            "route": "/media#upload",
            "icon": "upload",
            "order": 262,
            "group": {
                "id": "media-management",
                "label": "Media Management",
                "order": 300
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED",
            "requiredPermissions": [
                "media.storage.policy.view"
            ]
        },
        {
            "id": "recently-uploaded-media",
            "parentId": "media-management",
            "label": "Recently Uploaded",
            "route": "/media#recently-uploaded",
            "icon": "history",
            "order": 263,
            "group": {
                "id": "media-management",
                "label": "Media Management",
                "order": 300
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED",
            "requiredPermissions": [
                "media.storage.policy.view"
            ]
        },
        {
            "id": "media-needing-attention",
            "parentId": "media-management",
            "label": "Media Needing Attention",
            "route": "/media#attention",
            "icon": "validation",
            "order": 264,
            "group": {
                "id": "media-management",
                "label": "Media Management",
                "order": 300
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED",
            "requiredPermissions": [
                "media.storage.policy.view"
            ]
        },
        {
            "id": "inactive-retired-media",
            "parentId": "media-management",
            "label": "Inactive or Retired Media",
            "route": "/media#inactive-retired",
            "icon": "archive",
            "order": 265,
            "group": {
                "id": "media-management",
                "label": "Media Management",
                "order": 300
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED",
            "requiredPermissions": [
                "media.storage.policy.view"
            ]
        },
        {
            "id": "media-provider-health",
            "parentId": "media-management",
            "label": "Storage and Provider Health",
            "route": "/media#provider-health",
            "icon": "health",
            "order": 266,
            "group": {
                "id": "media-management",
                "label": "Media Management",
                "order": 300
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED",
            "requiredPermissions": [
                "media.storage.policy.view"
            ]
        },
        {
            "id": "media-lifecycle-alerts",
            "parentId": "media-management",
            "label": "Usage and Lifecycle Alerts",
            "route": "/media#lifecycle-alerts",
            "icon": "validation",
            "order": 267,
            "group": {
                "id": "media-management",
                "label": "Media Management",
                "order": 300
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED",
            "requiredPermissions": [
                "media.storage.policy.view"
            ]
        },
        {
            "id": "media",
            "parentId": "media-library",
            "label": "All Media",
            "route": "/media/items",
            "icon": "media",
            "order": 261,
            "group": {
                "id": "media-management",
                "label": "Media Management",
                "order": 300
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Upload, preview, search, select, and inspect media records while media owns storage, metadata, and delivery policy.",
                "documentationRoute": "/docs/reference/media",
                "documentationFragment": "current-implementation-scope"
            },
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "media.storage.policy.view"
            ],
            "workbenchTarget": { "moduleName": "media", "schemaName": "media" }
        },
        {
            "id": "media-folders",
            "label": "Folders and Intake Policies",
            "route": "/media/folders",
            "icon": "folder",
            "order": 320,
            "group": {
                "id": "media-management",
                "label": "Media Management",
                "order": 300
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Review and manage purpose-based media folder policy, upload constraints, storage routing, and lifecycle boundaries.",
                "documentationRoute": "/docs/reference/media",
                "documentationFragment": "storage-provider-configuration"
            },
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "media.storage.policy.view"
            ],
            "workbenchTarget": { "moduleName": "media", "schemaName": "mediaFolder" }
        },
        {
            "id": "media-sets",
            "label": "Media Sets and Galleries",
            "route": "/media/sets",
            "icon": "gallery",
            "order": 340,
            "group": {
                "id": "media-management",
                "label": "Media Management",
                "order": 300
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Manage ordered media sets such as galleries while callers reference media-set identity instead of duplicating file metadata.",
                "documentationRoute": "/docs/reference/media",
                "documentationFragment": "how-product-galleries-should-use-media-sets"
            },
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "media.storage.policy.view"
            ]
        },
        {
            "id": "media-formats",
            "label": "Formats and Variants",
            "route": "/media/formats",
            "icon": "format",
            "order": 330,
            "group": {
                "id": "media-management",
                "label": "Media Management",
                "order": 300
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Manage allowed media formats, MIME policy, extensions, and conversion or delivery expectations through media configuration.",
                "documentationRoute": "/docs/reference/media",
                "documentationFragment": "core-schemas"
            },
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "media.storage.policy.view"
            ],
            "workbenchTarget": { "moduleName": "media", "schemaName": "mediaFormat" }
        },
        {
            "id": "media-usage",
            "label": "Usage and References",
            "route": "/media/usage",
            "icon": "reference",
            "order": 350,
            "group": {
                "id": "media-management",
                "label": "Media Management",
                "order": 300
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Inspect which business records reference media items or media sets without transferring ownership away from the caller module.",
                "documentationRoute": "/docs/reference/media",
                "documentationFragment": "reference-lookup-for-caller-modules"
            },
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "media.storage.policy.view"
            ]
        },
        {
            "id": "storage-delivery",
            "label": "Storage and Delivery",
            "route": "/media/storage-delivery",
            "icon": "storage",
            "order": 360,
            "group": {
                "id": "media-management",
                "label": "Media Management",
                "order": 300
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Review storage providers, access URLs, delivery, downloads, and private/public media behavior without exposing provider secrets or raw paths.",
                "documentationRoute": "/docs/reference/media",
                "documentationFragment": "delivering-media-safely"
            },
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "media.storage.policy.view"
            ]
        }
    ]
};

const defaultMediaHelp = {
    summary: "Review governed media lifecycle operations through the nMedia-owned storage, policy, reference, publication, and delivery contracts.",
    documentationRoute: "/docs/reference/media",
    documentationFragment: "current-implementation-scope"
};

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('media', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () {
        let result = JSON.parse(JSON.stringify(capability));
        result.navigation = (result.navigation || []).map(entry => Object.assign({ help: defaultMediaHelp }, entry));
        return result;
    }
};
