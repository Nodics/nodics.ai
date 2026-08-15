/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module promotion/src/facade/defaultPromotionApiFacade @description Normalizes authenticated customer promotion API context. @layer facade @owner promotion */
module.exports = {
    applyContext: function (request) {
        const authData = request.authData || {};
        const tenant = authData.tenant || request.tenant;
        const ownerId = authData.principalId || authData.userId || authData.code || request.ownerId;
        if (!tenant || !ownerId) throw new Error('Authenticated tenant and customer are required for promotion APIs');
        return Object.assign({}, request, { tenant, ownerId, authData });
    },
    preview: function (request) { return SERVICE.DefaultPromotionCustomerApiService.preview(this.applyContext(request)); },
    apply: function (request) { return SERVICE.DefaultPromotionCustomerApiService.apply(this.applyContext(request)); }
};
