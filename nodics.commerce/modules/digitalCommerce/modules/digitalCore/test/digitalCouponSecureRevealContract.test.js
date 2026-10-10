/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../../../..');
const promotion = relative => require(path.join(root, 'nodics.commerce/modules/baseCommerce/modules/promotion', relative));
const fixture = promotion('test/helpers/secureIssuanceFixture');
const setup = promotion('src/service/defaultPromotionSetupContributionService');
const reveal = promotion('src/service/defaultCouponSecureRevealService');
const digital = require('../src/service/defaultDigitalCommerceEntitlementService');
const notifications = require('../src/service/defaultDigitalCommerceNotificationService');
const refund = require('../src/service/defaultDigitalCommerceRefundService');
const checkout = require('../src/service/defaultDigitalCommerceCheckoutService');

/** @module digitalCore/test/digitalCouponSecureRevealContract @description Exercises actual encrypted issuance and Promotion/Digital committed reveal owners using real key and privacy owners plus isolated persistence doubles. No native transaction/payment/provider qualification is claimed. @layer test @owner digitalCore */
async function purchased(t) {
    const f = fixture.create(t);
    f.policy.validTo = new Date(Date.now() + 86400000).toISOString();
    f.campaign.policyFingerprint = SERVICE.DefaultPromotionPublicationService.fingerprint(f.policy);
    await setup.installContribution(f.request);
    const coupon = f.rows.coupon[0];
    const scope = { tenant: 'tenantA', enterpriseCode: 'issuerA', ownerId: 'buyerA' };
    const authData = { ...scope, principalId: scope.ownerId, principalType: 'customer', tokenType: 'access' };
    f.settings.digitalCore = { maximumCouponUnitsPerCheckout: 100 };
    const purchase = { ...scope, authData, storeCode: 'storeA', idempotencyKey: 'checkoutA',
        payload: { orderCode: 'purchaseA', cartCode: 'cartA' } };
    const entryCode = ['cartA', 'offerA', 'SKU-A'].join('|');
    const reservations = await checkout.reserveForCheckout(purchase, { entries: [{ code: entryCode, productCode: 'offerA',
        quantity: '1', availability: { inventoryStrategy: 'COUPON_CODE_POOL', couponBatchCode: coupon.batchCode } }] });
    const saleRequest = { ...purchase, idempotencyKey: reservations[0].idempotencyKey,
        payload: { couponCode: coupon.code, orderCode: purchase.payload.orderCode } };
    await SERVICE.DefaultPromotionOperationService.confirmCouponCodeSale(saleRequest);
    await SERVICE.DefaultPromotionOperationService.deliverCouponCodeSale(saleRequest);
    assert.equal(coupon.entryCode, entryCode);
    assert.equal(Object.hasOwn(coupon, 'orderEntryCode'), false);
    const records = {
        DefaultDigitalEntitlementService: [],
        DefaultCommerceOrderService: [{ ...scope, code: coupon.orderCode, active: true, status: 'COMPLETED', revision: 2,
            totalAmount: '10.00', currency: 'AED' }],
        DefaultCommerceOrderEntryService: [{ ...scope, code: coupon.orderCode + ':' + coupon.entryCode,
            orderCode: coupon.orderCode, productCode: coupon.productCode, quantity: '1' }],
        DefaultCheckoutCheckpointService: [{ ...scope, code: coupon.orderCode, status: 'COMPLETED',
            evidence: { orderCode: coupon.orderCode, digitalDeliveryCodes: [coupon.code] } }],
        DefaultPaymentTransactionEntryService: [{ tenant: scope.tenant, ownerId: scope.ownerId, code: 'captureA', orderCode: coupon.orderCode,
            status: 'CAPTURED', totalAmount: '10.00', currency: 'AED', evidence: { operation: 'CAPTURE' } }],
        DefaultDigitalDeliveryService: [],
    };
    SERVICE.DefaultDigitalCommerceEntitlementService = digital;
    SERVICE.DefaultDigitalCommerceNotificationService = notifications;
    SERVICE.DefaultDigitalCommerceRefundService = refund;
    SERVICE.DefaultCouponSecureRevealService = reveal;
    for (const name of Object.keys(records)) SERVICE[name] = { get: async request => {
        if (f.state.failedRead === name) return { code: 'ERR_READ', result: records[name] };
        return { code: 'SUC_TEST', result: structuredClone(f.state.foreignRead === name ? records[name] :
            records[name].filter(row => f.matches(row, request.query || {}))) };
    } };
    SERVICE.DefaultDigitalEntitlementService.save = async request => {
        records.DefaultDigitalEntitlementService.push(structuredClone(request.model));
        return { code: 'SUC_TEST', result: request.model };
    };
    await digital.createFromCouponSales(purchase, { code: coupon.orderCode }, [coupon]);
    const entitlement = records.DefaultDigitalEntitlementService[0];
    records.DefaultDigitalDeliveryService.push({ ...scope, code: 'deliveryA', orderCode: coupon.orderCode,
        entitlementCode: entitlement.code, deliveryType: 'COUPON_CODE', providerOwner: 'promotion', providerCode: coupon.code,
        status: 'DELIVERED', deliveredAt: coupon.deliveredAt });
    const customer = { ...scope, authData,
        payload: { entitlementCode: entitlement.code } };
    return { ...f, records, coupon, entitlement, customer,
        reveal: (request = structuredClone(customer)) => f.privateRun(request, () => digital.reveal(request)) };
}

test('only the signed delivered purchaser receives the same retained token on repeated reveal', async t => {
    const f = await purchased(t), writes = f.state.writes;
    const first = await f.reveal(), second = await f.reveal();
    assert.equal(first.status, 'REVEALED'); assert.match(first.token, /^[A-F0-9]{64}$/);
    assert.equal(first.token, second.token);
    assert.equal(SERVICE.DefaultPromotionOperationService.hashToken('tenantA', first.token), f.coupon.tokenHash);
    assert.ok(!JSON.stringify([f.rows, f.records]).includes(first.token)); assert.equal(f.state.writes, writes);
});

test('checkout consumption and reversal use the protected lifecycle owner, preserving encrypted purchase identity', async t => {
    const f = await purchased(t), owner = SERVICE.DefaultPromotionOperationService;
    const original = structuredClone(f.coupon.protectedToken), token = (await f.reveal()).token;
    await owner.consumeCoupon(f.customer, await owner.readLifecycleCoupon(f.customer, f.coupon.code));
    assert.equal(f.coupon.status, 'REDEEMED'); assert.equal(f.coupon.usedCount, 1);
    assert.deepEqual(f.coupon.protectedToken, original);
    await assert.rejects(f.reveal(), { code: 'ERR_DIGITAL_REVEAL_FORBIDDEN' });
    await owner.releaseCoupon(f.customer, { couponCode: f.coupon.code });
    assert.equal(f.coupon.status, 'DELIVERED'); assert.equal(f.coupon.usedCount, 0);
    assert.deepEqual(f.coupon.protectedToken, original);
    assert.equal((await f.reveal()).token, token);
});

test('lost coupon consumption revision never qualifies a successful checkout mutation', async t => {
    const f = await purchased(t), owner = SERVICE.DefaultPromotionOperationService;
    const stale = await owner.readLifecycleCoupon(f.customer, f.coupon.code);
    f.coupon.revision++;
    await assert.rejects(owner.consumeCoupon(f.customer, stale));
    assert.equal(f.coupon.status, 'DELIVERED');
});

test('missing, duplicate, foreign and unsupported entitlements share a content-free typed denial', async t => {
    const f = await purchased(t), original = structuredClone(f.entitlement);
    for (const rows of [[], [original, original], [{ ...original, ownerId: 'intruder' }],
        [{ ...original, providerOwner: 'unsupported' }]]) {
        f.records.DefaultDigitalEntitlementService = structuredClone(rows);
        f.state.foreignRead = 'DefaultDigitalEntitlementService';
        await assert.rejects(f.reveal(), { code: 'ERR_DIGITAL_REVEAL_FORBIDDEN' });
    }
    f.records.DefaultDigitalEntitlementService = [original];
    delete f.state.foreignRead;
    const request = structuredClone(f.customer);
    request.authData.principalId = request.ownerId = 'intruder';
    await assert.rejects(f.reveal(request), { code: 'ERR_DIGITAL_REVEAL_FORBIDDEN' });
});

test('one original checkout entry admits reveal while mixed, absent and mismatched entry identities refuse', async t => {
    const f = await purchased(t), original = f.coupon.entryCode;
    f.coupon.orderEntryCode = original;
    assert.equal((await f.reveal()).status, 'REVEALED');
    for (const alias of ['otherEntry', '', null, ' entryA', {}]) {
        f.coupon.orderEntryCode = alias;
        await assert.rejects(f.reveal(), { code: 'ERR_DIGITAL_REVEAL_FORBIDDEN' });
    }
    delete f.coupon.orderEntryCode;
    f.entitlement.orderEntryCode = 'otherEntry';
    await assert.rejects(f.reveal(), { code: 'ERR_DIGITAL_REVEAL_FORBIDDEN' });
    f.entitlement.orderEntryCode = original;
    delete f.coupon.entryCode;
    await assert.rejects(f.reveal(), { code: 'ERR_DIGITAL_REVEAL_FORBIDDEN' });
    f.coupon.orderEntryCode = original;
    assert.equal((await f.reveal()).status, 'REVEALED');
});

test('entitlement creation uses the same entry resolver and rejects conflicting aliases before saving a unit', async t => {
    const f = await purchased(t), count = f.records.DefaultDigitalEntitlementService.length;
    const sale = { ...f.coupon, code: 'newCoupon', orderEntryCode: 'foreignEntry' };
    await assert.rejects(digital.createFromCouponSales(f.customer, { code: f.coupon.orderCode }, [sale]),
        { code: 'ERR_DIGITAL_REVEAL_FORBIDDEN' });
    assert.equal(f.records.DefaultDigitalEntitlementService.length, count);
    const calls = [];
    const narrowed = { ...digital, couponPurchaseEntryCode: function (coupon) {
        calls.push(coupon.code); return digital.couponPurchaseEntryCode.call(this, coupon);
    } };
    const request = { ...f.customer, entitlementCode: f.entitlement.code, couponCode: f.coupon.code };
    await f.privateRun(request, () => narrowed.authorizeCouponReveal(request, f.coupon));
    assert.deepEqual(calls, [f.coupon.code]);
});

test('body privacy/qualification flags never admit reveal; employee/service/mismatched signed scopes refuse', async t => {
    const f = await purchased(t);
    await assert.rejects(digital.reveal({ ...f.customer, privateOperation: true, qualified: true }), { code: 'ERR_DIGITAL_REVEAL_FORBIDDEN' });
    for (const request of [
        { ...f.customer, tenant: 'foreign' }, { ...f.customer, enterpriseCode: 'foreign' }, { ...f.customer, ownerId: 'intruder' },
        { ...f.customer, authData: { ...f.customer.authData, entCode: 'foreign' } },
        { ...f.customer, authData: { ...f.customer.authData, principalType: 'human' } },
        { ...f.customer, authData: { ...f.customer.authData, tokenType: 'service' } },
    ]) await assert.rejects(f.reveal(request), { code: 'ERR_DIGITAL_REVEAL_FORBIDDEN' });
    f.state.allowed = false; await assert.rejects(f.reveal()); f.state.allowed = true;
    f.settings.runtimeRole = 'COMMERCE_STAGED'; await assert.rejects(f.reveal());
});

test('pending, missing, duplicate, mismatched amount or failed payment capture never reveals', async t => {
    const f = await purchased(t), original = structuredClone(f.records.DefaultPaymentTransactionEntryService);
    for (const rows of [[], [{ ...original[0], status: 'AUTHORIZED' }], [original[0], original[0]],
        [{ ...original[0], totalAmount: '9.99' }], [{ ...original[0], currency: 'USD' }]]) {
        f.records.DefaultPaymentTransactionEntryService = structuredClone(rows); await assert.rejects(f.reveal());
    }
    f.records.DefaultPaymentTransactionEntryService = original;
    f.state.failedRead = 'DefaultPaymentTransactionEntryService'; await assert.rejects(f.reveal());
});

test('foreign returned capture, checkpoint or delivery cannot substitute committed purchaser evidence', async t => {
    const f = await purchased(t);
    for (const [name, field, value] of [
        ['DefaultPaymentTransactionEntryService', 'tenant', 'foreign'],
        ['DefaultPaymentTransactionEntryService', 'ownerId', 'intruder'],
        ['DefaultPaymentTransactionEntryService', 'orderCode', 'otherOrder'],
        ['DefaultCheckoutCheckpointService', 'enterpriseCode', 'foreign'],
        ['DefaultDigitalDeliveryService', 'ownerId', 'intruder'],
        ['DefaultDigitalDeliveryService', 'entitlementCode', 'otherEntitlement'],
    ]) {
        const original = f.records[name][0][field]; f.records[name][0][field] = value; f.state.foreignRead = name;
        await assert.rejects(f.reveal()); f.records[name][0][field] = original;
    }
});

test('missing or pending delivery and incomplete Checkout cannot reveal an issued secret', async t => {
    const f = await purchased(t), original = structuredClone(f.records.DefaultDigitalDeliveryService);
    for (const rows of [[], [{ ...original[0], status: 'PENDING' }], [original[0], original[0]]]) {
        f.records.DefaultDigitalDeliveryService = rows; await assert.rejects(f.reveal());
    }
    f.records.DefaultDigitalDeliveryService = original;
    f.records.DefaultCheckoutCheckpointService[0].status = 'PENDING'; await assert.rejects(f.reveal());
});

test('revoked, reserved, redeemed, refunded or expired coupons and foreign entitlements never reveal', async t => {
    const f = await purchased(t);
    for (const status of ['ACTIVE', 'RESERVED', 'SOLD', 'REDEEMED', 'REFUND_PENDING', 'REFUNDED', 'REVOKED', 'EXPIRED']) {
        f.coupon.status = status; await assert.rejects(f.reveal());
    }
    f.coupon.status = 'DELIVERED'; const expiry = f.coupon.validTo;
    f.coupon.validTo = new Date(Date.now() - 1); await assert.rejects(f.reveal()); f.coupon.validTo = expiry;
    f.entitlement.ownerId = 'intruder'; await assert.rejects(f.reveal()); f.entitlement.ownerId = 'buyerA';
    f.entitlement.status = 'REVOKED'; await assert.rejects(f.reveal());
});

test('ambiguous entitlement, changed original purchase or missing complete unit evidence rejects', async t => {
    const f = await purchased(t);
    f.records.DefaultDigitalEntitlementService.push(structuredClone(f.entitlement)); await assert.rejects(f.reveal());
    f.records.DefaultDigitalEntitlementService.pop();
    f.entitlement.purchasedAt = new Date(Date.parse(f.coupon.soldAt) + 60000);
    await assert.rejects(f.reveal()); f.entitlement.purchasedAt = f.coupon.soldAt;
    f.records.DefaultCommerceOrderEntryService[0].quantity = '2'; await assert.rejects(f.reveal());
});

test('token tampering or loss of receipt/key fails closed without plaintext or replacement issuance', async t => {
    const f = await purchased(t), writes = f.state.writes;
    const original = structuredClone(f.coupon.protectedToken), batch = f.rows.couponBatch[0];
    f.coupon.protectedToken.tag = '0'.repeat(32); await assert.rejects(f.reveal());
    f.coupon.protectedToken = original;
    delete f.settings.secretProtection.purposes.PROMOTION_COUPON_TOKEN.keys.primary;
    await assert.rejects(f.reveal());
    f.rows.couponBatch.splice(0, 1); await assert.rejects(f.reveal());
    f.rows.couponBatch.push(batch); assert.equal(f.state.writes, writes);
});

test('refund/revocation racing decryption prevents token return after final current-evidence check', async t => {
    const f = await purchased(t), owner = SERVICE.DefaultSecretProtectionService;
    SERVICE.DefaultSecretProtectionService = { ...owner, unprotect: function (request) {
        const token = owner.unprotect(request); f.coupon.status = 'REFUND_PENDING'; f.coupon.revision++;
        return token;
    } };
    await assert.rejects(f.reveal());
});

test('generic lifecycle CAS preserves ciphertext but ordinary aggregate updates cannot read or rewrite it', async t => {
    const f = await purchased(t), original = structuredClone(f.coupon.protectedToken);
    const command = { tenant: 'tenantA', query: { code: f.coupon.code, revision: 3 }, model: { $set: { status: 'CLAIMED', revision: 4 } } };
    const saved = await SERVICE.DefaultCouponSellerAuthorizationService.writeCoupon(command);
    assert.equal(saved.result.matchedCount, 1); assert.deepEqual(f.coupon.protectedToken, original);
    assert.equal(SERVICE.DefaultCouponSellerAuthorizationService.isCouponWrite(command), false);
    await f.reveal();
});

test('reveal route is private/non-cacheable and controller marks responses no-store before owner handling', async t => {
    const f = await purchased(t);
    const router = require('../src/router/routers').digitalCore.customer.revealEntitlement;
    assert.deepEqual(router.requestPrivacy, { sensitive: true }); assert.equal(router.cache.enabled, false);
    const controller = require('../src/controller/defaultDigitalCommerceCustomerController');
    const previous = global.FACADE; t.after(() => { global.FACADE = previous; });
    global.FACADE = { DefaultDigitalCommerceCustomerFacade: require('../src/facade/defaultDigitalCommerceCustomerFacade') };
    const headers = {}, request = { ...structuredClone(f.customer), httpResponse: { setHeader: (key, value) => { headers[key] = value; } },
        httpRequest: { params: { entitlementCode: f.entitlement.code }, body: {} } };
    const response = await f.privateRun(request, () => controller.revealEntitlement(request));
    assert.equal(response.data.status, 'REVEALED'); assert.equal(headers['Cache-Control'], 'no-store'); assert.equal(headers.Pragma, 'no-cache');
});
