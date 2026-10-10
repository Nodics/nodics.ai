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
  "nodicsDocsMetadatacopilotProviderUsageBudgets": {
    "code": "nodicsDocsMetadatacopilotProviderUsageBudgets",
    "product": "nodicsDocumentationProduct",
    "documentId": "copilot.provider-usage-budgets",
    "title": "Copilot Provider Usage and Budgets",
    "summary": "Copilot Provider Usage and Budgets: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "businessSummary": "Copilot Provider Usage and Budgets: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "technicalSummary": "Copilot Provider Usage and Budgets: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "ownerFunctionalModule": "nodics.copilot",
    "technicalModule": "copilotProvider",
    "targetPage": "nodicsDocsPagecopilotProviderUsageBudgets",
    "targetRoute": "nodicsDocsRoutecopilotProviderUsageBudgets",
    "articleComponent": "nodicsDocsComponentcopilotProviderUsageBudgets",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacopilotproviderusagebudgets",
    "headings": [
      {
        "text": "Copilot Provider Usage and Budgets",
        "anchor": "copilot-provider-usage-budgets",
        "level": 1
      },
      {
        "text": "Provider boundary and business outcome",
        "anchor": "copilotProviderUsageBudgets-1-provider-boundary-and-business-outcome",
        "level": 2
      },
      {
        "text": "Calendar accounting and allocation",
        "anchor": "copilotProviderUsageBudgets-2-calendar-accounting-and-allocation",
        "level": 2
      },
      {
        "text": "Inspection and reconciliation",
        "anchor": "copilotProviderUsageBudgets-3-inspection-and-reconciliation",
        "level": 2
      },
      {
        "text": "Verification and failure recovery",
        "anchor": "copilotProviderUsageBudgets-4-verification-and-failure-recovery",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "copilot-provider-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Documentation selection assets and acceptance",
        "anchor": "copilotProviderUsageBudgets-5-documentation-selection-assets-and-acceptance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "copilot-provider-usage-budgets-common-mistakes",
        "level": 2
      },
      {
        "text": "Provider adapter contracts and shared ownership",
        "anchor": "copilot-provider-adapter-contracts",
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
        "title": "Observation, Meaning, Allowed next step"
      },
      {
        "kind": "table",
        "title": "Task, Required grants or context, Recovery"
      },
      {
        "kind": "table",
        "title": "Implementing module, Request mapping, Response and stream behavior, Boundary"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "copilot.original-business-results",
      "copilot.governed-schema-actions"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/copilotProviderDocumentationComponentData.js",
    "sourceChecksum": "b916ab141c41519e38c15c3d4a30dd915c82125de8d2577303ee4c5029c8deec",
    "sourceWordCount": 2164,
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
    "wordCount": 2164,
    "sourceEvidence": [
      "src/service/defaultCopilotProviderService.js",
      "src/service/defaultCopilotBudgetService.js",
      "src/service/defaultCopilotUsageService.js",
      "src/service/defaultCopilotReconciliationService.js",
      "test/copilotBudgets.test.js",
      "test/copilotReconciliation.test.js",
      "../ollamaProvider/src/service/defaultOllamaCopilotProviderAdapterService.js",
      "../ollamaProvider/AGENTS.md",
      "../openAiProvider/src/service/defaultOpenAiCopilotProviderAdapterService.js",
      "../openAiProvider/AGENTS.md",
      "../claudeProvider/src/service/defaultClaudeCopilotProviderAdapterService.js",
      "../claudeProvider/AGENTS.md",
      "../geminiProvider/src/service/defaultGeminiCopilotProviderAdapterService.js",
      "../geminiProvider/AGENTS.md",
      "config/properties.js",
      "test/providerValidation.test.js",
      "test/copilotUsage.test.js",
      "llm/contracts/README.md"
    ],
    "sourceCoverage": [
      {
        "modulePath": ".",
        "implementationState": "IMPLEMENTED",
        "anchors": [
          "copilotProviderUsageBudgets-1-provider-boundary-and-business-outcome",
          "copilotProviderUsageBudgets-2-calendar-accounting-and-allocation",
          "copilotProviderUsageBudgets-3-inspection-and-reconciliation",
          "copilotProviderUsageBudgets-4-verification-and-failure-recovery",
          "copilotProviderUsageBudgets-5-documentation-selection-assets-and-acceptance"
        ],
        "evidence": [
          "src/service/defaultCopilotProviderService.js",
          "src/service/defaultCopilotBudgetService.js",
          "src/service/defaultCopilotUsageService.js",
          "src/service/defaultCopilotReconciliationService.js",
          "test/copilotBudgets.test.js",
          "test/copilotReconciliation.test.js"
        ]
      },
      {
        "modulePath": "../..",
        "implementationState": "COMPOSITION_ONLY",
        "anchors": [
          "copilotProviderUsageBudgets-1-provider-boundary-and-business-outcome",
          "copilotProviderUsageBudgets-2-calendar-accounting-and-allocation",
          "copilotProviderUsageBudgets-3-inspection-and-reconciliation",
          "copilotProviderUsageBudgets-4-verification-and-failure-recovery",
          "copilotProviderUsageBudgets-5-documentation-selection-assets-and-acceptance"
        ],
        "evidence": [
          "src/service/defaultCopilotProviderService.js",
          "src/service/defaultCopilotBudgetService.js",
          "src/service/defaultCopilotUsageService.js",
          "src/service/defaultCopilotReconciliationService.js",
          "test/copilotBudgets.test.js",
          "test/copilotReconciliation.test.js"
        ]
      }
    ],
    "businessAudience": [
      "business user",
      "implementation partner",
      "copilotProvider capability owner"
    ]
  }
};
