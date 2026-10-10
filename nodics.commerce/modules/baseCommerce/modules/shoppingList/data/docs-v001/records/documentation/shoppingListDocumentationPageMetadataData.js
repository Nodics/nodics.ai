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
    "code": "nodicsDocsMetadatacommerceShoppingListCommerceBoundary",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.shopping-list-commerce-boundary",
    "title": "Shopping List Commerce Boundary",
    "summary": "Why wishlist, compare, and save-for-later belong to Commerce while Profile remains the identity authority.",
    "businessSummary": "Shopping List Commerce Boundary explains the business purpose, supported decisions, operational impact, and controls for the Customer Data and Identity journey.",
    "technicalSummary": "Shopping List Commerce Boundary has canonical documentation records in shoppingList at data/docs-v001/records/documentation/shoppingListDocumentationComponentData.js, with functional visibility under nodics.commerce. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "shoppingList",
    "targetPage": "nodicsDocsPagecommerceShoppingListCommerceBoundary",
    "targetRoute": "nodicsDocsRoutecommerceShoppingListCommerceBoundary",
    "articleComponent": "nodicsDocsComponentcommerceShoppingListCommerceBoundary",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommerceshoppinglistcommerceboundary",
    "headings": [
      {
        "text": "Source map",
        "anchor": "commerceShoppingListCommerceBoundary-1-source-map",
        "level": 2
      },
      {
        "text": "Ownership model",
        "anchor": "commerceShoppingListCommerceBoundary-2-ownership-model",
        "level": 2
      },
      {
        "text": "Contract",
        "anchor": "commerceShoppingListCommerceBoundary-3-contract",
        "level": 2
      },
      {
        "text": "Business configuration guidance",
        "anchor": "commerceShoppingListCommerceBoundary-4-business-configuration-guidance",
        "level": 2
      },
      {
        "text": "Developer extension guidance",
        "anchor": "commerceShoppingListCommerceBoundary-5-developer-extension-guidance",
        "level": 2
      },
      {
        "text": "Extending product-keeping journeys",
        "anchor": "commerceShoppingListCommerceBoundary-6-extending-product-keeping-journeys",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commerceShoppingListCommerceBoundary-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Migration principle",
        "anchor": "commerceShoppingListCommerceBoundary-8-migration-principle",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commerceShoppingListCommerceBoundary-9-verification",
        "level": 2
      },
      {
        "text": "Store context and upgrade behavior",
        "anchor": "commerceShoppingListCommerceBoundary-10-store-context-and-upgrade-behavior",
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
      },
      {
        "kind": "table",
        "title": "Use case, Suggested list type, Why it fits Shopping List"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "security.identity-access-governance",
      "commerce.cart-order",
      "commerce.payment-provider-boundaries"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/shoppingListDocumentationComponentData.js",
    "sourceChecksum": "c5fd0b2e73214eb1c7c71a7bf330114ff8fd28e5d70e551892b1a75e0dfeffb5",
    "sourceWordCount": 1210,
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
    "wordCount": 1210,
    "sourceEvidence": [
      "../../../../../nodics.docs/data/manifest.json",
      "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/router/routers.js",
      "src/service/defaultShoppingListOperationService.js",
      "../../package.json",
      "../../../../../nodics.platform/modules/profile/data/init-v001/records/groups/defaultBootstrapUserGroupsData.js",
      "src/schemas",
      "src/service"
    ]
  }
};
