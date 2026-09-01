/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyRewardProvider/test/loyaltyRewardPaymentAcceptanceContract @description Proves earn, reserve, capture, release, refund, and payment evidence across Commerce Payment and Loyalty services. @layer test @owner loyaltyRewardProvider */
const assert = require('node:assert/strict');
const paymentExecution = require('../../../../paymentCore/src/service/defaultPaymentExecutionService');
const provider = require('../src/service/defaultLoyaltyRewardPaymentProviderService');
const operationService = require('../../../../../../../../nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyRewardOperationService');

function createStore() {
    const rows = [];
    const matches = (row, query) => Object.keys(query || {}).every(key => row[key] === query[key]);
    return {
        rows,
        get: async request => ({ result: rows.filter(row => matches(row, request.query || {})) }),
        save: async request => {
            rows.push(Object.assign({}, request.model));
            return { result: Object.assign({}, request.model) };
        },
        update: async request => {
            const index = rows.findIndex(row => matches(row, request.query || {}));
            if (index >= 0) rows[index] = Object.assign({}, rows[index], request.model);
            else rows.push(Object.assign({}, request.model));
            return { result: Object.assign({}, request.model) };
        }
    };
}

function paymentRepository() {
    const rows = [];
    return {
        rows,
        find: async (tenant, idempotencyKey) => rows.find(row => row.tenant === tenant && row.idempotencyKey === idempotencyKey),
        record: async model => {
            rows.push(Object.assign({}, model));
            return Object.assign({}, model);
        }
    };
}

const balanceStore = createStore();
const ledgerStore = createStore();
const reservationStore = createStore();
const redemptionStore = createStore();
const repository = paymentRepository();

global.CONFIG = { get: key => key === 'loyaltyRewardProvider' ? undefined : undefined };
global.SERVICE = {
    DefaultLoyaltyWalletRewardBalanceService: balanceStore,
    DefaultRewardLedgerEntryService: ledgerStore,
    DefaultRewardReservationService: reservationStore,
    DefaultRewardRedemptionService: redemptionStore,
    DefaultModuleService: {
        invokeModule: options => operationService[options.operationName](options.request)
    }
};

async function pay(request) {
    return paymentExecution.execute(request, provider, repository);
}

async function main() {
    const tenant = 'runtimeTenantFromToken';
    const authData = { tenant, userGroups: ['serviceAccountUserGroup'] };
    const walletCode = 'acceptance-wallet-001';
    const base = { tenant, authData, walletCode, programCode: 'default', rewardTypeCode: 'points' };

    const earn = await operationService.earn(Object.assign({}, base, {
        amount: '100.00',
        sourceType: 'ORDER',
        sourceCode: 'earn-order-001',
        targetType: 'ORDER',
        targetCode: 'earn-order-001',
        idempotencyKey: 'acceptance-earn-001',
        correlationId: 'acceptance-corr-001'
    }));
    assert.equal(earn.balance.available, '100.00');

    const authorization = await pay(Object.assign({}, base, {
        operation: 'AUTHORIZE',
        amount: '25.00',
        currency: 'POINTS',
        orderCode: 'order-001',
        idempotencyKey: 'payment-authorize-001',
        correlationId: 'payment-corr-001'
    }));
    assert.equal(authorization.status, 'AUTHORIZED');
    assert.equal(authorization.providerCode, 'loyalty-reward-points');
    assert(authorization.providerReference);
    assert.equal(balanceStore.rows[0].available, '75.00');
    assert.equal(balanceStore.rows[0].reserved, '25.00');

    const duplicateAuthorization = await pay(Object.assign({}, base, {
        operation: 'AUTHORIZE',
        amount: '25.00',
        currency: 'POINTS',
        orderCode: 'order-001',
        idempotencyKey: 'payment-authorize-001',
        correlationId: 'payment-corr-001'
    }));
    assert.equal(duplicateAuthorization.providerReference, authorization.providerReference);
    assert.equal(ledgerStore.rows.filter(row => row.entryType === 'RESERVE').length, 1);

    const capture = await pay(Object.assign({}, base, {
        operation: 'CAPTURE',
        amount: '25.00',
        currency: 'POINTS',
        orderCode: 'order-001',
        providerReference: authorization.providerReference,
        idempotencyKey: 'payment-capture-001',
        correlationId: 'payment-corr-001'
    }));
    assert.equal(capture.status, 'CAPTURED');
    assert.equal(balanceStore.rows[0].available, '75.00');
    assert.equal(balanceStore.rows[0].reserved, '0.00');
    assert.equal(balanceStore.rows[0].spent, '25.00');

    const voidAuthorization = await pay(Object.assign({}, base, {
        operation: 'AUTHORIZE',
        amount: '10.00',
        currency: 'POINTS',
        orderCode: 'order-002',
        idempotencyKey: 'payment-authorize-002',
        correlationId: 'payment-corr-002'
    }));
    assert.equal(balanceStore.rows[0].available, '65.00');
    assert.equal(balanceStore.rows[0].reserved, '10.00');

    const voided = await pay(Object.assign({}, base, {
        operation: 'VOID',
        amount: '10.00',
        currency: 'POINTS',
        orderCode: 'order-002',
        providerReference: voidAuthorization.providerReference,
        idempotencyKey: 'payment-void-001',
        correlationId: 'payment-corr-002'
    }));
    assert.equal(voided.status, 'VOIDED');
    assert.equal(balanceStore.rows[0].available, '75.00');
    assert.equal(balanceStore.rows[0].reserved, '0.00');

    const refund = await pay(Object.assign({}, base, {
        operation: 'REFUND',
        amount: '25.00',
        currency: 'POINTS',
        orderCode: 'order-001',
        providerReference: capture.providerReference,
        idempotencyKey: 'payment-refund-001',
        correlationId: 'payment-corr-003'
    }));
    assert.equal(refund.status, 'REFUND_SUCCEEDED');
    assert.equal(balanceStore.rows[0].available, '100.00');
    assert.equal(balanceStore.rows[0].spent, '0.00');
    assert.equal(balanceStore.rows[0].reversed, '25.00');

    assert.equal(ledgerStore.rows.filter(row => row.entryType === 'EARN').length, 1);
    assert.equal(ledgerStore.rows.filter(row => row.entryType === 'RESERVE').length, 2);
    assert.equal(ledgerStore.rows.filter(row => row.entryType === 'CAPTURE').length, 1);
    assert.equal(ledgerStore.rows.filter(row => row.entryType === 'RELEASE').length, 1);
    assert.equal(ledgerStore.rows.filter(row => row.entryType === 'REVERSE').length, 1);
    assert.equal(repository.rows.length, 5);
    assert.equal(balanceStore.rows[0].tenant, undefined);
    assert.equal(balanceStore.rows[0].enterpriseCode, undefined);

    console.log('Loyalty reward payment acceptance contract validated');
}

main().finally(() => {
    delete global.CONFIG;
    delete global.SERVICE;
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
