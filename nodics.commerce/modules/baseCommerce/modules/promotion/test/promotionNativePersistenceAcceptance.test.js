/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/promotionNativePersistenceAcceptance
 * @description Opt-in real MongoDB owner persistence acceptance. Synthetic legacy stock is created by Promotion, never direct database seeds. Secure issuance, signed consent and business activation remain separate gates.
 * @layer test @owner promotion
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fixture = require('./helpers/nativePersistenceFixture');
const operation = require('../src/service/defaultPromotionOperationService');
const secure = require('../src/service/defaultCouponSecureIssuanceService');

test('native Promotion: installed private indexes/hooks, owner lifecycle CAS, rollback and reconnect', {
    skip: !process.env.NODICS_COMMERCE_NATIVE_MONGO_URI,
}, async t => {
    const f = await fixture.create(t);
    await secure.persistence({ tenant: f.tenant });
    const couponIndexes = await SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes(f.models.coupon);
    assert.ok(couponIndexes.indexes.some(index => index.unique && index.key.tenant === 1 && index.key.tokenHash === 1));
    assert.equal(CONFIG.get('promotion').sellerAuthorization.qualified, false);
    assert.equal(CONFIG.get('promotion').purchasedRights.qualified, false);
    assert.equal(CONFIG.get('promotion').merchantBenefits.qualified, false);

    // This intentionally uses the legacy owner route only as synthetic persistence input, never secure issuance evidence.
    const created = await operation.createCouponBatch({ ...f.request, idempotencyKey: 'native_synthetic_stock',
        payload: { code: 'synthetic_batch', promotionCode: 'synthetic_policy', quantity: 2, seed: 'native_acceptance' } });
    assert.equal(created.coupons.length, 2);
    const previous = await operation.readLifecycleCoupon(f.request, created.coupons[0].code);
    const contenders = await Promise.allSettled(['command_a', 'command_b'].map(key => operation.commitLifecycleCoupon(
        f.request, previous, { ...previous, status: 'RESERVED', reservedFor: f.request.ownerId, idempotencyKey: key, revision: 1 })));
    assert.equal(contenders.filter(value => value.status === 'fulfilled').length, 1);
    assert.equal(contenders.filter(value => value.status === 'rejected').length, 1);
    const reserved = await operation.readLifecycleCoupon(f.request, previous.code);
    assert.equal(reserved.revision, 1);
    assert.equal(reserved.status, 'RESERVED');

    await assert.rejects(SERVICE.DefaultDatabaseTransactionService.execute({ moduleName: 'promotion', tenant: f.tenant },
        async transactionContext => {
            for (const coupon of created.coupons) {
                const result = await SERVICE.DefaultCouponService.update({ ...f.request, transactionContext,
                    query: { tenant: f.tenant, code: coupon.code }, model: { status: 'CANCELLED' } });
                assert.equal(result.result.matchedCount, 1);
            }
            throw new Error('acceptance interruption before commit');
        }), /acceptance interruption before commit/);
    assert.equal((await operation.readLifecycleCoupon(f.request, previous.code)).status, 'RESERVED');
    assert.equal((await operation.readLifecycleCoupon(f.request, created.coupons[1].code)).status, 'ACTIVE');
    assert.ok(f.commands.some(command => command.name === 'abortTransaction' && command.transaction));

    let expiredContext;
    await SERVICE.DefaultDatabaseTransactionService.execute({ moduleName: 'promotion', tenant: f.tenant }, async transactionContext => {
        expiredContext = transactionContext;
        for (const coupon of created.coupons) await SERVICE.DefaultCouponService.update({ ...f.request, transactionContext,
            query: { tenant: f.tenant, code: coupon.code }, model: { sourceReference: 'same_original_command' } });
    });
    assert.ok(f.commands.some(command => command.name === 'commitTransaction' && command.writeConcern?.w === 'majority' && command.writeConcern.j === true));
    assert.ok(f.commands.some(command => command.transaction && command.readConcern?.level === 'snapshot'));
    await assert.rejects(SERVICE.DefaultCouponService.update({ ...f.request, transactionContext: expiredContext,
        query: { tenant: f.tenant, code: previous.code }, model: { sourceReference: 'expired_transaction' } }), /context is invalid/);

    // Reconnect verifies persisted state independently of the previous client's acknowledgements.
    const beforeDisconnect = await operation.readLifecycleCoupon(f.request, previous.code);
    await f.reconnect();
    await secure.persistence({ tenant: f.tenant });
    const afterReconnect = await operation.readLifecycleCoupon(f.request, previous.code);
    assert.deepEqual(afterReconnect, beforeDisconnect);
    assert.equal(afterReconnect.idempotencyKey, reserved.idempotencyKey);
    assert.equal((await SERVICE.DefaultCouponService.get({ tenant: f.tenant, query: { batchCode: created.batch.code } })).result.length, 2);

    const released = await operation.commitLifecycleCoupon(f.request, afterReconnect, { ...afterReconnect,
        status: 'ACTIVE', revision: 2, reservedFor: undefined, idempotencyKey: undefined });
    assert.equal(Object.hasOwn(released, 'reservedFor'), false);
    assert.equal(Object.hasOwn(released, 'idempotencyKey'), false);
    await assert.rejects(operation.commitLifecycleCoupon(f.request, afterReconnect, { ...afterReconnect, revision: 2, status: 'SOLD' }), /lost its revision/);
    t.diagnostic('PASS: native validators/index discovery, generated hooks, exact lifecycle CAS, atomic rollback/majority commit, reconnect and explicit unset. No consent/private capture/secure issuance/rights qualification claimed.');
});

test('native Promotion: generic writes and protected queries cannot manufacture secure stock or seller proof', {
    skip: !process.env.NODICS_COMMERCE_NATIVE_MONGO_URI,
}, async t => {
    const f = await fixture.create(t);
    const before = f.commands.length;
    for (const field of ['protectedToken', 'secureIssuance', 'sellerAuthorizationProof']) {
        await assert.rejects(SERVICE.DefaultCouponService.save({ tenant: f.tenant,
            model: { code: 'forged', tenant: f.tenant, [field]: { fabricated: true } } }));
        await assert.rejects(SERVICE.DefaultCouponService.update({ tenant: f.tenant,
            query: { code: 'forged' }, model: { $unset: { [field]: '' } } }));
    }
    await assert.rejects(SERVICE.DefaultCouponService.get({ tenant: f.tenant, query: { 'protectedToken.ciphertext': 'invented' } }));
    assert.equal(f.commands.length, before, 'private guards must refuse before MongoDB sees the operation');
    assert.equal((await SERVICE.DefaultCouponService.get({ tenant: f.tenant, query: {} })).result.length, 0);
    await assert.rejects(secure.keyOwner({ tenant: f.tenant }), { code: 'ERR_PROMOTION_SETUP_TOKEN_OWNER_REQUIRED' });
    assert.throws(() => secure.privateOperation(f.request, () => assert.fail('unqualified private capture admitted')));
});
