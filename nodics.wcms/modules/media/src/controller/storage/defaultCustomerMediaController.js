/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module media/controller/defaultCustomerMediaController @description Maps customer media HTTP requests to owner-authorized Media operations. @layer controller @owner media @override Extend mapping without accepting caller storage addresses. */
module.exports = {
  /** Maps trusted transport context and invokes the selected media operation. */
  invoke: function (operation, request, callback) {
    const http = request.httpRequest || {};
    const promise = SERVICE.DefaultCustomerMediaService[
      operation === "readInternal" ? "read" : operation
    ]({
      authData: request.authData,
      tenant: request.tenant,
      files: http.files || [],
      payload: operation === "uploadEncoded" ? http.body : undefined,
      internalEvidenceRead: operation === "readInternal",
      code: (http.params || {}).code,
    }).then((data) => ({ data: data }));
    if (!callback) return promise;
    promise.then((value) => callback(null, value)).catch(callback);
  },
  /** Uploads customer photo evidence. */
  upload: function (request, callback) {
    return this.invoke("upload", request, callback);
  },
  /** Ingests encoded customer bytes through the same Media upload authority. */
  uploadEncoded: function (request, callback) {
    return this.invoke("uploadEncoded", request, callback);
  },
  /** Reads evidence only on the service-authorized internal route. */
  readInternal: function (request, callback) {
    return this.invoke("readInternal", request, callback);
  },
  /** Reads a customer-owned original photo. */
  read: function (request, callback) {
    return this.invoke("read", request, callback);
  },
};
