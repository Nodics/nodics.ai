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
    init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the authorized data-release catalogue for a query-selected type. */
    getCatalogue: function (request, callback) {
        request.dataType = request.httpRequest && request.httpRequest.query && request.httpRequest.query.dataType;
        return this.respond(FACADE.DefaultDataReleaseFacade.getCatalogue(request), callback);
    },
    /** Returns the authorized Init data-release catalogue. */
    getInitCatalogue: function (request, callback) { return this.getTypedCatalogue(request, callback, 'init'); },
    /** Returns the authorized Core data-release catalogue. */
    getCoreCatalogue: function (request, callback) { return this.getTypedCatalogue(request, callback, 'core'); },
    /** Returns the authorized Sample data-release catalogue. */
    getSampleCatalogue: function (request, callback) { return this.getTypedCatalogue(request, callback, 'sample'); },
    /** Returns the initialization profiles visible to the authenticated administrator. */
    getInitializationProfiles: function (request, callback) { return this.respond(FACADE.DefaultDataReleaseFacade.getInitializationProfiles(request), callback); },
    /** Returns one authorized initialization profile and its current release readiness. */
    getInitializationProfile: function (request, callback) { return this.respond(FACADE.DefaultDataReleaseFacade.getInitializationProfile(request), callback); },
    /** Validates an initialization profile without installing any release. */
    validateInitializationProfile: function (request, callback) { return this.respond(FACADE.DefaultDataReleaseFacade.validateInitializationProfile(request), callback); },
    /** Installs an authorized initialization profile through the governed release service. */
    installInitializationProfile: function (request, callback) { return this.respond(FACADE.DefaultDataReleaseFacade.installInitializationProfile(request), callback); },
    /** Normalizes a fixed route-owned catalogue type and delegates discovery. */
    getTypedCatalogue: function (request, callback, dataType) {
        request.dataType = dataType;
        return this.respond(FACADE.DefaultDataReleaseFacade.getCatalogue(request), callback);
    },
    /** Validates a requested immutable release plan without persistence. */
    preflight: function (request, callback) {
        request.releaseRequest = request.httpRequest && request.httpRequest.body || {};
        return this.respond(FACADE.DefaultDataReleaseFacade.preflight(request), callback);
    },
    /** Executes a governed Init release plan. */
    executeInit: function (request, callback) { return this.executeType(request, callback, 'init'); },
    /** Executes a governed Core release plan. */
    executeCore: function (request, callback) { return this.executeType(request, callback, 'core'); },
    /** Executes a governed Sample release plan. */
    executeSample: function (request, callback) { return this.executeType(request, callback, 'sample'); },
    /** Normalizes a fixed route-owned data type and delegates execution. */
    executeType: function (request, callback, dataType) {
        request.releaseRequest = Object.assign({}, request.httpRequest && request.httpRequest.body, { dataType: dataType });
        return this.respond(FACADE.DefaultDataReleaseFacade.execute(request), callback);
    },
    /** Bridges a promise to the optional Nodics callback contract. */
    respond: function (promise, callback) {
        if (!callback) return promise;
        promise.then(success => callback(null, success)).catch(error => callback(error));
    }
};
