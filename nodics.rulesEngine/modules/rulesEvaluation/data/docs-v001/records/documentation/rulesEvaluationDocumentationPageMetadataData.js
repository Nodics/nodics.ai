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
  "nodicsDocsMetadatarulesDeterministicEvaluation": {
    "code": "nodicsDocsMetadatarulesDeterministicEvaluation",
    "product": "nodicsDocumentationProduct",
    "documentId": "rules.deterministic-evaluation",
    "title": "Deterministic Rules Evaluation",
    "summary": "Deterministic Rules Evaluation: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "businessSummary": "Deterministic Rules Evaluation: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "technicalSummary": "Deterministic Rules Evaluation: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "ownerFunctionalModule": "nodics.rulesEngine",
    "technicalModule": "rulesEvaluation",
    "targetPage": "nodicsDocsPagerulesDeterministicEvaluation",
    "targetRoute": "nodicsDocsRouterulesDeterministicEvaluation",
    "articleComponent": "nodicsDocsComponentrulesDeterministicEvaluation",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatarulesdeterministicevaluation",
    "headings": [
      {
        "text": "Deterministic Rules Evaluation",
        "anchor": "rules-deterministic-evaluation",
        "level": 1
      },
      {
        "text": "Engine ownership and business result",
        "anchor": "rulesDeterministicEvaluation-1-engine-ownership-and-business-result",
        "level": 2
      },
      {
        "text": "Availability quality and group logic",
        "anchor": "rulesDeterministicEvaluation-2-availability-quality-and-group-logic",
        "level": 2
      },
      {
        "text": "Scores bands and reproducibility",
        "anchor": "rulesDeterministicEvaluation-3-scores-bands-and-reproducibility",
        "level": 2
      },
      {
        "text": "Verification and recovery",
        "anchor": "rulesDeterministicEvaluation-4-verification-and-recovery",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "rules-evaluation-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Documentation selection assets and acceptance",
        "anchor": "rulesDeterministicEvaluation-5-documentation-selection-assets-and-acceptance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "rules-deterministic-evaluation-common-mistakes",
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
        "title": "Input situation, Evaluation meaning, Business explanation"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "copilot.rules-inspection",
      "loyalty.wallets-rewards-ledger"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/rulesEvaluationDocumentationComponentData.js",
    "sourceChecksum": "33f5f124d729fdef6d451cc40c1bb2b4165b885144eade2c9aa355644ecad586",
    "sourceWordCount": 1767,
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
    "wordCount": 1767,
    "sourceEvidence": [
      "src/service/defaultRuleEvaluationService.js",
      "src/service/defaultRuleGroupEvaluationService.js",
      "src/service/defaultRuleConditionEvaluationService.js",
      "src/service/defaultRulePropertyResolutionService.js",
      "src/service/defaultScoreBandResolutionService.js",
      "src/service/defaultRuleQualityService.js",
      "src/service/defaultRuleSimulationService.js",
      "test/ruleEvaluationContract.test.js",
      "llm/contracts/README.md",
      "../rulesCore/src/service/defaultRulePropertyCatalogueRegistryService.js"
    ],
    "sourceCoverage": [
      {
        "modulePath": ".",
        "implementationState": "IMPLEMENTED",
        "anchors": [
          "rulesDeterministicEvaluation-1-engine-ownership-and-business-result",
          "rulesDeterministicEvaluation-2-availability-quality-and-group-logic",
          "rulesDeterministicEvaluation-3-scores-bands-and-reproducibility",
          "rulesDeterministicEvaluation-4-verification-and-recovery",
          "rulesDeterministicEvaluation-5-documentation-selection-assets-and-acceptance"
        ],
        "evidence": [
          "src/service/defaultRuleEvaluationService.js",
          "src/service/defaultRuleGroupEvaluationService.js",
          "src/service/defaultRuleConditionEvaluationService.js",
          "src/service/defaultRulePropertyResolutionService.js",
          "src/service/defaultScoreBandResolutionService.js"
        ]
      },
      {
        "modulePath": "../..",
        "implementationState": "COMPOSITION_ONLY",
        "anchors": [
          "rulesDeterministicEvaluation-1-engine-ownership-and-business-result",
          "rulesDeterministicEvaluation-2-availability-quality-and-group-logic",
          "rulesDeterministicEvaluation-3-scores-bands-and-reproducibility",
          "rulesDeterministicEvaluation-4-verification-and-recovery",
          "rulesDeterministicEvaluation-5-documentation-selection-assets-and-acceptance"
        ],
        "evidence": [
          "src/service/defaultRuleEvaluationService.js",
          "src/service/defaultRuleGroupEvaluationService.js",
          "src/service/defaultRuleConditionEvaluationService.js",
          "src/service/defaultRulePropertyResolutionService.js",
          "src/service/defaultScoreBandResolutionService.js"
        ]
      }
    ],
    "businessAudience": [
      "business user",
      "implementation partner",
      "rulesEvaluation capability owner"
    ]
  }
};
