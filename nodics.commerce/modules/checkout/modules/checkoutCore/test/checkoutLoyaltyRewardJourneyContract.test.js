/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module checkoutCore/test/checkoutLoyaltyRewardJourneyContract @description Verifies checkout can buy a digital item with Loyalty reward points through Payment-owned method and provider boundaries. @layer test @owner checkoutCore */
const assert = require('node:assert/strict');
const test = require('node:test');
const placement = require('../src/service/defaultOrderPlacementService');
const portsService = require('../src/service/defaultCheckoutPlacementPortsService');
const paymentExecution = require('../../../../payment/modules/paymentCore/src/service/defaultPaymentExecutionService');
const loyaltyMethod = require('../../../../payment/modules/paymentMethods/modules/loyaltyRewardPayment/src/service/defaultLoyaltyRewardPaymentMethodService');
const loyaltyProvider = require('../../../../payment/modules/paymentProviders/modules/loyaltyRewardProvider/src/service/defaultLoyaltyRewardPaymentProviderService');
const loyaltyOperations = require('../../../../../../nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyRewardOperationService');

function store() {
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

async function setup(overrides) {
    const balanceStore = store();
    const ledgerStore = store();
    const reservationStore = store();
    const redemptionStore = store();
    const paymentStore = store();
    const checkoutCheckpointStore = store();
    const orderStore = store();
    const orderEntryStore = store();
    const cartStore = store();
    const cartEntryStore = store();
    const digitalEvents = [];
    const options = overrides || {};

    global.CONFIG = {
        get: key => {
            if (key === 'loyaltyRewardPayment') return { enabled: true, providerCode: 'loyalty-reward-points', defaultCurrency: 'POINTS', defaultProgramCode: 'default', defaultRewardTypeCode: 'points' };
            if (key === 'loyaltyRewardProvider') return { enabled: true, providerCode: 'loyalty-reward-points' };
            if (key === 'stripeProvider') return { enabled: true };
            return undefined;
        }
    };
    global.SERVICE = {
        DefaultPaymentExecutionService: paymentExecution,
        DefaultLoyaltyRewardPaymentMethodService: loyaltyMethod,
        DefaultLoyaltyRewardPaymentProviderService: loyaltyProvider,
        DefaultLoyaltyWalletRewardBalanceService: balanceStore,
        DefaultRewardLedgerEntryService: ledgerStore,
        DefaultRewardReservationService: reservationStore,
        DefaultRewardRedemptionService: redemptionStore,
        DefaultModuleService: {
            invokeModule: options => loyaltyOperations[options.operationName](options.request)
        },
        DefaultPaymentTransactionEntryService: paymentStore,
        DefaultCheckoutCheckpointService: checkoutCheckpointStore,
        DefaultCartService: cartStore,
        DefaultCartEntryService: cartEntryStore,
        DefaultCommerceOrderService: options.orderService || orderStore,
        DefaultCommerceOrderEntryService: orderEntryStore,
        DefaultConsignmentService: options.consignmentService || store(),
        DefaultCartOperationService: {
            validateDirect: async () => ({ status: 'VALID' }),
            calculate: async request => ({
                code: request.payload.calculationCode || 'calc-1',
                currency: 'USD',
                subtotal: '25.00',
                discountAmount: '0.00',
                taxAmount: '0.00',
                totalAmount: '25.00',
                decisions: { discount: {} },
                entries: [{ code: 'entry-1', productCode: 'coupon-product', sku: 'COUPON-SKU', quantity: '1', unitAmount: '25.00', lineAmount: '25.00', availability: { inventoryStrategy: 'COUPON_CODE_POOL', couponBatchCode: 'batch-1' } }]
            })
        },
        DefaultDigitalCommerceCheckoutService: {
            reserveForCheckout: async () => {
                digitalEvents.push('RESERVED');
                return [{ code: 'coupon-row-1', entryCode: 'entry-1', status: 'RESERVED' }];
            },
            confirmSale: async (request, order, reservations) => {
                digitalEvents.push('SOLD');
                return reservations.map(row => Object.assign({}, row, { status: 'SOLD', orderCode: order.code }));
            },
            deliver: async (request, order, sales) => {
                digitalEvents.push('DELIVERED');
                return sales.map(row => Object.assign({}, row, { status: 'DELIVERED', orderCode: order.code }));
            },
            releaseReservations: async () => {
                digitalEvents.push('RELEASED');
                return [{ type: 'DIGITAL_RELEASE', status: 'COMPLETED' }];
            }
        }
    };

    await loyaltyOperations.earn({
        tenant: 'runtimeTenantFromToken',
        authData: { tenant: 'runtimeTenantFromToken' },
        walletCode: 'wallet-1',
        programCode: 'default',
        rewardTypeCode: 'points',
        amount: '50.00',
        sourceType: 'ORDER',
        sourceCode: 'earn-order-1',
        targetType: 'ORDER',
        targetCode: 'earn-order-1',
        idempotencyKey: 'earn-1',
        correlationId: 'corr-earn-1'
    });

    return { balanceStore, ledgerStore, reservationStore, redemptionStore, paymentStore, checkoutCheckpointStore, orderStore, orderEntryStore, digitalEvents };
}

function checkoutRequest(code) {
    return {
        tenant: 'runtimeTenantFromToken',
        ownerId: 'customer-1',
        authData: { tenant: 'runtimeTenantFromToken', principalId: 'customer-1', userGroups: ['customerUserGroup'] },
        idempotencyKey: code + ':place',
        correlationId: code + ':corr',
        payload: {
            cartCode: code + ':cart',
            orderCode: code,
            expectedCartRevision: '1',
            calculationCode: code + ':calc',
            paymentMethod: 'LOYALTY_REWARD',
            walletCode: 'wallet-1',
            rewardAmount: '25.00',
            rewardCurrency: 'POINTS'
        }
    };
}

test.afterEach(() => {
    delete global.CONFIG;
    delete global.SERVICE;
});

test('Checkout places and captures a digital purchase with Loyalty reward points', async () => {
    const context = await setup();
    const result = await placement.place(checkoutRequest('order-loyalty-1'), portsService.create());

    assert.equal(result.evidence.orderCode, 'order-loyalty-1');
    assert.deepEqual(result.evidence.digitalDeliveryCodes, ['coupon-row-1']);
    assert.deepEqual(context.digitalEvents, ['RESERVED', 'SOLD', 'DELIVERED']);
    assert.equal(context.balanceStore.rows[0].available, '25.00');
    assert.equal(context.balanceStore.rows[0].reserved, '0.00');
    assert.equal(context.balanceStore.rows[0].spent, '25.00');
    assert.equal(context.ledgerStore.rows.filter(row => row.entryType === 'RESERVE').length, 1);
    assert.equal(context.ledgerStore.rows.filter(row => row.entryType === 'CAPTURE').length, 1);
    [context.balanceStore, context.ledgerStore, context.reservationStore, context.redemptionStore].forEach(store => {
        store.rows.forEach(row => {
            assert.equal(row.tenant, undefined);
            assert.equal(row.enterpriseCode, undefined);
            assert.equal(row.authData, undefined);
            assert.equal(row.payload, undefined);
        });
    });
    assert.equal(context.paymentStore.rows.find(row => row.operation === 'AUTHORIZE').providerCode, 'loyalty-reward-points');
    assert.equal(context.paymentStore.rows.find(row => row.operation === 'CAPTURE').methodCode, 'LOYALTY_REWARD');
});

test('Checkout compensation reverses captured Loyalty reward points when downstream release fails', async () => {
    const context = await setup({
        consignmentService: {
            save: async () => {
                throw new Error('fulfillment release failed');
            }
        }
    });

    await assert.rejects(() => placement.place(checkoutRequest('order-loyalty-2'), portsService.create()), /fulfillment release failed/);

    assert.equal(context.balanceStore.rows[0].available, '50.00');
    assert.equal(context.balanceStore.rows[0].reserved, '0.00');
    assert.equal(context.balanceStore.rows[0].spent, '0.00');
    assert.equal(context.balanceStore.rows[0].reversed, '25.00');
    assert.equal(context.ledgerStore.rows.filter(row => row.entryType === 'REVERSE').length, 1);
    assert.equal(context.paymentStore.rows.find(row => row.operation === 'REFUND').providerCode, 'loyalty-reward-points');
    assert.equal(context.checkoutCheckpointStore.rows[0].status, 'COMPENSATED');
});
