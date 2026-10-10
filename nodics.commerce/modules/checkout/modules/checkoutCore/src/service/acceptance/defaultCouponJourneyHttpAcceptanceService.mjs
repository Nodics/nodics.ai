/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module checkoutCore/acceptance/defaultCouponJourneyHttpAcceptanceService
 * @description Explicit LOCAL coupon purchase, private reveal, simulated ITEM redemption and unused refund through normal HTTP owners. No bootstrap, identity provisioning, data installation or qualification selection.
 * @layer tooling @owner checkoutCore
 */
import { createHash } from 'node:crypto';
import exact from '../../../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService.js';

const identifier = value => typeof value === 'string' && /^[A-Za-z0-9_.:@-]{1,128}$/.test(value);
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const requireEvidence = (condition, code) => { if (!condition) throw Object.assign(new Error(code), { code }); };
const exactKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every(key => keys.includes(key));
const amount = value => typeof value === 'string' && /^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/.test(value);
const equalAmount = (a, b) => amount(a) && amount(b) && exact.compare(a, b) === 0;

/** Unwraps bounded success envelopes without printing response bodies or accepting contradictory envelopes. */
export function couponJourneyData(value) {
  for (let i = 0; i < 8; i++) {
    requireEvidence(value && typeof value === 'object' && !value.error && value.success !== false &&
      !(typeof value.code === 'string' && value.code.startsWith('ERR_')), 'OWNER_RESPONSE_REFUSED');
    const data = Object.hasOwn(value, 'data'), result = Object.hasOwn(value, 'result');
    requireEvidence(!(data && result), 'OWNER_RESPONSE_AMBIGUOUS');
    if (!data && !result) return value;
    value = data ? value.data : value.result;
  }
  requireEvidence(false, 'OWNER_RESPONSE_DEPTH');
}

/** Validates caller-reviewed selection and fresh session handles before any network or journal write. */
function selectionOf(options) {
  requireEvidence(options.execute === true && typeof options.saveCheckpoint === 'function', 'EXPLICIT_EXECUTION_AND_DURABLE_CHECKPOINT_REQUIRED');
  const url = new URL(options.baseUrl);
  requireEvidence(['http:', 'https:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
    !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash, 'LOCAL_HTTP_TARGET_REQUIRED');
  const s = structuredClone(options.selection);
  requireEvidence(exactKeys(s, ['contractVersion', 'approvalReference', 'localDemo', 'privateCaptureQualified', 'tenant', 'runCode',
    'customer', 'storeCode', 'channelCode', 'locale', 'jurisdiction', 'currency', 'payment', 'approvedCampaignCodes',
    'approvedUnitsPerCampaign', 'expectedCampaignCount', 'expectedItemCount', 'priceSourceSha256', 'campaignSourceSha256',
    'itemCases', 'refundCase', 'refundReview', 'allowRedeemedBenefitReversal']) &&
    s.contractVersion === 1 && s.localDemo === true && s.privateCaptureQualified === true && s.allowRedeemedBenefitReversal === false &&
    identifier(s.approvalReference) && identifier(s.tenant) && identifier(s.runCode) && s.runCode.length <= 60 &&
    ['storeCode', 'channelCode', 'locale', 'jurisdiction', 'currency'].every(key => identifier(s[key])) &&
    [s.priceSourceSha256, s.campaignSourceSha256].every(value => /^[a-f0-9]{64}$/.test(value || '')) &&
    exactKeys(s.customer, ['ownerId', 'enterpriseCode']) && identifier(s.customer.ownerId) && identifier(s.customer.enterpriseCode), 'REVIEWED_LOCAL_SELECTION_REQUIRED');
  requireEvidence(Number.isSafeInteger(s.expectedCampaignCount) && s.expectedCampaignCount > 0 && s.expectedCampaignCount <= 50 &&
    Array.isArray(s.approvedCampaignCodes) && s.approvedCampaignCodes.length === s.expectedCampaignCount &&
    s.approvedCampaignCodes.every(identifier) && new Set(s.approvedCampaignCodes).size === s.expectedCampaignCount &&
    Number.isSafeInteger(s.approvedUnitsPerCampaign) && s.approvedUnitsPerCampaign > 0 && s.approvedUnitsPerCampaign <= 100 &&
    Number.isSafeInteger(s.expectedItemCount) && s.expectedItemCount > 0 && s.expectedItemCount <= 50 &&
    Array.isArray(s.itemCases) && s.itemCases.length === s.expectedItemCount, 'REVIEWED_CAMPAIGN_ITEM_SELECTION_REQUIRED');
  requireEvidence(exactKeys(s.payment, ['paymentMethod', 'walletCode', 'programCode', 'rewardTypeCode', 'rewardCurrency']) &&
    s.payment.paymentMethod === 'LOYALTY_REWARD' && s.payment.rewardCurrency === s.currency &&
    ['walletCode', 'programCode', 'rewardTypeCode'].every(key => identifier(s.payment[key])), 'REVIEWED_POINTS_PAYMENT_REQUIRED');
  const keys = ['caseCode', 'productCode', 'sku', 'promotionCode', 'expectedTotal', 'issuerEnterpriseCode', 'outletStoreCode', 'staffSessionKey', 'items'];
  for (const c of [...s.itemCases, s.refundCase]) {
    requireEvidence(exactKeys(c, keys) && ['caseCode', 'productCode', 'sku', 'promotionCode'].every(key => identifier(c[key])) &&
      c.caseCode.length <= 40 && s.runCode.length + c.caseCode.length <= 50 && s.approvedCampaignCodes.includes(c.promotionCode) && amount(c.expectedTotal) &&
      !/^0(?:\.0+)?$/.test(c.expectedTotal), 'REVIEWED_COUPON_CASE_REQUIRED');
  }
  requireEvidence(new Set([...s.itemCases, s.refundCase].map(c => c.caseCode)).size === s.expectedItemCount + 1 &&
    new Set(s.itemCases.map(c => c.promotionCode)).size === s.expectedItemCount && new Set(s.itemCases.map(c => c.productCode)).size === s.expectedItemCount,
  'DUPLICATE_COUPON_CASE');
  for (const c of s.itemCases) {
    requireEvidence(['issuerEnterpriseCode', 'outletStoreCode', 'staffSessionKey'].every(key => identifier(c[key])) &&
      Array.isArray(c.items) && c.items.length > 0 && c.items.length <= 20 &&
      new Set(c.items.map(item => item.sku)).size === c.items.length && c.items.every(item =>
        exactKeys(item, ['sku', 'quantity', 'unit']) && Object.keys(item).length === 3 && identifier(item.sku) &&
        Number.isSafeInteger(item.quantity) && item.quantity > 0 && item.quantity <= 100 && item.unit === 'EACH'), 'EXACT_ITEM_SELECTION_REQUIRED');
  }
  requireEvidence(exactKeys(s.refundReview, ['sessionKey', 'enterpriseCode', 'comment', 'reason']) && identifier(s.refundReview.sessionKey) &&
    s.refundReview.enterpriseCode === s.customer.enterpriseCode && ['comment', 'reason'].every(key =>
      typeof s.refundReview[key] === 'string' && s.refundReview[key].trim().length >= 10 && s.refundReview[key].length <= 2000), 'REVIEWED_UNUSED_REFUND_REQUIRED');
  const sessions = options.sessions;
  const session = (key, enterprise) => {
    const auth = sessions?.[key];
    requireEvidence(exactKeys(auth, ['authorization', 'enterpriseCode']) && auth.enterpriseCode === enterprise &&
      /^Bearer [^\s]{1,16384}$/i.test(auth.authorization || ''), 'ORIGINAL_SESSION_REQUIRED');
    return { ...auth };
  };
  const actors = { customer: session('customer', s.customer.enterpriseCode), reviewer: session(s.refundReview.sessionKey, s.refundReview.enterpriseCode), staff: {} };
  for (const c of s.itemCases) actors.staff[c.staffSessionKey] = session(c.staffSessionKey, c.issuerEnterpriseCode);
  const funding = options.fundingObservation;
  requireEvidence(exactKeys(funding, ['available', 'observedAt', 'walletCode', 'ownerId', 'enterpriseCode', 'programCode', 'rewardTypeCode']) &&
    amount(funding.available) && funding.walletCode === s.payment.walletCode && funding.ownerId === s.customer.ownerId &&
    funding.enterpriseCode === s.customer.enterpriseCode && funding.programCode === s.payment.programCode &&
    funding.rewardTypeCode === s.payment.rewardTypeCode && Number.isFinite(Date.parse(funding.observedAt)) &&
    Date.parse(funding.observedAt) <= Date.now() && Date.parse(funding.observedAt) >= Date.now() - 60000, 'FRESH_OWNER_FUNDING_OBSERVATION_REQUIRED');
  return { selection: s, actors, baseUrl: url.origin };
}

/** Executes explicit normal-owner HTTP operations. Top-level phase defaults to ALL; ITEMS_ONLY defers the unused
 * refund without changing selection/checkpoint identity and never reports full acceptance. Resume ALL with the
 * same selection and checkpoint to require the original refund. Checkpoints contain no bearer, token or capability.
 * Optional beforeRequest receives fixed route metadata and is awaited before the transport timeout, without retry authority.
 */
export async function runCouponJourneyHttpAcceptance(options = {}) {
  const { selection: s, actors, baseUrl } = selectionOf(options);
  const phase = options.phase === undefined ? 'ALL' : options.phase;
  requireEvidence(['ALL', 'ITEMS_ONLY'].includes(phase), 'ACCEPTANCE_PHASE_INVALID');
  const recoveryCommands = options.recoverPrepaymentCommands ?? [];
  requireEvidence(Array.isArray(recoveryCommands) && new Set(recoveryCommands).size === recoveryCommands.length &&
    recoveryCommands.every(command => s.itemCases.some(c => command === s.runCode + ':' + c.caseCode + ':purchase')),
    'PREPAYMENT_RECOVERY_SELECTION_INVALID');
  const selectionHash = digest({ baseUrl, selection: s });
  const checkpoint = options.checkpoint ? structuredClone(options.checkpoint) : { contractVersion: 1, selectionHash, cases: {} };
  requireEvidence(exactKeys(checkpoint, ['contractVersion', 'selectionHash', 'cases']) && checkpoint.contractVersion === 1 &&
    checkpoint.selectionHash === selectionHash && checkpoint.cases && typeof checkpoint.cases === 'object', 'CHECKPOINT_SELECTION_MISMATCH');
  const selectedCodes = [...s.itemCases, s.refundCase].map(c => c.caseCode);
  for (const [code, row] of Object.entries(checkpoint.cases)) {
    requireEvidence(selectedCodes.includes(code) && exactKeys(row, ['purchase', 'entitlementCode', 'couponCode', 'revealed', 'redemption',
      'receiptCode', 'refund', 'caseCode', 'refundCode', 'purchaseRecovery']) &&
      (row.purchase === undefined || ['CART_CREATE_PENDING', 'ENTRY_PENDING', 'ENTRY_ADDED', 'RECOVERED_CHECKOUT_READY', 'CHECKOUT_PENDING', 'PURCHASED'].includes(row.purchase)) &&
      (row.redemption === undefined || ['CONFIRM_PENDING', 'COMPLETED'].includes(row.redemption)) &&
      (row.refund === undefined || ['DISPUTE_PENDING', 'REFUND_PENDING', 'COMPLETED'].includes(row.refund)) &&
      (row.revealed === undefined || row.revealed === true) &&
      ['entitlementCode', 'couponCode', 'receiptCode', 'caseCode', 'refundCode'].every(key => row[key] === undefined ||
        typeof row[key] === 'string' && /^[A-Za-z0-9_.:@-]{1,192}$/.test(row[key])), 'CHECKPOINT_CASE_INVALID');
    const originalCommand = s.runCode + ':' + code + ':purchase', recovery = row.purchaseRecovery;
    requireEvidence(recovery === undefined || exactKeys(recovery, ['originalCommandCode', 'commandCode', 'revision']) &&
      recovery.originalCommandCode === originalCommand && recovery.commandCode === originalCommand + ':recovered:1' &&
      Number.isSafeInteger(recovery.revision) && recovery.revision > 0, 'PREPAYMENT_RECOVERY_CHECKPOINT_INVALID');
    requireEvidence(row.purchase !== 'RECOVERED_CHECKOUT_READY' || recovery !== undefined, 'PREPAYMENT_RECOVERY_CHECKPOINT_INVALID');
  }
  // Deferred refund progress is retained evidence only: this phase must not contact that purchase's owners.
  const phaseProgress = () => {
    if (phase === 'ALL') return {};
    const row = checkpoint.cases[s.refundCase.caseCode];
    return { phase, pendingRefunds: row?.refund === 'COMPLETED' ? 0 : 1,
      refundProgress: { caseCode: s.refundCase.caseCode, expectedTotal: s.refundCase.expectedTotal, currency: s.currency,
        purchaseState: row?.purchase || 'NOT_STARTED', refundState: row?.refund || 'NOT_STARTED',
        ...(row?.caseCode ? { reviewCaseCode: row.caseCode } : {}),
        evidenceSource: 'RETAINED_CHECKPOINT', ownerReadbackPerformed: false } };
  };
  // This is a caller-observed scheduling bound, not a balance grant or an owner admission substitute.
  const unpaid = c => !['PURCHASED', 'CHECKOUT_PENDING'].includes(checkpoint.cases[c.caseCode]?.purchase);
  const requiredItems = s.itemCases.filter(unpaid).reduce((total, c) => exact.add(total, c.expectedTotal), '0');
  const refundFloat = phase === 'ALL' && unpaid(s.refundCase) ? s.refundCase.expectedTotal : '0';
  const requiredAvailable = exact.compare(requiredItems, refundFloat) >= 0 ? requiredItems : refundFloat;
  if (exact.compare(options.fundingObservation.available, requiredAvailable) < 0) return {
    contractVersion: 1, state: 'FUNDING_REQUIRED', ...phaseProgress(), currency: s.currency, requiredAvailable,
    available: options.fundingObservation.available,
    shortfall: exact.add(requiredAvailable, exact.multiply(options.fundingObservation.available, '-1')),
    priceSelectionHash: digest(s.itemCases.map(c => ({ productCode: c.productCode, promotionCode: c.promotionCode, amount: c.expectedTotal }))),
    checkpoint: structuredClone(checkpoint),
  };
  const fetchRequest = options.fetch || globalThis.fetch;
  const save = async () => { await options.saveCheckpoint(structuredClone(checkpoint)); };
  let stage = 'START';
  async function http(actor, module, route, method = 'GET', body, key) {
    stage = module + ':' + method + ':' + route.split('?')[0];
    if (options.beforeRequest !== undefined) {
      try {
        requireEvidence(typeof options.beforeRequest === 'function', 'REQUEST_PACING_UNCONFIRMED');
        await options.beforeRequest(Object.freeze({ module, route: route.split('?')[0], method }));
      } catch { requireEvidence(false, 'REQUEST_PACING_UNCONFIRMED'); }
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
    } catch { requireEvidence(false, 'HTTP_OUTCOME_UNCONFIRMED'); }
    requireEvidence(response.ok, 'HTTP_' + response.status);
    let value;
    try { value = await response.json(); } catch { requireEvidence(false, 'OWNER_RESPONSE_INVALID'); }
    return { value: couponJourneyData(value), response };
  }
  const get = async (...args) => (await http(...args)).value;
  const encoded = encodeURIComponent;
  function ids(c) {
    const code = s.runCode + ':' + c.caseCode;
    return { cart: code + ':cart', entry: code + ':entry', calculation: code + ':calc', order: code + ':order',
      purchase: code + ':purchase', confirm: code + ':confirm', receipt: 'SIM:' + code,
      dispute: code + ':dispute', refund: code + ':refund' };
  }
  async function ownEntitlement(c, id, row) {
    const result = await get(actors.customer, 'digitalCore', '/entitlements?orderCode=' + encoded(id.order));
    requireEvidence(Array.isArray(result.entitlements) && result.entitlements.length === 1, 'EXACT_PURCHASE_ENTITLEMENT_REQUIRED');
    const e = result.entitlements[0];
    requireEvidence(e.orderCode === id.order && e.cartCode === id.cart && e.orderEntryCode === id.entry && e.productCode === c.productCode &&
      e.sku === c.sku && e.enterpriseCode === s.customer.enterpriseCode && e.ownerId === s.customer.ownerId &&
      e.providerOwner === 'promotion' && e.digitalDeliveryType === 'COUPON_CODE' && e.evidence?.promotionCode === c.promotionCode &&
      typeof e.code === 'string' && typeof e.providerCode === 'string' && Number.isSafeInteger(e.revision) &&
      (!row.entitlementCode || row.entitlementCode === e.code) && (!row.couponCode || row.couponCode === e.providerCode), 'PURCHASE_BINDING_MISMATCH');
    return e;
  }
  function cartMatches(value, c, id) {
    const cart = value.cart;
    requireEvidence(cart?.code === id.cart && cart.storeCode === s.storeCode && cart.currency === s.currency &&
      cart.ownerId === s.customer.ownerId && cart.enterpriseCode === s.customer.enterpriseCode && Number.isSafeInteger(cart.revision), 'CART_BINDING_MISMATCH');
    requireEvidence(Array.isArray(value.entries), 'CART_ENTRIES_REQUIRED');
    if (value.entries.length) requireEvidence(value.entries.length === 1 && value.entries[0].code === id.entry &&
      value.entries[0].productCode === c.productCode && value.entries[0].sku === c.sku && String(value.entries[0].quantity) === '1', 'CART_ENTRY_MISMATCH');
    return cart;
  }
  async function purchase(c, row, id) {
    if (row.purchase === 'PURCHASED') return ownEntitlement(c, id, row);
    async function qualifyRecovery() {
      requireEvidence(recoveryCommands.includes(id.purchase), 'PREPAYMENT_RECOVERY_SELECTION_REQUIRED');
      const recovery = await get(actors.customer, 'checkoutCore', '/checkouts/' + encoded(id.purchase) + '/compensation/recover', 'POST', {});
      requireEvidence(recovery.commandCode === id.purchase && recovery.status === 'COMPENSATED' && recovery.recoveryStatus === 'COMPLETED' &&
        recovery.recoveryType === 'PREPAYMENT_UNCERTAIN_COUPON' && recovery.cartCode === id.cart && recovery.entryCode === id.entry &&
        recovery.originalPaymentRecordCount === 0 && Number.isSafeInteger(recovery.revision) && recovery.revision > 0,
        'PREPAYMENT_RECOVERY_UNCONFIRMED');
      const status = await get(actors.customer, 'checkoutCore', '/checkouts/commands/' + encoded(id.purchase));
      requireEvidence(status.status === 'COMPENSATED' && status.revision === recovery.revision && status.originalPaymentRecordCount === 0 &&
        JSON.stringify(status.completedPhases) === JSON.stringify(['VALIDATED', 'CALCULATED', 'RESERVED']), 'PREPAYMENT_RECOVERY_UNCONFIRMED');
      return recovery;
    }
    if (row.purchase === 'CHECKOUT_PENDING') {
      const status = await get(actors.customer, 'checkoutCore', '/checkouts/' + encoded(id.order));
      if (status.status === 'NOT_COMPLETED' && recoveryCommands.includes(id.purchase) && !row.purchaseRecovery) {
        const recovery = await qualifyRecovery();
        row.purchaseRecovery = { originalCommandCode: id.purchase, commandCode: id.purchase + ':recovered:1', revision: recovery.revision };
        row.purchase = 'RECOVERED_CHECKOUT_READY'; await save();
      } else {
      requireEvidence(status.code === id.order && status.status === 'COMPLETED' && status.evidence?.orderCode === id.order &&
        ['PAYMENT_CAPTURED', 'DIGITAL_SOLD', 'DIGITAL_DELIVERED'].every(step => status.evidence.completed?.includes(step)), 'CHECKOUT_RECOVERY_REQUIRED');
      const order = await get(actors.customer, 'order', '/orders/' + encoded(id.order));
      requireEvidence(order.order?.code === id.order && order.order.cartCode === id.cart && order.order.ownerId === s.customer.ownerId &&
        order.order.enterpriseCode === s.customer.enterpriseCode && order.order.currency === s.currency &&
        order.order.evidence?.storeCode === s.storeCode && equalAmount(order.order.totalAmount, c.expectedTotal), 'ORDER_BINDING_MISMATCH');
      const e = await ownEntitlement(c, id, row);
      requireEvidence(e.status === 'ACTIVE' && e.claimStatus === 'UNCLAIMED', 'NEW_UNUSED_COUPON_REQUIRED');
      row.purchase = 'PURCHASED'; row.entitlementCode = e.code; row.couponCode = e.providerCode; await save(); return e;
      }
    }
    if (row.purchaseRecovery) {
      const recovery = await qualifyRecovery();
      requireEvidence(recovery.revision === row.purchaseRecovery.revision, 'PREPAYMENT_RECOVERY_UNCONFIRMED');
    }
    if (!row.purchase) {
      row.purchase = 'CART_CREATE_PENDING'; await save();
      await get(actors.customer, 'cart', '/carts', 'POST', { cartCode: id.cart, storeCode: s.storeCode,
        channelCode: s.channelCode, locale: s.locale, jurisdiction: s.jurisdiction, currency: s.currency });
    }
    let read = await get(actors.customer, 'cart', '/carts/' + encoded(id.cart));
    cartMatches(read, c, id);
    if (!read.entries.length) {
      requireEvidence(row.purchase !== 'ENTRY_PENDING', 'CART_ENTRY_RECOVERY_REQUIRED');
      row.purchase = 'ENTRY_PENDING'; await save();
      await get(actors.customer, 'cart', '/carts/' + encoded(id.cart) + '/entries', 'POST',
        { entryCode: id.entry, productCode: c.productCode, sku: c.sku, quantity: '1' });
      read = await get(actors.customer, 'cart', '/carts/' + encoded(id.cart));
      cartMatches(read, c, id); requireEvidence(read.entries.length === 1, 'EXACT_CART_ENTRY_REQUIRED');
    }
    row.purchase = 'ENTRY_ADDED'; await save();
    const calculation = await get(actors.customer, 'cart', '/carts/' + encoded(id.cart) + '/calculations', 'POST',
      { expectedRevision: read.cart.revision, calculationCode: id.calculation });
    requireEvidence(calculation.cartCode === id.cart && calculation.currency === s.currency && calculation.tenant === s.tenant &&
      calculation.enterpriseCode === s.customer.enterpriseCode &&
      equalAmount(calculation.totalAmount, c.expectedTotal) && Array.isArray(calculation.entries) && calculation.entries.length === 1 &&
      calculation.entries[0].code === id.entry && calculation.entries[0].sku === c.sku && String(calculation.entries[0].quantity) === '1' &&
      calculation.entries[0].productCode === c.productCode, 'REVIEWED_PURCHASE_PRICE_MISMATCH');
    row.purchase = 'CHECKOUT_PENDING'; await save();
    await get(actors.customer, 'checkoutCore', '/checkouts/place', 'POST', { cartCode: id.cart, orderCode: id.order,
      expectedCartRevision: read.cart.revision, calculationCode: id.calculation, ...s.payment }, row.purchaseRecovery?.commandCode ?? id.purchase);
    return purchase(c, row, id);
  }
  async function reveal(e) {
    const { value, response } = await http(actors.customer, 'digitalCore', '/entitlements/' + encoded(e.code) + '/reveal', 'POST', {});
    requireEvidence(/(?:^|,)\s*no-store(?:\s|,|$)/i.test(response.headers.get('cache-control') || '') && value.status === 'REVEALED' &&
      value.couponCode === e.providerCode && value.tokenSource === 'AUTHENTICATED_RETENTION' && typeof value.token === 'string' &&
      value.token.length >= 4 && value.token.length <= 256, 'PRIVATE_REVEAL_UNCONFIRMED');
    return value.token;
  }
  const simulated = value => value.simulated === true && value.deliveryVerified === false && value.evidenceMode === 'LOCAL_SIMULATION';
  async function receipt(c, e, id, actor) {
    const value = await get(actor, 'digitalCore', '/merchant/redemptions/' + encoded(e.code) + '/receipt/query', 'POST',
      { storeCode: c.outletStoreCode, merchantReceiptReference: id.receipt }, id.confirm);
    requireEvidence(value.state === 'COMPLETED' && value.entitlementCode === e.code && value.confirmationKey === id.confirm &&
      value.merchantReceiptReference === id.receipt && value.merchantCode === c.issuerEnterpriseCode && value.storeCode === c.outletStoreCode &&
      typeof value.receiptCode === 'string' && Number.isSafeInteger(value.storeRevision) && simulated(value), 'ORIGINAL_SIMULATED_RECEIPT_REQUIRED');
    return value;
  }
  async function redeem(c, row, id, e) {
    const actor = actors.staff[c.staffSessionKey];
    if (row.redemption === 'COMPLETED') { await receipt(c, e, id, actor); return; }
    const workspace = await get(actor, 'digitalCore', '/merchant/redemptions/workspace');
    requireEvidence(workspace.storeRequired === true && workspace.stores?.some(store => store.code === c.outletStoreCode), 'EXACT_OUTLET_ADMISSION_REQUIRED');
    const marker = e.evidence?.merchantRedemption;
    if (row.redemption === 'CONFIRM_PENDING') {
      requireEvidence(marker?.confirmationKey === id.confirm && marker.merchantReceiptReference === id.receipt &&
        marker.storeRef?.code === c.outletStoreCode, 'ORIGINAL_CONFIRMATION_RECOVERY_REQUIRED');
      if (e.claimStatus === 'REDEEMED') { await receipt(c, e, id, actor); row.redemption = 'COMPLETED'; await save(); return; }
      requireEvidence(options.resumePending === true, 'EXPLICIT_CONFIRMATION_RESUME_REQUIRED');
      await get(actor, 'digitalCore', '/merchant/redemptions/' + encoded(e.code) + '/confirm', 'POST',
        { confirmed: true, storeCode: c.outletStoreCode, merchantReceiptReference: id.receipt }, id.confirm);
    } else {
      requireEvidence(e.status === 'ACTIVE' && e.claimStatus === 'UNCLAIMED' && !marker, 'UNUSED_ITEM_COUPON_REQUIRED');
      const token = await reveal(e);
      const validation = await get(actor, 'digitalCore', '/merchant/redemptions/validate', 'POST',
        { couponToken: token, storeCode: c.outletStoreCode, merchantReceiptReference: id.receipt });
      const benefit = validation.conditions?.benefit;
      const canonical = items => [...items].sort((a, b) => a.sku.localeCompare(b.sku));
      requireEvidence(validation.eligible === true && validation.entitlementCode === e.code && validation.productCode === c.productCode &&
        validation.merchantCode === c.issuerEnterpriseCode && validation.storeCode === c.outletStoreCode && validation.revision === e.revision &&
        Number.isSafeInteger(validation.storeRevision) && validation.storeRevision >= 1 && typeof validation.validationCode === 'string' &&
        Number.isFinite(Date.parse(validation.validationExpiresAt)) && benefit?.benefitType === 'ITEM' && benefit.sourceStage === 'SIMULATED_ITEMS' &&
        benefit.sourceReference === id.receipt && benefit.storeCode === c.outletStoreCode && benefit.storeRevision === validation.storeRevision &&
        benefit.simulated === true && benefit.verified === false && benefit.deliveredAt === undefined &&
        Array.isArray(benefit.items) && JSON.stringify(canonical(benefit.items)) === JSON.stringify(canonical(c.items)), 'EXACT_SIMULATED_ITEMS_REQUIRED');
      row.revealed = true; row.redemption = 'CONFIRM_PENDING'; await save();
      await get(actor, 'digitalCore', '/merchant/redemptions/' + encoded(e.code) + '/confirm', 'POST', { confirmed: true,
        expectedRevision: validation.revision, validationCode: validation.validationCode, validationExpiresAt: validation.validationExpiresAt,
        storeCode: c.outletStoreCode, merchantReceiptReference: id.receipt }, id.confirm);
    }
    const original = await receipt(c, e, id, actor);
    await get(actor, 'digitalCore', '/merchant/redemptions/' + encoded(e.code) + '/confirm', 'POST',
      { confirmed: true, storeCode: c.outletStoreCode, merchantReceiptReference: id.receipt }, id.confirm);
    requireEvidence(JSON.stringify(await receipt(c, e, id, actor)) === JSON.stringify(original), 'MERCHANT_REPLAY_CHANGED_RECEIPT');
    const current = await ownEntitlement(c, id, row);
    requireEvidence(current.claimStatus === 'REDEEMED', 'REDEEMED_ENTITLEMENT_REQUIRED');
    row.redemption = 'COMPLETED'; row.receiptCode = original.receiptCode; await save();
  }
  async function refund(c, row, id, e) {
    if (row.refund !== 'COMPLETED') {
      requireEvidence(row.refund === 'REFUND_PENDING' || e.status === 'ACTIVE' && e.claimStatus === 'UNCLAIMED' && !e.evidence?.merchantRedemption,
        'UNUSED_REFUND_COUPON_REQUIRED');
      if (!row.refund) {
        await reveal(e); row.revealed = true; row.refund = 'DISPUTE_PENDING'; await save();
      }
      let cases = await get(actors.customer, 'order', '/orders/' + encoded(id.order) + '/disputes');
      requireEvidence(Array.isArray(cases.cases), 'REFUND_CASE_HISTORY_REQUIRED');
      if (!row.caseCode) {
        const expectedCase = 'ORDER_REVIEW_' + createHash('sha256')
          .update([s.tenant, s.customer.enterpriseCode, s.customer.ownerId, id.dispute].join('|')).digest('hex').slice(0, 32).toUpperCase();
        requireEvidence(cases.cases.length <= 1 && cases.cases.every(value => value.code === expectedCase &&
          value.orderCode === id.order && value.requestedResolution === 'REFUND' && value.comment === s.refundReview.comment.trim()),
        'EXISTING_REFUND_CASE_REQUIRES_REVIEW');
        const created = cases.cases[0] || await get(actors.customer, 'order', '/orders/' + encoded(id.order) + '/disputes', 'POST',
          { confirmed: true, requestedResolution: 'REFUND', comment: s.refundReview.comment }, id.dispute);
        requireEvidence(typeof created.code === 'string' && created.orderCode === id.order && created.requestedResolution === 'REFUND', 'EXACT_REFUND_CASE_REQUIRED');
        requireEvidence(created.code === expectedCase, 'ORIGINAL_REFUND_CASE_REQUIRED');
        row.caseCode = created.code; await save();
        cases = await get(actors.customer, 'order', '/orders/' + encoded(id.order) + '/disputes');
      }
      const current = cases.cases.filter(value => value.code === row.caseCode);
      requireEvidence(current.length === 1 && current[0].orderCode === id.order && Number.isSafeInteger(current[0].revision), 'ORIGINAL_REFUND_CASE_REQUIRED');
      const preview = await get(actors.reviewer, 'order', '/disputes/' + encoded(row.caseCode) + '/refund-preview', 'POST', {});
      if (row.refund === 'REFUND_PENDING') requireEvidence(preview.recovery === true && preview.approvalCommandKey === id.refund &&
        preview.approvalReason === s.refundReview.reason.trim(), 'ORIGINAL_REFUND_RECOVERY_REQUIRED');
      else requireEvidence(preview.eligible === true && preview.provider === 'digitalCore' && preview.domain?.kind === 'DIGITAL_COUPON' &&
        preview.domain.entitlementCodes?.length === 1 && preview.domain.entitlementCodes[0] === e.code &&
        equalAmount(preview.amount, c.expectedTotal) && preview.currency === s.currency && typeof preview.previewToken === 'string', 'UNUSED_REFUND_PLAN_REQUIRED');
      row.refund = 'REFUND_PENDING'; await save();
      const result = await get(actors.reviewer, 'order', '/disputes/' + encoded(row.caseCode) + '/refund', 'POST', { confirmed: true,
        expectedRevision: current[0].revision, previewToken: preview.previewToken, reason: s.refundReview.reason }, id.refund);
      requireEvidence(result.status === 'COMPLETED' && typeof result.refundCode === 'string' && equalAmount(result.amount, c.expectedTotal) &&
        result.currency === s.currency && result.steps?.includes('PAYMENT') && result.steps.includes('COMPLETE'), 'REFUND_RECOVERY_REQUIRED');
      row.refundCode = result.refundCode;
    }
    const current = await ownEntitlement(c, id, row);
    requireEvidence(current.status === 'REVOKED', 'REFUNDED_ENTITLEMENT_NOT_REVOKED');
    const order = await get(actors.customer, 'order', '/orders/' + encoded(id.order));
    requireEvidence(order.order?.code === id.order && order.order.status === 'REFUNDED' && order.order.evidence?.refundCode === row.refundCode, 'REFUNDED_ORDER_REQUIRED');
    row.refund = 'COMPLETED'; await save();
  }
  try {
    for (const c of phase === 'ITEMS_ONLY' ? s.itemCases : [s.refundCase, ...s.itemCases]) {
      const row = checkpoint.cases[c.caseCode] ||= {};
      requireEvidence(exactKeys(row, ['purchase', 'entitlementCode', 'couponCode', 'revealed', 'redemption', 'receiptCode', 'refund', 'caseCode', 'refundCode', 'purchaseRecovery']), 'CHECKPOINT_CASE_INVALID');
      const id = ids(c), e = await purchase(c, row, id);
      if (c.caseCode === s.refundCase.caseCode) await refund(c, row, id, e);
      else await redeem(c, row, id, e);
    }
    return { contractVersion: 1, state: phase === 'ALL' ? 'PASSED' : 'PHASE_COMPLETED_NOT_FULL_ACCEPTANCE',
      ...phaseProgress(), itemRedemptions: s.itemCases.length, unusedRefunds: phase === 'ALL' ? 1 : 0,
      evidenceMode: 'LOCAL_SIMULATION', deliveryVerified: false, monetaryBenefitsQualified: false,
      redeemedBenefitReversalsExecuted: false, checkpoint: structuredClone(checkpoint) };
  } catch (error) {
    return { contractVersion: 1, state: 'RECOVERY_REQUIRED', ...phaseProgress(), stage,
      reasonCode: /^[A-Z][A-Z0-9_]{0,95}$/.test(error?.code || '') ? error.code : 'OWNER_OUTCOME_UNCONFIRMED',
      checkpoint: structuredClone(checkpoint) };
  }
}
