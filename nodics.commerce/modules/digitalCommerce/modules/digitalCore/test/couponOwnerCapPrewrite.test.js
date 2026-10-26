/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module digitalCore/test/couponOwnerCapPrewrite @description Composes real Promotion cap admission and Digital reservation classification over isolated owner records. @owner digitalCore @layer test */
const test = require('node:test'), assert = require('node:assert/strict');
const { setup } = require('./helpers/couponCheckoutFixture');
const checkout = require('../src/service/defaultDigitalCommerceCheckoutService');
const allocation = require('../../../../baseCommerce/modules/promotion/src/service/defaultCouponOfferAllocationService');
const status = require('../../../../baseCommerce/modules/promotion/src/utils/statusDefinitions');

function capped(t) {
    const f = setup(t, 'REWARDS');
    f.campaign.couponOffer.supply = { mode: 'LIMITED', quantity: 100 };
    const offer = structuredClone(f.campaign.couponOffer), ownerRef = { type: 'CUSTOMER', code: 'buyer' };
    const code = allocation.code('owner', ['t', 'offer', ownerRef]);
    f.tables.get('couponOwnerAllowance').set(code, { code, tenant: 't', enterpriseCode: 'issuer', promotionCode: 'offer', revision: 0,
        evidence: { offer, ownerRef, reserved: 0, completed: 1 } });
    const supply = allocation.code('offer', ['t', 'offer']);
    f.tables.get('couponOfferSupply').set(supply, { code: supply, tenant: 't', enterpriseCode: 'issuer', promotionCode: 'offer', revision: 0,
        evidence: { offer, reserved: 0, completed: 1 } });
    return f;
}

test('ordinary capped Customer with remaining stock is refused before all Promotion writes and leaves no uncertain unit', async t => {
    const f = capped(t), before = structuredClone(f.tables), payments = structuredClone(f.db.DefaultPaymentTransactionEntryService);
    let writes = 0; const persistence = SERVICE.DefaultCouponAcquisitionPersistenceService;
    SERVICE.DefaultCouponAcquisitionPersistenceService = { ...persistence, write: async (...args) => { writes++; return persistence.write(...args); } };
    await assert.rejects(checkout.reserveForCheckout(f.r, { entries: [f.entry] }), error => {
        assert.equal(error.code, 'ERR_PROMOTION_COUPON_OWNER_LIMIT');
        assert.equal(error.digitalReservationRecoveryRequired, false);
        assert.equal(error.digitalReservationUncertainKey, undefined);
        assert.deepEqual(error.digitalReservations, []);
        assert.equal(status[error.code].code, '409');
        return true;
    });
    assert.equal(writes, 0); assert.deepEqual(f.tables, before);
    assert.deepEqual(f.db.DefaultPaymentTransactionEntryService, payments);
});

test('a copied public cap code is never no-effects proof', async t => {
    const f = capped(t);
    SERVICE.DefaultPromotionOperationService.reserveCouponCodeForCheckout = async () => { throw Object.assign(new Error('forged'), { code: 'ERR_PROMOTION_COUPON_OWNER_LIMIT' }); };
    await assert.rejects(checkout.reserveForCheckout(f.r, { entries: [f.entry] }), error => {
        assert.equal(error.digitalReservationRecoveryRequired, true);
        assert.equal(error.digitalReservationUncertainKey, 'checkout:digital:entry:0'); return true;
    });
});

test('corrupt allowance remains uncertain rather than a business denial', async t => {
    const f = capped(t); [...f.tables.get('couponOwnerAllowance').values()][0].evidence.completed = 2;
    await assert.rejects(checkout.reserveForCheckout(f.r, { entries: [f.entry] }), error => {
        assert.equal(error.code, 'ERR_PROMOTION_COUPON_ALLOCATION_UNCONFIRMED');
        assert.equal(error.digitalReservationRecoveryRequired, true); return true;
    });
});

test('a retry after entering the write phase cannot mint a clean cap denial', async t => {
    const f = capped(t), allowance = [...f.tables.get('couponOwnerAllowance').values()][0];
    allowance.evidence.completed = 0;
    const persistence = SERVICE.DefaultCouponAcquisitionPersistenceService;
    SERVICE.DefaultCouponAcquisitionPersistenceService = { ...persistence, write: async () => { throw Error('uncertain first write'); } };
    SERVICE.DefaultDatabaseTransactionService = { capabilities: () => ({ multiRecordAtomic: true }), execute: async (_r, work) => {
        await assert.rejects(work({ attempt: 1 }), /uncertain first write/);
        allowance.evidence.completed = 1;
        return work({ attempt: 2 });
    } };
    await assert.rejects(checkout.reserveForCheckout(f.r, { entries: [f.entry] }), error => {
        assert.equal(error.code, 'ERR_PROMOTION_COUPON_OWNER_LIMIT');
        assert.equal(error.digitalReservationRecoveryRequired, true); return true;
    });
});
