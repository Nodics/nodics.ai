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
    "code": "nodicsDocsMetadatafoundationErrorHandlingStatusCodes",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.error-handling-status-codes",
    "title": "Error Handling and Status Codes",
    "summary": "How Nodics errors, status definitions, response handlers, HTTP status codes, localization metadata, safe public messages, and project overrides work.",
    "businessSummary": "Error Handling and Status Codes explains the business purpose, supported decisions, operational impact, and controls for the Configuration Layers and Behavior journey.",
    "technicalSummary": "Error Handling and Status Codes has canonical documentation records in nCommon at data/docs-v001/records/documentation/nCommonDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nCommon",
    "targetPage": "nodicsDocsPagefoundationErrorHandlingStatusCodes",
    "targetRoute": "nodicsDocsRoutefoundationErrorHandlingStatusCodes",
    "articleComponent": "nodicsDocsComponentfoundationErrorHandlingStatusCodes",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafoundationerrorhandlingstatuscodes",
    "headings": [
      {
        "text": "Business context",
        "anchor": "foundationErrorHandlingStatusCodes-1-business-context",
        "level": 2
      },
      {
        "text": "Runtime ownership",
        "anchor": "foundationErrorHandlingStatusCodes-2-runtime-ownership",
        "level": 2
      },
      {
        "text": "End-to-end flow",
        "anchor": "foundationErrorHandlingStatusCodes-3-end-to-end-flow",
        "level": 2
      },
      {
        "text": "Error code format",
        "anchor": "foundationErrorHandlingStatusCodes-4-error-code-format",
        "level": 2
      },
      {
        "text": "Status definition contract",
        "anchor": "foundationErrorHandlingStatusCodes-5-status-definition-contract",
        "level": 2
      },
      {
        "text": "Throwing errors",
        "anchor": "foundationErrorHandlingStatusCodes-6-throwing-errors",
        "level": 2
      },
      {
        "text": "Aggregated validation errors",
        "anchor": "foundationErrorHandlingStatusCodes-7-aggregated-validation-errors",
        "level": 2
      },
      {
        "text": "Success response format",
        "anchor": "foundationErrorHandlingStatusCodes-8-success-response-format",
        "level": 2
      },
      {
        "text": "Error response format",
        "anchor": "foundationErrorHandlingStatusCodes-9-error-response-format",
        "level": 2
      },
      {
        "text": "HTTP status guidance",
        "anchor": "foundationErrorHandlingStatusCodes-10-http-status-guidance",
        "level": 2
      },
      {
        "text": "Response handler selection",
        "anchor": "foundationErrorHandlingStatusCodes-11-response-handler-selection",
        "level": 2
      },
      {
        "text": "Configuration",
        "anchor": "foundationErrorHandlingStatusCodes-12-configuration",
        "level": 2
      },
      {
        "text": "Project customization",
        "anchor": "foundationErrorHandlingStatusCodes-13-project-customization",
        "level": 2
      },
      {
        "text": "Operator troubleshooting",
        "anchor": "foundationErrorHandlingStatusCodes-14-operator-troubleshooting",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "foundationErrorHandlingStatusCodes-15-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "foundationErrorHandlingStatusCodes-16-verification",
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
        "title": "Business need, Error contract answer"
      },
      {
        "kind": "table",
        "title": "Runtime area, Source location, Responsibility"
      },
      {
        "kind": "table",
        "title": "Part, Example, Meaning"
      },
      {
        "kind": "table",
        "title": "Field, Required, Meaning"
      },
      {
        "kind": "table",
        "title": "HTTP status, Use for, Example Nodics condition"
      },
      {
        "kind": "table",
        "title": "Need, Extension point, Avoid"
      },
      {
        "kind": "table",
        "title": "Symptom, Likely cause, First check"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "configuration.runtime-behavior-management",
      "configuration.framework-startup-lifecycle",
      "routing.api-governance",
      "routing.api-request-lifecycle",
      "pipeline.business-logic-orchestration",
      "applications.axis-setup-error-contracts"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/nCommonDocumentationComponentData.js",
    "sourceChecksum": "53976eb9d2a8d855fc1c9e6095585184aeba1c3a1a354fd9049eef1162db8bdd",
    "sourceWordCount": 1954,
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
    "wordCount": 1954,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "src/lib/nodicsError.js",
      "config/properties.js",
      "src/utils/statusDefinitions.js",
      "test/errorTraceability.test.js",
      "../nService/src/service/status/defaultStatusService.js",
      "../nService/test/statusDefinitionCatalog.test.js",
      "../nRouter/src/service/defaultRequestHandlerService.js",
      "../nRouter/src/service/handlers/response/defaultJsonResponseHandlerService.js",
      "../nRouter/src/service/handlers/response/defaultFileDownloadResponseHandlerService.js",
      "../nRouter/src/service/handlers/response/defaultTextResponseHandlerService.js",
      "../nRouter/src/utils/statusDefinitions.js",
      "../../../nodics.process/modules/workflow/src/utils/statusDefinitions.js",
      "../nData/nExport/export/src/utils/statusDefinitions.js",
      "package.json",
      "src/service"
    ]
  }
};
