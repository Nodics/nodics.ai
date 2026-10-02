/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/facade/customer/DefaultProfileVerifiedContactFacade @description Fixed Customer contact transport dispatch to the canonical Profile owner. @layer facade @owner profile @override Later layers preserve the exact owner operations and private self admission. */
module.exports = {
  /** Dispatches one fixed route operation, never a submitted service or method name. @param {string} operation Route-owned operation. @param {Object} request Protected request. @returns {Promise<Object>} Safe owner result. */
  execute: function (operation, request) {
    const methods = {
      BEGIN: "beginAndDeliver",
      VERIFY: "verifyAndConfirm",
      INSPECT: "inspectVerification",
      CONSENT: "setNotificationConsent",
      SUPPRESSION: "setSuppression",
    };
    if (!Object.hasOwn(methods, operation))
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    if (operation === "CONSENT") {
      const fields = [
        "ownerId",
        "channel",
        "expectedRevision",
        "purpose",
        "purposeVersion",
        "granted",
        "operationReference",
      ];
      const body = request.body;
      if (
        !body ||
        Object.getPrototypeOf(body) !== Object.prototype ||
        Reflect.ownKeys(body).length !== fields.length ||
        Reflect.ownKeys(body).some((key) => !fields.includes(key)) ||
        fields.some((key) => {
          const descriptor = Object.getOwnPropertyDescriptor(body, key);
          return !descriptor?.enumerable || !Object.hasOwn(descriptor, "value");
        }) ||
        !Number.isSafeInteger(body.purposeVersion) ||
        body.purposeVersion < 1 ||
        body.purposeVersion > 2147483647
      )
        throw new CLASSES.NodicsError("ERR_AUTH_00003");
    }
    return SERVICE.DefaultProfileVerifiedContactService[methods[operation]](
      request,
      request.body,
    );
  },
};
