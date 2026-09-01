/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const placement = require('../src/service/defaultOrderPlacementService');

test('Order placement passes authenticated context into idempotency checkpoint lookup', async () => {
    const authData = { tenant: 'default', userGroups: ['customerUserGroup'] };
    let lookup;
    const existing = { code: 'order-1', status: 'COMPLETED' };
    const request = {
        tenant: 'default',
        ownerId: 'customer-1',
        authData,
        idempotencyKey: 'order-1:place'
    };
    const result = await placement.place(request, {
        findPlacement: async receivedRequest => {
            lookup = receivedRequest;
            return existing;
        }
    });
    assert.equal(result, existing);
    assert.equal(lookup, request);
});

test('Order placement validates calculates reserves digital coupons before payment and releases on failure', async () => {
    const completed = [];
    const request = {
        tenant: 'default',
        ownerId: 'customer-1',
        authData: { tenant: 'default' },
        idempotencyKey: 'order-1:place',
        correlationId: 'corr-1',
        payload: { cartCode: 'cart-1', orderCode: 'order-1' }
    };
    const calculation = {
        code: 'calc-1',
        currency: 'USD',
        totalAmount: '5.00',
        entries: [{ code: 'entry-1', productCode: 'coupon-product', sku: 'COUPON-SKU', quantity: '1', availability: { inventoryStrategy: 'COUPON_CODE_POOL', couponBatchCode: 'batch-1' } }]
    };
    const digitalReservation = [{ code: 'coupon-row-1', entryCode: 'entry-1', status: 'RESERVED' }];
    let releasedDigital = false;
    await assert.rejects(() => placement.place(request, {
        findPlacement: async () => undefined,
        validateCart: async () => {
            completed.push('validate');
            return { status: 'VALID' };
        },
        calculateCart: async () => {
            completed.push('calculate');
            return calculation;
        },
        reserveInventory: async () => {
            completed.push('reserveInventory');
            return [];
        },
        reserveDigitalUnits: async () => {
            completed.push('reserveDigitalUnits');
            return digitalReservation;
        },
        authorizePayment: async () => {
            completed.push('authorizePayment');
            throw new Error('payment failed');
        },
        compensate: async checkpoint => {
            releasedDigital = checkpoint.results.digitalReservation[0].code === 'coupon-row-1';
            completed.push('compensate');
        }
    }), /payment failed/);
    assert.deepEqual(completed, ['validate', 'calculate', 'reserveInventory', 'reserveDigitalUnits', 'authorizePayment', 'compensate']);
    assert.equal(releasedDigital, true);
});

test('Order placement records digital sale and delivery after payment authorization', async () => {
    const completed = [];
    const request = {
        tenant: 'default',
        ownerId: 'customer-1',
        authData: { tenant: 'default' },
        idempotencyKey: 'order-2:place',
        correlationId: 'corr-2',
        payload: { cartCode: 'cart-2', orderCode: 'order-2' }
    };
    const calculation = { code: 'calc-2', currency: 'USD', totalAmount: '5.00', entries: [] };
    const digitalReservation = [{ code: 'coupon-row-2', entryCode: 'entry-2', status: 'RESERVED' }];
    const digitalSale = [{ code: 'coupon-row-2', entryCode: 'entry-2', status: 'SOLD' }];
    const digitalDelivery = [{ code: 'coupon-row-2', entryCode: 'entry-2', status: 'DELIVERED' }];
    const result = await placement.place(request, {
        findPlacement: async () => undefined,
        validateCart: async () => {
            completed.push('validate');
            return { status: 'VALID' };
        },
        calculateCart: async () => {
            completed.push('calculate');
            return calculation;
        },
        reserveInventory: async () => {
            completed.push('reserveInventory');
            return [];
        },
        reserveDigitalUnits: async () => {
            completed.push('reserveDigitalUnits');
            return digitalReservation;
        },
        authorizePayment: async () => {
            completed.push('authorizePayment');
            return { status: 'AUTHORIZED' };
        },
        createOrder: async () => {
            completed.push('createOrder');
            return { code: 'order-2', cartCode: 'cart-2' };
        },
        commitPromotions: async () => {
            completed.push('commitPromotions');
            return { redemption: { code: 'redemption-1', promotionCode: 'coupon5', couponCode: 'coupon-row-1' } };
        },
        confirmDigitalSale: async () => {
            completed.push('confirmDigitalSale');
            return digitalSale;
        },
        releaseFulfillment: async () => {
            completed.push('releaseFulfillment');
            return { code: 'order-2:1' };
        },
        deliverDigitalUnits: async () => {
            completed.push('deliverDigitalUnits');
            return digitalDelivery;
        },
        complete: async (checkpoint, finalResult) => {
            completed.push('complete');
            return { checkpoint, finalResult };
        },
        compensate: async () => completed.push('compensate')
    });
    assert.deepEqual(completed, ['validate', 'calculate', 'reserveInventory', 'reserveDigitalUnits', 'authorizePayment', 'createOrder', 'commitPromotions', 'confirmDigitalSale', 'releaseFulfillment', 'deliverDigitalUnits', 'complete']);
    assert.deepEqual(result.checkpoint.completed, ['VALIDATED', 'CALCULATED', 'RESERVED', 'DIGITAL_RESERVED', 'AUTHORIZED', 'ORDERED', 'PROMOTION_COMMITTED', 'DIGITAL_SOLD', 'RELEASED', 'DIGITAL_DELIVERED']);
    assert.equal(result.finalResult.promotionCommit.redemption.code, 'redemption-1');
    assert.equal(result.finalResult.digitalSale[0].status, 'SOLD');
    assert.equal(result.finalResult.digitalDelivery[0].status, 'DELIVERED');
});
