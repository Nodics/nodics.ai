/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/controller/enterprise/DefaultTenantNamespaceBindingController @description Admits only private internal namespace binding transport. @layer controller @owner profile @override Preserve private capture, fixed facade and safe errors. */
module.exports = {
  /** Maps bounded private runtime bootstrap inventory to the same owner facade. */
  inventory: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const result = Promise.resolve().then(() => {
      SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
      request.body = request.httpRequest?.body || request.body || {};
      return FACADE.DefaultTenantNamespaceBindingFacade.inventory(request);
    }).catch(() => { throw new CLASSES.NodicsError("ERR_PROFILE_TENANT_PROVISIONING_HELD"); });
    return callback ? result.then(value => callback(null, value), callback) : result;
  },
  /** Maps the fixed internal HTTP command without accepting browser authority. */
  bind: function (request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const result = Promise.resolve().then(() => {
      SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
      request.body = request.httpRequest?.body || request.body;
      request.params = request.httpRequest?.params || request.params;
      return FACADE.DefaultTenantNamespaceBindingFacade.bind(request);
    }).then(result => ({ code: "SUC_PRFL_00000", result })).catch(() => {
      throw new CLASSES.NodicsError("ERR_PROFILE_TENANT_PROVISIONING_HELD");
    });
    return callback ? result.then(value => callback(null, value), callback) : result;
  }
};
