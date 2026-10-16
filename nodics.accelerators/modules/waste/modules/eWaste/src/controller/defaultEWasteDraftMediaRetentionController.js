/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/**
 * @module eWaste/controller/defaultEWasteDraftMediaRetentionController
 * @description Preserves the private signed request for bounded read-only owner inspection.
 * @owner eWaste @layer controller
 * @override Later layers may decorate the response while retaining privacy and the service's independent admission.
 */
module.exports = {
  /**
   * Dispatches an inspection without creating a job or invoking any Media mutation.
   * @param {Object} request Original secured nRouter request.
   * @param {Function} [callback] Node-style completion callback.
   * @returns {Promise<Object>} Data envelope; propagates owner rejection and sets no-store.
   */
  inspect: function (request, callback) {
    const result = Promise.resolve().then(() => {
      request.httpResponse?.setHeader?.("Cache-Control", "no-store");
      return SERVICE.DefaultEWasteDraftMediaRetentionService.run(request);
    }).then(data => ({ data }));
    return callback ? result.then(value => callback(null, value)).catch(callback) : result;
  },
};
