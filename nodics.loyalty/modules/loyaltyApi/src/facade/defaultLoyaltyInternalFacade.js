/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyApi/src/facade/defaultLoyaltyInternalFacade @description Validates internal Loyalty requests and delegates wallet, reservation and reversal operations to their owning services. @layer facade @owner loyaltyApi @override Later modules may extend validation while preserving owning services and stable movement references. */
module.exports = {
    /**
     * Proves transfer source from immutable accounting evidence, never caller assertions.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    transferNotificationSource: function (request) { return this.service('DefaultLoyaltyTransferNotificationService').source(request); },
    /**
     * Delegates exact bid funding qualification to Wallet.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    auctionQualify: function (request) { return this.service('DefaultLoyaltyAuctionFundsService').qualify(request); },
    /**
     * Delegates held bid evidence without performing accounting.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    auctionInspect: function (request) { return this.service('DefaultLoyaltyAuctionFundsService').inspect(request); },
    /**
     * Delegates the original bid reservation.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    auctionReserve: function (request) { return this.service('DefaultLoyaltyAuctionFundsService').reserve(request); },
    /**
     * Delegates canonical delta adjustment.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    auctionAdjust: function (request) { return this.service('DefaultLoyaltyAuctionFundsService').adjust(request); },
    /**
     * Delegates owner-proven hold release.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    auctionRelease: function (request) { return this.service('DefaultLoyaltyAuctionFundsService').release(request); },
    /**
     * Delegates Checkout-proven winner capture.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    auctionCapture: function (request) { return this.service('DefaultLoyaltyAuctionFundsService').capture(request); },
    /**
     * Reads an existing wallet owned by the original participant without provisioning.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    participantWallet: function (request) { return this.service('DefaultLoyaltyParticipantWalletService').read(request); },
    /**
     * Delegates confirmed test-only funding to Wallet with the original administrator identity.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    enterpriseTestCredit: function (request) { return this.service('DefaultLoyaltyEnterpriseTestCreditService').credit(request); },
    /**
     * Reads governed transfer settings from Wallet.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    transferSettings: function (request) { return this.service('DefaultLoyaltyParticipantTransferService').settings(request); },
    /**
     * Changes governed selections through Wallet's permission and revision checks.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    updateTransferSettings: function (request) { return this.service('DefaultLoyaltyParticipantTransferService').updateSettings(request); },
    /**
     * Delegates private participant choices to their existing conversion owner.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    partnerConversionOptions: function (request) { return this.service('DefaultLoyaltyPartnerRewardConversionService').options(request); },
    /**
     * Delegates partner quotes to the shared Wallet coordinator.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    partnerConversionQuote: function (request) { return this.service('DefaultLoyaltyPartnerRewardConversionService').quote(request); },
    /**
     * Delegates retained quote confirmation without constructing authority.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    partnerConversionConfirm: function (request) { return this.service('DefaultLoyaltyPartnerRewardConversionService').confirm(request); },
    /**
     * Delegates original-operation recovery to the conversion owner.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    partnerConversionStatus: function (request) { return this.service('DefaultLoyaltyPartnerRewardConversionService').status(request); },
    /**
     * Delegates authenticated participant transfer without elevating the caller to a service principal.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    participantTransfer: function (request) { return this.service('DefaultLoyaltyParticipantTransferService').transfer(request); },
    /**
     * Delegates original-command status under the currently authorized owner.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    participantTransferStatus: function (request) { return this.service('DefaultLoyaltyParticipantTransferService').status(request); },
    /**
     * Delegates exact read-only balance evidence without opening wallets.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    walletEvidence: function (request) { return this.service('DefaultLoyaltyReadEvidenceService').walletEvidence(request); },
    /**
     * Keeps exact reward precision and program validity with the Loyalty owner.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    rewardUnitEvidence: function (request) { return this.service('DefaultLoyaltyReadEvidenceService').rewardUnitEvidence(request); },
    /**
     * Delegates exact read-only append-only movement evidence.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    ledgerEvidence: function (request) { return this.service('DefaultLoyaltyReadEvidenceService').ledgerEvidence(request); },
    /**
     * Delegates one exact participant-owned reservation read without changing its lifecycle.
     * @param {Object} request Original trusted request with typed owner and reservation selectors.
     * @returns {Promise<Object>} Owning Loyalty evidence result.
     * @throws {Error} Owner admission and persistence failures propagate unchanged.
     * @override Preserve the read-only owner contract and original signed runtime scope.
     */
    reservationEvidence: function (request) { return this.service('DefaultLoyaltyReadEvidenceService').reservationEvidence(request); },
    /**
     * Delegates one exact participant-owned redemption read without changing accounting.
     * @param {Object} request Original trusted request with typed owner and redemption selectors.
     * @returns {Promise<Object>} Owning Loyalty evidence result.
     * @throws {Error} Owner admission and persistence failures propagate unchanged.
     * @override Preserve the read-only owner contract and original signed runtime scope.
     */
    redemptionEvidence: function (request) { return this.service('DefaultLoyaltyReadEvidenceService').redemptionEvidence(request); },
    /**
     * Returns the result from a generated-service envelope without changing record ownership.
     * @param {Object} response Dependency response envelope to validate.
     * @returns {*} Existing result payload when present, otherwise the original envelope; performs no success validation or writes.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    unwrap: function (response) {
        return response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response;
    },
    /**
     * Throws the owning operation error and stops processing; callers retain responsibility for recovery.
     * @param {string} message Content-safe owner diagnostic.
     * @returns {never} Always throws a content-safe owner error; no business writes.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    fail: function (message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ?
            new CLASSES.NodicsError('ERR_LOYALTY_00000', message) : new Error(message);
        error.code = error.code || 'ERR_LOYALTY_00000';
        throw error;
    },
    /**
     * Rejects a missing or blank required value before dispatching the owning operation.
     * @param {*} value Value to validate, normalize or project as described above.
     * @param {string} name Owner-selected service or header name.
     * @returns {*} Validated required value; no persistence.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    required: function (value, name) {
        if (value === undefined || value === null || String(value).trim() === '') this.fail(name + ' is required');
        return value;
    },
    /**
     * Resolves the named loader-composed service and rejects a required service that is unavailable.
     * @param {string} name Owner-selected service or header name.
     * @returns {Object} Registered effective service; missing required dependencies refuse.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    service: function (name) {
        let service = typeof SERVICE !== 'undefined' ? SERVICE[name] : undefined;
        if (!service) {
            let error = new Error(name + ' is not available');
            error.code = 'ERR_LOYALTY_API_SERVICE_MISSING';
            throw error;
        }
        return service;
    },
    /**
     * Delegates the wallet open operation to Loyalty.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    openWallet: function (request) { return this.service('DefaultLoyaltyWalletOperationService').open(request); },
    /**
     * Delegates the wallet projection operation to Loyalty.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    ownerWalletProjection: function (request) { return this.service('DefaultLoyaltyWalletOperationService').projection(request); },
    /**
     * Delegates the wallet earn operation to Loyalty.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    earnRewards: function (request) { return this.service('DefaultLoyaltyWalletOperationService').earn(request); },
    /**
     * Delegates a service-authorized wallet transfer.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    transferRewards: function(request) { return this.service('DefaultLoyaltyRewardTransferService').transfer(request); },
    /**
     * Loads the requested wallet through the generated Loyalty service with the trusted request context.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Promise<Object>>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    wallet: async function (request) {
        let walletCode = request.walletCode || request.params && request.params.walletCode || request.payload && request.payload.walletCode;
        this.required(walletCode, 'walletCode');
        const operation = this.service('DefaultLoyaltyRewardOperationService');
        let result = await this.service('DefaultLoyaltyWalletService').get(
            operation.serviceRequest(request, { query: { code: walletCode }, pageSize: 1 })
        );
        let wallet = this.unwrap(result);
        return Array.isArray(wallet) ? wallet[0] : wallet;
    },
    /**
     * Forwards reward reservation to Loyalty; the operation requires a stable idempotency key.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    reserveRewards: function (request) {
        request.idempotencyKey = request.idempotencyKey || request.payload && request.payload.idempotencyKey;
        this.required(request.idempotencyKey, 'idempotencyKey');
        return this.service('DefaultLoyaltyRewardOperationService').reserve(request);
    },
    /**
     * Forwards capture of the specified reservation; Loyalty validates its state and records redemption.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    captureReservation: function (request) {
        request.reservationCode = request.reservationCode || request.params && request.params.reservationCode;
        request.idempotencyKey = request.idempotencyKey || request.payload && request.payload.idempotencyKey;
        this.required(request.reservationCode, 'reservationCode');
        this.required(request.idempotencyKey, 'idempotencyKey');
        return this.service('DefaultLoyaltyRewardOperationService').capture(request);
    },
    /**
     * Forwards release of the specified reservation; Loyalty returns held rewards through ledger-backed operations.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    releaseReservation: function (request) {
        request.reservationCode = request.reservationCode || request.params && request.params.reservationCode;
        request.idempotencyKey = request.idempotencyKey || request.payload && request.payload.idempotencyKey;
        this.required(request.reservationCode, 'reservationCode');
        this.required(request.idempotencyKey, 'idempotencyKey');
        return this.service('DefaultLoyaltyRewardOperationService').release(request);
    },
    /**
     * Forwards reversal of the referenced ledger entry; historical entries remain append-only.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<Object>} Owning service result; effects and failures remain with the delegated capability.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    reverseLedgerEntry: function (request) {
        let entryCode = request.entryCode || request.params && request.params.entryCode;
        request.reversalOfEntryCode = request.reversalOfEntryCode || entryCode;
        request.idempotencyKey = request.idempotencyKey || request.payload && request.payload.idempotencyKey;
        this.required(request.reversalOfEntryCode, 'entryCode');
        this.required(request.idempotencyKey, 'idempotencyKey');
        return this.service('DefaultLoyaltyRewardOperationService').reverse(request);
    }
};
