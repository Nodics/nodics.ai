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
    status: request => SERVICE.DefaultBackofficeLocalResetCoordinatorService.status(request),
    execute: request => SERVICE.DefaultBackofficeLocalResetCoordinatorService.execute(request)
};
