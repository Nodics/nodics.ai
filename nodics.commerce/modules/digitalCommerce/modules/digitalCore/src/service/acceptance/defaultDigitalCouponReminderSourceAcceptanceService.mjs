/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module digitalCore/acceptance/defaultDigitalCouponReminderSourceAcceptanceService
 * @description Verifies reviewed reminder-source eligibility through Digital's private owner API; delivery remains Communication-owned.
 * @layer tooling @owner digitalCore
 */
import { pathToFileURL } from 'node:url';
import properties from '../../../config/properties.js';
import { createAcceptanceContext } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { projectEndpointUrl, projectRuntimeAcceptance } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';
const defaultAcceptanceName = 'digitalCouponReminderSource';
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const id = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(value);
const required = (condition, code) => { if (!condition) throw Object.assign(new Error(code), { code }); };
function unwrap(value) { for (let depth = 0; depth < 8; depth += 1) { required(object(value) && value.success !== false && !value.error &&
  !(typeof value.code === 'string' && value.code.startsWith('ERR_')), 'OWNER_RESPONSE_REFUSED');
  const data = Object.hasOwn(value, 'data'), result = Object.hasOwn(value, 'result'); required(!(data && result), 'OWNER_RESPONSE_AMBIGUOUS');
  if (!data && !result) return value; value = data ? value.data : value.result; } required(false, 'OWNER_RESPONSE_DEPTH'); }
export function selectDigitalCouponReminderSourceAcceptance(profiles, name = defaultAcceptanceName) {
  required(object(profiles) && Object.hasOwn(profiles, name), 'DIGITAL_REMINDER_ACCEPTANCE_UNAVAILABLE'); return profiles[name];
}
export function digitalCouponReminderSourceAcceptanceArgument(args = []) { const values = args.filter(value => value.startsWith('--acceptance='));
  required(values.length <= 1, 'ONE_ACCEPTANCE_SELECTION_REQUIRED'); const name = values[0]?.slice(13) || defaultAcceptanceName;
  required(/^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(name), 'ACCEPTANCE_NAME_INVALID'); return name; }
function input(options) {
  required(options.execute === true, 'EXPLICIT_EXECUTION_REQUIRED'); let url;
  try { url = new URL(options.baseUrl); } catch { required(false, 'LOCAL_HTTP_TARGET_REQUIRED'); }
  required(['http:', 'https:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
    !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash, 'LOCAL_HTTP_TARGET_REQUIRED');
  const selection = structuredClone(options.selection), keys = ['contractVersion', 'approvalReference', 'tenant', 'runtimeEnterpriseCode', 'sources'];
  required(object(selection) && Object.keys(selection).length === keys.length && keys.every(key => Object.hasOwn(selection, key)) &&
    selection.contractVersion === 1 && ['approvalReference', 'tenant', 'runtimeEnterpriseCode'].every(key => id(selection[key])) &&
    Array.isArray(selection.sources) && selection.sources.length > 0, 'REVIEWED_REMINDER_SELECTION_REQUIRED');
  const policy = { ...properties.digitalCore.couponReminders.acceptance, ...(options.policy || {}) };
  required(object(policy) && Object.keys(policy).length === 2 && Number.isSafeInteger(policy.requestTimeoutMs) &&
    policy.requestTimeoutMs >= 1 && policy.requestTimeoutMs <= 300000 && Number.isSafeInteger(policy.maximumSources) &&
    policy.maximumSources >= 1 && policy.maximumSources <= 1000 && selection.sources.length <= policy.maximumSources,
  'DIGITAL_REMINDER_ACCEPTANCE_POLICY_REQUIRED');
  const seen = new Set();
  for (const source of selection.sources) {
    const sourceKeys = ['enterpriseCode', 'entitlementCode', 'occurrenceKey', 'eligible'];
    required(object(source) && Object.keys(source).length === sourceKeys.length && sourceKeys.every(key => Object.hasOwn(source, key)) &&
      id(source.enterpriseCode) && id(source.entitlementCode) && /^COUPON_EXPIRY_[a-f0-9]{64}$/.test(source.occurrenceKey) &&
      typeof source.eligible === 'boolean' && !seen.has(source.occurrenceKey), 'REVIEWED_REMINDER_SOURCE_REQUIRED'); seen.add(source.occurrenceKey);
  }
  const session = options.session; required(object(session) && Object.keys(session).length === 2 &&
    /^Bearer [^\s]{1,16384}$/i.test(session.authorization || '') && session.enterpriseCode === selection.runtimeEnterpriseCode,
  'ORIGINAL_REMINDER_SERVICE_SESSION_REQUIRED');
  return { selection, policy, session, baseUrl: url.origin };
}
export async function runDigitalCouponReminderSourceAcceptance(options = {}) {
  const { selection: s, policy, session, baseUrl } = input(options), fetchRequest = options.fetch || globalThis.fetch, evidence = [];
  for (const expected of s.sources) {
    const body = { channel: 'IN_APP', enterpriseCode: expected.enterpriseCode, entitlementCode: expected.entitlementCode,
      occurrenceKey: expected.occurrenceKey };
    let response; try { response = await fetchRequest(new URL('/nodics/digitalCore/v0/internal/coupons/reminder-source', baseUrl), {
      method: 'POST', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(policy.requestTimeoutMs),
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', tenant: s.tenant,
        'x-enterprise-code': session.enterpriseCode, Authorization: session.authorization,
        'x-correlation-id': s.approvalReference }, body: JSON.stringify(body),
    }); } catch { required(false, 'HTTP_OUTCOME_UNCONFIRMED'); }
    let value; try { value = await response.json(); } catch { required(false, 'OWNER_RESPONSE_INVALID'); }
    required(response.ok, 'HTTP_' + response.status); const result = unwrap(value);
    required(result.contractVersion === 1 && result.tenant === s.tenant && result.sourceModule === 'digitalCore' &&
      result.sourceType === 'DIGITAL_COUPON_EXPIRING' && JSON.stringify(result.source) === JSON.stringify(body) &&
      result.eligible === expected.eligible && (!result.eligible || object(result.ownerRef) &&
        Number.isFinite(Date.parse(result.expiresAt)) && Date.parse(result.expiresAt) > Date.now()), 'REMINDER_SOURCE_UNCONFIRMED');
    evidence.push({ enterpriseCode: expected.enterpriseCode, entitlementCode: expected.entitlementCode,
      occurrenceKey: expected.occurrenceKey, eligible: result.eligible });
  }
  return { contractVersion: 1, state: 'PASSED', approvalReference: s.approvalReference, sources: evidence,
    deliveryQualified: false, deliveryOwner: 'communication' };
}
export async function runConfiguredDigitalCouponReminderSourceAcceptance(options = {}) {
  const context = await createAcceptanceContext(options);
  const selection = options.selection || selectDigitalCouponReminderSourceAcceptance(
    projectRuntimeAcceptance(context.projectRoot, context.configuration, { role: 'COMMERCE' }), options.acceptanceName || defaultAcceptanceName);
  const raw = context.environment.NODICS_DIGITAL_REMINDER_SOURCE_TOKEN || '';
  const session = options.session || { authorization: raw.startsWith('Bearer ') ? raw : raw ? 'Bearer ' + raw : '',
    enterpriseCode: selection.runtimeEnterpriseCode };
  return runDigitalCouponReminderSourceAcceptance({ ...options, selection, session,
    baseUrl: options.baseUrl || projectEndpointUrl(context.configuration, { role: 'COMMERCE' }) });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--help')) console.log('acceptance:digital-coupon-reminder-source --execute [--acceptance=<name>]; source-only qualification using NODICS_DIGITAL_REMINDER_SOURCE_TOKEN; Communication delivery is separate.');
  else runConfiguredDigitalCouponReminderSourceAcceptance({ execute: process.argv.includes('--execute'),
    acceptanceName: digitalCouponReminderSourceAcceptanceArgument(process.argv.slice(2)) })
    .then(result => console.log(JSON.stringify(result))).catch(error => { console.error(error.message); process.exitCode = 1; });
}
