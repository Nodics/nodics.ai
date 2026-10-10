/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical module-owned documentation CMS component records. */
module.exports = {
  "nodicsDocsMetadatacopilotEvaluationReleaseGates": {
    "code": "nodicsDocsMetadatacopilotEvaluationReleaseGates",
    "product": "nodicsDocumentationProduct",
    "documentId": "copilot.evaluation-release-gates",
    "title": "Copilot Evaluation and Release Gates",
    "summary": "Copilot Evaluation and Release Gates: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "businessSummary": "Copilot Evaluation and Release Gates: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "technicalSummary": "Copilot Evaluation and Release Gates: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "ownerFunctionalModule": "nodics.copilot",
    "technicalModule": "copilotEvaluation",
    "targetPage": "nodicsDocsPagecopilotEvaluationReleaseGates",
    "targetRoute": "nodicsDocsRoutecopilotEvaluationReleaseGates",
    "articleComponent": "nodicsDocsComponentcopilotEvaluationReleaseGates",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacopilotevaluationreleasegates",
    "headings": [
      {
        "text": "Copilot Evaluation and Release Gates",
        "anchor": "copilot-evaluation-release-gates",
        "level": 1
      },
      {
        "text": "Purpose and evidence boundary",
        "anchor": "copilotEvaluationReleaseGates-1-purpose-and-evidence-boundary",
        "level": 2
      },
      {
        "text": "Scoring and threshold semantics",
        "anchor": "copilotEvaluationReleaseGates-2-scoring-and-threshold-semantics",
        "level": 2
      },
      {
        "text": "Suite safety and release decision",
        "anchor": "copilotEvaluationReleaseGates-3-suite-safety-and-release-decision",
        "level": 2
      },
      {
        "text": "Verification and honest limits",
        "anchor": "copilotEvaluationReleaseGates-4-verification-and-honest-limits",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "copilot-evaluation-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Documentation selection assets and acceptance",
        "anchor": "copilotEvaluationReleaseGates-5-documentation-selection-assets-and-acceptance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "copilot-evaluation-release-gates-common-mistakes",
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
        "title": "Case, Helper behavior, Consumer responsibility"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "copilot.provider-usage-budgets",
      "copilot.original-business-results"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/copilotEvaluationDocumentationComponentData.js",
    "sourceChecksum": "5aa5bd23c7b69dc52a32f2a348e524e0770f6a00ba9d1528058d1cf8f24a9d25",
    "sourceWordCount": 1653,
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
    "lifecycleState": "STAGED",
    "maturityState": "REFERENCE",
    "active": true,
    "wordCount": 1653,
    "sourceEvidence": [
      "src/service/defaultCopilotEvaluationService.js",
      "src/schemas/schemas.js",
      "test/copilotEvaluationReleaseGateContract.test.js",
      "config/properties.js",
      "llm/contracts/README.md"
    ],
    "sourceCoverage": [
      {
        "modulePath": ".",
        "implementationState": "IMPLEMENTED",
        "anchors": [
          "copilotEvaluationReleaseGates-1-purpose-and-evidence-boundary",
          "copilotEvaluationReleaseGates-2-scoring-and-threshold-semantics",
          "copilotEvaluationReleaseGates-3-suite-safety-and-release-decision",
          "copilotEvaluationReleaseGates-4-verification-and-honest-limits",
          "copilotEvaluationReleaseGates-5-documentation-selection-assets-and-acceptance"
        ],
        "evidence": [
          "src/service/defaultCopilotEvaluationService.js",
          "src/schemas/schemas.js",
          "test/copilotEvaluationReleaseGateContract.test.js"
        ]
      }
    ],
    "businessAudience": [
      "business user",
      "implementation partner",
      "copilotEvaluation capability owner"
    ]
  }
};
