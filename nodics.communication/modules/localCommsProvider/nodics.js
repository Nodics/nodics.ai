/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module localCommsProvider/nodics @description Declares local provider lifecycle. @layer module @owner localCommsProvider */
module.exports = { /** Initializes this module. */ init: () => Promise.resolve(true), /** Finalizes this module. */ postInit: () => Promise.resolve(true) };
