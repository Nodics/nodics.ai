/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module nodics.communication/config/properties @description Registers Communication capability metadata without exposing provider secrets. @layer config @owner nodics.communication @override Projects may refine presentation through layered configuration. */
module.exports = { communication: { enabled: true, contractVersion: 1, providerNeutral: true } };
