/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module commerceSearchCore/acceptance/defaultCommerceSearchRankingAcceptanceService
 * @description Proves installed default boost order, stable deduplication and explicit-sort bypass through Product discovery.
 * @layer tooling @owner commerceSearchCore
 */
import { pathToFileURL } from 'node:url';
import properties from '../../../config/properties.js';
import { createAcceptanceContext } from '../../../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { projectEndpointUrl, projectRuntimeAcceptance } from '../../../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';

const defaultAcceptanceName = 'commerceSearchRanking';
const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/;
const requireEvidence = (condition, code) => { if (!condition) throw Object.assign(new Error(code), { code }); };
const plain = value => value && typeof value === 'object' && !Array.isArray(value);
const identifier = value => typeof value === 'string' && identifierPattern.test(value);

export function commerceSearchData(value) {
  for (let depth = 0; depth < 8; depth += 1) {
    requireEvidence(plain(value) && value.success !== false && !value.error &&
      !(typeof value.code === 'string' && value.code.startsWith('ERR_')), 'OWNER_RESPONSE_REFUSED');
    const hasData = Object.hasOwn(value, 'data'), hasResult = Object.hasOwn(value, 'result');
    requireEvidence(!(hasData && hasResult), 'OWNER_RESPONSE_AMBIGUOUS');
    if (!hasData && !hasResult) return value;
    value = hasData ? value.data : value.result;
  }
  requireEvidence(false, 'OWNER_RESPONSE_DEPTH');
}

export function selectCommerceSearchRankingAcceptance(profiles, name = defaultAcceptanceName) {
  requireEvidence(plain(profiles) && Object.hasOwn(profiles, name), 'COMMERCE_SEARCH_ACCEPTANCE_UNAVAILABLE');
  return profiles[name];
}

export function commerceSearchRankingAcceptanceArgument(args = []) {
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
  const allowed = ['contractVersion', 'approvalReference', 'tenant', 'enterpriseCode', 'storeCode', 'locale', 'query',
    'expectedDefaultOrder', 'explicitSort'];
  requireEvidence(plain(selection) && Object.keys(selection).every(key => allowed.includes(key)) &&
    ['contractVersion', 'approvalReference', 'tenant', 'enterpriseCode', 'storeCode', 'locale', 'query', 'expectedDefaultOrder']
      .every(key => Object.hasOwn(selection, key)) && selection.contractVersion === 1 &&
    ['approvalReference', 'tenant', 'enterpriseCode', 'storeCode', 'locale'].every(key => identifier(selection[key])) &&
    plain(selection.query) && Object.keys(selection.query).length > 0 && Object.keys(selection.query).every(key => ['term', 'categoryCode'].includes(key)) &&
    Object.values(selection.query).every(identifier) && Array.isArray(selection.expectedDefaultOrder) &&
    selection.expectedDefaultOrder.length > 0 && selection.expectedDefaultOrder.every(identifier) &&
    new Set(selection.expectedDefaultOrder).size === selection.expectedDefaultOrder.length,
  'REVIEWED_SEARCH_SELECTION_REQUIRED');
  if (selection.explicitSort !== undefined) requireEvidence(plain(selection.explicitSort) &&
    Object.keys(selection.explicitSort).length === 2 && identifier(selection.explicitSort.code) &&
    Array.isArray(selection.explicitSort.expectedOrder) && selection.explicitSort.expectedOrder.length > 0 &&
    selection.explicitSort.expectedOrder.every(identifier) &&
    new Set(selection.explicitSort.expectedOrder).size === selection.explicitSort.expectedOrder.length,
  'REVIEWED_EXPLICIT_SORT_REQUIRED');
  const policy = { ...properties.commerceSearch.ranking.acceptance, ...(options.policy || {}) };
  requireEvidence(plain(policy) && Object.keys(policy).length === 2 && Number.isSafeInteger(policy.requestTimeoutMs) &&
    policy.requestTimeoutMs >= 1 && policy.requestTimeoutMs <= 300000 && Number.isSafeInteger(policy.maximumExpectedProducts) &&
    policy.maximumExpectedProducts >= 1 && policy.maximumExpectedProducts <= properties.commerceSearch.ranking.maximumCandidateProducts &&
    selection.expectedDefaultOrder.length <= policy.maximumExpectedProducts &&
    (!selection.explicitSort || selection.explicitSort.expectedOrder.length <= policy.maximumExpectedProducts),
  'COMMERCE_SEARCH_ACCEPTANCE_POLICY_REQUIRED');
  const session = options.session;
  requireEvidence(plain(session) && Object.keys(session).length === 2 && /^Bearer [^\s]{1,16384}$/i.test(session.authorization || '') &&
    session.enterpriseCode === selection.enterpriseCode, 'ORIGINAL_SEARCH_SESSION_REQUIRED');
  requireEvidence(options.fetch === undefined || typeof options.fetch === 'function', 'SEARCH_ACCEPTANCE_OPERATIONS_REQUIRED');
  return { selection, policy, session, baseUrl: url.origin };
}

/** Reads default ranking twice and optional explicit sort once; the runner never publishes or edits rules. */
export async function runCommerceSearchRankingAcceptance(options = {}) {
  const { selection, policy, session, baseUrl } = selectionOf(options);
  const fetchRequest = options.fetch || globalThis.fetch;
  async function discover(sort) {
    const expectedCount = Math.max(selection.expectedDefaultOrder.length,
      selection.explicitSort?.expectedOrder.length || 0);
    const query = new URLSearchParams({ storeCode: selection.storeCode, locale: selection.locale,
      page: '1', pageSize: String(expectedCount) });
    if (selection.query.term) query.set('q', selection.query.term);
    if (selection.query.categoryCode) query.set('categoryCode', selection.query.categoryCode);
    if (sort) query.set('sort', sort);
    let response;
    try {
      response = await fetchRequest(new URL('/nodics/product/v0/products/discovery?' + query, baseUrl), {
        method: 'GET', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(policy.requestTimeoutMs),
        headers: { Accept: 'application/json', tenant: selection.tenant, 'x-enterprise-code': session.enterpriseCode,
          Authorization: session.authorization, 'x-correlation-id': selection.approvalReference },
      });
    } catch { requireEvidence(false, 'HTTP_OUTCOME_UNCONFIRMED'); }
    let value;
    try { value = await response.json(); } catch { requireEvidence(false, 'OWNER_RESPONSE_INVALID'); }
    requireEvidence(response.ok, 'HTTP_' + response.status);
    const data = commerceSearchData(value), products = data.products;
    requireEvidence(Array.isArray(products) && products.length <= policy.maximumExpectedProducts &&
      data.discovery?.source === 'SEARCH_INDEX', 'SEARCH_INDEX_DISCOVERY_REQUIRED');
    const codes = products.map(product => product.productCode);
    requireEvidence(codes.every(identifier) && new Set(codes).size === codes.length, 'SEARCH_RESULT_DEDUPLICATION_REQUIRED');
    return codes;
  }
  const first = await discover(), second = await discover();
  requireEvidence(JSON.stringify(first) === JSON.stringify(second), 'DEFAULT_RANKING_UNSTABLE');
  requireEvidence(JSON.stringify(first) === JSON.stringify(selection.expectedDefaultOrder),
    'DEFAULT_BOOST_ORDER_UNCONFIRMED');
  let explicit;
  if (selection.explicitSort) {
    explicit = await discover(selection.explicitSort.code);
    requireEvidence(JSON.stringify(explicit) ===
      JSON.stringify(selection.explicitSort.expectedOrder), 'EXPLICIT_SORT_ORDER_UNCONFIRMED');
  }
  return { contractVersion: 1, state: 'PASSED', approvalReference: selection.approvalReference,
    defaultOrder: first, ...(explicit ? { explicitSort: selection.explicitSort.code, explicitOrder: explicit } : {}) };
}

export async function runConfiguredCommerceSearchRankingAcceptance(options = {}) {
  const context = await createAcceptanceContext(options);
  const selection = options.selection || selectCommerceSearchRankingAcceptance(
    projectRuntimeAcceptance(context.projectRoot, context.configuration, { role: 'COMMERCE' }),
    options.acceptanceName || defaultAcceptanceName,
  );
  const raw = context.environment.NODICS_COMMERCE_SEARCH_TOKEN || '';
  const session = options.session || { authorization: raw.startsWith('Bearer ') ? raw : raw ? 'Bearer ' + raw : '',
    enterpriseCode: selection.enterpriseCode };
  return runCommerceSearchRankingAcceptance({ ...options, selection, session,
    baseUrl: options.baseUrl || projectEndpointUrl(context.configuration, { role: 'COMMERCE' }) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--help')) console.log('acceptance:commerce-search-ranking --execute [--acceptance=<name>]; read-only installed Product discovery qualification using NODICS_COMMERCE_SEARCH_TOKEN.');
  else runConfiguredCommerceSearchRankingAcceptance({ execute: process.argv.includes('--execute'),
    acceptanceName: commerceSearchRankingAcceptanceArgument(process.argv.slice(2)) })
    .then(result => console.log(JSON.stringify(result)))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
