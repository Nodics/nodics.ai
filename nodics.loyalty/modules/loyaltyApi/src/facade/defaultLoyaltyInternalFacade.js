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
    /** Returns the result from a generated-service envelope without changing record ownership. */
    unwrap: function (response) {
        return response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response;
    },
    /** Throws the owning operation error and stops processing; callers retain responsibility for recovery. */
    fail: function (message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ?
            new CLASSES.NodicsError('ERR_LOYALTY_00000', message) : new Error(message);
        error.code = error.code || 'ERR_LOYALTY_00000';
        throw error;
    },
    /** Rejects a missing or blank required value before dispatching the owning operation. */
    required: function (value, name) {
        if (value === undefined || value === null || String(value).trim() === '') this.fail(name + ' is required');
        return value;
    },
    /** Resolves the named loader-composed service and rejects a required service that is unavailable. */
    service: function (name) {
        let service = typeof SERVICE !== 'undefined' ? SERVICE[name] : undefined;
        if (!service) {
            let error = new Error(name + ' is not available');
            error.code = 'ERR_LOYALTY_API_SERVICE_MISSING';
            throw error;
        }
        return service;
    },
    /** Delegates the wallet open operation to Loyalty. */
    openWallet: function (request) { return this.service('DefaultLoyaltyWalletOperationService').open(request); },
    /** Delegates the wallet projection operation to Loyalty. */
    ownerWalletProjection: function (request) { return this.service('DefaultLoyaltyWalletOperationService').projection(request); },
    /** Delegates the wallet earn operation to Loyalty. */
    earnRewards: function (request) { return this.service('DefaultLoyaltyWalletOperationService').earn(request); },
    /** Delegates a service-authorized wallet transfer. */
    transferRewards: function(request) { return this.service('DefaultLoyaltyRewardTransferService').transfer(request); },
    /** Loads the requested wallet through the generated Loyalty service with the trusted request context. */
    wallet: async function (request) {
        let walletCode = request.walletCode || request.params && request.params.walletCode || request.payload && request.payload.walletCode;
        this.required(walletCode, 'walletCode');
        let result = await this.service('DefaultLoyaltyWalletService').get({
            tenant: request.tenant,
            authData: request.authData,
            query: { code: walletCode },
            pageSize: 1
        });
        let wallet = this.unwrap(result);
        return Array.isArray(wallet) ? wallet[0] : wallet;
    },
    /** Forwards reward reservation to Loyalty; the operation requires a stable idempotency key. */
    reserveRewards: function (request) {
        request.idempotencyKey = request.idempotencyKey || request.payload && request.payload.idempotencyKey;
        this.required(request.idempotencyKey, 'idempotencyKey');
        return this.service('DefaultLoyaltyRewardOperationService').reserve(request);
    },
    /** Forwards capture of the specified reservation; Loyalty validates its state and records redemption. */
    captureReservation: function (request) {
        request.reservationCode = request.reservationCode || request.params && request.params.reservationCode;
        request.idempotencyKey = request.idempotencyKey || request.payload && request.payload.idempotencyKey;
        this.required(request.reservationCode, 'reservationCode');
        this.required(request.idempotencyKey, 'idempotencyKey');
        return this.service('DefaultLoyaltyRewardOperationService').capture(request);
    },
    /** Forwards release of the specified reservation; Loyalty returns held rewards through ledger-backed operations. */
    releaseReservation: function (request) {
        request.reservationCode = request.reservationCode || request.params && request.params.reservationCode;
        request.idempotencyKey = request.idempotencyKey || request.payload && request.payload.idempotencyKey;
        this.required(request.reservationCode, 'reservationCode');
        this.required(request.idempotencyKey, 'idempotencyKey');
        return this.service('DefaultLoyaltyRewardOperationService').release(request);
    },
    /** Forwards reversal of the referenced ledger entry; historical entries remain append-only. */
    reverseLedgerEntry: function (request) {
        let entryCode = request.entryCode || request.params && request.params.entryCode;
        request.reversalOfEntryCode = request.reversalOfEntryCode || entryCode;
        request.idempotencyKey = request.idempotencyKey || request.payload && request.payload.idempotencyKey;
        this.required(request.reversalOfEntryCode, 'entryCode');
        this.required(request.idempotencyKey, 'idempotencyKey');
        return this.service('DefaultLoyaltyRewardOperationService').reverse(request);
    }
};
