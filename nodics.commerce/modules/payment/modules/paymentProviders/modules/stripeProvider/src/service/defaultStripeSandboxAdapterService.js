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
/** @module stripeProvider/src/service/defaultStripeSandboxAdapterService @description Deterministic offline Stripe-shaped sandbox adapter for conformance testing only. @layer service @owner stripeProvider */
module.exports = {
  code: "stripe-sandbox",
  /** Builds the explicit offline capture intent. These fields are not authority until retained by the generated Payment owner. */
  captureBinding: function (request) {
    if (request.sandboxMode !== "LOCAL_SANDBOX_DEMO" || request.methodCode !== "CARD" ||
      [request.tenant, request.enterpriseCode, request.ownerId, request.orderCode, request.idempotencyKey, request.providerReference]
        .some(value => typeof value !== "string" || !value.trim()) ||
      !/^sim_[a-f0-9]{24}$/.test(request.providerReference) ||
      typeof request.currency !== "string" || !/^[A-Z]{3}$/.test(request.currency) ||
      SERVICE.DefaultExactAmountService.compare(String(request.amount), "0") <= 0)
      throw new Error("Explicit offline original capture scope, amount, currency and authorization reference are required");
    const refundOutcome = request.sandboxRefundOutcome === undefined ? "REFUNDED" : request.sandboxRefundOutcome;
    if (!["REFUNDED", "REFUND_PENDING", "REFUND_FAILED", "RECONCILIATION_REQUIRED"].includes(refundOutcome))
      throw new Error("Unsupported offline original capture refund outcome");
    return { contract: "ORIGINAL_CAPTURE_V1", mode: "LOCAL_SANDBOX_DEMO", maturity: "OFFLINE_CONFORMANCE",
      providerCode: this.code, tenant: request.tenant, enterpriseCode: request.enterpriseCode,
      ownerId: request.ownerId, orderCode: request.orderCode, methodCode: "CARD",
      amount: String(request.amount), currency: request.currency, captureIdempotencyKey: request.idempotencyKey,
      authorizationReference: request.providerReference, refundOutcome };
  },
  /** Creates deterministic offline receipt content, never a signature or live settlement credential. */
  receipt: function (kind, binding) {
    return { ...binding, reference: "sim_" + kind + "_" + crypto.createHash("sha256").update(JSON.stringify(binding)).digest("hex") };
  },
  /** Emits a capture-bound offline receipt for explicit new-mode captures only. Persistence remains Payment-owned. */
  captureOriginal: function (request) {
    const receipt = this.receipt("capture", this.captureBinding(request));
    return Object.freeze({ reference: receipt.reference, status: "CAPTURED", sandbox: true,
      maturity: "OFFLINE_CONFORMANCE", sandboxMode: receipt.mode, originalCaptureReceipt: receipt });
  },
  /** Verifies that retained capture evidence exactly matches its original protected intent and deterministic receipt. */
  validateCaptureRecord: function (request, row) {
    const receipt = row?.evidence?.originalCaptureReceipt;
    const expected = this.receipt("capture", this.captureBinding(request));
    if (!row || !row.code || row.tenant !== request.tenant || row.ownerId !== request.ownerId ||
      row.orderCode !== request.orderCode || row.status !== "CAPTURED" || row.idempotencyKey !== request.idempotencyKey ||
      (row.enterpriseCode !== undefined && row.enterpriseCode !== request.enterpriseCode) ||
      (row.totalAmount !== undefined && String(row.totalAmount) !== String(request.amount)) ||
      (row.currency !== undefined && row.currency !== request.currency) ||
      row.evidence?.operation !== "CAPTURE" || row.evidence.methodCode !== "CARD" ||
      row.evidence.providerCode !== this.code || row.evidence.sandbox !== true ||
      row.evidence.maturity !== "OFFLINE_CONFORMANCE" || row.evidence.sandboxMode !== expected.mode || row.evidence.providerReference !== expected.reference ||
      !isDeepStrictEqual(receipt, expected))
      throw new Error("Original offline capture receipt or replay intent changed; reconcile manually");
    return receipt;
  },
  /** Confirms a capture by re-reading existing generated Payment evidence; caller-supplied receipts are never accepted. */
  confirmOriginalCapture: async function (request) {
    const rows = await SERVICE.DefaultPaymentRefundExecutionService.readRows("DefaultPaymentTransactionEntryService", request,
      { code: request.captureCode, "evidence.operation": "CAPTURE" }, 3);
    if (rows.length !== 1 || rows[0].code !== request.captureCode || !rows[0].evidence?.originalCaptureReceipt)
      throw new Error("Retained original offline capture receipt is unavailable");
    const row = rows[0], receipt = row.evidence.originalCaptureReceipt;
    const confirmed = this.validateCaptureRecord({ ...request, sandboxMode: receipt.mode,
      idempotencyKey: row.idempotencyKey, providerReference: receipt.authorizationReference,
      sandboxRefundOutcome: receipt.refundOutcome }, row);
    if (confirmed.enterpriseCode !== request.enterpriseCode || confirmed.providerCode !== this.code)
      throw new Error("Original offline capture enterprise or provider scope changed");
    return confirmed;
  },
  /** Binds a refund receipt to the retained capture and canonical Order-approved financial identity. */
  refundReceipt: function (request, capture) {
    if (!request.idempotencyKey || !request.refundIntent?.refundCode || !request.refundIntent?.approvalCommandKey ||
      request.reversalOfEntryCode !== capture.reference || request.amount !== capture.amount || request.currency !== capture.currency)
      throw new Error("Original offline refund intent does not match the capture");
    return this.receipt("refund", { contract: "ORIGINAL_CAPTURE_REFUND_V1", mode: capture.mode, maturity: capture.maturity,
      providerCode: capture.providerCode, tenant: capture.tenant, enterpriseCode: capture.enterpriseCode,
      ownerId: capture.ownerId, orderCode: capture.orderCode, methodCode: capture.methodCode,
      amount: capture.amount, currency: capture.currency, originalCaptureCode: request.captureCode,
      originalCaptureReference: capture.reference, captureIdempotencyKey: capture.captureIdempotencyKey,
      refundCode: request.refundIntent.refundCode, approvalCommandKey: request.refundIntent.approvalCommandKey,
      idempotencyKey: request.idempotencyKey, status: capture.refundOutcome });
  },
  /** Executes only an original-capture offline refund after fresh guarded Order authority and remaining-authority checks. */
  refundOriginal: async function (request, ownerCommand) {
    if (request.providerToken !== undefined || request.payload?.providerToken !== undefined)
      throw new Error("Offline original refund must not accept caller tokens");
    const { trusted } = await SERVICE.DefaultPaymentRefundExecutionService.refundContext(ownerCommand);
    if (!isDeepStrictEqual(request.refundIntent, trusted.refundIntent) ||
      ["idempotencyKey", "tenant", "enterpriseCode", "orderCode", "ownerId", "captureCode", "methodCode",
        "amount", "currency", "reversalOfEntryCode", "sandboxMode"].some(key => request[key] !== trusted[key]))
      throw new Error("Guarded original offline refund authority changed");
    const capture = await this.confirmOriginalCapture(request);
    const receipt = this.refundReceipt(request, capture);
    return Object.freeze({ reference: receipt.reference, status: receipt.status, sandbox: true,
      maturity: "OFFLINE_CONFORMANCE", sandboxMode: capture.mode, originalRefundReceipt: receipt });
  },
  /** Validates the complete offline provider response before Payment may persist a successful outcome. */
  verifyRefundResponse: async function (request, response) {
    const expected = this.refundReceipt(request, await this.confirmOriginalCapture(request));
    return response?.sandbox === true && response.maturity === "OFFLINE_CONFORMANCE" && response.sandboxMode === expected.mode &&
      !response.error && response.success !== false && response.acknowledged !== false &&
      (!response.errors || (Array.isArray(response.errors) && response.errors.length === 0)) &&
      (response.code === undefined || (typeof response.code === "string" && /^SUC_/.test(response.code))) &&
      response.reference === expected.reference && response.status === expected.status &&
      isDeepStrictEqual(response.originalRefundReceipt, expected);
  },
  /** Confirms the retained refund receipt through the existing generated transaction owner, including replay. */
  confirmRefund: async function (request) {
    const rows = await SERVICE.DefaultPaymentRefundExecutionService.readRows("DefaultPaymentTransactionService", request,
      { idempotencyKey: request.idempotencyKey, "evidence.operation": "REFUND" }, 3);
    if (rows.length !== 1) throw new Error("Original offline refund receipt readback requires reconciliation");
    const row = rows[0], expected = this.refundReceipt(request, await this.confirmOriginalCapture(request));
    if (row.status === "REFUND_RECONCILIATION_REQUIRED" && row.evidence?.originalRefundUnconfirmed === true &&
      row.evidence.sandbox === true && row.evidence.maturity === "OFFLINE_CONFORMANCE" &&
      !row.evidence.providerReference && !row.evidence.originalRefundReceipt &&
      row.tenant === request.tenant && row.ownerId === request.ownerId && row.orderCode === request.orderCode &&
      row.totalAmount === request.amount && row.currency === request.currency &&
      isDeepStrictEqual(row.evidence.refundIntent, request.refundIntent)) return row;
    const status = SERVICE.DefaultPaymentExecutionService.normalizeOutcome({ operation: "REFUND" }, { status: expected.status }).status;
    if (row.tenant !== request.tenant || row.ownerId !== request.ownerId || row.orderCode !== request.orderCode ||
      row.status !== status || row.totalAmount !== request.amount || row.currency !== request.currency ||
      row.evidence?.sandbox !== true || row.evidence.maturity !== "OFFLINE_CONFORMANCE" ||
      row.evidence.providerReference !== expected.reference || !isDeepStrictEqual(row.evidence.originalRefundReceipt, expected))
      throw new Error("Retained original offline refund receipt changed; manual reconciliation is required");
    return row;
  },
  /** Executes a deterministic offline provider operation. @param {Object} request Sandbox request with opaque test token. @returns {Promise<Object>} Provider-shaped evidence. */
  execute: async function (request) {
    if (
      !request ||
      !request.tenant ||
      !request.idempotencyKey ||
      !["AUTHORIZE", "CAPTURE", "VOID", "REFUND"].includes(request.operation)
    )
      throw new Error("Invalid sandbox payment request");
    if (
      typeof request.providerToken !== "string" ||
      !request.providerToken.startsWith("tok_test_")
    )
      throw new Error("Sandbox token required");
    if (request.sandboxMode !== undefined) {
      if (request.sandboxMode !== "LOCAL_SANDBOX_DEMO" || request.operation !== "CAPTURE")
        throw new Error("Explicit original-capture sandbox mode supports capture; use guarded refundOriginal for refunds");
      return this.captureOriginal(request);
    }
    if (request.operation === "REFUND" && request.providerReference?.startsWith("sim_capture_"))
      throw new Error("Bound offline captures require guarded original-capture refund");
    const reference =
      "sim_" +
      crypto
        .createHash("sha256")
        .update(
          [request.tenant, request.operation, request.idempotencyKey].join(":"),
        )
        .digest("hex")
        .slice(0, 24);
    let status = {
      AUTHORIZE: "AUTHORIZED",
      CAPTURE: "CAPTURED",
      VOID: "VOIDED",
      REFUND: "REFUNDED",
    }[request.operation];
    if (
      request.operation === "AUTHORIZE" &&
      request.providerToken === "tok_test_storefront_0002"
    )
      status = "DECLINED";
    if (
      request.operation === "AUTHORIZE" &&
      request.providerToken === "tok_test_storefront_0000"
    )
      status = "CANCELLED";
    if (
      request.operation === "REFUND" &&
      request.providerToken.includes("_delay")
    )
      status = "REFUND_PENDING";
    if (
      request.operation === "REFUND" &&
      request.providerToken.includes("_fail")
    )
      status = "REFUND_FAILED";
    return Object.freeze({ reference, status, sandbox: true });
  },
};
