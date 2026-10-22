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
/** @module profile/service/identity/defaultProfileAuctionNotificationRecipientService @description Resolves recipients only from Bidding's retained committed auction event; shared Profile identity/permission/preferences and existing Communication inbox remain authoritative. @layer service @owner profile */
module.exports = {
  /** Redacts source, transport and identity failures at the private endpoint. */
  fail: function () { throw new CLASSES.NodicsError("ERR_AUTH_00003"); },
  /** Rejects contact selectors and malformed canonical identifiers. */
  identifier: function (value) {
    if (typeof value !== "string" || value !== value.trim() || !/^[A-Za-z0-9_.:@|-]{1,128}$/.test(value)) this.fail();
    return value;
  },
  /** Requires complete framework definitions and independent activation/qualification. */
  policy: function () {
    const p = CONFIG.get("profileAuctionNotifications");
    if (p?.enabled !== true || p.qualified !== true || typeof p.allowInsecureLoopback !== "boolean" ||
        !Number.isSafeInteger(p.timeoutMs) || p.timeoutMs < 1 || p.timeoutMs > 60000 ||
        !Number.isSafeInteger(p.maxResponseBytes) || p.maxResponseBytes < 1 ||
        !Array.isArray(p.sourceTypes) || !p.sourceTypes.length || p.sourceTypes.length > 20 ||
        new Set(p.sourceTypes).size !== p.sourceTypes.length ||
        p.sourceTypes.some(v => typeof v !== "string" || v !== v.trim() || !/^AUCTION_[A-Z_]+$/.test(v))) this.fail();
    this.identifier(p.sourceConnectionName); this.identifier(p.permission);
    SERVICE.DefaultProfileNotificationRecipientService.policy({ ...p.recipientSelection, maximumRecipients: p.maximumRecipients });
    return structuredClone(p);
  },
  /** Independently reads exact persisted event proof through Bidding's runtime-token callback, never forwarding human credentials. */
  source: async function (tenant, input, p) {
    const call = { local: false, moduleName: "bidding", connectionName: p.sourceConnectionName,
      targetAuthority: { runtimeRole: "COMMERCE" }, apiName: "/internal/auctions/notification-source", methodName: "POST",
      tenant, request: { tenant }, requestBody: { ...input.source, channel: input.channel }, requireInternalAuth: true,
      timeoutMs: p.timeoutMs, maxAttempts: 1, maxResponseBytes: p.maxResponseBytes, followRedirects: false,
      secureTransport: { required: true, allowInsecureLoopback: p.allowInsecureLoopback } };
    const proof = SERVICE.DefaultProfileCommerceNotificationRecipientService.unwrap(await SERVICE.DefaultLoggerService.runSensitiveOperation(call,
      () => SERVICE.DefaultModuleService.invokeModule(call)));
    if (!proof || proof.contractVersion !== 1 || proof.committed !== true || proof.tenant !== tenant ||
        proof.sourceModule !== "bidding" || !p.sourceTypes.includes(proof.sourceType) ||
        proof.sourceCode !== input.source.eventCode || proof.eventCode !== input.source.eventCode ||
        proof.roundCode !== input.source.roundCode || proof.storeCode !== input.source.storeCode || proof.channel !== "IN_APP" ||
        typeof proof.sourceDigest !== "string" || proof.sourceDigest.length !== 64 || !/^[a-f0-9]{64}$/.test(proof.sourceDigest) ||
        !proof.owner || Object.keys(proof.owner).sort().join(",") !== "ownerCode,ownerType" ||
        !["CUSTOMER", "ENTERPRISE"].includes(proof.owner.ownerType)) this.fail();
    this.identifier(proof.owner.ownerCode);
    return { contractVersion: 1, committed: true, tenant, sourceModule: "bidding", sourceType: proof.sourceType,
      sourceCode: proof.sourceCode, sourceDigest: proof.sourceDigest, roundCode: proof.roundCode,
      eventCode: proof.eventCode, storeCode: proof.storeCode, channel: "IN_APP", owner: structuredClone(proof.owner) };
  },
  /** Private exact-source endpoint: source, identity and policy are reread; no contacts, writes, grants or delivery side effects. */
  resolve: async function (request) {
    try {
      SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
      const p = this.policy(), auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "profile");
      const body = request.body ?? request.payload ?? request.httpRequest?.body, tenant = this.identifier(request.tenant);
      if (auth.principalType !== "service" || auth.isSystem || auth.tenant !== tenant || !Array.isArray(auth.modules) ||
          !auth.modules.includes("bidding") || !Array.isArray(auth.permissions) || !auth.permissions.includes(p.permission) ||
          !body || Object.keys(body).sort().join(",") !== "channel,source" || body.channel !== "IN_APP" ||
          !body.source || Object.keys(body.source).sort().join(",") !== "eventCode,roundCode,storeCode") this.fail();
      for (const value of Object.values(body.source)) this.identifier(value);
      if (!/^AUCTION_[a-f0-9]{64}$/.test(body.source.roundCode) || !/^AUCTION_EVENT_[a-f0-9]{64}$/.test(body.source.eventCode)) this.fail();
      const pin = structuredClone({ auth, body, headers: request.httpRequest?.headers }), enterprise = auth.entCode || auth.enterpriseCode;
      const bound = () => {
        SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
        if (!same(this.policy(), p) || !same(request.authData, pin.auth) || !same(body, pin.body) || request.tenant !== tenant ||
            !same(request.httpRequest?.headers, pin.headers) ||
            [request.tenantCode, auth.tenantCode, pin.headers?.["x-tenant-code"]].some(v => v !== undefined && v !== tenant) ||
            [request.entCode, request.enterpriseCode, auth.entCode, auth.enterpriseCode, pin.headers?.["x-enterprise-code"]].some(v => v !== undefined && v !== enterprise) ||
            [request.body, request.payload, request.httpRequest?.body].some(v => v !== undefined && !same(v, pin.body)) ||
            Object.keys(request.query || {}).length || Object.keys(request.httpRequest?.query || {}).length) this.fail();
      };
      bound(); const proof = await this.source(tenant, pin.body, p); bound();
      const selector = SERVICE.DefaultProfileNotificationRecipientService;
      const ownerRef = { type: proof.owner.ownerType, code: proof.owner.ownerCode };
      const policy = { ...p.recipientSelection, maximumRecipients: p.maximumRecipients };
      const selected = await selector.select(request, ownerRef, policy); bound();
      const current = await this.source(tenant, pin.body, p); bound();
      if (!same(proof, current)) this.fail();
      const refreshed = await selector.select(request, ownerRef, policy); bound();
      if (!same(selected, refreshed)) this.fail();
      return { ...proof, recipients: selected.map(recipientId => ({ recipientId,
        recipientAddressReference: "profile-inbox:" + createHash("sha256")
          .update(JSON.stringify([tenant, proof.sourceCode, proof.sourceDigest, proof.owner, recipientId])).digest("hex") })) };
    } catch (_) { this.fail(); }
  },
};
