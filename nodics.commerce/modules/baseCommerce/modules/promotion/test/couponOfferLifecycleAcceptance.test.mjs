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

function harness(fault = {}) {
  const counts = new Map(), coupons = new Map(), calls = [];
  const snapshot = promotionCode => ({ promotionCode, revision: 3,
    couponOffer: structuredClone(promotionCode === 'limited-offer' ? selection.limitedOffer.expectedOffer : selection.withdrawalOffer.expectedOffer),
    actions: { discount: 10 }, conditions: { category: 'coupon' } });
  const operations = {
    inspectOffer: async input => { calls.push(['inspectOffer', input]); const value = snapshot(input.promotionCode);
      if (fault.changed && calls.filter(call => call[0] === 'inspectOffer').length > 1) value.actions.discount = 20; return value; },
    attemptBenefitMutation: async input => { calls.push(['attemptBenefitMutation', input]);
      return { status: fault.acceptMutation ? 'ACCEPTED' : 'REFUSED', reason: 'IMMUTABLE_BENEFIT_TERMS' }; },
    purchase: async input => { calls.push(['purchase', input]); const key = input.promotionCode + ':' + input.ownerRef.code;
      if (input.promotionCode === 'limited-offer' && input.ownerRef.code === 'first' && counts.get(key) === 1)
        return { status: 'REFUSED', reason: 'OWNER_LIMIT_REACHED' };
      if (input.promotionCode === 'limited-offer' && input.ownerRef.code === 'third')
        return { status: 'REFUSED', reason: 'SUPPLY_EXHAUSTED' };
      if (input.promotionCode === 'withdrawal-offer' && input.ownerRef.code === 'blocked')
        return { status: 'REFUSED', reason: 'PARTICIPATION_WITHDRAWN' };
      counts.set(key, (counts.get(key) || 0) + 1);
      const expected = input.promotionCode === 'limited-offer' ? selection.limitedOffer.expectedOffer : selection.withdrawalOffer.expectedOffer;
      const value = { status: 'COMPLETED', couponCode: input.promotionCode + '-' + input.ownerRef.code, ownerRef: input.ownerRef,
        validTo: expiry, purchasePolicy: { promotionCode: input.promotionCode, couponOffer: structuredClone(expected),
          finality: { refundable: false, transferable: false, singleUse: true } } };
      coupons.set(value.couponCode, value); return value; },
    availability: async input => { calls.push(['availability', input]); const completed = [...counts.entries()]
      .filter(([key]) => key.startsWith('limited-offer:')).reduce((sum, [, value]) => sum + value, 0);
      return { available: completed < 2, remaining: 2 - completed, reserved: 0, completed }; },
    withdrawParticipation: async input => { calls.push(['withdrawParticipation', input]); return { status: 'WITHDRAWN', revision: 2 }; },
    readPurchasedCoupon: async input => { calls.push(['readPurchasedCoupon', input]); const value = coupons.get(input.couponCode);
      return { couponCode: input.couponCode, retainedRights: true, usable: true, purchasePolicy: value.purchasePolicy }; },
  };
  return { calls, options: { execute: true, baseUrl: 'http://localhost:4350', selection, operations } };
}

test('owner acceptance proves immutable terms, shared supply, lifetime allowance and retained withdrawal rights', async () => {
  const h = harness(), result = await runCouponOfferLifecycleAcceptance(h.options);
  assert.equal(result.state, 'PASSED');
  assert.equal(result.evidence.sharedSupply.completed, 2);
  assert.equal(result.evidence.lifetimeOwnerAllowance, 'ENFORCED');
  assert.equal(result.evidence.withdrawal.retainedRights, true);
  assert.deepEqual(h.calls.map(call => call[0]), ['inspectOffer', 'attemptBenefitMutation', 'inspectOffer', 'purchase',
    'availability', 'purchase', 'purchase', 'availability', 'purchase', 'purchase', 'withdrawParticipation', 'purchase',
    'readPurchasedCoupon']);
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
