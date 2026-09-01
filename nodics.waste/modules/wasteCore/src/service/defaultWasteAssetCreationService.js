/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const UTILS = require('../utils/utils');
const SOURCE_REF = require('./defaultWasteSourceReferenceService');
const policyService = require('./defaultWasteAssetCreationPolicyService');

/** @module wasteCore/src/service/defaultWasteAssetCreationService @description Builds asset, initial ownership, audit, and outbox contracts from approved Waste submissions without executing wallet, commerce, or coupon side effects. @layer service @owner wasteCore @override Later modules may persist or publish the returned records while preserving idempotency and domain ownership boundaries. */
module.exports = {
    /** Initializes this service. */
    init: function () { return Promise.resolve(true); },

    /** Completes this service startup. */
    postInit: function () { return Promise.resolve(true); },

    /** Throws a Nodics-compatible error when available. */
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },

    /** Normalizes optional arrays. */
    array: function (value) {
        if (value === undefined || value === null) return [];
        return Array.isArray(value) ? value : [value];
    },

    /** Normalizes code components for deterministic asset numbering. */
    codePart: function (value) {
        return UTILS.normalizeCode(value).replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    },

    /** Resolves the owner reference for the approved asset. */
    ownerRef: function (request) {
        let submission = request.submission || {};
        return SOURCE_REF.normalize(request.ownerRef || submission.ownerRef || submission.customerRef || submission.submitterRef, true);
    },

    /** Resolves the asset type code from request, asset type, policy, or submission facts. */
    assetTypeCode: function (request, policy) {
        let submission = request.submission || {};
        return this.codePart(request.assetTypeCode || request.assetType && request.assetType.code || policy.assetTypeCode || submission.assetTypeCode || submission.categoryCode);
    },

    /** Returns the deterministic asset code for a submission. */
    assetCode: function (request, policy) {
        if (request.assetCode) return this.codePart(request.assetCode);
        if (policy.assetCodeStrategy === 'REQUESTED') this.fail('ERR_WASTE_ASSET_CODE_REQUIRED', 'assetCode is required by asset creation policy');
        let submissionCode = this.codePart(request.submission && request.submission.code);
        if (!submissionCode) this.fail('ERR_WASTE_SUBMISSION_CODE_REQUIRED', 'submission code is required for asset creation');
        if (policy.assetCodeStrategy === 'POLICY_PREFIX') return [this.codePart(policy.assetCodePrefix || 'WASTE_ASSET'), submissionCode].join('_');
        return ['WASTE_ASSET', submissionCode].join('_');
    },

    /** Builds wallet-owned settlement reference intents without posting ledger entries. */
    settlementRefs: function (kind, assetCode, ownerRef, policyCode, context) {
        if (!policyCode) return [];
        return [{
            module: 'wallet',
            schema: kind === 'reward' ? 'rewardSettlementIntent' : 'carbonSettlementIntent',
            code: [assetCode, kind === 'reward' ? 'REWARD' : 'CARBON', 'SETTLEMENT'].join('_'),
            policyCode: policyCode,
            ownerRef: ownerRef,
            state: 'REQUESTED',
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey
        }];
    },

    /** Builds a framework audit entry for later audit persistence. */
    auditEvent: function (eventType, outcome, subjectCode, context) {
        return {
            eventType: eventType,
            outcome: outcome,
            moduleName: 'wasteCore',
            subjectCode: subjectCode,
            principalRef: context.principalRef,
            correlationId: context.correlationId,
            occurredAt: context.now
        };
    },

    /** Builds a domain event for a later outbox/event-bus publisher. */
    domainEvent: function (eventType, payload, context) {
        return {
            eventType: eventType,
            aggregateType: 'wasteAsset',
            aggregateCode: payload.assetCode,
            payload: payload,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            occurredAt: context.now
        };
    },

    /** Creates an asset contract from an approved submission. */
    createFromApprovedSubmission: function (request) {
        request = request || {};
        let evaluation = policyService.assertEligible(request);
        if (evaluation.existingAsset && evaluation.policy.duplicateStrategy === 'RETURN_EXISTING') {
            return {
                idempotent: true,
                asset: evaluation.existingAsset,
                ownershipEvent: request.existingOwnershipEvent,
                settlementReferences: {
                    reward: this.array(evaluation.existingAsset.rewardSettlementRefs),
                    carbon: this.array(evaluation.existingAsset.carbonSettlementRefs)
                },
                auditEvents: [],
                domainEvents: []
            };
        }

        let policy = evaluation.policy;
        let submission = request.submission || {};
        let now = request.now || new Date();
        let context = {
            now: now,
            correlationId: request.correlationId || submission.correlationId,
            idempotencyKey: request.idempotencyKey || submission.idempotencyKey,
            principalRef: request.principalRef
        };
        let ownerRef = this.ownerRef(request);
        let assetCode = this.assetCode(request, policy);
        let assetTypeCode = this.assetTypeCode(request, policy);
        if (!assetTypeCode) this.fail('ERR_WASTE_ASSET_TYPE_REQUIRED', 'assetTypeCode is required for asset creation');
        let rewardSettlementRefs = this.settlementRefs('reward', assetCode, ownerRef, policy.rewardSettlementPolicyCode, context);
        let carbonSettlementRefs = this.settlementRefs('carbon', assetCode, ownerRef, policy.carbonSettlementPolicyCode, context);
        let settlementFailed = !!request.settlementReferenceError;
        if (settlementFailed && policy.settlementReferenceFailureMode === 'STOP_CREATION') {
            this.fail('ERR_WASTE_ASSET_SETTLEMENT_REFERENCE_FAILED', 'settlement references could not be prepared');
        }
        let assetStatus = settlementFailed && policy.settlementReferenceFailureMode === 'LOCK_ASSET' ? 'LOCKED' : policy.initialAssetStatus;
        let asset = UTILS.persistenceModel({
            code: assetCode,
            assetTypeCode: assetTypeCode,
            sourceSubmissionCode: submission.code,
            sourceCategoryCode: submission.categoryCode,
            sourceItemTypeCode: submission.itemTypeCode,
            ownerRef: ownerRef,
            originalOwnerRef: ownerRef,
            physicalOwnerRef: request.physicalOwnerRef,
            digitalOwnerRef: request.digitalOwnerRef || ownerRef,
            verificationRef: SOURCE_REF.normalize(request.verificationRef, false) || SOURCE_REF.normalize({
                module: 'wasteVerification',
                schema: 'wasteVerification',
                code: request.verification && request.verification.code || submission.verificationCode || submission.code
            }, true),
            receiptRef: request.receiptRef || submission.receiptRef,
            impactRef: request.impactRef || submission.impactRef,
            evidenceRefs: this.array(request.evidenceRefs || submission.evidenceRefs),
            custodyStatus: policy.initialCustodyStatus,
            assetStatus: assetStatus,
            rewardSettlementRefs: rewardSettlementRefs,
            carbonSettlementRefs: carbonSettlementRefs,
            marketplaceProjectionRef: request.marketplaceProjectionRef,
            couponEntitlementRefs: [],
            lockRef: assetStatus === 'LOCKED' ? { reasonCode: 'SETTLEMENT_REFERENCE_FAILED', message: request.settlementReferenceError } : undefined,
            policyContextRef: { module: 'wasteCore', schema: 'wasteAssetCreationPolicy', code: policy.code },
            sourceContext: {
                submissionChannel: submission.submissionChannel,
                collectionPointCode: submission.collectionPointCode
            },
            createdAt: now,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            revision: 0
        });
        let ownershipEvent = UTILS.persistenceModel({
            code: [assetCode, 'OWNERSHIP_CREATE'].join('_'),
            assetCode: assetCode,
            toOwnerRef: ownerRef,
            transferType: 'CREATE',
            transferStatus: assetStatus === 'LOCKED' ? 'RESERVED' : 'COMPLETED',
            policyCode: policy.code,
            triggerRef: { module: 'wasteSubmission', schema: 'wasteSubmission', code: submission.code },
            rewardSettlementRefs: rewardSettlementRefs,
            carbonSettlementRefs: carbonSettlementRefs,
            evidenceRefs: asset.evidenceRefs,
            occurredAt: now,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            revision: 0
        });
        return {
            idempotent: false,
            asset: asset,
            ownershipEvent: ownershipEvent,
            settlementReferences: { reward: rewardSettlementRefs, carbon: carbonSettlementRefs },
            auditEvents: [
                this.auditEvent('waste.asset.creation', 'completed', assetCode, context),
                this.auditEvent('waste.asset.ownership.create', ownershipEvent.transferStatus.toLowerCase(), ownershipEvent.code, context)
            ],
            domainEvents: [
                this.domainEvent('waste.asset.created', { assetCode: assetCode, ownerRef: ownerRef, assetStatus: assetStatus }, context),
                this.domainEvent(ownershipEvent.transferStatus === 'COMPLETED' ? 'waste.asset.ownership.completed' : 'waste.asset.ownership.reserved', { assetCode: assetCode, ownerRef: ownerRef, ownershipEventCode: ownershipEvent.code }, context),
                this.domainEvent('waste.asset.settlement.requested', { assetCode: assetCode, rewardSettlementRefs: rewardSettlementRefs, carbonSettlementRefs: carbonSettlementRefs }, context)
            ]
        };
    },

    /** Filters already-loaded asset records for the current owner. */
    ownedAssets: function (request) {
        request = request || {};
        let ownerRef = SOURCE_REF.normalize(request.ownerRef || request.authOwnerRef, true);
        return this.array(request.assets).filter(function (asset) {
            return asset && asset.ownerRef &&
                asset.ownerRef.module === ownerRef.module &&
                asset.ownerRef.schema === ownerRef.schema &&
                asset.ownerRef.code === ownerRef.code;
        });
    }
};
