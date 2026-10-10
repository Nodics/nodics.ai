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
    "code": "nodicsDocsMetadatawasteImpactProviders",
    "product": "nodicsDocumentationProduct",
    "documentId": "waste.impact-providers",
    "title": "Waste impact providers and mock carbon estimates",
    "summary": "Configure illustrative carbon calculations, preserve provenance, and replace the mock through the standard provider and configuration hierarchy.",
    "businessSummary": "Waste impact providers and mock carbon estimates explains the business purpose, supported decisions, operational impact, and controls for the Modularity and Ownership journey.",
    "technicalSummary": "Waste impact providers and mock carbon estimates has canonical documentation records in wasteImpact at data/docs-v001/records/documentation/wasteImpactDocumentationComponentData.js, with functional visibility under nodics.waste. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.waste",
    "technicalModule": "wasteImpact",
    "targetPage": "nodicsDocsPagewasteImpactProviders",
    "targetRoute": "nodicsDocsRoutewasteImpactProviders",
    "articleComponent": "nodicsDocsComponentwasteImpactProviders",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawasteimpactproviders",
    "headings": [
      {
        "text": "Purpose and ownership",
        "anchor": "wasteImpactProviders-1-purpose-and-ownership",
        "level": 2
      },
      {
        "text": "Execution and prerequisites",
        "anchor": "wasteImpactProviders-2-execution-and-prerequisites",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "wasteImpactProviders-3-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Replacing the mock with an authorized provider",
        "anchor": "wasteImpactProviders-4-replacing-the-mock-with-an-authorized-provider",
        "level": 2
      },
      {
        "text": "Failure, recovery and operational evidence",
        "anchor": "wasteImpactProviders-5-failure-recovery-and-operational-evidence",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wasteImpactProviders-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wasteImpactProviders-7-verification",
        "level": 2
      },
      {
        "text": "Environmental properties and credit status",
        "anchor": "wasteImpactProviders-8-environmental-properties-and-credit-status",
        "level": 2
      },
      {
        "text": "Immutable assessment history and acceptance",
        "anchor": "wasteImpactProviders-9-immutable-assessment-history-and-acceptance",
        "level": 2
      },
      {
        "text": "Sourced energy and prospective input metrics",
        "anchor": "wasteImpactProviders-10-sourced-energy-and-prospective-input-metrics",
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
        "title": "Setting under wasteImpact.calculation, Behavior"
      }
    ],
    "visualRequirements": [
      "architecture-diagram",
      "table",
      "diagram"
    ],
    "relatedPages": [
      "framework.modular-architecture",
      "framework.customization-guide"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/wasteImpactDocumentationComponentData.js",
    "sourceChecksum": "532e829a7982434683fc04f5f427701656b2c97b05a2c6bdc40f0844b3926c0d",
    "sourceWordCount": 2202,
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
    "wordCount": 2202,
    "sourceEvidence": [
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "config/properties.js",
      "src/service/defaultWasteImpactCalculationService.js",
      "src/service/defaultWasteImpactMockProviderService.js",
      "test/wasteImpactProviderContract.test.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
