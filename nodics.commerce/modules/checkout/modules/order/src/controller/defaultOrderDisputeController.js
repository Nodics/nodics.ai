/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module order/controller/defaultOrderDisputeController @description Maps trusted customer and moderator identities into reviewed manual Order lifecycle requests. @layer controller @owner order */
module.exports = {
  /** Accepts only declared route/body/trace values; business ownership comes from authentication. */
  invoke: function (operation, request, callback) {
    const http = request.httpRequest || {},
      p = http.body || {},
      h = http.headers || {},
      input = {
        tenant: request.tenant,
        authData: request.authData,
        code: http.params?.code,
        payload: p,
        authorization: h.authorization,
        idempotencyKey: h["idempotency-key"] || p.idempotencyKey,
        correlationId: h["x-correlation-id"] || request.requestId,
      };
    const promise = Promise.resolve()
      .then(() => SERVICE.DefaultOrderDisputeService[operation](input))
      .then((data) => ({ data }));
    return callback
      ? promise.then((r) => callback(null, r)).catch(callback)
      : promise;
  },
  /** Previews refund effects from the original payment and domain owners. */
  refundPreview: function (r, c) {
    return this.refundInvoke("preview", r, c);
  },
  /** Executes or retries an explicitly approved refund. */
  refundExecute: function (r, c) {
    return this.refundInvoke("execute", r, c);
  },
  /** Maps trusted moderator context into the dedicated owner refund operation. */
  refundInvoke: function (operation, request, callback) {
    const http = request.httpRequest || {},
      p = http.body || {},
      h = http.headers || {};
    const promise = Promise.resolve()
      .then(() =>
        SERVICE.DefaultOrderRefundRecoveryService[operation]({
          tenant: request.tenant,
          authData: request.authData,
          code: http.params?.code,
          payload: p,
          authorization: h.authorization,
          idempotencyKey: h["idempotency-key"] || p.idempotencyKey,
          correlationId: h["x-correlation-id"] || request.requestId,
        }),
      )
      .then((data) => ({ data }));
    return callback
      ? promise.then((r) => callback(null, r)).catch(callback)
      : promise;
  },
  /** Reads a customer's order review history. */
  listOwn: function (r, c) {
    return this.invoke("listOwn", r, c);
  },
  /** Creates the reviewed customer request. */
  create: function (r, c) {
    return this.invoke("create", r, c);
  },
  /** Reads the scoped moderator queue. */
  queue: function (r, c) {
    return this.invoke("queue", r, c);
  },
  /** Records a reviewed moderator outcome. */
  resolve: function (r, c) {
    return this.invoke("resolve", r, c);
  },
};
