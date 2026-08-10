/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cms/service/DefaultCmsBackofficeCapabilityService @description Publishes the concrete cms-owned BackOffice capability projection. @layer service @owner cms */
const capability = {
    "enabled": true,
    "capabilityId": "content-management",
    "displayName": "Content Management",
    "category": "content",
    "icon": "content",
    "contractVersion": 1,
    "minimumClientContractVersion": 1,
    "roles": [
        "UI_COMPOSITION_PROVIDER",
        "FUNCTIONAL_CAPABILITY_PROVIDER"
    ],
    "discovery": {
        "openApiPath": "/nodics/system/v0/contract/openapi/internal",
        "contractVersion": 1
    },
    "uiComposition": {
        "site": "cmsDefaultSite",
        "catalog": "cmsDefaultContentCatalog",
        "defaultPage": "cmsDefaultPage",
        "fallbackMode": "STATIC_RECOVERY_SHELL"
    },
    "requiredPermissions": [
        "cms.backoffice.view"
    ],
    "navigation": [
        {
            "id": "cms",
            "label": "Web Content Management System",
            "route": "/content",
            "icon": "cms",
            "order": 200,
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
                "moduleName": "cms",
                "schemaName": "cmsPage"
            },
            "help": {
                "summary": "Manage the Web Content Management System authoring area for websites, pages, templates, components, navigation, restrictions, and publishing.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "what-is-the-web-content-management-model"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "content-designer",
            "parentId": "cms",
            "label": "Page Designer",
            "route": "/content/designer",
            "icon": "layout",
            "order": 202,
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
            "help": {
                "summary": "Guide business users through site, page, template, slot, component, media, route, and publishing composition without bypassing WCMS ownership.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "page-designer"
            },
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "cms-sites-catalogs",
            "parentId": "cms",
            "label": "Sites & Catalogs",
            "route": "/content#sites-catalogs",
            "icon": "catalog",
            "order": 205,
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
            "help": {
                "summary": "Manage the website and content catalog containers that establish WCMS authoring scope.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "websites"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "cms-page-composition",
            "parentId": "cms",
            "label": "Page Composition",
            "route": "/content#page-composition",
            "icon": "template",
            "order": 220,
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
            "help": {
                "summary": "Manage the type, renderer, template, and slot contracts that govern how pages and components are composed.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "page-and-component-types"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "cms-content-operations",
            "parentId": "cms",
            "label": "Content Operations",
            "route": "/content#content-operations",
            "icon": "content",
            "order": 240,
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
            "help": {
                "summary": "Manage authorable pages, reusable components, route/navigation records, media references, and visibility restrictions.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "pages"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "sites",
            "parentId": "cms-sites-catalogs",
            "label": "Websites",
            "route": "/content/sites",
            "icon": "cms",
            "order": 206,
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
                "moduleName": "cms",
                "schemaName": "cmsSite"
            },
            "help": {
                "summary": "Manage CMS websites that group authoring and delivery context for a storefront, brand site, or enterprise experience.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "websites"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "type-codes",
            "parentId": "cms-page-composition",
            "label": "Page and Component Types",
            "route": "/content/type-codes",
            "icon": "cms",
            "order": 221,
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
                "moduleName": "cms",
                "schemaName": "cmsTypeCode"
            },
            "help": {
                "summary": "Review CMS page and component type codes that connect backend content models with Axis renderer contracts.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "page-and-component-types"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "component-type-groups",
            "parentId": "cms-page-composition",
            "label": "Component Type Groups",
            "route": "/content/component-type-groups",
            "icon": "cms",
            "order": 222,
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
                "moduleName": "cms",
                "schemaName": "cmsComponentTypeGroup"
            },
            "help": {
                "summary": "Group CMS component types so authors and administrators can organize reusable content building blocks.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "component-type-groups"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "renderer-mappings",
            "parentId": "cms-page-composition",
            "label": "Renderer Mappings",
            "route": "/content/renderer-mappings",
            "icon": "cms",
            "order": 223,
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
                "moduleName": "cms",
                "schemaName": "cmsTypeCode2Renderer"
            },
            "help": {
                "summary": "Map CMS type codes to approved Axis renderers and contract versions without allowing executable frontend content.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "renderer-mappings"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "page-templates",
            "parentId": "cms-page-composition",
            "label": "Page Templates",
            "route": "/content/page-templates",
            "icon": "cms",
            "order": 224,
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
                "moduleName": "cms",
                "schemaName": "cmsPageTemplate"
            },
            "help": {
                "summary": "Manage page templates that define the governed layout structure and allowed content slots for CMS pages.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "page-templates"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "slot-definitions",
            "parentId": "cms-page-composition",
            "label": "Slot Definitions",
            "route": "/content/slot-definitions",
            "icon": "cms",
            "order": 225,
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
                "moduleName": "cms",
                "schemaName": "cmsSlotDefinition"
            },
            "help": {
                "summary": "Manage reusable slot definitions that decide where CMS components can appear inside templates and pages.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "slot-definitions"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "pages",
            "parentId": "cms-content-operations",
            "label": "Pages",
            "route": "/content/pages",
            "icon": "cms",
            "order": 241,
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
                "moduleName": "cms",
                "schemaName": "cmsPage"
            },
            "help": {
                "summary": "Manage CMS pages, their templates, content slots, components, restrictions, and delivery state.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "pages"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "components",
            "parentId": "cms-content-operations",
            "label": "Components",
            "route": "/content/components",
            "icon": "cms",
            "order": 242,
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
                "moduleName": "cms",
                "schemaName": "cmsComponent"
            },
            "help": {
                "summary": "Manage reusable CMS components that render page content through approved Axis renderer mappings.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "components"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "component-media",
            "parentId": "cms-content-operations",
            "label": "Component Media",
            "route": "/content/component-media",
            "icon": "cms",
            "order": 243,
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
                "moduleName": "cms",
                "schemaName": "cmsComponentMedia"
            },
            "help": {
                "summary": "Manage references between CMS components and governed media assets owned by media.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "component-media"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "routes",
            "parentId": "cms-content-operations",
            "label": "Page Routes",
            "route": "/content/routes",
            "icon": "cms",
            "order": 244,
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
                "moduleName": "cms",
                "schemaName": "cmsPageRoute"
            },
            "help": {
                "summary": "Manage browser route mappings that resolve safe URLs to CMS pages through backend-owned routing contracts.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "page-routes"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "navigation",
            "parentId": "cms-content-operations",
            "label": "Navigation Nodes",
            "route": "/content/navigation",
            "icon": "cms",
            "order": 245,
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
                "moduleName": "cms",
                "schemaName": "cmsNavigationNode"
            },
            "help": {
                "summary": "Manage CMS navigation tree entries and their page, route, or approved external targets.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "navigation-nodes"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "restriction-types",
            "parentId": "cms-content-operations",
            "label": "Restriction Types",
            "route": "/content/restriction-types",
            "icon": "cms",
            "order": 246,
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
                "moduleName": "cms",
                "schemaName": "cmsRestrictionType"
            },
            "help": {
                "summary": "Review restriction type definitions used to govern when pages, components, or navigation entries are visible.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "restriction-types"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "restrictions",
            "parentId": "cms-content-operations",
            "label": "Restrictions",
            "route": "/content/restrictions",
            "icon": "cms",
            "order": 247,
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
                "moduleName": "cms",
                "schemaName": "cmsRestriction"
            },
            "help": {
                "summary": "Manage configured restrictions that control CMS visibility for users, channels, catalogs, or business contexts.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "restrictions"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "publishing-status",
            "parentId": "publishing",
            "label": "Staged-to-Online Status",
            "route": "/publishing/status",
            "icon": "workflow",
            "order": 300,
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
                "moduleName": "cms",
                "schemaName": "cmsOnlinePublicationPointer"
            },
            "help": {
                "summary": "Review which CMS content has an active staged-to-online publication pointer for delivery.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "staged-to-online-status"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ],
            "parentModuleName": "publish"
        },
        {
            "id": "publishing-manifests",
            "parentId": "publishing",
            "label": "Publication Manifests",
            "route": "/publishing/manifests",
            "icon": "workflow",
            "order": 305,
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
                "moduleName": "cms",
                "schemaName": "cmsPublicationManifest"
            },
            "help": {
                "summary": "Inspect generated publication manifests that describe exactly what content was prepared for delivery.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "publication-manifests"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ],
            "parentModuleName": "publish"
        },
        {
            "id": "publishing-history",
            "parentId": "publishing",
            "label": "Publishing History",
            "route": "/publishing/history",
            "icon": "workflow",
            "order": 310,
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
                "moduleName": "cms",
                "schemaName": "cmsPublicationDeploymentReceipt"
            },
            "help": {
                "summary": "Inspect publication deployment receipts and historical evidence from completed publishing operations.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "publishing-history"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ],
            "parentModuleName": "publish"
        }
    ]
};

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('cms', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); }
};
