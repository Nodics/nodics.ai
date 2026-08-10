/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module commsApi/src/router/appConfig @description Reserves Communication API application hooks. @layer router @owner commsApi */
module.exports = { communication: {
    /** Initializes session hooks. @param {Object} app Application. @returns {void} */
    initSession: function (app) {},
    /** Initializes logger hooks. @param {Object} app Application. @returns {void} */
    initLogger: function (app) {},
    /** Initializes cache hooks. @param {Object} app Application. @returns {void} */
    initCache: function (app) {},
    /** Initializes request body parsing hooks. @param {Object} app Application. @returns {void} */
    initBodyParser: function (app) {},
    /** Initializes response header hooks. @param {Object} app Application. @returns {void} */
    initHeaders: function (app) {},
    /** Initializes error route hooks. @param {Object} app Application. @returns {void} */
    initErrorRoutes: function (app) {},
    /** Initializes optional application hooks. @param {Object} app Application. @returns {void} */
    initExtras: function (app) {}
} };
