/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Module-owned documentation page metadata. */
module.exports = {
  "record0": {
    "code": "nodicsDocsMetadataroutingApiGovernance",
    "product": "nodicsDocumentationProduct",
    "documentId": "routing.api-governance",
    "title": "Routing and API Governance",
    "summary": "How Nodics owns route metadata, generated CRUD routes, security, permissions, request context, and runtime API behavior.",
    "businessSummary": "Routing and API Governance explains the business purpose, supported decisions, operational impact, and controls for the Configuration Layers and Behavior journey.",
    "technicalSummary": "Routing and API Governance has canonical documentation records in router at data/docs-v001/records/documentation/routerDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "router",
    "targetPage": "nodicsDocsPageroutingApiGovernance",
    "targetRoute": "nodicsDocsRouteroutingApiGovernance",
    "articleComponent": "nodicsDocsComponentroutingApiGovernance",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataroutingapigovernance",
    "headings": [
      {
        "text": "Business context",
        "anchor": "routingApiGovernance-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "routingApiGovernance-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "routingApiGovernance-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "routingApiGovernance-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Related developer guides",
        "anchor": "routingApiGovernance-5-related-developer-guides",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "routingApiGovernance-6-operations-and-governance",
        "level": 2
      },
      {
        "text": "Reading the effective API policy",
        "anchor": "routingApiGovernance-7-reading-the-effective-api-policy",
        "level": 3
      },
      {
        "text": "Customize and extend safely: API policy metadata",
        "anchor": "routingApiGovernance-8-customize-and-extend-safely-api-policy-metadata",
        "level": 3
      },
      {
        "text": "Common mistakes",
        "anchor": "routingApiGovernance-9-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "routingApiGovernance-10-verification",
        "level": 2
      },
      {
        "text": "Module identity and outbound API prefixes",
        "anchor": "routingApiGovernance-11-module-identity-and-outbound-api-prefixes",
        "level": 2
      },
      {
        "text": "CORS header differences",
        "anchor": "routingApiGovernance-12-cors-header-differences",
        "level": 3
      },
      {
        "text": "Origins from configured frontend endpoints",
        "anchor": "routingApiGovernance-13-origins-from-configured-frontend-endpoints",
        "level": 2
      }
    ],
    "diagrams": [
      {
        "language": "mermaid"
      }
    ],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Business question, Routing answer"
      },
      {
        "kind": "table",
        "title": "Responsibility, Owner, Notes"
      },
      {
        "kind": "table",
        "title": "Route detail, What to document, Verification signal"
      },
      {
        "kind": "table",
        "title": "Customization goal, Recommended path, Avoid"
      },
      {
        "kind": "table",
        "title": "Topic, When to use it"
      },
      {
        "kind": "table",
        "title": "Failure mode, Symptom, Troubleshooting step"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "configuration.runtime-behavior-management",
      "runtime.governed-change",
      "security.identity-access-governance",
      "routing.api-request-lifecycle",
      "foundation.error-handling-status-codes",
      "foundation.module-to-module-communication"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/routerDocumentationComponentData.js",
    "sourceChecksum": "f3d130298fbfaf81301ab1617c9394f080dc4418c2be0a439e8e0d9002293e86",
    "sourceWordCount": 2303,
    "audience": [
      "business",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.draft.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "CONTENT_CHANGE",
      "ACCESS_POLICY_CHANGE",
      "SOURCE_EVIDENCE_CHANGE"
    ],
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 2303,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "README.md",
      "src/router/routers.js",
      "src/service/router/defaultRouterService.js",
      "src/service/router/defaultRouterInitializerService.js",
      "src/service/defaultHttpHardeningService.js",
      "test/routeActionAuthorization.test.js",
      "test/openapiContractGeneration.test.js",
      "package.json",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadataroutingApiRequestLifecycle",
    "product": "nodicsDocumentationProduct",
    "documentId": "routing.api-request-lifecycle",
    "title": "API Request Lifecycle and Handler Pipeline",
    "summary": "How each Nodics HTTP request moves from Express route binding through request context, exposure checks, authentication branches, cache lookup, controller dispatch, response handlers, and safe customization.",
    "businessSummary": "API Request Lifecycle and Handler Pipeline explains the business purpose, supported decisions, operational impact, and controls for the Configuration Layers and Behavior journey.",
    "technicalSummary": "API Request Lifecycle and Handler Pipeline has canonical documentation records in router at data/docs-v001/records/documentation/routerDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "router",
    "targetPage": "nodicsDocsPageroutingApiRequestLifecycle",
    "targetRoute": "nodicsDocsRouteroutingApiRequestLifecycle",
    "articleComponent": "nodicsDocsComponentroutingApiRequestLifecycle",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataroutingapirequestlifecycle",
    "headings": [
      {
        "text": "Source map",
        "anchor": "routingApiRequestLifecycle-1-source-map",
        "level": 2
      },
      {
        "text": "End-to-end flow",
        "anchor": "routingApiRequestLifecycle-2-end-to-end-flow",
        "level": 2
      },
      {
        "text": "Main pipeline nodes",
        "anchor": "routingApiRequestLifecycle-3-main-pipeline-nodes",
        "level": 2
      },
      {
        "text": "Route metadata contract",
        "anchor": "routingApiRequestLifecycle-4-route-metadata-contract",
        "level": 2
      },
      {
        "text": "Secured, non-secured, and public branches",
        "anchor": "routingApiRequestLifecycle-5-secured-non-secured-and-public-branches",
        "level": 2
      },
      {
        "text": "Response and error handling",
        "anchor": "routingApiRequestLifecycle-6-response-and-error-handling",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "routingApiRequestLifecycle-7-customization-and-extension",
        "level": 2
      },
      {
        "text": "Developer example",
        "anchor": "routingApiRequestLifecycle-8-developer-example",
        "level": 2
      },
      {
        "text": "Operator troubleshooting",
        "anchor": "routingApiRequestLifecycle-9-operator-troubleshooting",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "routingApiRequestLifecycle-10-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "routingApiRequestLifecycle-11-verification",
        "level": 2
      }
    ],
    "diagrams": [
      {
        "language": "mermaid"
      }
    ],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Runtime area, Source location, Responsibility"
      },
      {
        "kind": "table",
        "title": "Node, What it does, Safe customization"
      },
      {
        "kind": "table",
        "title": "Branch, When used, Required context"
      },
      {
        "kind": "table",
        "title": "Need, Recommended extension, Avoid"
      },
      {
        "kind": "table",
        "title": "Symptom, Likely layer, First check"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "routing.api-governance",
      "foundation.error-handling-status-codes",
      "pipeline.business-logic-orchestration",
      "foundation.service-runtime-overrides",
      "foundation.module-to-module-communication"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/routerDocumentationComponentData.js",
    "sourceChecksum": "8a7476061601fc9f8c18c0d79f9cd6a7c80c50a308b04116d36c2a130190c49e",
    "sourceWordCount": 1833,
    "audience": [
      "business",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.draft.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "CONTENT_CHANGE",
      "ACCESS_POLICY_CHANGE",
      "SOURCE_EVIDENCE_CHANGE"
    ],
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 1833,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "src/service/defaultRequestHandlerService.js",
      "src/pipelines/pipelines.js",
      "src/service/request/defaultRequestHandlerPipelineService.js",
      "src/service/request/defaultSecuredRequestPipelineService.js",
      "src/service/request/defaultNonSecuredRequestPipelineService.js",
      "src/service/handlers/response/defaultJsonResponseHandlerService.js",
      "test/requestPipelineResponseContract.test.js",
      "package.json",
      "src/service"
    ]
  }
};
