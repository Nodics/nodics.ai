/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module smtpCommsProvider/nodics @description Declares the optional email provider lifecycle. @layer module @owner smtpCommsProvider */
module.exports = { init: () => Promise.resolve(true), postInit: () => Promise.resolve(true) };
