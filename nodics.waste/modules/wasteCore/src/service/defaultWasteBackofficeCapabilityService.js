/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCore/src/service/defaultWasteBackofficeCapabilityService @description Publishes Waste-owned BackOffice capability metadata for Axis discovery. @layer service @owner wasteCore @override Partner projects may add later capability providers without moving Waste framework ownership. */
module.exports = {
    /** Registers Waste as a concrete BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('wasteCore', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the common Sustainability Operations navigation group. */
    group: function () {
        return { id: 'sustainability-operations', label: 'Sustainability Operations', order: 1400 };
    },
    /** Returns the common Waste schema workbench presentation guards. */
    presentation: function (columns, extras) {
        return Object.assign({
            defaultColumns: columns || ['code', 'status', 'revision'],
            hiddenFields: ['correlationId', 'idempotencyKey', 'metadata'],
            forbiddenFields: ['tenant', 'tenantCode', 'enterpriseCode', 'rewardFormula', 'couponCode', 'couponToken', 'couponSecret', 'price', 'paymentAmount', 'bidRules', 'walletBalance', 'ledgerEntries', 'mapProvider', 'vendorCode', 'recyclerAdapter', 'logisticsAdapter', 'trackingNumber', 'carrierCode', 'certificateNumber']
        }, extras || {});
    },
    /** Builds one Waste-owned schema workbench navigation node. */
    entry: function (options) {
        return SERVICE.DefaultBackofficeCapabilityDefinitionService.workbench(Object.assign({
            icon: 'waste',
            permission: 'waste.backoffice.view',
            group: this.group(),
            perspectives: ['operations', 'business'],
            contexts: ['environment', 'tenant'],
            featureState: 'ACTIVE'
        }, options));
    },
    /** Returns the Waste BackOffice capability contract. */
    getCapability: function () {
        const d = SERVICE.DefaultBackofficeCapabilityDefinitionService;
        return Object.assign(d.capability({
            capabilityId: 'waste-management',
            displayName: 'Waste Management',
            category: 'sustainability',
            icon: 'waste',
            navigation: [
                this.entry({
                    id: 'waste-management',
                    label: 'Waste Workspace',
                    route: '/waste',
                    moduleName: 'wasteCore',
                    schemaName: 'wasteLifecyclePolicy',
                    order: 1400,
                    summary: 'Operate reusable waste taxonomy, collection eligibility, submissions, verification, receipts, impact, movement, and compliance evidence.',
                    presentation: this.presentation(['code', 'ownerModule', 'lifecycleType', 'status', 'revision'])
                }),
                this.entry({
                    id: 'waste-taxonomy',
                    parentId: 'waste-management',
                    parentModuleName: 'wasteCore',
                    label: 'Taxonomy and Materials',
                    route: '/waste/taxonomy',
                    moduleName: 'wasteMaterial',
                    schemaName: 'wasteCategory',
                    order: 1410,
                    summary: 'Review schema-driven families, categories, item types, material types, condition grades, and evidence policies.',
                    presentation: this.presentation(['code', 'familyCode', 'name', 'status', 'revision'])
                }),
                this.entry({
                    id: 'waste-families',
                    parentId: 'waste-taxonomy',
                    label: 'Families',
                    route: '/waste/taxonomy/families',
                    moduleName: 'wasteMaterial',
                    schemaName: 'wasteFamily',
                    order: 1411,
                    summary: 'Review broad reusable waste families contributed by framework, accelerators, and project overlays.',
                    presentation: this.presentation(['code', 'name', 'status', 'sortOrder', 'revision'])
                }),
                this.entry({
                    id: 'waste-categories',
                    parentId: 'waste-taxonomy',
                    label: 'Categories',
                    route: '/waste/taxonomy/categories',
                    moduleName: 'wasteMaterial',
                    schemaName: 'wasteCategory',
                    order: 1412,
                    summary: 'Review category records and their evidence, material, item type, hazard, and impact profile links.',
                    presentation: this.presentation(['code', 'familyCode', 'evidencePolicyCode', 'impactProfileCode', 'status', 'revision'])
                }),
                this.entry({
                    id: 'waste-materials',
                    parentId: 'waste-taxonomy',
                    label: 'Materials and Conditions',
                    route: '/waste/taxonomy/materials',
                    moduleName: 'wasteMaterial',
                    schemaName: 'wasteMaterialType',
                    order: 1413,
                    summary: 'Review material composition records and condition grades used by submission and acceptance policy.',
                    presentation: this.presentation(['code', 'familyCode', 'unitOfMeasure', 'hazardClass', 'status', 'revision'])
                }),
                this.entry({
                    id: 'waste-evidence-policies',
                    parentId: 'waste-taxonomy',
                    label: 'Evidence Policies',
                    route: '/waste/taxonomy/evidence-policies',
                    moduleName: 'wasteMaterial',
                    schemaName: 'wasteEvidencePolicy',
                    order: 1414,
                    summary: 'Review required evidence types, required fields, and photo-count rules by category or item type.',
                    presentation: this.presentation(['code', 'ownerModule', 'categoryCode', 'itemTypeCode', 'status', 'revision'])
                }),
                this.entry({
                    id: 'waste-collections',
                    parentId: 'waste-management',
                    parentModuleName: 'wasteCore',
                    label: 'Collection Rules and Presets',
                    route: '/waste/collections',
                    moduleName: 'wasteCollection',
                    schemaName: 'wasteCollectionPreset',
                    order: 1420,
                    summary: 'Review collection presets, point types, acceptance rules, receipt policies, and hosted collection semantics.',
                    presentation: this.presentation(['code', 'collectionPointType', 'receiptPolicyCode', 'status', 'revision'])
                }),
                this.entry({
                    id: 'waste-acceptance-rules',
                    parentId: 'waste-collections',
                    label: 'Acceptance Rules',
                    route: '/waste/collections/acceptance-rules',
                    moduleName: 'wasteCollection',
                    schemaName: 'wasteCollectionAcceptanceRule',
                    order: 1421,
                    summary: 'Review accepted and rejected material rules for collection points, programs, families, categories, and conditions.',
                    presentation: this.presentation(['code', 'collectionPointCode', 'collectionPointType', 'familyCode', 'categoryCode', 'status', 'revision'])
                }),
                this.entry({
                    id: 'waste-submissions',
                    parentId: 'waste-management',
                    parentModuleName: 'wasteCore',
                    label: 'Submissions',
                    route: '/waste/submissions',
                    moduleName: 'wasteSubmission',
                    schemaName: 'wasteSubmission',
                    order: 1430,
                    summary: 'Review customer, operator, and API waste submissions, staged facts, confirmation state, evidence links, and lifecycle status.',
                    presentation: this.presentation(['code', 'submissionChannel', 'categoryCode', 'submissionStatus', 'statusUpdatedAt', 'revision'])
                }),
                this.entry({
                    id: 'waste-verification',
                    parentId: 'waste-management',
                    parentModuleName: 'wasteCore',
                    label: 'Verification',
                    route: '/waste/verification',
                    moduleName: 'wasteVerification',
                    schemaName: 'wasteVerification',
                    order: 1440,
                    summary: 'Review operator verification decisions, corrected facts, reason codes, and public-safe rejection reasons.',
                    presentation: this.presentation(['code', 'submissionCode', 'verificationStatus', 'verifiedCategoryCode', 'verifiedAt', 'revision'])
                }),
                this.entry({
                    id: 'waste-receipts',
                    parentId: 'waste-management',
                    parentModuleName: 'wasteCore',
                    label: 'Receipts',
                    route: '/waste/receipts',
                    moduleName: 'wasteReceipt',
                    schemaName: 'wasteReceipt',
                    order: 1450,
                    summary: 'Review physical receipt confirmation, collection point receipt facts, evidence references, and discrepancies.',
                    presentation: this.presentation(['code', 'submissionCode', 'collectionPointCode', 'receiptStatus', 'receivedAt', 'revision'])
                }),
                this.entry({
                    id: 'waste-impact',
                    parentId: 'waste-management',
                    parentModuleName: 'wasteCore',
                    label: 'Impact Profiles and Results',
                    route: '/waste/impact',
                    moduleName: 'wasteImpact',
                    schemaName: 'wasteImpactProfile',
                    order: 1460,
                    summary: 'Review impact metric definitions, reusable calculation profiles, and calculated submission or receipt impact results.',
                    presentation: this.presentation(['code', 'formulaType', 'categoryCode', 'status', 'revision'])
                }),
                this.entry({
                    id: 'waste-assets',
                    parentId: 'waste-management',
                    parentModuleName: 'wasteCore',
                    label: 'Assets and Policies',
                    route: '/waste/assets',
                    moduleName: 'wasteCore',
                    schemaName: 'wasteAsset',
                    order: 1490,
                    summary: 'Review approved waste assets, ownership events, transfer rules, marketplace eligibility, and wallet-settlement policy references.',
                    presentation: this.presentation(['code', 'assetTypeCode', 'ownerRef', 'assetStatus', 'custodyStatus', 'revision'])
                }),
                this.entry({
                    id: 'waste-asset-types',
                    parentId: 'waste-assets',
                    label: 'Asset Types',
                    route: '/waste/assets/types',
                    moduleName: 'wasteCore',
                    schemaName: 'wasteAssetType',
                    order: 1491,
                    summary: 'Review reusable asset type presets created from approved submissions and used by partner accelerators.',
                    presentation: this.presentation(['code', 'familyCode', 'categoryCode', 'status', 'revision'])
                }),
                this.entry({
                    id: 'waste-asset-creation-policies',
                    parentId: 'waste-assets',
                    label: 'Asset Creation Policies',
                    route: '/waste/assets/creation-policies',
                    moduleName: 'wasteCore',
                    schemaName: 'wasteAssetCreationPolicy',
                    order: 1492,
                    summary: 'Configure when approved submissions become customer-owned assets and how initial settlement references are prepared.',
                    presentation: this.presentation(['code', 'assetTypeCode', 'sourceStatusRequired', 'requiresEvidence', 'initialAssetStatus', 'status'])
                }),
                this.entry({
                    id: 'waste-asset-ownership-events',
                    parentId: 'waste-assets',
                    label: 'Ownership Events',
                    route: '/waste/assets/ownership-events',
                    moduleName: 'wasteCore',
                    schemaName: 'wasteAssetOwnershipEvent',
                    order: 1493,
                    summary: 'Review ownership transitions for sale, gift, redemption, donation, administrative correction, and reversal flows.',
                    presentation: this.presentation(['code', 'assetCode', 'transferType', 'transferStatus', 'occurredAt', 'revision'])
                }),
                this.entry({
                    id: 'waste-asset-marketplace-projections',
                    parentId: 'waste-assets',
                    label: 'Marketplace Projections',
                    route: '/waste/assets/marketplace-projections',
                    moduleName: 'wasteCore',
                    schemaName: 'wasteAssetMarketplaceProjection',
                    order: 1494,
                    summary: 'Review Waste asset relationships to Commerce/Product listing records without owning catalog, bidding, or order behavior.',
                    presentation: this.presentation(['code', 'assetCode', 'projectionStatus', 'listingMode', 'visibilityMode', 'revision'])
                }),
                this.entry({
                    id: 'waste-asset-transfer-policies',
                    parentId: 'waste-assets',
                    label: 'Transfer Policies',
                    route: '/waste/assets/transfer-policies',
                    moduleName: 'wasteCore',
                    schemaName: 'wasteAssetTransferPolicy',
                    order: 1495,
                    summary: 'Configure schema-driven ownership, reward, and carbon transfer behavior for sale, gift, donation, and redemption journeys.',
                    presentation: this.presentation(['code', 'transferType', 'ownershipTransferMode', 'rewardTransferMode', 'carbonTransferMode', 'status'])
                }),
                this.entry({
                    id: 'waste-marketplace-policies',
                    parentId: 'waste-assets',
                    label: 'Marketplace Policies',
                    route: '/waste/assets/marketplace-policies',
                    moduleName: 'wasteCore',
                    schemaName: 'wasteMarketplaceEligibilityPolicy',
                    order: 1496,
                    summary: 'Configure schema-driven listing eligibility and Product or Commerce projection rules for tradeable waste assets.',
                    presentation: this.presentation(['code', 'listingMode', 'visibilityMode', 'productProjectionMode', 'status', 'revision'])
                }),
                this.entry({
                    id: 'waste-reward-settlement-policies',
                    parentId: 'waste-assets',
                    label: 'Reward Settlement Policies',
                    route: '/waste/assets/reward-settlement-policies',
                    moduleName: 'wasteCore',
                    schemaName: 'wasteRewardSettlementPolicy',
                    order: 1497,
                    summary: 'Configure references for reward credit, reservation, debit, split, and reversal behavior owned by wallet or loyalty services.',
                    presentation: this.presentation(['code', 'triggerType', 'settlementMode', 'walletCurrencyCode', 'status', 'revision'])
                }),
                this.entry({
                    id: 'waste-carbon-settlement-policies',
                    parentId: 'waste-assets',
                    label: 'Carbon Settlement Policies',
                    route: '/waste/assets/carbon-settlement-policies',
                    moduleName: 'wasteCore',
                    schemaName: 'wasteCarbonSettlementPolicy',
                    order: 1498,
                    summary: 'Configure references for carbon issuance, transfer, retention, split, provenance, and reversal behavior.',
                    presentation: this.presentation(['code', 'triggerType', 'settlementMode', 'carbonUnitCode', 'status', 'revision'])
                }),
                this.entry({
                    id: 'waste-coupon-redemption-policies',
                    parentId: 'waste-assets',
                    label: 'Coupon Redemption Policies',
                    route: '/waste/assets/coupon-redemption-policies',
                    moduleName: 'wasteCore',
                    schemaName: 'wasteCouponRedemptionSettlementPolicy',
                    order: 1499,
                    summary: 'Configure how reward debits and carbon transfers are coordinated when an asset owner redeems enterprise coupons.',
                    presentation: this.presentation(['code', 'rewardDebitMode', 'carbonReceiverMode', 'entitlementMode', 'status', 'revision'])
                }),
                this.entry({
                    id: 'waste-movement',
                    parentId: 'waste-management',
                    parentModuleName: 'wasteCore',
                    label: 'Movement and Batches',
                    route: '/waste/movement',
                    moduleName: 'wasteMovement',
                    schemaName: 'wasteMovement',
                    order: 1470,
                    featureState: 'PREVIEW',
                    summary: 'Review model-ready transfer, batch, chain-of-custody, processor, recycler, and disposal movement records.',
                    presentation: this.presentation(['code', 'movementType', 'batchCode', 'movementStatus', 'revision'])
                }),
                this.entry({
                    id: 'waste-compliance',
                    parentId: 'waste-management',
                    parentModuleName: 'wasteCore',
                    label: 'Compliance Evidence',
                    route: '/waste/compliance',
                    moduleName: 'wasteCompliance',
                    schemaName: 'wasteComplianceEvidence',
                    order: 1480,
                    featureState: 'PREVIEW',
                    summary: 'Review compliance profiles, audit evidence references, public claim policy, and legal validation placeholders.',
                    presentation: this.presentation(['code', 'complianceProfileCode', 'decision', 'recordedAt', 'revision'])
                })
            ]
        }), {
            requiredPermissions: ['waste.backoffice.view'],
            discovery: {
                openApiPath: '/nodics/system/v0/contract/openapi/internal',
                contractVersion: 1
            }
        });
    }
};
