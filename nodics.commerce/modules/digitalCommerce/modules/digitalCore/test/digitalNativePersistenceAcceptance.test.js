/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module digitalCore/test/digitalNativePersistenceAcceptance
 * @description Opt-in native generated entitlement/delivery persistence, exact replay, CAS race and interrupted recovery. Synthetic upstream sale inputs qualify only Digital persistence, never payment, publication or purchased rights.
 * @layer test @owner digitalCore
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fixture = require('../../../../baseCommerce/modules/promotion/test/helpers/nativePersistenceFixture');
const owner = require('../src/service/defaultDigitalCommerceEntitlementService');

test('native Digital: original entitlement/delivery survive reconnect, replay and competing CAS', {
    skip: !process.env.NODICS_COMMERCE_NATIVE_MONGO_URI,
}, async t => {
    const f = await fixture.create(t, 'digitalCore');
    const order = { code: 'synthetic_order' };
    const sale = { code: 'synthetic_coupon', tenant: f.tenant, enterpriseCode: f.request.enterpriseCode,
        soldTo: f.request.ownerId, orderCode: order.code, entryCode: 'original|entry', productCode: 'synthetic_product', sku: 'synthetic_sku',
        status: 'SOLD', soldAt: '2026-10-09T08:30:01.123Z', validTo: '2027-10-09T08:30:01.123Z',
        promotionCode: 'synthetic_policy', batchCode: 'synthetic_batch', idempotencyKey: 'original_purchase_unit' };
    const [entitlement] = await owner.createFromCouponSales(f.request, order, [sale]);
    assert.equal(entitlement.purchasedAt.getTime(), Date.parse(sale.soldAt));
    assert.equal(entitlement.validTo.getTime(), Date.parse(sale.validTo));
    await f.reconnect();
    const [replayed] = await owner.createFromCouponSales(f.request, order, [sale]);
    assert.deepEqual(replayed, entitlement);
    const delivery = { ...sale, status: 'DELIVERED', deliveredAt: '2026-10-09T08:30:02.456Z' };
    const [originalDelivery] = await owner.recordDeliveries(f.request, order, [delivery]);
    await f.reconnect();
    const [deliveryReplay] = await owner.recordDeliveries(f.request, order, [delivery]);
    assert.deepEqual(deliveryReplay, originalDelivery);
    assert.equal(deliveryReplay.deliveredAt.getTime(), Date.parse(delivery.deliveredAt));
    assert.equal(deliveryReplay.entitlementCode, entitlement.code);
    assert.equal((await owner.listEntitlements(f.request, { orderCode: order.code })).length, 1);

    await assert.rejects(owner.createFromCouponSales(f.request, order, [{ ...sale, soldAt: '2026-10-09T08:30:01.124Z' }]), /readback changed/);
    await assert.rejects(owner.recordDeliveries({ ...f.request, ownerId: 'different_buyer' }, order, [delivery]), /identity|entitlement/);
    const competing = await Promise.allSettled(['target_a', 'target_b'].map(target => owner.update(
        SERVICE.DefaultDigitalEntitlementService, f.request, replayed, { status: 'CLAIMED', claimStatus: target })));
    assert.equal(competing.filter(value => value.status === 'fulfilled').length, 1);
    assert.equal(competing.filter(value => value.status === 'rejected').length, 1);
    const [claimed] = await owner.listEntitlements(f.request, { code: entitlement.code });
    assert.equal(claimed.revision, 1);
    await f.reconnect();
    const [originalReplay] = await owner.createFromCouponSales(f.request, order, [sale]);
    assert.deepEqual(originalReplay, claimed, 'purchase replay must preserve later lifecycle state');
    assert.equal(CONFIG.get('digitalCore').digitalOwnership.qualified, false);
    t.diagnostic('PASS: native generated Digital save/read/update, BSON milliseconds, exact original identity, reconnect, monotonic replay and one-winner CAS. Upstream sale inputs are synthetic; DIGITAL_OWNERSHIP/domain settlement and signed admission are not qualified.');
});

test('native Digital ownership: actual record owner persists complete terminal evidence and rejects millisecond/evidence drift', {
    skip: !process.env.NODICS_COMMERCE_NATIVE_MONGO_URI,
}, async t => {
    const f = await fixture.create(t, 'digitalCore');
    const ownership = require('../src/service/defaultDigitalCommerceOwnershipService');
    const order = { code: 'synthetic_ownership_order' };
    // These are synthetic upstream inputs to the actual persistence owner, not domain/payment acceptance evidence.
    const sale = { code: 'synthetic_transfer', entryCode: 'original|ownership_entry', productCode: 'synthetic_asset_product',
        sku: 'synthetic_asset_sku', idempotencyKey: 'original_ownership_unit', assetCode: 'synthetic_asset', bindingCode: 'synthetic_binding',
        soldAt: '2026-10-09T09:00:01.123Z', deliveredAt: '2026-10-09T09:00:01.123Z',
        evidence: { transferCode: 'synthetic_transfer', physicalCustodyTransferred: false,
            capture: { paymentRef: { code: 'synthetic_original_capture' } },
            settlement: { sellerEarningReference: 'synthetic_original_earning', carbonReferences: [] } } };
    const original = await ownership.record(f.request, order, sale, true);
    assert.equal(original.providerOwner, 'wasteCore');
    assert.equal(original.digitalDeliveryType, 'DIGITAL_OWNERSHIP');
    await f.reconnect();
    const replayed = await ownership.record(f.request, order, sale, true);
    assert.deepEqual(replayed, original);
    for (const changed of [
        { ...sale, soldAt: '2026-10-09T09:00:01.124Z' },
        { ...sale, deliveredAt: '2026-10-09T09:00:01.124Z' },
        { ...sale, evidence: { ...sale.evidence, physicalCustodyTransferred: true } },
        { ...sale, evidence: { ...sale.evidence, settlement: { sellerEarningReference: 'different_earning' } } },
    ]) await assert.rejects(ownership.record(f.request, order, changed, true), /evidence changed|readback changed/);
    const delivery = await owner.readRecords(SERVICE.DefaultDigitalDeliveryService, f.request,
        { tenant: f.tenant, code: 'digitalDelivery:' + sale.code });
    assert.equal(delivery.length, 1);
    assert.equal(delivery[0].deliveredAt.getTime(), Date.parse(sale.deliveredAt));
    assert.equal(delivery[0].evidence.physicalCustodyTransferred, false);
    assert.deepEqual(delivery[0].evidence.settlement, sale.evidence.settlement);
    assert.equal(CONFIG.get('digitalCore').digitalOwnership.qualified, false);
    t.diagnostic('PASS: actual DIGITAL_OWNERSHIP record/verifyRecord owner and native generated persistence. Synthetic upstream capture/settlement references grant no domain, Payment, Loyalty or ownership-transfer qualification.');
});
