/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/modules/flowApi/src/router/appConfig
 * @description Reserves workflow API route registration hooks for process HTTP exposure.
 * @layer router
 * @owner flowApi
 * @override Customer process overlays may extend route bootstrap behavior through later active modules.
 */
module.exports = {
    process: {
        /** @param {*} app Express application. @returns {void} */
        initSession: function (app) {},
        /** @param {*} app Express application. @returns {void} */
        initLogger: function (app) {},
        /** @param {*} app Express application. @returns {void} */
        initCache: function (app) {},
        /** @param {*} app Express application. @returns {void} */
        initBodyParser: function (app) {},
        /** @param {*} app Express application. @returns {void} */
        initHeaders: function (app) {},
        /** @param {*} app Express application. @returns {void} */
        initErrorRoutes: function (app) {},
        /** @param {*} app Express application. @returns {void} */
        initExtras: function (app) {}
    }
};
