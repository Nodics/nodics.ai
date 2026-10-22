/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto"), { isDeepStrictEqual: same } = require("node:util");
/** @module profile/service/identity/defaultProfileCouponNotificationRecipientService @description Resolves source-proven coupon owners to current opted-in Customer or explicitly authorized Employee inboxes; no purchase actor or contact fallback. @layer service @owner profile */
module.exports = {
  /** Refuses unavailable authority without leaking identity or source details. */
  fail: function () { throw new CLASSES.NodicsError("ERR_AUTH_00003"); },
  /** Requires bounded canonical identifiers. */
  identifier: function (value) { if (typeof value !== "string" || value !== value.trim() || !/^[A-Za-z0-9_.:@|-]{1,128}$/.test(value)) this.fail(); return value; },
  /** Reads framework defaults only; business recipients and preferences remain persisted Profile records. */
  policy: function () {
    const p = CONFIG.get("profileCouponNotifications");
    if (p?.enabled !== true || typeof p.allowInsecureLoopback !== "boolean" ||
        !Number.isSafeInteger(p.timeoutMs) || p.timeoutMs < 1 || p.timeoutMs > 60000 ||
        !Number.isSafeInteger(p.maxResponseBytes) || p.maxResponseBytes < 1 ||
        !Number.isSafeInteger(p.maximumRecipients) || p.maximumRecipients < 1 || p.maximumRecipients > 100) this.fail();
    [p.sourceConnectionName, p.permission].forEach(v => this.identifier(v));
    SERVICE.DefaultProfileNotificationRecipientService.policy({ ...p.recipientSelection, maximumRecipients: p.maximumRecipients });
    return structuredClone(p);
  },
  /** Independent Digital callback binds current entitlement, coupon, original owner and expiry. */
  source: async function (scope, body, p) {
    const call = { local: false, moduleName: "digitalCore", connectionName: p.sourceConnectionName, targetAuthority: { runtimeRole: "COMMERCE" },
      apiName: "/internal/coupons/reminder-source", methodName: "POST", tenant: scope.tenant, request: { tenant: scope.tenant },
      requestBody: { ...body.source, channel: body.channel }, requireInternalAuth: true, timeoutMs: p.timeoutMs,
      maxAttempts: 1, maxResponseBytes: p.maxResponseBytes, followRedirects: false,
      secureTransport: { required: true, allowInsecureLoopback: p.allowInsecureLoopback } };
    const proof = SERVICE.DefaultProfileCommerceNotificationRecipientService.unwrap(await SERVICE.DefaultLoggerService.runSensitiveOperation(call,
      () => SERVICE.DefaultModuleService.invokeModule(call)));
    if (proof.contractVersion !== 1 || proof.tenant !== scope.tenant || proof.sourceModule !== "digitalCore" ||
        proof.sourceType !== "DIGITAL_COUPON_EXPIRING" || !same(proof.source, call.requestBody) || typeof proof.eligible !== "boolean") this.fail();
    if (proof.eligible && (!proof.ownerRef || Object.keys(proof.ownerRef).sort().join(",") !== "code,type" ||
        !["CUSTOMER", "ENTERPRISE"].includes(proof.ownerRef.type) || !Number.isFinite(Date.parse(proof.expiresAt)) ||
        Date.parse(proof.expiresAt) <= Date.now())) this.fail();
    if (proof.eligible) this.identifier(proof.ownerRef.code);
    return proof;
  },
  /** Inactive recipients are skipped, never replaced. */
  active: function (row) { return row?.active === true && row.disabled !== true && row.registrationSuspended !== true; },
  /** Source-proofed recipient resolution; rechecks source, roster, authority, preferences and request policy across awaits. */
  resolve: async function (request) {
    try {
      SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
      const p = this.policy(), auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "profile");
      const body = request.body ?? request.payload ?? request.httpRequest?.body, tenant = this.identifier(request.tenant);
      if (auth.principalType !== "service" || auth.isSystem || auth.tenant !== tenant || !Array.isArray(auth.modules) || !auth.modules.includes("digitalCore") ||
          !Array.isArray(auth.permissions) || !auth.permissions.includes(p.permission) || !body || Object.keys(body).sort().join(",") !== "channel,source" ||
          body.channel !== "IN_APP" || !body.source || Object.keys(body.source).sort().join(",") !== "enterpriseCode,entitlementCode,occurrenceKey" ||
          !/^COUPON_EXPIRY_[a-f0-9]{64}$/.test(body.source.occurrenceKey)) this.fail();
      this.identifier(body.source.enterpriseCode); this.identifier(body.source.entitlementCode); this.identifier(body.source.occurrenceKey);
      const pin = structuredClone({ auth, body, headers: request.httpRequest?.headers }), enterprise = auth.entCode || auth.enterpriseCode;
      const bound = () => {
        SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
        if (!same(p, this.policy()) || !same(pin.auth, request.authData) || !same(pin.body, body) || request.tenant !== tenant ||
            !same(pin.headers, request.httpRequest?.headers) ||
            [request.enterpriseCode, request.entCode, auth.enterpriseCode, auth.entCode, pin.headers?.["x-enterprise-code"]].some(v => v !== undefined && v !== enterprise) ||
            [request.tenantCode, auth.tenantCode, pin.headers?.["x-tenant-code"]].some(v => v !== undefined && v !== tenant) ||
            [request.body, request.payload, request.httpRequest?.body].some(v => v !== undefined && !same(v, pin.body)) ||
            Object.keys(request.query || {}).length || Object.keys(request.httpRequest?.query || {}).length) this.fail();
      };
      bound();
      const proof = await this.source({ tenant }, pin.body, p); bound();
      const policy = { ...p.recipientSelection, maximumRecipients: p.maximumRecipients };
      const selector = SERVICE.DefaultProfileNotificationRecipientService;
      const selected = proof.eligible ? await selector.select(request, proof.ownerRef, policy) : []; bound();
      const current = await this.source({ tenant }, pin.body, p); bound();
      if (!same(proof, current)) this.fail();
      const refreshed = proof.eligible ? await selector.select(request, current.ownerRef, policy) : []; bound();
      if (!same(selected, refreshed)) this.fail();
      const recipients = selected.map(recipientId => ({ recipientId, recipientAddressReference: "profile-inbox:" + crypto.createHash("sha256")
        .update(JSON.stringify([tenant, pin.body.source, proof.ownerRef, recipientId])).digest("hex") }));
      return { contractVersion: 1, tenant, source: pin.body.source, channel: "IN_APP", eligible: proof.eligible, recipients,
        ...(proof.eligible ? { ownerRef: proof.ownerRef, expiresAt: proof.expiresAt } : {}) };
    } catch (_) { this.fail(); }
  },
  /** Resolves the authenticated Employee's own inbox namespace, never a body-selected recipient. */
  inboxIdentity: async function (request) {
    try {
      SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
      const auth = request.authData, tenant = request.tenant;
      if (auth?.principalType !== "human" || auth.tokenType !== "access" || auth.isSystem || auth.tenant !== tenant ||
          !auth.entCode || !auth.loginId || [request.query, request.body, request.payload, request.httpRequest?.query, request.httpRequest?.body]
            .some(v => v !== undefined && (!v || Object.getPrototypeOf(v) !== Object.prototype || Object.keys(v).length))) this.fail();
      const original = structuredClone(auth);
      const bound = () => {
        if (!same(original, request.authData) || request.tenant !== tenant ||
            [request.entCode, request.enterpriseCode, auth.enterpriseCode, request.httpRequest?.headers?.["x-enterprise-code"]]
              .some(v => v !== undefined && v !== auth.entCode)) this.fail();
      };
      bound(); await SERVICE.DefaultEnterpriseMembershipService.verifyAuthenticatedActor(request); bound();
      const person = await SERVICE.DefaultEmployeeService.findByLoginId({ tenant, loginId: auth.loginId, options: { recursive: false, skipItemCache: true } });
      bound();
      if (!this.active(person) || person.loginId !== auth.loginId || person.principalType !== "human") this.fail();
      const recipientId = "profile-employee:" + this.identifier(person.code);
      if (await SERVICE.DefaultEnterpriseRegistrationService.read("DefaultCustomerService", tenant, { code: recipientId })) this.fail();
      bound();
      await SERVICE.DefaultEnterpriseMembershipService.verifyAuthenticatedActor(request);
      bound();
      return { contractVersion: 1, tenant, enterpriseCode: auth.entCode, recipientId };
    } catch (_) { this.fail(); }
  },
};
