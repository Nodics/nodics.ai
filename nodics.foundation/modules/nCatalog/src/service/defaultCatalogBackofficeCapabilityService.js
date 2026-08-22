/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module catalog/service/DefaultCatalogBackofficeCapabilityService @description Publishes the concrete catalog-owned BackOffice capability projection. @layer service @owner catalog */
const capability = {
    "enabled": true,
    "capabilityId": "content-management-catalog",
    "displayName": "Content Catalogs",
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
            "id": "content-catalogs",
            "parentId": "cms-sites-catalogs",
            "label": "Content Catalogs",
            "route": "/content/catalogs",
            "icon": "cms",
            "order": 207,
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
                "moduleName": "catalog",
                "schemaName": "catalog"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "code",
                    "name",
                    "catalogType",
                    "active"
                ],
                "fixedFilters": [
                    {
                        "id": "content-catalog-type",
                        "label": "Content catalogs",
                        "field": "catalogType",
                        "value": "CONTENT",
                        "order": 10
                    }
                ]
            },
            "help": {
                "summary": "Manage content catalogs that organize CMS content for governed authoring, preview, and delivery.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "content-catalogs"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ],
            "parentModuleName": "cms"
        }
    ]
};

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('catalog', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); }
};
