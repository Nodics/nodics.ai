/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/controller/defaultEWasteOrderReversalController @description Restricts cross-domain refund ports to trusted internal Commerce service calls. @layer controller @owner eWaste */
module.exports = {
  /** Maps an allowlisted phase and trusted service context into the domain owner port. */
  invoke: function (request, callback) {
    const phase = request.httpRequest?.params?.phase;
    const result = Promise.resolve()
      .then(() => {
        if (!["preview", "prepare", "settle", "complete"].includes(phase))
          throw new Error("Unsupported reversal phase");
        return SERVICE.DefaultEWasteOrderReversalService[phase]({
          tenant: request.tenant,
          authData: request.authData,
          payload: request.httpRequest?.body,
          correlationId: request.requestId,
        });
      })
      .then((data) => ({ data }));
    return callback
      ? result.then((r) => callback(null, r)).catch(callback)
      : result;
  },
};
