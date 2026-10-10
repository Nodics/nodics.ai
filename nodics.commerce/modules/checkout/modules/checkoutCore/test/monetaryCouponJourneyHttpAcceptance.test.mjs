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
import { runMonetaryCouponJourneyHttpAcceptance as runner } from '../src/service/acceptance/defaultMonetaryCouponJourneyHttpAcceptanceService.mjs';
const require = createRequire(import.meta.url);
const exact = require('../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService');
const budget = require('../../../../baseCommerce/modules/promotion/src/service/defaultPromotionBudgetMutationService');
const publication = require('../../../../baseCommerce/modules/promotion/src/service/defaultPromotionPublicationService');
const digital = require('../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceEntitlementService');
const cartOwner = require('../../cart/src/service/defaultCartOperationService');

// Nine distinct fixture rights cover fixed, percentage, minimum and cap behavior without importing customer data.
const terms = [
  { price: '14', subtotal: '100', discount: '30', declared: '30', percent: false },
  { price: '9', subtotal: '300', discount: '30', declared: '15', percent: true, cap: '30' },
  { price: '20', subtotal: '100', discount: '50', declared: '50', percent: false },
  { price: '250', subtotal: '300', discount: '25', declared: '25', percent: false, minimum: '100' },
  { price: '120', subtotal: '300', discount: '10', declared: '10', percent: false, minimum: '40' },
  { price: '230', subtotal: '300', discount: '20', declared: '20', percent: false, minimum: '80' },
  { price: '340', subtotal: '300', discount: '30', declared: '30', percent: false, minimum: '120' },
  { price: '180', subtotal: '300', discount: '20', declared: '10', percent: true, cap: '20', minimum: '50' },
  { price: '320', subtotal: '300', discount: '40', declared: '15', percent: true, cap: '40', minimum: '100' },
];

function harness(fault = {}) {
  const monetaryCases = terms.map((t, i) => ({ caseCode: 'case' + i, productCode: 'couponProduct' + i, sku: 'couponSku' + i,
    promotionCode: 'promotion' + i, expectedTotal: t.price, issuerEnterpriseCode: 'issuer' + i % 3,
    outletStoreCode: 'outlet' + i % 4, staffSessionKey: 'staff' + i, outletCustomerSessionKey: 'outletBuyer' + i,
    ledgerSessionKey: 'ledgerReader' + i, outletProductCode: 'goods' + i % 4, outletSku: 'goodsSku' + i % 4,
    outletJurisdiction: 'FICTIONAL_DEMO_ZERO', benefitCurrency: 'AED', expectedSubtotal: t.subtotal, expectedDiscount: t.discount,
    expectedNet: exact.add(t.subtotal, '-' + t.discount), expectedBudgetLimit: '5000' }));
  const selection = { contractVersion: 1, approvalReference: 'approved-local-demo', localDemo: true, privateCaptureQualified: true,
    tenant: 'default', runCode: 'monetary-demo', customer: { ownerId: 'buyer@example.test', enterpriseCode: 'vendor' },
    storeCode: 'marketplace', channelCode: 'web', locale: 'en', jurisdiction: 'POINTS_DEMO', currency: 'POINTS',
    payment: { paymentMethod: 'LOYALTY_REWARD', walletCode: 'existing-wallet', programCode: 'program', rewardTypeCode: 'points', rewardCurrency: 'POINTS' },
    priceSourceSha256: 'a'.repeat(64), campaignSourceSha256: 'b'.repeat(64), outletSourceSha256: 'c'.repeat(64),
    approvedCampaignCodes: monetaryCases.map(c => c.promotionCode), approvedUnitsPerCampaign: 100, expectedMonetaryCount: 9,
    monetaryCases, allowRedeemedBenefitReversal: false };
  const sessions = { customer: { authorization: 'Bearer PRIVATE_BUYER_SESSION', enterpriseCode: 'vendor' } };
  for (const c of monetaryCases) for (const key of ['staffSessionKey', 'outletCustomerSessionKey', 'ledgerSessionKey'])
    sessions[c[key]] = { authorization: 'Bearer PRIVATE_SESSION_' + c[key], enterpriseCode: c.issuerEnterpriseCode };
  const calls = [], snapshots = [], carts = new Map(), orders = new Map(), entitlements = new Map();
  const ledger = new Map(monetaryCases.map(c => [c.promotionCode, []]));
  let durable, dropped = false, purchases = 0, redemptions = 0, confirmations = 0;
  const ids = c => {
    const b = selection.runCode + '.' + c.caseCode;
    return { buy: b + '.buy', buyentry: b + '.buyentry', outlet: b + '.outlet', outletentry: b + '.outletentry',
      order: b + '.order', purchase: b + '.purchase', confirm: b + '.confirm', reference: 'CART:' + b + '.outlet' };
  };
  const drop = phase => {
    if (!dropped && fault.drop === phase) { dropped = true; throw Object.assign(new Error('PRIVATE_TRANSPORT_DIAGNOSTIC'), { code: 'PRIVATE_CREDENTIAL' }); }
  };
  const response = (value, status = 200, secret = false) => new Response(JSON.stringify({ data: value }), {
    status, headers: secret ? { 'Cache-Control': 'no-store' } : {} });
  const assertActor = (input, key) => {
    assert.equal(input.headers.Authorization, sessions[key].authorization);
    assert.equal(input.headers['x-enterprise-code'], sessions[key].enterpriseCode);
  };
  const benefit = (c, id) => ({ sourceStage: 'PRICED_CART', sourceReference: id.reference, sourceHash: 'd'.repeat(64), sourceRevision: 7,
    storeCode: c.outletStoreCode, storeRevision: 3, currency: 'AED', subtotalAmount: c.expectedSubtotal, discountAmount: c.expectedDiscount });
  const fetch = async (url, input) => {
    const path = decodeURIComponent(url.pathname), body = input.body ? JSON.parse(input.body) : {}, key = input.headers['Idempotency-Key'];
    calls.push({ path, method: input.method, body, key, headers: input.headers });
    assert.equal(input.redirect, 'error'); assert.equal(input.cache, 'no-store'); assert.equal(input.headers.tenant, selection.tenant);
    if (fault.privateError) throw Object.assign(new Error('PRIVATE_RAW_TOKEN'), { code: 'PRIVATE_EXCEPTION_CODE' });
    if (fault.deny && path.endsWith(fault.deny)) return response({ error: 'PRIVATE_RAW_TOKEN' }, 403);
    if (fault.failedEnvelope) return response({ success: false, data: { eligible: true, token: 'PRIVATE_RAW_TOKEN' } });
    const last = path.split('/').at(-1);
    if (path === '/nodics/digitalCore/v0/merchant/redemptions/workspace') {
      const c = monetaryCases.find(c => sessions[c.staffSessionKey].authorization === input.headers.Authorization);
      assertActor(input, c.staffSessionKey);
      return response({ storeRequired: true, stores: fault.noOutlet ? [] : [{ code: c.outletStoreCode }] });
    }
    if (path.startsWith('/nodics/promotion/v0/promotions/')) {
      const c = monetaryCases.find(c => c.promotionCode === path.split('/')[5]);
      assertActor(input, c.ledgerSessionKey); assert.equal(input.method, 'GET');
      const entries = ledger.get(c.promotionCode);
      if (last === 'budget-ledger') {
        const rows = fault.overflow ? Array(100).fill({}) : entries;
        const completeness = { contractVersion: 1, tenant: selection.tenant, enterpriseCode: c.issuerEnterpriseCode,
          promotionCode: c.promotionCode, totalCount: rows.length, returnedCount: rows.length, pageNumber: 1, pageSize: 100,
          complete: true, ...(fault.completeness || {}) };
        if (fault.truncatedLedger || fault.truncatedCompletedLedger && rows.length ||
            fault.truncatedReplayLedger && confirmations >= 2) completeness.totalCount += 1;
        return response({ promotionCode: c.promotionCode, entries: rows,
          ...(!fault.missingCompleteness ? { completeness } : {}) });
      }
      assert.equal(last, 'analytics');
      const sum = type => entries.filter(e => e.mutationType === type).reduce((a, e) => exact.add(a, e.amount), '0');
      const committed = sum('COMMIT'), released = sum('RELEASE');
      return response({ promotionCode: c.promotionCode, budgetCommitted: committed, budgetReleased: released,
        budgetExposure: fault.badAnalytics && entries.length ? '999' : exact.add(committed, '-' + released) });
    }
    const c = monetaryCases.find(c => path.includes(selection.runCode + '.' + c.caseCode + '.') ||
      body.cartCode?.includes(selection.runCode + '.' + c.caseCode + '.') || path.includes('entitlement-' + c.caseCode));
    if (path === '/nodics/cart/v0/carts') {
      const outlet = body.currency === 'AED', id = ids(c);
      assertActor(input, outlet ? c.outletCustomerSessionKey : 'customer');
      assert.equal(durable.cases[c.caseCode][outlet ? 'outletCart' : 'purchaseCart'], 'CREATE_PENDING');
      assert.equal(body.cartCode, outlet ? id.outlet : id.buy);
      assert(!body.ownerId && !body.enterpriseCode && !body.couponCode);
      drop('cart-before');
      carts.set(body.cartCode, { code: body.cartCode, tenant: 'default', ownerId: selection.customer.ownerId,
        enterpriseCode: outlet ? c.issuerEnterpriseCode : 'vendor', status: 'ACTIVE', revision: 7, ...body, entries: [] });
      drop('cart-after'); return response({});
    }
    if (path.startsWith('/nodics/cart/v0/carts/')) {
      const code = path.split('/')[5], cart = carts.get(code);
      if (!cart) return response({}, 404);
      const outlet = cart.currency === 'AED'; assertActor(input, outlet ? c.outletCustomerSessionKey : 'customer');
      if (last === 'entries') {
        assert.equal(durable.cases[c.caseCode][outlet ? 'outletCart' : 'purchaseCart'], 'ENTRY_PENDING');
        assert(!body.variantCode && !body.priceQuoteCode && !body.price && !body.ownerId);
        drop('entry-before');
        cart.entries.push(await cartOwner.entryModel.call({ resolveSku: async () => body.sku }, {
          tenant: 'default', enterpriseCode: cart.enterpriseCode, ownerId: selection.customer.ownerId, cartCode: code, payload: body }));
        drop('entry-after');
      }
      if (last === 'calculations') {
        assert.equal(body.expectedRevision, 7); assert(!body.couponCode);
        return response({ cartCode: cart.code, tenant: 'default', enterpriseCode: cart.enterpriseCode, currency: cart.currency,
          subtotal: outlet ? c.expectedSubtotal : c.expectedTotal, discountAmount: '0', taxAmount: fault.nonzeroTax && outlet ? '1' : '0',
          totalAmount: fault.badPurchasePrice && !outlet ? '999' : outlet ? c.expectedSubtotal : c.expectedTotal, entries: cart.entries });
      }
      return response({ cart: { ...cart, ownerId: fault.foreignCart && outlet ? 'foreign-buyer' : cart.ownerId }, entries: cart.entries });
    }
    if (path === '/nodics/checkoutCore/v0/checkouts/place') {
      const id = ids(c); assertActor(input, 'customer');
      assert.equal(durable.cases[c.caseCode].purchase, 'CHECKOUT_PENDING'); assert.equal(key, id.purchase);
      assert.equal(body.paymentMethod, 'LOYALTY_REWARD'); assert.equal(body.rewardCurrency, 'POINTS'); assert.equal(body.expectedCartRevision, 7);
      assert(!body.amount && !body.providerToken && !body.couponCode); drop('checkout-before');
      purchases++; orders.set(id.order, { code: id.order, cartCode: id.buy, ownerId: selection.customer.ownerId,
        enterpriseCode: 'vendor', currency: 'POINTS', totalAmount: c.expectedTotal, status: 'COMPLETED', evidence: { storeCode: selection.storeCode } });
      entitlements.set('entitlement-' + c.caseCode, { code: 'entitlement-' + c.caseCode, providerCode: 'unit-' + c.caseCode,
        ownerId: selection.customer.ownerId, enterpriseCode: 'vendor', orderCode: id.order, cartCode: id.buy, orderEntryCode: id.buyentry,
        productCode: c.productCode, sku: c.sku, providerOwner: 'promotion', digitalDeliveryType: 'COUPON_CODE',
        status: 'ACTIVE', claimStatus: 'UNCLAIMED', revision: 0, evidence: { promotionCode: c.promotionCode } });
      drop('checkout-after'); return response({});
    }
    if (path.startsWith('/nodics/checkoutCore/v0/checkouts/')) {
      assertActor(input, 'customer'); return response(orders.has(last) ? { code: last, status: 'COMPLETED',
        evidence: { orderCode: last, completed: ['PAYMENT_CAPTURED', 'DIGITAL_SOLD', 'DIGITAL_DELIVERED'] } } : { status: 'NOT_COMPLETED' });
    }
    if (path.startsWith('/nodics/order/v0/orders/')) { assertActor(input, 'customer'); return response({ order: orders.get(last) }); }
    if (path === '/nodics/digitalCore/v0/entitlements') {
      assertActor(input, 'customer');
      return response({ entitlements: [...entitlements.values()].filter(e => e.orderCode === url.searchParams.get('orderCode'))
        .map(e => digital.publicEntitlement({ ...e, ownerId: fault.foreignEntitlement ? 'foreign' : e.ownerId })) });
    }
    if (last === 'reveal') {
      assertActor(input, 'customer'); const e = entitlements.get(path.split('/')[5]);
      return response({ status: 'REVEALED', tokenSource: 'AUTHENTICATED_RETENTION', couponCode: e.providerCode,
        token: 'PRIVATE_TOKEN_' + e.code }, 200, !fault.cacheableReveal);
    }
    if (last === 'validate') {
      const e = [...entitlements.values()].find(e => body.couponToken === 'PRIVATE_TOKEN_' + e.code);
      const c = monetaryCases.find(c => c.productCode === e.productCode), id = ids(c); assertActor(input, c.staffSessionKey);
      assert.equal(body.merchantReceiptReference, id.reference); assert.equal(body.storeCode, c.outletStoreCode);
      assert(!body.subtotalAmount && !body.currency && !body.ownerId);
      const priced = benefit(c, id);
      if (fault.badBenefit) priced[fault.badBenefit[0]] = fault.badBenefit[1];
      return response({ eligible: true, entitlementCode: e.code, productCode: c.productCode, merchantCode: c.issuerEnterpriseCode,
        mode: 'MERCHANT_SCREEN', storeCode: c.outletStoreCode, storeRevision: 3, revision: e.revision,
        validationCode: 'PRIVATE_VALIDATION', validationExpiresAt: new Date(Date.now() + 300000).toISOString(), conditions: { benefit: priced } },
      200, !fault.cacheableValidation);
    }
    if (last === 'confirm') {
      const e = entitlements.get(path.split('/')[6]), c = monetaryCases.find(c => c.productCode === e.productCode), id = ids(c);
      assertActor(input, c.staffSessionKey); assert.equal(key, id.confirm); assert.equal(body.merchantReceiptReference, id.reference);
      confirmations++;
      if (!e.evidence.merchantRedemption) {
        assert.equal(durable.cases[c.caseCode].redemption, 'CONFIRM_PENDING'); assert.equal(body.expectedRevision, e.revision);
        assert.equal(body.validationCode, 'PRIVATE_VALIDATION'); drop('confirm-before');
        e.evidence.merchantRedemption = { code: 'operation-' + c.caseCode, confirmationKey: key, merchantReceiptReference: id.reference,
          storeRef: { code: c.outletStoreCode }, storeRevision: 3, merchantCode: c.issuerEnterpriseCode, mode: 'MERCHANT_SCREEN',
          receiptCode: 'receipt-' + c.caseCode, pricedBenefit: benefit(c, id) };
        e.claimStatus = 'CLAIMED'; drop('confirm-marker');
      }
      const marker = e.evidence.merchantRedemption;
      if (e.claimStatus !== 'REDEEMED') {
        const entries = ledger.get(c.promotionCode);
        const code = budget.code.call({ fingerprint: publication.fingerprint }, { contractVersion: 2, tenant: 'default',
          enterpriseCode: c.issuerEnterpriseCode, vendorEnterpriseCode: 'vendor', couponCode: e.providerCode, mutationType: 'COMMIT' });
        const beforeSpent = entries.reduce((sum, e) => exact.add(sum, (e.mutationType === 'COMMIT' ? '' : '-') + e.amount), '0');
        entries.push({ code: fault.wrongLedgerCode ? 'unbound-receipt' : code, tenant: 'default', enterpriseCode: c.issuerEnterpriseCode,
          promotionCode: c.promotionCode, mutationType: 'COMMIT', amount: c.expectedDiscount, beforeSpent, afterSpent: exact.add(beforeSpent, c.expectedDiscount),
          targetCode: marker.code, idempotencyKey: marker.code });
        e.status = 'REDEEMED'; e.claimStatus = 'REDEEMED'; e.revision++; redemptions++; drop('confirm-after');
      } else {
        assert(!body.validationCode && !body.expectedRevision);
        assert.equal(durable.cases[c.caseCode].redemption, 'REPLAY_PENDING');
        drop('replay-before');
        if (fault.replayExtraCommit) ledger.get(c.promotionCode).push({ ...ledger.get(c.promotionCode)[0], code: 'extra' });
        drop('replay-after');
      }
      return response({ claimStatus: 'REDEEMED' }, 200, true);
    }
    if (last === 'query' && path.endsWith('/receipt/query')) {
      const e = entitlements.get(path.split('/')[6]), c = monetaryCases.find(c => c.productCode === e.productCode), id = ids(c);
      assertActor(input, c.staffSessionKey); assert.equal(key, id.confirm); assert.equal(body.merchantReceiptReference, id.reference);
      return response({ entitlementCode: e.code, state: fault.pendingReceipt ? 'UNCONFIRMED' : 'COMPLETED', confirmationKey: key,
        merchantReceiptReference: id.reference, merchantCode: c.issuerEnterpriseCode, mode: 'MERCHANT_SCREEN',
        storeCode: c.outletStoreCode, storeRevision: 3, receiptCode: e.evidence.merchantRedemption.receiptCode }, 200, true);
    }
    assert.fail('Unexpected owner route');
  };
  const options = { baseUrl: 'http://localhost:19999', selection, sessions, fetch,
    fundingObservation: { available: '1483', observedAt: new Date().toISOString(), walletCode: selection.payment.walletCode,
      ownerId: selection.customer.ownerId, enterpriseCode: 'vendor', programCode: selection.payment.programCode, rewardTypeCode: selection.payment.rewardTypeCode },
    saveCheckpoint: async cp => {
      if (fault.failJournal || fault.failJournalAt && cp.cases.case0?.redemption === fault.failJournalAt) throw new Error('PRIVATE_JOURNAL');
      durable = structuredClone(cp); snapshots.push(cp);
    } };
  return { options, calls, snapshots, carts, orders, entitlements, ledger, fault,
    get checkpoint() { return durable; }, get counts() { return { purchases, redemptions, confirmations }; },
    async execute(extra = {}) { const plan = await runner(options); return runner({ ...options, execute: true, confirmationHash: plan.planHash, ...extra }); } };
}

test('import and plan perform no HTTP or checkpoint writes and need no sessions', async () => {
  const h = harness(); delete h.options.sessions; delete h.options.fundingObservation; delete h.options.saveCheckpoint;
  const plan = await runner(h.options);
  assert.equal(plan.state, 'PLANNED'); assert.equal(plan.requiredAvailable, '1483'); assert.equal(plan.selectors.length, 9);
  for (const s of plan.selectors) assert.match(s.sourceReference, /^CART:[A-Za-z0-9_.-]{1,114}$/);
  assert(plan.prerequisites.includes('INDEPENDENT_PRICING_TRANSPORT_PRICED_PROVIDER_AND_ATOMIC_BUDGET_OWNER_QUALIFICATION'));
  assert.equal(h.calls.length, 0); assert.equal(h.snapshots.length, 0);
  const previous = globalThis.fetch;
  try {
    globalThis.fetch = () => assert.fail('Import must be inert');
    await import('../src/service/acceptance/defaultMonetaryCouponJourneyHttpAcceptanceService.mjs?inert-import');
  } finally { globalThis.fetch = previous; }
});

for (const fault of [{ missingCompleteness: true }, { truncatedLedger: true },
  { completeness: { complete: false } }, { completeness: { tenant: 'foreign' } },
  { completeness: { enterpriseCode: 'foreign' } }, { completeness: { promotionCode: 'foreign' } },
  { completeness: { pageNumber: 2 } }, { completeness: { returnedCount: 1 } },
  { completeness: { totalCount: '0' } }])
  test('unqualified budget completeness refuses before purchase: ' + JSON.stringify(fault), async () => {
    const h = harness(fault), result = await h.execute();
    assert.equal(result.state, 'RECOVERY_REQUIRED');
    assert.deepEqual(h.counts, { purchases: 0, redemptions: 0, confirmations: 0 });
  });

for (const fault of [{ truncatedCompletedLedger: true }, { truncatedReplayLedger: true }])
  test('fresh complete ledger evidence is required after confirmation and replay: ' + Object.keys(fault)[0], async () => {
    const h = harness(fault), result = await h.execute();
    assert.equal(result.state, 'RECOVERY_REQUIRED');
    assert.equal(h.counts.purchases, 1);
    assert.equal(h.counts.redemptions, 1);
  });

test('monetary request pacing is awaited before transport timeout creation', async () => {
  const h = harness(), originalTimeout = AbortSignal.timeout;
  let ready = false, paced = 0;
  AbortSignal.timeout = milliseconds => {
    assert.equal(ready, true); ready = false;
    return originalTimeout.call(AbortSignal, milliseconds);
  };
  try {
    const result = await h.execute({ beforeRequest: async metadata => {
      assert.deepEqual(Object.keys(metadata).sort(), ['method', 'module', 'route']);
      assert.equal(Object.isFrozen(metadata), true);
      await Promise.resolve(); ready = true; paced++;
    } });
    assert.equal(result.state, 'PASSED');
    assert.equal(paced, h.calls.length);
  } finally { AbortSignal.timeout = originalTimeout; }
});

test('failed monetary pacing dispatches no HTTP or financial effects and exposes no cause', async () => {
  const h = harness(), result = await h.execute({ beforeRequest: async () => { throw new Error('PRIVATE_PACING'); } });
  assert.equal(result.state, 'RECOVERY_REQUIRED');
  assert.equal(result.reasonCode, 'REQUEST_PACING_UNCONFIRMED');
  assert.equal(h.calls.length, 0);
  assert.deepEqual(h.counts, { purchases: 0, redemptions: 0, confirmations: 0 });
  assert(!JSON.stringify(result).includes('PRIVATE_PACING'));
});

test('nine POINTS purchases, genuine issuer baskets, priced validation, receipt/accounting and replay complete', async () => {
  const h = harness(), original = structuredClone({ selection: h.options.selection, sessions: h.options.sessions });
  const result = await h.execute(); assert.equal(result.state, 'PASSED', JSON.stringify(result));
  assert.deepEqual(h.counts, { purchases: 9, redemptions: 9, confirmations: 18 }); assert.equal(h.carts.size, 18);
  assert.equal(result.realMoneyPaymentExecuted, false); assert.equal(result.deliveryVerified, false);
  assert.equal(result.budgetEvidence, 'PROMOTION_LEDGER_AND_ANALYTICS');
  assert(!/PRIVATE_(?:TOKEN|SESSION|BUYER|VALIDATION|RAW|EXCEPTION|CREDENTIAL|TRANSPORT|JOURNAL)/.test(JSON.stringify([result, h.snapshots])));
  assert(!h.calls.some(c => /internal|schema|seed|grant|signup|authenticate|import|publication|promotions\/apply|refund/.test(c.path)));
  assert(h.calls.every(c => ['GET', 'POST'].includes(c.method)));
  assert.deepEqual({ selection: h.options.selection, sessions: h.options.sessions }, original);
  const replayStart = h.calls.length;
  assert.equal((await h.execute({ checkpoint: h.checkpoint })).state, 'PASSED');
  assert.deepEqual(h.counts, { purchases: 9, redemptions: 9, confirmations: 18 });
  assert(h.calls.slice(replayStart).every(c => c.method === 'GET' || c.path.endsWith('/receipt/query')));
});

for (const drop of ['cart-after', 'entry-after', 'checkout-after', 'confirm-after', 'replay-before', 'replay-after'])
  test('lost ' + drop + ' acknowledgement recovers original identities without another debit or COMMIT', async () => {
    const h = harness({ drop }); assert.equal((await h.execute()).state, 'RECOVERY_REQUIRED');
    const result = await h.execute({ checkpoint: h.checkpoint }); assert.equal(result.state, 'PASSED', JSON.stringify(result));
    assert.equal(h.counts.purchases, 9); assert.equal(h.counts.redemptions, 9);
    assert.equal([...h.ledger.values()].flat().length, 9);
  });

for (const drop of ['cart-before', 'entry-before', 'checkout-before', 'confirm-before'])
  test('uncertain ' + drop + ' never recreates a cart, entry, purchase or confirmation', async () => {
    const h = harness({ drop }); await h.execute();
    const before = h.calls.filter(c => c.method === 'POST' && !c.path.endsWith('/receipt/query')).length;
    const result = await h.execute({ checkpoint: h.checkpoint, resumePending: true }); assert.equal(result.state, 'RECOVERY_REQUIRED');
    assert.equal(h.calls.filter(c => c.method === 'POST' && !c.path.endsWith('/receipt/query')).length, before);
  });

test('pending original merchant marker needs explicit resume and never re-reveals or re-validates', async () => {
  const h = harness({ drop: 'confirm-marker' }); await h.execute();
  const cp = h.checkpoint, start = h.calls.length;
  assert.equal((await h.execute({ checkpoint: cp })).reasonCode, 'EXPLICIT_ORIGINAL_CONFIRMATION_RESUME_REQUIRED');
  assert(!h.calls.slice(start).some(c => /reveal|validate|\/confirm$/.test(c.path)));
  assert.equal((await h.execute({ checkpoint: cp, resumePending: true })).state, 'PASSED');
  assert.equal(h.counts.purchases, 9); assert.equal(h.counts.redemptions, 9);
});

test('native REDEEMED status resumes original confirmation without a replacement purchase', async () => {
  const h = harness({ drop: 'confirm-after' });
  await h.execute();
  assert.equal([...h.entitlements.values()][0].status, 'REDEEMED');
  const originalOrder = [...h.orders.keys()][0], before = h.counts.purchases;
  assert.equal((await h.execute({ checkpoint: h.checkpoint, resumePending: true })).state, 'PASSED');
  assert.equal([...h.orders.keys()].filter(code => code === originalOrder).length, 1);
  assert.equal(h.counts.purchases, before + 8);
});

for (const status of ['ACTIVE', 'REVOKED', 'EXPIRED']) test('contradictory redeemed entitlement status refuses: ' + status, async () => {
  const h = harness({ drop: 'confirm-after' });
  await h.execute();
  [...h.entitlements.values()][0].status = status;
  const before = h.counts.purchases;
  assert.equal((await h.execute({ checkpoint: h.checkpoint, resumePending: true })).reasonCode, 'ORIGINAL_COUPON_STATE_REQUIRED');
  assert.equal(h.counts.purchases, before);
});

test('fresh total funding is required before any HTTP or checkpoint write', async () => {
  const h = harness(); h.options.fundingObservation.available = '118';
  const result = await h.execute(); assert.equal(result.state, 'FUNDING_REQUIRED'); assert.equal(result.shortfall, '1365');
  assert.equal(h.calls.length, 0); assert.equal(h.snapshots.length, 0);
});

test('plan confirmation, source pins, actors, payment and checkpoint cannot be replaced on resume', async () => {
  const h = harness({ drop: 'checkout-after' }); await h.execute();
  const cp = h.checkpoint, start = h.calls.length;
  await assert.rejects(h.execute({ checkpoint: cp, confirmationHash: 'f'.repeat(64) }), /EXACT_PLAN_CONFIRMATION/);
  h.options.selection.outletSourceSha256 = 'f'.repeat(64);
  await assert.rejects(h.execute({ checkpoint: cp }), /CHECKPOINT_SELECTION_MISMATCH/); assert.equal(h.calls.length, start);
});

test('invalid reviewed selectors, credentials and freshness refuse before dispatch', async () => {
  const changes = [o => { o.selection.expectedMonetaryCount = 8; }, o => { o.selection.approvedUnitsPerCampaign = 101; },
    o => { o.selection.monetaryCases[0].qualification = true; }, o => { o.selection.currency = 'AED'; },
    o => { o.selection.payment.paymentMethod = 'CARD'; }, o => { o.selection.monetaryCases[0].expectedNet = '0'; },
    o => { o.selection.monetaryCases[0].caseCode = 'invalid:cart'; }, o => { o.selection.runCode = 'r'.repeat(51); },
    o => { o.selection.allowRedeemedBenefitReversal = true; }, o => { o.selection.privateCaptureQualified = false; },
    o => { o.baseUrl = 'https://example.test'; }, o => { o.baseUrl = 'http://localhost:19999/path'; },
    o => { o.sessions.outletBuyer0.enterpriseCode = 'vendor'; }, o => { delete o.sessions.ledgerReader0; },
    o => { o.fundingObservation.observedAt = '2020-01-01'; }, o => { o.fundingObservation.ownerId = 'foreign'; },
    o => { o.selection.monetaryCases[0].outletCustomerSessionKey = 'customer'; }];
  for (const change of changes) { const h = harness(); change(h.options); await assert.rejects(h.execute()); assert.equal(h.calls.length, 0); }
});

for (const fault of [{ badPurchasePrice: true }, { foreignCart: true }, { foreignEntitlement: true }, { nonzeroTax: true },
  { cacheableReveal: true }, { cacheableValidation: true }, { noOutlet: true }, { deny: '/budget-ledger' }, { overflow: true }, { failedEnvelope: true },
  { privateError: true }, { failJournal: true }, { wrongLedgerCode: true }, { badAnalytics: true }, { pendingReceipt: true },
  { replayExtraCommit: true }, ...[['discountAmount', '31'], ['sourceStage', 'EXTERNAL_POS'], ['sourceReference', 'CART:foreign'],
    ['sourceRevision', 8], ['sourceHash', 'invalid'], ['currency', 'USD'], ['storeCode', 'foreign'], ['simulated', true]]
    .map(badBenefit => ({ badBenefit }))])
  test('owner refusal or contradictory evidence stays private: ' + JSON.stringify(fault), async () => {
    const h = harness(fault), result = await h.execute(); assert.equal(result.state, 'RECOVERY_REQUIRED', JSON.stringify(result));
    assert(!/PRIVATE_(?:TOKEN|SESSION|BUYER|VALIDATION|RAW|EXCEPTION|CREDENTIAL|TRANSPORT|JOURNAL)/.test(JSON.stringify([result, h.snapshots])));
    const reason = fault.badPurchasePrice ? 'REVIEWED_CART_PRICE_MISMATCH' : fault.foreignCart ? 'CART_BINDING_MISMATCH' :
      fault.foreignEntitlement ? 'PURCHASE_BINDING_MISMATCH' : fault.nonzeroTax ? 'FICTIONAL_ZERO_TAX_BASKET_REQUIRED' :
      fault.cacheableReveal ? 'PRIVATE_REVEAL_UNCONFIRMED' : fault.cacheableValidation ? 'PRIVATE_MERCHANT_RESPONSE_REQUIRED' :
      fault.noOutlet ? 'EXACT_OUTLET_ADMISSION_REQUIRED' :
      fault.deny ? 'OWNER_HTTP_REFUSED' : fault.overflow ? 'BOUNDED_BUDGET_READ_REQUIRED' : fault.failedEnvelope ? 'OWNER_RESPONSE_REFUSED' :
      fault.privateError ? 'HTTP_OUTCOME_UNCONFIRMED' : fault.failJournal ? 'OWNER_OUTCOME_UNCONFIRMED' :
      fault.wrongLedgerCode || fault.replayExtraCommit ? 'EXACT_ORIGINAL_BUDGET_COMMIT_REQUIRED' : fault.badAnalytics ? 'BUDGET_LEDGER_READBACK_MISMATCH' :
      fault.pendingReceipt ? 'ORIGINAL_RECEIPT_REQUIRED' : 'EXACT_PRICED_BENEFIT_REQUIRED';
    assert.equal(result.reasonCode, reason);
    if (fault.failJournal || fault.noOutlet || fault.overflow || fault.failedEnvelope || fault.privateError || fault.deny)
      assert.equal(h.counts.purchases, 0);
    if (fault.badBenefit || fault.badPurchasePrice || fault.foreignCart || fault.foreignEntitlement || fault.cacheableReveal ||
      fault.cacheableValidation || fault.nonzeroTax)
      assert.equal(h.counts.redemptions, 0);
  });

test('existing budget spend is preserved and only the original benefit delta is added', async () => {
  const h = harness();
  for (const c of h.options.selection.monetaryCases) h.ledger.get(c.promotionCode).push({ code: 'existing-' + c.caseCode,
    tenant: 'default', enterpriseCode: c.issuerEnterpriseCode, promotionCode: c.promotionCode, mutationType: 'COMMIT',
    amount: '5', beforeSpent: '0', afterSpent: '5', targetCode: 'prior-operation', idempotencyKey: 'prior-operation' });
  assert.equal((await h.execute()).state, 'PASSED');
  for (const c of h.options.selection.monetaryCases) {
    assert.equal(h.checkpoint.cases[c.caseCode].baseline.exposure, '5');
    assert.equal(h.ledger.get(c.promotionCode).length, 2);
  }
});

for (const failJournalAt of ['CONFIRM_PENDING', 'REPLAY_PENDING']) test('failed durable ' + failJournalAt + ' save prevents its dispatch', async () => {
  const h = harness({ failJournalAt });
  assert.equal((await h.execute()).reasonCode, 'OWNER_OUTCOME_UNCONFIRMED');
  assert.equal(h.counts.purchases, 1);
  assert.equal(h.counts.confirmations, failJournalAt === 'CONFIRM_PENDING' ? 0 : 1);
  h.fault.failJournalAt = undefined;
  assert.equal((await h.execute({ checkpoint: h.checkpoint })).state, 'PASSED');
  assert.equal(h.counts.purchases, 9); assert.equal(h.counts.redemptions, 9);
});

test('checkpoint accepts no secrets and pending marker cannot change original benefit or outlet', async () => {
  const h = harness({ drop: 'confirm-marker' }); await h.execute();
  const cp = structuredClone(h.checkpoint); cp.cases.case0.token = 'PRIVATE_TOKEN';
  await assert.rejects(h.execute({ checkpoint: cp }), /CHECKPOINT_CASE_INVALID/);
  h.entitlements.get('entitlement-case0').evidence.merchantRedemption.pricedBenefit.discountAmount = '999';
  assert.equal((await h.execute({ checkpoint: h.checkpoint, resumePending: true })).reasonCode, 'EXACT_PRICED_BENEFIT_REQUIRED');
  assert.equal(h.counts.redemptions, 0);
});

test('durable original command IDs cannot be changed or replaced before resume dispatch', async () => {
  const h = harness({ drop: 'confirm-marker' }); await h.execute();
  for (const key of ['confirmationKey', 'purchaseKey', 'sourceReference', 'outletCart', 'order']) {
    const cp = structuredClone(h.checkpoint), count = h.calls.length;
    cp.cases.case0.commands[key] += '.replacement';
    await assert.rejects(h.execute({ checkpoint: cp, resumePending: true }), /CHECKPOINT_CASE_INVALID/);
    assert.equal(h.calls.length, count);
  }
  const reordered = structuredClone(h.checkpoint);
  reordered.cases.case0.commands = Object.fromEntries(Object.entries(reordered.cases.case0.commands).reverse());
  assert.equal((await h.execute({ checkpoint: reordered, resumePending: true })).state, 'PASSED');
});

test('actual owner routers and public projections support only the documented HTTP contract', () => {
  const cart = require('../../cart/src/router/routers').cart.customer;
  const checkout = require('../src/router/routers').checkoutCore.customer;
  const digitalRoutes = require('../../../../digitalCommerce/modules/digitalCore/src/router/routers').digitalCore;
  const promotion = require('../../../../baseCommerce/modules/promotion/src/router/routers').promotion.backoffice;
  const routes = [[cart.create, 'POST', '/carts'], [cart.read, 'GET', '/carts/:cartCode'],
    [cart.addEntry, 'POST', '/carts/:cartCode/entries'], [cart.calculate, 'POST', '/carts/:cartCode/calculations'],
    [checkout.place, 'POST', '/checkouts/place'], [checkout.status, 'GET', '/checkouts/:orderCode'],
    [digitalRoutes.customer.listEntitlements, 'GET', '/entitlements'],
    [digitalRoutes.customer.revealEntitlement, 'POST', '/entitlements/:entitlementCode/reveal'],
    [digitalRoutes.merchant.merchantWorkspace, 'GET', '/merchant/redemptions/workspace'],
    [digitalRoutes.merchant.validate, 'POST', '/merchant/redemptions/validate'],
    [digitalRoutes.merchant.confirm, 'POST', '/merchant/redemptions/:code/confirm'],
    [digitalRoutes.merchant.inspectReceipt, 'POST', '/merchant/redemptions/:code/receipt/query'],
    [promotion.budgetLedger, 'GET', '/promotions/:promotionCode/budget-ledger'],
    [promotion.analytics, 'GET', '/promotions/:promotionCode/analytics']];
  for (const [route, method, key] of routes) {
    assert.equal(route.method, method); assert.equal(route.key, key); assert.equal(route.secured, true); assert.deepEqual(route.authTokenTypes, ['access']);
  }
  assert.equal(promotion.budgetLedger.permission, 'commerce.promotion.read');
  assert.equal(promotion.budgetLedger.apiExposure, 'commerceManagement');
  for (const route of [digitalRoutes.customer.revealEntitlement, digitalRoutes.merchant.validate, digitalRoutes.merchant.confirm,
    digitalRoutes.merchant.inspectReceipt]) assert.equal(route.requestPrivacy.sensitive, true);
  assert.equal(Object.hasOwn(digital.publicEntitlement({ tenant: 'default' }), 'tenant'), false);
});

test('expected discounts use the actual Promotion exact arithmetic owner with unchanged minimum/cap terms', () => {
  const benefit = require('../../../../baseCommerce/modules/promotion/src/service/defaultPromotionMerchantBenefitService');
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'SERVICE');
  try {
    globalThis.SERVICE = { DefaultExactAmountService: exact };
    for (const t of terms) assert.equal(benefit.calculate(t.subtotal, t), t.discount);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'SERVICE', previous); else delete globalThis.SERVICE;
  }
});
