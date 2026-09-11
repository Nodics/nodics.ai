/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module paymentCore/src/service/defaultPaymentRefundExecutionService @description Coordinates provider-neutral refund execution and reconciliation evidence through Payment-owned services. @layer service @owner paymentCore */
module.exports = {
  /** Reads the captured payment owned by this order, without accepting amount or provider evidence from a caller. */
  orderCapture: async function (request) {
    const value = await SERVICE.DefaultPaymentTransactionEntryService.get({
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query: {
        orderCode: request.orderCode,
        ownerId: request.ownerId,
        "evidence.operation": "CAPTURE",
      },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2 },
    });
    let rows = value;
    for (let n = 0; n < 7 && rows && !Array.isArray(rows); n++) {
      if (rows.data !== undefined) rows = rows.data;
      else if (rows.result !== undefined) rows = rows.result;
      else break;
    }
    rows = Array.isArray(rows) ? rows : rows?.code ? [rows] : [];
    if (rows.length !== 1 || rows[0].status !== "CAPTURED")
      throw new Error(
        "A single successful captured payment is required for automatic refund",
      );
    const c = rows[0],
      evidence = c.evidence || {};
    if (
      evidence.providerCode !== "loyalty-reward-points" ||
      !evidence.walletCode ||
      !evidence.providerReference
    )
      throw new Error("This payment requires manual provider refund review");
    if (
      SERVICE.DefaultExactAmountService.compare(
        String(c.totalAmount),
        String(request.totalAmount),
      ) !== 0 ||
      c.currency !== request.currency
    )
      throw new Error("Captured payment does not match the order total");
    return {
      captureCode: c.code,
      amount: c.totalAmount,
      currency: c.currency,
      providerCode: evidence.providerCode,
      methodCode: evidence.methodCode,
      walletCode: evidence.walletCode,
      programCode: evidence.programCode,
      rewardTypeCode: evidence.rewardTypeCode,
      reversalOfEntryCode: evidence.providerReference,
    };
  },
  /** Refunds the full original capture under one stable order-derived identity. */
  refundOrder: async function (request) {
    const capture = await this.orderCapture(request);
    return this.executeRefund({
      ...request,
      ...capture,
      authData: this.serviceAuthData(request),
      idempotencyKey: "order-full-refund:" + request.orderCode,
      payload: { ...capture, amount: capture.amount },
    });
  },
  /** Resolves the configured refund provider adapter. @param {Object} request Refund request. @returns {Object} Provider adapter. */
  adapter: function (request) {
    const providerCode =
      request.providerCode ||
      (request.payload && request.payload.providerCode) ||
      "stripe-sandbox";
    const adapters = {
      "stripe-sandbox": SERVICE.DefaultStripeSandboxAdapterService,
      "loyalty-reward-points":
        SERVICE.DefaultLoyaltyRewardPaymentProviderService,
    };
    const adapter = adapters[providerCode];
    if (!adapter || typeof adapter.execute !== "function")
      throw new Error("Refund provider adapter is unavailable");
    return adapter;
  },
  /** Builds service credentials for Payment-owned operational persistence. @param {Object} request Refund request. @returns {Object} Service auth data. */
  serviceAuthData: function (request) {
    return Object.assign({}, request.authData || {}, {
      principalId: "commercePaymentRefundExecutionService",
      code: "commercePaymentRefundExecutionService",
      loginId: "commercePaymentRefundExecutionService",
      principalType: "service",
      userGroups: ["serviceAccountUserGroup"],
      groups: ["serviceAccountUserGroup"],
    });
  },
  /** Adds persistence metadata required by operational generated schemas. @param {Object} model Transaction model. @returns {Object} Persistable transaction model. */
  persistenceModel: function (model) {
    const now = new Date();
    return Object.assign(
      {
        code:
          model.code ||
          [model.orderCode, model.operation, model.idempotencyKey]
            .filter(Boolean)
            .join(":"),
        active: true,
        revision: 0,
        occurredAt: now,
        created: now,
        updated: now,
      },
      model,
    );
  },
  /** Returns a repository adapter around generated Payment services. @param {Object} request Refund request. @returns {Object} Repository adapter. */
  repository: function (request) {
    const self = this,
      authData = this.serviceAuthData(request);
    return {
      /**
       * Executes `find` as a loader-visible operation owned by this module.
       * @param {*} tenant Value defined by the owning module contract.
       * @param {*} idempotencyKey Value defined by the owning module contract.
       * @returns {*} Result defined by the owning module contract.
       * @override Later-loaded modules may replace this member through the standard merge contract.
       */
      find: function (tenant, idempotencyKey) {
        return SERVICE.DefaultPaymentTransactionService.get({
          tenant,
          authData,
          query: { tenant, idempotencyKey, "evidence.operation": "REFUND" },
          pageSize: 1,
        }).then((response) => {
          const result =
            response && Object.prototype.hasOwnProperty.call(response, "result")
              ? response.result
              : response;
          return Array.isArray(result) ? result[0] : result;
        });
      },
      /**
       * Executes `record` as a loader-visible operation owned by this module.
       * @param {*} model Value defined by the owning module contract.
       * @returns {*} Result defined by the owning module contract.
       * @override Later-loaded modules may replace this member through the standard merge contract.
       */
      record: function (model) {
        return SERVICE.DefaultPaymentTransactionService.save({
          tenant: model.tenant,
          authData,
          model: self.persistenceModel(model),
        }).then((response) =>
          response && Object.prototype.hasOwnProperty.call(response, "result")
            ? response.result
            : response,
        );
      },
    };
  },
  /** Builds stable reconciliation evidence for delayed, failed, or ambiguous refund outcomes. @param {Object} request Refund request. @param {Object} transaction Stored transaction. @returns {Object|null} Reconciliation model or null. */
  reconciliationModel: function (request, transaction) {
    if (!transaction || transaction.reconciliationRequired !== true)
      return null;
    const now = new Date();
    return {
      code: [
        transaction.orderCode,
        "refund-reconciliation",
        transaction.idempotencyKey,
      ]
        .filter(Boolean)
        .join(":"),
      tenant: transaction.tenant,
      ownerId: transaction.ownerId,
      orderCode: transaction.orderCode,
      cartCode: transaction.cartCode,
      status:
        transaction.status === "REFUND_FAILED"
          ? "ACTION_REQUIRED"
          : "PENDING_PROVIDER_CONFIRMATION",
      revision: 0,
      active: true,
      idempotencyKey: transaction.idempotencyKey,
      correlationId: transaction.correlationId || request.correlationId,
      occurredAt: now,
      created: now,
      updated: now,
      evidence: {
        paymentTransactionCode: transaction.code,
        providerCode: transaction.providerCode,
        providerReference: transaction.providerReference,
        refundStatus: transaction.status,
        reason:
          transaction.status === "REFUND_FAILED"
            ? "PROVIDER_REJECTED_REFUND"
            : "PROVIDER_CONFIRMATION_DELAYED",
      },
    };
  },
  /** Records reconciliation evidence if required by refund result. @param {Object} request Refund request. @param {Object} transaction Stored transaction. @returns {Promise<Object|null>} Reconciliation record or null. */
  recordReconciliation: async function (request, transaction) {
    const model = this.reconciliationModel(request, transaction);
    if (
      !model ||
      !SERVICE.DefaultPaymentReconciliationService ||
      typeof SERVICE.DefaultPaymentReconciliationService.save !== "function"
    )
      return null;
    const response = await SERVICE.DefaultPaymentReconciliationService.save({
      tenant: model.tenant,
      authData: this.serviceAuthData(request),
      model,
    });
    return response && Object.prototype.hasOwnProperty.call(response, "result")
      ? response.result
      : response;
  },
  /** Executes a full or partial refund with provider-neutral idempotency and reconciliation evidence. @param {Object} request Refund request. @returns {Promise<Object>} Refund transaction and reconciliation summary. */
  executeRefund: async function (request) {
    const payload = request.payload || {};
    const amount = payload.amount || payload.refundAmount || request.amount;
    if (
      !request.tenant ||
      !request.orderCode ||
      !amount ||
      !request.idempotencyKey
    )
      throw new Error(
        "Tenant order refund amount and idempotency key are required",
      );
    const transaction = await SERVICE.DefaultPaymentExecutionService.execute(
      Object.assign({}, request, {
        operation: "REFUND",
        methodCode: payload.methodCode || request.methodCode,
        amount,
        currency: payload.currency || request.currency || "USD",
        providerToken:
          payload.providerToken || request.providerToken || "tok_test_refund",
        providerReference:
          payload.providerReference || request.providerReference,
        walletCode: payload.walletCode || request.walletCode,
        programCode: payload.programCode || request.programCode,
        rewardTypeCode: payload.rewardTypeCode || request.rewardTypeCode,
        reversalOfEntryCode:
          payload.reversalOfEntryCode || request.reversalOfEntryCode,
      }),
      this.adapter(request),
      this.repository(request),
    );
    const reconciliation = await this.recordReconciliation(
      request,
      transaction,
    );
    return Object.freeze({
      transaction,
      reconciliation,
      status: transaction.status,
      reconciliationRequired: transaction.reconciliationRequired === true,
    });
  },
};
