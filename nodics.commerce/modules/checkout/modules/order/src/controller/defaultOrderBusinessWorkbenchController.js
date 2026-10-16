/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module order/controller/defaultOrderBusinessWorkbenchController @description Maps fixed business projection routes to Order-owned immutable reads. @layer controller @owner order */
module.exports = {
  /** Handles fixed schema selections, never a caller-provided service or schema name. */
  invoke: function (request, callback, operation, schemaName) {
    const service = SERVICE.DefaultOrderBusinessWorkbenchService;
    const promise = Promise.resolve().then(() => service[operation]({ ...request, payload: request.httpRequest?.body || {} }, schemaName)).then(data => ({ data }));
    if (!callback) return promise;
    promise.then(value => callback(null, value)).catch(callback);
  },
  /** Discovers permitted business projections. */
  schemas: function (request, callback) { return this.invoke(request, callback, "schemas"); },
  /** Returns immutable Order capabilities. */
  orderCapabilities: function (request, callback) { return this.invoke(request, callback, "descriptor", "commerceOrder"); },
  /** Searches immutable Orders. */
  orderSearch: function (request, callback) { return this.invoke(request, callback, "search", "commerceOrder"); },
  /** Returns lifecycle request capabilities. */
  lifecycleCapabilities: function (request, callback) { return this.invoke(request, callback, "descriptor", "orderLifecycleRequest"); },
  /** Searches lifecycle requests without exposing private owner evidence. */
  lifecycleSearch: function (request, callback) { return this.invoke(request, callback, "search", "orderLifecycleRequest"); },
};
