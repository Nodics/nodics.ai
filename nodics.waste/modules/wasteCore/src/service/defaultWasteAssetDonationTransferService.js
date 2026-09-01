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

/** @module wasteCore/src/service/defaultWasteAssetDonationTransferService @description Coordinates Waste-side donation and recycling transfer contracts without owning logistics, recycler operations, compliance review, or Wallet/Loyalty ledger state. @layer service @owner wasteCore */
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

    /** Resolves transfer and settlement policies for donation/recycling behavior. */
    resolvePolicies: function (request) {
        request = request || {};
        let transferPolicy = Object.assign({
            code: 'WASTE_DONATION_TRANSFER_STANDARD',
            transferType: 'DONATE',
            ownershipTransferMode: 'TRANSFER_TO_COUNTERPARTY',
            rewardTransferMode: 'NONE',
            carbonTransferMode: 'TRANSFER_TO_COUNTERPARTY',
            eligibleAssetStatuses: ['OWNED', 'GIFTED'],
            allowSelfTransfer: false,
            requiresOwnerApproval: true,
            requiresCounterpartyAcceptance: true,
            requiresReceiptConfirmation: true,
            requiresComplianceReview: true,
            lockRequired: true,
            completionAssetStatus: 'DONATED',
            completionCustodyStatus: 'TRANSFERRED_TO_RECYCLER',
            cancellationAssetStatus: 'OWNED',
            reversalAssetStatus: 'OWNED'
        }, request.transferPolicy || {});
        let rewardPolicy = Object.assign({
            code: request.rewardSettlementPolicyCode,
            triggerType: 'DONATION',
            settlementMode: transferPolicy.rewardTransferMode,
            walletCurrencyCode: 'SUSTAINABILITY_REWARD',
            reversalAllowed: true
        }, request.rewardSettlementPolicy || {});
        let carbonPolicy = Object.assign({
            code: request.carbonSettlementPolicyCode,
            triggerType: 'DONATION',
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

    /** Requires a donation receiver/recycler reference and forbids self-transfer unless policy allows it. */
    receiverRef: function (ownerRef, request, transferPolicy) {
        let receiverRef = SOURCE_REF.normalize(request.receiverRef || request.recyclerRef || request.donationReceiverRef, true);
        if (!transferPolicy.allowSelfTransfer && this.sameRef(ownerRef, receiverRef)) {
            this.fail('ERR_WASTE_ASSET_SELF_DONATION_FORBIDDEN', 'donation receiver must differ from owner');
        }
        return receiverRef;
    },

    /** Returns true when the same donation event was already handled. */
    matchesExistingEvent: function (request, expectedStatus) {
        let existing = request.existingOwnershipEvent || request.existingDonationEvent;
        if (!existing || existing.transferType !== 'DONATE') return false;
        if (expectedStatus && existing.transferStatus !== expectedStatus) return false;
        if (request.idempotencyKey && existing.idempotencyKey === request.idempotencyKey) return true;
        return !!request.donationRef && existing.triggerRef && this.sameRef(existing.triggerRef, request.donationRef);
    },

    /** Builds a wallet-owned settlement intent reference without mutating ledger state. */
    settlementRef: function (kind, eventCode, mode, policy, fromOwnerRef, toOwnerRef, context) {
        if (!mode || mode === 'NONE') return undefined;
        return {
            module: 'wallet',
            schema: kind === 'reward' ? 'rewardSettlementIntent' : 'carbonSettlementIntent',
            code: [eventCode, kind === 'reward' ? 'REWARD' : 'CARBON', 'DONATION'].join('_'),
            policyCode: policy && policy.code,
            settlementMode: mode,
            fromOwnerRef: fromOwnerRef,
            toOwnerRef: toOwnerRef,
            state: 'REQUESTED',
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey
        };
    },

    /** Resolves who should receive a settlement intent reference for the chosen mode. */
    settlementReceiverRef: function (mode, ownerRef, receiverRef, request) {
        if (mode === 'TRANSFER_TO_COUNTERPARTY') return receiverRef;
        if (mode === 'TRANSFER_TO_ENTERPRISE' || mode === 'TRANSFER_TO_DEFAULT_ENTERPRISE' || mode === 'TRANSFER_TO_FIXED_ENTERPRISE') {
            return SOURCE_REF.normalize(request.enterpriseRef || request.defaultEnterpriseRef || request.fixedEnterpriseRef || receiverRef, true);
        }
        return ownerRef;
    },

    /** Builds donation/recycling settlement references from policy modes. */
    settlementRefs: function (eventCode, ownerRef, receiverRef, policies, request, context) {
        let rewardMode = policies.rewardPolicy.settlementMode || policies.transferPolicy.rewardTransferMode;
        let carbonMode = policies.carbonPolicy.settlementMode || policies.transferPolicy.carbonTransferMode;
        return {
            reward: this.array(this.settlementRef('reward', eventCode, rewardMode, policies.rewardPolicy, ownerRef, this.settlementReceiverRef(rewardMode, ownerRef, receiverRef, request), context)).filter(Boolean),
            carbon: this.array(this.settlementRef('carbon', eventCode, carbonMode, policies.carbonPolicy, ownerRef, this.settlementReceiverRef(carbonMode, ownerRef, receiverRef, request), context)).filter(Boolean)
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

    /** Creates a Waste ownership event for the donation/recycling journey. */
    ownershipEvent: function (request, asset, ownerRef, receiverRef, status, settlementRefs, context) {
        let donationCode = request.donationRef && request.donationRef.code || request.donationCode || context.idempotencyKey || 'DONATION';
        let eventCode = this.codePart(request.ownershipEventCode || [asset.code, 'DONATION', donationCode].join('_'));
        let movementRef = SOURCE_REF.normalize(request.movementRef, false);
        let complianceEvidenceRef = SOURCE_REF.normalize(request.complianceEvidenceRef, false);
        return UTILS.persistenceModel({
            code: eventCode,
            assetCode: asset.code,
            fromOwnerRef: ownerRef,
            toOwnerRef: receiverRef,
            transferType: 'DONATE',
            transferStatus: status,
            policyCode: request.transferPolicy && request.transferPolicy.code,
            triggerRef: request.donationRef || request.movementRef || request.complianceEvidenceRef,
            rewardSettlementRefs: settlementRefs.reward,
            carbonSettlementRefs: settlementRefs.carbon,
            movementRef: movementRef,
            complianceEvidenceRef: complianceEvidenceRef,
            evidenceRefs: this.array(asset.evidenceRefs).concat(this.array(request.evidenceRefs)),
            occurredAt: context.now,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            revision: 0
        });
    },

    /** Requests donation/recycling and locks the Waste asset into pending acceptance. */
    requestDonation: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let policies = this.resolvePolicies(request);
        if (policies.transferPolicy.transferType !== 'DONATE') this.fail('ERR_WASTE_DONATION_TRANSFER_POLICY_REQUIRED', 'transfer policy must be DONATE');
        if (this.matchesExistingEvent(request, 'PENDING_ACCEPTANCE')) {
            let existing = request.existingOwnershipEvent || request.existingDonationEvent;
            return { idempotent: true, asset: asset, ownershipEvent: existing, settlementReferences: { reward: this.array(existing.rewardSettlementRefs), carbon: this.array(existing.carbonSettlementRefs) }, auditEvents: [], domainEvents: [] };
        }
        let eligibleStatuses = this.array(policies.transferPolicy.eligibleAssetStatuses);
        if (eligibleStatuses.length && eligibleStatuses.indexOf(asset.assetStatus) < 0) this.fail('ERR_WASTE_ASSET_DONATION_STATE_INVALID', 'asset status is not eligible for donation');
        let ownerRef = this.ownerRef(asset, request);
        let receiverRef = this.receiverRef(ownerRef, request, policies.transferPolicy);
        let context = { now: request.now || new Date(), correlationId: request.correlationId || asset.correlationId, idempotencyKey: request.idempotencyKey || asset.idempotencyKey, principalRef: request.principalRef };
        let eventCode = this.codePart(request.ownershipEventCode || [asset.code, 'DONATION', context.idempotencyKey || receiverRef.code].join('_'));
        let settlementReferences = this.settlementRefs(eventCode, ownerRef, receiverRef, policies, request, context);
        let ownershipEvent = this.ownershipEvent(Object.assign({}, request, { ownershipEventCode: eventCode }), asset, ownerRef, receiverRef, 'PENDING_ACCEPTANCE', settlementReferences, context);
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, { assetStatus: 'DONATION_PENDING', correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(asset.revision || 0) + 1 }));
        return {
            idempotent: false,
            asset: nextAsset,
            ownershipEvent: ownershipEvent,
            settlementReferences: settlementReferences,
            auditEvents: [this.auditEvent('waste.asset.donation.request', 'pendingAcceptance', ownershipEvent.code, context)],
            domainEvents: [
                this.domainEvent('waste.asset.donation.requested', { assetCode: asset.code, ownershipEventCode: ownershipEvent.code, receiverRef: receiverRef }, context),
                this.domainEvent('waste.asset.settlement.requested', { assetCode: asset.code, rewardSettlementRefs: settlementReferences.reward, carbonSettlementRefs: settlementReferences.carbon }, context)
            ]
        };
    },

    /** Completes donation/recycling after receiver, movement, or compliance confirmation. */
    completeDonation: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let policies = this.resolvePolicies(request);
        if (policies.transferPolicy.transferType !== 'DONATE') this.fail('ERR_WASTE_DONATION_TRANSFER_POLICY_REQUIRED', 'transfer policy must be DONATE');
        if (this.matchesExistingEvent(request, 'COMPLETED')) {
            let existing = request.existingOwnershipEvent || request.existingDonationEvent;
            return { idempotent: true, asset: asset, ownershipEvent: existing, settlementReferences: { reward: this.array(existing.rewardSettlementRefs), carbon: this.array(existing.carbonSettlementRefs) }, auditEvents: [], domainEvents: [] };
        }
        if (asset.assetStatus !== 'DONATION_PENDING') this.fail('ERR_WASTE_ASSET_DONATION_NOT_PENDING', 'asset must be DONATION_PENDING before donation completion');
        if (policies.transferPolicy.requiresReceiptConfirmation && !request.movementRef && !(request.existingDonationEvent && request.existingDonationEvent.movementRef)) this.fail('ERR_WASTE_DONATION_MOVEMENT_REF_REQUIRED', 'movementRef is required for donation completion');
        if (policies.transferPolicy.requiresComplianceReview && !request.complianceEvidenceRef && !(request.existingDonationEvent && request.existingDonationEvent.complianceEvidenceRef)) this.fail('ERR_WASTE_DONATION_COMPLIANCE_EVIDENCE_REF_REQUIRED', 'complianceEvidenceRef is required for donation completion');
        let ownerRef = SOURCE_REF.normalize(request.existingDonationEvent && request.existingDonationEvent.fromOwnerRef || asset.ownerRef, true);
        let receiverRef = SOURCE_REF.normalize(request.receiverRef || request.recyclerRef || request.donationReceiverRef || request.existingDonationEvent && request.existingDonationEvent.toOwnerRef, true);
        if (request.existingDonationEvent && !this.sameRef(receiverRef, request.existingDonationEvent.toOwnerRef)) this.fail('ERR_WASTE_DONATION_RECEIVER_MISMATCH', 'receiver must match pending donation receiver');
        let context = { now: request.now || new Date(), correlationId: request.correlationId || asset.correlationId, idempotencyKey: request.idempotencyKey || asset.idempotencyKey, principalRef: request.principalRef };
        let eventCode = this.codePart(request.ownershipEventCode || request.existingDonationEvent && request.existingDonationEvent.code || [asset.code, 'DONATION', context.idempotencyKey || receiverRef.code].join('_'));
        let settlementReferences = request.existingDonationEvent ? { reward: this.array(request.existingDonationEvent.rewardSettlementRefs), carbon: this.array(request.existingDonationEvent.carbonSettlementRefs) } : this.settlementRefs(eventCode, ownerRef, receiverRef, policies, request, context);
        let eventRequest = Object.assign({}, request, {
            ownershipEventCode: eventCode,
            movementRef: request.movementRef || request.existingDonationEvent && request.existingDonationEvent.movementRef,
            complianceEvidenceRef: request.complianceEvidenceRef || request.existingDonationEvent && request.existingDonationEvent.complianceEvidenceRef
        });
        let ownershipEvent = this.ownershipEvent(eventRequest, asset, ownerRef, receiverRef, 'COMPLETED', settlementReferences, context);
        let nextOwnerRef = policies.transferPolicy.ownershipTransferMode === 'RETAIN_CURRENT_OWNER' ? ownerRef : receiverRef;
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, {
            ownerRef: nextOwnerRef,
            physicalOwnerRef: receiverRef,
            assetStatus: policies.transferPolicy.completionAssetStatus || 'DONATED',
            custodyStatus: policies.transferPolicy.completionCustodyStatus || asset.custodyStatus,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            revision: Number(asset.revision || 0) + 1
        }));
        return {
            idempotent: false,
            asset: nextAsset,
            ownershipEvent: ownershipEvent,
            settlementReferences: settlementReferences,
            auditEvents: [this.auditEvent('waste.asset.donation.complete', 'completed', ownershipEvent.code, context)],
            domainEvents: [
                this.domainEvent('waste.asset.donation.completed', { assetCode: asset.code, ownershipEventCode: ownershipEvent.code, receiverRef: receiverRef, movementRef: ownershipEvent.movementRef, complianceEvidenceRef: ownershipEvent.complianceEvidenceRef }, context),
                this.domainEvent('waste.asset.settlement.requested', { assetCode: asset.code, rewardSettlementRefs: settlementReferences.reward, carbonSettlementRefs: settlementReferences.carbon }, context)
            ]
        };
    },

    /** Cancels a pending donation and returns the Waste asset to policy status. */
    cancelDonation: function (request) {
        request = request || {};
        let asset = request.asset || {};
        let policies = this.resolvePolicies(request);
        if (policies.transferPolicy.transferType !== 'DONATE') this.fail('ERR_WASTE_DONATION_TRANSFER_POLICY_REQUIRED', 'transfer policy must be DONATE');
        let context = { now: request.now || new Date(), correlationId: request.correlationId || asset.correlationId, idempotencyKey: request.idempotencyKey || asset.idempotencyKey, principalRef: request.principalRef };
        if (this.matchesExistingEvent(request, 'CANCELLED')) {
            let existing = request.existingOwnershipEvent || request.existingDonationEvent;
            return { idempotent: true, asset: asset, ownershipEvent: existing, settlementReferences: { reward: this.array(existing.rewardSettlementRefs), carbon: this.array(existing.carbonSettlementRefs) }, auditEvents: [], domainEvents: [] };
        }
        if (asset.assetStatus !== 'DONATION_PENDING') this.fail('ERR_WASTE_ASSET_DONATION_NOT_PENDING', 'asset must be DONATION_PENDING before donation cancellation');
        let event = request.existingDonationEvent && UTILS.persistenceModel(Object.assign({}, request.existingDonationEvent, { transferStatus: 'CANCELLED', occurredAt: context.now, correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(request.existingDonationEvent.revision || 0) + 1 }));
        let nextStatus = policies.transferPolicy.cancellationAssetStatus || 'OWNED';
        let nextAsset = UTILS.persistenceModel(Object.assign({}, asset, { assetStatus: nextStatus, correlationId: context.correlationId, idempotencyKey: context.idempotencyKey, revision: Number(asset.revision || 0) + 1 }));
        return {
            idempotent: false,
            asset: nextAsset,
            ownershipEvent: event,
            settlementReferences: { reward: this.array(event && event.rewardSettlementRefs), carbon: this.array(event && event.carbonSettlementRefs) },
            auditEvents: [this.auditEvent('waste.asset.donation.cancel', 'cancelled', event && event.code || asset.code, context)],
            domainEvents: [this.domainEvent('waste.asset.donation.cancelled', { assetCode: asset.code, ownershipEventCode: event && event.code }, context)]
        };
    }
};
