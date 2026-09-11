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
    /** Merges effective provider and Loyalty target configuration with the adapter defaults. */
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
    /** Throws the owning operation error and stops processing; callers retain responsibility for recovery. */
    fail: function (message) {
        throw new Error(message);
    },
    /** Rejects a missing or blank required value before dispatching the owning operation. */
    required: function (value, name) {
        if (value === undefined || value === null || String(value).trim() === '') this.fail(name + ' is required');
        return value;
    },
    /** Reads the stable operation key from the request or payload for replay detection. */
    idempotencyKey: function (request) {
        return request.idempotencyKey || request.payload && request.payload.idempotencyKey;
    },
    /** Reads the request correlation identifier or falls back to its payment idempotency key. */
    correlationId: function (request) {
        return request.correlationId || request.payload && request.payload.correlationId || this.idempotencyKey(request);
    },
    /** Selects the order, cart or stable operation reference used as the Loyalty target. */
    targetCode: function (request) {
        return request.orderCode || request.cartCode || request.payload && (request.payload.orderCode || request.payload.cartCode) || this.idempotencyKey(request);
    },
    /** Selects the payment, order, cart or operation reference used as movement provenance. */
    paymentSourceCode: function (request) {
        return request.paymentTransactionCode || request.orderCode || request.cartCode || this.idempotencyKey(request);
    },
    /** Unwraps supported Loyalty response envelopes without synthesizing settlement evidence. */
    normalizeLoyaltyResponse: function (response) {
        if (response && response.data) return response.data;
        if (response && response.result) return response.result;
        return response;
    },
    /** Extracts the reservation or ledger reference for the completed payment operation. */
    referenceFor: function (operation, response) {
        let result = this.normalizeLoyaltyResponse(response) || {};
        if (operation === 'AUTHORIZE') return result.reservation && result.reservation.code || result.ledgerEntry && result.ledgerEntry.reservationCode;
        if (operation === 'CAPTURE') return result.ledgerEntry && result.ledgerEntry.code || result.redemption && result.redemption.captureLedgerEntryCode;
        if (operation === 'VOID') return result.ledgerEntry && result.ledgerEntry.code || result.reservation && result.reservation.code;
        if (operation === 'REFUND') return result.ledgerEntry && result.ledgerEntry.code;
        return undefined;
    },
    /** Maps a supported payment operation to its canonical successful payment status. */
    statusFor: function (operation) {
        return { AUTHORIZE: 'AUTHORIZED', CAPTURE: 'CAPTURED', VOID: 'VOIDED', REFUND: 'REFUNDED' }[operation];
    },
    /** Builds the owning Loyalty request from payment context and configured wallet/reward defaults. */
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
    /** Selects the Loyalty resource route for authorization, capture, void or refund. */
    apiName: function (operation, payload) {
        if (operation === 'AUTHORIZE') return '/reward-reservations';
        if (operation === 'CAPTURE') return '/reward-reservations/' + encodeURIComponent(payload.reservationCode) + '/capture';
        if (operation === 'VOID') return '/reward-reservations/' + encodeURIComponent(payload.reservationCode) + '/release';
        if (operation === 'REFUND') return '/reward-ledger-entries/' + encodeURIComponent(payload.reversalOfEntryCode) + '/reverse';
        this.fail('Unsupported loyalty reward payment operation');
    },
    /** Maps payment authorization/capture/void/refund to Loyalty reserve/capture/release/reverse. */
    operationName: function (operation) {
        return { AUTHORIZE: 'reserve', CAPTURE: 'capture', VOID: 'release', REFUND: 'reverse' }[operation];
    },
    /** Calls the configured remote Loyalty module through DefaultModuleService with trusted context and stable operation keys. */
    invokeLoyalty: function (request, operation, payload) {
        let config = this.providerConfig();
        let target = config.loyaltyTarget || {};
        return SERVICE.DefaultModuleService.invokeModule({
            local: false,
            tenant: payload.tenant,
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
    /** Verifies wallet ownership against Profile and Loyalty before a customer payment reservation. */
    assertWalletOwner: async function (request, walletCode) {
        const auth = request.authData || {};
        const groups=(auth.userGroups||auth.groups||[]).map(g=>typeof g==='string'?g:g.code);
        if(auth.principalType==='service'&&groups.includes('serviceAccountUserGroup'))return;
        if (auth.principalType !== 'customer' || !auth.loginId) this.fail('Authenticated customer is required for reward payment');
        const unwrap = value => { for(let i=0;i<6 && value && !Array.isArray(value);i++){if(value.data!==undefined)value=value.data;else if(value.result!==undefined)value=value.result;else break;} return value; };
        const profile = unwrap(await SERVICE.DefaultModuleService.invokeModule({local:false,moduleName:'profile',connectionName:'profile',tenant:request.tenant,request:{tenant:request.tenant},apiName:'/customer',methodName:'POST',requestBody:{query:{loginId:auth.loginId},searchOptions:{pageSize:1},options:{recursive:false}}}));
        const customer = Array.isArray(profile) ? profile[0] : profile;
        const target = this.providerConfig().loyaltyTarget;
        const projection = unwrap(await SERVICE.DefaultModuleService.invokeModule({local:false,moduleName:target.moduleName,connectionName:target.connectionName,tenant:request.tenant,request:{tenant:request.tenant},apiName:'/wallets/'+encodeURIComponent(walletCode),methodName:'GET',requestBody:{}}));
        const wallet = projection && projection.wallet || projection;
        if (!customer || customer.loginId !== auth.loginId || !wallet || wallet.ownerType !== 'CUSTOMER' || wallet.ownerCode !== customer.code) this.fail('Reward wallet is not available to this customer');
    },
    /** Validates a supported payment request, checks authorization requirements and maps actual Loyalty evidence to payment results. */
    execute: async function (request) {
        if (!request || !this.supportedOperations.includes(request.operation)) this.fail('Unsupported loyalty reward payment operation');
        this.required(request.tenant || request.authData && request.authData.tenant, 'tenant');
        this.required(this.idempotencyKey(request), 'idempotencyKey');
        let payload = this.loyaltyPayload(request, request.operation);
        this.required(payload.walletCode, 'walletCode');
        if (request.operation === 'AUTHORIZE') { this.required(payload.amount, 'amount'); await this.assertWalletOwner(request, payload.walletCode); }
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
