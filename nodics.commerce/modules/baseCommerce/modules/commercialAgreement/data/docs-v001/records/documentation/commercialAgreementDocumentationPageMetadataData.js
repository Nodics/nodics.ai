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
    "code": "nodicsDocsMetadatacommercialAgreements",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.commercial-agreements",
    "title": "Commercial Agreements",
    "summary": "Enterprise package assignments, descriptive terms, retained amendments and independently timed search benefits without automatic billing or status enforcement.",
    "businessSummary": "Enterprise package assignments, descriptive terms, retained amendments and independently timed search benefits without automatic billing or status enforcement.",
    "technicalSummary": "Append-only owner-admitted generated concurrency, exact Product/Pricing evidence, scoped commands, benefit resolution and explicit recovery.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "commercialAgreement",
    "targetPage": "nodicsDocsPagecommercialAgreements",
    "targetRoute": "nodicsDocsRoutecommercialAgreements",
    "articleComponent": "nodicsDocsComponentcommercialAgreements",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommercialagreements",
    "headings": [
      {
        "text": "Ownership and supported models",
        "anchor": "commercial-agreements-ownership",
        "level": 2
      },
      {
        "text": "Record and amendment workflow",
        "anchor": "commercial-agreements-record",
        "level": 2
      },
      {
        "text": "Benefits and independent duration",
        "anchor": "commercial-agreements-benefits",
        "level": 2
      },
      {
        "text": "Authority, conflicts and recovery",
        "anchor": "commercial-agreements-recovery",
        "level": 2
      },
      {
        "text": "Configure and extend safely",
        "anchor": "commercial-agreements-configuration",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commercial-agreements-mistakes",
        "level": 2
      },
      {
        "text": "Verification and source evidence",
        "anchor": "commercial-agreements-verification",
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
        "title": "Area, Source location"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/commercialAgreementDocumentationComponentData.js",
    "sourceChecksum": "c1acc722484915653aef46307222c4909d156d3ea5cd6694fa1b39e42d921ac6",
    "sourceWordCount": 1676,
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
    "lifecycleState": "DRAFT",
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 1676,
    "sourceEvidence": [
      "src/service/defaultCommercialAgreementOperationService.js",
      "config/properties.js",
      "test/commercialAgreementContract.test.js",
      "llm/contracts/README.md"
    ],
    "sourceCoverage": [
      {
        "modulePath": ".",
        "implementationState": "IMPLEMENTED",
        "anchors": [
          "commercial-agreements-ownership",
          "commercial-agreements-record",
          "commercial-agreements-benefits",
          "commercial-agreements-recovery"
        ],
        "evidence": [
          "src/service/defaultCommercialAgreementOperationService.js",
          "test/commercialAgreementContract.test.js"
        ]
      }
    ]
  }
};
