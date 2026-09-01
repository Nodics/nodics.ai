/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module promotion/src/service/defaultCouponSecureRevealService @description Reveals purchased coupon-code secrets only through owner-checked provider boundary. @layer service @owner promotion */
module.exports = {
    unwrap: response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response,
    /** Builds service credentials for Promotion-owned reveal reads. @param {Object} request Request. @returns {Object} Service auth. */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            enterpriseCode: request.enterpriseCode,
            principalId: 'couponSecureRevealService',
            code: 'couponSecureRevealService',
            loginId: 'couponSecureRevealService',
            principalType: 'service',
            userGroups: ['serviceAccountUserGroup'],
            groups: ['serviceAccountUserGroup']
        });
    },
    /** Reveals a purchased coupon through an encrypted token or vault reference. @param {Object} request Reveal request. @returns {Promise<Object>} Reveal result. */
    reveal: async function (request) {
        if (!request || !request.tenant || !request.ownerId || !request.couponCode) throw new Error('Tenant, owner, and coupon code are required');
        const query = { tenant: request.tenant, code: request.couponCode };
        if (request.enterpriseCode) query.enterpriseCode = request.enterpriseCode;
        const result = this.unwrap(await SERVICE.DefaultCouponService.get({ tenant: request.tenant, authData: this.serviceAuthData(request), query, pageSize: 1 }));
        const coupon = Array.isArray(result) ? result[0] : result;
        if (!coupon) throw new Error('Coupon was not found');
        if (coupon.soldTo !== request.ownerId && coupon.reservedFor !== request.ownerId) throw new Error('Coupon belongs to another customer');
        if (!['DELIVERED', 'CLAIMED'].includes(coupon.status)) throw new Error('Coupon is not delivered');
        if (coupon.protectedToken) {
            return { couponCode: coupon.code, status: 'REVEALED', token: coupon.protectedToken, tokenSource: 'PROTECTED_TOKEN', correlationId: request.correlationId };
        }
        if (coupon.tokenVaultRef) {
            return { couponCode: coupon.code, status: 'REVEAL_DEFERRED', tokenAvailable: false, tokenVaultRef: coupon.tokenVaultRef, reasonCode: 'TOKEN_VAULT_PROVIDER_REQUIRED', correlationId: request.correlationId };
        }
        return { couponCode: coupon.code, status: 'REVEAL_DEFERRED', tokenAvailable: false, reasonCode: 'COUPON_TOKEN_NOT_STORED_IN_ROW', correlationId: request.correlationId };
    }
};
