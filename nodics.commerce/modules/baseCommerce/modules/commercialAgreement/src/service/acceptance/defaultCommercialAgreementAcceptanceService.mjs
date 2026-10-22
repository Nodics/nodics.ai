/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module commercialAgreement/acceptance/defaultCommercialAgreementAcceptanceService
 * @description Proves reviewed installed agreement history through canonical read-only owner APIs.
 * @layer tooling @owner commercialAgreement
 */
import { pathToFileURL } from 'node:url';
import properties from '../../../config/properties.js';
import { createAcceptanceContext } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { projectEndpointUrl, projectRuntimeAcceptance } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';

const defaultAcceptanceName = 'commercialAgreement';
const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/;
const requireEvidence = (condition, code) => { if (!condition) throw Object.assign(new Error(code), { code }); };
const identifier = value => typeof value === 'string' && identifierPattern.test(value);
const plain = value => value && typeof value === 'object' && !Array.isArray(value);

/** Unwraps bounded owner envelopes and rejects contradictory responses. */
export function commercialAgreementData(value) {
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

/** Returns one own-property reviewed profile without accepting inherited project values. */
export function selectCommercialAgreementAcceptance(profiles, name = defaultAcceptanceName) {
  requireEvidence(plain(profiles) && Object.hasOwn(profiles, name), 'COMMERCIAL_AGREEMENT_ACCEPTANCE_UNAVAILABLE');
  return profiles[name];
}

export function commercialAgreementAcceptanceArgument(args = []) {
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
  const keys = ['contractVersion', 'approvalReference', 'tenant', 'enterpriseCode', 'agreements'];
  requireEvidence(plain(selection) && Object.keys(selection).length === keys.length && keys.every(key => Object.hasOwn(selection, key)) &&
    selection.contractVersion === 1 && ['approvalReference', 'tenant', 'enterpriseCode'].every(key => identifier(selection[key])) &&
    Array.isArray(selection.agreements) && selection.agreements.length > 0, 'REVIEWED_AGREEMENT_SELECTION_REQUIRED');
  const policy = { ...properties.commercialAgreement.acceptance, ...(options.policy || {}) };
  requireEvidence(plain(policy) && Object.keys(policy).length === 2 && Number.isSafeInteger(policy.requestTimeoutMs) &&
    policy.requestTimeoutMs >= 1 && policy.requestTimeoutMs <= 300000 && Number.isSafeInteger(policy.maximumAgreements) &&
    policy.maximumAgreements >= 1 && policy.maximumAgreements <= properties.commercialAgreement.maximumPageSize &&
    selection.agreements.length <= policy.maximumAgreements,
  'COMMERCIAL_AGREEMENT_ACCEPTANCE_POLICY_REQUIRED');
  const seen = new Set();
  for (const agreement of selection.agreements) {
    const agreementKeys = ['code', 'revision', 'model', 'paymentTerms', 'benefitCodes'];
    requireEvidence(plain(agreement) && Object.keys(agreement).length === agreementKeys.length &&
      agreementKeys.every(key => Object.hasOwn(agreement, key)) && identifier(agreement.code) && !seen.has(agreement.code) &&
      Number.isSafeInteger(agreement.revision) && agreement.revision > 0 && identifier(agreement.model) &&
      identifier(agreement.paymentTerms) && Array.isArray(agreement.benefitCodes) &&
      agreement.benefitCodes.every(identifier) && new Set(agreement.benefitCodes).size === agreement.benefitCodes.length,
    'REVIEWED_AGREEMENT_EXPECTATION_REQUIRED');
    seen.add(agreement.code);
  }
  const session = options.session;
  requireEvidence(plain(session) && Object.keys(session).length === 2 && /^Bearer [^\s]{1,16384}$/i.test(session.authorization || '') &&
    session.enterpriseCode === selection.enterpriseCode, 'ORIGINAL_AGREEMENT_SESSION_REQUIRED');
  requireEvidence(options.fetch === undefined || typeof options.fetch === 'function', 'AGREEMENT_ACCEPTANCE_OPERATIONS_REQUIRED');
  return { selection, policy, session, baseUrl: url.origin };
}

/** Reads workspace, bounded search and every selected immutable history without mutating agreements. */
export async function runCommercialAgreementAcceptance(options = {}) {
  const { selection, policy, session, baseUrl } = selectionOf(options);
  const fetchRequest = options.fetch || globalThis.fetch;
  async function post(route, body) {
    let response;
    try {
      response = await fetchRequest(new URL('/nodics/commercialAgreement/v0' + route, baseUrl), {
        method: 'POST', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(policy.requestTimeoutMs),
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', tenant: selection.tenant,
          'x-enterprise-code': session.enterpriseCode, Authorization: session.authorization,
          'x-correlation-id': selection.approvalReference }, body: JSON.stringify(body),
      });
    } catch { requireEvidence(false, 'HTTP_OUTCOME_UNCONFIRMED'); }
    let value;
    try { value = await response.json(); } catch { requireEvidence(false, 'OWNER_RESPONSE_INVALID'); }
    requireEvidence(response.ok, 'HTTP_' + response.status);
    return commercialAgreementData(value);
  }
  const scope = { enterpriseCode: selection.enterpriseCode };
  const workspace = await post('/agreements/workspace', scope);
  requireEvidence(workspace.contractVersion === 1 && workspace.enterpriseCode === selection.enterpriseCode &&
    Array.isArray(workspace.availableCommands) && ['search', 'read'].every(command => workspace.availableCommands.includes(command)) &&
    workspace.mutation?.expectedRevisionRequired === true && workspace.mutation?.commandIdRequired === true &&
    workspace.mutation?.automaticRetry === false, 'AGREEMENT_WORKSPACE_UNCONFIRMED');
  const expectedCodes = selection.agreements.map(value => value.code).sort();
  const discovered = new Set(), seen = new Set();
  const pageSize = Math.min(workspace.limits?.maximumPageSize || 0, policy.maximumAgreements);
  requireEvidence(Number.isSafeInteger(pageSize) && pageSize >= selection.agreements.length, 'AGREEMENT_WORKSPACE_BOUND_UNCONFIRMED');
  for (let pageNumber = 1, scanned = 0; scanned < policy.maximumAgreements; pageNumber += 1) {
    const search = await post('/agreements/search', { ...scope, pageNumber, pageSize });
    requireEvidence(search.pageNumber === pageNumber && search.pageSize === pageSize && typeof search.hasMore === 'boolean' &&
      Array.isArray(search.agreements) && search.agreements.length <= pageSize, 'AGREEMENT_SEARCH_UNCONFIRMED');
    for (const value of search.agreements) {
      requireEvidence(identifier(value.code) && !seen.has(value.code), 'AGREEMENT_SEARCH_UNCONFIRMED');
      seen.add(value.code); if (expectedCodes.includes(value.code)) discovered.add(value.code);
    }
    scanned += search.agreements.length;
    if (discovered.size === expectedCodes.length || !search.hasMore) break;
    requireEvidence(search.agreements.length === pageSize && scanned < policy.maximumAgreements, 'AGREEMENT_SEARCH_BOUND_EXCEEDED');
  }
  requireEvidence(discovered.size === expectedCodes.length, 'SELECTED_AGREEMENTS_MISSING');
  const evidence = [];
  for (const expected of selection.agreements) {
    const row = await post('/agreements/read', { ...scope, code: expected.code });
    requireEvidence(row.code === expected.code && row.enterpriseRef?.module === 'profile' &&
      row.enterpriseRef?.schema === 'enterprise' && row.enterpriseRef?.code === selection.enterpriseCode &&
      row.revision === expected.revision && Array.isArray(row.versions) && row.versions.length === row.revision,
    'AGREEMENT_HISTORY_UNCONFIRMED');
    const latest = row.versions.at(-1), benefitCodes = latest?.terms?.benefits?.map(value => value.code).sort();
    requireEvidence(latest?.version === expected.revision && latest.terms.model === expected.model &&
      latest.terms.paymentTerms === expected.paymentTerms && JSON.stringify(benefitCodes) === JSON.stringify([...expected.benefitCodes].sort()),
    'AGREEMENT_TERMS_UNCONFIRMED');
    evidence.push({ code: row.code, revision: row.revision, version: latest.version, model: latest.terms.model,
      paymentTerms: latest.terms.paymentTerms, benefitCodes });
  }
  return { contractVersion: 1, state: 'PASSED', approvalReference: selection.approvalReference,
    enterpriseCode: selection.enterpriseCode, agreements: evidence };
}

/** Resolves the project selection and original signed session for the framework-owned command. */
export async function runConfiguredCommercialAgreementAcceptance(options = {}) {
  const context = await createAcceptanceContext(options);
  const selection = options.selection || selectCommercialAgreementAcceptance(
    projectRuntimeAcceptance(context.projectRoot, context.configuration, { role: 'COMMERCE' }),
    options.acceptanceName || defaultAcceptanceName,
  );
  const raw = context.environment.NODICS_COMMERCIAL_AGREEMENT_TOKEN || '';
  const session = options.session || { authorization: raw.startsWith('Bearer ') ? raw : raw ? 'Bearer ' + raw : '',
    enterpriseCode: selection.enterpriseCode };
  return runCommercialAgreementAcceptance({ ...options, selection, session,
    baseUrl: options.baseUrl || projectEndpointUrl(context.configuration, { role: 'COMMERCE' }) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--help')) console.log('acceptance:commercial-agreement --execute [--acceptance=<name>]; read-only installed agreement qualification using NODICS_COMMERCIAL_AGREEMENT_TOKEN.');
  else runConfiguredCommercialAgreementAcceptance({ execute: process.argv.includes('--execute'),
    acceptanceName: commercialAgreementAcceptanceArgument(process.argv.slice(2)) })
    .then(result => console.log(JSON.stringify(result)))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
