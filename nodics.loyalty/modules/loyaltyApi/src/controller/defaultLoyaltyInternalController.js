/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyApi/src/controller/defaultLoyaltyInternalController @description Maps Loyalty internal HTTP input to the Loyalty internal facade. @layer controller @owner loyaltyApi @override Later modules may adapt transport mapping while preserving resource contracts. */
module.exports = {
    /**
     * Maps private source proof without replacing the verified runtime principal.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    transferNotificationSource: function (request, callback) {
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('transferNotificationSource', request, callback);
    },
    /**
     * Preserves original participant or authorized recovery context for auction qualification.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    auctionQualify: function (request, callback) { return this.auctionCommand('auctionQualify', request, callback); },
    /**
     * Reads the original bid's holding evidence without writing funds.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    auctionInspect: function (request, callback) { return this.auctionCommand('auctionInspect', request, callback); },
    /**
     * Reserves only the persisted Bidding intent.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    auctionReserve: function (request, callback) { return this.auctionCommand('auctionReserve', request, callback); },
    /**
     * Adjusts the original hold rather than releasing and replacing it.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    auctionAdjust: function (request, callback) { return this.auctionCommand('auctionAdjust', request, callback); },
    /**
     * Releases only after canonical owner evidence confirms the outcome.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    auctionRelease: function (request, callback) { return this.auctionCommand('auctionRelease', request, callback); },
    /**
     * Captures only the original selected hold after Checkout decision evidence.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    auctionCapture: function (request, callback) { return this.auctionCommand('auctionCapture', request, callback); },
    /**
     * Applies shared private transport mapping without synthesizing authority.
     * @param {string|Function|Object} operation Owner-selected operation, transaction callback or persisted operation as described above.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    auctionCommand: function (operation, request, callback) {
        request.authorization = this.headerValue(request, 'Authorization');
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke(operation, request, callback);
    },
    /**
     * Reads the currently represented wallet with the original signed authority.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    participantWallet: function (request, callback) {
        request.authorization = this.headerValue(request, 'Authorization');
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('participantWallet', request, callback);
    },
    /**
     * Preserves original administrator credentials for isolated Enterprise test funding.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    enterpriseTestCredit: function (request, callback) {
        request.authorization = this.headerValue(request, 'Authorization');
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('enterpriseTestCredit', request, callback);
    },
    /**
     * Reads current-owner transfer controls with original signed identity.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    transferSettings: function (request, callback) {
        request.authorization = this.headerValue(request, 'Authorization');
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('transferSettings', request, callback);
    },
    /**
     * Writes owner selections, not framework property definitions.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    updateTransferSettings: function (request, callback) {
        request.authorization = this.headerValue(request, 'Authorization');
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('updateTransferSettings', request, callback);
    },
    /**
     * Reads verified partner choices without creating links, wallets, quotes or credits.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    partnerConversionOptions: function (request, callback) {
        request.authorization = this.headerValue(request, 'Authorization');
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('partnerConversionOptions', request, callback);
    },
    /**
     * Preserves original authority for a read-only provider quote.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    partnerConversionQuote: function (request, callback) {
        request.authorization = this.headerValue(request, 'Authorization');
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('partnerConversionQuote', request, callback);
    },
    /**
     * Confirms only the retained quote; payload cannot replace provider terms.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    partnerConversionConfirm: function (request, callback) {
        request.authorization = this.headerValue(request, 'Authorization');
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('partnerConversionConfirm', request, callback);
    },
    /**
     * Reconciles the original conversion without resubmitting external credit.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    partnerConversionStatus: function (request, callback) {
        request.authorization = this.headerValue(request, 'Authorization');
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('partnerConversionStatus', request, callback);
    },
    /**
     * Preserves original browser credentials for Profile-owned participant resolution.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    participantTransfer: function (request, callback) {
        request.authorization = this.headerValue(request, 'Authorization');
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('participantTransfer', request, callback);
    },
    /**
     * Reads the original transfer result without repeating financial effects.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    participantTransferStatus: function (request, callback) {
        request.authorization = this.headerValue(request, 'Authorization');
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        return this.invoke('participantTransferStatus', request, callback);
    },
    /**
     * Maps exact read-only owner evidence; the service rechecks the original signed runtime scope.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    walletEvidence: function (request, callback) { request.httpResponse?.setHeader?.('Cache-Control', 'no-store'); return this.invoke('walletEvidence', request, callback); },
    /**
     * Projects canonical program/unit evidence without wallet or ledger mutation.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    rewardUnitEvidence: function (request, callback) { request.httpResponse?.setHeader?.('Cache-Control', 'no-store'); return this.invoke('rewardUnitEvidence', request, callback); },
    /**
     * Maps one exact original ledger/source or its reversal, never a caller query.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    ledgerEvidence: function (request, callback) { request.httpResponse?.setHeader?.('Cache-Control', 'no-store'); return this.invoke('ledgerEvidence', request, callback); },
    /** Maps one exact participant-owned reward reservation without changing its lifecycle. */
    reservationEvidence: function (request, callback) { request.httpResponse?.setHeader?.('Cache-Control', 'no-store'); return this.invoke('reservationEvidence', request, callback); },
    /** Maps one exact participant-owned reward redemption without changing accounting. */
    redemptionEvidence: function (request, callback) { request.httpResponse?.setHeader?.('Cache-Control', 'no-store'); return this.invoke('redemptionEvidence', request, callback); },
    /**
     * Completes the module initialization hook without creating business records.
     * @returns {Promise<boolean>} Successful module hook completion; registration effects are described above.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    init: function () { return Promise.resolve(true); },
    /**
     * Completes the post-initialization hook without starting an independent runtime.
     * @returns {Promise<boolean>} Successful module hook completion; registration effects are described above.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    postInit: function () { return Promise.resolve(true); },
    /**
     * Reads a request or HTTP header using supported header-name casing.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {string} name Owner-selected service or header name.
     * @returns {string|undefined} Supported header value, or undefined; no effects.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    headerValue: function (request, name) {
        let headers = request.headers || request.header || request.httpRequest && (request.httpRequest.headers || request.httpRequest.header) || {};
        return headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()];
    },
    /**
     * Invokes the owning facade and maps its promise into the supported callback or response envelope.
     * @param {string|Function|Object} operation Owner-selected operation, transaction callback or persisted operation as described above.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    invoke: function (operation, request, callback) {
        let http = request.httpRequest || {};
        request.params = Object.assign({}, request.params || {}, http.params || {});
        request.query = Object.assign({}, request.query || {}, http.query || {});
        request.payload = Object.assign({}, request.payload || {}, http.body || {});
        request.idempotencyKey = request.idempotencyKey || request.payload.idempotencyKey || this.headerValue(request, 'Idempotency-Key');
        request.correlationId = request.correlationId || request.payload.correlationId || this.headerValue(request, 'X-Correlation-Id') || request.idempotencyKey;
        request.tenant = request.tenant || request.authData && request.authData.tenant;
        let promise = FACADE.DefaultLoyaltyInternalFacade[operation](request).then(data => ({ data: data }));
        if (!callback) return promise;
        promise.then(success => callback(null, success)).catch(error => callback(error));
    },
    /**
     * Invokes the openWallet wallet operation.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    openWallet: function (request, callback) { return this.invoke('openWallet',request,callback); },
    /**
     * Invokes the ownerWalletProjection wallet operation.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    ownerWalletProjection: function (request, callback) { return this.invoke('ownerWalletProjection',request,callback); },
    /**
     * Invokes the earnRewards wallet operation.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    earnRewards: function (request, callback) { return this.invoke('earnRewards',request,callback); },
    /**
     * Maps a service-authorized reward transfer.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    transferRewards: function(request,callback) { return this.invoke('transferRewards',request,callback); },
    /**
     * Loads the requested wallet through the generated Loyalty service with the trusted request context.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    wallet: function (request, callback) {
        return this.invoke('wallet', request, callback);
    },
    /**
     * Forwards reward reservation to Loyalty; the operation requires a stable idempotency key.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    reserveRewards: function (request, callback) {
        return this.invoke('reserveRewards', request, callback);
    },
    /**
     * Forwards capture of the specified reservation; Loyalty validates its state and records redemption.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    captureReservation: function (request, callback) {
        return this.invoke('captureReservation', request, callback);
    },
    /**
     * Forwards release of the specified reservation; Loyalty returns held rewards through ledger-backed operations.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    releaseReservation: function (request, callback) {
        return this.invoke('releaseReservation', request, callback);
    },
    /**
     * Forwards reversal of the referenced ledger entry; historical entries remain append-only.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @param {Function} callback Optional Node-style completion callback; receives error or response once.
     * @returns {Promise<Object>|void} Standard response envelope, or callback completion; owner errors follow the same path.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    reverseLedgerEntry: function (request, callback) {
        return this.invoke('reverseLedgerEntry', request, callback);
    }
};
