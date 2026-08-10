/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module engagementApi/src/router/appConfig @description Reserves Engagement API application registration hooks. @layer router @owner engagementApi @override Later modules may extend bootstrap hooks without weakening route security. */
module.exports = { engagement: {
    /** Handles init session within the module-owned contract. */
    initSession: function (app) {}, initLogger: function (app) {}, initCache: function (app) {},
    /** Handles init body parser within the module-owned contract. */
    initBodyParser: function (app) {}, initHeaders: function (app) {}, initErrorRoutes: function (app) {}, initExtras: function (app) {}
} };
