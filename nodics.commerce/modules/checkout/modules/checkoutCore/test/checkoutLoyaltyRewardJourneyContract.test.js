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

test('digital reservation selects the authenticated persisted Cart Store before owner effects', async t => {
    const previous = global.SERVICE;
    t.after(() => { global.SERVICE = previous; });
    const request = { tenant: 'tenantA', enterpriseCode: 'enterpriseA', ownerId: 'buyerA',
        authData: { principalId: 'buyerA' }, storeCode: 'untrusted-request-store',
        payload: { cartCode: 'cartA', storeCode: 'untrusted-body-store' } };
    const before = structuredClone(request), calculation = { entries: [] }, calls = [];
    let cart = { code: 'cartA', storeCode: 'saved-store' };
    global.SERVICE = {
        DefaultCartOperationService: { cartSnapshot: async context => {
            assert.equal(context.cartCode, 'cartA'); assert.equal(context.ownerId, 'buyerA');
            assert.equal(context.authData, request.authData); return cart;
        } },
        DefaultDigitalCommerceCheckoutService: { reserveForCheckout: async (context, priced) => {
            calls.push(context); assert.equal(priced, calculation); return ['owner-reservation'];
        } },
    };
    const ports = portsService.create();
    assert.deepEqual(await ports.reserveDigitalUnits(request, calculation), ['owner-reservation']);
    assert.equal(calls[0].storeCode, 'saved-store'); assert.deepEqual(request, before);
    delete request.storeCode;
    await ports.reserveDigitalUnits(request, calculation);
    assert.equal(calls[1].storeCode, 'saved-store');
    for (const value of [undefined, { code: 'foreign-cart', storeCode: 'saved-store' },
        { code: 'cartA' }, { code: 'cartA', storeCode: ' ' }]) {
        cart = value;
        await assert.rejects(ports.reserveDigitalUnits(request, calculation), /Persisted Cart Store/);
    }
    assert.equal(calls.length, 2);
    SERVICE.DefaultCartOperationService.cartSnapshot = async () => { throw new Error('Owner read denied'); };
    await assert.rejects(ports.reserveDigitalUnits(request, calculation), /Owner read denied/);
    assert.equal(calls.length, 2);
});

test('promotion commitment uses the persisted Cart Store and rejects unavailable context before applying', async () => {
    const calls = [];
    const request = { tenant: 'partner-tenant', enterpriseCode: 'partner-enterprise', ownerId: 'buyer',
        authData: { tenant: 'partner-tenant', enterpriseCode: 'partner-enterprise' },
        idempotencyKey: 'place-1', storeCode: 'untrusted-request-store',
        payload: { cartCode: 'cart-1', storeCode: 'untrusted-body-store' } };
    let cart = { code: 'cart-1', storeCode: 'saved-store' };
    global.SERVICE = {
        DefaultCartOperationService: { cartSnapshot: async selected => {
            assert.equal(selected.cartCode, 'cart-1');
            assert.equal(selected.ownerId, 'buyer');
            assert.equal(selected.authData, request.authData);
            return cart;
        } },
        DefaultPromotionOperationService: { apply: async selected => {
            calls.push(selected);
            return { redemption: { code: 'redemption-1' } };
        } },
    };
    const ports = portsService.create();
    const calculation = { subtotal: '100.00', currency: 'USD', entries: [{ productCode: 'product-1' }],
        decisions: { discount: { discountAmount: '10.00' } } };
    await ports.commitPromotions(request, calculation, { code: 'order-1' });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].storeCode, 'saved-store');
    assert.equal(calls[0].payload.storeCode, 'saved-store');
    assert.equal(calls[0].payload.orderCode, 'order-1');
    for (const invalid of [undefined, { code: 'foreign-cart', storeCode: 'saved-store' }, { code: 'cart-1' }]) {
        cart = invalid;
        await assert.rejects(ports.commitPromotions(request, calculation, { code: 'order-1' }), /Persisted Cart Store/);
    }
    assert.equal(calls.length, 1);
    await ports.commitPromotions(request, { decisions: { discount: { discountAmount: '0' } } });
    assert.equal(calls.length, 1);
});
const paymentExecution = require('../../../../payment/modules/paymentCore/src/service/defaultPaymentExecutionService');
const loyaltyMethod = require('../../../../payment/modules/paymentMethods/modules/loyaltyRewardPayment/src/service/defaultLoyaltyRewardPaymentMethodService');
const loyaltyProvider = require('../../../../payment/modules/paymentProviders/modules/loyaltyRewardProvider/src/service/defaultLoyaltyRewardPaymentProviderService');
const loyaltyOperations = require('../../../../../../nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyRewardOperationService');

/** Models generated owner persistence for isolated scoped journey evidence. @returns {Object} In-memory owner. */
function store() {
    const rows = [];
    const matches = (row, query) => Object.keys(query || {}).every(key => row[key] === query[key]);
    return {
        rows,
        get: async request => {
            const result = rows.filter(row => matches(row, request.query || {}));
            return { code: 'SUC_FIND_00000', cache: 'item mis', query: request.query, options: request.options, count: result.length, result };
        },
        save: async request => {
            rows.push(Object.assign({}, request.model));
            return { result: Object.assign({}, request.model) };
        },
        update: async request => {
            const index = rows.findIndex(row => matches(row, request.query || {}));
            if (index >= 0) rows[index] = Object.assign({}, rows[index], request.model.$set || request.model);
            else rows.push(Object.assign({}, request.model));
            return { result: Object.assign({}, request.model) };
        }
    };
}

/** Seeds a scoped persisted Cart and funded wallet before installing owner ports. @param {Object} overrides Test owner options. @returns {Promise<Object>} Fixture stores. */
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
    await cartStore.save({ model: { code: options.orderCode + ':cart', tenant: 'runtimeTenantFromToken',
        enterpriseCode: 'enterprise-1', ownerId: 'customer-1', storeCode: 'published-store', currency: 'POINTS', status: 'ACTIVE', revision: 1 } });
    await cartEntryStore.save({ model: { code: 'entry-1', cartCode: options.orderCode + ':cart', tenant: 'runtimeTenantFromToken',
        enterpriseCode: 'enterprise-1', ownerId: 'customer-1', productCode: 'coupon-product', quantity: '1', status: 'ACTIVE', revision: 1 } });

    global.CONFIG = {
        get: key => {
            if (key === 'loyaltyRewardPayment') return { enabled: true, providerCode: 'loyalty-reward-points', defaultCurrency: 'POINTS', defaultProgramCode: 'default', defaultRewardTypeCode: 'points' };
            if (key === 'loyaltyRewardProvider') return { enabled: true, providerCode: 'loyalty-reward-points' };
            if (key === 'stripeProvider') return { enabled: true };
            return undefined;
        }
    };
    global.SERVICE = {
        DefaultCheckoutPlacementPortsService: portsService,
        DefaultCheckoutCompensationRecoveryService: require('../src/service/defaultCheckoutCompensationRecoveryService'),
        DefaultPaymentExecutionService: paymentExecution,
        DefaultLoyaltyRewardPaymentMethodService: loyaltyMethod,
        DefaultLoyaltyRewardPaymentProviderService: loyaltyProvider,
        DefaultLoyaltyWalletRewardBalanceService: balanceStore,
        DefaultRewardLedgerEntryService: ledgerStore,
        DefaultRewardReservationService: reservationStore,
        DefaultRewardRedemptionService: redemptionStore,
        DefaultModuleService: {
            invokeModule: options => options.moduleName === 'profile' ? Promise.resolve({data:[{code:'customer-1',loginId:'customer@example.test'}]}) : options.methodName === 'GET' ? Promise.resolve({data:{ownerType:'CUSTOMER',ownerCode:'customer-1'}}) : loyaltyOperations[options.operationName](options.request)
        },
        DefaultPaymentTransactionEntryService: paymentStore,
        DefaultCheckoutCheckpointService: checkoutCheckpointStore,
        DefaultCartService: cartStore,
        DefaultCartEntryService: cartEntryStore,
        DefaultCommerceOrderService: options.orderService || orderStore,
        DefaultCommerceOrderEntryService: orderEntryStore,
        DefaultConsignmentService: options.consignmentService || store(),
        DefaultCartOperationService: {
            cartSnapshot: async request => {
                const rows = (await cartStore.get({ query: { code: request.cartCode, tenant: request.tenant,
                    enterpriseCode: request.enterpriseCode, ownerId: request.ownerId } })).result;
                assert.equal(rows.length, 1, 'Authoritative persisted Cart scope is required');
                return { ...rows[0] };
            },
            validateDirect: async () => ({ status: 'VALID' }),
            calculate: async request => ({
                code: request.payload.calculationCode || 'calc-1',
                currency: 'POINTS',
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
                assert.equal(request.storeCode, 'published-store');
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

/** Supplies signed isolated buyer context for the matching persisted Cart. @param {string} code Order identity. @returns {Object} Checkout request. */
function checkoutRequest(code) {
    return {
        tenant: 'runtimeTenantFromToken',
        enterpriseCode: 'enterprise-1',
        ownerId: 'customer-1',
        authData: { tenant: 'runtimeTenantFromToken', principalId: 'customer-1', principalType:'customer', loginId:'customer@example.test', userGroups: ['customerUserGroup'] },
        httpRequest: { headers: { authorization: 'Bearer customer-test-token' } },
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
    const context = await setup({ orderCode: 'order-loyalty-1' });
    const result = await placement.place(checkoutRequest('order-loyalty-1'), portsService.create());

    assert.equal(result.evidence.orderCode, 'order-loyalty-1');
    assert.deepEqual(result.evidence.digitalDeliveryCodes, ['coupon-row-1']);
    assert.deepEqual(context.digitalEvents, ['RESERVED', 'SOLD', 'DELIVERED']);
    assert.equal(context.orderStore.rows[0].evidence.storeCode, 'published-store');
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
        orderCode: 'order-loyalty-2',
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
