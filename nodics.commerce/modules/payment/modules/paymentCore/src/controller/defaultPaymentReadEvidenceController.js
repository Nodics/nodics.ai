/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module paymentCore/controller/defaultPaymentReadEvidenceController @description Maps protected Payment evidence requests to their owner. @layer controller @owner paymentCore */
module.exports = {
    /** @param {Object} request Original routed request. @param {Function} [callback] Optional callback. @returns {Promise<Object>|undefined} Standard data envelope. */
    query: function (request, callback) {
        request.payload = Object.assign({}, request.httpRequest?.body || request.payload || {});
        request.httpResponse?.setHeader?.("Cache-Control", "no-store");
        const work = Promise.resolve().then(() => {
            SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
            return FACADE.DefaultPaymentReadEvidenceFacade.query(request);
        }).then(data => ({ data }));
        if (!callback) return work;
        work.then(value => callback(null, value)).catch(callback);
    },
};
