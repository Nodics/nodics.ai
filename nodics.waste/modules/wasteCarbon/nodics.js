/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCarbon/nodics @description Loader lifecycle for the carbon owner; no external work at startup. @owner wasteCarbon @layer module @override Extend through standard module loading. */
module.exports = {
    /** Initializes without issuance or persistence. @returns {Promise<boolean>} readiness */
    init: function () { return Promise.resolve(true); },
    /** Completes startup without external work. @returns {Promise<boolean>} readiness */
    postInit: function () { return Promise.resolve(true); }
};
