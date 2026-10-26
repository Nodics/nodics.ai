/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const { isDeepStrictEqual: same } = require('node:util');
/** @module digitalCore/service/defaultDigitalCouponReminderProcessService
 * @description Admits claimed Process reminder sweeps and Communication eligibility reads on the existing Digital owner.
 * @owner digitalCore @layer service
 * @override Preserve original runtime namespace, exact deployment/business grants and single-use Process claim; no client execution context or recipient authority.
 */
module.exports = {
  /** Rejects unavailable proof with no private transport or identity details. */
  fail: function () { throw new CLASSES.NodicsError('ERR_DIGITAL_NOTIFICATION_UNCONFIRMED'); },
  /** Requires an exact selected runtime/business binding independently of its existing permission. */
  assertCaller: function (r, selection, enterpriseCode) {
    const a = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(r, 'digitalCore');
    const principal = a.enterpriseCode || a.entCode, p = CONFIG.get('digitalCore')?.couponReminders;
    if (!p?.enabled || a.principalType !== 'service' || a.isSystem || a.tenant !== r.tenant ||
        !a.permissions?.includes('commerce.digital.notification.read') ||
        !a.modules?.includes(selection === 'sweepCallers' ? 'workflow' : 'commsApi') ||
        [r.enterpriseCode, r.entCode, a.enterpriseCode, a.entCode, r.httpRequest?.headers?.['x-enterprise-code']]
          .some(v => v !== undefined && v !== principal) ||
        (CONFIG.get('runtimeRole')?.code || CONFIG.get('runtimeRole')) !== 'COMMERCE') this.fail();
    const grants = Array.isArray(p[selection]) ? p[selection].filter(g =>
      g.tenant === r.tenant && g.principalEnterpriseCode === principal &&
      typeof g.enterpriseCode === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(g.enterpriseCode) &&
      (enterpriseCode === undefined || g.enterpriseCode === enterpriseCode) &&
      g.serviceId === a.serviceId && ['projectCode', 'environmentCode', 'serverCode', 'instanceCode', 'assignmentCode']
        .every(k => typeof g[k] === 'string' && g[k] && g[k] === a.runtimeScope?.[k]) &&
      g.instanceCode === a.runtimeInstanceId && g.environmentCode === NODICS.getSelectedEnvironmentName()) : [];
    if (enterpriseCode === undefined ? grants.length < 1 : grants.length !== 1) this.fail();
    return a;
  },
  /** Reads a private command once; alternate bodies, tenant aliases and query selectors cannot change it. */
  input: function (r) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(r);
    const body = r.body ?? r.payload ?? r.httpRequest?.body;
    if (!body || typeof body !== 'object' || Array.isArray(body) ||
        [r.body, r.payload, r.httpRequest?.body].some(v => v !== undefined && !same(v, body)) ||
        [r.tenantCode, r.authData?.tenant, r.authData?.tenantCode, r.httpRequest?.headers?.['x-tenant-code']]
          .some(v => v !== undefined && v !== r.tenant) ||
        Object.keys(r.query || {}).length || Object.keys(r.httpRequest?.query || {}).length) this.fail();
    return structuredClone(body);
  },
  /** Claims an owner-published Process action before scanning its exact reviewed business partition. */
  sweep: async function (r) {
    // Fixed owner stages expose neither the original exception nor private request data.
    let stage = 'PRIVACY';
    try {
      SERVICE.DefaultLoggerService.assertSensitiveRequest(r);
      stage = 'INPUT';
      const input = this.input(r), snapshot = structuredClone(r.authData), policy = structuredClone(CONFIG.get('digitalCore')?.couponReminders);
      stage = 'AUTHORITY';
      const auth = this.assertCaller(r, 'sweepCallers');
      stage = 'INPUT';
      if (Object.keys(input).sort().join(',') !== 'executionCode,instanceCode' ||
          !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(input.instanceCode) ||
          !/^[0-9a-f-]{36}$/.test(input.executionCode) || !policy?.enabled) this.fail();
      stage = 'POLICY';
      const target = policy.actionAuthority;
      const bytes = policy.validation?.claimResponseBytes;
      if (!target?.connectionName || target.connectionName === 'default' || target.runtimeRole !== 'PROCESS' ||
          !Number.isSafeInteger(bytes?.minimum) || !Number.isSafeInteger(bytes?.maximum) ||
          bytes.minimum < 1 || bytes.minimum > bytes.maximum ||
          !Number.isSafeInteger(target.maxResponseBytes) || target.maxResponseBytes < bytes.minimum || target.maxResponseBytes > bytes.maximum ||
          !Number.isSafeInteger(target.timeoutMs) || target.timeoutMs < policy.delivery.validation.timeoutMs.minimum || target.timeoutMs > policy.delivery.validation.timeoutMs.maximum) this.fail();
      // The opaque handle is the only caller payload. Process supplies the retained context.
      stage = 'CLAIM_TRANSPORT';
      let result = await SERVICE.DefaultModuleService.invokeModule({ local: false, moduleName: 'workflow',
        connectionName: target.connectionName, targetAuthority: { runtimeRole: target.runtimeRole }, tenant: r.tenant,
        requireInternalAuth: true, methodName: 'POST', apiName: '/instances/' + encodeURIComponent(input.instanceCode) + '/actions/claim',
        requestBody: { executionCode: input.executionCode, actionKey: 'digitalCore.couponExpirySweep', sourceRuntimeInstanceId: auth.runtimeInstanceId },
        timeoutMs: target.timeoutMs, maxAttempts: 1, followRedirects: false, maxResponseBytes: target.maxResponseBytes });
      stage = 'CLAIM_PROOF';
      for (let depth = 0; depth < 6 && (result?.data !== undefined || result?.result !== undefined); depth++) {
        if (result.error || result.success === false || /^ERR_/.test(result.code || '')) this.fail();
        result = result.data ?? result.result;
      }
      const context = result?.instance?.context;
      if (result?.instance?.code !== input.instanceCode || result.executionCode !== input.executionCode ||
          !context || !same(input, this.input(r)) || !same(snapshot, r.authData) ||
          !same(policy, CONFIG.get('digitalCore')?.couponReminders)) this.fail();
      this.assertCaller(r, 'sweepCallers', context.enterpriseCode);
      const execution = { instance: { ...result.instance, tenant: r.tenant }, context,
        node: { action: { moduleName: 'digitalCore', operation: 'couponExpirySweep' } }, payload: {} };
      stage = 'SOURCE';
      return await SERVICE.DefaultDigitalCommerceCouponReminderService.sweep(r, execution);
    } catch (error) {
      // Only fixed transport classes survive; messages and diagnostic payloads never do.
      if (stage === 'CLAIM_TRANSPORT') {
        const failure = error?.metadata?.runtimeInvocationDiagnostic?.failureCode;
        // nService normalizes Error first, then attaches bounded HTTP/network evidence.
        // Its responseCode is the normalized Nodics status, not the remote HTTP status.
        const httpStatus = error?.metadata?.remoteHttpFailure?.httpStatus ??
          error?.metadata?.transportFailure?.httpStatus ?? error?.status;
        const transportCode = error?.metadata?.transportFailure?.code ?? error?.code;
        if (failure === 'INTERNAL_TOKEN_UNAVAILABLE') stage = 'CLAIM_CREDENTIAL';
        else if (failure === 'REMOTE_ENDPOINT_UNAVAILABLE') stage = 'CLAIM_ENDPOINT';
        else if (httpStatus === 404) stage = 'CLAIM_HTTP_NOT_FOUND';
        else if ([401, 403].includes(httpStatus)) stage = 'CLAIM_HTTP_AUTHORITY';
        else if (httpStatus === 409) stage = 'CLAIM_HTTP_CONFLICT';
        else if ([500, 502, 503, 504].includes(httpStatus)) stage = 'CLAIM_HTTP_SERVER';
        else if (['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ESOCKETTIMEDOUT', 'EPIPE', 'ENETUNREACH', 'EHOSTUNREACH', 'ENOTFOUND', 'EAI_AGAIN', 'EOPENBREAKER'].includes(transportCode) || error?.name === 'AbortError') stage = 'CLAIM_NETWORK';
        else if (error instanceof TypeError || error instanceof ReferenceError) stage = 'CLAIM_LOCAL';
      }
      // Never carry an untrusted remote code/message, stack, cause or payload across this boundary.
      throw new CLASSES.NodicsError('ERR_DIGITAL_REMINDER_' + stage);
    }
  },
  /** Revalidates only frozen intent coordinates; Communication retains all send/retry state. */
  dispatchEligibility: async function (r) {
    const input = this.input(r), policy = structuredClone(CONFIG.get('digitalCore')?.couponReminders), auth = structuredClone(r.authData);
    if (Object.keys(input).sort().join(',') !== 'channel,expiresAt,idempotencyKey,intentCode,purpose,recipientAddressReference,recipientId,sourceCode,sourceModule,sourceType') this.fail();
    let pair;
    try { pair = JSON.parse(Buffer.from(input.sourceCode, 'base64url').toString()); } catch (_) { this.fail(); }
    if (!Array.isArray(pair) || pair.length !== 2) this.fail();
    this.assertCaller(r, 'dispatchCallers', pair[0]);
    const result = await SERVICE.DefaultDigitalCouponReminderDeliveryService.isDispatchEligible({ ...input, tenant: r.tenant });
    if (!same(input, this.input(r)) || !same(auth, r.authData) || !same(policy, CONFIG.get('digitalCore')?.couponReminders)) this.fail();
    this.assertCaller(r, 'dispatchCallers', pair[0]);
    return result;
  },
};
