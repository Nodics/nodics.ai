/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyApi/src/facade/defaultLoyaltyInternalFacade @description Holds the Loyalty internal API facade until behavior services are implemented. @layer facade @owner loyaltyApi @override Later modules replace placeholder operations with transactional wallet behavior. */
module.exports = {
    unwrap: function (response) {
        return response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response;
    },
    fail: function (message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ?
            new CLASSES.NodicsError('ERR_LOYALTY_00000', message) : new Error(message);
        error.code = error.code || 'ERR_LOYALTY_00000';
        throw error;
    },
    required: function (value, name) {
        if (value === undefined || value === null || String(value).trim() === '') this.fail(name + ' is required');
        return value;
    },
    service: function (name) {
        let service = typeof SERVICE !== 'undefined' ? SERVICE[name] : undefined;
        if (!service) {
            let error = new Error(name + ' is not available');
            error.code = 'ERR_LOYALTY_API_SERVICE_MISSING';
            throw error;
        }
        return service;
    },
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
    reserveRewards: function (request) {
        request.idempotencyKey = request.idempotencyKey || request.payload && request.payload.idempotencyKey;
        this.required(request.idempotencyKey, 'idempotencyKey');
        return this.service('DefaultLoyaltyRewardOperationService').reserve(request);
    },
    captureReservation: function (request) {
        request.reservationCode = request.reservationCode || request.params && request.params.reservationCode;
        request.idempotencyKey = request.idempotencyKey || request.payload && request.payload.idempotencyKey;
        this.required(request.reservationCode, 'reservationCode');
        this.required(request.idempotencyKey, 'idempotencyKey');
        return this.service('DefaultLoyaltyRewardOperationService').capture(request);
    },
    releaseReservation: function (request) {
        request.reservationCode = request.reservationCode || request.params && request.params.reservationCode;
        request.idempotencyKey = request.idempotencyKey || request.payload && request.payload.idempotencyKey;
        this.required(request.reservationCode, 'reservationCode');
        this.required(request.idempotencyKey, 'idempotencyKey');
        return this.service('DefaultLoyaltyRewardOperationService').release(request);
    },
    reverseLedgerEntry: function (request) {
        let entryCode = request.entryCode || request.params && request.params.entryCode;
        request.reversalOfEntryCode = request.reversalOfEntryCode || entryCode;
        request.idempotencyKey = request.idempotencyKey || request.payload && request.payload.idempotencyKey;
        this.required(request.reversalOfEntryCode, 'entryCode');
        this.required(request.idempotencyKey, 'idempotencyKey');
        return this.service('DefaultLoyaltyRewardOperationService').reverse(request);
    }
};
