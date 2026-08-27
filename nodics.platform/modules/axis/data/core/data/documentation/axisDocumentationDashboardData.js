/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics Axis documentation hierarchy dashboards. */
module.exports = {
  "record0": {
    "code": "axisDocsDashboardProduct",
    "ownerType": "PRODUCT",
    "ownerCode": "axisDocumentationProduct",
    "title": "Nodics Axis Documentation",
    "summary": "Documentation landing content for Axis setup, navigation, content operations, schema tools, publishing, security, and safe extension journeys.",
    "contentArea": {
      "intent": "Help administrators, business users, developers, and operators enter the correct Axis documentation journey without needing internal module names."
    },
    "cards": [
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
    "journeyLinks": [
      {
        "label": "Understand Axis",
        "targetNode": "discover-axis"
      },
      {
        "label": "Build and operate Axis",
        "targetNode": "build-and-operate-axis"
      },
      {
        "label": "Manage content and documentation",
        "targetNode": "content-and-documentation"
      }
    ],
    "statusSummary": {
      "sections": 4,
      "pages": 17,
      "lifecycleState": "ONLINE"
    },
    "product": "axisDocumentationProduct",
    "accessPolicy": "axisDocsAccessAuthenticated",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "active": true
  },
  "record1": {
    "code": "axisDocsDashboardNavigation",
    "ownerType": "NAVIGATION",
    "ownerCode": "axisDocumentationNavigationMetadata",
    "title": "Nodics Axis Documentation Navigation",
    "summary": "Expandable and searchable Axis documentation navigation generated from backend-owned content-catalog metadata.",
    "contentArea": {
      "navigationPattern": "Sections, groups, subgroups, and topics are content records so Axis can reorder, preview, submit, approve, and publish documentation without hardcoded frontend navigation."
    },
    "cards": [
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
    "journeyLinks": [
      {
        "label": "What Is Nodics Axis?",
        "targetPage": "axis.overview",
        "route": "/docs/nodics-axis"
      },
      {
        "label": "Architecture and Repository Boundaries",
        "targetPage": "axis.architecture",
        "route": "/docs/nodics-axis/architecture"
      },
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
    "statusSummary": {
      "sections": 4,
      "pages": 17,
      "searchable": true,
      "expandable": true
    },
    "product": "axisDocumentationProduct",
    "accessPolicy": "axisDocsAccessAuthenticated",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "active": true
  },
  "record2": {
    "code": "axisDocsDashboardSecdiscoverAxis",
    "ownerType": "SECTION",
    "ownerCode": "axisDocsNodeSecdiscoverAxis",
    "title": "Discover Axis",
    "summary": "Business and architecture introduction to Nodics Axis, its purpose, boundaries, documentation ownership, and repository responsibilities.",
    "contentArea": {
      "businessPurpose": "Business and architecture introduction to Nodics Axis, its purpose, boundaries, documentation ownership, and repository responsibilities.",
      "technicalPurpose": "This section is a backend documentation node with ordered children, search metadata, access policy, and publication lifecycle state."
    },
    "cards": [
      {
        "code": "axis-overview-and-architecture",
        "title": "Axis Overview and Architecture",
        "summary": "Open Axis Overview and Architecture topics and implementation guidance.",
        "order": 20
      }
    ],
    "journeyLinks": [
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
    "statusSummary": {
      "pages": 2,
      "groups": 1
    },
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "product": "axisDocumentationProduct",
    "accessPolicy": "axisDocsAccessPublic",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "active": true
  },
  "record3": {
    "code": "axisDocsDashboardSecbuildAndOperateAxis",
    "ownerType": "SECTION",
    "ownerCode": "axisDocsNodeSecbuildAndOperateAxis",
    "title": "Build and Operate Axis",
    "summary": "Technology, shell, renderer, documentation, CMS delivery, and operational rules for building and running Axis safely.",
    "contentArea": {
      "businessPurpose": "Technology, shell, renderer, documentation, CMS delivery, and operational rules for building and running Axis safely.",
      "technicalPurpose": "This section is a backend documentation node with ordered children, search metadata, access policy, and publication lifecycle state."
    },
    "cards": [
      {
        "code": "axis-build-and-runtime",
        "title": "Axis Build and Runtime",
        "summary": "Open Axis Build and Runtime topics and implementation guidance.",
        "order": 60
      }
    ],
    "journeyLinks": [
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
    "statusSummary": {
      "pages": 4,
      "groups": 1
    },
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "product": "axisDocumentationProduct",
    "accessPolicy": "axisDocsAccessPublic",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "active": true
  },
  "record4": {
    "code": "axisDocsDashboardSecaxisCapabilities",
    "ownerType": "SECTION",
    "ownerCode": "axisDocsNodeSecaxisCapabilities",
    "title": "Axis Capabilities",
    "summary": "Axis user-facing workspaces, dashboards, actions, recovery behavior, and backend-owned capability contracts.",
    "contentArea": {
      "businessPurpose": "Axis user-facing workspaces, dashboards, actions, recovery behavior, and backend-owned capability contracts.",
      "technicalPurpose": "This section is a backend documentation node with ordered children, search metadata, access policy, and publication lifecycle state."
    },
    "cards": [
      {
        "code": "axis-workspaces-and-operations",
        "title": "Axis Workspaces and Operations",
        "summary": "Open Axis Workspaces and Operations topics and implementation guidance.",
        "order": 118
      }
    ],
    "journeyLinks": [
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
        "label": "Module Health",
        "targetPage": "axis.module-health",
        "route": "/docs/nodics-axis/module-health"
      },
      {
        "label": "Imports and Exports Workspace",
        "targetPage": "axis.imports-exports",
        "route": "/docs/nodics-axis/imports-exports"
      }
    ],
    "statusSummary": {
      "pages": 9,
      "groups": 1
    },
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "product": "axisDocumentationProduct",
    "accessPolicy": "axisDocsAccessPublic",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "active": true
  },
  "record5": {
    "code": "axisDocsDashboardSeccontributeToAxis",
    "ownerType": "SECTION",
    "ownerCode": "axisDocsNodeSeccontributeToAxis",
    "title": "Contribute to Axis",
    "summary": "Contribution, implementation, quality, documentation, and governance rules for adding or changing Axis behavior.",
    "contentArea": {
      "businessPurpose": "Contribution, implementation, quality, documentation, and governance rules for adding or changing Axis behavior.",
      "technicalPurpose": "This section is a backend documentation node with ordered children, search metadata, access policy, and publication lifecycle state."
    },
    "cards": [
      {
        "code": "axis-contribution-and-governance",
        "title": "Axis Contribution and Governance",
        "summary": "Open Axis Contribution and Governance topics and implementation guidance.",
        "order": 130
      }
    ],
    "journeyLinks": [
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
    "statusSummary": {
      "pages": 2,
      "groups": 1
    },
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "product": "axisDocumentationProduct",
    "accessPolicy": "axisDocsAccessPublic",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "active": true
  },
  "record6": {
    "code": "axisDocsDashboardGrpdiscoverAxisaxisOverviewAndArchitecture",
    "ownerType": "GROUP",
    "ownerCode": "axisDocsNodeGrpdiscoverAxisaxisOverviewAndArchitecture",
    "title": "Axis Overview and Architecture",
    "summary": "Detailed landing content for Axis Overview and Architecture, including business purpose, technical ownership, customization routes, and validation evidence.",
    "contentArea": {
      "businessPurpose": "Group related Axis topics so business and development users can enter from the capability they recognize.",
      "technicalPurpose": "Preserve Axis group ownership as backend records that can be reordered and summarized through Axis."
    },
    "cards": [
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
    "journeyLinks": [
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
    "statusSummary": {
      "pages": 2,
      "subgroups": 0
    },
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "product": "axisDocumentationProduct",
    "accessPolicy": "axisDocsAccessPublic",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "active": true
  },
  "record7": {
    "code": "axisDocsDashboardGrpbuildAndOperateAxisaxisBuildAndRuntime",
    "ownerType": "GROUP",
    "ownerCode": "axisDocsNodeGrpbuildAndOperateAxisaxisBuildAndRuntime",
    "title": "Axis Build and Runtime",
    "summary": "Detailed landing content for Axis Build and Runtime, including business purpose, technical ownership, customization routes, and validation evidence.",
    "contentArea": {
      "businessPurpose": "Group related Axis topics so business and development users can enter from the capability they recognize.",
      "technicalPurpose": "Preserve Axis group ownership as backend records that can be reordered and summarized through Axis."
    },
    "cards": [
      {
        "code": "axis.technology-stack",
        "title": "Frontend Technology Stack",
        "summary": "Review exact package versions, state ownership, styling, repository shape, renderer organization, dependency governance, and verification.",
        "order": 30
      },
      {
        "code": "axis.design-system",
        "title": "Design System and Application Shell",
        "summary": "Understand authentication layouts, design foundations, shell structure, responsive states, accessibility, recovery, and extension rules.",
        "order": 40
      },
      {
        "code": "axis.cms-renderers",
        "title": "CMS Delivery and Renderer Integration",
        "summary": "Follow the CMS delivery, validation, cache-safety, logical renderer, and frontend implementation boundaries.",
        "order": 50
      },
      {
        "code": "axis.documentation-content",
        "title": "Documentation Content in Axis",
        "summary": "Understand dynamic documentation products, content-pack installation, renderer ownership, failure recovery, and contributor verification.",
        "order": 60
      }
    ],
    "journeyLinks": [
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
    "statusSummary": {
      "pages": 4,
      "subgroups": 0
    },
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "product": "axisDocumentationProduct",
    "accessPolicy": "axisDocsAccessPublic",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "active": true
  },
  "record8": {
    "code": "axisDocsDashboardGrpaxisCapabilitiesaxisWorkspacesAndOperations",
    "ownerType": "GROUP",
    "ownerCode": "axisDocsNodeGrpaxisCapabilitiesaxisWorkspacesAndOperations",
    "title": "Axis Workspaces and Operations",
    "summary": "Detailed landing content for Axis Workspaces and Operations, including business purpose, technical ownership, customization routes, and validation evidence.",
    "contentArea": {
      "businessPurpose": "Group related Axis topics so business and development users can enter from the capability they recognize.",
      "technicalPurpose": "Preserve Axis group ownership as backend records that can be reordered and summarized through Axis."
    },
    "cards": [
      {
        "code": "axis.employee-access",
        "title": "Employee Login, Recovery, Lock, and Dashboard",
        "summary": "Operate the employee-only authentication journey, recovery, persistent browser session, idle lock, logout, configuration, and safe failures.",
        "order": 70
      },
      {
        "code": "axis.assistant",
        "title": "Axis Assistant Frontend",
        "summary": "Learn the governed Assistant request flow, typed API contracts, resumable streaming, presentation lifecycle, evidence, accessibility, and security behavior.",
        "order": 80
      },
      {
        "code": "axis.schema-workbench",
        "title": "Axis Schema Workbench",
        "summary": "Use and extend governed schema discovery, record operations, relationship coordination, failure recovery, responsive behavior, and verification.",
        "order": 90
      },
      {
        "code": "axis.page-designer",
        "title": "Axis Page Designer",
        "summary": "Use the governed catalog-first Designer flow for sites, templates, dynamic slots, sections, components, media, routes, navigation, and publish readiness.",
        "order": 95
      },
      {
        "code": "axis.module-health",
        "title": "Module Health",
        "summary": "Monitor backend-governed module registration and runtime health evidence without creating a browser-side health authority.",
        "order": 100
      },
      {
        "code": "axis.imports-exports",
        "title": "Imports and Exports Workspace",
        "summary": "Review immutable data releases, validation, installation, history, security, responsive behavior, and the fail-closed export boundary.",
        "order": 110
      },
      {
        "code": "axis.media-management",
        "title": "Media Management Workspace",
        "summary": "Understand the governed Media Management navigation, route shell, backend ownership, storage and delivery boundaries, and upcoming capability slices.",
        "order": 115
      },
      {
        "code": "axis.customer-engagement",
        "title": "Customer Engagement Workspaces",
        "summary": "Use the lightweight six-domain Engagement journey for contact, testimonials, reviews, feedback, work management, governance, and recovery.",
        "order": 116
      },
      {
        "code": "axis.openapi-reference",
        "title": "Swagger and OpenAPI Reference",
        "summary": "Explain how Axis presents backend-owned Swagger and OpenAPI contracts grouped by registered runtime, functional module, and authorized API category.",
        "order": 118
      }
    ],
    "journeyLinks": [
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
        "label": "Module Health",
        "targetPage": "axis.module-health",
        "route": "/docs/nodics-axis/module-health"
      },
      {
        "label": "Imports and Exports Workspace",
        "targetPage": "axis.imports-exports",
        "route": "/docs/nodics-axis/imports-exports"
      },
      {
        "label": "Media Management Workspace",
        "targetPage": "axis.media-management",
        "route": "/docs/nodics-axis/media"
      },
      {
        "label": "Customer Engagement Workspaces",
        "targetPage": "axis.customer-engagement",
        "route": "/docs/nodics-axis/customer-engagement"
      },
      {
        "label": "Swagger and OpenAPI Reference",
        "targetPage": "axis.openapi-reference",
        "route": "/docs/nodics-axis/openapi-reference"
      }
    ],
    "statusSummary": {
      "pages": 9,
      "subgroups": 0
    },
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "product": "axisDocumentationProduct",
    "accessPolicy": "axisDocsAccessPublic",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "active": true
  },
  "record9": {
    "code": "axisDocsDashboardGrpcontributeToAxisaxisContributionAndGovernance",
    "ownerType": "GROUP",
    "ownerCode": "axisDocsNodeGrpcontributeToAxisaxisContributionAndGovernance",
    "title": "Axis Contribution and Governance",
    "summary": "Detailed landing content for Axis Contribution and Governance, including business purpose, technical ownership, customization routes, and validation evidence.",
    "contentArea": {
      "businessPurpose": "Group related Axis topics so business and development users can enter from the capability they recognize.",
      "technicalPurpose": "Preserve Axis group ownership as backend records that can be reordered and summarized through Axis."
    },
    "cards": [
      {
        "code": "axis.feature-delivery",
        "title": "Axis Feature Delivery Checklist",
        "summary": "Apply repository-boundary, reuse, security, interaction, contract-testing, documentation, partial-discovery, and completion gates.",
        "order": 120
      },
      {
        "code": "axis.implementation-contract",
        "title": "Axis Implementation and Documentation Contract",
        "summary": "Follow local discovery, repository ownership, placement, documentation, required scenarios, customization, and acceptance contracts.",
        "order": 130
      }
    ],
    "journeyLinks": [
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
    "statusSummary": {
      "pages": 2,
      "subgroups": 0
    },
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "product": "axisDocumentationProduct",
    "accessPolicy": "axisDocsAccessPublic",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "active": true
  }
};
