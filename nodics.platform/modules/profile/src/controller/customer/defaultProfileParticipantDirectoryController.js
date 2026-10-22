/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/controller/customer/defaultProfileParticipantDirectoryController @description Private recipient directory transport. @layer controller @owner profile */
module.exports = {
  /** Maps only fixed operations and prevents caching identity projections. */
  execute: function (request, callback, operation) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const work = Promise.resolve().then(() => FACADE.DefaultProfileParticipantDirectoryFacade[operation](request))
      .then(data => ({ code: "SUC_PRFL_00000", data }));
    return callback ? work.then(value => callback(null, value), error => callback(error)) : work;
  },
  /** Searches bounded public recipient displays. */
  search: function (request, callback) { return this.execute(request, callback, "search"); },
  /** Resolves one selected existing recipient. */
  resolve: function (request, callback) { return this.execute(request, callback, "resolve"); },
};
