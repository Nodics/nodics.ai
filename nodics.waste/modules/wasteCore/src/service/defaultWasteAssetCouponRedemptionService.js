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

/** @module wasteCore/src/service/defaultWasteAssetCouponRedemptionService @description Coordinates Waste-side coupon redemption intent contracts without owning coupon entitlement, reward ledger, or carbon ledger state. @layer service @owner wasteCore */
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

    /** Resolves redemption, transfer, reward, and carbon policies. */
    resolvePolicies: function (request) {
        request = request || {};
        let redemptionPolicy = Object.assign({
            code: 'WASTE_COUPON_REDEMPTION_STANDARD',
            eligibleAssetStatuses: ['OWNED', 'GIFTED'],
            rewardDebitMode: 'FULL_ELIGIBLE_BALANCE',
            rewardReserveRequired: true,
            carbonReceiverMode: 'DEFAULT_ENTERPRISE',
            carbonTransferQuantityMode: 'PROPORTIONAL_TO_REWARD_COST',
            entitlementMode: 'CUSTOMER_OWNED'
        }, request.redemptionPolicy || request.couponRedemptionPolicy || {});
        let transferPolicy = Object.assign({
            code: 'WASTE_REDEMPTION_TRANSFER_STANDARD',
            transferType: 'REDEEM',
            ownershipTransferMode: 'RETAIN_CURRENT_OWNER',
            rewardTransferMode: 'CONSUME',
            carbonTransferMode: 'TRANSFER_TO_DEFAULT_ENTERPRISE',
            allowSelfTransfer: true,
            cancellationAssetStatus: 'OWNED',
            reversalAssetStatus: 'OWNED'
        }, request.transferPolicy || {});
        let rewardPolicy = Object.assign({
            code: redemptionPolicy.rewardSettlementPolicyCode,
            triggerType: 'COUPON_PURCHASE',
            settlementMode: this.rewardSettlementMode(redemptionPolicy.rewardDebitMode),
            walletCurrencyCode: 'SUSTAINABILITY_REWARD',
            reversalAllowed: true
        }, request.rewardSettlementPolicy || {});
        let carbonPolicy = Object.assign({
            code: redemptionPolicy.carbonSettlementPolicyCode,
            triggerType: 'COUPON_PURCHASE',
            settlementMode: this.carbonSettlementMode(redemptionPolicy.carbonReceiverMode),
            carbonUnitCode: 'CARBON_CREDIT',
            receiverRef: redemptionPolicy.defaultCarbonReceiverRef,
            reversalAllowed: true
        }, request.carbonSettlementPolicy || {});
        return { redemptionPolicy: redemptionPolicy, transferPolicy: transferPolicy, rewardPolicy: rewardPolicy, carbonPolicy: carbonPolicy };
    },

    /** Maps coupon redemption reward debit mode to wallet settlement mode. */
    rewardSettlementMode: function (rewardDebitMode) {
        return {
            FIXED_AMOUNT: 'DEBIT_FIXED',
            PROPORTIONAL_AMOUNT: 'DEBIT_PROPORTIONAL',
            FULL_ELIGIBLE_BALANCE: 'DEBIT_FULL_ELIGIBLE',
            POLICY_RESOLVED: 'POLICY_RESOLVED'
        }[rewardDebitMode] || 'DEBIT_FULL_ELIGIBLE';
    },

    /** Maps coupon redemption carbon receiver mode to carbon settlement mode. */
    carbonSettlementMode: function (carbonReceiverMode) {
        return {
            ISSUER_ENTERPRISE: 'TRANSFER_TO_ISSUER_ENTERPRISE',
            DEFAULT_ENTERPRISE: 'TRANSFER_TO_DEFAULT_ENTERPRISE',
            FIXED_ENTERPRISE: 'TRANSFER_TO_FIXED_ENTERPRISE',
            SPLIT_ENTERPRISE: 'SPLIT',
            NONE: 'NONE',
            POLICY_RESOLVED: 'POLICY_RESOLVED'
        }[carbonReceiverMode] || 'TRANSFER_TO_DEFAULT_ENTERPRISE';
    },

    /** Requires current owner context and matching asset ownership. */
    ownerRef: function (asset, request) {
        if (!asset || !asset.code) this.fail('ERR_WASTE_ASSET_REQUIRED', 'asset is required');
        let assetOwnerRef = SOURCE_REF.normalize(asset.ownerRef, true);
        let ownerRef = SOURCE_REF.normalize(request.ownerRef || request.authOwnerRef, true);
        if (!this.sameRef(assetOwnerRef, ownerRef)) this.fail('ERR_WASTE_ASSET_OWNER_MISMATCH', 'current owner must match asset owner');
        return ownerRef;
    },

    /** Requires a Promotion/Coupon listing reference. */
    couponListingRef: function (request, redemptionPolicy) {
        let couponListingRef = request.couponListingRef || redemptionPolicy.couponListingRef;
        return SOURCE_REF.normalize(couponListingRef, true);
    },

    /** Resolves carbon receiver from coupon policy and request context. */
    carbonReceiverRef: function (request, redemptionPolicy) {
        if (redemptionPolicy.carbonReceiverMode === 'NONE') return undefined;
        let receiverRef = request.carbonReceiverRef || redemptionPolicy.defaultCarbonReceiverRef;
        if (redemptionPolicy.carbonReceiverMode === 'ISSUER_ENTERPRISE') receiverRef = request.issuerEnterpriseRef || receiverRef;
        if (redemptionPolicy.carbonReceiverMode === 'FIXED_ENTERPRISE') receiverRef = request.fixedEnterpriseRef || receiverRef;
        return SOURCE_REF.normalize(receiverRef, true);
    },

    /** Returns true when the same redemption event was already handled. */
    matchesExistingEvent: function (request, expectedStatus) {
        let existing = request.existingOwnershipEvent || request.existingRedemptionEvent;
        if (!existing || existing.transferType !== 'REDEEM') return false;
        if (expectedStatus && existing.transferStatus !== expectedStatus) return false;
        if (request.idempotencyKey && existing.idempotencyKey === request.idempotencyKey) return true;
        return !!request.redemptionRef && existing.triggerRef && this.sameRef(existing.triggerRef, request.redemptionRef);
    },

    /** Builds a wallet-owned settlement intent reference without mutating ledger state. */
    settlementRef: function (kind, eventCode, mode, policy, fromOwnerRef, toOwnerRef, context, extras) {
        if (!mode || mode === 'NONE') return undefined;
        return Object.assign({
            module: 'wallet',
            schema: kind === 'reward' ? 'rewardSettlementIntent' : 'carbonSettlementIntent',
            code: [eventCode, kind === 'reward' ? 'REWARD' : 'CARBON', 'COUPON_REDEMPTION'].join('_'),
            policyCode: policy && policy.code,
            settlementMode: mode,
            fromOwnerRef: fromOwnerRef,
            toOwnerRef: toOwnerRef,
            state: 'REQUESTED',
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey
        }, extras || {});
    },

    /** Builds redemption settlement references from policy modes. */
    settlementRefs: function (eventCode, ownerRef, carbonReceiverRef, policies, context) {
        return {
            reward: this.array(this.settlementRef('reward', eventCode, policies.rewardPolicy.settlementMode, policies.rewardPolicy, ownerRef, ownerRef, context, {
                rewardDebitMode: policies.redemptionPolicy.rewardDebitMode,
                rewardReserveRequired: policies.redemptionPolicy.rewardReserveRequired
            })).filter(Boolean),
            carbon: this.array(this.settlementRef('carbon', eventCode, policies.carbonPolicy.settlementMode, policies.carbonPolicy, ownerRef, carbonReceiverRef, context, {
                carbonReceiverMode: policies.redemptionPolicy.carbonReceiverMode,
                carbonTransferQuantityMode: policies.redemptionPolicy.carbonTransferQuantityMode
            })).filter(Boolean)
        };
    },

    /** Builds a coupon entitlement request owned by Promotion/Coupon. */
    couponEntitlementRequest: function (request, asset, ownerRef, couponListingRef, policies, settlementReferences, context) {
        return {
            module: 'promotion',
            schema: 'couponEntitlementRequest',
            code: this.codePart([asset.code, 'COUPON_ENTITLEMENT', context.idempotencyKey || couponListingRef.code].join('_')),
            assetRef: { module: 'wasteCore', schema: 'wasteAsset', code: asset.code },
            couponListingRef: couponListingRef,
            ownerRef: ownerRef,
            entitlementMode: policies.redemptionPolicy.entitlementMode,
            rewardSettlementRefs: settlementReferences.reward,
            carbonSettlementRefs: settlementReferences.carbon,
            state: 'REQUESTED',
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey
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

    /** Creates a Waste ownership event for the coupon redemption journey. */
    ownershipEvent: function (request, asset, ownerRef, status, settlementRefs, context) {
        let redemptionCode = request.redemptionRef && request.redemptionRef.code || request.redemptionCode || context.idempotencyKey || 'COUPON_REDEMPTION';
        let eventCode = this.codePart(request.ownershipEventCode || [asset.code, 'COUPON_REDEMPTION', redemptionCode].join('_'));
        return UTILS.persistenceModel({
            code: eventCode,
            assetCode: asset.code,
            fromOwnerRef: ownerRef,
            toOwnerRef: ownerRef,
            transferType: 'REDEEM',
            transferStatus: status,
            policyCode: request.transferPolicy && request.transferPolicy.code,
            triggerRef: request.redemptionRef || request.couponListingRef,
            rewardSettlementRefs: settlementRefs.reward,
            carbonSettlementRefs: settlementRefs.carbon,
            couponEntitlementRef: request.couponEntitlementRef,
            evidenceRefs: this.array(asset.evidenceRefs),
            occurredAt: context.now,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            revision: 0
        });
    },

    /** Requests a coupon redemption and reserves Waste asset value for external owners. */
    requestRedemption: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let policies = this.resolvePolicies(request);
        if (policies.transferPolicy.transferType !== 'REDEEM') this.fail('ERR_WASTE_REDEMPTION_TRANSFER_POLICY_REQUIRED', 'transfer policy must be REDEEM');
        if (policies.redemptionPolicy.entitlementMode !== 'CUSTOMER_OWNED') this.fail('ERR_WASTE_COUPON_CUSTOMER_ENTITLEMENT_REQUIRED', 'coupon redemption must create a customer-owned entitlement');
        if (this.matchesExistingEvent(request, 'RESERVED')) {
            let existing = request.existingOwnershipEvent || request.existingRedemptionEvent;
            return { idempotent: true, asset: asset, ownershipEvent: existing, settlementReferences: { reward: this.array(existing.rewardSettlementRefs), carbon: this.array(existing.carbonSettlementRefs) }, couponEntitlementRequest: undefined, auditEvents: [], domainEvents: [] };
        }
        let eligibleStatuses = this.array(policies.redemptionPolicy.eligibleAssetStatuses);
        if (eligibleStatuses.length && eligibleStatuses.indexOf(asset.assetStatus) < 0) this.fail('ERR_WASTE_ASSET_COUPON_REDEMPTION_STATE_INVALID', 'asset status is not eligible for coupon redemption');
        let ownerRef = this.ownerRef(asset, request);
        let couponListingRef = this.couponListingRef(request, policies.redemptionPolicy);
        let carbonReceiverRef = this.carbonReceiverRef(request, policies.redemptionPolicy);
        let context = { now: request.now || new Date(), correlationId: request.correlationId || asset.correlationId, idempotencyKey: request.idempotencyKey || asset.idempotencyKey, principalRef: request.principalRef };
        let eventCode = this.codePart(request.ownershipEventCode || [asset.code, 'COUPON_REDEMPTION', context.idempotencyKey || couponListingRef.code].join('_'));
        let settlementReferences = this.settlementRefs(eventCode, ownerRef, carbonReceiverRef, policies, context);
        let entitlementRequest = this.couponEntitlementRequest(request, asset, ownerRef, couponListingRef, policies, settlementReferences, context);
        let ownershipEvent = this.ownershipEvent(Object.assign({}, request, { ownershipEventCode: eventCode, couponListingRef: couponListingRef }), asset, ownerRef, 'RESERVED', settlementReferences, context);
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, { assetStatus: 'REDEMPTION_PENDING', correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(asset.revision || 0) + 1 }));
        return {
            idempotent: false,
            asset: nextAsset,
            ownershipEvent: ownershipEvent,
            settlementReferences: settlementReferences,
            couponEntitlementRequest: entitlementRequest,
            auditEvents: [this.auditEvent('waste.asset.couponRedemption.request', 'reserved', ownershipEvent.code, context)],
            domainEvents: [
                this.domainEvent('waste.asset.couponRedemption.requested', { assetCode: asset.code, ownershipEventCode: ownershipEvent.code, couponListingRef: couponListingRef }, context),
                this.domainEvent('waste.asset.settlement.requested', { assetCode: asset.code, rewardSettlementRefs: settlementReferences.reward, carbonSettlementRefs: settlementReferences.carbon }, context),
                this.domainEvent('waste.asset.couponEntitlement.requested', { assetCode: asset.code, couponEntitlementRequestCode: entitlementRequest.code }, context)
            ]
        };
    },

    /** Completes a coupon redemption after Promotion/Coupon creates the entitlement. */
    completeRedemption: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let policies = this.resolvePolicies(request);
        if (policies.transferPolicy.transferType !== 'REDEEM') this.fail('ERR_WASTE_REDEMPTION_TRANSFER_POLICY_REQUIRED', 'transfer policy must be REDEEM');
        if (this.matchesExistingEvent(request, 'COMPLETED')) {
            let existing = request.existingOwnershipEvent || request.existingRedemptionEvent;
            return { idempotent: true, asset: asset, ownershipEvent: existing, settlementReferences: { reward: this.array(existing.rewardSettlementRefs), carbon: this.array(existing.carbonSettlementRefs) }, auditEvents: [], domainEvents: [] };
        }
        if (asset.assetStatus !== 'REDEMPTION_PENDING') this.fail('ERR_WASTE_ASSET_REDEMPTION_NOT_PENDING', 'asset must be REDEMPTION_PENDING before coupon redemption completion');
        let couponEntitlementRef = SOURCE_REF.normalize(request.couponEntitlementRef, true);
        let ownerRef = SOURCE_REF.normalize(request.ownerRef || request.authOwnerRef || request.existingRedemptionEvent && request.existingRedemptionEvent.toOwnerRef || asset.ownerRef, true);
        let context = { now: request.now || new Date(), correlationId: request.correlationId || asset.correlationId, idempotencyKey: request.idempotencyKey || asset.idempotencyKey, principalRef: request.principalRef };
        let eventCode = this.codePart(request.ownershipEventCode || request.existingRedemptionEvent && request.existingRedemptionEvent.code || [asset.code, 'COUPON_REDEMPTION', context.idempotencyKey || couponEntitlementRef.code].join('_'));
        let settlementReferences = request.existingRedemptionEvent ? { reward: this.array(request.existingRedemptionEvent.rewardSettlementRefs), carbon: this.array(request.existingRedemptionEvent.carbonSettlementRefs) } : this.settlementRefs(eventCode, ownerRef, this.carbonReceiverRef(request, policies.redemptionPolicy), policies, context);
        let ownershipEvent = this.ownershipEvent(Object.assign({}, request, { ownershipEventCode: eventCode, couponEntitlementRef: couponEntitlementRef }), asset, ownerRef, 'COMPLETED', settlementReferences, context);
        let couponEntitlementRefs = this.array(asset.couponEntitlementRefs).filter(function (ref) { return !(ref && ref.code === couponEntitlementRef.code); }).concat([couponEntitlementRef]);
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, { assetStatus: 'REDEEMED', couponEntitlementRefs: couponEntitlementRefs, correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(asset.revision || 0) + 1 }));
        return {
            idempotent: false,
            asset: nextAsset,
            ownershipEvent: ownershipEvent,
            settlementReferences: settlementReferences,
            auditEvents: [this.auditEvent('waste.asset.couponRedemption.complete', 'completed', ownershipEvent.code, context)],
            domainEvents: [this.domainEvent('waste.asset.couponRedemption.completed', { assetCode: asset.code, ownershipEventCode: ownershipEvent.code, couponEntitlementRef: couponEntitlementRef }, context)]
        };
    },

    /** Cancels a pending coupon redemption and returns the asset to policy status. */
    cancelRedemption: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let policies = this.resolvePolicies(request);
        if (policies.transferPolicy.transferType !== 'REDEEM') this.fail('ERR_WASTE_REDEMPTION_TRANSFER_POLICY_REQUIRED', 'transfer policy must be REDEEM');
        let context = { now: request.now || new Date(), correlationId: request.correlationId || asset.correlationId, idempotencyKey: request.idempotencyKey || asset.idempotencyKey, principalRef: request.principalRef };
        if (this.matchesExistingEvent(request, 'CANCELLED')) {
            let existing = request.existingOwnershipEvent || request.existingRedemptionEvent;
            return { idempotent: true, asset: asset, ownershipEvent: existing, settlementReferences: { reward: this.array(existing.rewardSettlementRefs), carbon: this.array(existing.carbonSettlementRefs) }, auditEvents: [], domainEvents: [] };
        }
        if (asset.assetStatus !== 'REDEMPTION_PENDING') this.fail('ERR_WASTE_ASSET_REDEMPTION_NOT_PENDING', 'asset must be REDEMPTION_PENDING before coupon redemption cancellation');
        let event = request.existingRedemptionEvent && UTILS.persistenceModel(Object.assign({}, request.existingRedemptionEvent, { transferStatus: 'CANCELLED', occurredAt: context.now, correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(request.existingRedemptionEvent.revision || 0) + 1 }));
        let nextStatus = policies.transferPolicy.cancellationAssetStatus || 'OWNED';
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, { assetStatus: nextStatus, correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(asset.revision || 0) + 1 }));
        return {
            idempotent: false,
            asset: nextAsset,
            ownershipEvent: event,
            settlementReferences: { reward: this.array(event && event.rewardSettlementRefs), carbon: this.array(event && event.carbonSettlementRefs) },
            auditEvents: [this.auditEvent('waste.asset.couponRedemption.cancel', 'cancelled', event && event.code || asset.code, context)],
            domainEvents: [this.domainEvent('waste.asset.couponRedemption.cancelled', { assetCode: asset.code, ownershipEventCode: event && event.code }, context)]
        };
    }
};
