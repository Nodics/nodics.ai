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
    "code": "nodicsDocsMetadatafoundationServiceRuntimeOverrides",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.service-runtime-overrides",
    "title": "Service Runtime and Override Precedence",
    "summary": "How generated services, virtual services, module graph resolution, customer overrides, fallback behavior, and extension safety work.",
    "businessSummary": "Service Runtime and Override Precedence explains the business purpose, supported decisions, operational impact, and controls for the Service Runtime and Overrides journey.",
    "technicalSummary": "Service Runtime and Override Precedence has canonical documentation records in nService at data/docs-v001/records/documentation/nServiceDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nService",
    "targetPage": "nodicsDocsPagefoundationServiceRuntimeOverrides",
    "targetRoute": "nodicsDocsRoutefoundationServiceRuntimeOverrides",
    "articleComponent": "nodicsDocsComponentfoundationServiceRuntimeOverrides",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafoundationserviceruntimeoverrides",
    "headings": [
      {
        "text": "Source map",
        "anchor": "foundationServiceRuntimeOverrides-1-source-map",
        "level": 2
      },
      {
        "text": "Resolution flow",
        "anchor": "foundationServiceRuntimeOverrides-2-resolution-flow",
        "level": 2
      },
      {
        "text": "Precedence contract",
        "anchor": "foundationServiceRuntimeOverrides-3-precedence-contract",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "foundationServiceRuntimeOverrides-4-operational-evidence",
        "level": 2
      },
      {
        "text": "Related developer guides",
        "anchor": "foundationServiceRuntimeOverrides-5-related-developer-guides",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "foundationServiceRuntimeOverrides-6-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "foundationServiceRuntimeOverrides-7-implementation-handoff",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "foundationServiceRuntimeOverrides-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "foundationServiceRuntimeOverrides-9-verification",
        "level": 2
      },
      {
        "text": "Separate runtimes and Profile bootstrap",
        "anchor": "foundationServiceRuntimeOverrides-10-separate-runtimes-and-profile-bootstrap",
        "level": 2
      },
      {
        "text": "Repeatable isolated runtime acceptance",
        "anchor": "foundationServiceRuntimeOverrides-11-repeatable-isolated-runtime-acceptance",
        "level": 3
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
        "title": "Area, Source location"
      },
      {
        "kind": "table",
        "title": "Question, Evidence"
      },
      {
        "kind": "table",
        "title": "Topic, When to use it"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "framework.module-loading-service-precedence",
      "framework.backend-extension-patterns",
      "runtime.governed-change",
      "foundation.module-to-module-communication",
      "routing.api-request-lifecycle"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/nServiceDocumentationComponentData.js",
    "sourceChecksum": "bf81c85c7db3a002df9d6bbf65c95d28026c8c16224ebaff2ed68df43b130236",
    "sourceWordCount": 1633,
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
    "wordCount": 1633,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "vService/package.json",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatafoundationModuleToModuleCommunication",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.module-to-module-communication",
    "title": "Module-to-Module Communication",
    "summary": "How DefaultModuleService invokes local services or remote module APIs through target authority, Runtime Registry, static endpoints, internal auth, retries, circuit breakers, and bounded external HTTP calls.",
    "businessSummary": "Module-to-Module Communication explains the business purpose, supported decisions, operational impact, and controls for the Service Runtime and Overrides journey.",
    "technicalSummary": "Module-to-Module Communication has canonical documentation records in nService at data/docs-v001/records/documentation/nServiceDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nService",
    "targetPage": "nodicsDocsPagefoundationModuleToModuleCommunication",
    "targetRoute": "nodicsDocsRoutefoundationModuleToModuleCommunication",
    "articleComponent": "nodicsDocsComponentfoundationModuleToModuleCommunication",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafoundationmoduletomodulecommunication",
    "headings": [
      {
        "text": "Source map",
        "anchor": "foundationModuleToModuleCommunication-1-source-map",
        "level": 2
      },
      {
        "text": "Invocation model",
        "anchor": "foundationModuleToModuleCommunication-2-invocation-model",
        "level": 2
      },
      {
        "text": "Local invocation",
        "anchor": "foundationModuleToModuleCommunication-3-local-invocation",
        "level": 2
      },
      {
        "text": "Remote invocation",
        "anchor": "foundationModuleToModuleCommunication-4-remote-invocation",
        "level": 2
      },
      {
        "text": "Target authority",
        "anchor": "foundationModuleToModuleCommunication-5-target-authority",
        "level": 2
      },
      {
        "text": "Headers and internal authentication",
        "anchor": "foundationModuleToModuleCommunication-6-headers-and-internal-authentication",
        "level": 2
      },
      {
        "text": "External HTTP requests",
        "anchor": "foundationModuleToModuleCommunication-7-external-http-requests",
        "level": 2
      },
      {
        "text": "Transport resilience and diagnostics",
        "anchor": "foundationModuleToModuleCommunication-8-transport-resilience-and-diagnostics",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "foundationModuleToModuleCommunication-9-customization-and-extension",
        "level": 2
      },
      {
        "text": "Developer examples",
        "anchor": "foundationModuleToModuleCommunication-10-developer-examples",
        "level": 2
      },
      {
        "text": "Operator troubleshooting",
        "anchor": "foundationModuleToModuleCommunication-11-operator-troubleshooting",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "foundationModuleToModuleCommunication-12-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "foundationModuleToModuleCommunication-13-verification",
        "level": 2
      },
      {
        "text": "Local selection and independent deployment acceptance",
        "anchor": "foundationModuleToModuleCommunication-14-local-selection-and-independent-deployment-acceptance",
        "level": 3
      },
      {
        "text": "Runtime credential failure and local regression checks",
        "anchor": "foundationModuleToModuleCommunication-15-runtime-credential-failure-and-local-regression-checks",
        "level": 3
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
        "title": "Input, Normalized output"
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
      "foundation.service-runtime-overrides",
      "routing.api-request-lifecycle",
      "framework.module-loading-service-precedence",
      "framework.backend-extension-patterns",
      "runtime.governed-change"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/nServiceDocumentationComponentData.js",
    "sourceChecksum": "e2b6ac42b97bb7225d0b8b95f6c214727476d0dc7cbe3bfc909606930274276e",
    "sourceWordCount": 1948,
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
    "wordCount": 1948,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "src/service/module/defaultModuleService.js",
      "src/lib/moduleConfiguration.js",
      "../nRouter/src/service/router/defaultRouterService.js",
      "test/moduleInvocationContract.test.js",
      "test/moduleTransportResilience.test.js",
      "test/moduleRequestHeaderNormalization.test.js",
      "package.json",
      "src/service"
    ]
  }
};
