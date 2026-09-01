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

/** @module wasteCore/src/service/defaultWasteAssetSaleTransferService @description Coordinates Waste-side sale reserve, complete, cancel, and reverse contracts from Commerce events without owning catalog, price, bid, payment, or wallet ledger state. @layer service @owner wasteCore @override Commerce owns sale/order/payment facts and Wallet/Loyalty owns balance mutation. */
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

    /** Normalizes code components for deterministic event numbering. */
    codePart: function (value) {
        return UTILS.normalizeCode(value).replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    },

    /** Compares two normalized source references. */
    sameRef: function (left, right) {
        return !!left && !!right && left.module === right.module && left.schema === right.schema && left.code === right.code;
    },

    /** Resolves all policy records relevant to a sale event. */
    resolvePolicies: function (request) {
        request = request || {};
        let projection = request.projection || {};
        let transferPolicy = Object.assign({
            code: projection.transferPolicyCode || 'WASTE_SALE_TRANSFER_STANDARD',
            transferType: 'SELL',
            ownershipTransferMode: 'TRANSFER_TO_COUNTERPARTY',
            rewardTransferMode: 'RETAIN_ORIGINAL_OWNER',
            carbonTransferMode: 'TRANSFER_TO_COUNTERPARTY',
            allowSelfTransfer: false,
            cancellationAssetStatus: 'LISTED',
            reversalAssetStatus: 'OWNED'
        }, request.transferPolicy || {});
        let rewardPolicy = Object.assign({
            code: projection.rewardSettlementPolicyCode,
            triggerType: 'SALE',
            settlementMode: transferPolicy.rewardTransferMode,
            walletCurrencyCode: 'SUSTAINABILITY_REWARD',
            reversalAllowed: true
        }, request.rewardSettlementPolicy || {});
        let carbonPolicy = Object.assign({
            code: projection.carbonSettlementPolicyCode,
            triggerType: 'SALE',
            settlementMode: transferPolicy.carbonTransferMode,
            carbonUnitCode: 'CARBON_CREDIT',
            reversalAllowed: true
        }, request.carbonSettlementPolicy || {});
        return { transferPolicy: transferPolicy, rewardPolicy: rewardPolicy, carbonPolicy: carbonPolicy };
    },

    /** Requires the projection relationship to belong to the supplied asset. */
    assertProjection: function (asset, projection) {
        if (!asset || !asset.code) this.fail('ERR_WASTE_ASSET_REQUIRED', 'asset is required');
        if (!projection || !projection.code || projection.assetCode !== asset.code) {
            this.fail('ERR_WASTE_MARKETPLACE_PROJECTION_REQUIRED', 'matching marketplace projection is required');
        }
        if (asset.marketplaceProjectionRef && asset.marketplaceProjectionRef.code && asset.marketplaceProjectionRef.code !== projection.code) {
            this.fail('ERR_WASTE_MARKETPLACE_PROJECTION_MISMATCH', 'asset marketplaceProjectionRef must match projection');
        }
        return projection;
    },

    /** Requires a valid buyer reference that differs from seller unless policy allows it. */
    buyerRef: function (asset, request, transferPolicy) {
        let sellerRef = SOURCE_REF.normalize(asset.ownerRef, true);
        let buyerRef = SOURCE_REF.normalize(request.buyerRef, true);
        if (!transferPolicy.allowSelfTransfer && this.sameRef(sellerRef, buyerRef)) {
            this.fail('ERR_WASTE_ASSET_SELF_TRANSFER_FORBIDDEN', 'buyer must differ from seller');
        }
        return buyerRef;
    },

    /** Requires Commerce order/listing consistency for sale callbacks. */
    assertCommerceRefs: function (request, requireOrder) {
        if (!request.commerceOrderRef && requireOrder !== false) this.fail('ERR_WASTE_COMMERCE_ORDER_REF_REQUIRED', 'commerceOrderRef is required');
        if (request.commerceOrderRef) SOURCE_REF.normalize(request.commerceOrderRef, true);
        if (request.paymentRef) SOURCE_REF.normalize(request.paymentRef, true);
        return true;
    },

    /** Returns true when the same Commerce event was already handled. */
    matchesExistingEvent: function (request, expectedStatus) {
        let existing = request.existingOwnershipEvent;
        if (!existing || existing.transferType !== 'SELL') return false;
        if (expectedStatus && existing.transferStatus !== expectedStatus) return false;
        if (request.idempotencyKey && existing.idempotencyKey === request.idempotencyKey) return true;
        return !!request.commerceOrderRef && existing.commerceOrderRef && this.sameRef(existing.commerceOrderRef, request.commerceOrderRef);
    },

    /** Returns a reference to the Waste marketplace projection relationship. */
    projectionRef: function (projection) {
        return { module: 'wasteCore', schema: 'wasteAssetMarketplaceProjection', code: projection.code };
    },

    /** Builds a wallet-owned settlement intent reference without mutating ledger state. */
    settlementRef: function (kind, eventCode, mode, policy, fromOwnerRef, toOwnerRef, context) {
        if (!mode || mode === 'NONE') return undefined;
        return {
            module: 'wallet',
            schema: kind === 'reward' ? 'rewardSettlementIntent' : 'carbonSettlementIntent',
            code: [eventCode, kind === 'reward' ? 'REWARD' : 'CARBON', 'SALE'].join('_'),
            policyCode: policy && policy.code,
            settlementMode: mode,
            fromOwnerRef: fromOwnerRef,
            toOwnerRef: toOwnerRef,
            state: 'REQUESTED',
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey
        };
    },

    /** Builds sale settlement references from policy modes. */
    settlementRefs: function (eventCode, asset, buyerRef, policies, context) {
        let sellerRef = SOURCE_REF.normalize(asset.ownerRef, true);
        let originalOwnerRef = SOURCE_REF.normalize(asset.originalOwnerRef || asset.ownerRef, true);
        let rewardMode = policies.rewardPolicy.settlementMode || policies.transferPolicy.rewardTransferMode;
        let carbonMode = policies.carbonPolicy.settlementMode || policies.transferPolicy.carbonTransferMode;
        let rewardToRef = rewardMode === 'TRANSFER_TO_COUNTERPARTY' ? buyerRef : originalOwnerRef;
        let carbonToRef = carbonMode === 'TRANSFER_TO_COUNTERPARTY' ? buyerRef : sellerRef;
        return {
            reward: this.array(this.settlementRef('reward', eventCode, rewardMode, policies.rewardPolicy, originalOwnerRef, rewardToRef, context)).filter(Boolean),
            carbon: this.array(this.settlementRef('carbon', eventCode, carbonMode, policies.carbonPolicy, sellerRef, carbonToRef, context)).filter(Boolean)
        };
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

    /** Creates a Waste ownership event for the sale journey. */
    ownershipEvent: function (request, asset, projection, buyerRef, status, settlementRefs, context) {
        let commerceOrderCode = request.commerceOrderRef && request.commerceOrderRef.code || request.orderCode || context.idempotencyKey || 'SALE';
        let eventCode = this.codePart(request.ownershipEventCode || [asset.code, 'SALE', commerceOrderCode].join('_'));
        return UTILS.persistenceModel({
            code: eventCode,
            assetCode: asset.code,
            fromOwnerRef: SOURCE_REF.normalize(asset.ownerRef, true),
            toOwnerRef: buyerRef,
            transferType: 'SELL',
            transferStatus: status,
            policyCode: request.transferPolicy && request.transferPolicy.code || projection.transferPolicyCode,
            triggerRef: request.commerceOrderRef || projection.commerceListingRef || projection.commerceProductRef,
            rewardSettlementRefs: settlementRefs.reward,
            carbonSettlementRefs: settlementRefs.carbon,
            commerceProjectionRef: this.projectionRef(projection),
            commerceOrderRef: request.commerceOrderRef,
            paymentRef: request.paymentRef,
            evidenceRefs: this.array(asset.evidenceRefs),
            occurredAt: context.now,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            revision: 0
        });
    },

    /** Reserves a listed Waste asset after Commerce accepts a bid or starts an order. */
    reserveSale: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let projection = this.assertProjection(asset, request.projection);
        let policies = this.resolvePolicies(request);
        if (policies.transferPolicy.transferType !== 'SELL') this.fail('ERR_WASTE_SALE_TRANSFER_POLICY_REQUIRED', 'transfer policy must be SELL');
        let buyerRef = this.buyerRef(asset, request, policies.transferPolicy);
        this.assertCommerceRefs(request, true);
        if (this.matchesExistingEvent(request, 'RESERVED')) {
            return { idempotent: true, asset: asset, projection: projection, ownershipEvent: request.existingOwnershipEvent, settlementReferences: { reward: this.array(request.existingOwnershipEvent.rewardSettlementRefs), carbon: this.array(request.existingOwnershipEvent.carbonSettlementRefs) }, auditEvents: [], domainEvents: [] };
        }
        if (asset.assetStatus !== 'LISTED') this.fail('ERR_WASTE_ASSET_NOT_LISTED', 'asset must be LISTED before sale reservation');
        if (projection.projectionStatus !== 'LISTED') this.fail('ERR_WASTE_MARKETPLACE_PROJECTION_NOT_LISTED', 'marketplace projection must be LISTED before sale reservation');
        let context = { now: request.now || new Date(), correlationId: request.correlationId || asset.correlationId, idempotencyKey: request.idempotencyKey || asset.idempotencyKey, principalRef: request.principalRef };
        let eventCode = this.codePart(request.ownershipEventCode || [asset.code, 'SALE', request.commerceOrderRef.code].join('_'));
        let settlementReferences = this.settlementRefs(eventCode, asset, buyerRef, policies, context);
        let ownershipEvent = this.ownershipEvent(Object.assign({}, request, { ownershipEventCode: eventCode }), asset, projection, buyerRef, 'RESERVED', settlementReferences, context);
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, { assetStatus: 'SALE_PENDING', correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(asset.revision || 0) + 1 }));
        let nextProjection = UTILS.persistenceModel(Object.assign({}, projection, { projectionStatus: 'SALE_PENDING', commerceOrderRef: request.commerceOrderRef, paymentRef: request.paymentRef, correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(projection.revision || 0) + 1 }));
        return {
            idempotent: false,
            asset: nextAsset,
            projection: nextProjection,
            ownershipEvent: ownershipEvent,
            settlementReferences: settlementReferences,
            auditEvents: [this.auditEvent('waste.asset.sale.reserve', 'reserved', ownershipEvent.code, context)],
            domainEvents: [
                this.domainEvent('waste.asset.sale.reserved', { assetCode: asset.code, ownershipEventCode: ownershipEvent.code, buyerRef: buyerRef }, context),
                this.domainEvent('waste.asset.settlement.requested', { assetCode: asset.code, rewardSettlementRefs: settlementReferences.reward, carbonSettlementRefs: settlementReferences.carbon }, context)
            ]
        };
    },

    /** Completes a Waste sale after Commerce confirms the order/payment outcome. */
    completeSale: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let projection = this.assertProjection(asset, request.projection);
        let policies = this.resolvePolicies(request);
        this.assertCommerceRefs(request, true);
        if (this.matchesExistingEvent(request, 'COMPLETED')) {
            return { idempotent: true, asset: asset, projection: projection, ownershipEvent: request.existingOwnershipEvent, settlementReferences: { reward: this.array(request.existingOwnershipEvent.rewardSettlementRefs), carbon: this.array(request.existingOwnershipEvent.carbonSettlementRefs) }, auditEvents: [], domainEvents: [] };
        }
        let buyerRef = this.buyerRef(asset, request, policies.transferPolicy);
        if (['LISTED', 'SALE_PENDING'].indexOf(asset.assetStatus) < 0) this.fail('ERR_WASTE_ASSET_SALE_STATE_INVALID', 'asset must be LISTED or SALE_PENDING before sale completion');
        if (['LISTED', 'SALE_PENDING'].indexOf(projection.projectionStatus) < 0) this.fail('ERR_WASTE_MARKETPLACE_PROJECTION_SALE_STATE_INVALID', 'marketplace projection must be LISTED or SALE_PENDING before sale completion');
        let context = { now: request.now || new Date(), correlationId: request.correlationId || asset.correlationId, idempotencyKey: request.idempotencyKey || asset.idempotencyKey, principalRef: request.principalRef };
        let eventCode = this.codePart(request.ownershipEventCode || request.existingReservedEvent && request.existingReservedEvent.code || [asset.code, 'SALE', request.commerceOrderRef.code].join('_'));
        let settlementReferences = request.existingReservedEvent ? { reward: this.array(request.existingReservedEvent.rewardSettlementRefs), carbon: this.array(request.existingReservedEvent.carbonSettlementRefs) } : this.settlementRefs(eventCode, asset, buyerRef, policies, context);
        let ownershipEvent = this.ownershipEvent(Object.assign({}, request, { ownershipEventCode: eventCode }), asset, projection, buyerRef, 'COMPLETED', settlementReferences, context);
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, { ownerRef: buyerRef, assetStatus: 'SOLD', correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(asset.revision || 0) + 1 }));
        let nextProjection = UTILS.persistenceModel(Object.assign({}, projection, { projectionStatus: 'SOLD', commerceOrderRef: request.commerceOrderRef, paymentRef: request.paymentRef, closedAt: context.now, correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(projection.revision || 0) + 1 }));
        return {
            idempotent: false,
            asset: nextAsset,
            projection: nextProjection,
            ownershipEvent: ownershipEvent,
            settlementReferences: settlementReferences,
            auditEvents: [this.auditEvent('waste.asset.sale.complete', 'completed', ownershipEvent.code, context)],
            domainEvents: [
                this.domainEvent('waste.asset.sale.completed', { assetCode: asset.code, ownershipEventCode: ownershipEvent.code, buyerRef: buyerRef }, context),
                this.domainEvent('waste.asset.settlement.requested', { assetCode: asset.code, rewardSettlementRefs: settlementReferences.reward, carbonSettlementRefs: settlementReferences.carbon }, context)
            ]
        };
    },

    /** Cancels a pending sale and returns the Waste asset to the configured status. */
    cancelSale: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let projection = this.assertProjection(asset, request.projection);
        let policies = this.resolvePolicies(request);
        let context = { now: request.now || new Date(), correlationId: request.correlationId || asset.correlationId, idempotencyKey: request.idempotencyKey || asset.idempotencyKey, principalRef: request.principalRef };
        if (this.matchesExistingEvent(request, 'CANCELLED')) {
            return { idempotent: true, asset: asset, projection: projection, ownershipEvent: request.existingOwnershipEvent, settlementReferences: { reward: this.array(request.existingOwnershipEvent.rewardSettlementRefs), carbon: this.array(request.existingOwnershipEvent.carbonSettlementRefs) }, auditEvents: [], domainEvents: [] };
        }
        if (asset.assetStatus !== 'SALE_PENDING') this.fail('ERR_WASTE_ASSET_SALE_NOT_PENDING', 'asset must be SALE_PENDING before sale cancellation');
        if (projection.projectionStatus !== 'SALE_PENDING') this.fail('ERR_WASTE_MARKETPLACE_PROJECTION_SALE_NOT_PENDING', 'marketplace projection must be SALE_PENDING before sale cancellation');
        let nextStatus = policies.transferPolicy.cancellationAssetStatus || 'LISTED';
        let event = request.existingOwnershipEvent && UTILS.persistenceModel(Object.assign({}, request.existingOwnershipEvent, { transferStatus: 'CANCELLED', occurredAt: context.now, correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(request.existingOwnershipEvent.revision || 0) + 1 }));
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, { assetStatus: nextStatus, correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(asset.revision || 0) + 1 }));
        let nextProjection = UTILS.persistenceModel(Object.assign({}, projection, { projectionStatus: nextStatus === 'LISTED' ? 'LISTED' : 'CANCELLED', correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(projection.revision || 0) + 1 }));
        return {
            idempotent: false,
            asset: nextAsset,
            projection: nextProjection,
            ownershipEvent: event,
            settlementReferences: { reward: this.array(event && event.rewardSettlementRefs), carbon: this.array(event && event.carbonSettlementRefs) },
            auditEvents: [this.auditEvent('waste.asset.sale.cancel', 'cancelled', event && event.code || asset.code, context)],
            domainEvents: [this.domainEvent('waste.asset.sale.cancelled', { assetCode: asset.code, ownershipEventCode: event && event.code }, context)]
        };
    },

    /** Reverses a completed sale and emits settlement reversal references for wallet owners. */
    reverseSale: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let projection = this.assertProjection(asset, request.projection);
        let policies = this.resolvePolicies(request);
        let buyerRef = SOURCE_REF.normalize(asset.ownerRef, true);
        let sellerRef = SOURCE_REF.normalize(request.sellerRef || request.previousOwnerRef || request.originalSellerRef || request.existingOwnershipEvent && request.existingOwnershipEvent.fromOwnerRef, true);
        if (request.existingOwnershipEvent && request.existingOwnershipEvent.transferType === 'REVERSAL' && request.existingOwnershipEvent.transferStatus === 'REVERSED') {
            return { idempotent: true, asset: asset, projection: projection, ownershipEvent: request.existingOwnershipEvent, settlementReferences: { reward: this.array(request.existingOwnershipEvent.rewardSettlementRefs), carbon: this.array(request.existingOwnershipEvent.carbonSettlementRefs) }, auditEvents: [], domainEvents: [] };
        }
        if (policies.rewardPolicy.reversalAllowed === false || policies.carbonPolicy.reversalAllowed === false) this.fail('ERR_WASTE_SALE_REVERSAL_NOT_ALLOWED', 'settlement policy does not allow reversal');
        if (asset.assetStatus !== 'SOLD') this.fail('ERR_WASTE_ASSET_NOT_SOLD', 'asset must be SOLD before sale reversal');
        let context = { now: request.now || new Date(), correlationId: request.correlationId || asset.correlationId, idempotencyKey: request.idempotencyKey || asset.idempotencyKey, principalRef: request.principalRef };
        let eventCode = this.codePart(request.ownershipEventCode || [asset.code, 'SALE', 'REVERSAL', context.idempotencyKey || projection.code].join('_'));
        let rewardReversalRef = this.settlementRef('reward', eventCode, 'REVERSAL', policies.rewardPolicy, buyerRef, sellerRef, context);
        let carbonReversalRef = this.settlementRef('carbon', eventCode, 'REVERSAL', policies.carbonPolicy, buyerRef, sellerRef, context);
        let ownershipEvent = UTILS.persistenceModel({
            code: eventCode,
            assetCode: asset.code,
            fromOwnerRef: buyerRef,
            toOwnerRef: sellerRef,
            transferType: 'REVERSAL',
            transferStatus: 'REVERSED',
            policyCode: policies.transferPolicy.code,
            triggerRef: request.commerceOrderRef || projection.commerceOrderRef,
            rewardSettlementRefs: this.array(rewardReversalRef).filter(Boolean),
            carbonSettlementRefs: this.array(carbonReversalRef).filter(Boolean),
            commerceProjectionRef: this.projectionRef(projection),
            commerceOrderRef: request.commerceOrderRef || projection.commerceOrderRef,
            paymentRef: request.paymentRef || projection.paymentRef,
            evidenceRefs: this.array(asset.evidenceRefs),
            occurredAt: context.now,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            revision: 0
        });
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, { ownerRef: sellerRef, assetStatus: policies.transferPolicy.reversalAssetStatus || 'OWNED', correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(asset.revision || 0) + 1 }));
        let nextProjection = UTILS.persistenceModel(Object.assign({}, projection, { projectionStatus: 'REVERSED', closedAt: context.now, correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(projection.revision || 0) + 1 }));
        return {
            idempotent: false,
            asset: nextAsset,
            projection: nextProjection,
            ownershipEvent: ownershipEvent,
            settlementReferences: { reward: ownershipEvent.rewardSettlementRefs, carbon: ownershipEvent.carbonSettlementRefs },
            auditEvents: [this.auditEvent('waste.asset.sale.reverse', 'reversed', ownershipEvent.code, context)],
            domainEvents: [
                this.domainEvent('waste.asset.sale.reversed', { assetCode: asset.code, ownershipEventCode: ownershipEvent.code, sellerRef: sellerRef }, context),
                this.domainEvent('waste.asset.settlement.requested', { assetCode: asset.code, rewardSettlementRefs: ownershipEvent.rewardSettlementRefs, carbonSettlementRefs: ownershipEvent.carbonSettlementRefs }, context)
            ]
        };
    }
};
