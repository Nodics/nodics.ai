/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module eWaste/controller/defaultEWasteJourneyController @description Applies domain journey policy through the trusted eWaste request mapper. @layer controller @owner eWaste */
module.exports = {
  /** Keeps service selection server-owned and reuses canonical customer resolution. */
  invoke: function (operation, request, callback) {
    const promise = Promise.resolve().then(async () => {
      const raw = ((request.httpRequest && request.httpRequest.headers) || {})[
        "x-ewaste-telegram-launch"
      ];
      const origin = ['createDraft', 'prepareSubmission'].includes(operation) && raw
        ? await SERVICE.DefaultEWasteChannelAuthenticationService.origin(raw, request, "TELEGRAM")
        : { channel: "WEB" };
      const trusted = Object.assign({}, request, {
        authData: Object.assign({}, request.authData, { eWasteOrigin: origin }),
      });
      return SERVICE.DefaultEWasteRequestService.invoke(
        operation,
        trusted,
        undefined,
        "DefaultEWasteJourneyService",
      );
    });
    if (!callback) return promise;
    promise.then((value) => callback(null, value)).catch(callback);
  },
  /** Handles optional contextual help. */
  message: function (request, callback) {
    return this.invoke("message", request, callback);
  },
  /** Captures/validates arrival context. */
  arrival: function (request, callback) {
    return this.invoke("arrival", request, callback);
  },
  /** Reads arrival options without saving an unfinished record. */
  previewArrival: function (request, callback) {
    return this.invoke("previewArrival", request, callback);
  },
  /** Saves only a successfully analyzed item. */
  prepareSubmission: function (request, callback) {
    return this.invoke("prepareSubmission", request, callback);
  },
  /** Creates a canonical draft. */
  createDraft: function (request, callback) {
    return this.invoke("createDraft", request, callback);
  },
  /** Applies domain evidence policy. */
  attachPhoto: function (request, callback) {
    return this.invoke("attachPhoto", request, callback);
  },
  /** Runs analysis and prepares its compact review. */
  analyzePhoto: function (request, callback) {
    return this.invoke("analyzePhoto", request, callback);
  },
  /** Prepares updated facts. */
  estimate: function (request, callback) {
    return this.invoke("prepare", request, callback);
  },
  /** Submits the reviewed revision. */
  confirm: function (request, callback) {
    return this.invoke("confirm", request, callback);
  },
};
