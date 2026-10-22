/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module paymentCore/facade/defaultPaymentReadEvidenceFacade @description Delegates exact read-only Payment evidence without rewriting identity. @layer facade @owner paymentCore */
module.exports = {
    /** @param {Object} request Original private service request. @returns {Promise<Object>} Safe Payment evidence. */
    query: function (request) { return SERVICE.DefaultPaymentReadEvidenceService.query(request); },
};
