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

/** @module wasteCore/src/service/defaultWasteAssetMarketplaceProjectionService @description Builds the Waste Asset to Commerce/Product projection contract without owning catalog, bidding, order, or payment behavior. @layer service @owner wasteCore @override Commerce/Product modules create and own the referenced listing objects. */
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

    /** Normalizes code components for deterministic relationship numbering. */
    codePart: function (value) {
        return UTILS.normalizeCode(value).replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    },

    /** Returns the default marketplace projection policy. */
    defaultPolicy: function () {
        return {
            code: 'WASTE_MARKETPLACE_PROJECTION_STANDARD',
            eligibleAssetStatuses: ['OWNED'],
            eligibleCustodyStatuses: [],
            listingMode: 'BIDDING',
            visibilityMode: 'PUBLIC_MARKETPLACE',
            valuationMode: 'MANUAL',
            productProjectionMode: 'COMMERCE_LISTING',
            requiresComplianceReview: false,
            transferPolicyCode: undefined,
            rewardSettlementPolicyCode: undefined,
            carbonSettlementPolicyCode: undefined
        };
    },

    /** Returns a single effective policy record. */
    resolvePolicy: function (request) {
        request = request || {};
        return Object.assign({}, this.defaultPolicy(), request.policy || request.marketplacePolicy || {});
    },

    /** Compares two normalized source references. */
    sameRef: function (left, right) {
        return !!left && !!right && left.module === right.module && left.schema === right.schema && left.code === right.code;
    },

    /** Validates that the caller owns the Waste asset being listed. */
    assertOwner: function (asset, ownerRef) {
        let normalizedOwner = SOURCE_REF.normalize(ownerRef, true);
        let assetOwner = SOURCE_REF.normalize(asset && asset.ownerRef, true);
        if (!this.sameRef(assetOwner, normalizedOwner)) this.fail('ERR_WASTE_ASSET_OWNER_REQUIRED', 'current owner must initiate marketplace projection');
        return normalizedOwner;
    },

    /** Evaluates marketplace eligibility without resolving Commerce/Product records. */
    evaluate: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let policy = this.resolvePolicy(request);
        let missingRequirements = [];
        if (!asset.code) missingRequirements.push('asset.code');
        if (policy.productProjectionMode === 'NONE') missingRequirements.push('productProjectionMode');
        if (policy.listingMode === 'DISABLED') missingRequirements.push('listingMode');
        if (this.array(policy.eligibleAssetStatuses).map(this.codePart, this).indexOf(this.codePart(asset.assetStatus)) < 0) {
            missingRequirements.push('assetStatus');
        }
        let eligibleCustodyStatuses = this.array(policy.eligibleCustodyStatuses);
        if (eligibleCustodyStatuses.length && eligibleCustodyStatuses.map(this.codePart, this).indexOf(this.codePart(asset.custodyStatus)) < 0) {
            missingRequirements.push('custodyStatus');
        }
        if (policy.requiresComplianceReview && !(request.complianceRef || request.complianceDecision === 'APPROVED')) {
            missingRequirements.push('complianceReview');
        }
        return {
            eligible: missingRequirements.length === 0,
            reasonCode: missingRequirements.length ? 'WASTE_MARKETPLACE_PROJECTION_REQUIREMENTS_MISSING' : 'WASTE_MARKETPLACE_PROJECTION_ALLOWED',
            policyCode: policy.code,
            policy: policy,
            missingRequirements: missingRequirements
        };
    },

    /** Requires a Waste asset to pass marketplace eligibility. */
    assertEligible: function (request) {
        let evaluation = this.evaluate(request);
        if (!evaluation.eligible) {
            this.fail('ERR_WASTE_MARKETPLACE_PROJECTION_NOT_ALLOWED', evaluation.missingRequirements.join(', ') || 'marketplace projection is not allowed');
        }
        return evaluation;
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

    /** Builds the Product/Commerce projection request from an owned Waste asset. */
    requestProjection: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let ownerRef = this.assertOwner(asset, request.ownerRef || request.authOwnerRef);
        let now = request.now || new Date();
        let context = {
            now: now,
            correlationId: request.correlationId || asset.correlationId,
            idempotencyKey: request.idempotencyKey || asset.idempotencyKey,
            principalRef: request.principalRef
        };
        let projectionCode = this.codePart(request.projectionCode || ['WASTE_MARKETPLACE_PROJECTION', asset.code].join('_'));
        if (request.existingProjection && request.existingProjection.assetCode === asset.code) {
            return {
                idempotent: true,
                asset: asset,
                projection: request.existingProjection,
                commerceProjectionRequest: undefined,
                auditEvents: [],
                domainEvents: []
            };
        }
        let evaluation = this.assertEligible(request);
        let policy = evaluation.policy;
        let projectionRef = { module: 'wasteCore', schema: 'wasteAssetMarketplaceProjection', code: projectionCode };
        let projection = UTILS.persistenceModel({
            code: projectionCode,
            assetCode: asset.code,
            ownerRef: ownerRef,
            policyCode: policy.code,
            projectionStatus: 'REQUESTED',
            listingMode: policy.listingMode,
            visibilityMode: policy.visibilityMode,
            productProjectionMode: policy.productProjectionMode,
            transferPolicyCode: request.transferPolicyCode || policy.transferPolicyCode || asset.defaultTransferPolicyCode,
            rewardSettlementPolicyCode: request.rewardSettlementPolicyCode || policy.rewardSettlementPolicyCode,
            carbonSettlementPolicyCode: request.carbonSettlementPolicyCode || policy.carbonSettlementPolicyCode,
            evidenceRefs: this.array(request.evidenceRefs || asset.evidenceRefs),
            listingFacts: Object.assign({}, request.listingFacts || {}),
            requestedAt: now,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            revision: 0
        });
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, {
            assetStatus: 'LISTING_REQUESTED',
            marketplaceProjectionRef: projectionRef,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            revision: Number(asset.revision || 0) + 1
        }));
        let commerceProjectionRequest = {
            assetRef: { module: 'wasteCore', schema: 'wasteAsset', code: asset.code },
            ownerRef: ownerRef,
            projectionRef: projectionRef,
            projectionMode: policy.productProjectionMode,
            listingMode: policy.listingMode,
            visibilityMode: policy.visibilityMode,
            valuationMode: policy.valuationMode,
            title: projection.listingFacts.title,
            description: projection.listingFacts.description,
            evidenceRefs: projection.evidenceRefs,
            transferPolicyCode: projection.transferPolicyCode,
            rewardSettlementPolicyCode: projection.rewardSettlementPolicyCode,
            carbonSettlementPolicyCode: projection.carbonSettlementPolicyCode,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey
        };
        return {
            idempotent: false,
            asset: nextAsset,
            projection: projection,
            commerceProjectionRequest: commerceProjectionRequest,
            auditEvents: [this.auditEvent('waste.asset.marketplace.projection.request', 'requested', projectionCode, context)],
            domainEvents: [this.domainEvent('waste.asset.marketplace.projection.requested', { assetCode: asset.code, projectionCode: projectionCode, projectionRef: projectionRef }, context)]
        };
    },

    /** Completes the Waste side of the relationship after Commerce/Product creates the listing. */
    completeProjection: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let projection = Object.assign({}, request.projection || {});
        if (!projection.code || projection.assetCode !== asset.code) this.fail('ERR_WASTE_MARKETPLACE_PROJECTION_REQUIRED', 'matching marketplace projection is required');
        if (!request.commerceProductRef && !request.commerceListingRef) this.fail('ERR_WASTE_COMMERCE_PROJECTION_REF_REQUIRED', 'commerceProductRef or commerceListingRef is required');
        let now = request.now || new Date();
        let context = {
            now: now,
            correlationId: request.correlationId || projection.correlationId || asset.correlationId,
            idempotencyKey: request.idempotencyKey || projection.idempotencyKey || asset.idempotencyKey,
            principalRef: request.principalRef
        };
        let projectionRef = { module: 'wasteCore', schema: 'wasteAssetMarketplaceProjection', code: projection.code };
        projection = UTILS.persistenceModel(Object.assign({}, projection, {
            projectionStatus: 'LISTED',
            commerceProductRef: request.commerceProductRef,
            commerceListingRef: request.commerceListingRef,
            projectedAt: now,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            revision: Number(projection.revision || 0) + 1
        }));
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, {
            assetStatus: 'LISTED',
            marketplaceProjectionRef: projectionRef,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            revision: Number(asset.revision || 0) + 1
        }));
        return {
            asset: nextAsset,
            projection: projection,
            auditEvents: [this.auditEvent('waste.asset.marketplace.projection.complete', 'completed', projection.code, context)],
            domainEvents: [this.domainEvent('waste.asset.marketplace.projection.completed', { assetCode: asset.code, projectionCode: projection.code, commerceProductRef: request.commerceProductRef, commerceListingRef: request.commerceListingRef }, context)]
        };
    },

    /** Cancels or fails the Waste side of a Commerce/Product projection relationship. */
    closeProjection: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let projection = Object.assign({}, request.projection || {});
        if (!projection.code || projection.assetCode !== asset.code) this.fail('ERR_WASTE_MARKETPLACE_PROJECTION_REQUIRED', 'matching marketplace projection is required');
        let closeStatus = this.codePart(request.closeStatus || 'CANCELLED');
        if (['CANCELLED', 'FAILED', 'EXPIRED'].indexOf(closeStatus) < 0) this.fail('ERR_WASTE_MARKETPLACE_CLOSE_STATUS_INVALID', 'closeStatus must be CANCELLED, FAILED, or EXPIRED');
        let now = request.now || new Date();
        let context = {
            now: now,
            correlationId: request.correlationId || projection.correlationId || asset.correlationId,
            idempotencyKey: request.idempotencyKey || projection.idempotencyKey || asset.idempotencyKey,
            principalRef: request.principalRef
        };
        projection = UTILS.persistenceModel(Object.assign({}, projection, {
            projectionStatus: closeStatus,
            closedAt: now,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            revision: Number(projection.revision || 0) + 1
        }));
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, {
            assetStatus: closeStatus === 'FAILED' ? 'LISTING_FAILED' : 'OWNED',
            marketplaceProjectionRef: undefined,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            revision: Number(asset.revision || 0) + 1
        }));
        return {
            asset: nextAsset,
            projection: projection,
            auditEvents: [this.auditEvent('waste.asset.marketplace.projection.close', closeStatus.toLowerCase(), projection.code, context)],
            domainEvents: [this.domainEvent('waste.asset.marketplace.projection.closed', { assetCode: asset.code, projectionCode: projection.code, closeStatus: closeStatus }, context)]
        };
    }
};
