/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module checkoutCore/src/router/appConfig @description Reserves Checkout API hooks. @layer router @owner checkoutCore */
module.exports = { checkoutApi: { initSession: app => app, initLogger: app => app, initCache: app => app, initBodyParser: app => app, initHeaders: app => app, initErrorRoutes: app => app, initExtras: app => app } };
