/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module digitalCore/test/digitalCouponSourceIssuanceProjection
 * @description Real Promotion private projection and BSON codec around source proofs; isolated storage only.
 * @owner digitalCore @layer test
 */
const test = require('node:test'), assert = require('node:assert/strict');
const { BSON, ObjectId } = require('mongodb');
const { setup } = require('./helpers/couponCheckoutFixture');
const acquisition = require('../src/service/defaultDigitalCommerceCouponAcquisitionService');
const checkout = require('../src/service/defaultDigitalCommerceCheckoutService');
const secure = require('../../../../baseCommerce/modules/promotion/src/service/defaultCouponSecureIssuanceService');

async function fixture(t, phase, delegated = false) {
  const f = setup(t, 'CERTIFICATES', true, 'buyer-enterprise');
  const units = await checkout.reserveForCheckout(f.r, { entries: [f.entry] });
  const coupon = f.tables.get('coupon').get(units[0].code);
  const allocation = f.tables.get('couponAcquisitionReservation').get(coupon.offerAllocationCode);
  const batch = f.tables.get('couponBatch').get(coupon.batchCode);
  if (delegated) {
    const ref = { moduleName: 'profile', schemaName: 'enterprise', code: 'other-issuer' };
    const proof = { issuerEnterpriseCode: ref.code, sellerEnterpriseCode: 'issuer', promotionCode: 'offer', grantRevision: 1 };
    allocation.enterpriseCode = ref.code; allocation.evidence.campaign.issuerEnterpriseRef = ref;
    for (const row of [batch, coupon]) row.issuerEnterpriseRef = structuredClone(ref);
    coupon.sellerAuthorizationProof = proof;
    batch.secureIssuance.command.enterpriseCode = ref.code;
    batch.secureIssuance.command.issuanceAuthority = { issuerEnterpriseRef: ref,
      vendorEnterpriseRef: structuredClone(coupon.vendorEnterpriseRef), sellerAuthorizationProof: proof };
  }
  for (const row of [coupon, allocation, batch]) row._id = new ObjectId();
  for (const [name, schema] of [['DefaultCouponService', 'coupon'], ['DefaultCouponBatchService', 'couponBatch'],
    ['DefaultCouponAcquisitionReservationService', 'couponAcquisitionReservation']]) {
    const owner = SERVICE[name], get = owner.get;
    owner.get = async r => {
      const raw = await get(r);
      for (const row of raw.result) row._id = f.tables.get(schema).get(row.code)._id;
      const response = BSON.deserialize(BSON.serialize(raw));
      if (schema !== 'couponAcquisitionReservation') {
        const envelope = { success: response };
        secure.providerResult(r, envelope, { moduleName: 'promotion', schemaName: schema });
      }
      return response;
    };
  }
  allocation.evidence.inputDisposition = phase === 'consume' ? 'COMMIT' : phase === 'release' ? 'RELEASE' : undefined;
  if (phase === 'release') f.db.DefaultCheckoutCheckpointService.push({ tenant: 't', enterpriseCode: 'issuer', code: 'checkout',
    idempotencyKey: 'checkout', ownerId: f.r.ownerId, status: 'COMPENSATION_REQUIRED', evidence: {
      participantEnterpriseCode: 'buyer-enterprise', ownerRef: f.r.ownerRef, actorRef: { loginId: 'actor' },
      completed: [], compensation: [], couponAcquisitionRecovery: { paymentAttemptUnconfirmed: false } } });
  const body = { contractVersion: 1, phase, enterpriseCode: 'issuer', ownerRef: f.ownerRef, ownerId: f.r.ownerId,
    orderCode: 'order', entryCode: 'entry', productCode: 'product', promotionCode: 'offer', operationKey: coupon.idempotencyKey,
    idempotencyKey: coupon.idempotencyKey, certificateCodes: ['certificate'], requirements: structuredClone(f.campaign.couponOffer.requirements) };
  return { ...f, coupon, allocation, batch, body };
}
for (const phase of ['reserve', 'consume', 'release']) for (const delegated of [false, true])
  test(`${phase} source proves ${delegated ? 'delegated' : 'own-issuer'} secure membership behind real projection and BSON`, async t => {
    const f = await fixture(t, phase, delegated), before = JSON.stringify([...f.tables].map(([key, rows]) => [key, [...rows]]));
    const generic = await SERVICE.DefaultPromotionOperationService.readLifecycleCoupon(f.r, f.coupon.code);
    assert.equal(generic.protectedToken, undefined); assert.equal(generic.secureIssuanceCode, undefined);
    const proof = await acquisition.sourceProof(f.sourceRequest, f.body);
    assert.equal(proof.allowed, true);
    assert.equal(/protectedToken|secureIssuance|ciphertext/.test(JSON.stringify(proof)), false);
    assert.equal(JSON.stringify([...f.tables].map(([key, rows]) => [key, [...rows]])), before);
    assert.deepEqual(f.db.DefaultPaymentTransactionEntryService, []);
  });

for (const [name, corrupt] of [
  ['missing token', f => { delete f.coupon.protectedToken; }],
  ['missing issuance', f => { delete f.coupon.secureIssuanceCode; }],
  ['ciphertext drift', f => { f.coupon.protectedToken.ciphertext = 'changed'; }],
  ['foreign issuer', f => { f.batch.issuerEnterpriseRef.code = 'foreign'; }],
  ['foreign vendor', f => { f.batch.vendorEnterpriseRef.code = 'foreign'; }],
  ['foreign issuance command', f => { f.batch.secureIssuance.command.promotionCode = 'foreign'; }],
  ['duplicate receipt unit', f => { f.batch.secureIssuance.units.push(structuredClone(f.batch.secureIssuance.units[0])); }],
  ['wrong token hash', f => { f.batch.secureIssuance.units[0].tokenHash = '0'.repeat(64); }],
]) test('projected source rejects ' + name, async t => {
  const f = await fixture(t, 'release', true); corrupt(f);
  const before = JSON.stringify([...f.tables].map(([key, rows]) => [key, [...rows]]));
  await assert.rejects(acquisition.sourceProof(f.sourceRequest, f.body), { code: 'ERR_DIGITAL_COUPON_SOURCE_ALLOCATION_BINDING' });
  assert.equal(JSON.stringify([...f.tables].map(([key, rows]) => [key, [...rows]])), before);
});

test('final source readback repeats private issuance proof and rejects hidden receipt drift', async t => {
  const f = await fixture(t, 'release');
  const owner = SERVICE.DefaultCouponSecureIssuanceService, original = owner.assertAcquisitionIssuance;
  SERVICE.DefaultCouponSecureIssuanceService = { ...owner, assertAcquisitionIssuance: async function (...args) {
    const result = await original.apply(this, args);
    f.batch.secureIssuance.units[0].protectedFingerprint = '0'.repeat(64);
    return result;
  } };
  await assert.rejects(acquisition.sourceProof(f.sourceRequest, f.body), { code: 'ERR_DIGITAL_COUPON_SOURCE_READBACK' });
});


test('secure acquisition inspection requires original private provenance and refuses receipt readback drift', async t => {
  const f = await fixture(t, 'release');
  const observed = await SERVICE.DefaultPromotionOperationService.readLifecycleCoupon(f.r, f.coupon.code);
  const owner = SERVICE.DefaultCouponSecureIssuanceService;
  await assert.rejects(owner.assertAcquisitionIssuance({ ...f.sourceRequest }, f.r, observed, f.allocation.evidence.campaign));
  const read = owner.read.bind(owner); let batchReads = 0;
  const changed = { ...owner, read: async (...args) => {
    const rows = await read(...args);
    if (args[0] === 'DefaultCouponBatchService' && ++batchReads === 2) rows[0].revision++;
    return rows;
  } };
  await assert.rejects(changed.assertAcquisitionIssuance(f.sourceRequest, f.r, observed, f.allocation.evidence.campaign));
});
