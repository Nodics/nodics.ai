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
            "label": "Content Workspace",
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
                "summary": "Manage WCMS authoring attention, websites, pages, templates, components, navigation, visibility rules, readiness, and publishing handoff.",
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
            "id": "content-attention",
            "parentId": "cms",
            "label": "Websites and Pages Requiring Attention",
            "route": "/content#attention",
            "icon": "validation",
            "order": 201,
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
                "summary": "Planned content-attention summary for websites, pages, invalid content, review queues, publishing readiness, broken routes, and quick links.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "content-workspace"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "content-recent-drafts",
            "parentId": "cms",
            "label": "Recently Updated, Draft, and Invalid Content",
            "route": "/content#recent-drafts-invalid",
            "icon": "history",
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
                "summary": "Planned summary of recently changed, draft, and invalid content records.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "content-workspace"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "content-awaiting-review",
            "parentId": "cms",
            "label": "Content Awaiting Review or Approval",
            "route": "/content#awaiting-review",
            "icon": "workflow",
            "order": 203,
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
                "summary": "Planned review and approval queue summary sourced from authoritative workflow/publishing contracts.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "content-workspace"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "content-ready-publish",
            "parentId": "cms",
            "label": "Content Ready to Publish and Published Content with New Changes",
            "route": "/content#ready-to-publish",
            "icon": "publish",
            "order": 204,
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
                "summary": "Planned readiness summary for publishable content and live content with staged changes.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "content-workspace"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "content-broken-routes-navigation",
            "parentId": "cms",
            "label": "Broken Routes or Navigation",
            "route": "/content#broken-routes-navigation",
            "icon": "navigation",
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
                "summary": "Planned diagnostic summary for broken routes, missing targets, unsafe navigation, and inactive content links.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "content-workspace"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "content-authoring-quick-links",
            "parentId": "cms",
            "label": "Create Website, Create Page, Open Designer, Preview, and Review Readiness",
            "route": "/content#authoring-quick-links",
            "icon": "add",
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
            "help": {
                "summary": "Planned authorized authoring shortcuts for create, designer, preview, and readiness review.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "content-workspace"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "designer-select-context",
            "parentId": "content-designer",
            "label": "Select Catalog, Website, Page, and Template",
            "route": "/content/designer#select-context",
            "icon": "layout",
            "order": 2021,
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
                "summary": "Preview designer step for choosing the governed authoring context.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "page-designer"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "designer-configure-composition",
            "parentId": "content-designer",
            "label": "Configure Slots, Sections, Components, and Component Content",
            "route": "/content/designer#configure-composition",
            "icon": "layout",
            "order": 2022,
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
                "summary": "Preview designer step for composing governed slots, sections, components, and component content.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "page-designer"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "designer-associate-experience",
            "parentId": "content-designer",
            "label": "Associate Media, Route, Navigation, and Visibility Rules",
            "route": "/content/designer#associate-experience",
            "icon": "layout",
            "order": 2023,
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
                "summary": "Preview designer step for linking content composition to media, routes, navigation, and visibility.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "page-designer"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "designer-validate-preview-readiness",
            "parentId": "content-designer",
            "label": "Validate, Preview, Save Draft, and Review Publishing Readiness",
            "route": "/content/designer#validate-preview-readiness",
            "icon": "preview",
            "order": 2024,
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
                "summary": "Preview designer step for validation, preview, draft save, and publishing-readiness review.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "page-designer"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "cms-sites-catalogs",
            "label": "Websites and Content Catalogs",
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
            "label": "Templates and Layout",
            "route": "/content#templates-layout",
            "icon": "template",
            "order": 235,
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
                "summary": "Manage templates, slots, sections, and preview structures that govern how pages are composed.",
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
            "label": "Pages and Routes",
            "route": "/content#pages-routes",
            "icon": "content",
            "order": 215,
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
                "summary": "Manage pages, route assignment, conflicts, missing targets, and page readiness by website, template, locale, and channel.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "pages"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "cms-components-blocks",
            "label": "Components and Content Blocks",
            "route": "/content#components-content-blocks",
            "icon": "content",
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
            "help": {
                "summary": "Manage reusable and page-specific components, business content fields, placement, and media association.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "components"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "cms-navigation-menus",
            "label": "Navigation and Menus",
            "route": "/content#navigation-menus",
            "icon": "navigation",
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
            "help": {
                "summary": "Manage WCMS navigation workspaces, menu trees, nodes, ordering, and validation.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "navigation-nodes"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "cms-visibility-rules",
            "label": "Visibility and Experience Rules",
            "route": "/content#visibility-experience-rules",
            "icon": "visibility",
            "order": 255,
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
                "summary": "Manage restrictions, audience context rules, and diagnostics for visible pages, components, slots, routes, and navigation.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "restrictions"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "cms-content-types-rendering",
            "label": "Content Types and Rendering",
            "route": "/content#content-types-rendering",
            "icon": "renderer",
            "order": 265,
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
                "summary": "Manage page/component type codes, component type groups, renderer mappings, and compatibility diagnostics.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "page-and-component-types"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "cms-themes-branding",
            "label": "Themes and Branding",
            "route": "/content#themes-branding",
            "icon": "theme",
            "order": 275,
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
                "summary": "Planned governed workspace for brand identity, tokens, theme assignment, preview, accessibility validation, and history.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "themes-and-branding"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "cms-preview-readiness",
            "label": "Content Preview and Readiness",
            "route": "/content#preview-readiness",
            "icon": "preview",
            "order": 285,
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
                "summary": "Planned governed workspace for experience preview, content validation, and publishing readiness review.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "content-preview-and-readiness"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "cms-history-insights",
            "label": "Content History and Insights",
            "route": "/content#history-insights",
            "icon": "history",
            "order": 295,
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
                "summary": "Planned governed workspace for change timeline, activity, usage, references, validation, publishing outcomes, and analytics where supported.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "content-history-and-insights"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "cms-content-catalogs",
            "parentId": "cms-sites-catalogs",
            "label": "Content Catalogs",
            "route": "/content/catalogs",
            "icon": "catalog",
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
            "help": {
                "summary": "Planned content-catalog administration for purpose, ownership, status, website assignment, and staged/online context.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "content-catalogs"
            },
            "featureState": "HIDDEN",
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
            "id": "website-designer",
            "parentId": "cms-sites-catalogs",
            "label": "Website Designer",
            "route": "/content/website-designer",
            "icon": "layout",
            "order": 208,
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
                "summary": "Planned guided website creation flow for catalog, website, default template, initial pages, navigation, validation, preview, and publishing handoff.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "website-designer"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "type-codes",
            "parentId": "cms-content-types-rendering",
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
            "parentId": "cms-content-types-rendering",
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
            "parentId": "cms-content-types-rendering",
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
            "id": "page-sections",
            "parentId": "cms-page-composition",
            "label": "Page Sections",
            "route": "/content/page-sections",
            "icon": "template",
            "order": 226,
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
                "summary": "Planned page-section workspace for template sections and governed layout composition.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "page-sections"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "template-preview",
            "parentId": "cms-page-composition",
            "label": "Template Preview",
            "route": "/content/template-preview",
            "icon": "preview",
            "order": 227,
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
                "summary": "Planned template preview workspace for validating slot structure and authoring behavior before use.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "template-preview"
            },
            "featureState": "DISABLED",
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
            "parentId": "cms-components-blocks",
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
            "id": "component-content",
            "parentId": "cms-components-blocks",
            "label": "Component Content",
            "route": "/content/component-content",
            "icon": "content",
            "order": 2425,
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
                "summary": "Planned component-content workspace for business fields, links, references, nested content, locale variants, and validation.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "component-content"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "component-placement",
            "parentId": "cms-components-blocks",
            "label": "Component Placement",
            "route": "/content/component-placement",
            "icon": "layout",
            "order": 2427,
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
                "summary": "Planned placement workspace for assigned pages, sections, slots, reuse locations, and ordering.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "component-placement"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "component-media",
            "parentId": "cms-components-blocks",
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
            "id": "page-variants",
            "parentId": "cms-content-operations",
            "label": "Page Variants",
            "route": "/content/page-variants",
            "icon": "cms",
            "order": 2445,
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
                "summary": "Planned page-variant workspace for locale, channel, audience variants, and completeness.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "page-variants"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "navigation-workspace",
            "parentId": "cms-navigation-menus",
            "label": "Navigation Workspace",
            "route": "/content/navigation-workspace",
            "icon": "navigation",
            "order": 2447,
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
                "summary": "Planned business navigation workspace for menu health, changed trees, broken targets, and next actions.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "navigation-workspace"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "navigation-trees",
            "parentId": "cms-navigation-menus",
            "label": "Navigation Trees",
            "route": "/content/navigation-trees",
            "icon": "navigation",
            "order": 2448,
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
                "summary": "Planned navigation-tree workspace for header, footer, contextual, and hierarchical menus.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "navigation-trees"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "navigation",
            "parentId": "cms-navigation-menus",
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
            "id": "navigation-validation",
            "parentId": "cms-navigation-menus",
            "label": "Navigation Validation",
            "route": "/content/navigation-validation",
            "icon": "validation",
            "order": 2455,
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
                "summary": "Planned navigation validation for cycles, unsafe URLs, missing targets, inactive targets, and excessive depth.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "navigation-validation"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "restriction-types",
            "parentId": "cms-visibility-rules",
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
            "parentId": "cms-visibility-rules",
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
            "id": "audience-context-rules",
            "parentId": "cms-visibility-rules",
            "label": "Audience and Context Rules",
            "route": "/content/audience-context-rules",
            "icon": "visibility",
            "order": 2475,
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
                "summary": "Planned audience/context rule workspace for authentication, segment, organisation, locale, channel, and experience context.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "audience-context-rules"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "restriction-diagnostics",
            "parentId": "cms-visibility-rules",
            "label": "Restriction Diagnostics",
            "route": "/content/restriction-diagnostics",
            "icon": "diagnostics",
            "order": 2477,
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
                "summary": "Planned diagnostics for explaining why a page, component, slot, route, or navigation entry is visible or hidden.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "restriction-diagnostics"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "rendering-compatibility",
            "parentId": "cms-content-types-rendering",
            "label": "Rendering Compatibility",
            "route": "/content/rendering-compatibility",
            "icon": "renderer",
            "order": 2479,
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
                "summary": "Planned compatibility diagnostics for type-code, renderer, channel, and frontend contract alignment.",
                "documentationRoute": "/docs/capabilities/content-publishing/wcms-authoring-model",
                "documentationFragment": "rendering-compatibility"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "cms.backoffice.view"
            ]
        },
        {
            "id": "publishing-status",
            "label": "Staged-to-Online Operations",
            "route": "/publishing/status",
            "icon": "workflow",
            "order": 300,
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
        },
        {
            "id": "publishing-manifests",
            "label": "Publication Manifests",
            "route": "/publishing/manifests",
            "icon": "workflow",
            "order": 305,
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
        },
        {
            "id": "publishing-history",
            "label": "Publishing History",
            "route": "/publishing/history",
            "icon": "workflow",
            "order": 310,
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
