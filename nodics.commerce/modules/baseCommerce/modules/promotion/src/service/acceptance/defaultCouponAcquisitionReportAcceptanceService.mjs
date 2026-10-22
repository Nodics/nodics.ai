/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module promotion/acceptance/defaultCouponAcquisitionReportAcceptanceService
 * @description Executes one owner refresh and verifies the protected report coverage through canonical HTTP APIs.
 * @layer tooling @owner promotion
 */
import { pathToFileURL } from 'node:url';
import properties from '../../../config/properties.js';
import { createAcceptanceContext } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { projectEndpointUrl, projectRuntimeAcceptance } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';

const defaultAcceptanceName = 'couponAcquisitionReport';
const id = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(value);
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const required = (value, code) => { if (!value) throw Object.assign(new Error(code), { code }); };
function unwrap(value) {
  for (let depth = 0; depth < 8; depth += 1) {
    required(object(value) && value.success !== false && !value.error &&
      !(typeof value.code === 'string' && value.code.startsWith('ERR_')), 'OWNER_RESPONSE_REFUSED');
    const data = Object.hasOwn(value, 'data'), result = Object.hasOwn(value, 'result');
    required(!(data && result), 'OWNER_RESPONSE_AMBIGUOUS');
    if (!data && !result) return value;
    value = data ? value.data : value.result;
  }
  required(false, 'OWNER_RESPONSE_DEPTH');
}
export function selectCouponAcquisitionReportAcceptance(profiles, name = defaultAcceptanceName) {
  required(object(profiles) && Object.hasOwn(profiles, name), 'COUPON_REPORT_ACCEPTANCE_UNAVAILABLE');
  return profiles[name];
}
export function couponAcquisitionReportAcceptanceArgument(args = []) {
  const values = args.filter(value => value.startsWith('--acceptance=')); required(values.length <= 1, 'ONE_ACCEPTANCE_SELECTION_REQUIRED');
  const name = values[0]?.slice(13) || defaultAcceptanceName; required(/^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(name), 'ACCEPTANCE_NAME_INVALID'); return name;
}
function input(options) {
  required(options.execute === true, 'EXPLICIT_EXECUTION_REQUIRED');
  let url; try { url = new URL(options.baseUrl); } catch { required(false, 'LOCAL_HTTP_TARGET_REQUIRED'); }
  required(['http:', 'https:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
    !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash, 'LOCAL_HTTP_TARGET_REQUIRED');
  const selection = structuredClone(options.selection), keys = ['contractVersion', 'approvalReference', 'tenant', 'channelCode',
    'promotionCode', 'enterpriseCode', 'view'];
  required(object(selection) && Object.keys(selection).length === keys.length && keys.every(key => Object.hasOwn(selection, key)) &&
    selection.contractVersion === 1 && ['approvalReference', 'tenant', 'channelCode', 'promotionCode', 'enterpriseCode'].every(key => id(selection[key])) &&
    ['ISSUER', 'REDEEMER'].includes(selection.view), 'REVIEWED_REPORT_SELECTION_REQUIRED');
  const sessions = options.sessions;
  required(object(sessions) && Object.keys(sessions).length === 2 &&
    /^Bearer [^\s]{1,16384}$/i.test(sessions.scheduler?.authorization || '') &&
    /^Bearer [^\s]{1,16384}$/i.test(sessions.reporter?.authorization || '') &&
    sessions.reporter.enterpriseCode === selection.enterpriseCode, 'ORIGINAL_REPORT_SESSIONS_REQUIRED');
  const policy = { ...properties.promotion.acquisitionReporting.acceptance, ...(options.policy || {}) };
  required(object(policy) && Object.keys(policy).length === 1 && Number.isSafeInteger(policy.requestTimeoutMs) &&
    policy.requestTimeoutMs >= 1 && policy.requestTimeoutMs <= 300000, 'COUPON_REPORT_ACCEPTANCE_POLICY_REQUIRED');
  return { selection, sessions, policy, baseUrl: url.origin };
}
export async function runCouponAcquisitionReportAcceptance(options = {}) {
  const { selection: s, sessions, policy, baseUrl } = input(options), fetchRequest = options.fetch || globalThis.fetch;
  async function post(session, route, body) {
    let response; try { response = await fetchRequest(new URL('/nodics/promotion/v0' + route, baseUrl), {
      method: 'POST', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(policy.requestTimeoutMs),
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', tenant: s.tenant,
        ...(session.enterpriseCode ? { 'x-enterprise-code': session.enterpriseCode } : {}), Authorization: session.authorization,
        'x-correlation-id': s.approvalReference }, body: JSON.stringify(body),
    }); } catch { required(false, 'HTTP_OUTCOME_UNCONFIRMED'); }
    let value; try { value = await response.json(); } catch { required(false, 'OWNER_RESPONSE_INVALID'); }
    required(response.ok, 'HTTP_' + response.status); return unwrap(value);
  }
  const refresh = await post(sessions.scheduler, '/internal/acquisition-report/refresh', { channelCode: s.channelCode });
  required(refresh.contractVersion === 1 && ['COMPLETE', 'NOT_DUE'].includes(refresh.status) &&
    refresh.channelCode === s.channelCode && refresh.timezone === 'UTC' && Number.isFinite(Date.parse(refresh.dataUpdatedThrough)) &&
    new Date(refresh.dataUpdatedThrough).toISOString() === refresh.dataUpdatedThrough, 'REPORT_REFRESH_UNCONFIRMED');
  const report = await post(sessions.reporter, '/promotions/' + encodeURIComponent(s.promotionCode) + '/acquisition-report',
    { promotionCode: s.promotionCode, channelCode: s.channelCode, view: s.view });
  required(report.contractVersion === 2 && report.status === 'AVAILABLE' && report.promotionCode === s.promotionCode &&
    report.channelCode === s.channelCode && report.view === s.view && report.timezone === 'UTC' &&
    report.dataUpdatedThrough === refresh.dataUpdatedThrough && typeof report.protected === 'boolean' &&
    (report.protected ? report.counts === null && report.rates === null : object(report.counts) && object(report.rates)),
  'REPORT_COVERAGE_UNCONFIRMED');
  return { contractVersion: 1, state: 'PASSED', approvalReference: s.approvalReference, refreshStatus: refresh.status,
    dataUpdatedThrough: report.dataUpdatedThrough, protected: report.protected };
}
export async function runConfiguredCouponAcquisitionReportAcceptance(options = {}) {
  const context = await createAcceptanceContext(options);
  const selection = options.selection || selectCouponAcquisitionReportAcceptance(
    projectRuntimeAcceptance(context.projectRoot, context.configuration, { role: 'COMMERCE' }), options.acceptanceName || defaultAcceptanceName);
  const bearer = key => { const raw = context.environment[key] || ''; return raw.startsWith('Bearer ') ? raw : raw ? 'Bearer ' + raw : ''; };
  const sessions = options.sessions || { scheduler: { authorization: bearer('NODICS_COUPON_REPORT_SCHEDULER_TOKEN') },
    reporter: { authorization: bearer('NODICS_COUPON_REPORT_EMPLOYEE_TOKEN'), enterpriseCode: selection.enterpriseCode } };
  return runCouponAcquisitionReportAcceptance({ ...options, selection, sessions,
    baseUrl: options.baseUrl || projectEndpointUrl(context.configuration, { role: 'COMMERCE' }) });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--help')) console.log('acceptance:coupon-acquisition-report --execute [--acceptance=<name>]; uses reviewed existing report fixtures and original scheduler/employee tokens.');
  else runConfiguredCouponAcquisitionReportAcceptance({ execute: process.argv.includes('--execute'),
    acceptanceName: couponAcquisitionReportAcceptanceArgument(process.argv.slice(2)) })
    .then(result => console.log(JSON.stringify(result))).catch(error => { console.error(error.message); process.exitCode = 1; });
}
