/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module digitalCore/controller/defaultDigitalCommerceMerchantController @description Maps customer claims and employee merchant confirmations while retaining trusted identity and stable command references. @layer controller @owner digitalCore */
module.exports = {
  /** Maps only route, body and trace fields into the declared server-owned operation. */
  invoke: function (operation, request, callback) {
    const http = request.httpRequest || {},
      p = http.body || {},
      h = http.headers || {};
    const input = {
      tenant: request.tenant,
      authData: request.authData,
      code: http.params?.code,
      payload: p,
      authorization: h.authorization,
      idempotencyKey: h["idempotency-key"] || p.idempotencyKey,
      correlationId: h["x-correlation-id"] || request.requestId,
    };
    const promise = Promise.resolve()
      .then(() =>
        SERVICE.DefaultDigitalCommerceMerchantService[operation](input),
      )
      .then((data) => ({ data }));
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
  /** Confirms fulfillment through the configured provider. */
  confirm: function (r, c) {
    return this.invoke("confirm", r, c);
  },
};
