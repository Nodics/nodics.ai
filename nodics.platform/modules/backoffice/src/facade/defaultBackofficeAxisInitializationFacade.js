/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/facade/DefaultBackofficeAxisInitializationFacade @description Delegates Axis initialization to the Platform Axis-owned service. */
module.exports = {
    /** Executes the documented bounded module operation. */
    init: function () { return Promise.resolve(true); },
    /** Executes the documented bounded module operation. */
    postInit: function () { return Promise.resolve(true); },
    /** Adds current actor eligibility from the canonical BackOffice route; Process retains approval authority. */
    project: function (status, request) {
        const route = require('../router/routers').backoffice.axisInitialization.initiateInitialization;
        const allowed = SERVICE.DefaultBackofficeAdministrativeSecurityService?.allowsRouteAction?.(request, route) === true;
        return { ...status, allowedActions: allowed ? ['INITIALIZE'] : [] };
    },
    /** Delegates read-only status discovery to the existing initialization or reset service. */
    status: function (request) { return Promise.resolve(SERVICE.DefaultAxisInitializationService.status(request)).then(status => this.project(status, request)); },
    /** Delegates the requested initialization to the existing owner and returns its asynchronous result. */
    initiate: function (request) { return Promise.resolve(SERVICE.DefaultAxisInitializationService.initiate(request)).then(status => this.project(status, request)); }
};
