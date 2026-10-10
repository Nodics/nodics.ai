/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const diagnostics = require("../utils/merchantValidationDiagnostics");
/** @module digitalCore/controller/defaultDigitalCommerceMerchantController @description Maps customer claims and employee merchant confirmations while retaining trusted identity and stable command references. @layer controller @owner digitalCore */
module.exports = {
  /** Maps only route, body and trace fields into the declared server-owned operation. */
  invoke: function (operation, request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const http = request.httpRequest || {},
      p = http.body || {},
      h = http.headers || {};
    const input = {
      tenant: request.tenant,
      authData: request.authData,
      code: http.params?.code,
      payload: p,
      query: http.query || {},
      authorization: h.authorization,
      idempotencyKey: h["idempotency-key"] || p.idempotencyKey,
      correlationId: h["x-correlation-id"] || request.requestId,
    };
    const promise = Promise.resolve()
      .then(() => {
        if (["validate", "confirm", "inspectReceipt"].includes(operation)) {
          SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
          SERVICE.DefaultLoggerService.inheritRequestPrivacy(input, request);
        }
        if (
          ![
            "validate",
            "eligibleMerchants",
            "claim",
            "queue",
            "workspace",
            "confirm",
            "inspectReceipt",
          ].includes(operation)
        )
          throw new CLASSES.NodicsError("ERR_DIGITAL_MERCHANT_INVALID");
        return FACADE.DefaultDigitalCommerceMerchantFacade[operation](input);
      })
      .then((data) => ({ data }))
      .catch((error) => {
        const confirmation = operation === "confirm" &&
          SERVICE.DefaultDigitalCommerceMerchantService?.confirmationDiagnostic?.(error);
        const stage = operation === "validate" ?
          SERVICE.DefaultDigitalCommerceMerchantService?.validationDiagnostic?.(error) : confirmation ? "CONFIRM:" + confirmation : undefined;
        const admission = stage === "ISSUER_ADMISSION" ?
          SERVICE.DefaultPromotionMerchantScopeService?.admissionFailureStage?.(error) : stage === "MERCHANT" ?
          SERVICE.DefaultDigitalCommerceMerchantService?.merchantFailureStage?.(error) : stage === "RIGHTS" ?
          SERVICE.DefaultPromotionPricedTransactionAdapterService?.failureStage?.(error) ||
          SERVICE.DefaultPromotionOperationService?.merchantValidationFailureStage?.(error) : stage === "CONFIRM:PROVIDER" ?
          SERVICE.DefaultDigitalCommercePricedMerchantProviderService?.failureStage?.(error) : stage === "CONFIRM:REDEEM" ?
          SERVICE.DefaultPromotionBudgetMutationService?.failureStage?.(error) ||
          SERVICE.DefaultPromotionCouponBudgetService?.failureStage?.(error) : undefined;
        const detail = stage + ":" + admission;
        const selected = Object.hasOwn(diagnostics.codes, detail) ? detail : stage;
        if (Object.hasOwn(diagnostics.codes, selected))
          throw new CLASSES.NodicsError({ code: diagnostics.codes[selected],
            message: diagnostics.statuses[diagnostics.codes[selected]].message });
        throw new CLASSES.NodicsError("ERR_DIGITAL_MERCHANT_INVALID");
      });
    return callback
      ? promise.then((r) => callback(null, r)).catch(callback)
      : promise;
  },
  /** Validates an exact presented reference under current merchant scope. */
  validate: function (r, c) {
    return this.invoke("validate", r, c);
  },
  /** Lists merchants bound to a customer-owned coupon. */
  eligibleMerchants: function (r, c) {
    return this.invoke("eligibleMerchants", r, c);
  },
  /** Records confirmed customer claim intent. */
  claim: function (r, c) {
    return this.invoke("claim", r, c);
  },
  /** Reads only scoped merchant requests. */
  queue: function (r, c) {
    return this.invoke("queue", r, c);
  },
  /** Reads inert current staff outlet choices without accepting tenant or merchant identity. @param {Object} r Signed request. @param {Function} c Callback. @returns {Promise<Object>|void} Safe owner workspace. */
  workspace: function (r, c) {
    return this.invoke("workspace", r, c);
  },
  /** Confirms fulfillment through the configured provider. */
  confirm: function (r, c) {
    return this.invoke("confirm", r, c);
  },
  /** Inspects a source-bound original receipt without a redemption side effect. */
  inspectReceipt: function (r, c) {
    return this.invoke("inspectReceipt", r, c);
  },
};
