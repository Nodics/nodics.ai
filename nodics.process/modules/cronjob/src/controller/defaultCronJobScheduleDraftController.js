/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/**
 * @module cronjob/controller/DefaultCronJobScheduleDraftController
 * @description Maps inactive schedule draft requests without merging untrusted identity or persistence options.
 * @layer controller
 * @owner cronjob
 * @override Preserve authenticated request provenance and no-store responses.
 */
module.exports = {
  /** Adapts one fixed operation with promise/callback parity. @param {Object} request Trusted context. @param {string} operation Fixed facade method. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Owner result. */
  dispatch: function (request, operation, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const promise = Promise.resolve().then(() =>
      FACADE.DefaultCronJobFacade[operation]({
        tenant: request.tenant,
        authData: request.authData,
        body: request.httpRequest?.body,
      }),
    );
    if (callback) {
      promise.then((result) => callback(null, result), callback);
      return;
    }
    return promise;
  },
  /** Lists approved draft choices. @param {Object} request Trusted context. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Capability. */
  capabilities: function (request, callback) {
    return this.dispatch(request, "scheduleDraftCapabilities", callback);
  },
  /** Reviews without persistence. @param {Object} request Trusted context. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Review. */
  preview: function (request, callback) {
    return this.dispatch(request, "previewScheduleDraft", callback);
  },
  /** Creates one inactive definition. @param {Object} request Trusted context. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Receipt. */
  create: function (request, callback) {
    return this.dispatch(request, "createScheduleDraft", callback);
  },
  /** Inspects without replay. @param {Object} request Trusted context. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Inspection. */
  inspect: function (request, callback) {
    return this.dispatch(request, "inspectScheduleDraft", callback);
  },
  /** Reviews a governed lifecycle command. @param {Object} request Trusted request. @param {Function} callback Optional callback. @returns {*} Owner response. */
  lifecyclePreview: function (request, callback) { return this.dispatch(request, 'previewScheduleLifecycle', callback); },
  /** Executes one explicitly confirmed lifecycle command. @param {Object} request Trusted request. @param {Function} callback Optional callback. @returns {*} Owner response. */
  lifecycleExecute: function (request, callback) { return this.dispatch(request, 'executeScheduleLifecycle', callback); },
  /** Inspects original command evidence. @param {Object} request Trusted request. @param {Function} callback Optional callback. @returns {*} Owner response. */
  lifecycleInspect: function (request, callback) { return this.dispatch(request, 'inspectScheduleLifecycle', callback); },
  /** Reconciles proven runtime evidence without dispatch. @param {Object} request Trusted request. @param {Function} callback Optional callback. @returns {*} Owner response. */
  lifecycleReconcile: function (request, callback) { return this.dispatch(request, 'reconcileScheduleLifecycle', callback); },
};
