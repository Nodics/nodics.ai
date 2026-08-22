/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module localizationCore/service/DefaultLocalizationCoreBackofficeCapabilityService @description Publishes the concrete localizationCore-owned BackOffice capability projection. @layer service @owner localizationCore */
const capability = {
    "enabled": true,
    "capabilityId": "localization",
    "displayName": "Localization",
    "category": "platform",
    "icon": "language",
    "contractVersion": 0,
    "minimumClientContractVersion": 0,
    "roles": [
        "FUNCTIONAL_CAPABILITY_PROVIDER"
    ],
    "navigation": [
        {
            "id": "localization-operations",
            "label": "Localization Operations",
            "labelKey": "localization.navigation.title",
            "route": "/localization",
            "icon": "language",
            "order": 240,
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
                "localization.operations.read"
            ],
            "workbenchTarget": {
                "moduleName": "localizationCore",
                "schemaName": "localizationValue"
            },
            "help": {
                "summary": "Manage translation coverage, queues, review, publication, rollback, and runtime evidence without source deployment."
            }
        },
        {
            "id": "localization-keys",
            "parentId": "localization-operations",
            "label": "Translation Keys",
            "labelKey": "localization.navigation.keys",
            "route": "/localization/keys",
            "icon": "key",
            "order": 241,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "localization.operations.read"
            ],
            "workbenchTarget": {
                "moduleName": "localizationCore",
                "schemaName": "localizationKey"
            }
        },
        {
            "id": "localization-values",
            "parentId": "localization-operations",
            "label": "Translation Queue",
            "labelKey": "localization.navigation.queue",
            "route": "/localization/queue",
            "icon": "translate",
            "order": 242,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "localization.operations.read"
            ],
            "workbenchTarget": {
                "moduleName": "localizationCore",
                "schemaName": "localizationValue"
            }
        },
        {
            "id": "localization-releases",
            "parentId": "localization-operations",
            "label": "Translation Releases",
            "labelKey": "localization.navigation.releases",
            "route": "/localization/releases",
            "icon": "publish",
            "order": 243,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "localization.release.build"
            ],
            "workbenchTarget": {
                "moduleName": "localizationCore",
                "schemaName": "localizationRelease"
            }
        },
        {
            "id": "localization-memory",
            "parentId": "localization-operations",
            "label": "Translation Memory",
            "labelKey": "localization.navigation.memory",
            "route": "/localization/memory",
            "icon": "history",
            "order": 244,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "localization.operations.read"
            ],
            "workbenchTarget": {
                "moduleName": "localizationCore",
                "schemaName": "localizationValue"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "namespace",
                    "key",
                    "locale",
                    "state",
                    "revision",
                    "provenance"
                ]
            }
        }
    ]
};

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('localizationCore', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); }
};
