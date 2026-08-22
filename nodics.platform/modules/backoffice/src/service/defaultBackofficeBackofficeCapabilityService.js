/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/service/DefaultBackofficeBackofficeCapabilityService @description Publishes the concrete backoffice-owned BackOffice capability projection. @layer service @owner backoffice */
const capability = {
    "enabled": true,
    "capabilityId": "backoffice-registry",
    "displayName": "BackOffice Registry",
    "category": "platform",
    "icon": "registry",
    "contractVersion": 1,
    "minimumClientContractVersion": 1,
    "roles": [
        "CONTROL_PLANE_PROVIDER"
    ],
    "discovery": {
        "openApiPath": "/nodics/system/v0/contract/openapi/internal",
        "contractVersion": 1
    },
    "requiredPermissions": [
        "backoffice.registry.view"
    ],
    "documentation": [
        {
            "id": "framework",
            "label": "Framework",
            "type": "CMS",
            "route": "/docs/framework",
            "order": 100,
            "connectionModule": "cms",
            "site": "nodicsDocumentationSite",
            "catalog": "documentationContentCatalog",
            "defaultPage": "/docs/framework",
            "packCode": "nodicsDocumentation",
            "initializationProfile": "frameworkdocs",
            "dashboard": {
                "kind": "Framework guide",
                "icon": "content",
                "summary": "Foundational Nodics architecture, module layering, configuration-first extension, lifecycle, and customization guidance.",
                "audiences": [
                    "architect",
                    "developer",
                    "operator",
                    "ai-tool"
                ],
                "coverage": {
                    "score": 92,
                    "status": "STRONG",
                    "signals": [
                        "Architecture model",
                        "Module lifecycle",
                        "Customization guidance",
                        "Docs module ownership",
                        "AI-tool standards"
                    ],
                    "gaps": [
                        "More domain module recipes",
                        "More customer-extension examples"
                    ]
                }
            }
        },
        {
            "id": "swaggers",
            "label": "Swaggers",
            "type": "OPENAPI",
            "route": "/docs/swaggers",
            "order": 200,
            "connectionModule": "system",
            "openApiPath": "/nodics/system/v0/contract/openapi",
            "swaggerPath": "/nodics/system/v0/contract/swagger",
            "dashboard": {
                "kind": "API contracts",
                "icon": "reference",
                "summary": "Generated OpenAPI and Swagger contracts for authorized backend modules and runtime APIs.",
                "audiences": [
                    "developer",
                    "operator",
                    "integration"
                ],
                "coverage": {
                    "score": 100,
                    "status": "REFERENCE",
                    "signals": [
                        "Generated from backend contracts",
                        "Module API discovery",
                        "Swagger UI access"
                    ],
                    "gaps": [
                        "Narrative examples belong in framework capability docs"
                    ]
                }
            }
        }
    ],
    "navigation": [
        {
            "id": "my-work",
            "parentId": "workflow-management",
            "parentModuleName": "flowCore",
            "label": "My Tasks and Approvals",
            "route": "/workspace/my-work",
            "icon": "workflow",
            "order": 100,
            "group": {
                "id": "workspace",
                "label": "Workspace",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "assigned-to-me",
            "parentId": "my-work",
            "label": "Assigned to Me",
            "route": "/workspace/my-work/assigned",
            "icon": "workflow",
            "order": 110,
            "group": {
                "id": "workspace",
                "label": "Workspace",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "approvals",
            "parentId": "my-work",
            "label": "Approvals",
            "route": "/workspace/my-work/approvals",
            "icon": "workflow",
            "order": 120,
            "group": {
                "id": "workspace",
                "label": "Workspace",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "returned-work",
            "parentId": "my-work",
            "label": "Returned Work",
            "route": "/workspace/my-work/returned",
            "icon": "workflow",
            "order": 130,
            "group": {
                "id": "workspace",
                "label": "Workspace",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "started-workflows",
            "parentId": "my-work",
            "label": "Workflows I Started",
            "route": "/workspace/my-work/started",
            "icon": "workflow",
            "order": 140,
            "group": {
                "id": "workspace",
                "label": "Workspace",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "completed-work",
            "parentId": "my-work",
            "label": "Completed Work",
            "route": "/workspace/my-work/completed",
            "icon": "workflow",
            "order": 150,
            "group": {
                "id": "workspace",
                "label": "Workspace",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "documentation",
            "label": "Nodics Documentation",
            "route": "/docs",
            "icon": "content",
            "order": 100,
            "group": {
                "id": "documentation",
                "label": "Documentation",
                "order": 1600
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "HIDDEN"
        },
        {
            "id": "documentation-framework",
            "label": "Framework",
            "route": "/docs/framework",
            "icon": "content",
            "order": 110,
            "group": {
                "id": "documentation",
                "label": "Documentation",
                "order": 1600
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE"
        },
        {
            "id": "documentation-swaggers",
            "label": "Swaggers",
            "route": "/docs/swaggers",
            "icon": "reference",
            "order": 120,
            "group": {
                "id": "documentation",
                "label": "Documentation",
                "order": 1600
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE"
        },
        {
            "id": "documentation-nodics-kickoff",
            "label": "Nodics Kickoff",
            "route": "/docs/nodics-kickoff",
            "icon": "content",
            "order": 140,
            "group": {
                "id": "documentation",
                "label": "Documentation",
                "order": 1600
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE"
        },
        {
            "id": "runtime-operations",
            "label": "Runtime Operations",
            "route": "/system-integrations#runtime-operations",
            "icon": "operations",
            "order": 91,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "modules-capabilities",
            "label": "Modules and Capabilities",
            "route": "/registry",
            "icon": "registry",
            "order": 100,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "backoffice.registry.view"
            ]
        },
        {
            "id": "configuration-environments",
            "label": "Configuration and Environments",
            "route": "/administration/configuration",
            "icon": "settings",
            "order": 115,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "integrations-connections",
            "label": "Integrations and Connections",
            "route": "/operations/integrations",
            "icon": "module",
            "order": 125,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "apis-webhooks-events",
            "label": "APIs, Webhooks, and Events",
            "route": "/operations/events",
            "icon": "module",
            "order": 135,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "data-exchange",
            "label": "Data Exchange",
            "route": "/operations/imports-exports",
            "icon": "import",
            "order": 145,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
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
                "import.release.view"
            ]
        },
        {
            "id": "schema-data-administration",
            "label": "Schema and Data Administration",
            "route": "/schema-workbench",
            "icon": "schema",
            "order": 155,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
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
                "system.schema.workbench.view"
            ]
        },
        {
            "id": "operational-monitoring-recovery",
            "label": "Operational Monitoring and Recovery",
            "route": "/operations/operational-failures",
            "icon": "health",
            "order": 165,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "platform-policies-reference",
            "label": "Platform Policies and Reference Settings",
            "route": "/administration/policies-reference",
            "icon": "settings",
            "order": 175,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "schema-workbench",
            "parentId": "schema-data-administration",
            "label": "Schema Workbench",
            "route": "/schema-workbench",
            "icon": "schema",
            "order": 170,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
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
                "summary": "Discover authorized backend schemas, query records, and use allowed operations without making Axis a schema or API authority.",
                "documentationRoute": "/docs/solutions/backoffice/schema-workbench",
                "documentationFragment": "what-this-screen-does"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "system.schema.workbench.view"
            ]
        },
        {
            "id": "system-integrations",
            "label": "System Workspace",
            "route": "/system-integrations",
            "icon": "operations",
            "order": 90,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
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
                "summary": "Review overall runtime status, modules requiring attention, failed integration/data-exchange operations, warnings, and authorized operational quick links.",
                "documentationRoute": "/docs/reference/backoffice",
                "documentationFragment": "system-integrations"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "backoffice.registry.view"
            ]
        },
        {
            "id": "registry",
            "parentId": "modules-capabilities",
            "label": "Module Registry",
            "route": "/registry",
            "icon": "registry",
            "order": 100,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "help": {
                "summary": "Review registered BackOffice capabilities and module catalogue data contributed by owning modules.",
                "documentationRoute": "/docs/reference/backoffice",
                "documentationFragment": "capability-discovery"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "backoffice.registry.view"
            ]
        },
        {
            "id": "overall-runtime-status",
            "parentId": "system-integrations",
            "label": "Overall Runtime Status",
            "route": "/system-integrations",
            "icon": "operations",
            "order": 901,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
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
                "backoffice.registry.view"
            ]
        },
        {
            "id": "modules-requiring-attention",
            "parentId": "system-integrations",
            "label": "Nodes and Modules Requiring Attention",
            "route": "/system-integrations#attention",
            "icon": "health",
            "order": 902,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "failed-integration-data-exchange",
            "parentId": "system-integrations",
            "label": "Failed Integration and Data-exchange Operations",
            "route": "/system-integrations#failed-operations",
            "icon": "validation",
            "order": 903,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "security-configuration-warnings",
            "parentId": "system-integrations",
            "label": "Security and Configuration Warnings",
            "route": "/system-integrations#warnings",
            "icon": "security",
            "order": 904,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "authorized-operational-quick-links",
            "parentId": "system-integrations",
            "label": "Authorized Operational Quick Links",
            "route": "/system-integrations#quick-links",
            "icon": "link",
            "order": 905,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "module-health",
            "parentId": "modules-capabilities",
            "label": "Module Health",
            "route": "/operations/module-health",
            "icon": "health",
            "order": 110,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "help": {
                "summary": "Inspect module registrations, availability, readiness, and refresh behavior from the BackOffice registry without replacing module-owned health authority.",
                "documentationRoute": "/docs/reference/backoffice",
                "documentationFragment": "module-health-operations"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "backoffice.registry.admin.view"
            ]
        },
        {
            "id": "imports-exports",
            "parentId": "data-exchange",
            "label": "Import and Export Workspace",
            "route": "/operations/imports-exports",
            "icon": "import",
            "order": 120,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
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
                "summary": "Review governed import and export flows, source files, run history, validation, and outbound data contracts owned by nImport and nExport.",
                "documentationRoute": "/docs/capabilities/data-exchange",
                "documentationFragment": "import-and-export"
            },
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "import.release.view"
            ]
        },
        {
            "id": "integrations",
            "parentId": "integrations-connections",
            "label": "Integration Workspace",
            "route": "/operations/integrations",
            "icon": "module",
            "order": 130,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "events",
            "parentId": "apis-webhooks-events",
            "label": "Events",
            "route": "/operations/events",
            "icon": "module",
            "order": 140,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "audit-trail",
            "parentId": "operational-monitoring-recovery",
            "label": "Operational Audit",
            "route": "/operations/audit-trail",
            "icon": "module",
            "order": 150,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "operational-failures",
            "parentId": "operational-monitoring-recovery",
            "label": "Operational Failures",
            "route": "/operations/operational-failures",
            "icon": "module",
            "order": 160,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "axis-configuration",
            "parentId": "configuration-environments",
            "label": "Axis Configuration",
            "route": "/administration/axis-configuration",
            "icon": "settings",
            "order": 180,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "module-configuration",
            "parentId": "configuration-environments",
            "label": "Module Configuration",
            "route": "/administration/module-configuration",
            "icon": "settings",
            "order": 190,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "localization",
            "parentId": "platform-policies-reference",
            "label": "Localization",
            "route": "/administration/localization",
            "icon": "settings",
            "order": 200,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "units",
            "parentId": "platform-policies-reference",
            "label": "Units",
            "route": "/administration/units",
            "icon": "settings",
            "order": 210,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "security-policies",
            "parentId": "platform-policies-reference",
            "label": "Security Policies",
            "route": "/administration/security-policies",
            "icon": "settings",
            "order": 220,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "themes-branding",
            "parentId": "cms-themes-branding",
            "parentModuleName": "cms",
            "label": "Themes and Branding",
            "route": "/administration/themes-branding",
            "icon": "settings",
            "order": 230,
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
                "tenant"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "system-information",
            "parentId": "runtime-operations",
            "label": "System Information",
            "route": "/administration/system-information",
            "icon": "settings",
            "order": 240,
            "group": {
                "id": "system-integrations",
                "label": "System & Integrations",
                "order": 100
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "DISABLED"
        }
    ]
};

function normalizeNavigationHierarchy(contract) {
    contract.navigation.forEach(item => {
        if (!item.group) return;
        if (item.group.id === 'workspace') {
            item.group = {
                id: 'process-and-automations',
                label: 'Process and Automations',
                order: 1500
            };
        } else if (item.group.id === 'system-integrations') {
            item.group.label = 'System and Integrations';
            item.group.order = 100;
        } else if (item.group.id === 'documentation') {
            item.group.label = 'Documentation';
            item.group.order = 1600;
        }
    });
    return contract;
}

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('backoffice', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return normalizeNavigationHierarchy(JSON.parse(JSON.stringify(capability))); }
};
