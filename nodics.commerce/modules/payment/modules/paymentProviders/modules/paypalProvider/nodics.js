/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module paypalProvider/nodics @description Declares the PayPal Provider capability lifecycle. @layer module @owner paypalProvider */
module.exports = { init: () => Promise.resolve(true), postInit: () => Promise.resolve(true) };
