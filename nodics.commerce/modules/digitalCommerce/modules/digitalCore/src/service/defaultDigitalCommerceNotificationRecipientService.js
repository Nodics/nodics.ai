/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/service/defaultDigitalCommerceNotificationRecipientService @description Resolves Profile-owned verified contacts only through a source-private committed-order callback; accepts no browser addresses or unproved customer lookup. @layer service @owner digitalCore @override Later layers select qualified connections; retain fixed owner API, exact source binding and frozen Communication intent semantics. */
module.exports = {
  /** Refuses private resolution without exposing owner contact/provider errors. @returns {never} Stable refusal. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_DIGITAL_NOTIFICATION_UNCONFIRMED");
  },
  /** Resolves only the original committed source; Profile must independently reread that source before contact/consent lookup. @param {Object} r Trusted event and channel. @returns {Promise<Object>} Bound private recipient projection. */
  resolve: async function (r) {
    try {
      const privateRequest = { tenant: r.tenant };
      if (
        typeof SERVICE.DefaultLoggerService?.runSensitiveOperation !==
        "function"
      )
        this.fail();
      return await SERVICE.DefaultLoggerService.runSensitiveOperation(
        privateRequest,
        () => this.resolvePrivate(r, privateRequest),
      );
    } catch (_) {
      this.fail();
    }
  },
  /** Resolves only inside an admitted exact-object private operation; exported customization cannot bypass privacy qualification. @param {Object} r Owner source. @param {Object} privateRequest Trusted private entry. @returns {Promise<Object>} */
  resolvePrivate: async function (r, privateRequest) {
    try {
      if (
        SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(
          privateRequest,
        ) !== true
      )
        this.fail();
      const p = CONFIG.get("digitalCore")?.notifications?.recipientResolution,
        s = r.source;
      if (
        p?.qualified !== true ||
        typeof p.connectionName !== "string" ||
        !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(p.connectionName) ||
        !Number.isSafeInteger(p.timeoutMilliseconds) ||
        p.timeoutMilliseconds < 1 ||
        p.timeoutMilliseconds > 60000 ||
        (p.allowInsecureLoopback !== undefined &&
          typeof p.allowInsecureLoopback !== "boolean") ||
        !["EMAIL", "SMS"].includes(r.channel) ||
        !["PURCHASED", "REFUNDED"].includes(s?.kind) ||
        !Number.isSafeInteger(s.orderRevision) ||
        s.orderRevision < 0 ||
        [r.tenant, r.enterpriseCode, r.ownerId, s.orderCode, s.sourceCode].some(
          (v) => typeof v !== "string" || !/^[A-Za-z0-9_.:@-]{1,128}$/.test(v),
        )
      )
        this.fail();
      const source = {
        kind: s.kind,
        orderCode: s.orderCode,
        sourceCode: s.sourceCode,
        orderRevision: s.orderRevision,
      };
      let value = await SERVICE.DefaultModuleService.invokeModule({
        local: false,
        moduleName: "profile",
        connectionName: p.connectionName,
        tenant: r.tenant,
        request: privateRequest,
        targetAuthority: { runtimeRole: "PLATFORM" },
        methodName: "POST",
        apiName: "/internal/commerce/notification-recipient",
        header: { "X-Enterprise-Code": r.enterpriseCode },
        requestBody: { channel: r.channel, source },
        requireInternalAuth: true,
        timeoutMs: p.timeoutMilliseconds,
        maxResponseBytes: 8192,
        maxAttempts: 1,
        followRedirects: false,
        secureTransport: {
          required: true,
          allowInsecureLoopback: p.allowInsecureLoopback === true,
        },
      });
      for (let depth = 0; depth < 7 && value; depth++) {
        if (
          value.success === false ||
          value.error ||
          /^ERR_/.test(value.code || "") ||
          (value.errors &&
            (!Array.isArray(value.errors) || value.errors.length))
        )
          this.fail();
        if (value.data !== undefined) value = value.data;
        else if (value.result !== undefined) value = value.result;
        else break;
      }
      if (
        value?.contractVersion !== 1 ||
        value.verified !== true ||
        value.tenant !== r.tenant ||
        value.enterpriseCode !== r.enterpriseCode ||
        value.ownerId !== r.ownerId ||
        value.channel !== r.channel ||
        !value.source ||
        Object.keys(value.source).sort().join(",") !==
          "kind,orderCode,orderRevision,sourceCode" ||
        Object.keys(source).some((key) => value.source[key] !== source[key]) ||
        [value.recipientId, value.recipientAddressReference].some(
          (v) =>
            typeof v !== "string" ||
            !v.trim() ||
            v.length > 512 ||
            /[\u0000-\u001f\u007f]/.test(v),
        )
      )
        this.fail();
      return {
        tenant: r.tenant,
        enterpriseCode: r.enterpriseCode,
        ownerId: r.ownerId,
        channel: r.channel,
        verified: true,
        recipientId: value.recipientId,
        recipientAddressReference: value.recipientAddressReference,
      };
    } catch (_) {
      this.fail();
    }
  },
};
