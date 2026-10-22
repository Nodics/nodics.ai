/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module checkoutCore/acceptance/defaultCouponJourneyHttpAcceptanceService
 * @description Checkout-owned coupon acquisition and staff-redemption acceptance through canonical HTTP owners.
 * @layer tooling
 * @owner checkoutCore
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import properties from '../../../config/properties.js';
import exact from '../../../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService.js';
import { createAcceptanceContext } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { projectEndpointUrl, projectRuntimeAcceptance } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';

const modes = Object.freeze({ ACQUISITION: 'couponAcquisition', REDEMPTION: 'couponRedemption' });
const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/;
const amountPattern = /^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/;

function required(condition, code) {
  if (!condition) throw Object.assign(new Error(code), { code });
}

function object(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function identifier(value) { return typeof value === 'string' && identifierPattern.test(value); }
function bearer(value) { return typeof value === 'string' && /^Bearer [^\s]{1,16384}$/i.test(value); }
function amount(value) { return typeof value === 'string' && amountPattern.test(value); }
function same(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
function digest(value) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
function exactKeys(value, keys) {
  return object(value) && Object.keys(value).sort().join(',') === [...keys].sort().join(',');
}

/** Unwraps bounded success envelopes without exposing private owner payloads. */
export function couponJourneyData(value) {
  for (let depth = 0; depth < 8; depth += 1) {
    required(object(value) && value.success !== false && !value.error &&
      !(typeof value.code === 'string' && value.code.startsWith('ERR_')), 'OWNER_RESPONSE_REFUSED');
    const hasData = Object.hasOwn(value, 'data'), hasResult = Object.hasOwn(value, 'result');
    required(!(hasData && hasResult), 'OWNER_RESPONSE_AMBIGUOUS');
    if (!hasData && !hasResult) return value;
    value = hasData ? value.data : value.result;
  }
  required(false, 'OWNER_RESPONSE_DEPTH');
}

function localOrigin(value) {
  let url;
  try { url = new URL(value); } catch { required(false, 'LOCAL_COUPON_ACCEPTANCE_TARGET_REQUIRED'); }
  required(['http:', 'https:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
    !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash,
  'LOCAL_COUPON_ACCEPTANCE_TARGET_REQUIRED');
  return url.origin;
}

function policyOf(options) {
  const policy = { ...properties.checkoutCore.couponAcceptance, ...(options.policy || {}) };
  required(exactKeys(policy, ['requestTimeoutMs', 'maximumCases', 'checkpointDirectory']) &&
    Number.isSafeInteger(policy.requestTimeoutMs) && policy.requestTimeoutMs >= 1 && policy.requestTimeoutMs <= 300000 &&
    Number.isSafeInteger(policy.maximumCases) && policy.maximumCases >= 3 && policy.maximumCases <= 50 &&
    typeof policy.checkpointDirectory === 'string' && policy.checkpointDirectory.length >= 1 &&
    !path.isAbsolute(policy.checkpointDirectory) && !policy.checkpointDirectory.split(/[\\/]/).includes('..'),
  'COUPON_ACCEPTANCE_POLICY_REQUIRED');
  return policy;
}

function actor(sessions, key, enterpriseCode) {
  const session = sessions?.[key];
  required(exactKeys(session, ['authorization', 'enterpriseCode']) && bearer(session.authorization) &&
    session.enterpriseCode === enterpriseCode, 'ORIGINAL_COUPON_ACCEPTANCE_SESSION_REQUIRED');
  return { ...session };
}

function commonSelection(options, expectedKeys) {
  required(options.execute === true && typeof options.saveCheckpoint === 'function',
    'EXPLICIT_EXECUTION_AND_DURABLE_CHECKPOINT_REQUIRED');
  const selection = structuredClone(options.selection);
  required(exactKeys(selection, expectedKeys) && selection.contractVersion === 2 && selection.localDemo === true &&
    [selection.approvalReference, selection.tenant, selection.runCode].every(identifier) && selection.runCode.length <= 80,
  'REVIEWED_LOCAL_COUPON_ACCEPTANCE_SELECTION_REQUIRED');
  return { selection, baseUrl: localOrigin(options.baseUrl), policy: policyOf(options) };
}

function customer(value) {
  required(exactKeys(value, ['ownerId', 'enterpriseCode']) && identifier(value.ownerId) && identifier(value.enterpriseCode),
    'REVIEWED_COUPON_CUSTOMER_REQUIRED');
  return value;
}

function acquisitionInput(options) {
  const input = commonSelection(options, ['contractVersion', 'approvalReference', 'localDemo', 'tenant', 'runCode',
    'customer', 'policyReview', 'cart', 'payment', 'cases']);
  const s = input.selection;
  customer(s.customer);
  required(exactKeys(s.policyReview, ['enterpriseCode', 'comment']) && s.policyReview.enterpriseCode === s.customer.enterpriseCode &&
    typeof s.policyReview.comment === 'string' && s.policyReview.comment.trim().length >= 10 && s.policyReview.comment.length <= 500,
  'REVIEWED_COUPON_FINALITY_CHECK_REQUIRED');
  required(exactKeys(s.cart, ['storeCode', 'channelCode', 'locale', 'jurisdiction', 'currency']) &&
    Object.values(s.cart).every(identifier), 'REVIEWED_COUPON_CART_REQUIRED');
  required(exactKeys(s.payment, ['paymentMethod', 'walletCode', 'programCode', 'rewardTypeCode', 'rewardCurrency']) &&
    s.payment.paymentMethod === 'LOYALTY_REWARD' && s.payment.rewardCurrency === s.cart.currency &&
    ['walletCode', 'programCode', 'rewardTypeCode'].every(key => identifier(s.payment[key])),
  'REVIEWED_COUPON_REWARD_PAYMENT_REQUIRED');
  required(Array.isArray(s.cases) && s.cases.length === 3 && s.cases.length <= input.policy.maximumCases &&
    new Set(s.cases.map(value => value.caseCode)).size === s.cases.length &&
    same([...new Set(s.cases.map(value => value.considerationType))].sort(), ['BOTH', 'CERTIFICATES', 'REWARDS']),
  'ALL_COUPON_CONSIDERATION_TYPES_REQUIRED');
  for (const value of s.cases) {
    required(exactKeys(value, ['caseCode', 'considerationType', 'productCode', 'sku', 'promotionCode', 'expectedTotal', 'certificateCodes']) &&
      ['caseCode', 'productCode', 'sku', 'promotionCode'].every(key => identifier(value[key])) && value.caseCode.length <= 40 &&
      s.runCode.length + value.caseCode.length <= 100 && amount(value.expectedTotal) &&
      Array.isArray(value.certificateCodes) && value.certificateCodes.length <= 50 && value.certificateCodes.every(identifier) &&
      new Set(value.certificateCodes).size === value.certificateCodes.length,
    'REVIEWED_COUPON_ACQUISITION_CASE_REQUIRED');
    if (value.considerationType === 'REWARDS') required(value.certificateCodes.length === 0 && exact.compare(value.expectedTotal, '0') > 0,
      'REWARDS_COUPON_CONSIDERATION_REQUIRED');
    if (value.considerationType === 'CERTIFICATES') required(value.certificateCodes.length > 0 && exact.compare(value.expectedTotal, '0') === 0,
      'CERTIFICATE_COUPON_CONSIDERATION_REQUIRED');
    if (value.considerationType === 'BOTH') required(value.certificateCodes.length > 0 && exact.compare(value.expectedTotal, '0') > 0,
      'COMBINED_COUPON_CONSIDERATION_REQUIRED');
  }
  return { ...input, actors: { customer: actor(options.sessions, 'customer', s.customer.enterpriseCode),
    reviewer: actor(options.sessions, 'reviewer', s.policyReview.enterpriseCode) } };
}

function benefit(value) {
  required(object(value) && ['ITEM', 'PRICED'].includes(value.type), 'REVIEWED_COUPON_BENEFIT_REQUIRED');
  if (value.type === 'ITEM') {
    required(exactKeys(value, ['type', 'sourceStage', 'items']) && identifier(value.sourceStage) && Array.isArray(value.items) &&
      value.items.length > 0 && value.items.length <= 20 && value.items.every(item => exactKeys(item, ['sku', 'quantity', 'unit']) &&
        identifier(item.sku) && Number.isSafeInteger(item.quantity) && item.quantity > 0 && item.quantity <= 100 && item.unit === 'EACH'),
    'REVIEWED_COUPON_ITEM_BENEFIT_REQUIRED');
  } else {
    required(exactKeys(value, ['type', 'sourceStage', 'currency', 'subtotalAmount', 'discountAmount', 'netAmount']) &&
      identifier(value.sourceStage) && identifier(value.currency) &&
      [value.subtotalAmount, value.discountAmount, value.netAmount].every(amount) &&
      exact.compare(value.discountAmount, '0') > 0 &&
      exact.compare(exact.add(value.subtotalAmount, '-' + value.discountAmount), value.netAmount) === 0,
    'REVIEWED_COUPON_PRICED_BENEFIT_REQUIRED');
  }
  return value;
}

function redemptionInput(options) {
  const input = commonSelection(options, ['contractVersion', 'approvalReference', 'localDemo', 'tenant', 'runCode',
    'customer', 'staff', 'cases']);
  const s = input.selection;
  customer(s.customer);
  required(exactKeys(s.staff, ['enterpriseCode']) && identifier(s.staff.enterpriseCode), 'REVIEWED_COUPON_STAFF_REQUIRED');
  required(Array.isArray(s.cases) && s.cases.length >= 1 && s.cases.length <= input.policy.maximumCases &&
    new Set(s.cases.map(value => value.caseCode)).size === s.cases.length, 'REVIEWED_COUPON_REDEMPTION_CASES_REQUIRED');
  for (const value of s.cases) {
    required(exactKeys(value, ['caseCode', 'orderCode', 'cartCode', 'entryCode', 'productCode', 'sku', 'promotionCode',
      'issuerEnterpriseCode', 'outletStoreCode', 'merchantReceiptReference', 'benefit']) &&
      ['caseCode', 'orderCode', 'cartCode', 'entryCode', 'productCode', 'sku', 'promotionCode', 'issuerEnterpriseCode',
        'outletStoreCode'].every(key => identifier(value[key])) && value.issuerEnterpriseCode === s.staff.enterpriseCode &&
      typeof value.merchantReceiptReference === 'string' && /^[A-Za-z0-9][A-Za-z0-9 ._:/@-]{2,119}$/.test(value.merchantReceiptReference),
    'REVIEWED_COUPON_REDEMPTION_CASE_REQUIRED');
    benefit(value.benefit);
  }
  return { ...input, actors: { customer: actor(options.sessions, 'customer', s.customer.enterpriseCode),
    staff: actor(options.sessions, 'staff', s.staff.enterpriseCode) } };
}

function httpClient(options, input) {
  const fetchRequest = options.fetch || globalThis.fetch;
  let stage = 'START';
  async function request(actorValue, module, route, method = 'GET', body, idempotencyKey) {
    stage = module + ':' + method + ':' + route.split('?')[0];
    if (options.beforeRequest !== undefined) {
      try {
        required(typeof options.beforeRequest === 'function', 'REQUEST_PACING_UNCONFIRMED');
        await options.beforeRequest(Object.freeze({ module, route: route.split('?')[0], method }));
      } catch { required(false, 'REQUEST_PACING_UNCONFIRMED'); }
    }
    let response;
    try {
      response = await fetchRequest(new URL('/nodics/' + module + '/v0' + route, input.baseUrl), {
        method, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(input.policy.requestTimeoutMs),
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', tenant: input.selection.tenant,
          'x-enterprise-code': actorValue.enterpriseCode, Authorization: actorValue.authorization,
          'x-correlation-id': input.selection.runCode, ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch { required(false, 'HTTP_OUTCOME_UNCONFIRMED'); }
    let value;
    try { value = await response.json(); } catch { required(false, 'OWNER_RESPONSE_INVALID'); }
    required(response.ok, 'HTTP_' + response.status);
    return { value: couponJourneyData(value), response };
  }
  return { request, get: async (...args) => (await request(...args)).value, stage: () => stage };
}

function checkpointOf(options, selection, kind, caseCodes) {
  const selectionHash = digest({ kind, selection });
  const checkpoint = options.checkpoint ? structuredClone(options.checkpoint) :
    { contractVersion: 2, kind, selectionHash, cases: {} };
  required(exactKeys(checkpoint, ['contractVersion', 'kind', 'selectionHash', 'cases']) && checkpoint.contractVersion === 2 &&
    checkpoint.kind === kind && checkpoint.selectionHash === selectionHash && object(checkpoint.cases), 'CHECKPOINT_SELECTION_MISMATCH');
  for (const [code, row] of Object.entries(checkpoint.cases)) required(caseCodes.includes(code) && object(row), 'CHECKPOINT_CASE_INVALID');
  return checkpoint;
}

/** Proves one REWARDS, one CERTIFICATES and one BOTH coupon purchase and immutable non-refund policy. */
export async function runCouponAcquisitionAcceptance(options = {}) {
  const input = acquisitionInput(options), s = input.selection, client = httpClient(options, input);
  const checkpoint = checkpointOf(options, s, 'COUPON_ACQUISITION', s.cases.map(value => value.caseCode));
  const save = async () => options.saveCheckpoint(structuredClone(checkpoint));
  const encoded = encodeURIComponent;
  function ids(value) {
    const root = s.runCode + ':' + value.caseCode;
    return { cart: root + ':cart', entry: root + ':entry', calculation: root + ':calculation', order: root + ':order',
      purchase: root + ':purchase', dispute: root + ':refund-policy' };
  }
  async function entitlement(value, id, row) {
    const result = await client.get(input.actors.customer, 'digitalCore', '/entitlements?orderCode=' + encoded(id.order));
    required(Array.isArray(result.entitlements) && result.entitlements.length === 1, 'EXACT_PURCHASE_ENTITLEMENT_REQUIRED');
    const item = result.entitlements[0];
    required(item.orderCode === id.order && item.cartCode === id.cart && item.orderEntryCode === id.entry &&
      item.productCode === value.productCode && item.sku === value.sku && item.enterpriseCode === s.customer.enterpriseCode &&
      item.ownerId === s.customer.ownerId && item.providerOwner === 'promotion' && item.digitalDeliveryType === 'COUPON_CODE' &&
      item.evidence?.promotionCode === value.promotionCode && item.status === 'ACTIVE' && item.claimStatus === 'UNCLAIMED' &&
      typeof item.code === 'string' && typeof item.providerCode === 'string' &&
      (!row.entitlementCode || row.entitlementCode === item.code) && (!row.couponCode || row.couponCode === item.providerCode),
    'PURCHASED_COUPON_BINDING_MISMATCH');
    return item;
  }
  async function acquire(value, row, id) {
    const freshCart = !row.state;
    if (freshCart) { row.state = 'CART_PENDING'; await save(); }
    let cartRead;
    try { cartRead = await client.get(input.actors.customer, 'cart', '/carts/' + encoded(id.cart)); } catch (error) {
      if (row.state !== 'CART_PENDING' || error.code !== 'HTTP_404') throw error;
    }
    if (!cartRead) {
      required(freshCart, 'COUPON_CART_CREATE_OUTCOME_UNCONFIRMED');
      await client.get(input.actors.customer, 'cart', '/carts', 'POST', { cartCode: id.cart, ...s.cart });
      cartRead = await client.get(input.actors.customer, 'cart', '/carts/' + encoded(id.cart));
    }
    required(cartRead.cart?.code === id.cart && cartRead.cart.ownerId === s.customer.ownerId &&
      cartRead.cart.enterpriseCode === s.customer.enterpriseCode && cartRead.cart.storeCode === s.cart.storeCode &&
      cartRead.cart.currency === s.cart.currency && Array.isArray(cartRead.entries), 'COUPON_CART_BINDING_MISMATCH');
    if (!cartRead.entries.length) {
      required(row.state !== 'ENTRY_PENDING', 'COUPON_CART_ENTRY_OUTCOME_UNCONFIRMED');
      row.state = 'ENTRY_PENDING'; await save();
      await client.get(input.actors.customer, 'cart', '/carts/' + encoded(id.cart) + '/entries', 'POST',
        { entryCode: id.entry, productCode: value.productCode, sku: value.sku, quantity: '1' });
      cartRead = await client.get(input.actors.customer, 'cart', '/carts/' + encoded(id.cart));
    }
    required(cartRead.entries?.length === 1 && cartRead.entries[0].code === id.entry &&
      cartRead.entries[0].productCode === value.productCode && cartRead.entries[0].sku === value.sku &&
      String(cartRead.entries[0].quantity) === '1', 'COUPON_CART_ENTRY_MISMATCH');
    const calculation = await client.get(input.actors.customer, 'cart', '/carts/' + encoded(id.cart) + '/calculations', 'POST',
      { expectedRevision: cartRead.cart.revision, calculationCode: id.calculation });
    required(calculation.cartCode === id.cart && calculation.currency === s.cart.currency &&
      exact.compare(String(calculation.totalAmount), value.expectedTotal) === 0 && calculation.entries?.length === 1 &&
      calculation.entries[0].code === id.entry, 'COUPON_CONSIDERATION_PRICE_MISMATCH');
    if (row.state !== 'PURCHASED') {
      if (row.state === 'CHECKOUT_PENDING') {
        const pending = await client.get(input.actors.customer, 'checkoutCore', '/checkouts/' + encoded(id.order));
        required(pending.code === id.order && pending.status === 'COMPLETED', 'COUPON_CHECKOUT_RECOVERY_REQUIRED');
      } else {
        row.state = 'CHECKOUT_PENDING'; await save();
        await client.get(input.actors.customer, 'checkoutCore', '/checkouts/place', 'POST', {
          cartCode: id.cart, orderCode: id.order, expectedCartRevision: cartRead.cart.revision, calculationCode: id.calculation,
          ...(value.considerationType === 'CERTIFICATES' ? {} : s.payment),
          ...(value.certificateCodes.length ? { couponSelections: { [id.entry]: [value.certificateCodes] } } : {}),
        }, id.purchase);
      }
      const status = await client.get(input.actors.customer, 'checkoutCore', '/checkouts/' + encoded(id.order));
      required(status.code === id.order && status.status === 'COMPLETED' &&
        ['DIGITAL_SOLD', 'DIGITAL_DELIVERED'].every(phase => status.evidence?.completed?.includes(phase)) &&
        (value.considerationType === 'CERTIFICATES'
          ? !status.evidence.completed.includes('AUTHORIZED') && !status.evidence.completed.includes('PAYMENT_CAPTURED')
          : status.evidence.completed.includes('AUTHORIZED') && status.evidence.completed.includes('PAYMENT_CAPTURED')),
      'COUPON_CHECKOUT_COMPLETION_REQUIRED');
      const order = await client.get(input.actors.customer, 'order', '/orders/' + encoded(id.order));
      required(order.order?.code === id.order && order.order.cartCode === id.cart && order.order.ownerId === s.customer.ownerId &&
        order.order.enterpriseCode === s.customer.enterpriseCode && exact.compare(String(order.order.totalAmount), value.expectedTotal) === 0 &&
        (value.considerationType === 'CERTIFICATES'
          ? order.order.evidence?.considerationType === 'CERTIFICATES' && order.order.evidence.paymentReference === undefined
          : typeof order.order.evidence?.paymentReference === 'string'), 'COUPON_ORDER_CONSIDERATION_REQUIRED');
      const item = await entitlement(value, id, row);
      const revealed = await client.request(input.actors.customer, 'digitalCore', '/entitlements/' + encoded(item.code) + '/reveal', 'POST', {});
      required(/(?:^|,)\s*no-store(?:\s|,|$)/i.test(revealed.response.headers.get('cache-control') || '') &&
        revealed.value.status === 'REVEALED' && revealed.value.couponCode === item.providerCode &&
        revealed.value.tokenSource === 'AUTHENTICATED_RETENTION' && typeof revealed.value.token === 'string',
      'COMPLETED_COUPON_ISSUANCE_REQUIRED');
      row.state = 'PURCHASED'; row.entitlementCode = item.code; row.couponCode = item.providerCode; await save();
    }
    return entitlement(value, id, row);
  }
  async function proveFinal(value, row, id) {
    if (row.finality === 'VERIFIED') return;
    let cases = await client.get(input.actors.customer, 'order', '/orders/' + encoded(id.order) + '/disputes');
    required(Array.isArray(cases.cases), 'COUPON_REFUND_POLICY_HISTORY_REQUIRED');
    let review = cases.cases.find(item => item.idempotencyKey === id.dispute || item.orderCode === id.order && item.comment === s.policyReview.comment.trim());
    if (!review) {
      required(row.finality !== 'REVIEW_PENDING', 'COUPON_POLICY_REVIEW_OUTCOME_UNCONFIRMED');
      row.finality = 'REVIEW_PENDING'; await save();
      review = await client.get(input.actors.customer, 'order', '/orders/' + encoded(id.order) + '/disputes', 'POST',
        { confirmed: true, requestedResolution: 'REFUND', comment: s.policyReview.comment.trim() }, id.dispute);
    }
    required(typeof review.code === 'string' && review.orderCode === id.order && review.requestedResolution === 'REFUND',
      'ORIGINAL_COUPON_POLICY_REVIEW_REQUIRED');
    const preview = await client.get(input.actors.reviewer, 'order', '/disputes/' + encoded(review.code) + '/refund-preview', 'POST', {});
    required(preview.eligible === false && preview.reason === 'PURCHASE_REFUND_POLICY_REQUIRES_REVIEW' &&
      preview.previewToken === undefined && preview.domain === undefined, 'PURCHASED_COUPON_NON_REFUNDABLE_POLICY_REQUIRED');
    row.finality = 'VERIFIED'; row.reviewCaseCode = review.code; await save();
  }
  try {
    for (const value of s.cases) {
      const row = checkpoint.cases[value.caseCode] ||= {};
      required(Object.keys(row).every(key => ['state', 'entitlementCode', 'couponCode', 'finality', 'reviewCaseCode'].includes(key)),
        'CHECKPOINT_CASE_INVALID');
      const id = ids(value);
      await acquire(value, row, id);
      await proveFinal(value, row, id);
    }
    return { contractVersion: 2, state: 'PASSED', approvalReference: s.approvalReference,
      considerationTypes: s.cases.map(value => value.considerationType).sort(), issuedCoupons: s.cases.length,
      purchasedCouponsRefundable: false, refundOrReversalExecuted: false, checkpoint: structuredClone(checkpoint) };
  } catch (error) {
    return { contractVersion: 2, state: 'RECOVERY_REQUIRED', stage: client.stage(),
      reasonCode: /^[A-Z][A-Z0-9_]{0,95}$/.test(error?.code || '') ? error.code : 'COUPON_ACQUISITION_OWNER_OUTCOME_UNCONFIRMED',
      checkpoint: structuredClone(checkpoint) };
  }
}

function benefitMatches(actual, expected, value) {
  if (expected.type === 'ITEM') {
    const canonical = items => [...items].sort((left, right) => left.sku.localeCompare(right.sku));
    return actual?.benefitType === 'ITEM' && actual.sourceStage === expected.sourceStage &&
      actual.sourceReference === value.merchantReceiptReference && actual.storeCode === value.outletStoreCode &&
      Array.isArray(actual.items) && same(canonical(actual.items), canonical(expected.items));
  }
  return actual?.sourceStage === expected.sourceStage && actual.sourceReference === value.merchantReceiptReference &&
    actual.storeCode === value.outletStoreCode && actual.currency === expected.currency &&
    [actual.subtotalAmount, actual.discountAmount].every(amount) &&
    exact.compare(actual.subtotalAmount, expected.subtotalAmount) === 0 &&
    exact.compare(actual.discountAmount, expected.discountAmount) === 0 &&
    exact.compare(exact.add(actual.subtotalAmount, '-' + actual.discountAmount), expected.netAmount) === 0;
}

/** Proves staff-operated validate/confirm/receipt/replay with whole, final coupon consumption only. */
export async function runStaffCouponRedemptionAcceptance(options = {}) {
  const input = redemptionInput(options), s = input.selection, client = httpClient(options, input);
  const checkpoint = checkpointOf(options, s, 'COUPON_REDEMPTION', s.cases.map(value => value.caseCode));
  const save = async () => options.saveCheckpoint(structuredClone(checkpoint));
  const encoded = encodeURIComponent;
  async function ownEntitlement(value) {
    const result = await client.get(input.actors.customer, 'digitalCore', '/entitlements?orderCode=' + encoded(value.orderCode));
    required(Array.isArray(result.entitlements) && result.entitlements.length === 1, 'EXACT_PURCHASE_ENTITLEMENT_REQUIRED');
    const item = result.entitlements[0];
    required(item.orderCode === value.orderCode && item.cartCode === value.cartCode && item.orderEntryCode === value.entryCode &&
      item.productCode === value.productCode && item.sku === value.sku && item.ownerId === s.customer.ownerId &&
      item.enterpriseCode === s.customer.enterpriseCode && item.evidence?.promotionCode === value.promotionCode &&
      item.providerOwner === 'promotion' && item.digitalDeliveryType === 'COUPON_CODE', 'PURCHASED_COUPON_BINDING_MISMATCH');
    return item;
  }
  async function receipt(value, item, key) {
    const result = await client.get(input.actors.staff, 'digitalCore', '/merchant/redemptions/' + encoded(item.code) + '/receipt/query',
      'POST', { storeCode: value.outletStoreCode, merchantReceiptReference: value.merchantReceiptReference }, key);
    required(result.state === 'COMPLETED' && result.entitlementCode === item.code && result.confirmationKey === key &&
      result.merchantReceiptReference === value.merchantReceiptReference && result.merchantCode === value.issuerEnterpriseCode &&
      result.storeCode === value.outletStoreCode && typeof result.receiptCode === 'string', 'ORIGINAL_COUPON_RECEIPT_REQUIRED');
    return result;
  }
  try {
    const contract = await client.get(input.actors.staff, 'system', '/contract/openapi');
    const routes = Object.keys(contract.paths || contract.openapi?.paths || {});
    required(routes.some(route => route.endsWith('/merchant/redemptions/validate')) &&
      routes.some(route => /\/merchant\/redemptions\/(?:\{code\}|:code)\/confirm$/.test(route)) &&
      routes.some(route => /\/merchant\/redemptions\/(?:\{code\}|:code)\/receipt\/query$/.test(route)) &&
      !routes.some(route => /merchant\/redemptions.*(?:partial|reverse|reversal)/i.test(route)),
    'WHOLE_FINAL_COUPON_REDEMPTION_CONTRACT_REQUIRED');
    const workspace = await client.get(input.actors.staff, 'digitalCore', '/merchant/redemptions/workspace');
    required(workspace.storeRequired === true && Array.isArray(workspace.stores), 'COUPON_STAFF_WORKSPACE_REQUIRED');
    for (const value of s.cases) {
      required(workspace.stores.some(store => store.code === value.outletStoreCode), 'EXACT_OUTLET_ADMISSION_REQUIRED');
      const row = checkpoint.cases[value.caseCode] ||= {};
      required(Object.keys(row).every(key => ['state', 'entitlementCode', 'receiptCode'].includes(key)), 'CHECKPOINT_CASE_INVALID');
      let item = await ownEntitlement(value), key = s.runCode + ':' + value.caseCode + ':confirm', presentedToken;
      if (row.state === 'COMPLETED') { await receipt(value, item, key); continue; }
      if (row.state === 'CONFIRM_PENDING') {
        required(item.evidence?.merchantRedemption?.confirmationKey === key &&
          item.evidence.merchantRedemption.merchantReceiptReference === value.merchantReceiptReference &&
          item.evidence.merchantRedemption.storeRef?.code === value.outletStoreCode,
        'ORIGINAL_COUPON_CONFIRMATION_RECOVERY_REQUIRED');
        required(item.claimStatus === 'REDEEMED', 'COUPON_CONFIRMATION_OUTCOME_UNCONFIRMED');
      } else {
        required(item.status === 'ACTIVE' && item.claimStatus === 'UNCLAIMED' && !item.evidence?.merchantRedemption,
          'UNUSED_COUPON_REQUIRED');
        const revealed = await client.request(input.actors.customer, 'digitalCore', '/entitlements/' + encoded(item.code) + '/reveal', 'POST', {});
        required(/(?:^|,)\s*no-store(?:\s|,|$)/i.test(revealed.response.headers.get('cache-control') || '') &&
          revealed.value.status === 'REVEALED' && typeof revealed.value.token === 'string', 'PRIVATE_COUPON_REVEAL_REQUIRED');
        presentedToken = revealed.value.token;
        const validation = await client.get(input.actors.staff, 'digitalCore', '/merchant/redemptions/validate', 'POST', {
          couponToken: presentedToken, storeCode: value.outletStoreCode, merchantReceiptReference: value.merchantReceiptReference });
        required(validation.eligible === true && validation.entitlementCode === item.code && validation.productCode === value.productCode &&
          validation.merchantCode === value.issuerEnterpriseCode && validation.storeCode === value.outletStoreCode &&
          Number.isSafeInteger(validation.storeRevision) && validation.storeRevision >= 1 && validation.revision === item.revision &&
          typeof validation.validationCode === 'string' && Number.isFinite(Date.parse(validation.validationExpiresAt)) &&
          benefitMatches(validation.conditions?.benefit, value.benefit, value), 'EXACT_COUPON_BENEFIT_REQUIRED');
        row.state = 'CONFIRM_PENDING'; row.entitlementCode = item.code; await save();
        await client.get(input.actors.staff, 'digitalCore', '/merchant/redemptions/' + encoded(item.code) + '/confirm', 'POST', {
          confirmed: true, expectedRevision: validation.revision, validationCode: validation.validationCode,
          validationExpiresAt: validation.validationExpiresAt, storeCode: value.outletStoreCode,
          merchantReceiptReference: value.merchantReceiptReference }, key);
      }
      item = await ownEntitlement(value);
      required(item.status === 'REDEEMED' && item.claimStatus === 'REDEEMED', 'WHOLE_COUPON_REDEMPTION_REQUIRED');
      const original = await receipt(value, item, key);
      await client.get(input.actors.staff, 'digitalCore', '/merchant/redemptions/' + encoded(item.code) + '/confirm', 'POST',
        { confirmed: true, storeCode: value.outletStoreCode, merchantReceiptReference: value.merchantReceiptReference }, key);
      required(same(await receipt(value, item, key), original), 'COUPON_REDEMPTION_REPLAY_CHANGED_RECEIPT');
      if (presentedToken) {
        const replayValidation = await client.get(input.actors.staff, 'digitalCore', '/merchant/redemptions/validate', 'POST', {
          couponToken: presentedToken, storeCode: value.outletStoreCode, merchantReceiptReference: value.merchantReceiptReference });
        required(replayValidation.eligible === false && replayValidation.reason === 'ALREADY_REDEEMED',
          'COUPON_PARTIAL_OR_REPEAT_REDEMPTION_REFUSED');
      }
      row.state = 'COMPLETED'; row.receiptCode = original.receiptCode; await save();
    }
    return { contractVersion: 2, state: 'PASSED', approvalReference: s.approvalReference,
      redemptions: s.cases.length, partialRedemptionSupported: false, completedRedemptionReversalSupported: false,
      receiptReplayStable: true, checkpoint: structuredClone(checkpoint) };
  } catch (error) {
    return { contractVersion: 2, state: 'RECOVERY_REQUIRED', stage: client.stage(),
      reasonCode: /^[A-Z][A-Z0-9_]{0,95}$/.test(error?.code || '') ? error.code : 'COUPON_REDEMPTION_OWNER_OUTCOME_UNCONFIRMED',
      checkpoint: structuredClone(checkpoint) };
  }
}

/** Resolves one bounded customer-selected acceptance profile name. */
export function couponAcceptanceArgument(argv = []) {
  const values = argv.filter(value => value.startsWith('--acceptance='));
  required(values.length <= 1, 'ONE_COUPON_ACCEPTANCE_SELECTION_REQUIRED');
  const name = values[0]?.slice('--acceptance='.length);
  if (name === undefined) return undefined;
  required(/^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(name), 'COUPON_ACCEPTANCE_SELECTION_INVALID');
  return name;
}

function acceptanceMode(argv = []) {
  const values = argv.filter(value => value.startsWith('--journey='));
  required(values.length === 1, 'ONE_COUPON_ACCEPTANCE_JOURNEY_REQUIRED');
  const mode = values[0].slice('--journey='.length);
  required(Object.hasOwn(modes, mode), 'COUPON_ACCEPTANCE_JOURNEY_INVALID');
  return mode;
}

function selectProfile(profiles, name) {
  required(object(profiles) && Object.hasOwn(profiles, name) && object(profiles[name]), 'COUPON_ACCEPTANCE_PROFILE_UNAVAILABLE');
  return profiles[name];
}

function checkpointAdapter(projectRoot, policy, mode, name) {
  const directory = path.resolve(projectRoot, policy.checkpointDirectory);
  const relative = path.relative(projectRoot, directory);
  required(relative && !relative.startsWith('..') && !path.isAbsolute(relative), 'COUPON_ACCEPTANCE_CHECKPOINT_DIRECTORY_INVALID');
  const file = path.join(directory, mode.toLowerCase() + '-' + name + '.json');
  let checkpoint;
  if (fs.existsSync(file)) checkpoint = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { checkpoint, saveCheckpoint: async value => {
    fs.mkdirSync(directory, { recursive: true });
    const temporary = file + '.' + process.pid + '.tmp';
    fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
    fs.renameSync(temporary, file);
  } };
}

/** Loads customer-selected values and runtime-only sessions for a registered Checkout command. */
export async function runConfiguredCouponAcceptance(options = {}) {
  const context = await createAcceptanceContext(options), mode = options.mode || acceptanceMode(options.argv || []);
  const defaultName = modes[mode], name = options.acceptanceName || defaultName;
  const profiles = projectRuntimeAcceptance(context.projectRoot, context.configuration, { role: 'COMMERCE' });
  const selection = options.selection || selectProfile(profiles, name), policy = policyOf(options);
  const token = key => { const value = context.environment[key] || ''; return value.startsWith('Bearer ') ? value : value ? 'Bearer ' + value : ''; };
  const sessions = options.sessions || (mode === 'ACQUISITION' ? {
    customer: { authorization: token('NODICS_COUPON_ACCEPTANCE_CUSTOMER_TOKEN'), enterpriseCode: selection.customer?.enterpriseCode },
    reviewer: { authorization: token('NODICS_COUPON_ACCEPTANCE_REVIEWER_TOKEN'), enterpriseCode: selection.policyReview?.enterpriseCode },
  } : {
    customer: { authorization: token('NODICS_COUPON_ACCEPTANCE_CUSTOMER_TOKEN'), enterpriseCode: selection.customer?.enterpriseCode },
    staff: { authorization: token('NODICS_COUPON_REDEMPTION_STAFF_TOKEN'), enterpriseCode: selection.staff?.enterpriseCode },
  });
  const journal = options.saveCheckpoint ? { checkpoint: options.checkpoint, saveCheckpoint: options.saveCheckpoint } :
    checkpointAdapter(context.projectRoot, policy, mode, name);
  const run = mode === 'ACQUISITION' ? runCouponAcquisitionAcceptance : runStaffCouponRedemptionAcceptance;
  return run({ ...options, execute: options.execute, selection, sessions, policy,
    baseUrl: options.baseUrl || projectEndpointUrl(context.configuration, { role: 'COMMERCE' }), ...journal });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--help')) console.log('acceptance:coupon-acquisition|acceptance:coupon-redemption --execute [--acceptance=<name>]; uses reviewed project profiles, runtime-only sessions, canonical Cart/Checkout/Order/Digital APIs, and an atomic tooling checkpoint. It creates no identity, stock, balance, permission or business default.');
  else {
    const argv = process.argv.slice(2), mode = acceptanceMode(argv);
    runConfiguredCouponAcceptance({ execute: argv.includes('--execute'), argv, mode,
      acceptanceName: couponAcceptanceArgument(argv) }).then(result => {
        console.log(JSON.stringify(result)); if (result.state !== 'PASSED') process.exitCode = 1;
      }).catch(error => { console.error(error.message); process.exitCode = 1; });
  }
}
