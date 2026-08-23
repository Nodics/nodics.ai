/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/controller/DefaultBackofficeRegistryController
 * @description Maps BackOffice registry HTTP operations to the registry facade with promise and callback support.
 * @layer controller
 * @owner backoffice
 * @override Later modules may replace request mapping while preserving access and response contracts.
 */
module.exports = {
    /** Initializes the registry controller. */
    init: function () { return Promise.resolve(true); },
    /** Finalizes registry controller initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes one facade operation using the standard optional callback contract. */
    execute: function (operation, request, callback) {
        let promise = FACADE.DefaultBackofficeRegistryFacade[operation](request);
        if (callback) return promise.then(result => callback(null, result)).catch(callback);
        return promise;
    },
    /** Handles module registration requests. */
    register: function (request, callback) { return this.execute('register', request, callback); },
    /** Handles module deregistration requests. */
    deregister: function (request, callback) { return this.execute('deregister', request, callback); },
    /** Handles client-safe registry discovery requests. */
    list: function (request, callback) { return this.execute('list', request, callback); },
    /** Handles project-scoped functional-module catalogue requests. */
    availableFunctionalModules: function (request, callback) { return this.execute('availableFunctionalModules', request, callback); },
    /** Handles project-scoped registered functional-module catalogue requests. */
    functionalModuleRegistrations: function (request, callback) { return this.execute('functionalModuleRegistrations', request, callback); },
    /** Handles one project-scoped functional-module detail request. */
    functionalModuleDetail: function (request, callback) { return this.execute('functionalModuleDetail', request, callback); },
    /** Handles optional functional-module project registration. */
    registerFunctionalModule: function (request, callback) { return this.execute('registerFunctionalModule', request, callback); },
    /** Handles registered functional-module Axis activation. */
    activateFunctionalModule: function (request, callback) { return this.execute('activateFunctionalModule', request, callback); },
    /** Handles optional functional-module Axis deactivation. */
    deactivateFunctionalModule: function (request, callback) { return this.execute('deactivateFunctionalModule', request, callback); },
    /** Handles optional functional-module project deregistration. */
    deregisterFunctionalModule: function (request, callback) { return this.execute('deregisterFunctionalModule', request, callback); },
    /** Handles low-disclosure pre-authentication Axis discovery requests. */
    publicBootstrap: function (request, callback) { return this.execute('publicBootstrap', request, callback); },
    /** Handles authorized BackOffice client bootstrap requests. */
    bootstrap: function (request, callback) { return this.execute('bootstrap', request, callback); },
    /** Handles authorized effective Axis navigation composition requests. */
    effectiveNavigationComposition: function (request, callback) { return this.execute('effectiveNavigationComposition', request, callback); },
    /** Handles navigation composition authoring status requests. */
    navigationCompositionAuthoringStatus: function (request, callback) { return this.execute('navigationCompositionAuthoringStatus', request, callback); },
    /** Handles safe navigation composition preview validation requests. */
    previewNavigationComposition: function (request, callback) { return this.execute('previewNavigationComposition', request, callback); },
    /** Handles effective navigation composition export requests. */
    exportNavigationComposition: function (request, callback) { return this.execute('exportNavigationComposition', request, callback); },
    /** Handles import payload validation without persistence. */
    validateNavigationCompositionImport: function (request, callback) { return this.execute('validateNavigationCompositionImport', request, callback); },
    /** Handles governed navigation composition draft creation. */
    createNavigationCompositionDraft: function (request, callback) { return this.execute('createNavigationCompositionDraft', request, callback); },
    /** Handles governed navigation composition draft submission. */
    submitNavigationCompositionDraft: function (request, callback) { return this.execute('submitNavigationCompositionDraft', request, callback); },
    /** Handles governed navigation composition draft approval. */
    approveNavigationCompositionDraft: function (request, callback) { return this.execute('approveNavigationCompositionDraft', request, callback); },
    /** Handles governed navigation composition draft publication. */
    publishNavigationCompositionDraft: function (request, callback) { return this.execute('publishNavigationCompositionDraft', request, callback); },
    /** Handles governed navigation composition rollback. */
    rollbackNavigationComposition: function (request, callback) { return this.execute('rollbackNavigationComposition', request, callback); },
    /** Handles secured registry diagnostic requests. */
    diagnostics: function (request, callback) { return this.execute('diagnostics', request, callback); },
    /** Handles bounded administrative registry search. */
    adminList: function (request, callback) { return this.execute('adminList', request, callback); },
    /** Handles sanitized administrative module detail. */
    adminDetail: function (request, callback) { return this.execute('adminDetail', request, callback); },
    /** Handles an authorized module observation refresh. */
    refresh: function (request, callback) { return this.execute('refresh', request, callback); }
};
