/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { runCouponJourneyHttpAcceptance, couponJourneyData } from '../src/service/acceptance/defaultCouponJourneyHttpAcceptanceService.mjs';
const require = createRequire(import.meta.url);

function harness(change = {}) {
  const itemCases = Array.from({ length: 29 }, (_, i) => ({ caseCode: 'item' + i, productCode: 'coupon-product-' + i, sku: 'coupon-sku-' + i,
    promotionCode: 'campaign-' + i, expectedTotal: '10', issuerEnterpriseCode: 'issuer', outletStoreCode: 'outlet',
    staffSessionKey: 'merchant', items: [{ sku: 'bundle-item-' + i, quantity: 1, unit: 'EACH' }] }));
  const selection = { contractVersion: 1, approvalReference: 'review-local-1', localDemo: true, privateCaptureQualified: true,
    tenant: 'default', runCode: 'bounded-demo-1', customer: { ownerId: 'existing-customer', enterpriseCode: 'vendor' },
    storeCode: 'existing-store', channelCode: 'web', locale: 'en', jurisdiction: 'AE', currency: 'POINTS',
    payment: { paymentMethod: 'LOYALTY_REWARD', walletCode: 'existing-wallet', programCode: 'existing-program', rewardTypeCode: 'existing-points', rewardCurrency: 'POINTS' },
    approvedCampaignCodes: Array.from({ length: 38 }, (_, i) => 'campaign-' + i), approvedUnitsPerCampaign: 100, expectedCampaignCount: 38, expectedItemCount: 29,
    priceSourceSha256: 'a'.repeat(64), campaignSourceSha256: 'b'.repeat(64),
    itemCases, refundCase: { caseCode: 'unused', productCode: itemCases[0].productCode, sku: itemCases[0].sku,
      promotionCode: itemCases[0].promotionCode, expectedTotal: '10' },
    refundReview: { sessionKey: 'reviewer', enterpriseCode: 'vendor', comment: 'Reviewed unused coupon refund', reason: 'Approved original unused purchase refund' },
    allowRedeemedBenefitReversal: false };
  const sessions = { customer: { authorization: 'Bearer PRIVATE_CUSTOMER_SESSION', enterpriseCode: 'vendor' },
    merchant: { authorization: 'Bearer PRIVATE_MERCHANT_SESSION', enterpriseCode: 'issuer' },
    reviewer: { authorization: 'Bearer PRIVATE_REVIEWER_SESSION', enterpriseCode: 'vendor' } };
  const carts = new Map(), orders = new Map(), entitlements = new Map(), cases = new Map(), refunds = new Map();
  const calls = [], snapshots = []; let durable, dropped = false, purchases = 0, redemptions = 0, refundCount = 0;
  const respond = (value, status = 200, privateResponse = false) => new Response(JSON.stringify({ data: value }),
    { status, headers: privateResponse ? { 'Cache-Control': 'no-store' } : {} });
  const session = actor => sessions[actor].authorization;
  const fetch = async (url, input) => {
    const path = decodeURIComponent(url.pathname), body = input.body ? JSON.parse(input.body) : {}, key = input.headers['Idempotency-Key'];
    calls.push({ path, search: url.search, method: input.method, body, key, headers: input.headers });
    if (change.throwPrivate) throw new Error('PRIVATE_TOKEN_1 Bearer PRIVATE_CUSTOMER_SESSION');
    if (change.deny && path.endsWith(change.deny)) return respond({ code: 'ERR_OWNER_PRIVATE_TOKEN_1', message: 'PRIVATE_TOKEN_1' }, 403);
    assert.equal(input.redirect, 'error'); assert.equal(input.cache, 'no-store'); assert.equal(input.headers.tenant, 'default');
    const code = path.split('/').at(-1);
    const known = [...itemCases, selection.refundCase].find(c => path.includes(':' + c.caseCode + ':') || body.cartCode?.includes(':' + c.caseCode + ':'));
    const idsCase = c => selection.runCode + ':' + c.caseCode;
    if (path === '/nodics/cart/v0/carts') {
      assert.equal(input.headers.Authorization, session('customer'));
      assert.equal(durable.cases[known.caseCode].purchase, 'CART_CREATE_PENDING');
      const cart = { code: body.cartCode, storeCode: body.storeCode, currency: body.currency, ownerId: selection.customer.ownerId,
        enterpriseCode: 'vendor', revision: change.cartRevision ?? 0, entries: [] }; carts.set(cart.code, cart); return respond({ cart, entries: [] });
    }
    if (path.startsWith('/nodics/cart/v0/carts/')) {
      assert.equal(input.headers.Authorization, session('customer'));
      const cartCode = path.split('/')[5], cart = carts.get(cartCode); if (!cart) return respond({}, 404);
      if (path.endsWith('/entries')) {
        assert.equal(durable.cases[known.caseCode].purchase, 'ENTRY_PENDING');
        cart.entries.push({ code: body.entryCode, productCode: body.productCode, sku: body.sku, quantity: body.quantity });
      }
      if (path.endsWith('/calculations')) return respond({ cartCode, tenant: 'default', enterpriseCode: 'vendor', currency: cart.currency,
        totalAmount: change.badPrice ? '999' : '10.00', entries: cart.entries });
      return respond({ cart, entries: cart.entries });
    }
    if (path === '/nodics/checkoutCore/v0/checkouts/place') {
      assert.equal(input.headers.Authorization, session('customer'));
      assert.equal(durable.cases[known.caseCode].purchase, 'CHECKOUT_PENDING');
      assert.equal(key, idsCase(known) + ':purchase' + (durable.cases[known.caseCode].purchaseRecovery ? ':recovered:1' : '')); assert(!body.couponCode); assert(!body.providerToken);
      if (change.drop === 'checkout-before' && !dropped) { dropped = true; throw new Error('PRIVATE_TOKEN_1'); }
      purchases++;
      const cart = carts.get(body.cartCode), order = { code: body.orderCode, cartCode: cart.code, ownerId: selection.customer.ownerId,
        enterpriseCode: 'vendor', status: 'COMPLETED', currency: 'POINTS', totalAmount: '10', evidence: { storeCode: selection.storeCode } };
      orders.set(order.code, order);
      const e = { code: 'entitlement-' + known.caseCode, providerCode: 'coupon-' + known.caseCode, orderCode: order.code,
        orderEntryCode: idsCase(known) + ':entry', cartCode: cart.code, productCode: known.productCode, sku: known.sku,
        enterpriseCode: 'vendor', ownerId: selection.customer.ownerId, providerOwner: 'promotion', digitalDeliveryType: 'COUPON_CODE',
        status: 'ACTIVE', claimStatus: 'UNCLAIMED', revision: 0, evidence: { promotionCode: known.promotionCode } };
      entitlements.set(e.code, e);
      if (change.drop === 'checkout-after' && !dropped) { dropped = true; throw new Error('PRIVATE_TOKEN_1'); }
      return respond({ code: order.code, status: 'COMPLETED' });
    }
    if (path.endsWith('/compensation/recover') && change.approveRecovery) {
      const commandCode = path.split('/')[5], base = commandCode.slice(0, -':purchase'.length);
      return respond({ commandCode, status: 'COMPENSATED', recoveryStatus: 'COMPLETED', recoveryType: 'PREPAYMENT_UNCERTAIN_COUPON',
        cartCode: base + ':cart', entryCode: base + ':entry', revision: 2, originalPaymentRecordCount: 0, ...change.recoveryResponse });
    }
    if (path.includes('/checkouts/commands/') && change.approveRecovery) return respond({ status: 'COMPENSATED', revision: 2,
      originalPaymentRecordCount: 0, completedPhases: ['VALIDATED', 'CALCULATED', 'RESERVED'], ...change.commandResponse });
    if (path.startsWith('/nodics/checkoutCore/v0/checkouts/')) return respond(orders.has(code) ? { code, status: 'COMPLETED',
      evidence: { orderCode: code, completed: ['PAYMENT_CAPTURED', 'DIGITAL_SOLD', 'DIGITAL_DELIVERED'] } } : { status: 'NOT_COMPLETED' });
    if (path === '/nodics/digitalCore/v0/entitlements') {
      const orderCode = url.searchParams.get('orderCode');
      const values = [...entitlements.values()].filter(e => e.orderCode === orderCode).map(e => structuredClone(e));
      if (change.foreignEntitlement && values.length) values[0].ownerId = 'foreign';
      return respond({ entitlements: values });
    }
    if (path.endsWith('/reveal')) {
      assert.equal(input.headers.Authorization, session('customer'));
      const e = entitlements.get(path.split('/')[5]);
      return respond({ couponCode: e.providerCode, status: 'REVEALED', token: 'PRIVATE_TOKEN_' + e.code,
        tokenSource: 'AUTHENTICATED_RETENTION' }, 200, !change.cacheableReveal);
    }
    if (path === '/nodics/digitalCore/v0/merchant/redemptions/workspace') return respond({ storeRequired: true, stores: [{ code: 'outlet' }] });
    const simulated = { simulated: true, deliveryVerified: false, evidenceMode: 'LOCAL_SIMULATION' };
    if (path.endsWith('/redemptions/validate')) {
      assert.equal(input.headers.Authorization, session('merchant')); assert.equal(input.headers['x-enterprise-code'], 'issuer');
      const e = [...entitlements.values()].find(e => body.couponToken === 'PRIVATE_TOKEN_' + e.code);
      const c = itemCases.find(c => c.productCode === e.productCode);
      return respond({ entitlementCode: e.code, productCode: e.productCode, eligible: true, merchantCode: 'issuer', storeCode: 'outlet',
        revision: e.revision, storeRevision: 1, validationCode: 'PRIVATE_VALIDATION_CAPABILITY', validationExpiresAt: new Date(Date.now() + 300000).toISOString(),
        conditions: { benefit: { benefitType: 'ITEM', sourceStage: change.verifiedItem ? 'FULFILLED_ITEMS' : 'SIMULATED_ITEMS',
          sourceReference: body.merchantReceiptReference, storeCode: 'outlet', storeRevision: 1, simulated: true, verified: false, items: c.items } } }, 200, true);
    }
    if (path.endsWith('/confirm')) {
      assert.equal(input.headers.Authorization, session('merchant'));
      const e = entitlements.get(path.split('/')[6]), c = itemCases.find(c => c.productCode === e.productCode);
      assert.equal(durable.cases[c.caseCode].redemption, 'CONFIRM_PENDING'); assert.equal(key, idsCase(c) + ':confirm');
      if (!e.evidence.merchantRedemption) {
        assert.equal(body.expectedRevision, e.revision); assert.equal(body.validationCode, 'PRIVATE_VALIDATION_CAPABILITY');
        e.evidence.merchantRedemption = { confirmationKey: key, merchantReceiptReference: body.merchantReceiptReference,
          storeRef: { code: 'outlet' } };
        if (change.drop === 'confirm-pending' && !dropped) { dropped = true; throw new Error('PRIVATE_TOKEN_1'); }
      }
      if (e.claimStatus !== 'REDEEMED') { e.claimStatus = 'REDEEMED'; e.revision++; redemptions++; }
      if (change.drop === 'confirm-after' && !dropped) { dropped = true; throw new Error('PRIVATE_TOKEN_1'); }
      return respond({ entitlementCode: e.code, claimStatus: 'REDEEMED', ...simulated });
    }
    if (path.endsWith('/receipt/query')) {
      const e = entitlements.get(path.split('/')[6]);
      return respond({ entitlementCode: e.code, state: e.claimStatus === 'REDEEMED' ? 'COMPLETED' : 'UNCONFIRMED',
        confirmationKey: key, receiptCode: 'receipt-' + e.code, merchantReceiptReference: body.merchantReceiptReference,
        merchantCode: 'issuer', storeCode: 'outlet', storeRevision: 1, ...simulated });
    }
    if (path.endsWith('/disputes') && path.includes('/orders/')) {
      const orderCode = path.split('/')[5];
      if (input.method === 'GET') return respond({ cases: [...cases.values()].filter(c => c.orderCode === orderCode) });
      assert.equal(input.headers.Authorization, session('customer'));
      const code = 'ORDER_REVIEW_' + createHash('sha256').update(['default', 'vendor', selection.customer.ownerId, key].join('|')).digest('hex').slice(0, 32).toUpperCase();
      const value = { code, orderCode, requestedResolution: body.requestedResolution, comment: body.comment.trim(), revision: 0, status: 'SUBMITTED' };
      cases.set(code, value);
      if (change.drop === 'dispute-after' && !dropped) { dropped = true; throw new Error('PRIVATE_TOKEN_1'); }
      return respond(value);
    }
    if (path.endsWith('/refund-preview')) {
      assert.equal(input.headers.Authorization, session('reviewer'));
      const c = cases.get(path.split('/')[5]), existing = refunds.get(c.code);
      if (existing) return respond({ recovery: true, status: existing.status, approvalCommandKey: selection.runCode + ':unused:refund', approvalReason: selection.refundReview.reason });
      if (change.refuseRefund) return respond({ eligible: false, reason: 'PURCHASE_REFUND_POLICY_REQUIRES_REVIEW' });
      return respond({ eligible: true, provider: 'digitalCore', domain: { kind: 'DIGITAL_COUPON', entitlementCodes: ['entitlement-unused'] },
        amount: '10.00', currency: 'POINTS', previewToken: 'private-refund-preview' });
    }
    if (path.endsWith('/refund')) {
      assert.equal(input.headers.Authorization, session('reviewer'));
      assert.equal(durable.cases.unused.refund, 'REFUND_PENDING'); assert.equal(key, selection.runCode + ':unused:refund');
      const c = cases.get(path.split('/')[5]);
      if (!refunds.has(c.code)) {
        assert.equal(body.previewToken, 'private-refund-preview'); refundCount++;
        entitlements.get('entitlement-unused').status = 'REVOKED';
        const order = orders.get(c.orderCode); order.status = 'REFUNDED'; order.evidence.refundCode = 'original-refund';
        refunds.set(c.code, { refundCode: 'original-refund', status: 'COMPLETED', amount: '10', currency: 'POINTS', steps: ['PAYMENT', 'COMPLETE'] });
      }
      if (change.drop === 'refund-after' && !dropped) { dropped = true; throw new Error('PRIVATE_TOKEN_1'); }
      return respond(refunds.get(c.code));
    }
    if (path.startsWith('/nodics/order/v0/orders/')) return respond({ order: orders.get(code) });
    throw new Error('Unexpected route');
  };
  const options = { execute: true, baseUrl: 'http://localhost:19999', selection, sessions, fetch,
    fundingObservation: { available: '1000', observedAt: new Date().toISOString(), walletCode: selection.payment.walletCode,
      ownerId: selection.customer.ownerId, enterpriseCode: 'vendor', programCode: selection.payment.programCode, rewardTypeCode: selection.payment.rewardTypeCode },
    saveCheckpoint: async value => { durable = structuredClone(value); snapshots.push(value); } };
  return { options, calls, snapshots, state: { carts, orders, entitlements, cases }, get checkpoint() { return durable; },
    get counts() { return { purchases, redemptions, refunds: refundCount }; } };
}

test('explicit prepayment recovery preserves original failure identity and journals one linked normal attempt before dispatch', async () => {
  const change = { drop: 'checkout-before', approveRecovery: true }, h = harness(change);
  const first = await runCouponJourneyHttpAcceptance({ ...h.options, phase: 'ITEMS_ONLY' });
  assert.equal(first.state, 'RECOVERY_REQUIRED'); assert.equal(h.counts.purchases, 0);
  const original = h.options.selection.runCode + ':item0:purchase';
  const result = await runCouponJourneyHttpAcceptance({ ...h.options, phase: 'ITEMS_ONLY', checkpoint: h.checkpoint,
    resumePending: true, recoverPrepaymentCommands: [original] });
  assert.equal(result.state, 'PHASE_COMPLETED_NOT_FULL_ACCEPTANCE', JSON.stringify(result));
  assert.equal(h.counts.purchases, 29);
  assert.deepEqual(result.checkpoint.cases.item0.purchaseRecovery, { originalCommandCode: original,
    commandCode: original + ':recovered:1', revision: 2 });
  const purchases = h.calls.filter(c => c.path.endsWith('/checkouts/place') && c.body.cartCode.includes(':item0:'));
  assert.deepEqual(purchases.map(c => c.key), [original, original + ':recovered:1']);
  assert.equal(purchases[0].body.orderCode, purchases[1].body.orderCode);
  assert.equal(purchases[0].body.cartCode, purchases[1].body.cartCode);
  const replay = await runCouponJourneyHttpAcceptance({ ...h.options, phase: 'ITEMS_ONLY', checkpoint: h.checkpoint });
  assert.equal(replay.state, 'PHASE_COMPLETED_NOT_FULL_ACCEPTANCE'); assert.equal(h.counts.purchases, 29);
});
for (const patch of [{ recoveryResponse: { status: 'COMPENSATION_REQUIRED' } }, { recoveryResponse: { cartCode: 'foreign' } },
  { recoveryResponse: { entryCode: 'foreign' } }, { recoveryResponse: { originalPaymentRecordCount: 1 } },
  { commandResponse: { originalPaymentRecordCount: 1 } }, { commandResponse: { revision: 3 } },
  { commandResponse: { completedPhases: ['VALIDATED', 'CALCULATED', 'RESERVED', 'AUTHORIZED'] } }]) {
  test('prepayment cleanup uncertainty never permits a child placement ' + JSON.stringify(patch), async () => {
    const change = { drop: 'checkout-before', approveRecovery: true, ...patch }, h = harness(change);
    await runCouponJourneyHttpAcceptance({ ...h.options, phase: 'ITEMS_ONLY' });
    const result = await runCouponJourneyHttpAcceptance({ ...h.options, phase: 'ITEMS_ONLY', checkpoint: h.checkpoint,
      resumePending: true, recoverPrepaymentCommands: [h.options.selection.runCode + ':item0:purchase'] });
    assert.equal(result.state, 'RECOVERY_REQUIRED'); assert.equal(h.counts.purchases, 0);
    assert.equal(h.calls.filter(c => c.path.endsWith('/checkouts/place')).length, 1);
  });
}
test('linked child placement uncertainty never produces a second child key', async () => {
  const change = { drop: 'checkout-before', approveRecovery: true }, h = harness(change);
  await runCouponJourneyHttpAcceptance({ ...h.options, phase: 'ITEMS_ONLY' });
  const original = h.options.selection.runCode + ':item0:purchase', fetch = h.options.fetch;
  h.options.fetch = async (url, input) => {
    if (input.headers['Idempotency-Key'] === original + ':recovered:1') throw new Error('PRIVATE_UNCERTAIN_CHILD');
    return fetch(url, input);
  };
  const options = { ...h.options, phase: 'ITEMS_ONLY', resumePending: true, recoverPrepaymentCommands: [original] };
  const first = await runCouponJourneyHttpAcceptance({ ...options, checkpoint: h.checkpoint });
  assert.equal(first.state, 'RECOVERY_REQUIRED');
  const second = await runCouponJourneyHttpAcceptance({ ...options, checkpoint: h.checkpoint });
  assert.equal(second.state, 'RECOVERY_REQUIRED'); assert.equal(second.reasonCode, 'CHECKOUT_RECOVERY_REQUIRED');
  assert.equal(h.counts.purchases, 0);
});

test('coupon request pacing is awaited before transport timeout creation', async () => {
  const h = harness(), originalTimeout = AbortSignal.timeout;
  let ready = false, paced = 0;
  AbortSignal.timeout = milliseconds => {
    assert.equal(ready, true); ready = false;
    return originalTimeout.call(AbortSignal, milliseconds);
  };
  try {
    const result = await runCouponJourneyHttpAcceptance({ ...h.options, beforeRequest: async metadata => {
      assert.deepEqual(Object.keys(metadata).sort(), ['method', 'module', 'route']);
      assert.equal(Object.isFrozen(metadata), true);
      await Promise.resolve(); ready = true; paced++;
    } });
    assert.equal(result.state, 'PASSED');
    assert.equal(paced, h.calls.length);
  } finally { AbortSignal.timeout = originalTimeout; }
});

test('failed coupon pacing dispatches no HTTP or financial effects and exposes no cause', async () => {
  const h = harness(), result = await runCouponJourneyHttpAcceptance({ ...h.options,
    beforeRequest: async () => { throw new Error('PRIVATE_PACING'); } });
  assert.equal(result.state, 'RECOVERY_REQUIRED');
  assert.equal(result.reasonCode, 'REQUEST_PACING_UNCONFIRMED');
  assert.equal(h.calls.length, 0);
  assert.deepEqual(h.counts, { purchases: 0, redemptions: 0, refunds: 0 });
  assert(!JSON.stringify(result).includes('PRIVATE_PACING'));
});

test('29 selected ITEM purchases/reveals/redemptions and one unused original refund use only normal HTTP owners', async () => {
  const h = harness(), original = structuredClone({ selection: h.options.selection, sessions: h.options.sessions });
  const result = await runCouponJourneyHttpAcceptance(h.options);
  assert.equal(result.state, 'PASSED', JSON.stringify(result));
  assert.deepEqual(h.counts, { purchases: 30, redemptions: 29, refunds: 1 });
  assert.equal(result.deliveryVerified, false); assert.equal(result.monetaryBenefitsQualified, false);
  assert(!/PRIVATE_(?:TOKEN|CUSTOMER|MERCHANT|REVIEWER|VALIDATION)/.test(JSON.stringify([result, h.snapshots])));
  assert(!h.calls.some(c => /signup|authenticate|internal|import|publication|schema|seed|promotions\/apply/.test(c.path)));
  assert(h.calls.every(c => ['GET', 'POST'].includes(c.method)));
  assert.deepEqual({ selection: h.options.selection, sessions: h.options.sessions }, original);
  const replay = await runCouponJourneyHttpAcceptance({ ...h.options, checkpoint: h.checkpoint });
  assert.equal(replay.state, 'PASSED'); assert.deepEqual(h.counts, { purchases: 30, redemptions: 29, refunds: 1 });
});

test('ITEMS_ONLY preserves a policy-refused original unused checkpoint and has zero unused-purchase/refund effects', async () => {
  const change = { refuseRefund: true }, h = harness(change);
  const blocked = await runCouponJourneyHttpAcceptance(h.options);
  assert.equal(blocked.state, 'RECOVERY_REQUIRED'); assert.equal(blocked.reasonCode, 'UNUSED_REFUND_PLAN_REQUIRED');
  assert.deepEqual(h.counts, { purchases: 1, redemptions: 0, refunds: 0 });
  const checkpoint = structuredClone(h.checkpoint), originalCheckpoint = structuredClone(checkpoint);
  const unused = checkpoint.cases.unused, callStart = h.calls.length, snapshotStart = h.snapshots.length;
  const originalOwners = structuredClone({ order: h.state.orders.get(h.options.selection.runCode + ':unused:order'),
    entitlement: h.state.entitlements.get('entitlement-unused'), cases: [...h.state.cases] });
  const result = await runCouponJourneyHttpAcceptance({ ...h.options, phase: 'ITEMS_ONLY', checkpoint });
  assert.equal(result.state, 'PHASE_COMPLETED_NOT_FULL_ACCEPTANCE'); assert.equal(result.phase, 'ITEMS_ONLY');
  assert.equal(result.itemRedemptions, 29); assert.equal(result.unusedRefunds, 0); assert.equal(result.pendingRefunds, 1);
  assert.deepEqual(result.refundProgress, { caseCode: 'unused', expectedTotal: '10', currency: 'POINTS',
    purchaseState: 'PURCHASED', refundState: 'DISPUTE_PENDING', reviewCaseCode: unused.caseCode,
    evidenceSource: 'RETAINED_CHECKPOINT', ownerReadbackPerformed: false });
  assert.equal(result.checkpoint.selectionHash, checkpoint.selectionHash);
  assert.deepEqual(checkpoint, originalCheckpoint);
  assert.deepEqual(result.checkpoint.cases.unused, unused);
  for (const snapshot of h.snapshots.slice(snapshotStart)) assert.deepEqual(snapshot.cases.unused, unused);
  assert.deepEqual({ order: h.state.orders.get(h.options.selection.runCode + ':unused:order'),
    entitlement: h.state.entitlements.get('entitlement-unused'), cases: [...h.state.cases] }, originalOwners);
  const phaseCalls = h.calls.slice(callStart);
  assert(!phaseCalls.some(c => /disputes|refund|entitlement-unused/.test(c.path) || c.search.includes('unused') ||
    JSON.stringify(c.body).includes(':unused:') || c.headers.Authorization === h.options.sessions.reviewer.authorization));
  assert.deepEqual(h.counts, { purchases: 30, redemptions: 29, refunds: 0 });
  for (const c of h.options.selection.itemCases) {
    const prefix = h.options.selection.runCode + ':' + c.caseCode;
    assert(phaseCalls.some(call => call.key === prefix + ':purchase'));
    assert(phaseCalls.some(call => call.key === prefix + ':confirm'));
  }
  assert(!/PRIVATE_(?:TOKEN|CUSTOMER|MERCHANT|REVIEWER|VALIDATION)/.test(JSON.stringify([result, h.snapshots])));
  const replay = await runCouponJourneyHttpAcceptance({ ...h.options, phase: 'ITEMS_ONLY', checkpoint: h.checkpoint });
  assert.equal(replay.state, 'PHASE_COMPLETED_NOT_FULL_ACCEPTANCE');
  assert.deepEqual(h.counts, { purchases: 30, redemptions: 29, refunds: 0 });
  const refused = await runCouponJourneyHttpAcceptance({ ...h.options, phase: 'ALL', checkpoint: h.checkpoint });
  assert.equal(refused.state, 'RECOVERY_REQUIRED'); assert.equal(refused.reasonCode, 'UNUSED_REFUND_PLAN_REQUIRED');
  assert.deepEqual(refused.checkpoint.cases.unused, unused);
  assert.deepEqual(h.counts, { purchases: 30, redemptions: 29, refunds: 0 });
  // Isolated owner fixture admission changes only; the runner never changes retained policy or approval.
  change.refuseRefund = false;
  const all = await runCouponJourneyHttpAcceptance({ ...h.options, checkpoint: h.checkpoint });
  assert.equal(all.state, 'PASSED'); assert.equal(all.unusedRefunds, 1);
  assert.equal(all.checkpoint.selectionHash, checkpoint.selectionHash);
  assert.equal(all.checkpoint.cases.unused.caseCode, unused.caseCode);
  assert.deepEqual(h.counts, { purchases: 30, redemptions: 29, refunds: 1 });
  assert.equal(h.calls.filter(c => c.path.endsWith('/refund')).length, 1);
  assert.equal(h.calls.find(c => c.path.endsWith('/refund')).key, h.options.selection.runCode + ':unused:refund');
});

test('fresh ITEMS_ONLY creates no unused case and later ALL requires its original purchase/refund', async () => {
  const h = harness(), result = await runCouponJourneyHttpAcceptance({ ...h.options, phase: 'ITEMS_ONLY' });
  assert.equal(result.state, 'PHASE_COMPLETED_NOT_FULL_ACCEPTANCE');
  assert.equal(result.refundProgress.purchaseState, 'NOT_STARTED'); assert.equal(result.refundProgress.refundState, 'NOT_STARTED');
  assert.equal(result.pendingRefunds, 1); assert.equal(Object.hasOwn(result.checkpoint.cases, 'unused'), false);
  assert(h.snapshots.every(snapshot => !Object.hasOwn(snapshot.cases, 'unused')));
  assert.deepEqual(h.counts, { purchases: 29, redemptions: 29, refunds: 0 });
  const replay = await runCouponJourneyHttpAcceptance({ ...h.options, phase: 'ITEMS_ONLY', checkpoint: h.checkpoint,
    fundingObservation: { ...h.options.fundingObservation, available: '0' } });
  assert.equal(replay.state, 'PHASE_COMPLETED_NOT_FULL_ACCEPTANCE');
  assert.deepEqual(h.counts, { purchases: 29, redemptions: 29, refunds: 0 });
  assert.equal(Object.hasOwn(replay.checkpoint.cases, 'unused'), false);
  const all = await runCouponJourneyHttpAcceptance({ ...h.options, phase: 'ALL', checkpoint: h.checkpoint });
  assert.equal(all.state, 'PASSED'); assert.equal(all.checkpoint.selectionHash, result.checkpoint.selectionHash);
  assert.deepEqual(h.counts, { purchases: 30, redemptions: 29, refunds: 1 });
});

test('ITEMS_ONLY neither reconciles a pending refund nor claims full acceptance for a completed retained refund', async () => {
  const h = harness({ drop: 'refund-after' });
  await runCouponJourneyHttpAcceptance(h.options);
  const original = structuredClone(h.checkpoint.cases.unused), start = h.calls.length;
  assert.equal(original.refund, 'REFUND_PENDING');
  const result = await runCouponJourneyHttpAcceptance({ ...h.options, phase: 'ITEMS_ONLY', checkpoint: h.checkpoint });
  assert.equal(result.state, 'PHASE_COMPLETED_NOT_FULL_ACCEPTANCE'); assert.equal(result.pendingRefunds, 1);
  assert.equal(result.refundProgress.refundState, 'REFUND_PENDING');
  assert.deepEqual(result.checkpoint.cases.unused, original);
  assert(!h.calls.slice(start).some(c => /refund|disputes|entitlement-unused/.test(c.path) || c.search.includes('unused')));
  assert.deepEqual(h.counts, { purchases: 30, redemptions: 29, refunds: 1 });
  const all = await runCouponJourneyHttpAcceptance({ ...h.options, checkpoint: h.checkpoint });
  assert.equal(all.state, 'PASSED');
  const partial = await runCouponJourneyHttpAcceptance({ ...h.options, phase: 'ITEMS_ONLY', checkpoint: h.checkpoint });
  assert.equal(partial.state, 'PHASE_COMPLETED_NOT_FULL_ACCEPTANCE'); assert.equal(partial.pendingRefunds, 0);
  assert.equal(partial.refundProgress.refundState, 'COMPLETED'); assert.equal(partial.refundProgress.ownerReadbackPerformed, false);
  assert.deepEqual(h.counts, { purchases: 30, redemptions: 29, refunds: 1 });
});

test('unknown phase refuses before any HTTP or checkpoint write', async () => {
  for (const phase of ['items_only', 'REFUND_ONLY', '', null, true, {}]) {
    const h = harness();
    await assert.rejects(runCouponJourneyHttpAcceptance({ ...h.options, phase }), /ACCEPTANCE_PHASE_INVALID/);
    assert.equal(h.calls.length, 0); assert.equal(h.snapshots.length, 0);
  }
});

test('placement forwards the observed Cart revision into the real Checkout stale-revision guard', async () => {
  const h = harness({ cartRevision: 7 });
  assert.equal((await runCouponJourneyHttpAcceptance(h.options)).state, 'PASSED');
  const placements = h.calls.filter(call => call.path.endsWith('/checkouts/place'));
  assert.equal(placements.length, 30);
  for (const { body } of placements) {
    assert.equal(body.expectedCartRevision, 7);
    assert.equal(Object.hasOwn(body, 'expectedRevision'), false);
  }
  const cart = require('../../cart/src/service/defaultCartOperationService');
  const ports = require('../src/service/defaultCheckoutPlacementPortsService').create();
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'SERVICE');
  let mappedRevision;
  try {
    globalThis.SERVICE = {
      DefaultCartService: { get: async () => ({ result: [{ revision: 8 }] }) },
      DefaultCartOperationService: { calculate: request => {
        mappedRevision = request.payload.expectedRevision;
        return cart.calculateDirect(request);
      } },
    };
    await assert.rejects(() => ports.calculateCart({ tenant: 'default', enterpriseCode: 'vendor',
      ownerId: h.options.selection.customer.ownerId, payload: placements[0].body }), /Cart revision conflict/);
    assert.equal(mappedRevision, 7);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'SERVICE', previous);
    else delete globalThis.SERVICE;
  }
});

for (const drop of ['checkout-after', 'confirm-after', 'dispute-after', 'refund-after']) test('lost ' + drop + ' response recovers only original identities without another financial effect', async () => {
  const h = harness({ drop });
  assert.equal((await runCouponJourneyHttpAcceptance(h.options)).state, 'RECOVERY_REQUIRED');
  const result = await runCouponJourneyHttpAcceptance({ ...h.options, checkpoint: h.checkpoint });
  assert.equal(result.state, 'PASSED', JSON.stringify(result));
  assert.deepEqual(h.counts, { purchases: 30, redemptions: 29, refunds: 1 });
});
test('unconfirmed checkout never retries placement or generates a new order/key', async () => {
  const h = harness({ drop: 'checkout-before' });
  await runCouponJourneyHttpAcceptance(h.options);
  const result = await runCouponJourneyHttpAcceptance({ ...h.options, checkpoint: h.checkpoint });
  assert.equal(result.reasonCode, 'CHECKOUT_RECOVERY_REQUIRED');
  assert.equal(h.calls.filter(c => c.path.endsWith('/checkouts/place')).length, 1);
});
for (const phase of ['ALL', 'ITEMS_ONLY']) test(phase + ' pending merchant confirmation requires explicit original-command resume', async () => {
  const h = harness({ drop: 'confirm-pending' });
  h.options.phase = phase;
  await runCouponJourneyHttpAcceptance(h.options);
  const refused = await runCouponJourneyHttpAcceptance({ ...h.options, checkpoint: h.checkpoint });
  assert.equal(refused.reasonCode, 'EXPLICIT_CONFIRMATION_RESUME_REQUIRED');
  const result = await runCouponJourneyHttpAcceptance({ ...h.options, checkpoint: h.checkpoint, resumePending: true });
  assert.equal(result.state, phase === 'ALL' ? 'PASSED' : 'PHASE_COMPLETED_NOT_FULL_ACCEPTANCE', JSON.stringify(result));
  assert.deepEqual(h.counts, { purchases: phase === 'ALL' ? 30 : 29, redemptions: 29, refunds: phase === 'ALL' ? 1 : 0 });
});
for (const phase of ['ALL', 'ITEMS_ONLY']) for (const change of [{ badPrice: true }, { foreignEntitlement: true }, { cacheableReveal: true }, { verifiedItem: true },
  { deny: '/calculations' }, { deny: '/redemptions/validate' }, { throwPrivate: true }]) test(phase + ' owner refusal stays private and cannot become success: ' + Object.keys(change)[0], async () => {
  const h = harness(change), result = await runCouponJourneyHttpAcceptance({ ...h.options, phase });
  assert.equal(result.state, 'RECOVERY_REQUIRED');
  const expected = change.badPrice ? 'REVIEWED_PURCHASE_PRICE_MISMATCH' : change.foreignEntitlement ? 'PURCHASE_BINDING_MISMATCH' :
    change.cacheableReveal ? 'PRIVATE_REVEAL_UNCONFIRMED' : change.verifiedItem ? 'EXACT_SIMULATED_ITEMS_REQUIRED' :
      change.deny ? 'HTTP_403' : 'HTTP_OUTCOME_UNCONFIRMED';
  assert.equal(result.reasonCode, expected);
  assert(!/PRIVATE_(?:TOKEN|CUSTOMER|MERCHANT|REVIEWER|VALIDATION)/.test(JSON.stringify([result, h.snapshots])));
  assert.equal(h.counts.redemptions, 0); assert(h.counts.refunds <= 1);
  if (phase === 'ITEMS_ONLY') {
    assert.equal(result.phase, phase); assert.equal(result.pendingRefunds, 1); assert.equal(h.counts.refunds, 0);
    assert.equal(Object.hasOwn(result.checkpoint.cases, 'unused'), false);
  }
});
test('review, local target, existing sessions and durable checkpoint required before HTTP', async () => {
  const mutations = [o => { o.execute = false; }, o => { delete o.saveCheckpoint; }, o => { o.baseUrl = 'https://example.com'; },
    o => { o.selection.privateCaptureQualified = false; }, o => { o.selection.currency = 'AED'; }, o => { o.selection.expectedItemCount = 28; },
    o => { o.selection.approvedUnitsPerCampaign = 101; }, o => { o.selection.allowRedeemedBenefitReversal = true; },
    o => { o.selection.itemCases[0].items[0].quantity = 0; }, o => { o.selection.itemCases[0].qualification = true; },
    o => { o.sessions.merchant.enterpriseCode = 'foreign'; }, o => { delete o.sessions.customer; },
    o => { delete o.sessions.reviewer; }, o => { o.sessions.reviewer.enterpriseCode = 'foreign'; },
    o => { o.selection.priceSourceSha256 = 'invalid'; }, o => { o.selection.campaignSourceSha256 = 'invalid'; },
    o => { o.selection.itemCases[0].promotionCode = 'foreign'; }, o => { delete o.fundingObservation; },
    o => { o.fundingObservation.observedAt = '2020-01-01'; }, o => { o.fundingObservation.ownerId = 'foreign'; }];
  for (const phase of ['ALL', 'ITEMS_ONLY']) for (const mutate of mutations) {
    const h = harness(); h.options.phase = phase; mutate(h.options);
    await assert.rejects(runCouponJourneyHttpAcceptance(h.options)); assert.equal(h.calls.length, 0); assert.equal(h.snapshots.length, 0);
  }
});
for (const phase of ['ALL', 'ITEMS_ONLY']) test(phase + ' changed selection cannot adopt a retained checkpoint or widen pending commands', async () => {
  const h = harness({ drop: 'checkout-before' }); await runCouponJourneyHttpAcceptance(h.options);
  h.options.selection.itemCases[0].expectedTotal = '11'; const count = h.calls.length;
  await assert.rejects(runCouponJourneyHttpAcceptance({ ...h.options, phase, checkpoint: h.checkpoint }), /CHECKPOINT_SELECTION_MISMATCH/);
  assert.equal(h.calls.length, count);
});
test('failed durable checkpoint never dispatches its mutation', async () => {
  const h = harness(); h.options.saveCheckpoint = async () => { throw new Error('PRIVATE_STORAGE_DETAIL'); };
  const result = await runCouponJourneyHttpAcceptance(h.options); assert.equal(result.state, 'RECOVERY_REQUIRED'); assert.equal(h.calls.length, 0);
  assert(!JSON.stringify(result).includes('PRIVATE_'));
});
test('total reviewed purchase requirement refuses insufficient funds before any HTTP or journal write', async () => {
  for (const phase of ['ALL', 'ITEMS_ONLY']) {
    const h = harness(); h.options.fundingObservation.available = '118';
    const result = await runCouponJourneyHttpAcceptance({ ...h.options, phase });
    assert.equal(result.state, 'FUNDING_REQUIRED'); assert.equal(result.requiredAvailable, '290'); assert.equal(result.shortfall, '172');
    assert.equal(h.calls.length, 0); assert.equal(h.snapshots.length, 0);
    if (phase === 'ITEMS_ONLY') { assert.equal(result.pendingRefunds, 1); assert.equal(result.refundProgress.refundState, 'NOT_STARTED'); }
  }
});
test('nested error and ambiguous envelopes refuse without returning bodies', () => {
  for (const value of [{ data: { code: 'ERR_PRIVATE' } }, { data: {}, result: {} }, { success: false, data: {} }])
    assert.throws(() => couponJourneyData(value));
  assert.deepEqual(couponJourneyData({ result: { data: { status: 'OK' } } }), { status: 'OK' });
});
test('actual owner route declarations retain methods, access-token admission and reveal privacy', () => {
  const cart = require('../../cart/src/router/routers').cart.customer;
  const checkout = require('../src/router/routers').checkoutCore.customer;
  const digital = require('../../../../digitalCommerce/modules/digitalCore/src/router/routers').digitalCore;
  const order = require('../../order/src/router/routers').order.disputes;
  const expected = [[cart.create, 'POST', '/carts'], [cart.read, 'GET', '/carts/:cartCode'], [cart.addEntry, 'POST', '/carts/:cartCode/entries'],
    [cart.calculate, 'POST', '/carts/:cartCode/calculations'], [checkout.place, 'POST', '/checkouts/place'], [checkout.status, 'GET', '/checkouts/:orderCode'],
    [digital.customer.listEntitlements, 'GET', '/entitlements'], [digital.customer.revealEntitlement, 'POST', '/entitlements/:entitlementCode/reveal'],
    [digital.merchant.merchantWorkspace, 'GET', '/merchant/redemptions/workspace'], [digital.merchant.validate, 'POST', '/merchant/redemptions/validate'],
    [digital.merchant.confirm, 'POST', '/merchant/redemptions/:code/confirm'], [digital.merchant.inspectReceipt, 'POST', '/merchant/redemptions/:code/receipt/query'],
    [order.listOwnDisputes, 'GET', '/orders/:code/disputes'], [order.createDispute, 'POST', '/orders/:code/disputes'],
    [order.refundPreview, 'POST', '/disputes/:code/refund-preview'], [order.refundExecute, 'POST', '/disputes/:code/refund']];
  for (const [route, method, key] of expected) { assert.equal(route.method, method); assert.equal(route.key, key); assert.equal(route.secured, true); assert.deepEqual(route.authTokenTypes, ['access']); }
  for (const route of [digital.customer.revealEntitlement, digital.merchant.validate, digital.merchant.confirm, digital.merchant.inspectReceipt]) assert.equal(route.requestPrivacy.sensitive, true);
});

test('actual Cart entry and Digital public projection preserve runner-selected purchase identity', async () => {
  const cart = require('../../cart/src/service/defaultCartOperationService');
  const digital = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceEntitlementService');
  const entry = await cart.entryModel.call({ resolveSku: async () => 'selected-sku' }, { tenant: 'default', enterpriseCode: 'vendor',
    ownerId: 'existing-customer', cartCode: 'original-cart', payload: { entryCode: 'original-entry', productCode: 'selected-product', quantity: '1' } });
  assert.equal(entry.code, 'original-entry'); assert.equal(entry.sku, 'selected-sku');
  const e = { code: 'original-entitlement', providerCode: 'original-coupon', orderEntryCode: entry.code, productCode: entry.productCode,
    sku: entry.sku, ownerId: entry.ownerId, enterpriseCode: entry.enterpriseCode, orderCode: 'original-order', cartCode: entry.cartCode,
    providerOwner: 'promotion', digitalDeliveryType: 'COUPON_CODE', claimStatus: 'UNCLAIMED', status: 'ACTIVE', revision: 0,
    evidence: { promotionCode: 'original-campaign' } };
  const projected = digital.publicEntitlement(e);
  for (const key of Object.keys(e)) assert.deepEqual(projected[key], e[key]);
  assert.equal(digital.couponPurchaseEntryCode({ entryCode: entry.code }), projected.orderEntryCode);
});
