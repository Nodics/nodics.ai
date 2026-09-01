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

/** @module wasteCore/src/service/defaultWasteAssetGiftTransferService @description Coordinates customer-to-customer Waste asset gifts without owning Wallet/Loyalty ledger mutation or Commerce marketplace state. @layer service @owner wasteCore */
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

    /** Resolves transfer and settlement policies for gift behavior. */
    resolvePolicies: function (request) {
        request = request || {};
        let transferPolicy = Object.assign({
            code: 'WASTE_GIFT_TRANSFER_STANDARD',
            transferType: 'GIFT',
            ownershipTransferMode: 'TRANSFER_TO_COUNTERPARTY',
            rewardTransferMode: 'TRANSFER_TO_COUNTERPARTY',
            carbonTransferMode: 'TRANSFER_TO_COUNTERPARTY',
            allowSelfTransfer: false,
            requiresCounterpartyAcceptance: true,
            cancellationAssetStatus: 'OWNED',
            reversalAssetStatus: 'OWNED'
        }, request.transferPolicy || {});
        let rewardPolicy = Object.assign({
            code: request.rewardSettlementPolicyCode,
            triggerType: 'GIFT',
            settlementMode: transferPolicy.rewardTransferMode,
            walletCurrencyCode: 'SUSTAINABILITY_REWARD',
            reversalAllowed: true
        }, request.rewardSettlementPolicy || {});
        let carbonPolicy = Object.assign({
            code: request.carbonSettlementPolicyCode,
            triggerType: 'GIFT',
            settlementMode: transferPolicy.carbonTransferMode,
            carbonUnitCode: 'CARBON_CREDIT',
            reversalAllowed: true
        }, request.carbonSettlementPolicy || {});
        return { transferPolicy: transferPolicy, rewardPolicy: rewardPolicy, carbonPolicy: carbonPolicy };
    },

    /** Requires current owner context and matching asset ownership. */
    ownerRef: function (asset, request) {
        if (!asset || !asset.code) this.fail('ERR_WASTE_ASSET_REQUIRED', 'asset is required');
        let assetOwnerRef = SOURCE_REF.normalize(asset.ownerRef, true);
        let ownerRef = SOURCE_REF.normalize(request.ownerRef || request.authOwnerRef, true);
        if (!this.sameRef(assetOwnerRef, ownerRef)) this.fail('ERR_WASTE_ASSET_OWNER_MISMATCH', 'current owner must match asset owner');
        return ownerRef;
    },

    /** Requires a receiver reference and forbids self-gift unless policy allows it. */
    receiverRef: function (ownerRef, request, transferPolicy) {
        let receiverRef = SOURCE_REF.normalize(request.receiverRef, true);
        if (!transferPolicy.allowSelfTransfer && this.sameRef(ownerRef, receiverRef)) {
            this.fail('ERR_WASTE_ASSET_SELF_GIFT_FORBIDDEN', 'receiver must differ from owner');
        }
        return receiverRef;
    },

    /** Returns true when the same gift event was already handled. */
    matchesExistingEvent: function (request, expectedStatus) {
        let existing = request.existingOwnershipEvent || request.existingGiftEvent;
        if (!existing || existing.transferType !== 'GIFT') return false;
        if (expectedStatus && existing.transferStatus !== expectedStatus) return false;
        if (request.idempotencyKey && existing.idempotencyKey === request.idempotencyKey) return true;
        return !!request.giftTransferRef && existing.triggerRef && this.sameRef(existing.triggerRef, request.giftTransferRef);
    },

    /** Builds a wallet-owned settlement intent reference without mutating ledger state. */
    settlementRef: function (kind, eventCode, mode, policy, fromOwnerRef, toOwnerRef, context) {
        if (!mode || mode === 'NONE') return undefined;
        return {
            module: 'wallet',
            schema: kind === 'reward' ? 'rewardSettlementIntent' : 'carbonSettlementIntent',
            code: [eventCode, kind === 'reward' ? 'REWARD' : 'CARBON', 'GIFT'].join('_'),
            policyCode: policy && policy.code,
            settlementMode: mode,
            fromOwnerRef: fromOwnerRef,
            toOwnerRef: toOwnerRef,
            state: 'REQUESTED',
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey
        };
    },

    /** Builds gift settlement references from policy modes. */
    settlementRefs: function (eventCode, ownerRef, receiverRef, policies, context) {
        let rewardMode = policies.rewardPolicy.settlementMode || policies.transferPolicy.rewardTransferMode;
        let carbonMode = policies.carbonPolicy.settlementMode || policies.transferPolicy.carbonTransferMode;
        return {
            reward: this.array(this.settlementRef('reward', eventCode, rewardMode, policies.rewardPolicy, ownerRef, receiverRef, context)).filter(Boolean),
            carbon: this.array(this.settlementRef('carbon', eventCode, carbonMode, policies.carbonPolicy, ownerRef, receiverRef, context)).filter(Boolean)
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

    /** Creates a Waste ownership event for the gift journey. */
    ownershipEvent: function (request, asset, ownerRef, receiverRef, status, settlementRefs, context) {
        let giftCode = request.giftTransferRef && request.giftTransferRef.code || request.giftCode || context.idempotencyKey || 'GIFT';
        let eventCode = this.codePart(request.ownershipEventCode || [asset.code, 'GIFT', giftCode].join('_'));
        return UTILS.persistenceModel({
            code: eventCode,
            assetCode: asset.code,
            fromOwnerRef: ownerRef,
            toOwnerRef: receiverRef,
            transferType: 'GIFT',
            transferStatus: status,
            policyCode: request.transferPolicy && request.transferPolicy.code,
            triggerRef: request.giftTransferRef,
            rewardSettlementRefs: settlementRefs.reward,
            carbonSettlementRefs: settlementRefs.carbon,
            evidenceRefs: this.array(asset.evidenceRefs),
            occurredAt: context.now,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            revision: 0
        });
    },

    /** Requests a gift and locks the Waste asset into pending acceptance. */
    requestGift: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let policies = this.resolvePolicies(request);
        if (policies.transferPolicy.transferType !== 'GIFT') this.fail('ERR_WASTE_GIFT_TRANSFER_POLICY_REQUIRED', 'transfer policy must be GIFT');
        if (this.matchesExistingEvent(request, 'PENDING_ACCEPTANCE')) {
            let existing = request.existingOwnershipEvent || request.existingGiftEvent;
            return { idempotent: true, asset: asset, ownershipEvent: existing, settlementReferences: { reward: this.array(existing.rewardSettlementRefs), carbon: this.array(existing.carbonSettlementRefs) }, auditEvents: [], domainEvents: [] };
        }
        if (['OWNED', 'LISTED'].indexOf(asset.assetStatus) < 0) this.fail('ERR_WASTE_ASSET_GIFT_STATE_INVALID', 'asset must be OWNED or LISTED before gift request');
        let ownerRef = this.ownerRef(asset, request);
        let receiverRef = this.receiverRef(ownerRef, request, policies.transferPolicy);
        let context = { now: request.now || new Date(), correlationId: request.correlationId || asset.correlationId, idempotencyKey: request.idempotencyKey || asset.idempotencyKey, principalRef: request.principalRef };
        let eventCode = this.codePart(request.ownershipEventCode || [asset.code, 'GIFT', context.idempotencyKey || receiverRef.code].join('_'));
        let settlementReferences = this.settlementRefs(eventCode, ownerRef, receiverRef, policies, context);
        let ownershipEvent = this.ownershipEvent(Object.assign({}, request, { ownershipEventCode: eventCode }), asset, ownerRef, receiverRef, 'PENDING_ACCEPTANCE', settlementReferences, context);
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, { assetStatus: 'GIFT_PENDING', correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(asset.revision || 0) + 1 }));
        return {
            idempotent: false,
            asset: nextAsset,
            ownershipEvent: ownershipEvent,
            settlementReferences: settlementReferences,
            auditEvents: [this.auditEvent('waste.asset.gift.request', 'pendingAcceptance', ownershipEvent.code, context)],
            domainEvents: [
                this.domainEvent('waste.asset.gift.requested', { assetCode: asset.code, ownershipEventCode: ownershipEvent.code, receiverRef: receiverRef }, context),
                this.domainEvent('waste.asset.settlement.requested', { assetCode: asset.code, rewardSettlementRefs: settlementReferences.reward, carbonSettlementRefs: settlementReferences.carbon }, context)
            ]
        };
    },

    /** Accepts a pending gift and transfers Waste asset ownership to the receiver. */
    acceptGift: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let policies = this.resolvePolicies(request);
        if (policies.transferPolicy.transferType !== 'GIFT') this.fail('ERR_WASTE_GIFT_TRANSFER_POLICY_REQUIRED', 'transfer policy must be GIFT');
        if (this.matchesExistingEvent(request, 'COMPLETED')) {
            let existing = request.existingOwnershipEvent || request.existingGiftEvent;
            return { idempotent: true, asset: asset, ownershipEvent: existing, settlementReferences: { reward: this.array(existing.rewardSettlementRefs), carbon: this.array(existing.carbonSettlementRefs) }, auditEvents: [], domainEvents: [] };
        }
        if (asset.assetStatus !== 'GIFT_PENDING') this.fail('ERR_WASTE_ASSET_GIFT_NOT_PENDING', 'asset must be GIFT_PENDING before gift acceptance');
        let ownerRef = SOURCE_REF.normalize(request.existingGiftEvent && request.existingGiftEvent.fromOwnerRef || asset.ownerRef, true);
        let receiverRef = SOURCE_REF.normalize(request.receiverRef || request.authOwnerRef || request.existingGiftEvent && request.existingGiftEvent.toOwnerRef, true);
        if (request.existingGiftEvent && !this.sameRef(receiverRef, request.existingGiftEvent.toOwnerRef)) this.fail('ERR_WASTE_GIFT_RECEIVER_MISMATCH', 'receiver must match pending gift receiver');
        let context = { now: request.now || new Date(), correlationId: request.correlationId || asset.correlationId, idempotencyKey: request.idempotencyKey || asset.idempotencyKey, principalRef: request.principalRef };
        let eventCode = this.codePart(request.ownershipEventCode || request.existingGiftEvent && request.existingGiftEvent.code || [asset.code, 'GIFT', context.idempotencyKey || receiverRef.code].join('_'));
        let settlementReferences = request.existingGiftEvent ? { reward: this.array(request.existingGiftEvent.rewardSettlementRefs), carbon: this.array(request.existingGiftEvent.carbonSettlementRefs) } : this.settlementRefs(eventCode, ownerRef, receiverRef, policies, context);
        let ownershipEvent = this.ownershipEvent(Object.assign({}, request, { ownershipEventCode: eventCode }), asset, ownerRef, receiverRef, 'COMPLETED', settlementReferences, context);
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, { ownerRef: receiverRef, assetStatus: 'GIFTED', correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(asset.revision || 0) + 1 }));
        return {
            idempotent: false,
            asset: nextAsset,
            ownershipEvent: ownershipEvent,
            settlementReferences: settlementReferences,
            auditEvents: [this.auditEvent('waste.asset.gift.accept', 'completed', ownershipEvent.code, context)],
            domainEvents: [
                this.domainEvent('waste.asset.gift.completed', { assetCode: asset.code, ownershipEventCode: ownershipEvent.code, receiverRef: receiverRef }, context),
                this.domainEvent('waste.asset.settlement.requested', { assetCode: asset.code, rewardSettlementRefs: settlementReferences.reward, carbonSettlementRefs: settlementReferences.carbon }, context)
            ]
        };
    },

    /** Cancels a pending gift and returns the Waste asset to the configured status. */
    cancelGift: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let policies = this.resolvePolicies(request);
        if (policies.transferPolicy.transferType !== 'GIFT') this.fail('ERR_WASTE_GIFT_TRANSFER_POLICY_REQUIRED', 'transfer policy must be GIFT');
        let context = { now: request.now || new Date(), correlationId: request.correlationId || asset.correlationId, idempotencyKey: request.idempotencyKey || asset.idempotencyKey, principalRef: request.principalRef };
        if (this.matchesExistingEvent(request, 'CANCELLED')) {
            let existing = request.existingOwnershipEvent || request.existingGiftEvent;
            return { idempotent: true, asset: asset, ownershipEvent: existing, settlementReferences: { reward: this.array(existing.rewardSettlementRefs), carbon: this.array(existing.carbonSettlementRefs) }, auditEvents: [], domainEvents: [] };
        }
        if (asset.assetStatus !== 'GIFT_PENDING') this.fail('ERR_WASTE_ASSET_GIFT_NOT_PENDING', 'asset must be GIFT_PENDING before gift cancellation');
        let event = request.existingGiftEvent && UTILS.persistenceModel(Object.assign({}, request.existingGiftEvent, { transferStatus: 'CANCELLED', occurredAt: context.now, correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(request.existingGiftEvent.revision || 0) + 1 }));
        let nextStatus = policies.transferPolicy.cancellationAssetStatus || 'OWNED';
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, { assetStatus: nextStatus, correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(asset.revision || 0) + 1 }));
        return {
            idempotent: false,
            asset: nextAsset,
            ownershipEvent: event,
            settlementReferences: { reward: this.array(event && event.rewardSettlementRefs), carbon: this.array(event && event.carbonSettlementRefs) },
            auditEvents: [this.auditEvent('waste.asset.gift.cancel', 'cancelled', event && event.code || asset.code, context)],
            domainEvents: [this.domainEvent('waste.asset.gift.cancelled', { assetCode: asset.code, ownershipEventCode: event && event.code }, context)]
        };
    }
};
