/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/facade/DefaultBackofficeApplicationInitializationFacade @description Delegates reusable application initialization to the Platform service. */
module.exports = {
    /** Executes the documented bounded module operation. */
    init: function () { return Promise.resolve(true); },
    /** Executes the documented bounded module operation. */
    postInit: function () { return Promise.resolve(true); },
    /** Delegates read-only status discovery to the existing initialization or reset service. */
    status: function (profileCode, request) { return SERVICE.DefaultBackofficeApplicationInitializationService.status(profileCode, request); },
    /** Delegates content-pack status discovery to the owning application initialization service. */
    contentPackStatus: function (profileCode, request) { return SERVICE.DefaultBackofficeApplicationInitializationService.contentPackStatus(profileCode, request); },
    /** Delegates the governed content-pack installation request without changing its scope or authorization. */
    installContentPack: function (profileCode, request) { return SERVICE.DefaultBackofficeApplicationInitializationService.installContentPack(profileCode, request); },
    /** Delegates the requested initialization to the existing owner and returns its asynchronous result. */
    initiate: function (profileCode, request) { return SERVICE.DefaultBackofficeApplicationInitializationService.initiate(profileCode, request); },
    /** Delegates governed application rollback to the owning initialization service. */
    rollback: function (profileCode, request) { return SERVICE.DefaultBackofficeApplicationInitializationService.rollback(profileCode, request); },
    /** Delegates governed application retirement to the owning initialization service. */
    retire: function (profileCode, request) { return SERVICE.DefaultBackofficeApplicationInitializationService.retire(profileCode, request); }
};
