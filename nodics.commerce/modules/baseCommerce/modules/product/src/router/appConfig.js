/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/src/router/appConfig @description Reserves Product API application hooks. @layer router @owner product */
module.exports = { productApi: { initSession: app => app, initLogger: app => app, initCache: app => app, initBodyParser: app => app, initHeaders: app => app, initErrorRoutes: app => app, initExtras: app => app } };
