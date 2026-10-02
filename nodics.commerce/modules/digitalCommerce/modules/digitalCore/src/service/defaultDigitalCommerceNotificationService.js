/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto");
/** @module digitalCore/service/defaultDigitalCommerceNotificationService @description Requests purchase/refund notifications only from fresh committed Commerce owner evidence, reusing Communication's durable immutable intents. @layer service @owner digitalCore @override Later layers select templates, recipient owners and transport; preserve owner evidence, stable event identities, no caller recipients and uncertainty handling. */
module.exports = {
  /** Resolves inert transport policy; only new requests require recipient selection. @param {boolean} requireRecipient Require a recipient adapter for new intents. @returns {Object|undefined} Qualified policy. */
  policy: function (requireRecipient = true) {
    const p = CONFIG.get("digitalCore")?.notifications;
    if (p?.enabled !== true) return undefined;
    if (
      p.qualified !== true ||
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(p.connectionName || "") ||
      !Number.isSafeInteger(p.timeoutMilliseconds) ||
      p.timeoutMilliseconds < 1 ||
      p.timeoutMilliseconds > 60000 ||
      (requireRecipient &&
        !/^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(p.recipientService || ""))
    )
      this.fail();
    return p;
  },
  /** Uses a stable public error, never logging private recipient/payment records. @returns {never} Refusal. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_DIGITAL_NOTIFICATION_UNCONFIRMED");
  },
  /** Returns private committed-source proof only to the signed Profile runtime. Never resolves contacts, creates intents or accepts a supplied buyer. @param {Object} input Verified internal request. @returns {Promise<Object>} Versioned source proof. */
  recipientSource: async function (input) {
    try {
      if (
        SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(input) !==
        true
      )
        this.fail();
      const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(
          input,
          "digitalCore",
        ),
        body = input.payload || {},
        policy = CONFIG.get("digitalCore"),
        keys = "channel,kind,orderCode,orderRevision,sourceCode";
      if (
        auth.principalType !== "service" ||
        (auth.enterpriseCode && auth.enterpriseCode !== auth.entCode) ||
        !auth.modules.includes("profile") ||
        !Array.isArray(auth.permissions) ||
        !auth.permissions.includes(
          "commerce.digital.notification.source.read",
        ) ||
        CONFIG.get("apiExposure")?.categories?.commerceNotificationSources
          ?.enabled !== true ||
        policy?.notifications?.recipientResolution?.qualified !== true ||
        !this.policy(false) ||
        Object.keys(body).sort().join(",") !== keys ||
        Object.keys(input.query || {}).length ||
        !["EMAIL", "SMS"].includes(body.channel) ||
        !["PURCHASED", "REFUNDED"].includes(body.kind) ||
        !Number.isSafeInteger(body.orderRevision) ||
        body.orderRevision < 0 ||
        [input.tenant, auth.entCode, body.orderCode, body.sourceCode].some(
          (v) => typeof v !== "string" || !/^[A-Za-z0-9_.:@-]{1,128}$/.test(v),
        ) ||
        !SERVICE.DefaultModuleService.isLocalModuleActive("digitalCore")
      )
        this.fail();
      for (const moduleName of [
        "digitalCore",
        "order",
        "checkoutCore",
        "payment",
      ]) {
        if (!SERVICE.DefaultModuleService.isLocalModuleActive(moduleName))
          this.fail();
        await SERVICE.DefaultModuleRegistrationAgentService.assertModuleOperational(
          moduleName,
          input.tenant,
        );
      }
      const r = {
          tenant: input.tenant,
          enterpriseCode: auth.entCode,
          orderCode: body.orderCode,
          authData: auth,
        },
        order = await this.one(SERVICE.DefaultCommerceOrderService, r, {
          code: body.orderCode,
          enterpriseCode: auth.entCode,
        });
      r.ownerId = order.ownerId;
      const event = await this.evidence(r, body.kind);
      const current = await this.one(SERVICE.DefaultCommerceOrderService, r, {
        code: body.orderCode,
        enterpriseCode: r.enterpriseCode,
        ownerId: r.ownerId,
      });
      if (
        event.order.revision !== body.orderRevision ||
        current.revision !== body.orderRevision ||
        (body.kind === "PURCHASED"
          ? !event.items.some((item) => item.code === body.sourceCode)
          : event.refundCode !== body.sourceCode)
      )
        this.fail();
      return {
        contractVersion: 1,
        sourceModule: "digitalCore",
        sourceType: "DIGITAL_COUPON_" + body.kind,
        committed: true,
        tenant: r.tenant,
        enterpriseCode: r.enterpriseCode,
        ownerId: r.ownerId,
        channel: body.channel,
        source: {
          kind: body.kind,
          orderCode: body.orderCode,
          sourceCode: body.sourceCode,
          orderRevision: body.orderRevision,
        },
      };
    } catch (_) {
      this.fail();
    }
  },
  /** Reads exactly one uncached owner record using existing Digital persistence checks. @param {Object} service Generated owner. @param {Object} r Trusted context. @param {Object} query Exact selectors. @returns {Promise<Object>} Fresh record. */
  one: async function (service, r, query) {
    const rows =
      await SERVICE.DefaultDigitalCommerceEntitlementService.readRecords(
        service,
        r,
        { ...query, tenant: r.tenant },
      );
    if (rows.length !== 1) this.fail();
    return rows[0];
  },
  /** Resolves committed order/unit evidence; pending payment or partial reversal can never trigger a message. @param {Object} r Trusted owner context. @param {string} kind Event. @returns {Promise<Object>} Bound committed evidence. */
  evidence: async function (r, kind) {
    if (
      !["PURCHASED", "REFUNDED"].includes(kind) ||
      [r.tenant, r.enterpriseCode, r.ownerId, r.orderCode].some(
        (v) => typeof v !== "string" || !/^[A-Za-z0-9_.:@-]{1,128}$/.test(v),
      )
    )
      this.fail();
    const order = await this.one(SERVICE.DefaultCommerceOrderService, r, {
      code: r.orderCode,
      enterpriseCode: r.enterpriseCode,
      ownerId: r.ownerId,
    });
    if (
      order.active !== true ||
      order.code !== r.orderCode ||
      order.tenant !== r.tenant ||
      order.enterpriseCode !== r.enterpriseCode ||
      order.ownerId !== r.ownerId
    )
      this.fail();
    const items = await SERVICE.DefaultDigitalCommerceRefundService.items(r);
    if (!items.length) return { order, items: [], kind };
    const entries =
      await SERVICE.DefaultDigitalCommerceEntitlementService.readRecords(
        SERVICE.DefaultCommerceOrderEntryService,
        r,
        {
          tenant: r.tenant,
          enterpriseCode: r.enterpriseCode,
          ownerId: r.ownerId,
          orderCode: order.code,
        },
      );
    if (
      !SERVICE.DefaultDigitalCommerceRefundService.matchesPurchaseUnits(
        { ...r, entries },
        items,
      )
    )
      this.fail();
    if (kind === "PURCHASED") {
      const checkpoint = await this.one(
        SERVICE.DefaultCheckoutCheckpointService,
        r,
        {
          code: order.code,
          enterpriseCode: r.enterpriseCode,
          ownerId: r.ownerId,
        },
      );
      const captures =
        await SERVICE.DefaultDigitalCommerceEntitlementService.readRecords(
          SERVICE.DefaultPaymentTransactionEntryService,
          r,
          {
            tenant: r.tenant,
            orderCode: order.code,
            ownerId: order.ownerId,
            "evidence.operation": "CAPTURE",
          },
        );
      if (
        checkpoint.status !== "COMPLETED" ||
        checkpoint.evidence?.orderCode !== order.code ||
        !["PLACED", "COMPLETED", "FULFILLED"].includes(order.status) ||
        captures.length !== 1 ||
        captures[0].status !== "CAPTURED" ||
        captures[0].currency !== order.currency ||
        !SERVICE.DefaultExactAmountService ||
        SERVICE.DefaultExactAmountService.compare(
          String(captures[0].totalAmount),
          String(order.totalAmount),
        ) !== 0
      )
        this.fail();
      const codes = checkpoint.evidence.digitalDeliveryCodes;
      if (
        !Array.isArray(codes) ||
        codes.length !== items.length ||
        new Set(codes).size !== codes.length ||
        items.some(
          (i) =>
            !codes.includes(i.providerCode) ||
            i.status !== "ACTIVE" ||
            !Number.isFinite(Date.parse(i.purchasedAt)) ||
            !Number.isFinite(Date.parse(i.validTo)),
        )
      )
        this.fail();
      for (const item of items) {
        const deliveries =
          await SERVICE.DefaultDigitalCommerceEntitlementService.readRecords(
            SERVICE.DefaultDigitalDeliveryService,
            r,
            {
              tenant: r.tenant,
              enterpriseCode: r.enterpriseCode,
              ownerId: r.ownerId,
              orderCode: r.orderCode,
              entitlementCode: item.code,
              deliveryType: "COUPON_CODE",
            },
          );
        if (
          deliveries.length !== 1 ||
          deliveries[0].status !== "DELIVERED" ||
          deliveries[0].providerCode !== item.providerCode ||
          !Number.isFinite(Date.parse(deliveries[0].deliveredAt))
        )
          this.fail();
      }
      return { order, items, kind };
    }
    const refundCode = order.evidence?.refundCode;
    if (
      !/^ORDER_REFUND_[A-F0-9]{32}$/.test(refundCode || "") ||
      order.status !== "REFUNDED" ||
      !Number.isFinite(Date.parse(order.evidence.refundCompletedAt))
    )
      this.fail();
    const refund = await this.one(
      SERVICE.DefaultOrderLifecycleRequestService,
      r,
      {
        code: refundCode,
        enterpriseCode: r.enterpriseCode,
        ownerId: r.ownerId,
        orderCode: order.code,
        requestType: "REFUND",
      },
    );
    const paymentStep = refund.evidence?.steps?.PAYMENT;
    if (
      refund.status !== "COMPLETED" ||
      refund.evidence?.plan?.provider !== "digitalCore" ||
      refund.evidence?.steps?.COMPLETE?.status !== "COMPLETED" ||
      paymentStep?.status !== "REFUND_SUCCEEDED" ||
      typeof paymentStep.transactionCode !== "string"
    )
      this.fail();
    const payment = await this.one(
      SERVICE.DefaultPaymentTransactionService,
      r,
      {
        code: paymentStep.transactionCode,
        orderCode: order.code,
        ownerId: order.ownerId,
      },
    );
    if (
      payment.status !== "REFUND_SUCCEEDED" ||
      payment.evidence?.operation !== "REFUND" ||
      payment.idempotencyKey !== "order-full-refund:" + order.code ||
      payment.currency !== order.currency ||
      !SERVICE.DefaultExactAmountService ||
      SERVICE.DefaultExactAmountService.compare(
        String(payment.totalAmount),
        String(order.totalAmount),
      ) !== 0 ||
      items.some(
        (i) => i.status !== "REVOKED" || i.evidence?.refundCode !== refund.code,
      )
    )
      this.fail();
    for (const item of items) {
      const reversal = await this.one(
        SERVICE.DefaultDigitalReversalService,
        r,
        {
          code: "refund:" + item.code,
          enterpriseCode: r.enterpriseCode,
          ownerId: r.ownerId,
          orderCode: r.orderCode,
        },
      );
      if (
        reversal.status !== "COMPLETED" ||
        reversal.evidence?.refundCode !== refund.code ||
        reversal.entitlementCode !== item.code
      )
        this.fail();
    }
    return { order, items, kind, refundCode };
  },
  /** Builds a stable event reference independent of retry clock, configuration or transport correlation. @param {Object} r Owner context. @param {Object} event Evidence. @param {Object} item Unit. @param {string} channel Channel. @returns {string} Communication idempotency key. */
  key: function (r, event, item, channel) {
    return (
      "digital-coupon:" +
      crypto
        .createHash("sha256")
        .update(
          JSON.stringify([
            r.tenant,
            r.enterpriseCode,
            r.ownerId,
            event.order.code,
            event.kind,
            event.refundCode || item.code,
            channel,
          ]),
        )
        .digest("hex")
    );
  },
  /** Calls existing service-authenticated Communication RPC with bounded responses and no automatic transport retry. @param {Object} r Owner context. @param {Object} p Qualified policy. @param {string} path Existing owner path. @param {Object} body Command. @returns {Promise<Object>} Safe intent progress. */
  invoke: async function (r, p, path, body) {
    const envelope = { tenant: r.tenant };
    let value;
    try {
      value = await SERVICE.DefaultLoggerService.runSensitiveOperation(
        envelope,
        () => {
          SERVICE.DefaultLoggerService.assertSensitiveRequest(envelope);
          return SERVICE.DefaultModuleService.invokeModule({
            local: false,
            moduleName: "commsApi",
            connectionName: p.connectionName,
            tenant: r.tenant,
            request: envelope,
            apiName: path,
            methodName: "POST",
            header: { "X-Enterprise-Code": r.enterpriseCode },
            requestBody: body,
            timeoutMs: p.timeoutMilliseconds,
            maxResponseBytes: 8192,
            maxAttempts: 1,
            followRedirects: false,
            requireInternalAuth: true,
            secureTransport: {
              required: true,
              allowInsecureLoopback: p.allowInsecureLoopback === true,
            },
          });
        },
      );
    } catch {
      this.fail();
    }
    for (let n = 0; n < 7 && value; n++) {
      if (
        value.success === false ||
        value.error ||
        (value.errors && (!Array.isArray(value.errors) || value.errors.length))
      )
        this.fail();
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else break;
    }
    if (
      !/^COMM_[a-f0-9]{64}$/.test(value?.intentCode || "") ||
      ![
        "ACCEPTED",
        "DELIVERING",
        "DELIVERED",
        "RETRY_PENDING",
        "UNCERTAIN",
        "SUPPRESSED",
        "FAILED",
        "UNCONFIGURED",
        "DEAD_LETTER",
        "CANCELLED",
      ].includes(value.status)
    )
      this.fail();
    const inspection = path.endsWith("/inspect");
    if (
      inspection &&
      (!Number.isSafeInteger(value.revision) || value.revision < 0)
    )
      this.fail();
    return {
      intentCode: value.intentCode,
      status: value.status,
      ...(inspection ? { revision: value.revision } : {}),
    };
  },
  /** Proves the original committed purchase without treating mutable entitlement/order status as historical authority. This proof authorizes inspection only. @param {Object} r Bound owner context. @param {Object} order Original order. @param {Array<Object>} items Complete original units. @returns {Promise<void>} Refuses incomplete commit evidence. */
  provePurchasedInspection: async function (r, order, items) {
    const checkpoint = await this.one(
      SERVICE.DefaultCheckoutCheckpointService,
      r,
      {
        code: order.code,
        enterpriseCode: r.enterpriseCode,
        ownerId: r.ownerId,
      },
    );
    const captures =
      await SERVICE.DefaultDigitalCommerceEntitlementService.readRecords(
        SERVICE.DefaultPaymentTransactionEntryService,
        r,
        {
          tenant: r.tenant,
          orderCode: order.code,
          ownerId: r.ownerId,
          "evidence.operation": "CAPTURE",
        },
      );
    const codes = checkpoint.evidence?.digitalDeliveryCodes;
    if (
      checkpoint.status !== "COMPLETED" ||
      checkpoint.evidence?.orderCode !== order.code ||
      captures.length !== 1 ||
      captures[0].status !== "CAPTURED" ||
      captures[0].currency !== order.currency ||
      !SERVICE.DefaultExactAmountService ||
      SERVICE.DefaultExactAmountService.compare(
        String(captures[0].totalAmount),
        String(order.totalAmount),
      ) !== 0 ||
      !Array.isArray(codes) ||
      codes.length !== items.length ||
      new Set(codes).size !== codes.length ||
      items.some(
        (i) =>
          !codes.includes(i.providerCode) ||
          !Number.isFinite(Date.parse(i.purchasedAt)) ||
          !Number.isFinite(Date.parse(i.validTo)),
      )
    )
      this.fail();
    for (const item of items) {
      const delivery = await this.one(
        SERVICE.DefaultDigitalDeliveryService,
        r,
        {
          enterpriseCode: r.enterpriseCode,
          ownerId: r.ownerId,
          orderCode: r.orderCode,
          entitlementCode: item.code,
          deliveryType: "COUPON_CODE",
        },
      );
      if (
        delivery.status !== "DELIVERED" ||
        delivery.providerCode !== item.providerCode ||
        !Number.isFinite(Date.parse(delivery.deliveredAt))
      )
        this.fail();
    }
  },
  /** Proves the retained completed refund event without reauthorizing a financial operation or depending on present entitlement status. @param {Object} r Bound owner context. @param {Object} order Original order. @param {Array<Object>} items Complete units. @param {string} refundCode Canonical original refund. @returns {Promise<void>} Refuses partial/refund-pending evidence. */
  proveRefundedInspection: async function (r, order, items, refundCode) {
    const refund = await this.one(
      SERVICE.DefaultOrderLifecycleRequestService,
      r,
      {
        code: refundCode,
        enterpriseCode: r.enterpriseCode,
        ownerId: r.ownerId,
        orderCode: order.code,
        requestType: "REFUND",
      },
    );
    const step = refund.evidence?.steps?.PAYMENT;
    if (
      refund.status !== "COMPLETED" ||
      refund.evidence?.plan?.provider !== "digitalCore" ||
      refund.evidence?.steps?.COMPLETE?.status !== "COMPLETED" ||
      step?.status !== "REFUND_SUCCEEDED" ||
      typeof step.transactionCode !== "string" ||
      !Number.isFinite(Date.parse(order.evidence?.refundCompletedAt))
    )
      this.fail();
    const payment = await this.one(
      SERVICE.DefaultPaymentTransactionService,
      r,
      {
        code: step.transactionCode,
        orderCode: order.code,
        ownerId: r.ownerId,
      },
    );
    if (
      payment.status !== "REFUND_SUCCEEDED" ||
      payment.evidence?.operation !== "REFUND" ||
      payment.idempotencyKey !== "order-full-refund:" + order.code ||
      payment.currency !== order.currency ||
      !SERVICE.DefaultExactAmountService ||
      SERVICE.DefaultExactAmountService.compare(
        String(payment.totalAmount),
        String(order.totalAmount),
      ) !== 0
    )
      this.fail();
    for (const item of items) {
      const reversal = await this.one(
        SERVICE.DefaultDigitalReversalService,
        r,
        {
          code: "refund:" + item.code,
          enterpriseCode: r.enterpriseCode,
          ownerId: r.ownerId,
          orderCode: order.code,
        },
      );
      if (
        reversal.status !== "COMPLETED" ||
        reversal.evidence?.refundCode !== refundCode ||
        reversal.entitlementCode !== item.code
      )
        this.fail();
    }
  },
  /** Loads and proves original committed owner events for inspection, irrespective of later financial/lifecycle state. Never used for creation or retry. @param {Object} r Scoped owner context. @param {string} kind Event. @returns {Promise<Object>} Original committed source identities only. */
  inspectionSources: async function (r, kind) {
    if (
      !["PURCHASED", "REFUNDED"].includes(kind) ||
      [r.tenant, r.enterpriseCode, r.ownerId, r.orderCode].some(
        (v) => typeof v !== "string" || !/^[A-Za-z0-9_.:@-]{1,128}$/.test(v),
      )
    )
      this.fail();
    const order = await this.one(SERVICE.DefaultCommerceOrderService, r, {
      code: r.orderCode,
      enterpriseCode: r.enterpriseCode,
      ownerId: r.ownerId,
    });
    if (
      order.code !== r.orderCode ||
      order.tenant !== r.tenant ||
      order.enterpriseCode !== r.enterpriseCode ||
      order.ownerId !== r.ownerId
    )
      this.fail();
    const items = await SERVICE.DefaultDigitalCommerceRefundService.items(r);
    if (!items.length) return { order, items, kind };
    const entries =
      await SERVICE.DefaultDigitalCommerceEntitlementService.readRecords(
        SERVICE.DefaultCommerceOrderEntryService,
        r,
        {
          tenant: r.tenant,
          enterpriseCode: r.enterpriseCode,
          ownerId: r.ownerId,
          orderCode: order.code,
        },
      );
    if (
      !SERVICE.DefaultDigitalCommerceRefundService.matchesPurchaseUnits(
        { ...r, entries },
        items,
      )
    )
      this.fail();
    const refundCode =
      kind === "REFUNDED" ? order.evidence?.refundCode : undefined;
    if (kind === "REFUNDED" && !refundCode) return { order, items: [], kind };
    if (refundCode && !/^ORDER_REFUND_[A-F0-9]{32}$/.test(refundCode))
      this.fail();
    if (kind === "PURCHASED")
      await this.provePurchasedInspection(r, order, items);
    else await this.proveRefundedInspection(r, order, items, refundCode);
    return { order, items, kind, refundCode };
  },
  /** Reads each deterministic original EMAIL/SMS intent without creation, retry, recipient resolution or financial success inference. Absent/denied/failed reads remain indistinguishable and unconfirmed. @param {Object} r Scoped context. @param {string} kind Original event. @returns {Promise<Object>} Redacted stored statuses/revisions or explicit observation limits. */
  inspect: async function (r, kind) {
    try {
      const p = this.policy(false);
      if (!p)
        return {
          status: "POLICY_DISABLED",
          notificationPolicyEnabled: false,
          outcomes: [],
        };
      const event = await this.inspectionSources(r, kind);
      if (!event.items.length)
        return {
          status: "NO_SOURCE_EVENT",
          notificationPolicyEnabled: true,
          outcomes: [],
        };
      const outcomes = [];
      for (const channel of ["EMAIL", "SMS"]) {
        for (const item of kind === "REFUNDED"
          ? [event.items[0]]
          : event.items) {
          const idempotencyKey = this.key(r, event, item, channel),
            intentCode =
              "COMM_" +
              crypto
                .createHash("sha256")
                .update(JSON.stringify([r.tenant, idempotencyKey]))
                .digest("hex");
          try {
            const outcome = await this.invoke(
              r,
              p,
              "/internal/communications/" + intentCode + "/inspect",
              {},
            );
            if (outcome.intentCode !== intentCode) this.fail();
            outcomes.push({ channel, ...outcome, observed: true });
          } catch (_) {
            outcomes.push({
              channel,
              intentCode,
              status: "UNCONFIRMED",
              observed: false,
            });
          }
        }
      }
      const observed = outcomes.filter((o) => o.observed).length;
      return {
        status:
          observed === outcomes.length
            ? "INSPECTED"
            : observed
              ? "PARTIALLY_INSPECTED"
              : "UNCONFIRMED",
        notificationPolicyEnabled: true,
        outcomes,
      };
    } catch (_) {
      return { status: "UNCONFIRMED", outcomes: [] };
    }
  },
  /** Requests one original event; durable Communication command hashes freeze recipients/content and reject drift rather than sending a new message. @param {Object} r Owner context. @param {string} kind Event. @param {boolean} retry Retry existing frozen intent only. @returns {Promise<Object>} Redacted progress, never a financial failure. */
  request: async function (r, kind, retry = false) {
    try {
      const p = this.policy(!retry);
      if (!p) return { status: "NOT_REQUESTED" };
      const event = await this.evidence(r, kind);
      if (!event.items.length) return { status: "NOT_APPLICABLE" };
      const declarations = p.events?.[kind];
      if (
        !Array.isArray(declarations) ||
        !declarations.length ||
        declarations.length > 2 ||
        new Set(declarations.map((d) => d.channel)).size !== declarations.length
      )
        this.fail();
      const outcomes = [];
      for (const d of declarations) {
        if (
          !["EMAIL", "SMS"].includes(d.channel) ||
          d.purpose !== "DIGITAL_COUPON_" + kind ||
          typeof d.templateCode !== "string" ||
          !d.templateCode ||
          d.templateCode.length > 128 ||
          typeof d.locale !== "string" ||
          !d.locale ||
          d.locale.length > 32 ||
          typeof d.nextStep !== "string" ||
          !d.nextStep ||
          d.nextStep.length > 320
        )
          this.fail();
        for (const item of kind === "REFUNDED"
          ? [event.items[0]]
          : event.items) {
          const idempotencyKey = this.key(r, event, item, d.channel),
            intentCode =
              "COMM_" +
              crypto
                .createHash("sha256")
                .update(JSON.stringify([r.tenant, idempotencyKey]))
                .digest("hex");
          let outcome;
          if (retry)
            outcome = await this.invoke(
              r,
              p,
              "/internal/communications/" + intentCode + "/retry",
              {},
            );
          else {
            const resolver = SERVICE[p.recipientService];
            if (typeof resolver?.resolve !== "function") this.fail();
            const recipient = await resolver.resolve({
              tenant: r.tenant,
              enterpriseCode: r.enterpriseCode,
              ownerId: event.order.ownerId,
              channel: d.channel,
              source: {
                kind,
                orderCode: event.order.code,
                orderRevision: event.order.revision,
                sourceCode: kind === "REFUNDED" ? event.refundCode : item.code,
              },
            });
            if (
              recipient?.tenant !== r.tenant ||
              recipient.enterpriseCode !== r.enterpriseCode ||
              recipient.ownerId !== event.order.ownerId ||
              recipient.channel !== d.channel ||
              recipient.verified !== true ||
              typeof recipient.recipientId !== "string" ||
              !recipient.recipientId ||
              recipient.recipientId.length > 512 ||
              typeof recipient.recipientAddressReference !== "string" ||
              !recipient.recipientAddressReference ||
              recipient.recipientAddressReference.length > 512
            )
              this.fail();
            const variables = {
              purchaseReference: event.order.code,
              nextStep: d.nextStep,
            };
            if (kind === "PURCHASED") {
              if (
                typeof item.purchasePolicy?.name !== "string" ||
                !item.purchasePolicy.name ||
                item.purchasePolicy.name.length > 192
              )
                this.fail();
              variables.offerName = item.purchasePolicy.name;
              variables.validUntil = new Date(item.validTo).toISOString();
            }
            outcome = await this.invoke(r, p, "/internal/communications", {
              sourceModule: "digitalCore",
              sourceType: "DIGITAL_COUPON_" + kind,
              sourceCode: kind === "REFUNDED" ? event.refundCode : item.code,
              templateCode: d.templateCode,
              purpose: d.purpose,
              channel: d.channel,
              locale: d.locale,
              recipientId: recipient.recipientId,
              recipientAddressReference: recipient.recipientAddressReference,
              variables,
              idempotencyKey,
            });
          }
          if (outcome.intentCode !== intentCode) this.fail();
          outcomes.push(outcome);
        }
      }
      return { status: "REQUESTED", outcomes };
    } catch (_) {
      return { status: "UNCONFIRMED" };
    }
  },
  /** Resolves fresh shared Order staff authority and the original scoped buyer, never caller-provided ownership. @param {Object} input Signed operator input. @param {string} permission Required fixed permission. @returns {Promise<Object>} Bound order context. */
  operatorContext: async function (input, permission) {
    const router = SERVICE.DefaultSecuredRequestPipelineService;
    const auth = input.authData || {};
    if (
      auth.tokenType !== "access" ||
      auth.principalType !== "human" ||
      auth.tenant !== input.tenant ||
      (auth.enterpriseCode &&
        auth.entCode &&
        auth.enterpriseCode !== auth.entCode) ||
      !/^[A-Za-z0-9_.:@-]{1,128}$/.test(input.code || "")
    )
      this.fail();
    const staff = await SERVICE.DefaultOrderDisputeService.staff(input);
    if (
      !router.isPermissionGranted(
        permission,
        router.getGrantedPermissions(staff),
        {},
      ) ||
      Object.keys(input.query || {}).length
    )
      this.fail();
    const order = await this.one(SERVICE.DefaultCommerceOrderService, staff, {
      code: input.code,
      enterpriseCode: staff.enterpriseCode,
    });
    if (
      order.code !== input.code ||
      order.tenant !== input.tenant ||
      order.enterpriseCode !== staff.enterpriseCode ||
      typeof order.ownerId !== "string" ||
      !/^[A-Za-z0-9_.:@-]{1,128}$/.test(order.ownerId) ||
      !Number.isSafeInteger(order.revision) ||
      order.revision < 0
    )
      this.fail();
    return { ...staff, orderCode: order.code, ownerId: order.ownerId, order };
  },
  /** Resolves bounded plain-text business presentation from effective layered configuration, never executable command metadata. @returns {Object} Workspace labels. */
  workspacePresentation: function () {
    const p = CONFIG.get("digitalCore")?.notifications?.workspace;
    const labels = [
      p?.title,
      p?.navigationLabel,
      p?.fields?.kind,
      p?.fields?.expectedRevision,
      p?.fields?.confirmed,
      p?.commands?.inspect,
      p?.commands?.retry,
    ];
    if (
      labels.some(
        (label) =>
          typeof label !== "string" ||
          !label.trim() ||
          label.length > 192 ||
          /[<>\u0000-\u001f]/.test(label),
      ) ||
      typeof p?.summary !== "string" ||
      !p.summary.trim() ||
      p.summary.length > 512 ||
      /[<>\u0000-\u001f]/.test(p.summary)
    )
      this.fail();
    return {
      title: p.title,
      navigationLabel: p.navigationLabel,
      summary: p.summary,
      fields: {
        kind: p.fields.kind,
        expectedRevision: p.fields.expectedRevision,
        confirmed: p.fields.confirmed,
      },
      commands: { inspect: p.commands.inspect, retry: p.commands.retry },
    };
  },
  /** Publishes fixed server-owned commands with configured business labels; metadata never grants permission or permits arbitrary transport input. @returns {Array<Object>} Version-one command declarations. */
  workspaceCommands: function () {
    const presentation = this.workspacePresentation();
    return [
      {
        id: "inspect",
        label: presentation.commands.inspect,
        intent: "OTHER",
        permission: "commerce.digital.notification.read",
        ownerModule: "digitalCore",
        handlerAction: "inspect",
        operationRoute: "/orders/:code/notifications/inspect",
        httpMethod: "POST",
        inputFields: [
          {
            name: "kind",
            label: presentation.fields.kind,
            type: "SELECT",
            required: true,
            options: ["PURCHASED", "REFUNDED"],
          },
        ],
        confirmationRequired: false,
      },
      {
        id: "retry",
        label: presentation.commands.retry,
        intent: "RETRY",
        permission: "commerce.digital.notification.retry",
        ownerModule: "digitalCore",
        handlerAction: "retry",
        operationRoute: "/orders/:code/notifications/retry",
        httpMethod: "POST",
        inputFields: [
          {
            name: "kind",
            label: presentation.fields.kind,
            type: "SELECT",
            required: true,
            options: ["PURCHASED", "REFUNDED"],
          },
          {
            name: "expectedRevision",
            label: presentation.fields.expectedRevision,
            type: "NUMBER",
            required: true,
            hidden: true,
            valueFromRecord: "orderRevision",
          },
          {
            name: "confirmed",
            label: presentation.fields.confirmed,
            type: "BOOLEAN",
            required: true,
          },
        ],
        confirmationRequired: true,
      },
    ];
  },
  /** Publishes a genuine versioned, redacted operator DTO; financial state and Communication observations remain separate. @param {Object} input Signed empty-body workspace read. @returns {Promise<Object>} Native workspace contract. */
  workspace: async function (input) {
    if (Object.keys(input.payload || {}).length) this.fail();
    const r = await this.operatorContext(
        input,
        "commerce.digital.notification.read",
      ),
      policy = CONFIG.get("digitalCore")?.notifications || {},
      qualified =
        policy.enabled === true &&
        policy.qualified === true &&
        policy.workspaceQualified === true &&
        CONFIG.get("apiExposure")?.categories?.commerceNotificationManagement
          ?.enabled === true,
      router = SERVICE.DefaultSecuredRequestPipelineService;
    const events = [];
    for (const kind of ["PURCHASED", "REFUNDED"]) {
      let retrySourceEligible = false;
      const observation = qualified
        ? await this.inspect(r, kind)
        : {
            status: "POLICY_DISABLED",
            notificationPolicyEnabled: false,
            outcomes: [],
          };
      if (qualified) {
        try {
          retrySourceEligible = (await this.evidence(r, kind)).items.length > 0;
        } catch (_) {
          /* Eligibility failure is not delivery evidence. */
        }
      }
      const retryEligible =
        retrySourceEligible &&
        observation.outcomes.some(
          (outcome) =>
            outcome.observed === true &&
            ["ACCEPTED", "RETRY_PENDING", "DELIVERING"].includes(
              outcome.status,
            ) &&
            policy.events?.[kind]?.some(
              (declaration) => declaration.channel === outcome.channel,
            ),
        );
      events.push({ kind, ...observation, retrySourceEligible, retryEligible });
    }
    return {
      contractVersion: 1,
      workspaceCode: "commerce.orderNotifications",
      viewCode: "orderNotifications.detail",
      featureState: qualified ? "ACTIVE" : "DISABLED",
      orderCode: r.order.code,
      orderRevision: r.order.revision,
      financialState: r.order.status,
      events,
      presentation: {
        title: this.workspacePresentation().title,
        defaultColumns: ["kind", "channel", "status", "revision", "observed"],
      },
      commands: this.workspaceCommands().map((command) => ({
        ...command,
        enabled:
          qualified &&
          router.isPermissionGranted(
            command.permission,
            router.getGrantedPermissions(r),
            {},
          ) &&
          (command.id !== "retry" ||
            events.some((event) => event.retryEligible)),
        eligibleKinds: qualified
          ? events
              .filter((event) => command.id !== "retry" || event.retryEligible)
              .map((event) => event.kind)
          : [],
      })),
    };
  },
  /** Authorizes current scoped operators for source inspection or retry; accepts no recipient, amount, template or intent identifier. @param {Object} input Signed operator command. @param {boolean} retry Retry mode. @returns {Promise<Object>} Safe source evidence or delivery retry progress. */
  operate: async function (input, retry = false) {
    const p = input.payload || {};
    const r = await this.operatorContext(
      input,
      retry
        ? "commerce.digital.notification.retry"
        : "commerce.digital.notification.read",
    );
    if (
      Object.keys(p).some(
        (k) => !["kind", "expectedRevision", "confirmed"].includes(k),
      ) ||
      !["PURCHASED", "REFUNDED"].includes(p.kind) ||
      (retry && p.confirmed !== true)
    )
      this.fail();
    const order = r.order;
    if (
      retry &&
      (!Number.isSafeInteger(p.expectedRevision) ||
        p.expectedRevision !== order.revision)
    )
      this.fail();
    if (retry) return this.request(r, p.kind, true);
    return {
      orderCode: order.code,
      orderRevision: order.revision,
      kind: p.kind,
      retryRequiresConfirmation: true,
      ...(await this.inspect(r, p.kind)),
    };
  },
};
