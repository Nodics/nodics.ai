/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/facade/customer/DefaultCustomerFacade
 * @description Coordinates facade-level delegation for profile default customer facade operations.
 * @layer facade
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  /** Delegates exact own consent renewal to Profile. */
  renewParticipation: function (request) {
    return SERVICE.DefaultCustomerRegistrationService.changeParticipation(
      request,
      "RENEW",
    );
  },
  /** Delegates exact own consent withdrawal without deleting customer history. */
  withdrawParticipation: function (request) {
    return SERVICE.DefaultCustomerRegistrationService.changeParticipation(
      request,
      "WITHDRAW",
    );
  },
  /** Delegates terms disclosure to the existing registration owner. @param {Object} request Current signed actor. @returns {Promise<Object>} Safe terms. */
  participationWorkspace: function (request) {
    return SERVICE.DefaultCustomerRegistrationService.participationWorkspace(
      request,
    );
  },
  /** Delegates explicit customer participation to its existing Profile registration owner. */
  acceptParticipation: function (request) {
    return SERVICE.DefaultCustomerRegistrationService.acceptParticipation(
      request,
    );
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
   * @returns {*} Method result.
   */
  isCustomerExist: function (request) {
    return SERVICE.DefaultCustomerService.isCustomerExist(request);
  },
  /**
   * Executes sign up behavior.
   *
   * @param {*} request Method input.
   * @returns {*} Method result.
   */
  signUp: function (request) {
    return SERVICE.DefaultCustomerService.signUp(request);
  },
};
