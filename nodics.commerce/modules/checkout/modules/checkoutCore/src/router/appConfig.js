/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module checkoutCore/src/router/appConfig
 * @description Reserves Checkout API application hooks.
 * @layer router
 * @owner checkoutCore
 * @override Later modules may extend application bootstrap hooks through the
 * router application configuration contract.
 */
module.exports = {
    checkoutApi: {
        /**
         * Initializes request session handling for the Checkout API application.
         *
         * @param {Object} app Express-compatible application instance.
         * @returns {Object} The supplied application instance.
         */
        initSession: function (app) {
            return app;
        },

        /**
         * Initializes request logging for the Checkout API application.
         *
         * @param {Object} app Express-compatible application instance.
         * @returns {Object} The supplied application instance.
         */
        initLogger: function (app) {
            return app;
        },

        /**
         * Initializes cache middleware for the Checkout API application.
         *
         * @param {Object} app Express-compatible application instance.
         * @returns {Object} The supplied application instance.
         */
        initCache: function (app) {
            return app;
        },

        /**
         * Initializes body parsing for the Checkout API application.
         *
         * @param {Object} app Express-compatible application instance.
         * @returns {Object} The supplied application instance.
         */
        initBodyParser: function (app) {
            return app;
        },

        /**
         * Initializes response headers for the Checkout API application.
         *
         * @param {Object} app Express-compatible application instance.
         * @returns {Object} The supplied application instance.
         */
        initHeaders: function (app) {
            return app;
        },

        /**
         * Initializes error routes for the Checkout API application.
         *
         * @param {Object} app Express-compatible application instance.
         * @returns {Object} The supplied application instance.
         */
        initErrorRoutes: function (app) {
            return app;
        },

        /**
         * Initializes additional extension hooks for the Checkout API application.
         *
         * @param {Object} app Express-compatible application instance.
         * @returns {Object} The supplied application instance.
         */
        initExtras: function (app) {
            return app;
        }
    }
};
