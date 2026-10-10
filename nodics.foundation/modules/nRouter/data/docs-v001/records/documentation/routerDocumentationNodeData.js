/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics framework documentation hierarchy nodes. */
module.exports = {
  "record0": {
    "code": "nodicsDocsNodePageroutingApiGovernance",
    "product": "nodicsDocumentationProduct",
    "navigation": "nodicsDocumentationNavigation",
    "parentNode": "nodicsDocsNodeSecapplicationConfigurationAndRuntimeBehaviorManagement",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Routing and API Governance",
    "nodeSummary": "How Nodics owns route metadata, generated CRUD routes, security, permissions, request context, and runtime API behavior.",
    "nodeContentArea": {
      "route": "/docs/framework/routing-api-governance",
      "documentType": "configuration",
      "businessAudience": [
        "business user",
        "administrator",
        "implementation partner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "nodicsDocsMetadataroutingApiGovernance",
    "targetPage": "nodicsDocsPageroutingApiGovernance",
    "targetRoute": "nodicsDocsRouteroutingApiGovernance",
    "nodeOrder": 10030,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "business",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [
      "admin",
      "documentationAuthor",
      "axisViewer"
    ],
    "allowedGroups": [
      "documentationAuthorUserGroup",
      "axisReadOnlyUserGroup"
    ],
    "allowedPermissions": [
      "documentation.read",
      "router.configuration.read"
    ],
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
      "routing",
      "api-governance",
      "router",
      "route-security",
      "generated-crud"
    ],
    "relatedNodes": [
      "nodicsDocsNodePageconfigurationRuntimeBehaviorManagement",
      "nodicsDocsNodePageruntimeGovernedChange",
      "nodicsDocsNodePagesecurityIdentityAccessGovernance",
      "nodicsDocsNodePageroutingApiRequestLifecycle",
      "nodicsDocsNodePagefoundationErrorHandlingStatusCodes",
      "nodicsDocsNodePagefoundationModuleToModuleCommunication"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record1": {
    "code": "nodicsDocsNodePageroutingApiRequestLifecycle",
    "product": "nodicsDocumentationProduct",
    "navigation": "nodicsDocumentationNavigation",
    "parentNode": "nodicsDocsNodeSecapplicationConfigurationAndRuntimeBehaviorManagement",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "API Request Lifecycle and Handler Pipeline",
    "nodeSummary": "How each Nodics HTTP request moves from Express route binding through request context, exposure checks, authentication branches, cache lookup, controller dispatch, response handlers, and safe customization.",
    "nodeContentArea": {
      "route": "/docs/framework/routing-api-request-lifecycle",
      "documentType": "contract",
      "businessAudience": [
        "business user",
        "administrator",
        "implementation partner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "nodicsDocsMetadataroutingApiRequestLifecycle",
    "targetPage": "nodicsDocsPageroutingApiRequestLifecycle",
    "targetRoute": "nodicsDocsRouteroutingApiRequestLifecycle",
    "nodeOrder": 10040,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "business",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [
      "admin",
      "documentationAuthor",
      "axisViewer"
    ],
    "allowedGroups": [
      "documentationAuthorUserGroup",
      "axisReadOnlyUserGroup"
    ],
    "allowedPermissions": [
      "documentation.read",
      "router.configuration.read"
    ],
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
      "request lifecycle",
      "handler pipeline",
      "requestHandlerPipeline",
      "nRouter",
      "controller dispatch",
      "response handler"
    ],
    "relatedNodes": [
      "nodicsDocsNodePageroutingApiGovernance",
      "nodicsDocsNodePagefoundationErrorHandlingStatusCodes",
      "nodicsDocsNodePagepipelineBusinessLogicOrchestration",
      "nodicsDocsNodePagefoundationServiceRuntimeOverrides",
      "nodicsDocsNodePagefoundationModuleToModuleCommunication"
    ],
    "locale": "en",
    "channel": "web",
    "active": true
  }
};
