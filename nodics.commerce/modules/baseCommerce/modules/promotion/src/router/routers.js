/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module promotion/src/router/routers @description Customer-facing promotion preview and apply routes. @layer router @owner promotion */
module.exports = {
    promotion: {
        customer: {
            preview: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.promotion.own', apiExposure: 'commerceCustomer', key: '/customer/promotions/preview', method: 'POST', controller: 'DefaultPromotionApiController', operation: 'preview' },
            apply: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.promotion.own', apiExposure: 'commerceCustomer', key: '/customer/promotions/apply', method: 'POST', controller: 'DefaultPromotionApiController', operation: 'apply' }
        },
        internal: {
            reverse: { secured: true, authTokenTypes: ['internal'], accessGroups: ['serviceAccountUserGroup'], permission: 'commerce.promotion.redeem', apiExposure: 'internal', key: '/internal/promotions/redemptions/:redemptionCode/reverse', method: 'POST', controller: 'DefaultPromotionApiController', operation: 'reverse' }
        }
    }
};
