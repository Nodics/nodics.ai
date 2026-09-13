/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/facade/DefaultBackofficeLocalResetFacade @description Delegates Local reset control to the Platform coordinator. */
module.exports = {
    /** Executes the documented bounded module operation. */
    init: function () { return Promise.resolve(true); },
    /** Executes the documented bounded module operation. */
    postInit: function () { return Promise.resolve(true); },
    /** Delegates read-only status discovery to the existing initialization or reset service. */
    status: function (request) { return SERVICE.DefaultBackofficeLocalResetCoordinatorService.status(request); },
    /** Delegates the requested local reset to the existing owner, retaining confirmation and scope validation. */
    execute: function (request) { return SERVICE.DefaultBackofficeLocalResetCoordinatorService.execute(request); }
};
