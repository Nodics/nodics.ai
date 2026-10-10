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
    /** Unwraps a standard result envelope while preserving raw provider values. */
    unwrap: function (response) {
        return response &&
            Object.prototype.hasOwnProperty.call(response, 'result')
            ? response.result
            : response;
    },
    /** Builds service credentials for Promotion-owned reveal reads. @param {Object} request Request. @returns {Object} Service auth. */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            enterpriseCode: request.enterpriseCode,
            principalId: 'couponSecureRevealService',
            code: 'couponSecureRevealService',
            loginId: 'couponSecureRevealService',
            principalType: 'service',
            userGroups: ['serviceAccountUserGroup'],
            groups: ['serviceAccountUserGroup'],
        });
    },
    /** Reveals a privately authenticated delivered purchase through retained encrypted issuance only. @param {Object} request Reveal request. @returns {Promise<Object>} Private reveal result. */
    reveal: async function (request) {
        const digital = SERVICE.DefaultDigitalCommerceEntitlementService;
        request = digital.revealContext(request);
        const coupon =
            await SERVICE.DefaultPromotionOperationService.readLifecycleCoupon(
                request,
                request.couponCode,
            );
        await digital.authorizeCouponReveal(request, coupon);
        if (coupon.purchasePolicy) {
            SERVICE.DefaultPromotionOperationService.purchasedCampaign(coupon, { code: coupon.promotionCode });
            if (Date.parse(coupon.validTo) <= Date.now())
                throw new Error('The purchased coupon has expired');
        }
        const token = await SERVICE.DefaultCouponSecureIssuanceService.revealToken(request, coupon);
        return { couponCode: coupon.code, status: 'REVEALED', token, tokenSource: 'AUTHENTICATED_RETENTION',
            correlationId: request.correlationId };
    },
};
