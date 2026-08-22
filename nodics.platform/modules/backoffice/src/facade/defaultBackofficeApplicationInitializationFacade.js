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
    profiles: request => SERVICE.DefaultBackofficeApplicationInitializationService.profiles(request),
    status: (profileCode, request) => SERVICE.DefaultBackofficeApplicationInitializationService.status(profileCode, request),
    contentPackStatus: (profileCode, request) => SERVICE.DefaultBackofficeApplicationInitializationService.contentPackStatus(profileCode, request),
    installContentPack: (profileCode, request) => SERVICE.DefaultBackofficeApplicationInitializationService.installContentPack(profileCode, request),
    initiate: (profileCode, request) => SERVICE.DefaultBackofficeApplicationInitializationService.initiate(profileCode, request),
    rollback: (profileCode, request) => SERVICE.DefaultBackofficeApplicationInitializationService.rollback(profileCode, request),
    retire: (profileCode, request) => SERVICE.DefaultBackofficeApplicationInitializationService.retire(profileCode, request)
};
