/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/facade/defaultDigitalCommerceNotificationFacade @description Provides the signed operator policy boundary for native notification workspace, inspection and original-intent retry. @layer facade @owner digitalCore @override Later layers may extend orchestration; preserve signed context, fixed operation selection and service-owned evidence. */
module.exports = {
  /** Maps fixed internal source proof without human-context substitution or caller ownership. @param {Object} input Signed runtime request. @returns {Promise<Object>} Private owner proof. */
  recipientSource: function (input) {
    return Promise.resolve().then(() =>
      SERVICE.DefaultDigitalCommerceNotificationService.recipientSource(input),
    );
  },
  /** Rejects ambiguous signed context rather than deriving authority from caller ownership fields. @param {Object} input Controller-mapped signed request. @returns {Object} Bound request. */
  context: function (input) {
    const auth = input.authData || {};
    if (
      auth.tokenType !== "access" ||
      auth.principalType !== "human" ||
      auth.tenant !== input.tenant ||
      !input.tenant ||
      !(auth.enterpriseCode || auth.entCode) ||
      (auth.enterpriseCode &&
        auth.entCode &&
        auth.enterpriseCode !== auth.entCode)
    )
      throw new CLASSES.NodicsError("ERR_DIGITAL_NOTIFICATION_UNCONFIRMED");
    return {
      tenant: input.tenant,
      authData: auth,
      authorization: input.authorization,
      code: input.code,
      payload: input.payload || {},
      query: input.query || {},
    };
  },
  /** Reads the versioned owner workspace without notification writes. @param {Object} input Signed input. @returns {Promise<Object>} Native DTO. */
  workspace: function (input) {
    return Promise.resolve().then(() =>
      SERVICE.DefaultDigitalCommerceNotificationService.workspace(
        this.context(input),
      ),
    );
  },
  /** Inspects only original source-bound Communication evidence. @param {Object} input Signed input. @returns {Promise<Object>} Observations. */
  inspect: function (input) {
    return Promise.resolve().then(() =>
      SERVICE.DefaultDigitalCommerceNotificationService.operate(
        this.context(input),
        false,
      ),
    );
  },
  /** Retries only the original event after fresh service authorization. @param {Object} input Signed confirmed input. @returns {Promise<Object>} Retry progress. */
  retry: function (input) {
    return Promise.resolve().then(() =>
      SERVICE.DefaultDigitalCommerceNotificationService.operate(
        this.context(input),
        true,
      ),
    );
  },
};
