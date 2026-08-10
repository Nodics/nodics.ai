/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module checkoutCore/nodics @description Declares the Checkout Core capability lifecycle. @layer module @owner checkoutCore */
module.exports = { init: () => Promise.resolve(true), postInit: () => Promise.resolve(true) };
