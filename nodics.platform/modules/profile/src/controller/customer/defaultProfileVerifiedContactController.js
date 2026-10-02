/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/controller/customer/DefaultProfileVerifiedContactController @description Maps fixed protected Customer contact commands to safe content-free owner outcomes. @layer controller @owner profile @override Later layers may narrow exposure; preserve exact private entry, self authority, no-store and withholding of secrets/proofs. */
module.exports = {
  /** Executes only a route-owned fixed operation, sanitizing transient submitted verification codes. @param {string} operation Fixed owner command. @param {Object} request Protected request. @param {Function} [callback] Framework callback. @returns {Promise<Object>|void} Safe result. */
  execute: function (operation, request, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const promise = Promise.resolve()
      .then(async () => {
        SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
        request.body = request.httpRequest?.body || request.body || {};
        request.query = request.httpRequest?.query || request.query || {};
        if (Object.keys(request.query).length)
          throw new CLASSES.NodicsError("ERR_AUTH_00003");
        try {
          const result =
            await FACADE.DefaultProfileVerifiedContactFacade.execute(
              operation,
              request,
            );
          const allowed = [
            "commandId",
            "revision",
            "status",
            "verified",
            "deliveryStatus",
            "purpose",
            "purposeVersion",
            "granted",
            "suppressed",
          ];
          if (
            !result ||
            typeof result !== "object" ||
            Array.isArray(result) ||
            ![Object.prototype, null].includes(Object.getPrototypeOf(result)) ||
            Reflect.ownKeys(result).some((key) => !allowed.includes(key)) ||
            Object.keys(result).some((key) => {
              const descriptor = Object.getOwnPropertyDescriptor(result, key);
              return (
                !descriptor?.enumerable || !Object.hasOwn(descriptor, "value")
              );
            }) ||
            !Number.isSafeInteger(result.revision) ||
            result.revision < 0 ||
            result.revision > 2147483647 ||
            (operation === "CONSENT" &&
              (!Number.isSafeInteger(result.purposeVersion) ||
                result.purposeVersion !== request.body.purposeVersion)) ||
            Object.entries(result).some(([key, value]) =>
              ["verified", "granted", "suppressed"].includes(key)
                ? typeof value !== "boolean"
                : key === "revision"
                  ? false
                  : key === "purposeVersion"
                    ? !Number.isSafeInteger(value) ||
                      value < 1 ||
                      value > 2147483647
                    : key === "commandId"
                      ? typeof value !== "string" ||
                        !/^[a-f0-9]{64}$/.test(value)
                      : typeof value !== "string" ||
                        !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(value),
            )
          )
            throw new CLASSES.NodicsError("ERR_AUTH_00003");
          return { code: "SUC_PRFL_00000", data: { ...result } };
        } finally {
          if (request.body && Object.hasOwn(request.body, "secret"))
            delete request.body.secret;
        }
      })
      .catch(() => {
        throw new CLASSES.NodicsError("ERR_AUTH_00003");
      });
    return callback
      ? promise.then((result) => callback(null, result)).catch(callback)
      : promise;
  },
  /** Starts approved owner delivery without returning a challenge secret. @param {Object} request Protected request. @param {Function} [callback] Callback. @returns {Promise<Object>|void} Progress. */
  begin: function (request, callback) {
    return this.execute("BEGIN", request, callback);
  },
  /** Verifies and consumes proof internally; the browser never receives it. @param {Object} request Protected request. @param {Function} [callback] Callback. @returns {Promise<Object>|void} Progress. */
  verify: function (request, callback) {
    return this.execute("VERIFY", request, callback);
  },
  /** Inspects current original progress without sending or consuming. @param {Object} request Protected request. @param {Function} [callback] Callback. @returns {Promise<Object>|void} Progress. */
  inspect: function (request, callback) {
    return this.execute("INSPECT", request, callback);
  },
  /** Records one explicit self transactional-purpose decision. @param {Object} request Protected request. @param {Function} [callback] Callback. @returns {Promise<Object>|void} Receipt. */
  consent: function (request, callback) {
    return this.execute("CONSENT", request, callback);
  },
  /** Changes suppression independently of consent. @param {Object} request Protected request. @param {Function} [callback] Callback. @returns {Promise<Object>|void} Receipt. */
  suppression: function (request, callback) {
    return this.execute("SUPPRESSION", request, callback);
  },
};
