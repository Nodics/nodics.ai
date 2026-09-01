/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const UTILS = require('../../../../../../../nodics.waste/modules/wasteCore/src/utils/utils');
const SOURCE_REF = require('../../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteSourceReferenceService');

/** @module wasteRecycling/src/service/defaultWasteRecyclingHandoffContractService @description Builds provider-neutral recycling handoff and completion contracts without owning concrete logistics or recycler adapters. @layer service @owner wasteRecycling */
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

    /** Normalizes code components for deterministic handoff identifiers. */
    codePart: function (value) {
        return UTILS.normalizeCode(value).replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    },

    /** Compares two normalized source references. */
    sameRef: function (left, right) {
        return !!left && !!right && left.module === right.module && left.schema === right.schema && left.code === right.code;
    },

    /** Rejects provider implementation details that must stay project-owned. */
    assertProviderNeutral: function (value, path) {
        if (!value || typeof value !== 'object') return true;
        let forbidden = [
            'apiKey',
            'accessToken',
            'refreshToken',
            'clientSecret',
            'secret',
            'password',
            'trackingNumber',
            'carrierCode',
            'certificateNumber',
            'walletBalance',
            'ledgerEntry',
            'ledgerEntries',
            'recyclerAdapter',
            'logisticsAdapter'
        ];
        Object.keys(value).forEach(function (key) {
            if (forbidden.indexOf(key) >= 0) {
                this.fail('ERR_WASTE_RECYCLING_PROVIDER_DETAIL_FORBIDDEN', (path || 'request') + '.' + key + ' must stay outside reusable recycling contracts');
            }
            this.assertProviderNeutral(value[key], (path || 'request') + '.' + key);
        }, this);
        return true;
    },

    /** Requires a pending donation ownership event that belongs to the asset. */
    assertPendingDonation: function (asset, donationEvent) {
        if (!asset || !asset.code) this.fail('ERR_WASTE_RECYCLING_ASSET_REQUIRED', 'asset is required');
        if (asset.assetStatus !== 'DONATION_PENDING') this.fail('ERR_WASTE_RECYCLING_ASSET_NOT_PENDING_DONATION', 'asset must be DONATION_PENDING before recycling handoff');
        if (!donationEvent || donationEvent.assetCode !== asset.code || donationEvent.transferType !== 'DONATE') {
            this.fail('ERR_WASTE_RECYCLING_DONATION_EVENT_REQUIRED', 'matching DONATE ownership event is required');
        }
        if (donationEvent.transferStatus !== 'PENDING_ACCEPTANCE') {
            this.fail('ERR_WASTE_RECYCLING_DONATION_EVENT_NOT_PENDING', 'donation event must be PENDING_ACCEPTANCE before recycling handoff');
        }
        return donationEvent;
    },

    /** Builds a framework audit entry for later audit persistence. */
    auditEvent: function (eventType, outcome, subjectCode, context) {
        return {
            eventType: eventType,
            outcome: outcome,
            moduleName: 'wasteRecycling',
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
            aggregateType: 'wasteRecyclingHandoff',
            aggregateCode: payload.handoffCode,
            payload: payload,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            occurredAt: context.now
        };
    },

    /** Creates a provider-neutral movement intent from a pending donation asset. */
    requestHandoff: function (request) {
        request = request || {};
        this.assertProviderNeutral(request);
        let asset = request.asset || {};
        let donationEvent = this.assertPendingDonation(asset, request.donationEvent || request.existingDonationEvent);
        let receiverRef = SOURCE_REF.normalize(request.receiverRef || request.recyclerRef || donationEvent.toOwnerRef, true);
        if (!this.sameRef(receiverRef, donationEvent.toOwnerRef)) this.fail('ERR_WASTE_RECYCLING_RECEIVER_MISMATCH', 'receiver must match pending donation receiver');
        let sourceLocationRef = SOURCE_REF.normalize(request.sourceLocationRef, true);
        let targetLocationRef = SOURCE_REF.normalize(request.targetLocationRef, true);
        let providerProfileRef = SOURCE_REF.normalize(request.providerProfileRef, false);
        let context = { now: request.now || new Date(), correlationId: request.correlationId || asset.correlationId, idempotencyKey: request.idempotencyKey || asset.idempotencyKey, principalRef: request.principalRef };
        let handoffCode = this.codePart(request.handoffCode || [asset.code, 'RECYCLING_HANDOFF', context.idempotencyKey || receiverRef.code].join('_'));
        let movementIntent = UTILS.persistenceModel({
            module: 'wasteMovement',
            schema: 'wasteMovement',
            code: this.codePart(request.movementCode || [handoffCode, 'MOVEMENT'].join('_')),
            movementType: request.movementType || 'PICKUP',
            sourceLocationRef: sourceLocationRef,
            targetLocationRef: targetLocationRef,
            submissionCodes: this.array(asset.sourceSubmissionCode).filter(Boolean),
            receiptCodes: this.array(request.receiptCode).filter(Boolean),
            batchCode: request.batchCode,
            operatorRef: request.operatorRef,
            movementStatus: request.movementStatus || 'PLANNED',
            evidenceRefs: this.array(asset.evidenceRefs).concat(this.array(request.evidenceRefs)),
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey,
            revision: 0
        });
        let movementIntentRef = { module: 'wasteMovement', schema: 'wasteMovement', code: movementIntent.code };
        let handoffRequest = {
            module: 'wasteRecycling',
            schema: 'recyclingHandoffRequest',
            code: handoffCode,
            assetRef: { module: 'wasteCore', schema: 'wasteAsset', code: asset.code },
            donationEventRef: { module: 'wasteCore', schema: 'wasteAssetOwnershipEvent', code: donationEvent.code },
            receiverRef: receiverRef,
            providerProfileRef: providerProfileRef,
            movementIntentRef: movementIntentRef,
            requiredCompletionRefs: ['movementRef', 'complianceEvidenceRef'],
            callbackOperation: 'completeAssetDonation',
            state: 'REQUESTED',
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey
        };
        return {
            idempotent: false,
            handoffRequest: handoffRequest,
            movementIntent: movementIntent,
            auditEvents: [this.auditEvent('waste.recycling.handoff.request', 'requested', handoffCode, context)],
            domainEvents: [this.domainEvent('waste.recycling.handoff.requested', { handoffCode: handoffCode, assetCode: asset.code, movementIntentRef: movementIntentRef, receiverRef: receiverRef }, context)]
        };
    },

    /** Normalizes project/provider completion output into Waste donation completion input. */
    completionPayload: function (request) {
        request = request || {};
        this.assertProviderNeutral(request);
        let asset = request.asset || {};
        let donationEvent = this.assertPendingDonation(asset, request.donationEvent || request.existingDonationEvent);
        let receiverRef = SOURCE_REF.normalize(request.receiverRef || request.recyclerRef || donationEvent.toOwnerRef, true);
        if (!this.sameRef(receiverRef, donationEvent.toOwnerRef)) this.fail('ERR_WASTE_RECYCLING_RECEIVER_MISMATCH', 'receiver must match pending donation receiver');
        let movementRef = SOURCE_REF.normalize(request.movementRef, true);
        let complianceEvidenceRef = SOURCE_REF.normalize(request.complianceEvidenceRef, true);
        let context = { now: request.now || new Date(), correlationId: request.correlationId || asset.correlationId, idempotencyKey: request.idempotencyKey || asset.idempotencyKey, principalRef: request.principalRef };
        let handoffCode = this.codePart(request.handoffCode || [asset.code, 'RECYCLING_COMPLETION', context.idempotencyKey || movementRef.code].join('_'));
        return {
            donationCompletionRequest: {
                asset: asset,
                existingDonationEvent: donationEvent,
                receiverRef: receiverRef,
                movementRef: movementRef,
                complianceEvidenceRef: complianceEvidenceRef,
                transferPolicy: request.transferPolicy,
                correlationId: context.correlationId,
                idempotencyKey: context.idempotencyKey,
                principalRef: context.principalRef
            },
            auditEvents: [this.auditEvent('waste.recycling.handoff.complete', 'readyForWasteCompletion', handoffCode, context)],
            domainEvents: [this.domainEvent('waste.recycling.handoff.completionReady', { handoffCode: handoffCode, assetCode: asset.code, movementRef: movementRef, complianceEvidenceRef: complianceEvidenceRef, receiverRef: receiverRef }, context)]
        };
    }
};
