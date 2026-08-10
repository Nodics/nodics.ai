/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/nodics @description Declares the Order capability lifecycle. @layer module @owner order */
module.exports = { init: () => Promise.resolve(true), postInit: () => Promise.resolve(true) };
