/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module nodics.communication/nodics @description Declares the Communication functional composition boundary without owning provider or domain behavior. @layer module @owner nodics.communication @override Later functional overlays may extend child capabilities without placing behavior in this group. */
module.exports = { /** Initializes the group boundary. */ init: function () { return Promise.resolve(true); }, /** Finalizes the group boundary. */ postInit: function () { return Promise.resolve(true); } };
