/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics Axis documentation hierarchy nodes. */
module.exports = {
  "record0": {
    "code": "axisDocsNodeRoot",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "nodeLevel": "SECTION",
    "nodeType": "CONTAINER",
    "nodeTitle": "Nodics Axis Documentation",
    "nodeSummary": "Root Axis documentation node for application overview, management, rendering, setup, operations, and extension topics.",
    "nodeContentArea": {
      "dashboard": "axisDocsDashboardProduct",
      "purpose": "Give Axis and Nexus a backend-owned root for expandable Axis documentation navigation."
    },
    "nodeDashboard": "axisDocsDashboardProduct",
    "childSummaryCards": [
      {
        "code": "discover-axis",
        "title": "Discover Axis",
        "summary": "Business and architecture introduction to Nodics Axis, its purpose, boundaries, documentation ownership, and repository responsibilities.",
        "order": 10
      },
      {
        "code": "build-and-operate-axis",
        "title": "Build and Operate Axis",
        "summary": "Technology, shell, renderer, documentation, CMS delivery, and operational rules for building and running Axis safely.",
        "order": 20
      },
      {
        "code": "axis-capabilities",
        "title": "Axis Capabilities",
        "summary": "Axis user-facing workspaces, dashboards, actions, recovery behavior, and backend-owned capability contracts.",
        "order": 30
      },
      {
        "code": "contribute-to-axis",
        "title": "Contribute to Axis",
        "summary": "Contribution, implementation, quality, documentation, and governance rules for adding or changing Axis behavior.",
        "order": 40
      }
    ],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 4,
      "pages": 18
    },
    "nodeOrder": 10,
    "expandable": true,
    "expandedByDefault": true,
    "nodeIcon": "book-open",
    "nodeAudience": [
      "business-user",
      "administrator",
      "developer",
      "operator",
      "ai-tool"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "axis",
      "documentation",
      "backoffice"
    ],
    "relatedNodes": [],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record1": {
    "code": "axisDocsNodeSecdiscoverAxis",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeRoot",
    "nodeLevel": "SECTION",
    "nodeType": "CONTAINER",
    "nodeTitle": "Discover Axis",
    "nodeSummary": "Business and architecture introduction to Nodics Axis, its purpose, boundaries, documentation ownership, and repository responsibilities.",
    "nodeContentArea": {
      "dashboard": "axisDocsDashboardSecdiscoverAxis",
      "navigationDepth": 2,
      "pages": [
        "axis.overview",
        "axis.architecture"
      ]
    },
    "nodeDashboard": "axisDocsDashboardSecdiscoverAxis",
    "childSummaryCards": [
      {
        "code": "axis.overview",
        "title": "What Is Nodics Axis?",
        "summary": "Understand Axis, its backend boundary, supported runtime, setup, configuration, quality commands, and implemented scope.",
        "order": 10
      },
      {
        "code": "axis.architecture",
        "title": "Architecture and Repository Boundaries",
        "summary": "Learn the per-project deployment model, authority boundaries, role journeys, security model, documentation ownership, customization rules, and verification expectations.",
        "order": 20
      }
    ],
    "childJourneyLinks": [
      {
        "label": "What Is Nodics Axis?",
        "targetPage": "axis.overview",
        "route": "/docs/nodics-axis"
      },
      {
        "label": "Architecture and Repository Boundaries",
        "targetPage": "axis.architecture",
        "route": "/docs/nodics-axis/architecture"
      }
    ],
    "childStatusSummary": {
      "childCount": 2,
      "pages": 2
    },
    "nodeOrder": 10,
    "expandable": true,
    "expandedByDefault": false,
    "nodeIcon": "folder",
    "nodeAudience": [
      "business-user",
      "administrator",
      "architect",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "discover-axis",
      "Discover Axis"
    ],
    "relatedNodes": [],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record2": {
    "code": "axisDocsNodeSecbuildAndOperateAxis",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeRoot",
    "nodeLevel": "SECTION",
    "nodeType": "CONTAINER",
    "nodeTitle": "Build and Operate Axis",
    "nodeSummary": "Technology, shell, renderer, documentation, CMS delivery, and operational rules for building and running Axis safely.",
    "nodeContentArea": {
      "dashboard": "axisDocsDashboardSecbuildAndOperateAxis",
      "navigationDepth": 2,
      "pages": [
        "axis.technology-stack",
        "axis.design-system",
        "axis.cms-renderers",
        "axis.documentation-content"
      ]
    },
    "nodeDashboard": "axisDocsDashboardSecbuildAndOperateAxis",
    "childSummaryCards": [
      {
        "code": "axis.technology-stack",
        "title": "Frontend Technology Stack",
        "summary": "Review exact package versions, state ownership, styling, repository shape, renderer organization, dependency governance, and verification.",
        "order": 10
      },
      {
        "code": "axis.design-system",
        "title": "Design System and Application Shell",
        "summary": "Understand authentication layouts, design foundations, shell structure, responsive states, accessibility, recovery, and extension rules.",
        "order": 20
      },
      {
        "code": "axis.cms-renderers",
        "title": "CMS Delivery and Renderer Integration",
        "summary": "Follow the CMS delivery, validation, cache-safety, logical renderer, and frontend implementation boundaries.",
        "order": 30
      },
      {
        "code": "axis.documentation-content",
        "title": "Documentation Content in Axis",
        "summary": "Understand dynamic documentation products, content-pack installation, renderer ownership, failure recovery, and contributor verification.",
        "order": 40
      }
    ],
    "childJourneyLinks": [
      {
        "label": "Frontend Technology Stack",
        "targetPage": "axis.technology-stack",
        "route": "/docs/nodics-axis/technology-stack"
      },
      {
        "label": "Design System and Application Shell",
        "targetPage": "axis.design-system",
        "route": "/docs/nodics-axis/design-system"
      },
      {
        "label": "CMS Delivery and Renderer Integration",
        "targetPage": "axis.cms-renderers",
        "route": "/docs/nodics-axis/cms-renderers"
      },
      {
        "label": "Documentation Content in Axis",
        "targetPage": "axis.documentation-content",
        "route": "/docs/nodics-axis/documentation-content"
      }
    ],
    "childStatusSummary": {
      "childCount": 4,
      "pages": 4
    },
    "nodeOrder": 20,
    "expandable": true,
    "expandedByDefault": false,
    "nodeIcon": "folder",
    "nodeAudience": [
      "business-user",
      "administrator",
      "architect",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "build-and-operate-axis",
      "Build and Operate Axis"
    ],
    "relatedNodes": [],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record3": {
    "code": "axisDocsNodeSecaxisCapabilities",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeRoot",
    "nodeLevel": "SECTION",
    "nodeType": "CONTAINER",
    "nodeTitle": "Axis Capabilities",
    "nodeSummary": "Axis user-facing workspaces, dashboards, actions, recovery behavior, and backend-owned capability contracts.",
    "nodeContentArea": {
      "dashboard": "axisDocsDashboardSecaxisCapabilities",
      "navigationDepth": 2,
      "pages": [
        "axis.employee-access",
        "axis.assistant",
        "axis.schema-workbench",
        "axis.page-designer",
        "axis.experience-studio",
        "axis.module-health",
        "axis.imports-exports",
        "axis.media-management",
        "axis.customer-engagement",
        "axis.openapi-reference"
      ]
    },
    "nodeDashboard": "axisDocsDashboardSecaxisCapabilities",
    "childSummaryCards": [
      {
        "code": "axis.employee-access",
        "title": "Employee Login, Recovery, Lock, and Dashboard",
        "summary": "Operate the employee-only authentication journey, recovery, persistent browser session, idle lock, logout, configuration, and safe failures.",
        "order": 10
      },
      {
        "code": "axis.assistant",
        "title": "Axis Assistant Frontend",
        "summary": "Learn the governed Assistant request flow, typed API contracts, resumable streaming, presentation lifecycle, evidence, accessibility, and security behavior.",
        "order": 20
      },
      {
        "code": "axis.schema-workbench",
        "title": "Axis Schema Workbench",
        "summary": "Use and extend governed schema discovery, record operations, relationship coordination, failure recovery, responsive behavior, and verification.",
        "order": 30
      },
      {
        "code": "axis.page-designer",
        "title": "Axis Page Designer",
        "summary": "Use the governed catalog-first Designer flow for sites, templates, dynamic slots, sections, components, media, routes, navigation, and publish readiness.",
        "order": 40
      },
      {
        "code": "axis.experience-studio",
        "title": "Axis Experience Studio and Targeted CMS Experiences",
        "summary": "Configure targeted CMS components for collection, category, brand, and fallback journeys through backend-owned WCMS Experience contracts.",
        "order": 50
      },
      {
        "code": "axis.module-health",
        "title": "Module Health",
        "summary": "Monitor backend-governed module registration and runtime health evidence without creating a browser-side health authority.",
        "order": 60
      },
      {
        "code": "axis.imports-exports",
        "title": "Imports and Exports Workspace",
        "summary": "Review immutable data releases, validation, installation, history, security, responsive behavior, and the fail-closed export boundary.",
        "order": 70
      },
      {
        "code": "axis.media-management",
        "title": "Media Management Workspace",
        "summary": "Understand the governed Media Management navigation, route shell, backend ownership, storage and delivery boundaries, and upcoming capability slices.",
        "order": 80
      },
      {
        "code": "axis.customer-engagement",
        "title": "Customer Engagement Workspaces",
        "summary": "Use the lightweight six-domain Engagement journey for contact, testimonials, reviews, feedback, work management, governance, and recovery.",
        "order": 90
      },
      {
        "code": "axis.openapi-reference",
        "title": "Swagger and OpenAPI Reference",
        "summary": "Explain how Axis presents backend-owned Swagger and OpenAPI contracts grouped by registered runtime, functional module, and authorized API category.",
        "order": 100
      }
    ],
    "childJourneyLinks": [
      {
        "label": "Employee Login, Recovery, Lock, and Dashboard",
        "targetPage": "axis.employee-access",
        "route": "/docs/nodics-axis/employee-access"
      },
      {
        "label": "Axis Assistant Frontend",
        "targetPage": "axis.assistant",
        "route": "/docs/nodics-axis/assistant"
      },
      {
        "label": "Axis Schema Workbench",
        "targetPage": "axis.schema-workbench",
        "route": "/docs/nodics-axis/schema-workbench"
      },
      {
        "label": "Axis Page Designer",
        "targetPage": "axis.page-designer",
        "route": "/docs/nodics-axis/page-designer"
      },
      {
        "label": "Axis Experience Studio and Targeted CMS Experiences",
        "targetPage": "axis.experience-studio",
        "route": "/docs/nodics-axis/experience-studio"
      },
      {
        "label": "Module Health",
        "targetPage": "axis.module-health",
        "route": "/docs/nodics-axis/module-health"
      }
    ],
    "childStatusSummary": {
      "childCount": 10,
      "pages": 10
    },
    "nodeOrder": 30,
    "expandable": true,
    "expandedByDefault": false,
    "nodeIcon": "folder",
    "nodeAudience": [
      "business-user",
      "administrator",
      "architect",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "axis-capabilities",
      "Axis Capabilities"
    ],
    "relatedNodes": [],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record4": {
    "code": "axisDocsNodeSeccontributeToAxis",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeRoot",
    "nodeLevel": "SECTION",
    "nodeType": "CONTAINER",
    "nodeTitle": "Contribute to Axis",
    "nodeSummary": "Contribution, implementation, quality, documentation, and governance rules for adding or changing Axis behavior.",
    "nodeContentArea": {
      "dashboard": "axisDocsDashboardSeccontributeToAxis",
      "navigationDepth": 2,
      "pages": [
        "axis.feature-delivery",
        "axis.implementation-contract"
      ]
    },
    "nodeDashboard": "axisDocsDashboardSeccontributeToAxis",
    "childSummaryCards": [
      {
        "code": "axis.feature-delivery",
        "title": "Axis Feature Delivery Checklist",
        "summary": "Apply repository-boundary, reuse, security, interaction, contract-testing, documentation, partial-discovery, and completion gates.",
        "order": 10
      },
      {
        "code": "axis.implementation-contract",
        "title": "Axis Implementation and Documentation Contract",
        "summary": "Follow local discovery, repository ownership, placement, documentation, required scenarios, customization, and acceptance contracts.",
        "order": 20
      }
    ],
    "childJourneyLinks": [
      {
        "label": "Axis Feature Delivery Checklist",
        "targetPage": "axis.feature-delivery",
        "route": "/docs/nodics-axis/feature-delivery"
      },
      {
        "label": "Axis Implementation and Documentation Contract",
        "targetPage": "axis.implementation-contract",
        "route": "/docs/nodics-axis/implementation-contract"
      }
    ],
    "childStatusSummary": {
      "childCount": 2,
      "pages": 2
    },
    "nodeOrder": 40,
    "expandable": true,
    "expandedByDefault": false,
    "nodeIcon": "folder",
    "nodeAudience": [
      "business-user",
      "administrator",
      "architect",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "contribute-to-axis",
      "Contribute to Axis"
    ],
    "relatedNodes": [],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record5": {
    "code": "axisDocsNodePageaxisOverview",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecdiscoverAxis",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "What Is Nodics Axis?",
    "nodeSummary": "Understand Axis, its backend boundary, supported runtime, setup, configuration, quality commands, and implemented scope.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis",
      "documentType": "overview",
      "businessAudience": [
        "business-user",
        "administrator"
      ],
      "technicalAudience": [
        "developer",
        "operator"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadataoverview",
    "targetPage": "axisDocsPageoverview",
    "targetRoute": "axisDocsRouteoverview",
    "nodeOrder": 10010,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "business-user",
      "administrator",
      "developer",
      "operator"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "discover-axis",
      "axis-overview-and-architecture",
      "what-is-nodics-axis",
      "business-user",
      "administrator",
      "developer",
      "operator"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisArchitecture",
      "axisDocsNodePageaxisDocumentationContent",
      "axisDocsNodePageaxisEmployeeAccess"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record6": {
    "code": "axisDocsNodePageaxisArchitecture",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecdiscoverAxis",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Architecture and Repository Boundaries",
    "nodeSummary": "Learn the per-project deployment model, authority boundaries, role journeys, security model, documentation ownership, customization rules, and verification expectations.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/architecture",
      "documentType": "contract",
      "businessAudience": [],
      "technicalAudience": [
        "architect",
        "developer",
        "security-reviewer",
        "ai-tool"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadataarchitecture",
    "targetPage": "axisDocsPagearchitecture",
    "targetRoute": "axisDocsRoutearchitecture",
    "nodeOrder": 10020,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "architect",
      "developer",
      "security-reviewer",
      "ai-tool"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "discover-axis",
      "axis-overview-and-architecture",
      "architecture-and-repository-boundaries",
      "architect",
      "developer",
      "security-reviewer",
      "ai-tool"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisOverview",
      "axisDocsNodePageaxisImplementationContract",
      "axisDocsNodePageaxisCmsRenderers"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record7": {
    "code": "axisDocsNodePageaxisTechnologyStack",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecbuildAndOperateAxis",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Frontend Technology Stack",
    "nodeSummary": "Review exact package versions, state ownership, styling, repository shape, renderer organization, dependency governance, and verification.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/technology-stack",
      "documentType": "how-to",
      "businessAudience": [],
      "technicalAudience": [
        "developer",
        "operator",
        "architect",
        "ai-tool"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadatatechnologystack",
    "targetPage": "axisDocsPagetechnologystack",
    "targetRoute": "axisDocsRoutetechnologystack",
    "nodeOrder": 10010,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "developer",
      "operator",
      "architect",
      "ai-tool"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "build-and-operate-axis",
      "axis-build-and-runtime",
      "frontend-technology-stack",
      "developer",
      "operator",
      "architect",
      "ai-tool"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisDesignSystem",
      "axisDocsNodePageaxisFeatureDelivery"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record8": {
    "code": "axisDocsNodePageaxisDesignSystem",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecbuildAndOperateAxis",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Design System and Application Shell",
    "nodeSummary": "Understand authentication layouts, design foundations, shell structure, responsive states, accessibility, recovery, and extension rules.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/design-system",
      "documentType": "how-to",
      "businessAudience": [
        "designer",
        "business-user"
      ],
      "technicalAudience": [
        "developer",
        "ai-tool"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadatadesignsystem",
    "targetPage": "axisDocsPagedesignsystem",
    "targetRoute": "axisDocsRoutedesignsystem",
    "nodeOrder": 10020,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "designer",
      "developer",
      "business-user",
      "ai-tool"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "build-and-operate-axis",
      "axis-build-and-runtime",
      "design-system-and-application-shell",
      "designer",
      "developer",
      "business-user",
      "ai-tool"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisTechnologyStack",
      "axisDocsNodePageaxisEmployeeAccess"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record9": {
    "code": "axisDocsNodePageaxisCmsRenderers",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecbuildAndOperateAxis",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "CMS Delivery and Renderer Integration",
    "nodeSummary": "Follow the CMS delivery, validation, cache-safety, logical renderer, and frontend implementation boundaries.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/cms-renderers",
      "documentType": "how-to",
      "businessAudience": [],
      "technicalAudience": [
        "developer",
        "architect",
        "security-reviewer",
        "ai-tool"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadatacmsrenderers",
    "targetPage": "axisDocsPagecmsrenderers",
    "targetRoute": "axisDocsRoutecmsrenderers",
    "nodeOrder": 10030,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "developer",
      "architect",
      "security-reviewer",
      "ai-tool"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "build-and-operate-axis",
      "axis-build-and-runtime",
      "cms-delivery-and-renderer-integration",
      "developer",
      "architect",
      "security-reviewer",
      "ai-tool"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisDocumentationContent",
      "axisDocsNodePageaxisPageDesigner"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record10": {
    "code": "axisDocsNodePageaxisDocumentationContent",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecbuildAndOperateAxis",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Documentation Content in Axis",
    "nodeSummary": "Understand dynamic documentation products, content-pack installation, renderer ownership, failure recovery, and contributor verification.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/documentation-content",
      "documentType": "how-to",
      "businessAudience": [
        "administrator"
      ],
      "technicalAudience": [
        "developer",
        "operator",
        "ai-tool"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadatadocumentationcontent",
    "targetPage": "axisDocsPagedocumentationcontent",
    "targetRoute": "axisDocsRoutedocumentationcontent",
    "nodeOrder": 10040,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "administrator",
      "developer",
      "operator",
      "ai-tool"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "build-and-operate-axis",
      "axis-build-and-runtime",
      "documentation-content-in-axis",
      "administrator",
      "developer",
      "operator",
      "ai-tool"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisCmsRenderers",
      "axisDocsNodePageaxisImportsExports"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record11": {
    "code": "axisDocsNodePageaxisEmployeeAccess",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecaxisCapabilities",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Employee Login, Recovery, Lock, and Dashboard",
    "nodeSummary": "Operate the employee-only authentication journey, recovery, persistent browser session, idle lock, logout, configuration, and safe failures.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/employee-access",
      "documentType": "how-to",
      "businessAudience": [
        "business-user",
        "administrator"
      ],
      "technicalAudience": [
        "developer",
        "security-reviewer"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadataemployeeaccess",
    "targetPage": "axisDocsPageemployeeaccess",
    "targetRoute": "axisDocsRouteemployeeaccess",
    "nodeOrder": 10010,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "business-user",
      "administrator",
      "developer",
      "security-reviewer"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "axis-capabilities",
      "axis-workspaces-and-operations",
      "employee-login-recovery-lock-and-dashboard",
      "business-user",
      "administrator",
      "developer",
      "security-reviewer"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisOverview",
      "axisDocsNodePageaxisModuleHealth"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record12": {
    "code": "axisDocsNodePageaxisAssistant",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecaxisCapabilities",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Axis Assistant Frontend",
    "nodeSummary": "Learn the governed Assistant request flow, typed API contracts, resumable streaming, presentation lifecycle, evidence, accessibility, and security behavior.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/assistant",
      "documentType": "how-to",
      "businessAudience": [
        "business-user"
      ],
      "technicalAudience": [
        "developer",
        "architect",
        "security-reviewer"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadataassistant",
    "targetPage": "axisDocsPageassistant",
    "targetRoute": "axisDocsRouteassistant",
    "nodeOrder": 10020,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "business-user",
      "developer",
      "architect",
      "security-reviewer"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "axis-capabilities",
      "axis-workspaces-and-operations",
      "axis-assistant-frontend",
      "business-user",
      "developer",
      "architect",
      "security-reviewer"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisImplementationContract",
      "axisDocsNodePageaxisEmployeeAccess"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record13": {
    "code": "axisDocsNodePageaxisSchemaWorkbench",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecaxisCapabilities",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Axis Schema Workbench",
    "nodeSummary": "Use and extend governed schema discovery, record operations, relationship coordination, failure recovery, responsive behavior, and verification.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/schema-workbench",
      "documentType": "how-to",
      "businessAudience": [
        "business-user",
        "administrator"
      ],
      "technicalAudience": [
        "developer",
        "operator"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadataschemaworkbench",
    "targetPage": "axisDocsPageschemaworkbench",
    "targetRoute": "axisDocsRouteschemaworkbench",
    "nodeOrder": 10030,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "business-user",
      "administrator",
      "developer",
      "operator"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "axis-capabilities",
      "axis-workspaces-and-operations",
      "axis-schema-workbench",
      "business-user",
      "administrator",
      "developer",
      "operator"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisPageDesigner",
      "axisDocsNodePageaxisImplementationContract"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record14": {
    "code": "axisDocsNodePageaxisPageDesigner",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecaxisCapabilities",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Axis Page Designer",
    "nodeSummary": "Use the governed catalog-first Designer flow for sites, templates, dynamic slots, sections, components, media, routes, navigation, and publish readiness.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/page-designer",
      "documentType": "how-to",
      "businessAudience": [
        "business-user",
        "designer"
      ],
      "technicalAudience": [
        "developer",
        "operator"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadatapagedesigner",
    "targetPage": "axisDocsPagepagedesigner",
    "targetRoute": "axisDocsRoutepagedesigner",
    "nodeOrder": 10040,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "business-user",
      "designer",
      "developer",
      "operator"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "axis-capabilities",
      "axis-workspaces-and-operations",
      "axis-page-designer",
      "business-user",
      "designer",
      "developer",
      "operator"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisCmsRenderers",
      "axisDocsNodePageaxisMediaManagement"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record15": {
    "code": "axisDocsNodePageaxisExperienceStudio",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecaxisCapabilities",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Axis Experience Studio and Targeted CMS Experiences",
    "nodeSummary": "Configure targeted CMS components for collection, category, brand, and fallback journeys through backend-owned WCMS Experience contracts.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/experience-studio",
      "documentType": "how-to",
      "businessAudience": [
        "business-user",
        "merchandiser",
        "administrator"
      ],
      "technicalAudience": [
        "developer",
        "operator"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadataexperiencestudio",
    "targetPage": "axisDocsPageexperiencestudio",
    "targetRoute": "axisDocsRouteexperiencestudio",
    "nodeOrder": 10050,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "business-user",
      "merchandiser",
      "administrator",
      "developer",
      "operator"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "axis-capabilities",
      "axis-workspaces-and-operations",
      "axis-experience-studio",
      "targeted-cms-experiences",
      "collection-journey",
      "brand-journey",
      "default-fallback",
      "business-user",
      "merchandiser",
      "administrator",
      "developer",
      "operator"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisPageDesigner",
      "axisDocsNodePageaxisCmsRenderers",
      "axisDocsNodePageaxisDocumentationContent"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record16": {
    "code": "axisDocsNodePageaxisModuleHealth",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecaxisCapabilities",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Module Health",
    "nodeSummary": "Monitor backend-governed module registration and runtime health evidence without creating a browser-side health authority.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/module-health",
      "documentType": "how-to",
      "businessAudience": [
        "administrator"
      ],
      "technicalAudience": [
        "operator",
        "developer",
        "security-reviewer"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadatamodulehealth",
    "targetPage": "axisDocsPagemodulehealth",
    "targetRoute": "axisDocsRoutemodulehealth",
    "nodeOrder": 10060,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "administrator",
      "operator",
      "developer",
      "security-reviewer"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "axis-capabilities",
      "axis-workspaces-and-operations",
      "module-health",
      "administrator",
      "operator",
      "developer",
      "security-reviewer"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisImportsExports",
      "axisDocsNodePageaxisOverview"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record17": {
    "code": "axisDocsNodePageaxisImportsExports",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecaxisCapabilities",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Imports and Exports Workspace",
    "nodeSummary": "Review immutable data releases, validation, installation, history, security, responsive behavior, and the fail-closed export boundary.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/imports-exports",
      "documentType": "how-to",
      "businessAudience": [
        "administrator"
      ],
      "technicalAudience": [
        "operator",
        "developer",
        "security-reviewer"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadataimportsexports",
    "targetPage": "axisDocsPageimportsexports",
    "targetRoute": "axisDocsRouteimportsexports",
    "nodeOrder": 10070,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "administrator",
      "operator",
      "developer",
      "security-reviewer"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "axis-capabilities",
      "axis-workspaces-and-operations",
      "imports-and-exports-workspace",
      "administrator",
      "operator",
      "developer",
      "security-reviewer"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisModuleHealth",
      "axisDocsNodePageaxisDocumentationContent"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record18": {
    "code": "axisDocsNodePageaxisMediaManagement",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecaxisCapabilities",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Media Management Workspace",
    "nodeSummary": "Understand the governed Media Management navigation, route shell, backend ownership, storage and delivery boundaries, and upcoming capability slices.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/media",
      "documentType": "how-to",
      "businessAudience": [
        "administrator",
        "business-user"
      ],
      "technicalAudience": [
        "operator",
        "developer"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadatamediamanagement",
    "targetPage": "axisDocsPagemediamanagement",
    "targetRoute": "axisDocsRoutemediamanagement",
    "nodeOrder": 10080,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "administrator",
      "operator",
      "developer",
      "business-user"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "axis-capabilities",
      "axis-workspaces-and-operations",
      "media-management-workspace",
      "administrator",
      "operator",
      "developer",
      "business-user"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisPageDesigner",
      "axisDocsNodePageaxisCmsRenderers"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record19": {
    "code": "axisDocsNodePageaxisCustomerEngagement",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecaxisCapabilities",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Customer Engagement Workspaces",
    "nodeSummary": "Use the lightweight six-domain Engagement journey for contact, testimonials, reviews, feedback, work management, governance, and recovery.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/customer-engagement",
      "documentType": "how-to",
      "businessAudience": [
        "business-user",
        "administrator"
      ],
      "technicalAudience": [
        "operator",
        "developer"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadatacustomerengagement",
    "targetPage": "axisDocsPagecustomerengagement",
    "targetRoute": "axisDocsRoutecustomerengagement",
    "nodeOrder": 10090,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "business-user",
      "administrator",
      "operator",
      "developer"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "axis-capabilities",
      "axis-workspaces-and-operations",
      "customer-engagement-workspaces",
      "business-user",
      "administrator",
      "operator",
      "developer"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisModuleHealth",
      "axisDocsNodePageaxisImportsExports"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record20": {
    "code": "axisDocsNodePageaxisOpenapiReference",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSecaxisCapabilities",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Swagger and OpenAPI Reference",
    "nodeSummary": "Explain how Axis presents backend-owned Swagger and OpenAPI contracts grouped by registered runtime, functional module, and authorized API category.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/openapi-reference",
      "documentType": "how-to",
      "businessAudience": [
        "administrator"
      ],
      "technicalAudience": [
        "developer",
        "operator",
        "integration",
        "ai-tool"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadataopenapireference",
    "targetPage": "axisDocsPageopenapireference",
    "targetRoute": "axisDocsRouteopenapireference",
    "nodeOrder": 10100,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "developer",
      "operator",
      "administrator",
      "integration",
      "ai-tool"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "axis-capabilities",
      "axis-workspaces-and-operations",
      "swagger-and-openapi-reference",
      "developer",
      "operator",
      "administrator",
      "integration",
      "ai-tool"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisModuleHealth",
      "axisDocsNodePageaxisSchemaWorkbench"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record21": {
    "code": "axisDocsNodePageaxisFeatureDelivery",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSeccontributeToAxis",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Axis Feature Delivery Checklist",
    "nodeSummary": "Apply repository-boundary, reuse, security, interaction, contract-testing, documentation, partial-discovery, and completion gates.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/feature-delivery",
      "documentType": "how-to",
      "businessAudience": [],
      "technicalAudience": [
        "developer",
        "architect",
        "framework-maintainer",
        "ai-tool"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadatafeaturedelivery",
    "targetPage": "axisDocsPagefeaturedelivery",
    "targetRoute": "axisDocsRoutefeaturedelivery",
    "nodeOrder": 10010,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "developer",
      "architect",
      "framework-maintainer",
      "ai-tool"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "contribute-to-axis",
      "axis-contribution-and-governance",
      "axis-feature-delivery-checklist",
      "developer",
      "architect",
      "framework-maintainer",
      "ai-tool"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisImplementationContract",
      "axisDocsNodePageaxisTechnologyStack"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record22": {
    "code": "axisDocsNodePageaxisImplementationContract",
    "product": "axisDocumentationProduct",
    "navigation": "axisDocumentationNavigationMetadata",
    "parentNode": "axisDocsNodeSeccontributeToAxis",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Axis Implementation and Documentation Contract",
    "nodeSummary": "Follow local discovery, repository ownership, placement, documentation, required scenarios, customization, and acceptance contracts.",
    "nodeContentArea": {
      "route": "/docs/nodics-axis/implementation-contract",
      "documentType": "contract",
      "businessAudience": [],
      "technicalAudience": [
        "developer",
        "architect",
        "framework-maintainer",
        "ai-tool"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "axisDocsMetadataimplementationcontract",
    "targetPage": "axisDocsPageimplementationcontract",
    "targetRoute": "axisDocsRouteimplementationcontract",
    "nodeOrder": 10020,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "developer",
      "architect",
      "framework-maintainer",
      "ai-tool"
    ],
    "accessPolicy": "axisDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "contribute-to-axis",
      "axis-contribution-and-governance",
      "axis-implementation-and-documentation-contract",
      "developer",
      "architect",
      "framework-maintainer",
      "ai-tool"
    ],
    "relatedNodes": [
      "axisDocsNodePageaxisFeatureDelivery",
      "axisDocsNodePageaxisArchitecture"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  }
};
