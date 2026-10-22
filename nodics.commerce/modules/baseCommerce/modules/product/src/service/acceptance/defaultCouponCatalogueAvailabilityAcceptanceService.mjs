/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module product/acceptance/defaultCouponCatalogueAvailabilityAcceptanceService
 * @description Proves that Product's available Shop omits sold-out coupon Products while leaving purchased rights to their owner.
 * @layer tooling
 * @owner product
 * @remarks This read-only runner calls Product discovery and detail only. It neither reads nor interprets Digital
 * entitlements and does not treat catalogue omission as cancellation of an already purchased right.
 */
import { pathToFileURL } from 'node:url';
import properties from '../../../config/properties.js';
import { createAcceptanceContext } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { projectEndpointUrl, projectRuntimeAcceptance } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';

const defaultAcceptanceName = 'couponCatalogueAvailability';
const identifier = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(value);
const plain = value => value && typeof value === 'object' && !Array.isArray(value);
const requireEvidence = (condition, code) => { if (!condition) throw Object.assign(new Error(code), { code }); };
const exactKeys = (value, keys) => plain(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));

/** Unwraps bounded successful Product envelopes without accepting contradictory wrappers. */
export function couponCatalogueAvailabilityData(value) {
  for (let depth = 0; depth < 8; depth += 1) {
    requireEvidence(plain(value) && value.success !== false && !value.error &&
      !(typeof value.code === 'string' && value.code.startsWith('ERR_')), 'OWNER_RESPONSE_REFUSED');
    const data = Object.hasOwn(value, 'data'), result = Object.hasOwn(value, 'result');
    requireEvidence(!(data && result), 'OWNER_RESPONSE_AMBIGUOUS');
    if (!data && !result) return value;
    value = data ? value.data : value.result;
  }
  requireEvidence(false, 'OWNER_RESPONSE_DEPTH');
}

/** Selects one own-property project profile. */
export function selectCouponCatalogueAvailabilityAcceptance(profiles, name = defaultAcceptanceName) {
  requireEvidence(plain(profiles) && Object.hasOwn(profiles, name), 'COUPON_CATALOGUE_ACCEPTANCE_UNAVAILABLE');
  return profiles[name];
}

/** Parses one bounded project profile selection. */
export function couponCatalogueAvailabilityAcceptanceArgument(args = []) {
  const values = args.filter(value => value.startsWith('--acceptance='));
  requireEvidence(values.length <= 1, 'ONE_ACCEPTANCE_SELECTION_REQUIRED');
  const name = values[0]?.slice('--acceptance='.length) || defaultAcceptanceName;
  requireEvidence(/^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(name), 'ACCEPTANCE_NAME_INVALID');
  return name;
}

function selectionOf(options) {
  requireEvidence(options.execute === true, 'EXPLICIT_EXECUTION_REQUIRED');
  let url;
  try { url = new URL(options.baseUrl); } catch { requireEvidence(false, 'LOCAL_HTTP_TARGET_REQUIRED'); }
  requireEvidence(['http:', 'https:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
    !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash, 'LOCAL_HTTP_TARGET_REQUIRED');
  const selection = structuredClone(options.selection);
  const keys = ['contractVersion', 'approvalReference', 'tenant', 'storeCode', 'locale', 'availableProductCodes', 'soldOutProductCodes'];
  requireEvidence(exactKeys(selection, keys) && selection.contractVersion === 1 &&
    ['approvalReference', 'tenant', 'storeCode', 'locale'].every(key => identifier(selection[key])) &&
    [selection.availableProductCodes, selection.soldOutProductCodes].every(values => Array.isArray(values) && values.length > 0 &&
      values.length <= 1000 && values.every(identifier) && new Set(values).size === values.length) &&
    !selection.availableProductCodes.some(code => selection.soldOutProductCodes.includes(code)),
  'REVIEWED_COUPON_CATALOGUE_SELECTION_REQUIRED');
  const policy = { ...properties.product.acceptance.couponCatalogueAvailability, ...(options.policy || {}) };
  requireEvidence(exactKeys(policy, ['requestTimeoutMs', 'pageSize', 'maximumPages']) &&
    Number.isSafeInteger(policy.requestTimeoutMs) && policy.requestTimeoutMs >= 1 && policy.requestTimeoutMs <= 300000 &&
    Number.isSafeInteger(policy.pageSize) && policy.pageSize >= 1 && policy.pageSize <= 100 &&
    Number.isSafeInteger(policy.maximumPages) && policy.maximumPages >= 1 && policy.maximumPages <= 1000,
  'COUPON_CATALOGUE_ACCEPTANCE_POLICY_REQUIRED');
  requireEvidence(options.fetch === undefined || typeof options.fetch === 'function', 'PRODUCT_ACCEPTANCE_OPERATIONS_REQUIRED');
  return { selection, policy, baseUrl: url.origin };
}

/** Reads sold-out Product details, then proves the available Shop contains available codes and omits sold-out codes. */
export async function runCouponCatalogueAvailabilityAcceptance(options = {}) {
  const { selection: s, policy, baseUrl } = selectionOf(options), fetchRequest = options.fetch || globalThis.fetch;
  async function get(route) {
    let response;
    try {
      response = await fetchRequest(new URL('/nodics/product/v0' + route, baseUrl), {
        method: 'GET', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(policy.requestTimeoutMs),
        headers: { Accept: 'application/json', tenant: s.tenant, 'x-correlation-id': s.approvalReference },
      });
    } catch { requireEvidence(false, 'HTTP_OUTCOME_UNCONFIRMED'); }
    let value;
    try { value = await response.json(); } catch { requireEvidence(false, 'OWNER_RESPONSE_INVALID'); }
    requireEvidence(response.ok, 'HTTP_' + response.status);
    return couponCatalogueAvailabilityData(value);
  }
  const scope = '?storeCode=' + encodeURIComponent(s.storeCode) + '&locale=' + encodeURIComponent(s.locale);
  const soldOut = [];
  for (const code of s.soldOutProductCodes) {
    const detail = await get('/products/' + encodeURIComponent(code) + scope);
    requireEvidence(detail.product?.productCode === code && detail.product.availability?.available === false &&
      detail.product.availability?.status === 'OUT_OF_STOCK', 'SOLD_OUT_PRODUCT_DETAIL_REQUIRED');
    soldOut.push(code);
  }
  const discovered = new Set();
  let reportedTotal, complete = false;
  for (let page = 1; page <= policy.maximumPages; page += 1) {
    const separator = scope + '&view=AVAILABLE_SHOP&page=' + page + '&pageSize=' + policy.pageSize;
    const result = await get('/products/discovery' + separator);
    requireEvidence(Array.isArray(result.products) && result.products.length <= policy.pageSize &&
      result.products.every(product => identifier(product.productCode) && product.availability?.available === true &&
        product.availability?.status === 'IN_STOCK'), 'AVAILABLE_SHOP_PAGE_REQUIRED');
    if (result.total !== undefined) {
      requireEvidence(Number.isSafeInteger(result.total) && result.total >= 0 &&
        (reportedTotal === undefined || reportedTotal === result.total), 'AVAILABLE_SHOP_TOTAL_INVALID');
      reportedTotal = result.total;
    }
    for (const product of result.products) {
      requireEvidence(!discovered.has(product.productCode), 'AVAILABLE_SHOP_PAGE_REPEATED');
      discovered.add(product.productCode);
    }
    const hasNext = result.pagination?.hasNextPage;
    requireEvidence(hasNext === undefined || typeof hasNext === 'boolean', 'AVAILABLE_SHOP_PAGINATION_INVALID');
    requireEvidence(hasNext !== true || result.products.length === policy.pageSize,
      'AVAILABLE_SHOP_PAGINATION_INCOMPLETE');
    if (hasNext === false || reportedTotal !== undefined && discovered.size >= reportedTotal ||
      hasNext === undefined && result.products.length < policy.pageSize) {
      requireEvidence(reportedTotal === undefined || discovered.size === reportedTotal,
        'AVAILABLE_SHOP_PAGINATION_INCOMPLETE');
      complete = true;
      break;
    }
    requireEvidence(page < policy.maximumPages, 'AVAILABLE_SHOP_PAGE_BOUND_EXCEEDED');
  }
  requireEvidence(complete, 'AVAILABLE_SHOP_PAGE_BOUND_EXCEEDED');
  requireEvidence(s.availableProductCodes.every(code => discovered.has(code)), 'EXPECTED_AVAILABLE_COUPON_MISSING');
  requireEvidence(s.soldOutProductCodes.every(code => !discovered.has(code)), 'SOLD_OUT_COUPON_REMAINS_IN_AVAILABLE_SHOP');
  return { contractVersion: 1, state: 'PASSED', approvalReference: s.approvalReference,
    catalogueOwner: 'product', purchasedRightsEvidence: 'NOT_READ_BY_PRODUCT', availableProductCodes: s.availableProductCodes.slice(),
    omittedSoldOutProductCodes: soldOut, discoveredAvailableCount: discovered.size };
}

/** Resolves the project profile and Product endpoint; no entitlement session or fixture is accepted. */
export async function runConfiguredCouponCatalogueAvailabilityAcceptance(options = {}) {
  const context = await createAcceptanceContext(options);
  const selection = options.selection || selectCouponCatalogueAvailabilityAcceptance(
    projectRuntimeAcceptance(context.projectRoot, context.configuration, { role: 'COMMERCE' }),
    options.acceptanceName || defaultAcceptanceName);
  return runCouponCatalogueAvailabilityAcceptance({ ...options, selection,
    baseUrl: options.baseUrl || projectEndpointUrl(context.configuration, { role: 'COMMERCE' }) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--help')) console.log('acceptance:coupon-catalogue-availability --execute [--acceptance=<name>]; read-only Product AVAILABLE_SHOP qualification. Purchased entitlements remain outside Product.');
  else runConfiguredCouponCatalogueAvailabilityAcceptance({ execute: process.argv.includes('--execute'),
    acceptanceName: couponCatalogueAvailabilityAcceptanceArgument(process.argv.slice(2)) })
    .then(result => console.log(JSON.stringify(result)))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
