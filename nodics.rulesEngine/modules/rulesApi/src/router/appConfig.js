/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.rulesEngine/modules/rulesApi/src/router/appConfig
 * @description Declares the standard Rules API application-configuration contribution without adding module-specific HTTP middleware.
 * @layer router
 * @owner rulesApi
 * @override Later project layers may extend standard router hooks while preserving Rules API authorization and backend-owned policy evaluation.
 */
module.exports = {
    rulesApi: {
        initSession: function (app) {},
        initLogger: function (app) {},
        initCache: function (app) {},
        initBodyParser: function (app) {},
        initHeaders: function (app) {},
        initErrorRoutes: function (app) {},
        initExtras: function (app) {}
    }
};
