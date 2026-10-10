/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/controller/defaultDigitalCommerceOwnershipEvidenceController
 * @description Preserves the original private signed request for fixed owner commands.
 * @layer controller @owner digitalCore
 */
module.exports = {
  /**
   * Dispatches a private facade operation with no-store headers and normalized ownership errors.
   * @param {string} operation Facade member selected by the controller's command methods.
   * @param {Object} request Original signed router request containing the command body.
   * @param {Function} [callback] Node-style callback receiving errors or the data envelope.
   * @returns {Promise<*>} Data envelope or callback result; rejects failed dispatch with ERR_DIGITAL_OWNERSHIP_EVIDENCE.
   */
  invoke: function (operation, request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const result = Promise.resolve().then(() => {
      SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
      return FACADE.DefaultDigitalCommerceOwnershipEvidenceFacade[operation](request, request.httpRequest?.body);
    }).then(data => ({ data })).catch(() => { throw new CLASSES.NodicsError("ERR_DIGITAL_OWNERSHIP_EVIDENCE"); });
    return callback ? result.then(value => callback(null, value)).catch(callback) : result;
  },
  /**
   * Routes a read-only ownership evidence command through private request admission.
   * @param {Object} request Signed router context with exact evidence selectors in its body.
   * @param {Function} [callback] Node-style callback receiving errors or the data envelope.
   * @returns {Promise<*>} Evidence envelope or callback result; propagates normalized dispatch errors.
   */
  query: function (request, callback) { return this.invoke("query", request, callback); },
  /**
   * Routes reviewed binding admission, which may insert a binding through its owner.
   * @param {Object} request Signed router context with selectors and reviewed plan digest.
   * @param {Function} [callback] Node-style callback receiving errors or the data envelope.
   * @returns {Promise<*>} Admission envelope or callback result; propagates normalized dispatch errors.
   */
  admitBinding: function (request, callback) { return this.invoke("admitBinding", request, callback); },
};
