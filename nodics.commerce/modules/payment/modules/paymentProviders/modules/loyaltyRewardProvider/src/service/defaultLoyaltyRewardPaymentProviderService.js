/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyRewardProvider/src/service/defaultLoyaltyRewardPaymentProviderService @description Adapts Commerce payment operations to Loyalty reward reservation, capture, release, and reverse APIs. @layer service @owner loyaltyRewardProvider @override Later modules may override target mapping or response normalization while preserving Payment provider semantics. */
module.exports = {
    code: 'loyalty-reward-points',
    supportedOperations: ['AUTHORIZE', 'CAPTURE', 'VOID', 'REFUND'],
    providerConfig: function () {
        let configured = typeof CONFIG !== 'undefined' && CONFIG.get && CONFIG.get('loyaltyRewardProvider') || {};
        let defaults = {
            providerCode: this.code,
            programCode: 'default',
            rewardTypeCode: 'points',
            loyaltyTarget: {
                moduleName: 'loyaltyApi',
                connectionName: 'loyaltyServer',
                apiVersion: 'v0',
                targetAuthority: { runtimeRole: 'LOYALTY' },
                timeoutMs: 3000,
                maxAttempts: 2
            }
        };
        let merged = Object.assign({}, defaults, configured);
        merged.loyaltyTarget = Object.assign({}, defaults.loyaltyTarget, configured.loyaltyTarget || {});
        return merged;
    },
    fail: function (message) {
        throw new Error(message);
    },
    required: function (value, name) {
        if (value === undefined || value === null || String(value).trim() === '') this.fail(name + ' is required');
        return value;
    },
    idempotencyKey: function (request) {
        return request.idempotencyKey || request.payload && request.payload.idempotencyKey;
    },
    correlationId: function (request) {
        return request.correlationId || request.payload && request.payload.correlationId || this.idempotencyKey(request);
    },
    targetCode: function (request) {
        return request.orderCode || request.cartCode || request.payload && (request.payload.orderCode || request.payload.cartCode) || this.idempotencyKey(request);
    },
    paymentSourceCode: function (request) {
        return request.paymentTransactionCode || request.orderCode || request.cartCode || this.idempotencyKey(request);
    },
    normalizeLoyaltyResponse: function (response) {
        if (response && response.data) return response.data;
        if (response && response.result) return response.result;
        return response;
    },
    referenceFor: function (operation, response) {
        let result = this.normalizeLoyaltyResponse(response) || {};
        if (operation === 'AUTHORIZE') return result.reservation && result.reservation.code || result.ledgerEntry && result.ledgerEntry.reservationCode;
        if (operation === 'CAPTURE') return result.ledgerEntry && result.ledgerEntry.code || result.redemption && result.redemption.captureLedgerEntryCode;
        if (operation === 'VOID') return result.ledgerEntry && result.ledgerEntry.code || result.reservation && result.reservation.code;
        if (operation === 'REFUND') return result.ledgerEntry && result.ledgerEntry.code;
        return undefined;
    },
    statusFor: function (operation) {
        return { AUTHORIZE: 'AUTHORIZED', CAPTURE: 'CAPTURED', VOID: 'VOIDED', REFUND: 'REFUNDED' }[operation];
    },
    loyaltyPayload: function (request, operation) {
        let config = this.providerConfig();
        let payload = request.payload || {};
        let model = {
            tenant: request.tenant || request.authData && request.authData.tenant,
            walletCode: payload.walletCode || request.walletCode,
            programCode: payload.programCode || request.programCode || config.programCode,
            rewardTypeCode: payload.rewardTypeCode || request.rewardTypeCode || config.rewardTypeCode,
            amount: payload.amount || request.amount,
            sourceType: 'PAYMENT',
            sourceCode: payload.sourceCode || request.sourceCode || this.paymentSourceCode(request),
            targetType: payload.targetType || request.targetType || (request.orderCode ? 'ORDER' : 'CART'),
            targetCode: payload.targetCode || request.targetCode || this.targetCode(request),
            idempotencyKey: this.idempotencyKey(request),
            correlationId: this.correlationId(request),
            authData: request.authData
        };
        if (operation !== 'AUTHORIZE') {
            model.reservationCode = payload.reservationCode || request.reservationCode || request.providerReference;
        }
        if (operation === 'REFUND') {
            model.reversalOfEntryCode = payload.reversalOfEntryCode || request.reversalOfEntryCode || request.providerReference;
        }
        return model;
    },
    apiName: function (operation, payload) {
        if (operation === 'AUTHORIZE') return '/reward-reservations';
        if (operation === 'CAPTURE') return '/reward-reservations/' + encodeURIComponent(payload.reservationCode) + '/capture';
        if (operation === 'VOID') return '/reward-reservations/' + encodeURIComponent(payload.reservationCode) + '/release';
        if (operation === 'REFUND') return '/reward-ledger-entries/' + encodeURIComponent(payload.reversalOfEntryCode) + '/reverse';
        this.fail('Unsupported loyalty reward payment operation');
    },
    operationName: function (operation) {
        return { AUTHORIZE: 'reserve', CAPTURE: 'capture', VOID: 'release', REFUND: 'reverse' }[operation];
    },
    invokeLoyalty: function (request, operation, payload) {
        let config = this.providerConfig();
        let target = config.loyaltyTarget || {};
        return SERVICE.DefaultModuleService.invokeModule({
            moduleName: target.moduleName || 'loyaltyApi',
            connectionName: target.connectionName || 'loyaltyServer',
            connectionType: target.connectionType || 'abstract',
            targetAuthority: target.targetAuthority || { runtimeRole: 'LOYALTY' },
            apiVersion: target.apiVersion || 'v0',
            apiName: this.apiName(operation, payload),
            methodName: 'POST',
            serviceName: 'DefaultLoyaltyRewardOperationService',
            operationName: this.operationName(operation),
            request: Object.assign({}, payload, { payload: payload, authData: request.authData }),
            requestBody: payload,
            idempotencyKey: payload.idempotencyKey,
            timeoutMs: target.timeoutMs,
            maxAttempts: target.maxAttempts
        });
    },
    execute: async function (request) {
        if (!request || !this.supportedOperations.includes(request.operation)) this.fail('Unsupported loyalty reward payment operation');
        this.required(request.tenant || request.authData && request.authData.tenant, 'tenant');
        this.required(this.idempotencyKey(request), 'idempotencyKey');
        let payload = this.loyaltyPayload(request, request.operation);
        this.required(payload.walletCode, 'walletCode');
        if (request.operation === 'AUTHORIZE') this.required(payload.amount, 'amount');
        if (request.operation === 'CAPTURE' || request.operation === 'VOID') this.required(payload.reservationCode, 'reservationCode');
        if (request.operation === 'REFUND') this.required(payload.reversalOfEntryCode, 'reversalOfEntryCode');
        let response = await this.invokeLoyalty(request, request.operation, payload);
        return Object.freeze({
            reference: this.referenceFor(request.operation, response),
            status: this.statusFor(request.operation),
            providerCode: this.providerConfig().providerCode,
            loyalty: this.normalizeLoyaltyResponse(response)
        });
    }
};
