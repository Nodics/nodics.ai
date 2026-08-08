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
    register: request => SERVICE.DefaultBackofficeRegistryService.register(request),
    /** Delegates module deregistration. */
    deregister: request => SERVICE.DefaultBackofficeRegistryService.deregister(request),
    /** Delegates client-safe discovery. */
    list: request => SERVICE.DefaultBackofficeRegistryService.list(request),
    /** Delegates durable functional-module catalogue discovery. */
    availableFunctionalModules: request => SERVICE.DefaultFunctionalModuleCatalogueService.listAvailable(request),
    /** Delegates durable registered functional-module catalogue discovery. */
    functionalModuleRegistrations: request => SERVICE.DefaultFunctionalModuleCatalogueService.listRegistrations(request),
    /** Delegates durable functional-module registration detail discovery. */
    functionalModuleDetail: request => SERVICE.DefaultFunctionalModuleCatalogueService.detail(request),
    /** Delegates optional functional-module project registration. */
    registerFunctionalModule: request => SERVICE.DefaultFunctionalModuleCatalogueService.register(request),
    /** Delegates registered functional-module Axis activation. */
    activateFunctionalModule: request => SERVICE.DefaultFunctionalModuleCatalogueService.activate(request),
    /** Delegates optional functional-module Axis deactivation. */
    deactivateFunctionalModule: request => SERVICE.DefaultFunctionalModuleCatalogueService.deactivate(request),
    /** Delegates optional functional-module project deregistration. */
    deregisterFunctionalModule: request => SERVICE.DefaultFunctionalModuleCatalogueService.deregister(request),
    /** Delegates low-disclosure pre-authentication Axis discovery. */
    publicBootstrap: request => SERVICE.DefaultBackofficeRegistryService.publicBootstrap(request),
    /** Delegates authorized BackOffice client bootstrap. */
    bootstrap: request => SERVICE.DefaultBackofficeRegistryService.bootstrap(request),
    /** Delegates secured registry diagnostics. */
    diagnostics: request => SERVICE.DefaultBackofficeRegistryService.diagnostics(request),
    /** Delegates bounded administrative registry search. */
    adminList: request => SERVICE.DefaultBackofficeRegistryService.adminList(request),
    /** Delegates sanitized administrative module detail. */
    adminDetail: request => SERVICE.DefaultBackofficeRegistryService.adminDetail(request),
    /** Delegates an authorized observation refresh. */
    refresh: request => SERVICE.DefaultBackofficeRegistryService.refresh(request)
};
