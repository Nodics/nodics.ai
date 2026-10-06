/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module digitalCore/test/digitalPersistenceAndReservationContract @description Covers failed owner evidence, bounded acquisition and partial compensation handoff. @layer test @owner digitalCore */
const test = require('node:test');
const assert = require('node:assert/strict');
const checkout = require('../src/service/defaultDigitalCommerceCheckoutService');
const entitlement = require('../src/service/defaultDigitalCommerceEntitlementService');

test('digital confirmation preserves the trusted checkout Store for Promotion', async () => {
    global.SERVICE = {
        DefaultPromotionOperationService: { confirmCouponCodeSale: async request => {
            assert.equal(request.storeCode, 'published-store');
            assert.equal(request.tenant, 'tenant-a');
            return { code: 'coupon-a', status: 'SOLD' };
        } },
        DefaultDigitalCommerceEntitlementService: { createFromCouponSales: async () => [
            { code: 'entitlement-a', providerCode: 'coupon-a' },
        ] },
    };
    const result = await checkout.confirmSale({ tenant: 'tenant-a', storeCode: 'published-store', payload: { storeCode: 'forged-store' } },
        { code: 'order-a' }, [{ code: 'coupon-a', idempotencyKey: 'purchase-a' }]);
    assert.equal(result[0].entitlementCode, 'entitlement-a');
});

test('missing generated entitlement owner rejects instead of constructing success', async () => {
    await assert.rejects(
        entitlement.save(undefined, {}, { code: 'e' }),
        /owner is unavailable/,
    );
    await assert.rejects(
        entitlement.update(undefined, {}, { revision: 0 }, {}),
        /owner is required/,
    );
});

test('failed generated read envelopes are not interpreted as empty stock', async () => {
    const service = { get: async () => ({ code: 'ERR_READ', result: [] }) };
    await assert.rejects(
        entitlement.readRecords(service, { authData: {} }, {}),
        /not confirmed/,
    );
});

test('partial digital acquisitions remain available to checkout compensation', async () => {
    global.CONFIG = { get: () => ({ maximumCouponUnitsPerCheckout: 100 }) };
    let acquired = 0;
    global.SERVICE = {
        DefaultPromotionOperationService: {
            reserveCouponCodeForCheckout: async () => {
                if (++acquired === 2) throw new Error('Reservation uncertain');
                return {
                    code: 'unit1',
                    status: 'RESERVED',
                    idempotencyKey: 'purchase:digital:entry:0',
                };
            },
        },
    };
    const request = {
        tenant: 't',
        ownerId: 'buyer',
        idempotencyKey: 'purchase',
        payload: { orderCode: 'order' },
    };
    const calculation = {
        entries: [
            {
                code: 'entry',
                quantity: 2,
                availability: {
                    inventoryStrategy: 'COUPON_CODE_POOL',
                    couponBatchCode: 'batch',
                },
            },
        ],
    };
    await assert.rejects(
        checkout.reserveForCheckout(request, calculation),
        (error) => {
            assert.equal(error.digitalReservationRecoveryRequired, true);
            assert.equal(error.digitalReservations.length, 1);
            return true;
        },
    );
});

test('fractional coupon quantities fail before reservation', () => {
    global.CONFIG = { get: () => ({ maximumCouponUnitsPerCheckout: 100 }) };
    assert.throws(
        () =>
            checkout.couponUnits({
                entries: [
                    {
                        quantity: 1.5,
                        availability: { digitalDeliveryType: 'COUPON_CODE' },
                    },
                ],
            }),
        /positive integer/,
    );
});

test('a sold coupon is not reported as successfully released', async () => {
    global.SERVICE = {
        DefaultPromotionOperationService: {
            releaseCouponCodeReservation: async () => ({
                code: 'c',
                status: 'SOLD',
            }),
        },
    };
    const outcomes = await checkout.releaseReservations({}, [{ code: 'c' }]);
    assert.equal(outcomes[0].status, 'FAILED');
});

test('aggregate quantity is bounded before expanding another entry', () => {
    global.CONFIG = { get: () => ({ maximumCouponUnitsPerCheckout: 100 }) };
    const entry = {
        quantity: 60,
        availability: { digitalDeliveryType: 'COUPON_CODE' },
    };
    assert.throws(
        () => checkout.couponUnits({ entries: [entry, entry] }),
        /unit bound/,
    );
});

test('entitlement selectors cannot replace the runtime tenant', async () => {
    let observed;
    global.SERVICE = {
        DefaultDigitalEntitlementService: {
            get: async (request) => {
                observed = request.query;
                return { code: 'SUC_READ', result: [] };
            },
        },
    };
    await entitlement.listEntitlements(
        { tenant: 'current', enterpriseCode: 'target' },
        { tenant: 'foreign', enterpriseCode: 'other' },
    );
    assert.equal(observed.tenant, 'current');
    assert.equal(observed.enterpriseCode, 'target');
});

test('an oversized digital result is rejected rather than partially reversed', async () => {
    const service = {
        get: async () => ({
            code: 'SUC_READ',
            result: Array.from({ length: 101 }, (_, index) => ({
                code: String(index),
            })),
        }),
    };
    await assert.rejects(
        entitlement.readRecords(service, {}, {}),
        /complete-read bound/,
    );
});
