/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module bidding/controller/defaultBiddingController @description Maps authenticated participant commands into Commerce bidding without accepting caller-owned identity or an executable service name. @layer controller @owner bidding */
module.exports = {
  /** Maps bounded HTTP fields while preserving the trusted authentication envelope. */
  invoke: function (operation, request, callback) {
    const http = request.httpRequest || {},
      body = http.body || {},
      headers = http.headers || {};
    const input = {
      tenant: request.tenant,
      authData: request.authData,
      authorization: headers.authorization || headers.Authorization,
      code: http.params?.code,
      payload: body,
      idempotencyKey: headers["idempotency-key"] || body.idempotencyKey,
      correlationId: headers["x-correlation-id"] || request.requestId,
    };
    const promise = Promise.resolve()
      .then(() => SERVICE.DefaultBiddingService[operation](input))
      .then((data) => ({ data }));
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Returns only the current participant's incoming and outgoing bids. */
  list: function (request, callback) {
    return this.invoke("list", request, callback);
  },
  /** Returns one current participant's bid. */
  read: function (request, callback) {
    return this.invoke("read", request, callback);
  },
  /** Persists confirmed bid terms. */
  create: function (request, callback) {
    return this.invoke("create", request, callback);
  },
  /** Applies a confirmed seller or buyer decision. */
  decide: function (request, callback) {
    return this.invoke("decide", request, callback);
  },
};
