/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module import/facade/release/DefaultDataReleaseFacade @description Delegates data-release control-plane operations to the active owning service. */
module.exports = {
  /** Initializes the facade. */
  init: function () {
    return Promise.resolve(true);
  },
  /** Completes facade initialization. */
  postInit: function () {
    return Promise.resolve(true);
  },
  /** Delegates catalogue retrieval. */
  getCatalogue: function (request) {
    return SERVICE.DefaultDataReleaseService.getCatalogue(request);
  },
  /** Delegates authorized initialization-profile discovery. */
  getInitializationProfiles: function (request) {
    return SERVICE.DefaultDataReleaseService.getInitializationProfiles(request);
  },
  /** Delegates retrieval of one initialization profile and its readiness. */
  getInitializationProfile: function (request) {
    return SERVICE.DefaultDataReleaseService.getInitializationProfile(request);
  },
  /** Delegates side-effect-free initialization-profile validation. */
  validateInitializationProfile: function (request) {
    return SERVICE.DefaultDataReleaseService.runInitializationProfile(
      request,
      false,
    );
  },
  /** Delegates governed initialization-profile installation. */
  installInitializationProfile: function (request) {
    return SERVICE.DefaultDataReleaseService.runInitializationProfile(
      request,
      true,
    );
  },
  /** Delegates the fixed, Profile-authorized tenant access setup to the release owner. */
  setupSampleOperator: function (request, install) {
    return SERVICE.DefaultDataReleaseService.setupSampleOperator(
      request,
      install,
    );
  },
  /** Delegates governed group-only release setup in one admitted tenant. */
  setupTenantGroups: function (request, install) {
    return SERVICE.DefaultDataReleaseService.setupTenantGroups(
      request,
      install,
    );
  },
  /** Delegates release preflight validation. */
  preflight: function (request) {
    return SERVICE.DefaultDataReleaseService.preflight(request);
  },
  /** Lists original-actor durable release plans. */
  listExecutions: function (request) {
    return SERVICE.DefaultDataReleaseExecutionService.list(request);
  },
  /** Reads a durable release execution without dispatching work. */
  inspectExecution: function (request) {
    return SERVICE.DefaultDataReleaseExecutionService.inspect(request);
  },
  /** Delegates governed release execution. */
  execute: function (request) {
    return SERVICE.DefaultDataReleaseService.execute(request);
  },
};
