/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nSystem/controller/DefaultLocalResetProviderController @description Exposes the service-token-only owner reset provider. */
module.exports = {
    /** Executes the documented bounded module operation. */
    execute: function (request, callback) {
        request.localReset = Object.assign({}, request.httpRequest && request.httpRequest.body || {}, request.localReset || {});
        return SERVICE.DefaultLocalResetProviderService.reset(Object.assign(request, request.localReset)).then(result => callback(null, {
            code: 'SUC_SYS_00000', result: result
        })).catch(callback);
    }
};
