/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/facade/DefaultBackofficeRegistryFacade
 * @description Delegates BackOffice registry API operations to the owning registry service.
 * @layer facade
 * @owner backoffice
 * @override Later modules may replace orchestration while preserving registry route contracts.
 */
module.exports = {
    /** Initializes the registry facade. */
    init: function () { return Promise.resolve(true); },
    /** Finalizes registry facade initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Delegates module registration. */
    register: function (request) { return SERVICE.DefaultBackofficeRegistryService.register(request); },
    /** Delegates module deregistration. */
    deregister: function (request) { return SERVICE.DefaultBackofficeRegistryService.deregister(request); },
    /** Delegates client-safe discovery. */
    list: function (request) { return SERVICE.DefaultBackofficeRegistryService.list(request); },
    /** Delegates secured Runtime Registry owner snapshot projection. */
    getRuntimeRegistrySnapshot: function (request) { return SERVICE.DefaultBackofficeRegistryService.runtimeRegistrySnapshot(request); },
    /** Delegates durable functional-module catalogue discovery. */
    availableFunctionalModules: function (request) { return SERVICE.DefaultFunctionalModuleCatalogueService.listAvailable(request); },
    /** Delegates durable registered functional-module catalogue discovery. */
    functionalModuleRegistrations: function (request) { return SERVICE.DefaultFunctionalModuleCatalogueService.listRegistrations(request); },
    /** Delegates durable functional-module registration detail discovery. */
    functionalModuleDetail: function (request) { return SERVICE.DefaultFunctionalModuleCatalogueService.detail(request); },
    /** Delegates optional functional-module project registration. */
    registerFunctionalModule: function (request) { return SERVICE.DefaultFunctionalModuleCatalogueService.register(request); },
    /** Delegates registered functional-module Axis activation. */
    activateFunctionalModule: function (request) { return SERVICE.DefaultFunctionalModuleCatalogueService.activate(request); },
    /** Delegates optional functional-module Axis deactivation. */
    deactivateFunctionalModule: function (request) { return SERVICE.DefaultFunctionalModuleCatalogueService.deactivate(request); },
    /** Delegates optional functional-module activation rollback. */
    rollbackFunctionalModule: function (request) { return SERVICE.DefaultFunctionalModuleCatalogueService.rollback(request); },
    /** Delegates optional functional-module project deregistration. */
    deregisterFunctionalModule: function (request) { return SERVICE.DefaultFunctionalModuleCatalogueService.deregister(request); },
    /** Delegates low-disclosure pre-authentication Axis discovery. */
    publicBootstrap: function (request) { return SERVICE.DefaultBackofficeRegistryService.publicBootstrap(request); },
    /** Delegates authorized BackOffice client bootstrap. */
    bootstrap: function (request) { return SERVICE.DefaultBackofficeRegistryService.bootstrap(request); },
    /** Delegates authorized effective Axis navigation composition. */
    effectiveNavigationComposition: function (request) { return SERVICE.DefaultBackofficeRegistryService.effectiveNavigationComposition(request); },
    /** Delegates navigation composition authoring status. */
    navigationCompositionAuthoringStatus: function (request) { return SERVICE.DefaultBackofficeRegistryService.navigationCompositionAuthoringStatus(request); },
    /** Delegates safe navigation composition preview validation. */
    previewNavigationComposition: function (request) { return SERVICE.DefaultBackofficeRegistryService.previewNavigationComposition(request); },
    /** Delegates effective navigation composition export. */
    exportNavigationComposition: function (request) { return SERVICE.DefaultBackofficeRegistryService.exportNavigationComposition(request); },
    /** Delegates effective navigation composition snapshot. */
    getNavigationCompositionSnapshot: function (request) { return SERVICE.DefaultBackofficeRegistryService.getNavigationCompositionSnapshot(request); },
    /** Delegates import payload validation without persistence. */
    validateNavigationCompositionImport: function (request) { return SERVICE.DefaultBackofficeRegistryService.validateNavigationCompositionImport(request); },
    /** Delegates governed navigation composition draft creation. */
    createNavigationCompositionDraft: function (request) { return SERVICE.DefaultBackofficeRegistryService.createNavigationCompositionDraft(request); },
    /** Delegates governed navigation composition draft submission. */
    submitNavigationCompositionDraft: function (request) { return SERVICE.DefaultBackofficeRegistryService.submitNavigationCompositionDraft(request); },
    /** Delegates governed navigation composition draft approval. */
    approveNavigationCompositionDraft: function (request) { return SERVICE.DefaultBackofficeRegistryService.approveNavigationCompositionDraft(request); },
    /** Delegates governed navigation composition draft publication. */
    publishNavigationCompositionDraft: function (request) { return SERVICE.DefaultBackofficeRegistryService.publishNavigationCompositionDraft(request); },
    /** Delegates governed navigation composition rollback. */
    rollbackNavigationComposition: function (request) { return SERVICE.DefaultBackofficeRegistryService.rollbackNavigationComposition(request); },
    /** Delegates secured registry diagnostics. */
    diagnostics: function (request) { return SERVICE.DefaultBackofficeRegistryService.diagnostics(request); },
    /** Delegates bounded administrative registry search. */
    adminList: function (request) { return SERVICE.DefaultBackofficeRegistryService.adminList(request); },
    /** Delegates sanitized administrative module detail. */
    adminDetail: function (request) { return SERVICE.DefaultBackofficeRegistryService.adminDetail(request); },
    /** Delegates an authorized observation refresh. */
    refresh: function (request) { return SERVICE.DefaultBackofficeRegistryService.refresh(request); }
};
