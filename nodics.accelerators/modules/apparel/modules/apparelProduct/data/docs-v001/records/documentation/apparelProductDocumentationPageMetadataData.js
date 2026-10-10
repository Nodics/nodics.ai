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
    "code": "nodicsDocsMetadataacceleratorsAgoraApparelProductDataAuthoring",
    "product": "nodicsDocumentationProduct",
    "documentId": "accelerators.agora-apparel-product-data-authoring",
    "title": "Agora Apparel Product Data Authoring",
    "summary": "Step-by-step source-backed guide for adding Agora Apparel product, price, inventory, content, media, and search data through project release folders.",
    "businessSummary": "Agora Apparel Product Data Authoring explains the business purpose, supported decisions, operational impact, and controls for the Agora Accelerator Family journey.",
    "technicalSummary": "Agora Apparel Product Data Authoring has canonical documentation records in apparelProduct at data/docs-v001/records/documentation/apparelProductDocumentationComponentData.js, with functional visibility under nodics.accelerators. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.accelerators",
    "technicalModule": "apparelProduct",
    "targetPage": "nodicsDocsPageacceleratorsAgoraApparelProductDataAuthoring",
    "targetRoute": "nodicsDocsRouteacceleratorsAgoraApparelProductDataAuthoring",
    "articleComponent": "nodicsDocsComponentacceleratorsAgoraApparelProductDataAuthoring",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataacceleratorsagoraapparelproductdataauthoring",
    "headings": [
      {
        "text": "Business result",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-1-business-result",
        "level": 2
      },
      {
        "text": "Beginner mental model",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-2-beginner-mental-model",
        "level": 2
      },
      {
        "text": "Source map",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-3-source-map",
        "level": 2
      },
      {
        "text": "Step-by-step authoring",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-4-step-by-step-authoring",
        "level": 2
      },
      {
        "text": "Header contract",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-5-header-contract",
        "level": 2
      },
      {
        "text": "Record contract",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-6-record-contract",
        "level": 2
      },
      {
        "text": "Product dependency map",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-7-product-dependency-map",
        "level": 2
      },
      {
        "text": "Media contract",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-8-media-contract",
        "level": 2
      },
      {
        "text": "Import execution flow",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-9-import-execution-flow",
        "level": 2
      },
      {
        "text": "Customization model",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-10-customization-model",
        "level": 2
      },
      {
        "text": "Configuration behavior",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-11-configuration-behavior",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-12-verification",
        "level": 2
      },
      {
        "text": "Industry standards references",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-13-industry-standards-references",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-14-common-mistakes",
        "level": 2
      },
      {
        "text": "Completion checklist",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-15-completion-checklist",
        "level": 2
      },
      {
        "text": "Opening stock is an intake command, not a balance file",
        "anchor": "apparel-opening-receipt-authoring",
        "level": 2
      },
      {
        "text": "Customize and recover opening intake safely",
        "anchor": "apparel-opening-receipt-customization",
        "level": 2
      }
    ],
    "diagrams": [
      {
        "language": "mermaid"
      },
      {
        "language": "mermaid"
      },
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
        "title": "Capability, Owning module"
      },
      {
        "kind": "table",
        "title": "Data file, Purpose, Typical key"
      },
      {
        "kind": "table",
        "title": "Allowed in data, Owned by importer or runtime"
      },
      {
        "kind": "table",
        "title": "Need, Safe customization"
      },
      {
        "kind": "table",
        "title": "Configuration area, Where it belongs, What it controls"
      },
      {
        "kind": "table",
        "title": "Declaration, Required meaning, Never substitute"
      },
      {
        "kind": "table",
        "title": "Outcome, Success or rejection evidence, Recovery"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix",
      "table"
    ],
    "relatedPages": [
      "accelerators.agora-industry-templates",
      "data.import-export-migration",
      "catalog.product-discovery-management",
      "pricing.promotions-tax-management",
      "inventory.stock-management",
      "wcms.media-import-publication",
      "discovery.search-indexing",
      "promotion.campaigns-coupon-issuance",
      "cart.customer-intent-calculation",
      "digital.purchase-delivery-reveal"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/apparelProductDocumentationComponentData.js",
    "sourceChecksum": "59860cbb0260d50691beb82acc66086366d3dfb3594f953ded075afc999a0279",
    "sourceWordCount": 2700,
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
    "wordCount": 2700,
    "sourceEvidence": [
      "../../../../../nodics.docs/data/manifest.json",
      "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "../../../../../../nodics.kickoff/modules/agora.apparel/data/sample-v001/commerce/headers/agoraApparelCatalogHeader.js",
      "../../../../../../nodics.kickoff/modules/agora.apparel/data/sample-v001/content/headers/agoraApparelContentHeader.js",
      "../../../../../../nodics.kickoff/modules/agora.apparel/data/sample-v001/content/assets/agora-cms-media/assetManifest.js",
      "../../../../../nodics.commerce/modules/baseCommerce/modules/product/src/schemas/schemas.js",
      "../../../../../nodics.foundation/modules/nData/nImport/import/src/service/media/defaultMediaReleaseAssetHydrationService.js",
      "../../../../../nodics.wcms/modules/media/src/service/publication/defaultMediaPublicationTransferService.js",
      "package.json",
      "src/schemas",
      "src/service",
      "../../../../../nodics.commerce/modules/baseCommerce/modules/inventory/src/service/defaultInventoryOpeningReceiptService.js",
      "../../../../../nodics.commerce/modules/baseCommerce/modules/inventory/llm/contracts/opening-receipts.md"
    ]
  }
};
