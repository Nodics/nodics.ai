/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module import/controller/release/DefaultDataReleaseController @description Maps secured HTTP requests into bounded data-release catalogue, preflight, and execution operations. */
module.exports = {
  /** Initializes the controller. */
  init: function () {
    return Promise.resolve(true);
  },
  /** Completes controller initialization. */
  postInit: function () {
    return Promise.resolve(true);
  },
  /** Returns the authorized data-release catalogue for a query-selected type. */
  getCatalogue: function (request, callback) {
    request.dataType =
      request.httpRequest &&
      request.httpRequest.query &&
      request.httpRequest.query.dataType;
    return this.respond(
      FACADE.DefaultDataReleaseFacade.getCatalogue(request),
      callback,
    );
  },
  /** Returns the authorized Init data-release catalogue. */
  getInitCatalogue: function (request, callback) {
    return this.getTypedCatalogue(request, callback, "init");
  },
  /** Returns the authorized Core data-release catalogue. */
  getCoreCatalogue: function (request, callback) {
    return this.getTypedCatalogue(request, callback, "core");
  },
  /** Returns the authorized Sample data-release catalogue. */
  getSampleCatalogue: function (request, callback) {
    return this.getTypedCatalogue(request, callback, "sample");
  },
  /** Returns the initialization profiles visible to the authenticated administrator. */
  getInitializationProfiles: function (request, callback) {
    return this.respond(
      FACADE.DefaultDataReleaseFacade.getInitializationProfiles(request),
      callback,
    );
  },
  /** Returns one authorized initialization profile and its current release readiness. */
  getInitializationProfile: function (request, callback) {
    return this.respond(
      FACADE.DefaultDataReleaseFacade.getInitializationProfile(request),
      callback,
    );
  },
  /** Validates an initialization profile without installing any release. */
  validateInitializationProfile: function (request, callback) {
    return this.respond(
      FACADE.DefaultDataReleaseFacade.validateInitializationProfile(request),
      callback,
    );
  },
  /** Installs an authorized initialization profile through the governed release service. */
  installInitializationProfile: function (request, callback) {
    return this.respond(
      FACADE.DefaultDataReleaseFacade.installInitializationProfile(request),
      callback,
    );
  },
  /** Validates the owner-defined Sample Import Operator group for an exact business enterprise. */
  validateSampleOperatorSetup: function (request, callback) {
    return this.respond(
      FACADE.DefaultDataReleaseFacade.setupSampleOperator(request, false),
      callback,
    );
  },
  /** Installs the validated tenant-local group without assigning a user or changing the actor. */
  installSampleOperatorSetup: function (request, callback) {
    return this.respond(
      FACADE.DefaultDataReleaseFacade.setupSampleOperator(request, true),
      callback,
    );
  },
  /** Validates the exact owner-defined tenant group release without importing it. */
  validateTenantGroupSetup: function (request, callback) {
    return this.respond(
      FACADE.DefaultDataReleaseFacade.setupTenantGroups(request, false),
      callback,
    );
  },
  /** Installs the exact tenant group release without granting access to employees. */
  installTenantGroupSetup: function (request, callback) {
    return this.respond(
      FACADE.DefaultDataReleaseFacade.setupTenantGroups(request, true),
      callback,
    );
  },
  /** Normalizes a fixed route-owned catalogue type and delegates discovery. */
  getTypedCatalogue: function (request, callback, dataType) {
    request.dataType = dataType;
    return this.respond(
      FACADE.DefaultDataReleaseFacade.getCatalogue(request),
      callback,
    );
  },
  /** Validates a requested immutable release plan without persistence. */
  preflight: function (request, callback) {
    request.releaseRequest =
      (request.httpRequest && request.httpRequest.body) || {};
    return this.respond(
      FACADE.DefaultDataReleaseFacade.preflight(request),
      callback,
    );
  },
  /** Validates a route-owned Init release plan without persistence. */
  preflightInit: function (request, callback) {
    return this.preflightType(request, callback, "init");
  },
  /** Validates a route-owned Core release plan without persistence. */
  preflightCore: function (request, callback) {
    return this.preflightType(request, callback, "core");
  },
  /** Validates a route-owned Sample release plan without persistence. */
  preflightSample: function (request, callback) {
    return this.preflightType(request, callback, "sample");
  },
  /** Normalizes a fixed route-owned data type and delegates preflight. */
  preflightType: function (request, callback, dataType) {
    request.releaseRequest = Object.assign(
      {},
      request.httpRequest && request.httpRequest.body,
      { dataType: dataType },
    );
    return this.respond(
      FACADE.DefaultDataReleaseFacade.preflight(request),
      callback,
    );
  },
  /** Executes a governed Init release plan. */
  executeInit: function (request, callback) {
    return this.executeType(request, callback, "init");
  },
  /** Executes a governed Core release plan. */
  executeCore: function (request, callback) {
    return this.executeType(request, callback, "core");
  },
  /** Executes a governed Sample release plan. */
  executeSample: function (request, callback) {
    return this.executeType(request, callback, "sample");
  },
  /** Normalizes a fixed route-owned data type and delegates execution. */
  executeType: function (request, callback, dataType) {
    request.releaseRequest = Object.assign(
      {},
      request.httpRequest && request.httpRequest.body,
      { dataType: dataType },
    );
    return this.respond(
      FACADE.DefaultDataReleaseFacade.execute(request),
      callback,
    );
  },
  /** Lists recorded plans through the import owner in the native actor scope. */
  listExecutions: function (request, callback, dataType) {
    request.dataType = dataType;
    return this.respond(
      FACADE.DefaultDataReleaseFacade.listExecutions(request),
      callback,
    );
  },
  /** Lists actor-scoped Init executions through the import facade. */
  listInitExecutions: function (request, callback) {
    return this.listExecutions(request, callback, "init");
  },
  /** Lists actor-scoped Core executions through the import facade. */
  listCoreExecutions: function (request, callback) {
    return this.listExecutions(request, callback, "core");
  },
  /** Lists actor-scoped Sample executions through the import facade. */
  listSampleExecutions: function (request, callback) {
    return this.listExecutions(request, callback, "sample");
  },
  /** Reads the durable receipt in the original native operator scope. */
  inspectExecution: function (request, callback, dataType) {
    request.dataType = dataType;
    request.executionCode =
      request.httpRequest?.params?.executionCode || request.executionCode;
    return this.respond(
      FACADE.DefaultDataReleaseFacade.inspectExecution(request),
      callback,
    );
  },
  /** Inspects one Init execution without replaying its effects. */
  inspectInitExecution: function (request, callback) {
    return this.inspectExecution(request, callback, "init");
  },
  /** Inspects one Core execution without replaying its effects. */
  inspectCoreExecution: function (request, callback) {
    return this.inspectExecution(request, callback, "core");
  },
  /** Inspects one Sample execution without replaying its effects. */
  inspectSampleExecution: function (request, callback) {
    return this.inspectExecution(request, callback, "sample");
  },
  /** Bridges a promise to the optional Nodics callback contract. */
  respond: function (promise, callback) {
    if (!callback) return promise;
    promise
      .then((success) => callback(null, success))
      .catch((error) => callback(error));
  },
};
