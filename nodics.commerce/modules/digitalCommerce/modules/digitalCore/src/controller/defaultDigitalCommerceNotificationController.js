/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module digitalCore/controller/defaultDigitalCommerceNotificationController @description Maps scoped source inspection and existing-intent retry without caller recipients or transport choices. @layer controller @owner digitalCore */
module.exports = {
  /** Maps bounded HTTP input to the existing domain owner. @param {Object} r Signed request. @param {Function} c Callback. @param {boolean} retry Retry selection. @param {boolean} workspace Native workspace selection. @param {boolean} source Internal committed-source selection. @returns {Promise<Object>|void} Safe progress. */
  invoke: function (r, c, retry, workspace = false, source = false) {
    r.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const http = r.httpRequest || {};
    const result = Promise.resolve()
      .then(() => {
        const mapped = {
          tenant: r.tenant,
          authData: r.authData,
          authorization: http.headers?.authorization,
          code: http.params?.code,
          payload: http.body || {},
          query: http.query || {},
        };
        if (source) {
          SERVICE.DefaultLoggerService.assertSensitiveRequest(r);
          SERVICE.DefaultLoggerService.inheritRequestPrivacy(mapped, r);
        }
        return FACADE.DefaultDigitalCommerceNotificationFacade[
          source
            ? "recipientSource"
            : workspace
              ? "workspace"
              : retry
                ? "retry"
                : "inspect"
        ](mapped);
      })
      .then((data) => ({ data }))
      .catch(() => {
        throw new CLASSES.NodicsError("ERR_DIGITAL_NOTIFICATION_UNCONFIRMED");
      });
    return c ? result.then((value) => c(null, value)).catch(c) : result;
  },
  /** Reads private committed source only through the fixed runtime facade. @param {Object} r Request. @param {Function} c Callback. @returns {Promise<Object>|void} Source proof. */
  recipientSource: function (r, c) {
    return this.invoke(r, c, false, false, true);
  },
  /** Inspects original source-bound durable Communication states without creating or retrying delivery. @param {Object} r Request. @param {Function} c Callback. @returns {Promise<Object>|void} Redacted intent observations. */
  inspect: function (r, c) {
    return this.invoke(r, c, false);
  },
  /** Reads the versioned native workspace with no browser-owned transport choices. @param {Object} r Request. @param {Function} c Callback. @returns {Promise<Object>|void} Workspace DTO. */
  workspace: function (r, c) {
    return this.invoke(r, c, false, true);
  },
  /** Retries only Communication's existing original frozen intent. @param {Object} r Request. @param {Function} c Callback. @returns {Promise<Object>|void} Redacted progress. */
  retry: function (r, c) {
    return this.invoke(r, c, true);
  },
};
