/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module product/controller/defaultProductListingAuthoringController @description Accepts service-authorized source listing authoring. @layer controller @owner product */
module.exports = {
  /** Maps trusted runtime context and the listing payload. */
  create: function (request, callback) {
    request.payload = request.httpRequest.body || {};
    const promise = SERVICE.DefaultProductListingAuthoringService.create(
      request,
    ).then((data) => ({ data }));
    if (!callback) return promise;
    promise.then((v) => callback(null, v)).catch(callback);
  },
};
