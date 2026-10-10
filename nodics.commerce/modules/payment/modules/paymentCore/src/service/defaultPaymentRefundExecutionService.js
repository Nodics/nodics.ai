/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
const inFlightRefunds = new Map();
/** @module paymentCore/src/service/defaultPaymentRefundExecutionService @description Executes only scoped, approved full original-capture refunds and retains ambiguous outcomes for reconciliation. @layer service @owner paymentCore */
module.exports = {
  /** Revalidates Order's signed staff scope and persisted approval rather than trusting caller financial fields. */
  authority: async function (request, execution = false) {
    const owner = SERVICE.DefaultOrderRefundRecoveryService;
    if (typeof owner?.paymentAuthority !== "function")
      throw new Error("Guarded Order refund authority is unavailable");
    const authority = await owner.paymentAuthority(request, execution);
    if (!authority?.tenant || authority.tenant !== request.tenant || !authority.enterpriseCode ||
      !authority.ownerId || !authority.orderCode || !authority.refundCode ||
      (execution && (authority.allowExecution !== true || !authority.originalCapture || !authority.approvalCommandKey)))
      throw new Error("Scoped persisted refund approval authority is required");
    return authority;
  },
  /** Reads bounded generated-owner evidence; errors or malformed responses never mean an empty ledger. */
  readRows: async function (name, request, query, limit = 100) {
    const owner = SERVICE[name];
    if (typeof owner?.get !== "function") throw new Error("Refund evidence owner is unavailable: " + name);
    let value = await owner.get({
      tenant: request.tenant, authData: this.serviceAuthData(request), query,
      options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: limit },
    });
    for (let n = 0; n < 8; n++) {
      if (!value || value.error || value.success === false || value.acknowledged === false ||
        (value.errors && (!Array.isArray(value.errors) || value.errors.length > 0)) ||
        (value.code !== undefined && (typeof value.code !== "string" || !/^SUC_/.test(value.code))))
        throw new Error("Refund evidence read failed: " + name);
      if (Array.isArray(value)) {
        if (value.length >= limit) throw new Error("Refund evidence exceeds the bounded reconciliation limit");
        return value;
      }
      if (value.result !== undefined) value = value.result;
      else if (value.data !== undefined) value = value.data;
      else throw new Error("Refund evidence read is unconfirmed: " + name);
    }
    throw new Error("Refund evidence read is malformed: " + name);
  },
  /** Reads the single original successful capture against fresh Order-owned totals. */
  orderCapture: async function (request) {
    const authority = await this.authority(request);
    const rows = await this.readRows("DefaultPaymentTransactionEntryService", authority,
      { orderCode: authority.orderCode, "evidence.operation": "CAPTURE" }, 3);
    const c = rows[0], evidence = c?.evidence || {};
    if (rows.length !== 1 || c.status !== "CAPTURED" || !c.code ||
      c.ownerId !== authority.ownerId || c.orderCode !== authority.orderCode ||
      c.tenant !== authority.tenant ||
      (c.enterpriseCode && c.enterpriseCode !== authority.enterpriseCode))
      throw new Error("A single original scoped successful captured payment is required");
    if (evidence.methodCode === "CARD") {
      const adapter = SERVICE.DefaultStripeSandboxAdapterService;
      if (evidence.providerCode !== "stripe-sandbox" || evidence.sandbox !== true ||
        evidence.originalCaptureReceipt?.mode !== "LOCAL_SANDBOX_DEMO" ||
        adapter?.code !== evidence.providerCode || typeof adapter.confirmOriginalCapture !== "function")
        throw new Error("CARD original-capture refund is unavailable: missing provider-confirmed capture lookup, capture-bound refund and outcome reconciliation; sandbox receipts are OFFLINE_CONFORMANCE only");
      const receipt = await adapter.confirmOriginalCapture({ ...authority, captureCode: c.code,
        methodCode: "CARD", amount: String(authority.totalAmount), currency: authority.currency });
      return { captureCode: c.code, amount: receipt.amount, currency: receipt.currency,
        providerCode: receipt.providerCode, methodCode: "CARD", reversalOfEntryCode: receipt.reference,
        sandboxMode: receipt.mode, maturity: receipt.maturity, originalCaptureReceipt: receipt };
    }
    if (evidence.providerCode !== "loyalty-reward-points" || evidence.methodCode !== "LOYALTY_REWARD" ||
      !evidence.walletCode || !evidence.providerReference)
      throw new Error("This original capture requires manual provider refund review");
    const exact = SERVICE.DefaultExactAmountService;
    if (exact.compare(String(c.totalAmount), "0") <= 0 ||
      exact.compare(String(c.totalAmount), String(authority.totalAmount)) !== 0 || c.currency !== authority.currency)
      throw new Error("Original captured payment does not match the Order total and currency");
    return JSON.parse(JSON.stringify({
      captureCode: c.code, amount: String(c.totalAmount), currency: c.currency,
      providerCode: evidence.providerCode, methodCode: evidence.methodCode,
      walletCode: evidence.walletCode, programCode: evidence.programCode,
      rewardTypeCode: evidence.rewardTypeCode, reversalOfEntryCode: evidence.providerReference,
    }));
  },
  /** Rejects caller attempts to select financial identities, adapters or original ledger references. */
  rejectOverrides: function (request) {
    const keys = ["providerToken", "providerCode", "providerReference", "refundIdempotencyKey", "digitalIdempotencyKey",
      "walletCode", "programCode", "rewardTypeCode", "reversalOfEntryCode", "captureCode",
      "sandboxMode", "sandboxRefundOutcome", "originalCaptureReceipt", "originalRefundReceipt", "maturity"];
    if (keys.some(key => request[key] !== undefined || request.payload?.[key] !== undefined))
      throw new Error("Caller provider and financial identity overrides are not scoped refund authority");
  },
  /** Verifies one persisted financial intent and outcome before accepting a replay. */
  assertIntent: function (row, request) {
    if (!row || row.tenant !== request.tenant || row.ownerId !== request.ownerId ||
      row.orderCode !== request.orderCode || row.idempotencyKey !== request.idempotencyKey ||
      row.totalAmount !== request.amount || row.currency !== request.currency ||
      row.evidence?.providerCode !== request.providerCode || row.evidence?.operation !== "REFUND" ||
      !["REFUND_SUCCEEDED", "REFUND_FAILED", "REFUND_DELAYED", "REFUND_RECONCILIATION_REQUIRED"].includes(row.status) ||
      (row.status === "REFUND_SUCCEEDED" && !row.evidence.providerReference) ||
      !isDeepStrictEqual(row.evidence.refundIntent, request.refundIntent))
      throw new Error("Existing refund replay does not match the original financial intent; reconcile manually");
  },
  /** Refuses a new full refund when any other refund or ambiguous compensation already consumes authority. */
  remainingAuthority: async function (request) {
    let existing;
    for (const name of ["DefaultPaymentTransactionService", "DefaultPaymentTransactionEntryService"]) {
      const rows = await this.readRows(name, request, { orderCode: request.orderCode, "evidence.operation": "REFUND" });
      if (name === "DefaultPaymentTransactionEntryService" && rows.length)
        throw new Error("Existing checkout refund entries require remaining-authority reconciliation");
      for (const row of rows) {
        this.assertIntent(row, request);
        if (existing) throw new Error("Multiple existing refunds require remaining-authority reconciliation");
        existing = row;
      }
    }
    return existing;
  },
  /** Constructs original-capture intent for approval preflight or settled execution, without dispatch. */
  refundContext: async function (request, execution = true) {
    this.rejectOverrides(request);
    const authority = await this.authority(request, execution);
    const capture = await this.orderCapture(request);
    if (!isDeepStrictEqual(capture, authority.originalCapture))
      throw new Error("Original capture changed since approval; reconcile the original intent");
    const idempotencyKey = "order-full-refund:" + crypto.createHash("sha256")
      .update(JSON.stringify([authority.tenant, authority.enterpriseCode, authority.orderCode, authority.refundCode]))
      .digest("hex");
    const refundIntent = { ...authority, ...capture };
    delete refundIntent.allowExecution;
    delete refundIntent.originalCapture;
    delete refundIntent.completed;
    const trusted = {
      tenant: authority.tenant, enterpriseCode: authority.enterpriseCode, ownerId: authority.ownerId,
      orderCode: authority.orderCode, authData: request.authData, authorization: request.authorization,
      correlationId: request.correlationId || authority.refundCode, operation: "REFUND", ...capture, idempotencyKey, refundIntent,
      payload: { ...capture },
    };
    const existing = await this.remainingAuthority(trusted);
    if (authority.completed && !existing)
      throw new Error("Completed Order is missing its original refund evidence; reconcile manually");
    const adapter = capture.methodCode === "CARD" ? SERVICE.DefaultStripeSandboxAdapterService : SERVICE.DefaultLoyaltyRewardPaymentProviderService;
    const methods = capture.methodCode === "CARD" ? ["refundOriginal", "verifyRefundResponse", "confirmRefund"] : ["execute"];
    if (adapter?.code !== capture.providerCode || methods.some(method => typeof adapter[method] !== "function"))
      throw new Error("Original refund provider adapter is unavailable");
    return { trusted, adapter };
  },
  /** Validates remaining financial authority before any domain owner prepare or settle operation. */
  preflightOrder: async function (request) {
    const { trusted } = await this.refundContext(request, "PREFLIGHT");
    return { eligible: true, captureCode: trusted.captureCode, amount: trusted.amount, currency: trusted.currency,
      ...(trusted.sandboxMode ? { sandbox: true, sandboxMode: trusted.sandboxMode, maturity: trusted.maturity } : {}) };
  },
  /** Refunds the full original capture under one stable scoped Order approval identity; action names never change it. */
  refundOrder: async function (request) {
    const { trusted, adapter } = await this.refundContext(request);
    const key = trusted.tenant + ":" + trusted.idempotencyKey;
    const running = inFlightRefunds.get(key);
    if (running) {
      if (!isDeepStrictEqual(running.intent, trusted.refundIntent))
        throw new Error("Concurrent refund intent changed; reconcile the original financial identity");
      return running.promise;
    }
    const promise = (async () => {
      const guardedAdapter = {
        code: adapter.code,
        /** Retains provider error outcomes for reconciliation instead of reporting a confirmed refund. */
        execute: async function (paymentRequest) {
          let response;
          if (trusted.methodCode === "CARD") {
            try {
              response = await adapter.refundOriginal(paymentRequest, request);
              if (!await adapter.verifyRefundResponse(paymentRequest, response)) throw new Error("Unconfirmed offline receipt");
            } catch (_) {
              return { status: "RECONCILIATION_REQUIRED", sandbox: true, maturity: trusted.maturity,
                sandboxMode: trusted.sandboxMode, originalRefundUnconfirmed: true };
            }
          } else response = await adapter.execute(paymentRequest);
          if ([response, response?.loyalty].some(value => value &&
            (value.error || value.success === false || value.code?.startsWith("ERR_"))))
            return { status: "RECONCILIATION_REQUIRED", reference: response?.reference };
          return response;
        },
      };
      const transaction = await SERVICE.DefaultPaymentExecutionService.execute(
        trusted, guardedAdapter, this.repository(trusted));
      this.assertIntent(transaction, trusted);
      if (trusted.methodCode === "CARD") await adapter.confirmRefund(trusted);
      const reconciliation = await this.recordReconciliation(trusted, transaction);
      return Object.freeze({ transaction, reconciliation, status: transaction.status,
        reconciliationRequired: transaction.status !== "REFUND_SUCCEEDED",
        ...(trusted.sandboxMode ? { sandbox: true, sandboxMode: trusted.sandboxMode, maturity: trusted.maturity } : {}) });
    })();
    inFlightRefunds.set(key, { intent: trusted.refundIntent, promise });
    try { return await promise; } finally { inFlightRefunds.delete(key); }
  },
  /** Retains the existing Payment-owned operational service identity, never manufacturing customer authorization. */
  serviceAuthData: function (request) {
    return Object.assign({}, request.authData || {}, {
      principalId: "commercePaymentRefundExecutionService", code: "commercePaymentRefundExecutionService",
      loginId: "commercePaymentRefundExecutionService", principalType: "service",
      userGroups: ["serviceAccountUserGroup"], groups: ["serviceAccountUserGroup"],
    });
  },
  /** Adds generated operational metadata without accepting caller transaction codes. */
  persistenceModel: function (model) {
    const now = new Date();
    return { active: true, revision: 0, occurredAt: now, created: now, updated: now,
      ...model, code: model.code || model.idempotencyKey,
      ...(model.evidence ? { evidence: JSON.parse(JSON.stringify(model.evidence)) } : {}) };
  },
  /** Wraps generated persistence with intent-bound replay and readback; unknown provider outcomes remain recovery work. */
  repository: function (request) {
    const self = this;
    return {
      /** Reads and validates the canonical persisted refund. */
      find: async function () {
        const rows = await self.readRows("DefaultPaymentTransactionService", request,
          { tenant: request.tenant, idempotencyKey: request.idempotencyKey, "evidence.operation": "REFUND" }, 3);
        if (rows.length > 1) throw new Error("Duplicate refund intent requires reconciliation");
        if (rows[0]) self.assertIntent(rows[0], request);
        return rows[0];
      },
      /** Persists only the trusted intent and verifies evidence before reporting a financial outcome. */
      record: async function (model) {
        const known = ["REFUND_SUCCEEDED", "REFUND_FAILED", "REFUND_DELAYED", "REFUND_RECONCILIATION_REQUIRED"];
        const confirmed = known.includes(model.status) && (model.status !== "REFUND_SUCCEEDED" || !!model.providerReference);
        const stored = self.persistenceModel({ ...model,
          status: confirmed ? model.status : "REFUND_RECONCILIATION_REQUIRED",
          reconciliationRequired: !confirmed || model.status !== "REFUND_SUCCEEDED",
          evidence: { ...model.evidence, refundIntent: structuredClone(request.refundIntent) },
        });
        const response = await SERVICE.DefaultPaymentTransactionService.save({
          tenant: request.tenant, authData: self.serviceAuthData(request), model: stored,
        });
        if (response?.error || response?.success === false || response?.code?.startsWith("ERR_"))
          throw new Error("Refund persistence requires reconciliation");
        const rows = await self.readRows("DefaultPaymentTransactionService", request, { code: stored.code }, 3);
        if (rows.length !== 1 || ["status", "evidence"].some(key =>
          !isDeepStrictEqual(rows[0][key], stored[key])))
          throw new Error("Refund persistence readback requires reconciliation");
        self.assertIntent(rows[0], request);
        return rows[0];
      },
    };
  },
  /** Builds one recovery record per financial identity, with original intent retained. */
  reconciliationModel: function (request, transaction) {
    if (transaction.status === "REFUND_SUCCEEDED") return null;
    return this.persistenceModel({
      code: "refund-reconciliation:" + transaction.idempotencyKey,
      tenant: transaction.tenant, ownerId: transaction.ownerId, orderCode: transaction.orderCode,
      idempotencyKey: transaction.idempotencyKey,
      status: transaction.status === "REFUND_FAILED" ? "ACTION_REQUIRED" : "PENDING_PROVIDER_CONFIRMATION",
      correlationId: transaction.correlationId,
      evidence: { paymentTransactionCode: transaction.code, refundStatus: transaction.status,
        providerCode: transaction.evidence.providerCode, providerReference: transaction.evidence.providerReference,
        reason: transaction.evidence.originalRefundUnconfirmed ? "OFFLINE_RECEIPT_UNCONFIRMED_MANUAL_RECOVERY" :
          transaction.status === "REFUND_FAILED" ? "PROVIDER_REJECTED_REFUND" : "PROVIDER_CONFIRMATION_DELAYED",
        refundIntent: request.refundIntent,
        ...(request.sandboxMode ? { sandbox: true, sandboxMode: request.sandboxMode, maturity: request.maturity,
          originalRefundReceipt: transaction.evidence.originalRefundReceipt } : {}) },
    });
  },
  /** Replays existing recovery evidence instead of appending duplicate provider or reconciliation attempts. */
  recordReconciliation: async function (request, transaction) {
    const model = this.reconciliationModel(request, transaction);
    if (!model) return null;
    const rows = await this.readRows("DefaultPaymentReconciliationService", request, { code: model.code }, 3);
    if (rows.length > 1 || (rows[0] && (!isDeepStrictEqual(rows[0].evidence, model.evidence) ||
      rows[0].tenant !== model.tenant || rows[0].orderCode !== model.orderCode || rows[0].ownerId !== model.ownerId)))
      throw new Error("Existing refund reconciliation intent changed");
    if (rows[0]) return rows[0];
    const response = await SERVICE.DefaultPaymentReconciliationService.save({
      tenant: request.tenant, authData: this.serviceAuthData(request), model,
    });
    if (response?.error || response?.success === false || response?.code?.startsWith("ERR_"))
      throw new Error("Refund reconciliation persistence failed");
    const saved = await this.readRows("DefaultPaymentReconciliationService", request, { code: model.code }, 3);
    if (saved.length !== 1 || !isDeepStrictEqual(saved[0].evidence, model.evidence))
      throw new Error("Refund reconciliation readback failed");
    return saved[0];
  },
  /** Generic token-based refunds lack scoped persisted approval and remaining-capture authority. */
  executeRefund: async function () {
    throw new Error("Use the guarded scoped Order refund approval; generic provider-token execution is unavailable");
  },
};
