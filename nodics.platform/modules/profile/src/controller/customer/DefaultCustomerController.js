/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require("lodash");

/**
 * @module nodics.platform/modules/profile/src/controller/customer/DefaultCustomerController
 * @description Exposes request handlers for profile default customer controller operations.
 * @layer controller
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  /** Delegates explicit Customer browser context issuance to the shared Profile cookie owner. */
  switchParticipation: function (request, callback) {
    const promise = Promise.resolve()
      .then(() =>
        SERVICE.DefaultBrowserSessionService.switchParticipation(request),
      )
      .then((data) => ({ code: "SUC_PRFL_00000", data }));
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Maps one fixed consent lifecycle action; uncertainty returns a stable error and never retries. */
  participationLifecycle: function (request, callback, operation) {
    request.body = request.httpRequest?.body || request.body || {};
    request.query = request.httpRequest?.query || request.query || {};
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const promise = Promise.resolve()
      .then(() => FACADE.DefaultCustomerFacade[operation](request))
      .then((data) => ({ code: "SUC_PRFL_00000", data }))
      .catch(() => {
        throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_CONFLICT");
      });
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Renews exact disclosed terms without issuing a session. */
  renewParticipation: function (request, callback) {
    return this.participationLifecycle(request, callback, "renewParticipation");
  },
  /** Withdraws consent without deleting transactions or Employee access. */
  withdrawParticipation: function (request, callback) {
    return this.participationLifecycle(
      request,
      callback,
      "withdrawParticipation",
    );
  },
  /** Reads exact customer terms without accepting consent or granting a session. @param {Object} request Current Employee. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Inert workspace. */
  participationWorkspace: function (request, callback) {
    request.body = request.httpRequest?.body || request.body || {};
    request.query = request.httpRequest?.query || request.query || {};
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const promise = Promise.resolve()
      .then(() => FACADE.DefaultCustomerFacade.participationWorkspace(request))
      .then((data) => ({ code: "SUC_PRFL_00000", data }))
      .catch((error) => {
        throw new CLASSES.NodicsError(
          /^ERR_PROFILE_MEMBERSHIP_[A-Z_]+$/.test(error?.code || "")
            ? error.code
            : "ERR_PROFILE_MEMBERSHIP_STORAGE",
        );
      });
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Maps explicit current-employee customer consent to the existing Profile facade; returns no session or credential. */
  acceptParticipation: function (request, callback) {
    request.body = request.httpRequest?.body || request.body || {};
    request.query = request.httpRequest?.query || request.query || {};
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const promise = Promise.resolve()
      .then(() => FACADE.DefaultCustomerFacade.acceptParticipation(request))
      .then((data) => ({ code: "SUC_PRFL_00000", data }))
      .catch((error) => {
        throw new CLASSES.NodicsError(
          /^ERR_PROFILE_MEMBERSHIP_[A-Z_]+$/.test(error?.code || "")
            ? error.code
            : "ERR_PROFILE_MEMBERSHIP_STORAGE",
        );
      });
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Registers an allowlisted account form through Profile normalization and its existing governed signup facade; returns no credential or recursive customer data. */
  registerForm: function (request, callback) {
    const promise = Promise.resolve()
      .then(() => {
        request.model = SERVICE.DefaultCustomerRegistrationService.formModel(
          request.httpRequest.body || {},
        );
        return FACADE.DefaultCustomerFacade.signUp(request);
      })
      .then(() => ({ code: "SUC_PRFL_00000", result: { registered: true } }));
    if (!callback) return promise;
    promise.then((result) => callback(null, result)).catch(callback);
  },

  /**
   * Initializes  behavior for the module runtime.
   *
   * @param {*} options Method input.
   * @returns {*} Method result.
   */
  init: function (options) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  },
  /**
   * Runs post-initialization behavior after the module runtime is available.
   *
   * @param {*} options Method input.
   * @returns {*} Method result.
   */
  postInit: function (options) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  },

  /**

     * Validates customer exist rules.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

  isCustomerExist: function (request, callback) {
    request = _.merge(request, request.httpRequest.body || {});
    if (callback) {
      FACADE.DefaultCustomerFacade.isCustomerExist(request)
        .then((success) => {
          callback(null, success);
        })
        .catch((error) => {
          callback(error);
        });
    } else {
      return FACADE.DefaultCustomerFacade.isCustomerExist(request);
    }
  },

  /**

     * Executes sign up behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

  signUp: function (request, callback) {
    request.model = request.httpRequest.body;
    if (callback) {
      FACADE.DefaultCustomerFacade.signUp(request)
        .then((success) => {
          callback(null, success);
        })
        .catch((error) => {
          callback(error);
        });
    } else {
      return FACADE.DefaultCustomerFacade.signUp(request);
    }
  },
};
