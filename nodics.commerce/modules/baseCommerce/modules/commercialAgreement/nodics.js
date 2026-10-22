/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commercialAgreement/nodics @description Commercial agreement module lifecycle. @layer module @owner commercialAgreement */
module.exports = {
    /** Initializes the capability without activating agreements. */
    init: function () { return Promise.resolve(true); },
    /** Completes initialization without external side effects. */
    postInit: function () { return Promise.resolve(true); }
};
