/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module wasteCore/data/backoffice/wasteCoreBackofficeCapabilityData @description Waste Axis capability and navigation metadata linked through active module registration. @layer data @owner wasteCore */
module.exports = {
  capability: {
    capabilityId: "waste-management",
    displayName: "Waste Management",
    category: "sustainability",
    icon: "waste",
    requiredPermissions: ["waste.backoffice.view"],
    discovery: {
      openApiPath: "/nodics/system/v0/contract/openapi/internal",
      contractVersion: 1,
    },
  },
  defaults: {
    icon: "waste",
    permission: "waste.backoffice.view",
    group: {
      id: "sustainability-operations",
      label: "Sustainability Operations",
      order: 1400,
    },
    perspectives: ["operations", "business"],
    contexts: ["environment", "tenant"],
    featureState: "ACTIVE",
    presentation: {
      defaultColumns: ["code", "status", "revision"],
      hiddenFields: ["correlationId", "idempotencyKey", "metadata"],
      forbiddenFields: [
        "tenant",
        "tenantCode",
        "enterpriseCode",
        "rewardFormula",
        "couponCode",
        "couponToken",
        "couponSecret",
        "price",
        "paymentAmount",
        "bidRules",
        "walletBalance",
        "ledgerEntries",
        "mapProvider",
        "vendorCode",
        "recyclerAdapter",
        "logisticsAdapter",
        "trackingNumber",
        "carrierCode",
        "certificateNumber",
      ],
    },
  },
  navigation: [
    {
      id: "waste-management",
      label: "Waste Configuration",
      route: "/waste",
      moduleName: "wasteCore",
      schemaName: "wasteLifecyclePolicy",
      order: 1400,
      summary:
        "Operate reusable waste taxonomy, collection eligibility, submissions, verification, receipts, impact, movement, and compliance evidence.",
      presentation: {
        defaultColumns: [
          "code",
          "ownerModule",
          "lifecycleType",
          "status",
          "revision",
        ],
      },
    },
    {
      id: "waste-taxonomy",
      parentId: "waste-management",
      parentModuleName: "wasteCore",
      label: "Taxonomy and Materials",
      route: "/waste/taxonomy",
      moduleName: "wasteMaterial",
      schemaName: "wasteCategory",
      order: 1410,
      summary:
        "Review schema-driven families, categories, item types, material types, condition grades, and evidence policies.",
      presentation: {
        defaultColumns: ["code", "familyCode", "name", "status", "revision"],
      },
    },
    {
      id: "waste-families",
      parentId: "waste-taxonomy",
      label: "Families",
      route: "/waste/taxonomy/families",
      moduleName: "wasteMaterial",
      schemaName: "wasteFamily",
      order: 1411,
      summary:
        "Review broad reusable waste families contributed by framework, accelerators, and project overlays.",
      presentation: {
        defaultColumns: ["code", "name", "status", "sortOrder", "revision"],
      },
    },
    {
      id: "waste-categories",
      parentId: "waste-taxonomy",
      label: "Categories",
      route: "/waste/taxonomy/categories",
      moduleName: "wasteMaterial",
      schemaName: "wasteCategory",
      order: 1412,
      summary:
        "Review category records and their evidence, material, item type, hazard, and impact profile links.",
      presentation: {
        defaultColumns: [
          "code",
          "familyCode",
          "evidencePolicyCode",
          "impactProfileCode",
          "status",
          "revision",
        ],
      },
    },
    {
      id: "waste-materials",
      parentId: "waste-taxonomy",
      label: "Materials and Conditions",
      route: "/waste/taxonomy/materials",
      moduleName: "wasteMaterial",
      schemaName: "wasteMaterialType",
      order: 1413,
      summary:
        "Review material composition records and condition grades used by submission and acceptance policy.",
      presentation: {
        defaultColumns: [
          "code",
          "familyCode",
          "unitOfMeasure",
          "hazardClass",
          "status",
          "revision",
        ],
      },
    },
    {
      id: "waste-evidence-policies",
      parentId: "waste-taxonomy",
      label: "Evidence Policies",
      route: "/waste/taxonomy/evidence-policies",
      moduleName: "wasteMaterial",
      schemaName: "wasteEvidencePolicy",
      order: 1414,
      summary:
        "Review required evidence types, required fields, and photo-count rules by category or item type.",
      presentation: {
        defaultColumns: [
          "code",
          "ownerModule",
          "categoryCode",
          "itemTypeCode",
          "status",
          "revision",
        ],
      },
    },
    {
      id: "waste-collections",
      parentId: "waste-management",
      parentModuleName: "wasteCore",
      label: "Collection Rules and Presets",
      route: "/waste/collections",
      moduleName: "wasteCollection",
      schemaName: "wasteCollectionPreset",
      order: 1420,
      summary:
        "Review collection presets, point types, acceptance rules, receipt policies, and hosted collection semantics.",
      presentation: {
        defaultColumns: [
          "code",
          "collectionPointType",
          "receiptPolicyCode",
          "status",
          "revision",
        ],
      },
    },
    {
      id: "waste-collection-centres",
      parentId: "waste-collections",
      parentModuleName: "wasteCore",
      label: "Collection Centres",
      route: "/waste/collection-centres",
      moduleName: "wasteCollection",
      schemaName: "wasteCollectionPoint",
      order: 1422,
      summary:
        "Review operator-linked collection centres with Location coordinates and Profile address references.",
      presentation: {
        defaultColumns: [
          "code",
          "name",
          "collectionPointType",
          "locationRef",
          "operatorEnterpriseRef",
          "operatingStatus",
          "publicVisibility",
          "status",
        ],
      },
    },
    {
      id: "waste-acceptance-rules",
      parentId: "waste-collections",
      label: "Acceptance Rules",
      route: "/waste/collections/acceptance-rules",
      moduleName: "wasteCollection",
      schemaName: "wasteCollectionAcceptanceRule",
      order: 1421,
      summary:
        "Review accepted and rejected material rules for collection points, programs, families, categories, and conditions.",
      presentation: {
        defaultColumns: [
          "code",
          "collectionPointCode",
          "collectionPointType",
          "familyCode",
          "categoryCode",
          "status",
          "revision",
        ],
      },
    },
    {
      id: "waste-submissions",
      parentId: "waste-management",
      parentModuleName: "wasteCore",
      label: "Submissions",
      route: "/waste/submissions",
      moduleName: "wasteSubmission",
      schemaName: "wasteSubmission",
      order: 1430,
      summary:
        "Review customer, operator, and API waste submissions, staged facts, confirmation state, evidence links, and lifecycle status.",
      presentation: {
        defaultColumns: [
          "code",
          "submissionChannel",
          "categoryCode",
          "submissionStatus",
          "statusUpdatedAt",
          "revision",
        ],
      },
    },
    {
      id: "waste-verification",
      parentId: "waste-management",
      parentModuleName: "wasteCore",
      label: "Verification",
      route: "/waste/verification",
      moduleName: "wasteVerification",
      schemaName: "wasteVerification",
      order: 1440,
      summary:
        "Review operator verification decisions, corrected facts, reason codes, and public-safe rejection reasons.",
      presentation: {
        defaultColumns: [
          "code",
          "submissionCode",
          "verificationStatus",
          "verifiedCategoryCode",
          "verifiedAt",
          "revision",
        ],
      },
    },
    {
      id: "waste-receipts",
      parentId: "waste-management",
      parentModuleName: "wasteCore",
      label: "Receipts",
      route: "/waste/receipts",
      moduleName: "wasteReceipt",
      schemaName: "wasteReceipt",
      order: 1450,
      summary:
        "Review physical receipt confirmation, collection point receipt facts, evidence references, and discrepancies.",
      presentation: {
        defaultColumns: [
          "code",
          "submissionCode",
          "collectionPointCode",
          "receiptStatus",
          "receivedAt",
          "revision",
        ],
      },
    },
    {
      id: "waste-impact",
      parentId: "waste-management",
      parentModuleName: "wasteCore",
      label: "Impact Profiles and Results",
      route: "/waste/impact",
      moduleName: "wasteImpact",
      schemaName: "wasteImpactProfile",
      order: 1460,
      summary:
        "Review impact metric definitions, reusable calculation profiles, and calculated submission or receipt impact results.",
      presentation: {
        defaultColumns: [
          "code",
          "formulaType",
          "categoryCode",
          "status",
          "revision",
        ],
      },
    },
    {
      id: "waste-assets",
      parentId: "waste-management",
      parentModuleName: "wasteCore",
      label: "Asset Configuration",
      route: "/waste/asset-configuration",
      moduleName: "wasteCore",
      schemaName: "wasteAsset",
      order: 1490,
      summary:
        "Review approved waste assets, ownership events, transfer rules, marketplace eligibility, and wallet-settlement policy references.",
      presentation: {
        defaultColumns: [
          "code",
          "assetTypeCode",
          "ownerRef",
          "assetStatus",
          "custodyStatus",
          "revision",
        ],
      },
    },
    {
      id: "waste-asset-types",
      parentId: "waste-assets",
      label: "Asset Types",
      route: "/waste/assets/types",
      moduleName: "wasteCore",
      schemaName: "wasteAssetType",
      order: 1491,
      summary:
        "Review reusable asset type presets created from approved submissions and used by partner accelerators.",
      presentation: {
        defaultColumns: [
          "code",
          "familyCode",
          "categoryCode",
          "status",
          "revision",
        ],
      },
    },
    {
      id: "waste-asset-creation-policies",
      parentId: "waste-assets",
      label: "Asset Creation Policies",
      route: "/waste/assets/creation-policies",
      moduleName: "wasteCore",
      schemaName: "wasteAssetCreationPolicy",
      order: 1492,
      summary:
        "Configure when approved submissions become customer-owned assets and how initial settlement references are prepared.",
      presentation: {
        defaultColumns: [
          "code",
          "assetTypeCode",
          "sourceStatusRequired",
          "requiresEvidence",
          "initialAssetStatus",
          "status",
        ],
      },
    },
    {
      id: "waste-asset-ownership-events",
      parentId: "waste-assets",
      label: "Ownership Events",
      route: "/waste/assets/ownership-events",
      moduleName: "wasteCore",
      schemaName: "wasteAssetOwnershipEvent",
      order: 1493,
      summary:
        "Review ownership transitions for sale, gift, redemption, donation, administrative correction, and reversal flows.",
      presentation: {
        defaultColumns: [
          "code",
          "assetCode",
          "transferType",
          "transferStatus",
          "occurredAt",
          "revision",
        ],
      },
    },
    {
      id: "waste-asset-marketplace-projections",
      parentId: "waste-assets",
      label: "Marketplace Projections",
      route: "/waste/assets/marketplace-projections",
      moduleName: "wasteCore",
      schemaName: "wasteAssetMarketplaceProjection",
      order: 1494,
      summary:
        "Review Waste asset relationships to Commerce/Product listing records without owning catalog, bidding, or order behavior.",
      presentation: {
        defaultColumns: [
          "code",
          "assetCode",
          "projectionStatus",
          "listingMode",
          "visibilityMode",
          "revision",
        ],
      },
    },
    {
      id: "waste-asset-transfer-policies",
      parentId: "waste-assets",
      label: "Transfer Policies",
      route: "/waste/assets/transfer-policies",
      moduleName: "wasteCore",
      schemaName: "wasteAssetTransferPolicy",
      order: 1495,
      summary:
        "Configure schema-driven ownership, reward, and carbon transfer behavior for sale, gift, donation, and redemption journeys.",
      presentation: {
        defaultColumns: [
          "code",
          "transferType",
          "ownershipTransferMode",
          "rewardTransferMode",
          "carbonTransferMode",
          "status",
        ],
      },
    },
    {
      id: "waste-marketplace-policies",
      parentId: "waste-assets",
      label: "Marketplace Policies",
      route: "/waste/assets/marketplace-policies",
      moduleName: "wasteCore",
      schemaName: "wasteMarketplaceEligibilityPolicy",
      order: 1496,
      summary:
        "Configure schema-driven listing eligibility and Product or Commerce projection rules for tradeable waste assets.",
      presentation: {
        defaultColumns: [
          "code",
          "listingMode",
          "visibilityMode",
          "productProjectionMode",
          "status",
          "revision",
        ],
      },
    },
    {
      id: "waste-reward-settlement-policies",
      parentId: "waste-assets",
      label: "Reward Settlement Policies",
      route: "/waste/assets/reward-settlement-policies",
      moduleName: "wasteCore",
      schemaName: "wasteRewardSettlementPolicy",
      order: 1497,
      summary:
        "Configure references for reward credit, reservation, debit, split, and reversal behavior owned by wallet or loyalty services.",
      presentation: {
        defaultColumns: [
          "code",
          "triggerType",
          "settlementMode",
          "walletCurrencyCode",
          "status",
          "revision",
        ],
      },
    },
    {
      id: "waste-carbon-settlement-policies",
      parentId: "waste-assets",
      label: "Carbon Settlement Policies",
      route: "/waste/assets/carbon-settlement-policies",
      moduleName: "wasteCore",
      schemaName: "wasteCarbonSettlementPolicy",
      order: 1498,
      summary:
        "Configure references for carbon issuance, transfer, retention, split, provenance, and reversal behavior.",
      presentation: {
        defaultColumns: [
          "code",
          "triggerType",
          "settlementMode",
          "carbonUnitCode",
          "status",
          "revision",
        ],
      },
    },
    {
      id: "waste-coupon-redemption-policies",
      parentId: "waste-assets",
      label: "Coupon Redemption Policies",
      route: "/waste/assets/coupon-redemption-policies",
      moduleName: "wasteCore",
      schemaName: "wasteCouponRedemptionSettlementPolicy",
      order: 1499,
      summary:
        "Configure how reward debits and carbon transfers are coordinated when an asset owner redeems enterprise coupons.",
      presentation: {
        defaultColumns: [
          "code",
          "rewardDebitMode",
          "carbonReceiverMode",
          "entitlementMode",
          "status",
          "revision",
        ],
      },
    },
    {
      id: "waste-movement",
      parentId: "waste-management",
      parentModuleName: "wasteCore",
      label: "Movement and Batches",
      route: "/waste/movement",
      moduleName: "wasteMovement",
      schemaName: "wasteMovement",
      order: 1470,
      featureState: "PREVIEW",
      summary:
        "Review model-ready transfer, batch, chain-of-custody, processor, recycler, and disposal movement records.",
      presentation: {
        defaultColumns: [
          "code",
          "movementType",
          "batchCode",
          "movementStatus",
          "revision",
        ],
      },
    },
    {
      id: "waste-compliance",
      parentId: "waste-management",
      parentModuleName: "wasteCore",
      label: "Compliance Evidence",
      route: "/waste/compliance",
      moduleName: "wasteCompliance",
      schemaName: "wasteComplianceEvidence",
      order: 1480,
      featureState: "PREVIEW",
      summary:
        "Review compliance profiles, audit evidence references, public claim policy, and legal validation placeholders.",
      presentation: {
        defaultColumns: [
          "code",
          "complianceProfileCode",
          "decision",
          "recordedAt",
          "revision",
        ],
      },
    },
    {
      id: "waste-operations",
      label: "Waste Management",
      route: "/waste/assets",
      order: 1300,
      requiredPermissions: ["waste.backoffice.view"],
      backendWorkspace: {
        contractVersion: 1,
        renderer: "axis.workspace.native",
        workspaceCode: "waste.review",
        viewCode: "waste.overview",
        title: "Waste Management",
      },
      summary:
        "Understand all authorized waste submissions and open their review queues.",
    },
    {
      id: "waste-operations-submissions",
      parentId: "waste-operations",
      label: "All submissions",
      route: "/waste/assets/submissions",
      order: 20,
      requiredPermissions: ["waste.backoffice.view"],
      backendWorkspace: {
        contractVersion: 1,
        renderer: "axis.workspace.native",
        workspaceCode: "waste.review",
        viewCode: "waste.submissions",
        title: "All submissions",
      },
      summary:
        "Browse all authorized Waste submissions and their full details.",
    },
    {
      id: "waste-operations-review-queue",
      parentId: "waste-operations",
      label: "Review queue",
      route: "/waste/assets/review-queue",
      order: 30,
      requiredPermissions: ["waste.backoffice.view"],
      backendWorkspace: {
        contractVersion: 1,
        renderer: "axis.workspace.native",
        workspaceCode: "waste.review",
        viewCode: "waste.reviewQueue",
        title: "Waste review queue",
      },
      summary: "Review Waste submissions awaiting an independent decision.",
    },
  ],
};
