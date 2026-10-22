/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const { createHash } = require("node:crypto"), { isDeepStrictEqual: same } = require("node:util");
/** @module profile/service/identity/defaultProfileGiftNotificationRecipientService @description Resolves whole-gift source-proven participants through current Profile identity, permission, scope and consent without changing gift decisions or Communication ownership. @layer service @owner profile */
module.exports = {
  /** Redacts private source and identity diagnostics. */
  fail: function () { throw new CLASSES.NodicsError("ERR_AUTH_00003"); },
  /** Shares canonical bounded identity validation, never contact/destination selection. */
  identifier: function (value) { return SERVICE.DefaultProfileNotificationRecipientService.identifier(value); },
  /** Requires complete framework definitions and separate explicit activation/qualification. */
  policy: function () {
    const p = CONFIG.get("profileGiftNotifications");
    if (p?.enabled !== true || p.qualified !== true || typeof p.allowInsecureLoopback !== "boolean" ||
        !Number.isSafeInteger(p.timeoutMs) || p.timeoutMs < 1 || p.timeoutMs > 60000 ||
        !Number.isSafeInteger(p.maxResponseBytes) || p.maxResponseBytes < 1 ||
        !Array.isArray(p.events) || !p.events.length || p.events.length > 20 || new Set(p.events).size !== p.events.length ||
        p.events.some(v => typeof v !== "string" || v !== v.trim() || !/^[A-Z_]+$/.test(v))) this.fail();
    this.identifier(p.permission); this.identifier(p.sourceConnectionName);
    SERVICE.DefaultProfileNotificationRecipientService.policy({ ...p.recipientSelection, maximumRecipients: p.maximumRecipients });
    return structuredClone(p);
  },
  /** Digital alone proves original participants, manifest and complete component receipts in the selected business partition. */
  source: async function (tenant, input, p) {
    const call = { local: false, moduleName: "digitalCore", connectionName: p.sourceConnectionName,
      targetAuthority: { runtimeRole: "COMMERCE" }, apiName: "/internal/bundles/gifts/notification-source", methodName: "POST",
      tenant, request: { tenant }, requestBody: { ...input.source, channel: input.channel }, requireInternalAuth: true,
      timeoutMs: p.timeoutMs, maxAttempts: 1, maxResponseBytes: p.maxResponseBytes, followRedirects: false,
      secureTransport: { required: true, allowInsecureLoopback: p.allowInsecureLoopback } };
    const proof = SERVICE.DefaultProfileCommerceNotificationRecipientService.unwrap(await SERVICE.DefaultLoggerService.runSensitiveOperation(call,
      () => SERVICE.DefaultModuleService.invokeModule(call)));
    if (!proof || proof.contractVersion !== 1 || proof.tenant !== tenant || proof.sourceModule !== "digitalCore" ||
        proof.sourceType !== "DIGITAL_BUNDLE_GIFT_" + input.source.event || !same(proof.source, input.source) ||
        proof.channel !== "IN_APP" || typeof proof.eligible !== "boolean") this.fail();
    if (proof.eligible) {
      if (typeof proof.sourceDigest !== "string" || proof.sourceDigest.length !== 64 || !/^[a-f0-9]{64}$/.test(proof.sourceDigest) ||
          !proof.ownerRef || Object.keys(proof.ownerRef).sort().join(",") !== "code,type" ||
          !["CUSTOMER", "ENTERPRISE"].includes(proof.ownerRef.type)) this.fail();
      this.identifier(proof.ownerRef.code);
    } else if (proof.ownerRef !== undefined || proof.sourceDigest !== undefined) this.fail();
    return { contractVersion: 1, tenant, sourceModule: "digitalCore", sourceType: proof.sourceType,
      source: structuredClone(proof.source), channel: "IN_APP", eligible: proof.eligible,
      ...(proof.eligible ? { sourceDigest: proof.sourceDigest, ownerRef: structuredClone(proof.ownerRef) } : {}) };
  },
  /** Exact source-only API: current source and recipient authority must agree twice before opaque references leave Profile. */
  resolve: async function (request) {
    try {
      SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
      const p = this.policy(), auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "profile");
      const body = request.body ?? request.payload ?? request.httpRequest?.body, tenant = this.identifier(request.tenant);
      if (request.transactionContext !== undefined || auth.principalType !== "service" || auth.isSystem || auth.tenant !== tenant ||
          !Array.isArray(auth.modules) || !auth.modules.includes("digitalCore") || !Array.isArray(auth.permissions) || !auth.permissions.includes(p.permission) ||
          !body || Object.keys(body).sort().join(",") !== "channel,source" || body.channel !== "IN_APP" || !body.source ||
          Object.keys(body.source).sort().join(",") !== "enterpriseCode,event,operationCode,side") this.fail();
      for (const value of Object.values(body.source)) this.identifier(value);
      if (!/^bundle-operation:[a-f0-9]{64}$/.test(body.source.operationCode) || !p.events.includes(body.source.event) ||
          !["SENDER", "RECIPIENT"].includes(body.source.side)) this.fail();
      const pin = structuredClone({ auth, body, headers: request.httpRequest?.headers }), enterprise = auth.entCode;
      const bound = () => {
        SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
        if (request.transactionContext !== undefined || request.tenant !== tenant || !same(this.policy(), p) || !same(request.authData, pin.auth) ||
            !same(body, pin.body) || !same(request.httpRequest?.headers, pin.headers) ||
            [request.tenantCode, auth.tenantCode, pin.headers?.["x-tenant-code"]].some(v => v !== undefined && v !== tenant) ||
            [request.entCode, request.enterpriseCode, auth.enterpriseCode, pin.headers?.["x-enterprise-code"]].some(v => v !== undefined && v !== enterprise) ||
            [request.body, request.payload, request.httpRequest?.body].some(v => v !== undefined && !same(v, pin.body)) ||
            Object.keys(request.query || {}).length || Object.keys(request.httpRequest?.query || {}).length) this.fail();
      };
      bound(); const proof = await this.source(tenant, pin.body, p); bound();
      const selector = SERVICE.DefaultProfileNotificationRecipientService, policy = { ...p.recipientSelection, maximumRecipients: p.maximumRecipients };
      const selected = proof.eligible ? await selector.select(request, proof.ownerRef, policy) : []; bound();
      const current = await this.source(tenant, pin.body, p); bound();
      if (!same(proof, current)) this.fail();
      const refreshed = current.eligible ? await selector.select(request, current.ownerRef, policy) : []; bound();
      if (!same(selected, refreshed)) this.fail();
      return { ...proof, recipients: selected.map(recipientId => ({ recipientId,
        recipientAddressReference: "profile-inbox:" + createHash("sha256")
          .update(JSON.stringify([tenant, proof.source, proof.sourceDigest, proof.ownerRef, recipientId])).digest("hex") })) };
    } catch (_) { this.fail(); }
  },
};
