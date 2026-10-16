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
  /** Returns only proven original Product selectors and exact publication/Process references. */
  sourceEvidence: function (request, callback) {
    request.payload = request.httpRequest.body || {};
    const promise = SERVICE.DefaultProductListingAuthoringService.sourceEvidence(request).then(data => ({ data }));
    if (!callback) return promise;
    promise.then(value => callback(null, value)).catch(callback);
  },
  /** Returns exact owner Store placement to an admitted runtime, never customer-selected namespace authority. */
  storeContext: function (request, callback) {
    request.payload = request.httpRequest.body || {};
    const promise = SERVICE.DefaultProductListingAuthoringService.storeContext(request).then(data => ({ data }));
    if (!callback) return promise;
    promise.then(value => callback(null, value)).catch(callback);
  },
  /** Accepts selectors only; the owner resolves source proof using its own runtime identity. */
  createHuman: function (request, callback) {
    request.payload = request.httpRequest.body || {};
    const promise = SERVICE.DefaultProductListingAuthoringService.createHuman(request).then(data => ({ data }));
    if (!callback) return promise;
    promise.then(value => callback(null, value)).catch(callback);
  },
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
