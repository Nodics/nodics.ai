/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module digitalCore/acceptance/defaultDigitalFixedBundleSaleAcceptanceService
 * @description Exercises one reviewed fixed-price bundle purchase through Cart, Checkout and Digital
 * owner APIs. It provisions no identity, balance, holding, listing, Cart or permission.
 * @owner digitalCore
 * @layer tooling
 */
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import exact from '../../../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService.js';
import { createAcceptanceContext } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { projectEndpointUrl, projectRuntimeAcceptance } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';

const defaultAcceptanceName = 'digitalFixedBundleSale';
const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/;
const operationPattern = /^bundle-operation:[a-f0-9]{64}$/;
const amountPattern = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;

function requireEvidence(condition, code) {
  if (!condition) throw Object.assign(new Error(code), { code });
}

function exactKeys(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).sort().join(',') === [...keys].sort().join(',');
}

function identifier(value) { return typeof value === 'string' && identifierPattern.test(value); }
function bearer(value) { return typeof value === 'string' && /^Bearer [^\s]{1,16384}$/i.test(value); }
function same(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
function amount(value) { return typeof value === 'string' && amountPattern.test(value) && value.length <= 128; }

function owner(value) {
  requireEvidence(exactKeys(value, ['module', 'schema', 'code']) && value.module === 'profile' &&
    ['customer', 'enterprise'].includes(value.schema) && identifier(value.code), 'REVIEWED_BUNDLE_OWNER_REQUIRED');
  return value;
}

/** Resolves one bounded customer-owned acceptance profile name from CLI arguments. */
export function digitalFixedBundleSaleAcceptanceArgument(argv = []) {
  const values = argv.filter(argument => argument === '--acceptance' || argument.startsWith('--acceptance='));
  requireEvidence(values.length <= 1, 'ONE_BUNDLE_SALE_ACCEPTANCE_SELECTION_REQUIRED');
  if (!values.length) return defaultAcceptanceName;
  const name = values[0].startsWith('--acceptance=') ? values[0].slice('--acceptance='.length) : '';
  requireEvidence(/^[A-Za-z][A-Za-z0-9]{0,127}$/.test(name), 'BUNDLE_SALE_ACCEPTANCE_SELECTION_INVALID');
  return name;
}

/** Selects an own-property acceptance profile without embedding deployment identities in Digital. */
export function selectDigitalFixedBundleSaleAcceptance(profiles, name = defaultAcceptanceName) {
  requireEvidence(/^[A-Za-z][A-Za-z0-9]{0,127}$/.test(name) && profiles && Object.hasOwn(profiles, name) &&
    profiles[name] && typeof profiles[name] === 'object' && !Array.isArray(profiles[name]),
  'BUNDLE_SALE_ACCEPTANCE_PROFILE_UNAVAILABLE');
  return profiles[name];
}

/** Validates the reviewed existing Cart/listing and original buyer/seller sessions before owner I/O. */
export function digitalFixedBundleSaleSelection(options = {}) {
  requireEvidence(options.execute === true, 'EXPLICIT_BUNDLE_SALE_ACCEPTANCE_EXECUTION_REQUIRED');
  const url = new URL(options.baseUrl);
  requireEvidence(['http:', 'https:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
    !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash,
  'LOCAL_BUNDLE_SALE_ACCEPTANCE_TARGET_REQUIRED');
  const s = structuredClone(options.selection);
  requireEvidence(exactKeys(s, ['contractVersion', 'approvalReference', 'localDemo', 'isolatedPartition', 'tenant', 'runCode',
    'buyer', 'seller', 'cart', 'listing', 'payment']) && s.contractVersion === 1 && s.localDemo === true &&
    s.isolatedPartition === true && [s.approvalReference, s.tenant, s.runCode].every(identifier) && s.runCode.length <= 80,
  'REVIEWED_LOCAL_BUNDLE_SALE_SELECTION_REQUIRED');
  requireEvidence(exactKeys(s.buyer, ['ownerRef', 'ownerId', 'enterpriseCode']) &&
    exactKeys(s.seller, ['ownerRef', 'enterpriseCode']) && [s.buyer.ownerId, s.buyer.enterpriseCode, s.seller.enterpriseCode].every(identifier),
  'REVIEWED_BUNDLE_SALE_ACTOR_REQUIRED');
  owner(s.buyer.ownerRef); owner(s.seller.ownerRef);
  requireEvidence(!same(s.buyer.ownerRef, s.seller.ownerRef) && s.buyer.ownerRef.code === s.buyer.ownerId &&
    s.buyer.enterpriseCode === s.seller.enterpriseCode, 'REVIEWED_BUNDLE_SALE_PARTITION_REQUIRED');
  requireEvidence(exactKeys(s.cart, ['code', 'calculationCode', 'orderCode', 'checkoutCommandCode', 'channelCode', 'locale', 'jurisdiction']) &&
    Object.values(s.cart).every(identifier), 'REVIEWED_BUNDLE_SALE_CART_REQUIRED');
  requireEvidence(exactKeys(s.listing, ['publicationCode', 'manifestCode', 'productCode', 'sku', 'storeCode', 'currency', 'amount']) &&
    ['publicationCode', 'manifestCode', 'productCode', 'sku', 'storeCode', 'currency'].every(key => identifier(s.listing[key])) &&
    amount(s.listing.amount) && exact.compare(s.listing.amount, '0') > 0,
  'REVIEWED_FIXED_BUNDLE_LISTING_REQUIRED');
  requireEvidence(exactKeys(s.payment, ['paymentMethod', 'walletCode', 'programCode', 'rewardTypeCode', 'rewardCurrency']) &&
    s.payment.paymentMethod === 'LOYALTY_REWARD' && s.payment.rewardCurrency === s.listing.currency &&
    ['walletCode', 'programCode', 'rewardTypeCode'].every(key => identifier(s.payment[key])),
  'REVIEWED_BUNDLE_POINTS_PAYMENT_REQUIRED');
  const sessions = {};
  for (const actor of ['buyer', 'seller']) {
    const session = options.sessions?.[actor];
    requireEvidence(exactKeys(session, ['authorization', 'enterpriseCode']) && bearer(session.authorization) &&
      session.enterpriseCode === s[actor].enterpriseCode, 'ORIGINAL_BUNDLE_SALE_SESSION_REQUIRED');
    sessions[actor] = { ...session };
  }
  return { selection: s, sessions, baseUrl: url.origin };
}

/** Unwraps successful Nodics envelopes without accepting contradictory response shapes. */
export function digitalFixedBundleSaleData(value) {
  for (let depth = 0; depth < 8; depth += 1) {
    requireEvidence(value && typeof value === 'object' && !value.error && value.success !== false &&
      !(typeof value.code === 'string' && value.code.startsWith('ERR_')), 'BUNDLE_SALE_OWNER_RESPONSE_REFUSED');
    const data = Object.hasOwn(value, 'data'), result = Object.hasOwn(value, 'result');
    requireEvidence(!(data && result), 'BUNDLE_SALE_OWNER_RESPONSE_AMBIGUOUS');
    if (!data && !result) return value;
    value = data ? value.data : value.result;
  }
  requireEvidence(false, 'BUNDLE_SALE_OWNER_RESPONSE_DEPTH');
}

/** Runs one exact sale. Unconfirmed Checkout is reported for owner recovery and is never retried here. */
export async function runDigitalFixedBundleSaleAcceptance(options = {}) {
  const { selection: s, sessions, baseUrl } = digitalFixedBundleSaleSelection(options);
  const fetchRequest = options.fetch || globalThis.fetch;
  const timeout = options.requestTimeoutMs ?? 30000;
  requireEvidence(Number.isSafeInteger(timeout) && timeout >= 1 && timeout <= 60000, 'BUNDLE_SALE_TIMEOUT_INVALID');
  let stage = 'START';
  async function http(actor, module, route, method = 'GET', body, key) {
    stage = module + ':' + method + ':' + route.split('?')[0];
    let response;
    try {
      response = await fetchRequest(new URL('/nodics/' + module + '/v0' + route, baseUrl), {
        method, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(timeout),
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', tenant: s.tenant,
          'x-enterprise-code': actor.enterpriseCode, Authorization: actor.authorization,
          'x-correlation-id': s.runCode, ...(key ? { 'Idempotency-Key': key } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch { requireEvidence(false, 'BUNDLE_SALE_HTTP_OUTCOME_UNCONFIRMED'); }
    requireEvidence(response.ok, 'BUNDLE_SALE_HTTP_' + response.status);
    let value;
    try { value = await response.json(); } catch { requireEvidence(false, 'BUNDLE_SALE_OWNER_RESPONSE_INVALID'); }
    return digitalFixedBundleSaleData(value);
  }
  const encoded = encodeURIComponent;
  function completed(value) {
    return value?.status === 'COMPLETED' && value?.code === s.cart.orderCode &&
      ['DIGITAL_RESERVED', 'PAYMENT_CAPTURED', 'DIGITAL_SOLD', 'DIGITAL_DELIVERED'].every(phase => value.evidence?.completed?.includes(phase)) &&
      Array.isArray(value.evidence.digitalSaleCodes) && value.evidence.digitalSaleCodes.length === 1 &&
      value.evidence.digitalSaleCodes[0] === value.evidence.digitalReservationCodes?.[0] &&
      value.evidence.digitalSaleCodes[0] === value.evidence.digitalDeliveryCodes?.[0];
  }
  try {
    let checkout = await http(sessions.buyer, 'checkoutCore', '/checkouts/' + encoded(s.cart.orderCode));
    if (checkout.status === 'NOT_COMPLETED') {
      const cart = await http(sessions.buyer, 'cart', '/carts/' + encoded(s.cart.code));
      requireEvidence(cart.cart?.code === s.cart.code && cart.cart.ownerId === s.buyer.ownerId &&
        cart.cart.enterpriseCode === s.buyer.enterpriseCode && cart.cart.storeCode === s.listing.storeCode &&
        cart.cart.channelCode === s.cart.channelCode && cart.cart.locale === s.cart.locale &&
        cart.cart.jurisdiction === s.cart.jurisdiction && cart.cart.currency === s.listing.currency &&
        Number.isSafeInteger(cart.cart.revision) && Array.isArray(cart.entries) && cart.entries.length === 1 &&
        cart.entries[0].productCode === s.listing.productCode && cart.entries[0].sku === s.listing.sku &&
        String(cart.entries[0].quantity) === '1', 'EXACT_REVIEWED_BUNDLE_CART_REQUIRED');
      const calculation = await http(sessions.buyer, 'cart', '/carts/' + encoded(s.cart.code) + '/calculations', 'POST',
        { expectedRevision: cart.cart.revision, calculationCode: s.cart.calculationCode });
      requireEvidence(calculation.cartCode === s.cart.code && calculation.currency === s.listing.currency &&
        exact.compare(String(calculation.totalAmount), s.listing.amount) === 0 && Array.isArray(calculation.entries) &&
        calculation.entries.length === 1 && calculation.entries[0].productCode === s.listing.productCode &&
        calculation.entries[0].sku === s.listing.sku && String(calculation.entries[0].quantity) === '1',
      'REVIEWED_BUNDLE_PRICE_MISMATCH');
      await http(sessions.buyer, 'checkoutCore', '/checkouts/place', 'POST', {
        cartCode: s.cart.code, orderCode: s.cart.orderCode, expectedCartRevision: cart.cart.revision,
        calculationCode: s.cart.calculationCode, ...s.payment, rewardAmount: s.listing.amount,
      }, s.cart.checkoutCommandCode);
      checkout = await http(sessions.buyer, 'checkoutCore', '/checkouts/' + encoded(s.cart.orderCode));
    }
    requireEvidence(completed(checkout), 'BUNDLE_SALE_CHECKOUT_RECOVERY_REQUIRED');
    const purchaseCode = checkout.evidence.digitalSaleCodes[0];
    requireEvidence(operationPattern.test(purchaseCode), 'EXACT_BUNDLE_PURCHASE_CODE_REQUIRED');
    const status = async (actor, ownerRef) => http(actor, 'digitalCore', '/bundle-purchases/query', 'POST', { purchaseCode, ownerRef });
    const buyer = await status(sessions.buyer, s.buyer.ownerRef);
    const seller = await status(sessions.seller, s.seller.ownerRef);
    for (const value of [buyer, seller]) requireEvidence(value.contractVersion === 1 && value.purchaseCode === purchaseCode &&
      value.orderCode === s.cart.orderCode && value.publicationCode === s.listing.publicationCode &&
      value.manifestCode === s.listing.manifestCode && value.status === 'COMPLETED' && value.finalSale === true &&
      same(value.sellerRef, s.seller.ownerRef) && same(value.buyerRef, s.buyer.ownerRef) &&
      value.paymentConfirmed === true && value.wholeTransferConfirmed === true && value.proceeds?.gross === s.listing.amount &&
      value.proceeds.fee === '0' && value.proceeds.net === s.listing.amount && value.proceeds.currency === s.listing.currency &&
      value.proceeds.programCode === s.payment.programCode && value.proceeds.rewardTypeCode === s.payment.rewardTypeCode &&
      value.proceeds.status === 'AVAILABLE_IN_LOYALTY' && value.proceeds.spendableHere === false && value.proceeds.ledgerRef,
    'EXACT_FINAL_BUNDLE_SALE_REQUIRED');
    requireEvidence(same(buyer, seller), 'BUNDLE_PARTICIPANT_PROJECTIONS_CHANGED');
    const entitlements = await http(sessions.buyer, 'digitalCore', '/entitlements?orderCode=' + encoded(s.cart.orderCode));
    requireEvidence(Array.isArray(entitlements.entitlements) && entitlements.entitlements.length === 1, 'EXACT_BUNDLE_ENTITLEMENT_REQUIRED');
    const entitlement = entitlements.entitlements[0];
    requireEvidence(entitlement.ownerId === s.buyer.ownerId && entitlement.orderCode === s.cart.orderCode &&
      entitlement.productCode === s.listing.productCode && entitlement.sku === s.listing.sku && entitlement.status === 'ACTIVE' &&
      entitlement.digitalDeliveryType === 'DIGITAL_OWNERSHIP' && entitlement.providerOwner === 'digitalCore' &&
      entitlement.providerCode === purchaseCode && entitlement.evidence?.finalSale === true &&
      entitlement.evidence?.physicalCustodyTransferred === false, 'EXACT_BUNDLE_ENTITLEMENT_REQUIRED');
    return { contractVersion: 1, state: 'PASSED', orderCode: s.cart.orderCode, purchaseCode,
      selectionDigest: createHash('sha256').update(JSON.stringify(s)).digest('hex'), finalSale: true,
      sellerProceeds: 'AVAILABLE_IN_LOYALTY', wholeTransferConfirmed: true };
  } catch (error) {
    return { contractVersion: 1, state: 'RECOVERY_REQUIRED', stage,
      reasonCode: /^[A-Z][A-Z0-9_]{0,95}$/.test(error?.code || '') ? error.code : 'BUNDLE_SALE_OWNER_OUTCOME_UNCONFIRMED' };
  }
}

/** Loads only project-selected fixture identities and externally supplied sessions. */
export async function runConfiguredDigitalFixedBundleSaleAcceptance(options = {}) {
  const context = await createAcceptanceContext(options);
  const profiles = projectRuntimeAcceptance(context.projectRoot, context.configuration, { role: 'COMMERCE' });
  const selection = options.selection || selectDigitalFixedBundleSaleAcceptance(profiles,
    options.acceptanceName || defaultAcceptanceName);
  const token = value => value ? (value.startsWith('Bearer ') ? value : 'Bearer ' + value) : '';
  const sessions = options.sessions || {
    buyer: { authorization: token(context.environment.NODICS_DIGITAL_BUNDLE_BUYER_TOKEN), enterpriseCode: selection.buyer?.enterpriseCode },
    seller: { authorization: token(context.environment.NODICS_DIGITAL_BUNDLE_SELLER_TOKEN), enterpriseCode: selection.seller?.enterpriseCode },
  };
  const defaults = context.configuration?.digitalCore?.bundleSettlement?.acceptance || {};
  return runDigitalFixedBundleSaleAcceptance({ ...options, execute: options.execute, selection, sessions,
    requestTimeoutMs: options.requestTimeoutMs ?? defaults.requestTimeoutMs,
    baseUrl: options.baseUrl || projectEndpointUrl(context.configuration, { role: 'COMMERCE' }) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--help')) console.log('acceptance:digital-fixed-bundle-sale --execute [--acceptance=<name>]; requires one reviewed isolated local Cart/listing profile plus NODICS_DIGITAL_BUNDLE_BUYER_TOKEN and NODICS_DIGITAL_BUNDLE_SELLER_TOKEN. It creates no fixtures and never retries uncertain Checkout work.');
  else runConfiguredDigitalFixedBundleSaleAcceptance({ execute: process.argv.includes('--execute'),
    acceptanceName: digitalFixedBundleSaleAcceptanceArgument(process.argv.slice(2)) })
    .then(result => { console.log(JSON.stringify(result)); if (result.state !== 'PASSED') process.exitCode = 1; })
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
