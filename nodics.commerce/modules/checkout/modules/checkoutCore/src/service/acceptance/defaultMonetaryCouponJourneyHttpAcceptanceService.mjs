/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module checkoutCore/acceptance/defaultMonetaryCouponJourneyHttpAcceptanceService
 * @description Inert LOCAL monetary coupon HTTP acceptance. Plan first, then confirm the exact plan hash.
 * @layer tooling @owner checkoutCore
 * @override Inject fetch for isolated tests; deployments retain normal owner API admission.
 */
import exact from '../../../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService.js';
import budgetIdentityOwner from '../../../../../../baseCommerce/modules/promotion/src/service/defaultPromotionBudgetMutationService.js';
import publicationIdentityOwner from '../../../../../../baseCommerce/modules/promotion/src/service/defaultPromotionPublicationService.js';
import { couponJourneyData } from './defaultCouponJourneyHttpAcceptanceService.mjs';

const hash = publicationIdentityOwner.fingerprint;
const identifier = value => typeof value === 'string' && /^[A-Za-z0-9_.-]{1,128}$/.test(value);
const ownerId = value => typeof value === 'string' && /^[A-Za-z0-9_.:@-]{1,192}$/.test(value);
const amount = value => typeof value === 'string' && /^(?:0|[1-9]\d{0,11})(?:\.\d{1,8})?$/.test(value);
const sameAmount = (a, b) => amount(a) && amount(b) && exact.compare(a, b) === 0;
const revision = value => Number.isSafeInteger(value) && value >= 0;
const keys = (value, allowed) => value && typeof value === 'object' &&
  [Object.prototype, null].includes(Object.getPrototypeOf(value)) &&
  Object.keys(value).every(key => allowed.includes(key));
class EvidenceError extends Error {}
function check(condition, code) { if (!condition) throw new EvidenceError(code); }
const prerequisites = Object.freeze([
  'ALREADY_RUNNING_LOCAL_COMMERCE_WITH_PRIVATE_CAPTURE_AND_INSTALLED_OWNER_PERSISTENCE',
  'EXISTING_BUYER_AND_SAME_BUYER_ISSUER_SCOPED_CUSTOMER_SESSIONS_WITH_COMMERCE_CART_OWN',
  'CURRENT_ISSUER_STAFF_OUTLET_SCOPES_AND_COMMERCE_COUPON_POS_REDEEM',
  'ISSUER_LEDGER_READER_WITH_COMMERCE_PROMOTION_READ_AND_COMMERCE_MANAGEMENT_EXPOSURE',
  'ACTIVATED_OUTLET_PRODUCT_PRICE_TAX_AND_INVENTORY_POLICY_WITH_REVIEWED_OPENING_STOCK',
  'SECURE_COUPON_STOCK_ORIGINAL_SELLER_CONSENT_AND_ISSUED_COUPON_BENEFIT_V1_PURPOSE',
  'INDEPENDENT_PRICING_TRANSPORT_PRICED_PROVIDER_AND_ATOMIC_BUDGET_OWNER_QUALIFICATION',
  'EXISTING_POINTS_WALLET_PAYMENT_ADMISSION_AND_FRESH_READ_ONLY_BALANCE_OBSERVATION',
  'DURABLE_SECRET_FREE_CHECKPOINT_SINK_AND_ORIGINAL_PLAN_CONFIRMATION',
]);

/** Derives bounded original identities; native CART handles never contain a colon in their code. */
function identities(s, c) {
  const base = s.runCode + '.' + c.caseCode;
  return { purchaseCart: base + '.buy', purchaseEntry: base + '.buyentry', purchaseCalculation: base + '.buycalc',
    order: base + '.order', purchaseKey: base + '.purchase', outletCart: base + '.outlet',
    outletEntry: base + '.outletentry', outletCalculation: base + '.outletcalc',
    confirmationKey: base + '.confirm', sourceReference: 'CART:' + base + '.outlet' };
}

/** Validates reviewed fixture selectors only. No application fixture is imported or treated as runtime authority. */
function reviewed(options) {
  let url;
  try { url = new URL(options.baseUrl); } catch { check(false, 'LOCAL_HTTP_TARGET_REQUIRED'); }
  check(['http:', 'https:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
    !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash, 'LOCAL_HTTP_TARGET_REQUIRED');
  let s;
  try { s = structuredClone(options.selection); } catch { check(false, 'REVIEWED_SELECTION_REQUIRED'); }
  check(keys(s, ['contractVersion', 'approvalReference', 'localDemo', 'privateCaptureQualified', 'tenant', 'runCode', 'customer',
    'storeCode', 'channelCode', 'locale', 'jurisdiction', 'currency', 'payment', 'priceSourceSha256', 'campaignSourceSha256',
    'outletSourceSha256', 'approvedCampaignCodes', 'approvedUnitsPerCampaign', 'expectedMonetaryCount', 'monetaryCases',
    'allowRedeemedBenefitReversal']) && s.contractVersion === 1 && s.localDemo === true && s.privateCaptureQualified === true &&
    s.allowRedeemedBenefitReversal === false && s.currency === 'POINTS' &&
    ['approvalReference', 'tenant', 'runCode', 'storeCode', 'channelCode', 'locale', 'jurisdiction'].every(k => identifier(s[k])) &&
    keys(s.customer, ['ownerId', 'enterpriseCode']) && ownerId(s.customer.ownerId) && identifier(s.customer.enterpriseCode) &&
    ['priceSourceSha256', 'campaignSourceSha256', 'outletSourceSha256'].every(k => /^[a-f0-9]{64}$/.test(s[k] || '')),
  'REVIEWED_LOCAL_SELECTION_REQUIRED');
  check(keys(s.payment, ['paymentMethod', 'walletCode', 'programCode', 'rewardTypeCode', 'rewardCurrency']) &&
    s.payment.paymentMethod === 'LOYALTY_REWARD' && s.payment.rewardCurrency === 'POINTS' &&
    ['walletCode', 'programCode', 'rewardTypeCode'].every(k => identifier(s.payment[k])), 'POINTS_PAYMENT_REQUIRED');
  check(s.expectedMonetaryCount === 9 && s.approvedUnitsPerCampaign === 100 &&
    Array.isArray(s.monetaryCases) && s.monetaryCases.length === 9 && Array.isArray(s.approvedCampaignCodes) &&
    s.approvedCampaignCodes.length === 9 && s.approvedCampaignCodes.every(identifier) &&
    new Set(s.approvedCampaignCodes).size === 9, 'EXACT_NINE_MONETARY_CASES_REQUIRED');
  const caseKeys = ['caseCode', 'productCode', 'sku', 'promotionCode', 'expectedTotal', 'issuerEnterpriseCode', 'outletStoreCode',
    'staffSessionKey', 'outletCustomerSessionKey', 'ledgerSessionKey', 'outletProductCode', 'outletSku', 'outletJurisdiction',
    'benefitCurrency', 'expectedSubtotal', 'expectedDiscount', 'expectedNet', 'expectedBudgetLimit'];
  for (const c of s.monetaryCases) {
    check(keys(c, caseKeys) && caseKeys.every(k => k.startsWith('expected') ? amount(c[k]) : identifier(c[k])) &&
      s.runCode.length + c.caseCode.length <= 50 && s.approvedCampaignCodes.includes(c.promotionCode) && c.benefitCurrency === 'AED' &&
      exact.compare(c.expectedTotal, '0') > 0 && exact.compare(c.expectedDiscount, '0') > 0 &&
      sameAmount(exact.add(c.expectedDiscount, c.expectedNet), c.expectedSubtotal) &&
      exact.compare(c.expectedBudgetLimit, c.expectedDiscount) >= 0, 'REVIEWED_MONETARY_CASE_REQUIRED');
  }
  for (const k of ['caseCode', 'productCode', 'sku', 'promotionCode'])
    check(new Set(s.monetaryCases.map(c => c[k])).size === 9, 'DUPLICATE_MONETARY_CASE');
  // A handle always names one original enterprise. A caller cannot reuse it to rewrite that actor's scope.
  const roles = new Map([['customer', s.customer.enterpriseCode]]);
  for (const c of s.monetaryCases) for (const k of ['staffSessionKey', 'outletCustomerSessionKey', 'ledgerSessionKey']) {
    check(!roles.has(c[k]) || roles.get(c[k]) === c.issuerEnterpriseCode, 'SESSION_SCOPE_CONFLICT');
    roles.set(c[k], c.issuerEnterpriseCode);
  }
  return { s, baseUrl: url.origin, roles };
}

/**
 * Plans without HTTP, credentials or journal writes; execute requires confirmationHash equal to the returned planHash.
 * selection uses the ITEM helper's buyer/POINTS context plus exactly nine monetaryCases. Each case supplies stored
 * coupon Product/SKU/Promotion, expectedTotal (POINTS), issuer/outlet, original staffSessionKey,
 * outletCustomerSessionKey (same purchaser, genuine issuer scope), ledgerSessionKey (issuer employee), outlet Product/SKU,
 * outletJurisdiction, benefitCurrency AED and exact expectedSubtotal/Discount/Net/BudgetLimit decimal strings.
 * Source hashes are caller-reviewed provenance, never qualification. No owner configuration is changed.
 * sessions map handles to {authorization, enterpriseCode}; fundingObservation matches the ITEM helper contract.
 * saveCheckpoint must resolve after atomic durability. Supply its original checkpoint on every resume and preserve runCode.
 * Optional beforeRequest awaits host pacing on fixed route metadata before the transport timeout; it grants no retry authority.
 * Every row retains commands (original Cart/entry/calculation/Order/key/reference IDs), baseline budget digest and exact priced
 * snapshot. Original bearer values, revealed tokens and validation capabilities stay in memory and never enter checkpoints.
 * Ledger budget totals are the existing Promotion analytics projection, not a read of private counter/admission proofs.
 * Success proves observed native HTTP evidence only: no AED payment, physical delivery, POS settlement or used-benefit refund.
 */
export async function runMonetaryCouponJourneyHttpAcceptance(options = {}) {
  const { s, baseUrl, roles } = reviewed(options);
  const planHash = hash({ baseUrl, selection: s });
  const plan = { contractVersion: 1, state: 'PLANNED', planHash, currency: 'POINTS',
    requiredAvailable: s.monetaryCases.reduce((sum, c) => exact.add(sum, c.expectedTotal), '0'),
    prerequisites: [...prerequisites], selectors: s.monetaryCases.map(c => ({ ...c, ...identities(s, c) })),
    realMoneyPaymentExecuted: false, redeemedBenefitReversalsExecuted: false };
  if (options.execute !== true) return plan;
  check(options.confirmationHash === planHash && typeof options.saveCheckpoint === 'function', 'EXACT_PLAN_CONFIRMATION_AND_DURABLE_CHECKPOINT_REQUIRED');
  const actors = new Map();
  for (const [key, enterprise] of roles) {
    const session = options.sessions?.[key];
    check(keys(session, ['authorization', 'enterpriseCode']) && session.enterpriseCode === enterprise &&
      /^Bearer [^\s]{1,16384}$/i.test(session.authorization || ''), 'ORIGINAL_SESSION_REQUIRED');
    actors.set(key, { ...session });
  }
  const funding = options.fundingObservation;
  check(keys(funding, ['available', 'observedAt', 'walletCode', 'ownerId', 'enterpriseCode', 'programCode', 'rewardTypeCode']) &&
    amount(funding.available) && funding.walletCode === s.payment.walletCode && funding.ownerId === s.customer.ownerId &&
    funding.enterpriseCode === s.customer.enterpriseCode && funding.programCode === s.payment.programCode &&
    funding.rewardTypeCode === s.payment.rewardTypeCode && Number.isFinite(Date.parse(funding.observedAt)) &&
    Date.parse(funding.observedAt) <= Date.now() && Date.parse(funding.observedAt) >= Date.now() - 60000,
  'FRESH_OWNER_FUNDING_OBSERVATION_REQUIRED');
  const checkpoint = options.checkpoint ? structuredClone(options.checkpoint) : { contractVersion: 1, planHash, cases: {} };
  check(keys(checkpoint, ['contractVersion', 'planHash', 'cases']) && checkpoint.contractVersion === 1 && checkpoint.planHash === planHash &&
    keys(checkpoint.cases, s.monetaryCases.map(c => c.caseCode)), 'CHECKPOINT_SELECTION_MISMATCH');
  const cartStates = ['CREATE_PENDING', 'ENTRY_PENDING', 'READY'];
  for (const [caseCode, row] of Object.entries(checkpoint.cases)) {
    const c = s.monetaryCases.find(c => c.caseCode === caseCode), original = identities(s, c);
    check(keys(row, ['commands', 'purchaseCart', 'purchase', 'outletCart', 'entitlementCode', 'couponCode', 'baseline', 'benefit', 'redemption',
      'receiptCode', 'ledgerCode']) &&
      keys(row.commands, Object.keys(original)) && hash(row.commands) === hash(original) &&
      ['purchaseCart', 'outletCart'].every(k => row[k] === undefined || cartStates.includes(row[k])) &&
      (row.purchase === undefined || ['CHECKOUT_PENDING', 'PURCHASED'].includes(row.purchase)) &&
      (row.redemption === undefined || ['CONFIRM_PENDING', 'REPLAY_PENDING', 'COMPLETED'].includes(row.redemption)) &&
      ['entitlementCode', 'couponCode', 'receiptCode', 'ledgerCode'].every(k => row[k] === undefined || ownerId(row[k])) &&
      (row.baseline === undefined || keys(row.baseline, ['hash', 'committed', 'released', 'exposure']) &&
        /^[a-f0-9]{64}$/.test(row.baseline.hash || '') && ['committed', 'released', 'exposure'].every(k => amount(row.baseline[k]))) &&
      (row.benefit === undefined || keys(row.benefit, ['sourceReference', 'sourceHash', 'sourceRevision', 'storeCode', 'storeRevision',
        'currency', 'subtotalAmount', 'discountAmount']) && /^[a-f0-9]{64}$/.test(row.benefit.sourceHash || '') &&
        /^CART:[A-Za-z0-9_.-]{1,114}$/.test(row.benefit.sourceReference || '') && identifier(row.benefit.storeCode) &&
        revision(row.benefit.sourceRevision) && revision(row.benefit.storeRevision) && row.benefit.storeRevision > 0 &&
        row.benefit.currency === 'AED' && amount(row.benefit.subtotalAmount) && amount(row.benefit.discountAmount)), 'CHECKPOINT_CASE_INVALID');
    check(!row.purchase || row.purchaseCart === 'READY', 'CHECKPOINT_PURCHASE_INVALID');
    check(!row.redemption || row.purchase === 'PURCHASED' && row.outletCart === 'READY' && row.benefit && row.baseline &&
      row.entitlementCode && row.couponCode, 'CHECKPOINT_CONFIRMATION_INVALID');
  }
  const requiredAvailable = s.monetaryCases.filter(c => !checkpoint.cases[c.caseCode]?.purchase)
    .reduce((sum, c) => exact.add(sum, c.expectedTotal), '0');
  if (exact.compare(funding.available, requiredAvailable) < 0) return { contractVersion: 1, state: 'FUNDING_REQUIRED', planHash,
    currency: 'POINTS', requiredAvailable, available: funding.available, shortfall: exact.add(requiredAvailable, '-' + funding.available),
    checkpoint: structuredClone(checkpoint) };
  const fetchRequest = options.fetch || globalThis.fetch;
  const save = async () => { await options.saveCheckpoint(structuredClone(checkpoint)); };
  const encoded = encodeURIComponent;
  let stage = 'PREFLIGHT';
  async function http(actorKey, module, route, method = 'GET', body, key) {
    stage = module + ':' + method;
    const actor = actors.get(actorKey);
    if (options.beforeRequest !== undefined) {
      try {
        check(typeof options.beforeRequest === 'function', 'REQUEST_PACING_UNCONFIRMED');
        await options.beforeRequest(Object.freeze({ module, route: route.split('?')[0], method }));
      } catch { check(false, 'REQUEST_PACING_UNCONFIRMED'); }
    }
    let response;
    try {
      response = await fetchRequest(new URL('/nodics/' + module + '/v0' + route, baseUrl), {
        method, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(30000),
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', tenant: s.tenant,
          'x-enterprise-code': actor.enterpriseCode, Authorization: actor.authorization,
          'x-correlation-id': s.runCode, ...(key ? { 'Idempotency-Key': key } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch { check(false, 'HTTP_OUTCOME_UNCONFIRMED'); }
    check(response.ok, 'OWNER_HTTP_REFUSED');
    if (module === 'digitalCore' && route.startsWith('/merchant/') && method === 'POST')
      check(/(?:^|,)\s*no-store(?:\s|,|$)/i.test(response.headers.get('cache-control') || ''), 'PRIVATE_MERCHANT_RESPONSE_REQUIRED');
    let value;
    try { value = couponJourneyData(await response.json()); } catch { check(false, 'OWNER_RESPONSE_REFUSED'); }
    return { value, response };
  }
  const get = async (...args) => (await http(...args)).value;

  function cartEvidence(value, c, id, outlet) {
    const cart = value.cart, cartCode = outlet ? id.outletCart : id.purchaseCart, entryCode = outlet ? id.outletEntry : id.purchaseEntry;
    check(cart?.code === cartCode && cart.tenant === s.tenant && cart.ownerId === s.customer.ownerId &&
      cart.enterpriseCode === (outlet ? c.issuerEnterpriseCode : s.customer.enterpriseCode) &&
      cart.storeCode === (outlet ? c.outletStoreCode : s.storeCode) && cart.currency === (outlet ? c.benefitCurrency : s.currency) &&
      ['ACTIVE', 'CALCULATED'].includes(cart.status) && revision(cart.revision) && Array.isArray(value.entries), 'CART_BINDING_MISMATCH');
    check(value.entries.length <= 1 && value.entries.every(e => e.code === entryCode &&
      e.productCode === (outlet ? c.outletProductCode : c.productCode) && e.sku === (outlet ? c.outletSku : c.sku) &&
      String(e.quantity) === '1' && !e.variantCode && !e.priceQuoteCode), 'CART_ENTRY_MISMATCH');
    return cart;
  }
  async function basket(c, row, id, outlet) {
    const state = outlet ? 'outletCart' : 'purchaseCart', actor = outlet ? c.outletCustomerSessionKey : 'customer';
    const code = outlet ? id.outletCart : id.purchaseCart;
    if (!row[state]) {
      row[state] = 'CREATE_PENDING'; await save();
      await get(actor, 'cart', '/carts', 'POST', { cartCode: code, storeCode: outlet ? c.outletStoreCode : s.storeCode,
        channelCode: s.channelCode, locale: s.locale, jurisdiction: outlet ? c.outletJurisdiction : s.jurisdiction,
        currency: outlet ? c.benefitCurrency : s.currency });
    }
    let read = await get(actor, 'cart', '/carts/' + encoded(code));
    cartEvidence(read, c, id, outlet);
    if (!read.entries.length) {
      check(row[state] === 'CREATE_PENDING', 'CART_ENTRY_RECOVERY_REQUIRED');
      row[state] = 'ENTRY_PENDING'; await save();
      await get(actor, 'cart', '/carts/' + encoded(code) + '/entries', 'POST', {
        entryCode: outlet ? id.outletEntry : id.purchaseEntry, productCode: outlet ? c.outletProductCode : c.productCode,
        sku: outlet ? c.outletSku : c.sku, quantity: '1' });
      read = await get(actor, 'cart', '/carts/' + encoded(code));
      cartEvidence(read, c, id, outlet);
    }
    check(read.entries.length === 1, 'EXACT_CART_ENTRY_REQUIRED');
    row[state] = 'READY'; await save();
    const calculation = await get(actor, 'cart', '/carts/' + encoded(code) + '/calculations', 'POST', {
      expectedRevision: read.cart.revision, calculationCode: outlet ? id.outletCalculation : id.purchaseCalculation });
    check(calculation.cartCode === code && calculation.tenant === s.tenant && calculation.enterpriseCode === read.cart.enterpriseCode &&
      calculation.currency === read.cart.currency && sameAmount(calculation.totalAmount, outlet ? c.expectedSubtotal : c.expectedTotal) &&
      Array.isArray(calculation.entries) && calculation.entries.length === 1 &&
      calculation.entries[0].code === (outlet ? id.outletEntry : id.purchaseEntry) &&
      calculation.entries[0].productCode === (outlet ? c.outletProductCode : c.productCode) &&
      calculation.entries[0].sku === (outlet ? c.outletSku : c.sku) && String(calculation.entries[0].quantity) === '1', 'REVIEWED_CART_PRICE_MISMATCH');
    if (outlet) check(sameAmount(calculation.subtotal, c.expectedSubtotal) && sameAmount(calculation.taxAmount, '0') &&
      sameAmount(calculation.discountAmount, '0'), 'FICTIONAL_ZERO_TAX_BASKET_REQUIRED');
    return read.cart;
  }
  async function entitlement(c, row, id) {
    const value = await get('customer', 'digitalCore', '/entitlements?orderCode=' + encoded(id.order));
    check(Array.isArray(value.entitlements) && value.entitlements.length === 1, 'EXACT_ENTITLEMENT_REQUIRED');
    const e = value.entitlements[0];
    check((e.tenant === undefined || e.tenant === s.tenant) && e.ownerId === s.customer.ownerId && e.enterpriseCode === s.customer.enterpriseCode &&
      e.orderCode === id.order && e.cartCode === id.purchaseCart && e.orderEntryCode === id.purchaseEntry &&
      e.productCode === c.productCode && e.sku === c.sku && e.providerOwner === 'promotion' && e.digitalDeliveryType === 'COUPON_CODE' &&
      e.evidence?.promotionCode === c.promotionCode && ownerId(e.code) && ownerId(e.providerCode) && revision(e.revision) &&
      (!row.entitlementCode || row.entitlementCode === e.code) && (!row.couponCode || row.couponCode === e.providerCode), 'PURCHASE_BINDING_MISMATCH');
    return e;
  }
  async function purchase(c, row, id) {
    if (!row.purchase) {
      const cart = await basket(c, row, id, false);
      row.purchase = 'CHECKOUT_PENDING'; await save();
      await get('customer', 'checkoutCore', '/checkouts/place', 'POST', { cartCode: id.purchaseCart, orderCode: id.order,
        expectedCartRevision: cart.revision, calculationCode: id.purchaseCalculation, ...s.payment }, id.purchaseKey);
    }
    const status = await get('customer', 'checkoutCore', '/checkouts/' + encoded(id.order));
    check(status.code === id.order && status.status === 'COMPLETED' && status.evidence?.orderCode === id.order &&
      ['PAYMENT_CAPTURED', 'DIGITAL_SOLD', 'DIGITAL_DELIVERED'].every(step => status.evidence.completed?.includes(step)), 'CHECKOUT_RECOVERY_REQUIRED');
    const { order } = await get('customer', 'order', '/orders/' + encoded(id.order));
    check(order?.code === id.order && order.cartCode === id.purchaseCart && order.ownerId === s.customer.ownerId &&
      order.enterpriseCode === s.customer.enterpriseCode && order.currency === s.currency && order.evidence?.storeCode === s.storeCode &&
      sameAmount(order.totalAmount, c.expectedTotal) && !['REFUNDED', 'CANCELLED', 'FAILED'].includes(order.status), 'ORDER_BINDING_MISMATCH');
    const e = await entitlement(c, row, id);
    check(row.redemption ? (e.status === 'ACTIVE' && ['UNCLAIMED', 'CLAIMED'].includes(e.claimStatus) ||
      e.status === 'REDEEMED' && e.claimStatus === 'REDEEMED') :
      e.status === 'ACTIVE' && e.claimStatus === 'UNCLAIMED' && !e.evidence.merchantRedemption, 'ORIGINAL_COUPON_STATE_REQUIRED');
    row.purchase = 'PURCHASED'; row.entitlementCode = e.code; row.couponCode = e.providerCode; await save();
    return e;
  }
  function benefitEvidence(benefit, c, id, cartRevision) {
    check(benefit?.sourceStage === 'PRICED_CART' && benefit.sourceReference === id.sourceReference &&
      /^[a-f0-9]{64}$/.test(benefit.sourceHash || '') && revision(benefit.sourceRevision) &&
      (cartRevision === undefined || benefit.sourceRevision === cartRevision) && benefit.storeCode === c.outletStoreCode &&
      revision(benefit.storeRevision) && benefit.storeRevision > 0 && benefit.currency === c.benefitCurrency &&
      sameAmount(benefit.subtotalAmount, c.expectedSubtotal) && sameAmount(benefit.discountAmount, c.expectedDiscount) &&
      sameAmount(exact.add(benefit.subtotalAmount, '-' + benefit.discountAmount), c.expectedNet) &&
      benefit.simulated !== true && benefit.items === undefined && benefit.deliveredAt === undefined, 'EXACT_PRICED_BENEFIT_REQUIRED');
    return { sourceReference: benefit.sourceReference, sourceHash: benefit.sourceHash, sourceRevision: benefit.sourceRevision,
      storeCode: benefit.storeCode, storeRevision: benefit.storeRevision, currency: benefit.currency,
      subtotalAmount: exact.normalize(benefit.subtotalAmount), discountAmount: exact.normalize(benefit.discountAmount) };
  }
  async function accounting(c) {
    const route = '/promotions/' + encoded(c.promotionCode);
    const ledger = await get(c.ledgerSessionKey, 'promotion', route + '/budget-ledger?pageSize=100');
    const analytics = await get(c.ledgerSessionKey, 'promotion', route + '/analytics');
    const completeness = ledger.completeness;
    check(ledger.promotionCode === c.promotionCode && Array.isArray(ledger.entries) && ledger.entries.length < 100 &&
      keys(completeness, ['contractVersion', 'tenant', 'enterpriseCode', 'promotionCode', 'totalCount', 'returnedCount',
        'pageNumber', 'pageSize', 'complete']) && completeness.contractVersion === 1 && completeness.tenant === s.tenant &&
      completeness.enterpriseCode === c.issuerEnterpriseCode && completeness.promotionCode === c.promotionCode &&
      completeness.complete === true && completeness.pageNumber === 1 && completeness.pageSize === 100 &&
      revision(completeness.totalCount) && revision(completeness.returnedCount) &&
      completeness.totalCount === ledger.entries.length && completeness.returnedCount === ledger.entries.length &&
      new Set(ledger.entries.map(e => e.code)).size === ledger.entries.length && analytics.promotionCode === c.promotionCode,
    'BOUNDED_BUDGET_READ_REQUIRED');
    const entries = ledger.entries.map(e => {
      check(ownerId(e.code) && e.tenant === s.tenant && e.enterpriseCode === c.issuerEnterpriseCode && e.promotionCode === c.promotionCode &&
        ['COMMIT', 'RELEASE'].includes(e.mutationType) && amount(e.amount) && amount(e.beforeSpent) && amount(e.afterSpent) &&
        ownerId(e.targetCode) && ownerId(e.idempotencyKey) && sameAmount(e.afterSpent,
          exact.add(e.beforeSpent, (e.mutationType === 'COMMIT' ? '' : '-') + e.amount)), 'LEDGER_EVIDENCE_INVALID');
      return { code: e.code, mutationType: e.mutationType, amount: exact.normalize(e.amount), beforeSpent: exact.normalize(e.beforeSpent),
        afterSpent: exact.normalize(e.afterSpent), targetCode: e.targetCode, idempotencyKey: e.idempotencyKey };
    }).sort((a, b) => a.code.localeCompare(b.code));
    const sum = type => entries.filter(e => e.mutationType === type).reduce((total, e) => exact.add(total, e.amount), '0');
    const committed = sum('COMMIT'), released = sum('RELEASE'), exposure = exact.add(committed, '-' + released);
    check(sameAmount(analytics.budgetCommitted, committed) && sameAmount(analytics.budgetReleased, released) &&
      sameAmount(analytics.budgetExposure, exposure) && exact.compare(exposure, c.expectedBudgetLimit) <= 0, 'BUDGET_LEDGER_READBACK_MISMATCH');
    return { entries, summary: { hash: hash(entries), committed, released, exposure } };
  }
  async function receipt(c, id, e) {
    const value = await get(c.staffSessionKey, 'digitalCore', '/merchant/redemptions/' + encoded(e.code) + '/receipt/query', 'POST',
      { storeCode: c.outletStoreCode, merchantReceiptReference: id.sourceReference }, id.confirmationKey);
    check(value.state === 'COMPLETED' && value.entitlementCode === e.code && value.confirmationKey === id.confirmationKey &&
      value.merchantReceiptReference === id.sourceReference && value.merchantCode === c.issuerEnterpriseCode &&
      value.mode === 'MERCHANT_SCREEN' && value.storeCode === c.outletStoreCode && ownerId(value.receiptCode) &&
      revision(value.storeRevision) && value.storeRevision > 0 && value.simulated !== true, 'ORIGINAL_RECEIPT_REQUIRED');
    return { entitlementCode: e.code, receiptCode: value.receiptCode, confirmationKey: value.confirmationKey,
      merchantReceiptReference: value.merchantReceiptReference, merchantCode: value.merchantCode,
      storeCode: value.storeCode, storeRevision: value.storeRevision, mode: value.mode };
  }
  async function completed(c, row, id) {
    const e = await entitlement(c, row, id), marker = e.evidence?.merchantRedemption;
    check(e.status === 'REDEEMED' && e.claimStatus === 'REDEEMED' && marker?.confirmationKey === id.confirmationKey &&
      marker.merchantReceiptReference === id.sourceReference && marker.merchantCode === c.issuerEnterpriseCode &&
      marker.mode === 'MERCHANT_SCREEN' && marker.storeRef?.code === c.outletStoreCode && ownerId(marker.code) &&
      hash(benefitEvidence(marker.pricedBenefit, c, id)) === hash(row.benefit), 'ORIGINAL_REDEEMED_EVIDENCE_REQUIRED');
    const received = await receipt(c, id, e);
    check(received.receiptCode === marker.receiptCode && received.storeRevision === row.benefit.storeRevision &&
      (!row.receiptCode || row.receiptCode === received.receiptCode), 'RECEIPT_BINDING_MISMATCH');
    const read = await accounting(c), matching = read.entries.filter(entry => entry.targetCode === marker.code || entry.idempotencyKey === marker.code);
    // Reuse only the owners' pure identity functions. No private budget read or mutation is invoked.
    const ledgerCode = budgetIdentityOwner.code.call({ fingerprint: publicationIdentityOwner.fingerprint }, {
      contractVersion: 2, tenant: s.tenant, enterpriseCode: c.issuerEnterpriseCode, mutationType: 'COMMIT',
      vendorEnterpriseCode: s.customer.enterpriseCode, couponCode: e.providerCode });
    check(matching.length === 1 && matching[0].code === ledgerCode && matching[0].mutationType === 'COMMIT' && matching[0].targetCode === marker.code &&
      matching[0].idempotencyKey === marker.code && sameAmount(matching[0].amount, c.expectedDiscount) &&
      sameAmount(matching[0].beforeSpent, row.baseline.exposure) && sameAmount(matching[0].afterSpent,
        exact.add(row.baseline.exposure, c.expectedDiscount)) && (!row.ledgerCode || row.ledgerCode === matching[0].code), 'EXACT_ORIGINAL_BUDGET_COMMIT_REQUIRED');
    const prior = read.entries.filter(entry => entry.code !== matching[0].code);
    check(hash(prior) === row.baseline.hash && sameAmount(read.summary.committed, exact.add(row.baseline.committed, c.expectedDiscount)) &&
      sameAmount(read.summary.released, row.baseline.released) && sameAmount(read.summary.exposure, exact.add(row.baseline.exposure, c.expectedDiscount)),
    'SINGLE_BUDGET_DELTA_REQUIRED');
    return { receipt: received, ledgerCode: matching[0].code, accountingHash: hash(read) };
  }
  async function redeem(c, row, id, e) {
    if (row.redemption === 'COMPLETED') { await completed(c, row, id); return; }
    if (row.redemption === 'REPLAY_PENDING') {
      await completed(c, row, id);
    } else if (row.redemption === 'CONFIRM_PENDING') {
      const marker = e.evidence?.merchantRedemption;
      check(marker?.confirmationKey === id.confirmationKey && marker.merchantReceiptReference === id.sourceReference &&
        marker.storeRef?.code === c.outletStoreCode && marker.merchantCode === c.issuerEnterpriseCode &&
        hash(benefitEvidence(marker.pricedBenefit, c, id)) === hash(row.benefit), 'ORIGINAL_CONFIRMATION_RECOVERY_REQUIRED');
      if (e.claimStatus !== 'REDEEMED') {
        check(options.resumePending === true, 'EXPLICIT_ORIGINAL_CONFIRMATION_RESUME_REQUIRED');
        await get(c.staffSessionKey, 'digitalCore', '/merchant/redemptions/' + encoded(e.code) + '/confirm', 'POST',
          { confirmed: true, storeCode: c.outletStoreCode, merchantReceiptReference: id.sourceReference }, id.confirmationKey);
      }
    } else {
      const cart = await basket(c, row, id, true);
      const { value, response } = await http('customer', 'digitalCore', '/entitlements/' + encoded(e.code) + '/reveal', 'POST', {});
      check(/(?:^|,)\s*no-store(?:\s|,|$)/i.test(response.headers.get('cache-control') || '') && value.status === 'REVEALED' &&
        value.couponCode === e.providerCode && value.tokenSource === 'AUTHENTICATED_RETENTION' && typeof value.token === 'string' &&
        value.token.length >= 4 && value.token.length <= 256, 'PRIVATE_REVEAL_UNCONFIRMED');
      const validated = await get(c.staffSessionKey, 'digitalCore', '/merchant/redemptions/validate', 'POST', {
        couponToken: value.token, storeCode: c.outletStoreCode, merchantReceiptReference: id.sourceReference });
      check(validated.eligible === true && validated.entitlementCode === e.code && validated.productCode === c.productCode &&
        validated.merchantCode === c.issuerEnterpriseCode && validated.mode === 'MERCHANT_SCREEN' && validated.storeCode === c.outletStoreCode &&
        validated.revision === e.revision && typeof validated.validationCode === 'string' && validated.validationCode.length <= 1024 &&
        validated.validationCode.length > 0 && Date.parse(validated.validationExpiresAt) > Date.now(), 'MONETARY_VALIDATION_REQUIRED');
      const benefit = benefitEvidence(validated.conditions?.benefit, c, id, cart.revision);
      check(validated.storeRevision === benefit.storeRevision && hash((await accounting(c)).summary) === hash(row.baseline), 'PRECONFIRMATION_BUDGET_DRIFT');
      row.benefit = benefit; row.redemption = 'CONFIRM_PENDING'; await save();
      await get(c.staffSessionKey, 'digitalCore', '/merchant/redemptions/' + encoded(e.code) + '/confirm', 'POST', {
        confirmed: true, storeCode: c.outletStoreCode, merchantReceiptReference: id.sourceReference,
        expectedRevision: validated.revision, validationCode: validated.validationCode, validationExpiresAt: validated.validationExpiresAt }, id.confirmationKey);
    }
    const before = await completed(c, row, id);
    row.receiptCode = before.receipt.receiptCode; row.ledgerCode = before.ledgerCode; row.redemption = 'REPLAY_PENDING'; await save();
    await get(c.staffSessionKey, 'digitalCore', '/merchant/redemptions/' + encoded(e.code) + '/confirm', 'POST', {
      confirmed: true, storeCode: c.outletStoreCode, merchantReceiptReference: id.sourceReference }, id.confirmationKey);
    check(hash(await completed(c, row, id)) === hash(before), 'REPLAY_CHANGED_ORIGINAL_EVIDENCE');
    row.redemption = 'COMPLETED'; await save();
  }
  try {
    // Read every independent outlet/accounting prerequisite before the first purchase mutation.
    for (const c of s.monetaryCases) {
      const workspace = await get(c.staffSessionKey, 'digitalCore', '/merchant/redemptions/workspace');
      check(workspace.storeRequired === true && Array.isArray(workspace.stores) && workspace.stores.filter(store =>
        store.code === c.outletStoreCode).length === 1, 'EXACT_OUTLET_ADMISSION_REQUIRED');
      const read = await accounting(c), row = checkpoint.cases[c.caseCode] ||= { commands: identities(s, c) };
      if (!row.baseline) {
        check(!row.purchase && !row.redemption && exact.compare(exact.add(read.summary.exposure, c.expectedDiscount), c.expectedBudgetLimit) <= 0,
          'BUDGET_CAPACITY_REQUIRED');
        row.baseline = read.summary;
      } else if (!row.redemption) check(hash(row.baseline) === hash(read.summary), 'ORIGINAL_BUDGET_BASELINE_CHANGED');
    }
    await save();
    for (const c of s.monetaryCases) {
      const row = checkpoint.cases[c.caseCode], id = identities(s, c);
      const e = await purchase(c, row, id);
      await redeem(c, row, id, e);
    }
    return { contractVersion: 1, state: 'PASSED', planHash, monetaryCasesCompleted: 9,
      evidenceStage: 'PRICED_CART', budgetEvidence: 'PROMOTION_LEDGER_AND_ANALYTICS', deliveryVerified: false,
      externalPosSettlementVerified: false, realMoneyPaymentExecuted: false, redeemedBenefitReversalsExecuted: false,
      checkpoint: structuredClone(checkpoint) };
  } catch (error) {
    return { contractVersion: 1, state: 'RECOVERY_REQUIRED', planHash, stage,
      reasonCode: error instanceof EvidenceError ? error.message : 'OWNER_OUTCOME_UNCONFIRMED', checkpoint: structuredClone(checkpoint) };
  }
}
