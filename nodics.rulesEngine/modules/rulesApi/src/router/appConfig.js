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
        /**
         * Leaves session middleware under the shared router/security contract.
         * @param {Object} app Express application instance.
         * @returns {void}
         */
        initSession: function (app) {},
        /**
         * Leaves request logging under the shared router contract.
         * @param {Object} app Express application instance.
         * @returns {void}
         */
        initLogger: function (app) {},
        /**
         * Leaves application cache middleware under the shared router contract.
         * @param {Object} app Express application instance.
         * @returns {void}
         */
        initCache: function (app) {},
        /**
         * Leaves body-parser policy under the shared hardened router defaults.
         * @param {Object} app Express application instance.
         * @returns {void}
         */
        initBodyParser: function (app) {},
        /**
         * Leaves HTTP header policy under the shared hardened router defaults.
         * @param {Object} app Express application instance.
         * @returns {void}
         */
        initHeaders: function (app) {},
        /**
         * Leaves application error routing under the shared router contract.
         * @param {Object} app Express application instance.
         * @returns {void}
         */
        initErrorRoutes: function (app) {},
        /**
         * Declares no Rules-specific application extras.
         * @param {Object} app Express application instance.
         * @returns {void}
         */
        initExtras: function (app) {}
    }
};
