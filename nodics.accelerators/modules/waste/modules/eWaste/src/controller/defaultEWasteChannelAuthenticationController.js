/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module eWaste/controller/defaultEWasteChannelAuthenticationController
 * @description Maps only channel and provider proof into eWaste channel orchestration while preserving trusted HTTP identity. No request body may select Profile application, principal or continuation destination.
 * @owner eWaste @layer controller
 * @override Later layers may decorate UI responses; preserve allowlisted mapping, cache prevention and Profile's browser completion boundary.
 */
module.exports = {
  /** Copies trusted runtime context and allowlisted channel/proof input; credentials and browser grants are not cached. */
  input: function (request) {
    request.httpResponse?.setHeader("Cache-Control", "no-store");
    return {
      ...request,
      channel: request.httpRequest?.params?.channel,
      proof: request.httpRequest?.body?.proof,
    };
  },
  /** Begins configured channel sign-in and returns the accelerator's shared-form or Profile-handoff result. */
  enter: function (request, callback) {
    const promise = Promise.resolve()
      .then(() =>
        SERVICE.DefaultEWasteChannelAuthenticationService.enter(
          this.input(request),
        ),
      )
      .then((data) => ({ data }));
    if (!callback) return promise;
    promise.then((result) => callback(null, result)).catch(callback);
  },
  /** Links a channel for the access-token customer selected by the secured route. */
  link: function (request, callback) {
    const promise = Promise.resolve()
      .then(() =>
        SERVICE.DefaultEWasteChannelAuthenticationService.link(
          this.input(request),
        ),
      )
      .then((data) => ({ data }));
    if (!callback) return promise;
    promise.then((result) => callback(null, result)).catch(callback);
  },
};
