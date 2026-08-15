/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module promotion/src/controller/defaultPromotionApiController @description HTTP adapter for customer promotion eligibility APIs. @layer controller @owner promotion */
module.exports = {
    applyHttp: function (request) {
        const httpRequest = request.httpRequest || {};
        return Object.assign({}, request, { payload: httpRequest.body || {}, query: httpRequest.query || {} });
    },
    invoke: async function (request, method) {
        const data = await FACADE.DefaultPromotionApiFacade[method](this.applyHttp(request || {}));
        return { status: 200, data: data };
    },
    preview: function (request) { return this.invoke(request, 'preview'); },
    apply: function (request) { return this.invoke(request, 'apply'); }
};
