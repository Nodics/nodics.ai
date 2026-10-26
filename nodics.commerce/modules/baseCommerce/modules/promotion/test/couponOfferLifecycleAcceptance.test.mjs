/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import properties from '../config/properties.js';
import { runCouponOfferLifecycleAcceptance, selectCouponOfferLifecycleAcceptance } from
  '../src/service/acceptance/defaultCouponOfferLifecycleAcceptanceService.mjs';

const expiry = '2027-12-31T23:59:59.000Z';
const offer = (quantity = 2, ownerLimit = 1) => ({ version: 1, supply: { mode: 'LIMITED', quantity }, ownerLimit,
  expiry: { mode: 'FIXED', at: expiry }, requirements: { type: 'REWARDS', priceRef: 'points-price' },
  terms: ['Single use. Completed purchases are final.'] });
const customer = code => ({ type: 'CUSTOMER', code });
const selection = { contractVersion: 1, approvalReference: 'e08-review', tenant: 'default', runCode: 'e08-run',
  limitedOffer: { promotionCode: 'limited-offer', expectedOffer: offer(), benefitMutation: { actions: { discount: 20 } },
    firstOwner: customer('first'), secondOwner: customer('second'), blockedOwner: customer('third') },
  withdrawalOffer: { promotionCode: 'withdrawal-offer', expectedOffer: offer(20, 10),
    benefitMutation: { actions: { discount: 20 } }, purchasingOwner: customer('purchaser'), blockedOwner: customer('blocked'),
    redeemerEnterpriseCode: 'redeemer' } };

function harness(fault = {}, quantity = 2, ownerLimit = 1) {
  const selected = structuredClone(selection);
  selected.limitedOffer.expectedOffer.supply.quantity = quantity;
  if (ownerLimit === null) delete selected.limitedOffer.expectedOffer.ownerLimit;
  else selected.limitedOffer.expectedOffer.ownerLimit = ownerLimit;
  const expectedFor = code => code === 'limited-offer' ? selected.limitedOffer.expectedOffer : selected.withdrawalOffer.expectedOffer;
  const counts = new Map(), coupons = new Map(), calls = [];
  const snapshot = promotionCode => ({ promotionCode, revision: 3,
    couponOffer: structuredClone(expectedFor(promotionCode)),
    actions: { discount: 10 }, conditions: { category: 'coupon' } });
  const operations = {
    inspectOffer: async input => { calls.push(['inspectOffer', input]); const value = snapshot(input.promotionCode);
      if (fault.changed && calls.filter(call => call[0] === 'inspectOffer').length > 1) value.actions.discount = 20; return value; },
    attemptBenefitMutation: async input => { calls.push(['attemptBenefitMutation', input]);
      return { status: fault.acceptMutation ? 'ACCEPTED' : 'REFUSED', reason: 'IMMUTABLE_BENEFIT_TERMS' }; },
    purchase: async input => { calls.push(['purchase', input]); const key = input.promotionCode + ':' + input.ownerRef.code;
      const expected = expectedFor(input.promotionCode);
      const sold = [...counts.entries()].filter(([key]) => key.startsWith(input.promotionCode + ':')).reduce((sum, [, n]) => sum + n, 0);
      if (sold >= expected.supply.quantity) return { status: 'REFUSED', reason: 'SUPPLY_EXHAUSTED' };
      if (expected.ownerLimit !== undefined && (counts.get(key) || 0) >= expected.ownerLimit)
        return { status: 'REFUSED', reason: 'OWNER_LIMIT_REACHED' };
      if (input.promotionCode === 'withdrawal-offer' && input.ownerRef.code === 'blocked')
        return { status: 'REFUSED', reason: 'PARTICIPATION_WITHDRAWN' };
      counts.set(key, (counts.get(key) || 0) + 1);
      const value = { status: 'COMPLETED', couponCode: input.promotionCode + '-' + input.ownerRef.code, ownerRef: input.ownerRef,
        validTo: expiry, purchasePolicy: { promotionCode: input.promotionCode, couponOffer: structuredClone(expected),
          finality: { refundable: false, transferable: false, singleUse: true } } };
      coupons.set(value.couponCode, value); return value; },
    availability: async input => { calls.push(['availability', input]); const completed = [...counts.entries()]
      .filter(([key]) => key.startsWith(input.promotionCode + ':')).reduce((sum, [, value]) => sum + value, 0);
      const initial = input.promotionCode === 'limited-offer' ? fault.initialCompleted || 0 : 0;
      const reserved = input.promotionCode === 'limited-offer' ? fault.initialReserved || 0 : 0;
      const remaining = expectedFor(input.promotionCode).supply.quantity - initial - reserved - completed - (fault.unissued || 0);
      const value = { available: remaining > 0, remaining, reserved, completed: initial + completed };
      if (completed && fault.delta && input.promotionCode === (fault.deltaOffer || 'limited-offer')) value[fault.delta] += 1;
      if (fault.overreported && input.promotionCode === (fault.overreportedOffer || 'limited-offer')) value.remaining += 1;
      if (fault.invalidAvailability) value.available = 'true';
      return value; },
    withdrawParticipation: async input => { calls.push(['withdrawParticipation', input]); return { status: 'WITHDRAWN', revision: 2 }; },
    readPurchasedCoupon: async input => { calls.push(['readPurchasedCoupon', input]); const value = coupons.get(input.couponCode);
      return { couponCode: input.couponCode, retainedRights: true, usable: true, purchasePolicy: value.purchasePolicy }; },
  };
  return { calls, options: { execute: true, baseUrl: 'http://localhost:4350', selection: selected, operations } };
}

test('owner acceptance proves immutable terms, shared supply, lifetime allowance and retained withdrawal rights', async () => {
  const h = harness(), result = await runCouponOfferLifecycleAcceptance(h.options);
  assert.equal(result.state, 'PASSED');
  assert.equal(result.evidence.sharedSupply.completed, 2);
  assert.equal(result.evidence.lifetimeOwnerAllowance, 'ENFORCED');
  assert.equal(result.evidence.withdrawal.retainedRights, true);
  assert.equal(result.evidence.sharedSupply.exhaustion, 'ENFORCED');
  assert(h.calls.every(([, input]) => input.baseUrl === 'http://localhost:4350' && input.tenant === 'default'));
});

test('an accepted immutable mutation or changed reread fails before purchases', async () => {
  const accepted = harness({ acceptMutation: true });
  await assert.rejects(runCouponOfferLifecycleAcceptance(accepted.options), /IMMUTABLE_BENEFIT_MUTATION/);
  assert.equal(accepted.calls.length, 2);
  const changed = harness({ changed: true });
  await assert.rejects(runCouponOfferLifecycleAcceptance(changed.options), /IMMUTABLE_BENEFIT_TERMS_CHANGED/);
  assert.equal(changed.calls.length, 3);
});

test('framework defaults, command registration and profile selection remain Promotion-owned', () => {
  assert.deepEqual(properties.promotion.acceptance.couponOfferLifecycle, { requestTimeoutMs: 30000, maximumOperations: 32 });
  assert.equal(properties.tooling.commands['acceptance:coupon-offer-lifecycle'].script,
    'src/service/acceptance/defaultCouponOfferLifecycleAcceptanceService.mjs');
  assert.equal(selectCouponOfferLifecycleAcceptance({ couponOfferLifecycle: selection }), selection);
  assert.throws(() => selectCouponOfferLifecycleAcceptance(Object.create({ couponOfferLifecycle: selection })), /UNAVAILABLE/);
  const script = new URL('../src/service/acceptance/defaultCouponOfferLifecycleAcceptanceService.mjs', import.meta.url).pathname;
  const result = spawnSync(process.execPath, [script, '--help'], { cwd: '/', encoding: 'utf8', env: { PATH: process.env.PATH } });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /project-owned canonical operations adapter/);
});


for (const quantity of [1, 2, 100]) for (const limit of [1, 3, null])
  test(`bounded lifecycle purchases stock ${quantity}, ownerLimit ${limit}`, async () => {
    const h = harness({}, quantity, limit), result = await runCouponOfferLifecycleAcceptance(h.options);
    const count = Math.min(quantity, 2), supply = result.evidence.sharedSupply;
    assert.equal(result.state, 'PASSED');
    assert.equal(supply.couponCodes.length, count); assert.equal(supply.completed, count);
    assert.equal(supply.remaining, quantity - count); assert.equal(supply.reserved, 0);
    assert.equal(supply.exhaustion, quantity <= 2 ? 'ENFORCED' : 'NOT_EXERCISED');
    assert.equal(result.evidence.lifetimeOwnerAllowance, limit === null ? 'NOT_APPLICABLE' :
      limit === 1 && quantity > 1 ? 'ENFORCED' : 'NOT_EXERCISED');
    const purchases = h.calls.filter(([operation, input]) => operation === 'purchase' && input.promotionCode === 'limited-offer');
    assert.equal(purchases.filter(([, input]) => /:first$|:second$/.test(input.commandReference)).length, count);
    assert.equal(purchases.some(([, input]) => input.commandReference.endsWith(':supply')), quantity <= 2);
    assert.equal(purchases.some(([, input]) => input.commandReference.endsWith(':owner-limit')), limit === 1 && quantity > 1);
  });

for (const delta of ['remaining', 'completed', 'reserved']) for (const deltaOffer of ['limited-offer', 'withdrawal-offer'])
  test(`false ${deltaOffer} ${delta} counter delta refuses`, async () => {
    const h = harness({ delta, deltaOffer, unissued: 5 }, 100);
    await assert.rejects(runCouponOfferLifecycleAcceptance(h.options), /SINGLE_PURCHASE_SUPPLY_DELTA_UNCONFIRMED/);
  });

test('nonzero initial counters are preserved rather than treated as fresh two-unit stock', async () => {
  const h = harness({ initialCompleted: 7, initialReserved: 4 }, 100, 3);
  const result = await runCouponOfferLifecycleAcceptance(h.options);
  assert.deepEqual(result.evidence.sharedSupply.initial, { available: true, remaining: 89, reserved: 4, completed: 7 });
  assert.equal(result.evidence.sharedSupply.remaining, 87);
  assert.equal(result.evidence.sharedSupply.completed, 9);
  assert.equal(result.evidence.sharedSupply.reserved, 4);
  assert.equal(result.evidence.sharedSupply.exhaustion, 'NOT_EXERCISED');
});

test('invalid availability refuses before purchase and invalid explicit limits are not absent limits', async () => {
  const h = harness({ invalidAvailability: true }, 100);
  await assert.rejects(runCouponOfferLifecycleAcceptance(h.options), /CANONICAL_SUPPLY_AVAILABILITY_REQUIRED/);
  assert.equal(h.calls.some(([op]) => op === 'purchase'), false);
  for (const limit of [0, -1, 1.5, '1']) {
    const bad = harness({}, 100, limit);
    await assert.rejects(runCouponOfferLifecycleAcceptance(bad.options), /LIMITED_OFFER_REQUIRED/);
    assert.equal(bad.calls.length, 0);
  }
});


for (const overreportedOffer of ['limited-offer', 'withdrawal-offer'])
  test(`overreported ${overreportedOffer} supply refuses before its purchase`, async () => {
    const h = harness({ overreported: true, overreportedOffer }, 100);
    await assert.rejects(runCouponOfferLifecycleAcceptance(h.options), /CANONICAL_SUPPLY_AVAILABILITY_REQUIRED/);
    assert.equal(h.calls.some(([op, input]) => op === 'purchase' && input.promotionCode === overreportedOffer), false);
  });

test('initial zero limited availability cannot pass without a sale or trigger a refusal probe', async () => {
  const h = harness({ initialCompleted: 100 }, 100);
  await assert.rejects(runCouponOfferLifecycleAcceptance(h.options), /LIMITED_INITIAL_SUPPLY_REQUIRED/);
  assert.equal(h.calls.some(([op]) => op === 'purchase'), false);
});

test('partially issued stock below configured supply remains valid', async () => {
  const h = harness({ unissued: 5, initialCompleted: 7, initialReserved: 4 }, 100, 3);
  const result = await runCouponOfferLifecycleAcceptance(h.options);
  assert.deepEqual(result.evidence.sharedSupply.initial, { available: true, remaining: 84, reserved: 4, completed: 7 });
  assert.equal(result.evidence.sharedSupply.remaining, 82);
  assert.equal(result.evidence.sharedSupply.completed, 9);
});
