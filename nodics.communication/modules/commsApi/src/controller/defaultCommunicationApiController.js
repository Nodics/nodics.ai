/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsApi/src/controller/defaultCommunicationApiController @description Maps bounded Communication HTTP inputs to its secured facade. @layer controller @owner commsApi @override Later controllers may add mappings while preserving DTO boundaries. */
module.exports = {
  /** Executes the bounded service-only verification contract; never a public OTP endpoint. */
  executeVerification: function (request, callback) {
    return this.invoke("executeVerification", request, callback);
  },
  /** Maps bounded HTTP data and invokes a secured owner facade operation. */
  invoke: function (operation, request, callback) {
    const sensitive = [
      "executeVerification",
      "requestCommunication",
      "inspectDelivery",
      "retryDelivery",
      "resolveDelivery",
    ].includes(operation);
    const promise = Promise.resolve()
      .then(() => {
        if (sensitive) {
          try {
            SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
          } catch (_) {
            throw new CLASSES.NodicsError(
              operation === "executeVerification"
                ? "ERR_COMMS_VERIFY_CONTEXT"
                : "ERR_COMMS_INTEGRATION_CONTEXT",
            );
          }
          request.httpResponse?.setHeader?.("Cache-Control", "no-store");
        }
        const http = request.httpRequest || {},
          params = http.params || {};
        request.intentCode = params.intentCode || request.intentCode;
        request.providerCode = params.providerCode || request.providerCode;
        request.query = http.query || request.query || {};
        request.payload =
          operation === "inspectDelivery" && request.httpRequest
            ? http.body
            : http.body || request.payload || {};
        return FACADE.DefaultCommunicationApiFacade[operation](request);
      })
      .then((data) => ({ data }))
      .catch((error) => {
        if (!sensitive) throw error;
        const verification = operation === "executeVerification",
          allowed = verification
            ? [
                "ERR_COMMS_VERIFY_INPUT",
                "ERR_COMMS_VERIFY_POLICY",
                "ERR_COMMS_VERIFY_CONTEXT",
                "ERR_COMMS_VERIFY_STATE",
                "ERR_COMMS_VERIFY_STORAGE",
                "ERR_COMMS_VERIFY_CONFLICT",
                "ERR_COMMS_VERIFY_RATE",
              ]
            : [
                "ERR_COMMS_INTEGRATION_INPUT",
                "ERR_COMMS_INTEGRATION_CONTEXT",
                "ERR_COMMS_INTEGRATION_STORAGE",
              ];
        throw new CLASSES.NodicsError(
          allowed.includes(error?.code)
            ? error.code
            : verification
              ? "ERR_COMMS_VERIFY_STORAGE"
              : "ERR_COMMS_INTEGRATION_STORAGE",
        );
      });
    if (!callback) return promise;
    promise.then((value) => callback(null, value)).catch(callback);
  },
  /** Records authorized uncertainty reconciliation. */
  resolveDelivery: function (request, callback) {
    return this.invoke("resolveDelivery", request, callback);
  },
  /** Reads source-authorized delivery evidence without sending or retrying. */
  inspectDelivery: function (request, callback) {
    return this.invoke("inspectDelivery", request, callback);
  },
  /** Requests a private durable communication. */
  requestCommunication: function (request, callback) {
    return this.invoke("requestCommunication", request, callback);
  },
  /** Lists the authenticated customer's inbox. */
  listInbox: function (request, callback) {
    return this.invoke("listInbox", request, callback);
  },
  /** Retries a recorded delivery through its owner policy. */
  retryDelivery: function (request, callback) {
    return this.invoke("retryDelivery", request, callback);
  },
  /** Receives an authenticated provider callback. */
  receiveCallback: function (request, callback) {
    return this.invoke("receiveCallback", request, callback);
  },
};
