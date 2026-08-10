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
        "media.storage.policy.view"
    ],
    "navigation": [
        {
            "id": "media-management",
            "parentId": "cms",
            "parentModuleName": "cms",
            "label": "Media Management",
            "route": "/media",
            "icon": "media",
            "order": 260,
            "group": {
                "id": "content",
                "label": "Content and Experience",
                "order": 200
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
                "summary": "Manage governed media files, folders, formats, sets, usage references, and delivery through media-owned lifecycle policies.",
                "documentationRoute": "/docs/reference/media",
                "documentationFragment": "what-media-means-in-nodics"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "media.storage.policy.view"
            ]
        },
        {
            "id": "media",
            "parentId": "media-management",
            "label": "Media",
            "route": "/media/items",
            "icon": "media",
            "order": 261,
            "group": {
                "id": "content",
                "label": "Content and Experience",
                "order": 200
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
            "parentId": "media-management",
            "label": "Media Folders",
            "route": "/media/folders",
            "icon": "folder",
            "order": 262,
            "group": {
                "id": "content",
                "label": "Content and Experience",
                "order": 200
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
            "parentId": "media-management",
            "label": "Media Sets",
            "route": "/media/sets",
            "icon": "gallery",
            "order": 263,
            "group": {
                "id": "content",
                "label": "Content and Experience",
                "order": 200
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
            "parentId": "media-management",
            "label": "Media Formats",
            "route": "/media/formats",
            "icon": "format",
            "order": 264,
            "group": {
                "id": "content",
                "label": "Content and Experience",
                "order": 200
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
            "parentId": "media-management",
            "label": "Media Usage",
            "route": "/media/usage",
            "icon": "reference",
            "order": 265,
            "group": {
                "id": "content",
                "label": "Content and Experience",
                "order": 200
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
            "parentId": "media-management",
            "label": "Storage and Delivery",
            "route": "/media/storage-delivery",
            "icon": "storage",
            "order": 266,
            "group": {
                "id": "content",
                "label": "Content and Experience",
                "order": 200
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

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('media', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); }
};
