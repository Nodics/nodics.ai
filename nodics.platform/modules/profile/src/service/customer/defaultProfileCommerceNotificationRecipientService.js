/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/service/customer/DefaultProfileCommerceNotificationRecipientService @description Resolves a canonical verified contact only after Commerce independently proves the exact committed event; no service-supplied buyer lookup authority. @layer service @owner profile @override Later layers may narrow scopes or select qualified owner transport/contact policies without bypassing committed source, consent or canonical ownership. */
module.exports = {
  /** Refuses without exposing financial, account, contact or provider data. @returns {never} Stable authentication refusal. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_AUTH_00003");
  },
  /** Unwraps existing bounded transport envelopes, refusing errors and malformed private owner results. @param {Object} value Owner response. @returns {Object} Unwrapped object or refusal. */
  unwrap: function (value) {
    for (let depth = 0; depth < 6; depth++) {
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        value.success === false ||
        value.error ||
        /^ERR_/.test(value.code || "") ||
        (value.errors && (!Array.isArray(value.errors) || value.errors.length))
      )
        this.fail();
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else return value;
    }
    this.fail();
  },
  /** Reads current committed event evidence using existing authenticated Commerce module transport. @param {Object} request Scoped runtime context. @param {Object} body Exact reviewed source and channel. @param {Object} policy Qualified Profile policy. @returns {Promise<Object>} Bound financial source only, never contact data. */
  source: function (request, body, policy) {
    const invocation = {
      local: false,
      moduleName: "digitalCore",
      connectionName: policy.sourceConnectionName,
      targetAuthority: policy.sourceAuthority || undefined,
      apiName: "/internal/notifications/recipient-source",
      methodName: "POST",
      tenant: request.tenant,
      request: { tenant: request.tenant },
      header: { "X-Enterprise-Code": request.entCode },
      requestBody: { ...body.source, channel: body.channel },
      requireInternalAuth: true,
      maxAttempts: 1,
      timeoutMs: policy.timeoutMs,
      maxResponseBytes: 8192,
      followRedirects: false,
      secureTransport: {
        required: true,
        allowInsecureLoopback: policy.allowInsecureLoopback === true,
      },
    };
    const logger = SERVICE.DefaultLoggerService;
    if (typeof logger?.runSensitiveOperation !== "function") this.fail();
    return logger
      .runSensitiveOperation(invocation, () =>
        SERVICE.DefaultModuleService.invokeModule(invocation),
      )
      .then((value) => this.unwrap(value));
  },
  /** Requires exact source/channel and tenant/enterprise coordinates before returning a buyer handle. @param {Object} proof Fresh Commerce evidence. @param {Object} request Runtime context. @param {Object} body Exact source command. @returns {void} Bound proof or refusal. */
  validateSource: function (proof, request, body) {
    if (
      Object.keys(proof).sort().join(",") !==
        "channel,committed,contractVersion,enterpriseCode,ownerId,source,sourceModule,sourceType,tenant" ||
      proof.contractVersion !== 1 ||
      proof.committed !== true ||
      proof.sourceModule !== "digitalCore" ||
      proof.sourceType !== "DIGITAL_COUPON_" + body.source.kind ||
      proof.tenant !== request.tenant ||
      proof.enterpriseCode !== request.entCode ||
      proof.channel !== body.channel ||
      typeof proof.ownerId !== "string" ||
      !/^[A-Za-z0-9_.:@-]{1,128}$/.test(proof.ownerId) ||
      !proof.source ||
      Object.keys(proof.source).sort().join(",") !==
        "kind,orderCode,orderRevision,sourceCode" ||
      Object.keys(body.source).some(
        (key) => body.source[key] !== proof.source[key],
      )
    )
      this.fail();
  },
  /** Resolves one exact committed-source recipient and rereads source after contact/consent admission; does not send or save notification state. @param {Object} request Private verified runtime request. @returns {Promise<Object>} Bounded private recipient projection. */
  resolve: async function (request) {
    try {
      SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
      const p = CONFIG.get("profileCommerceNotifications"),
        auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(
          request,
          "profile",
        ),
        body = request.body;
      if (
        p?.enabled !== true ||
        p.qualified !== true ||
        !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(p.sourceConnectionName || "") ||
        !Number.isSafeInteger(p.timeoutMs) ||
        p.timeoutMs < 1 ||
        p.timeoutMs > 60000 ||
        !/^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(p.verifiedContactService || "") ||
        auth.principalType !== "service" ||
        auth.entCode !== request.entCode ||
        !auth.modules.includes("digitalCore") ||
        !Array.isArray(auth.permissions) ||
        !auth.permissions.includes(p.permission) ||
        !body ||
        Object.keys(body).sort().join(",") !== "channel,source" ||
        !["EMAIL", "SMS"].includes(body.channel) ||
        Object.keys(request.query || {}).length ||
        !body.source ||
        Object.keys(body.source).sort().join(",") !==
          "kind,orderCode,orderRevision,sourceCode" ||
        !["PURCHASED", "REFUNDED"].includes(body.source.kind) ||
        !Number.isSafeInteger(body.source.orderRevision) ||
        body.source.orderRevision < 0 ||
        [body.source.orderCode, body.source.sourceCode].some(
          (value) =>
            typeof value !== "string" ||
            !/^[A-Za-z0-9_.:@-]{1,128}$/.test(value),
        )
      )
        this.fail();
      const bodySnapshot = {
        channel: body.channel,
        source: { ...body.source },
      };
      const scope = Object.freeze({
        tenant: auth.tenant,
        entCode: auth.entCode,
      });
      if (scope.tenant !== request.tenant) this.fail();
      const source = await this.source(scope, bodySnapshot, p);
      this.validateSource(source, scope, bodySnapshot);
      const contactOwner = SERVICE[p.verifiedContactService];
      if (typeof contactOwner?.resolveCanonicalContact !== "function")
        this.fail();
      const contactInput = {
        tenant: scope.tenant,
        enterpriseCode: scope.entCode,
        ownerId: source.ownerId,
        channel: bodySnapshot.channel,
        purpose: source.sourceType,
      };
      SERVICE.DefaultLoggerService.inheritRequestPrivacy(contactInput, request);
      const contact = await contactOwner.resolveCanonicalContact(contactInput);
      if (
        contact?.verified !== true ||
        typeof contact.recipientId !== "string" ||
        typeof contact.recipientAddressReference !== "string" ||
        [contact.recipientId, contact.recipientAddressReference].some(
          (value) =>
            !value.trim() ||
            value.length > 512 ||
            /[\u0000-\u001f\u007f]/.test(value),
        )
      )
        this.fail();
      const current = await this.source(scope, bodySnapshot, p);
      this.validateSource(current, scope, bodySnapshot);
      if (current.ownerId !== source.ownerId) this.fail();
      return {
        contractVersion: 1,
        tenant: scope.tenant,
        enterpriseCode: scope.entCode,
        ownerId: source.ownerId,
        channel: bodySnapshot.channel,
        source: bodySnapshot.source,
        verified: true,
        recipientId: contact.recipientId,
        recipientAddressReference: contact.recipientAddressReference,
      };
    } catch {
      this.fail();
    }
  },
};
