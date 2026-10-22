/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto"), { isDeepStrictEqual } = require("node:util");

/** @module profile/service/identity/defaultProfileTransferNotificationRecipientService @description Resolves opted-in canonical inbox recipients only after Wallet proves the committed typed source owner. @layer service @owner profile @override Narrow policy without replacing source proof, exact tenant, explicit Enterprise roster or recipient preferences. */
module.exports = {
  /** Refuses without exposing source, identity or transport diagnostics. */
  fail: function () { throw new CLASSES.NodicsError("ERR_AUTH_00003"); },
  /** Validates a canonical reference, never a contact address. */
  identifier: function (value) { return typeof value === "string" && value === value.trim() && /^[A-Za-z0-9_.:@|-]{1,200}$/.test(value); },
  /** Reads complete framework transport and recipient bounds without enabling anything. */
  policy: function () {
    const p = CONFIG.get("profileTransferNotifications");
    if (p?.enabled !== true || p.qualified !== true || !this.identifier(p.sourceConnectionName) ||
        !Number.isSafeInteger(p.timeoutMs) || p.timeoutMs < 1 || typeof p.allowInsecureLoopback !== "boolean" ||
        !Number.isSafeInteger(p.maxResponseBytes) || p.maxResponseBytes < 1 ||
        !Number.isSafeInteger(p.maximumRecipients) || p.maximumRecipients < 1 || !this.identifier(p.permission)) this.fail();
    SERVICE.DefaultProfileNotificationRecipientService.policy({ ...p.recipientSelection, maximumRecipients: p.maximumRecipients });
    return structuredClone(p);
  },
  /** Reads exact committed accounting evidence through existing runtime-credential transport, never service flags. */
  source: async function (scope, body, p) {
    const invocation = { local: false, moduleName: "loyaltyApi", connectionName: p.sourceConnectionName,
      targetAuthority: { runtimeRole: "LOYALTY" }, apiName: "/internal/transfers/notification-source", methodName: "POST",
      tenant: scope.tenant, request: { tenant: scope.tenant }, requestBody: { ...body.source, channel: body.channel },
      requireInternalAuth: true, timeoutMs: p.timeoutMs, maxAttempts: 1, maxResponseBytes: p.maxResponseBytes, followRedirects: false,
      secureTransport: { required: true, allowInsecureLoopback: p.allowInsecureLoopback } };
    const response = await SERVICE.DefaultLoggerService.runSensitiveOperation(invocation,
      () => SERVICE.DefaultModuleService.invokeModule(invocation));
    const proof = SERVICE.DefaultProfileCommerceNotificationRecipientService.unwrap(response);
    if (proof.contractVersion !== 1 || proof.committed !== true || proof.tenant !== scope.tenant ||
        proof.sourceModule !== "loyaltyWallet" || proof.sourceType !== "LOYALTY_TRANSFER_COMPLETED" ||
        proof.sourceCode !== body.source.operationCode || proof.side !== body.source.side || proof.channel !== "IN_APP" ||
        !/^[a-f0-9]{64}$/.test(proof.sourceDigest || "") || !["CUSTOMER", "ENTERPRISE"].includes(proof.owner?.ownerType) ||
        !this.identifier(proof.owner.ownerCode) || Object.keys(proof.owner).sort().join(",") !== "ownerCode,ownerType") this.fail();
    return { contractVersion: 1, tenant: proof.tenant, sourceCode: proof.sourceCode, side: proof.side,
      sourceDigest: proof.sourceDigest, owner: structuredClone(proof.owner) };
  },
  /** Binds source evidence to an existing canonical Customer or Employee inbox identity, never a contact address. */
  recipient: function (scope, proof, recipientId) {
    return { recipientId, recipientAddressReference: "profile-inbox:" + crypto.createHash("sha256")
      .update(JSON.stringify([scope.tenant, proof.sourceCode, proof.sourceDigest, proof.side, proof.owner, recipientId])).digest("hex") };
  },
  /** Resolves exact committed-source recipients and rereads source after preference/roster checks; never sends or stores a new queue. */
  resolve: async function (request) {
    try {
      SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
      const p = this.policy(), auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "profile");
      const body = request.body ?? request.payload ?? request.httpRequest?.body;
      if (auth.principalType !== "service" || auth.isSystem || !auth.modules.includes("loyaltyWallet") || !Array.isArray(auth.permissions) || !auth.permissions.includes(p.permission) ||
          request.entCode !== undefined && request.entCode !== auth.entCode || !body ||
          Object.keys(body).sort().join(",") !== "channel,source" || body.channel !== "IN_APP" || !body.source ||
          Object.keys(body.source).sort().join(",") !== "operationCode,side" || !this.identifier(body.source.operationCode) ||
          !["SENDER", "RECIPIENT"].includes(body.source.side) || Object.keys(request.query || {}).length) this.fail();
      const scope = { tenant: auth.tenant }, input = structuredClone(body), original = structuredClone(auth);
      const headers = structuredClone(request.httpRequest?.headers), enterprise = original.entCode || original.enterpriseCode;
      const bound = () => {
        SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
        if (request.tenant !== scope.tenant ||
            [request.tenantCode, original.tenantCode, headers?.["x-tenant-code"]].some(v => v !== undefined && v !== scope.tenant) ||
            [request.entCode, request.enterpriseCode, original.entCode, original.enterpriseCode, headers?.["x-enterprise-code"]].some(v => v !== undefined && v !== enterprise) ||
            !isDeepStrictEqual(request.httpRequest?.headers, headers) ||
            !isDeepStrictEqual(request.authData, original) ||
            !isDeepStrictEqual(body, input) || !isDeepStrictEqual(this.policy(), p) ||
            [request.body, request.payload, request.httpRequest?.body].some(value => value !== undefined && !isDeepStrictEqual(value, input)) ||
            Object.keys(request.query || {}).length || Object.keys(request.httpRequest?.query || {}).length) this.fail();
      };
      bound();
      const proof = await this.source(scope, input, p); bound();
      const selector = SERVICE.DefaultProfileNotificationRecipientService;
      const ownerRef = { type: proof.owner.ownerType, code: proof.owner.ownerCode };
      const policy = { ...p.recipientSelection, maximumRecipients: p.maximumRecipients };
      const selected = await selector.select(request, ownerRef, policy); bound();
      const current = await this.source(scope, input, p); bound();
      if (!isDeepStrictEqual(proof, current)) this.fail();
      const refreshed = await selector.select(request, ownerRef, policy); bound();
      if (!isDeepStrictEqual(selected, refreshed)) this.fail();
      const recipients = selected.map(recipientId => this.recipient(scope, proof, recipientId));
      return { ...proof, channel: "IN_APP", recipients };
    } catch (_) { this.fail(); }
  },
};
