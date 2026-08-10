/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module smsCommsProvider/nodics @description Declares the optional SMS provider lifecycle. @layer module @owner smsCommsProvider */
module.exports = { init: () => Promise.resolve(true), postInit: () => Promise.resolve(true) };
