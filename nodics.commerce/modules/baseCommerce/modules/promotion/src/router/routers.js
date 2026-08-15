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
        },
        backoffice: {
            saveDraft: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/backoffice/promotions/drafts', method: 'PUT', controller: 'DefaultPromotionApiController', operation: 'saveDraft' },
            updateDraft: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/backoffice/promotions/drafts/:promotionCode', method: 'PATCH', controller: 'DefaultPromotionApiController', operation: 'saveDraft' },
            submit: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/backoffice/promotions/:promotionCode/submit', method: 'POST', controller: 'DefaultPromotionApiController', operation: 'submitPromotion' },
            approve: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.approve', apiExposure: 'commerceManagement', key: '/backoffice/promotions/:promotionCode/approve', method: 'POST', controller: 'DefaultPromotionApiController', operation: 'approvePromotion' },
            schedule: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/backoffice/promotions/:promotionCode/schedule', method: 'POST', controller: 'DefaultPromotionApiController', operation: 'schedulePromotion' },
            suspend: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/backoffice/promotions/:promotionCode/suspend', method: 'POST', controller: 'DefaultPromotionApiController', operation: 'suspendPromotion' },
            archive: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/backoffice/promotions/:promotionCode/archive', method: 'POST', controller: 'DefaultPromotionApiController', operation: 'archivePromotion' },
            createCouponBatch: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/backoffice/promotions/:promotionCode/coupon-batches', method: 'POST', controller: 'DefaultPromotionApiController', operation: 'createCouponBatch' },
            reserveCouponBatch: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/backoffice/promotions/coupon-batches/:batchCode/reserve', method: 'POST', controller: 'DefaultPromotionApiController', operation: 'reserveCouponBatch' },
            releaseCouponBatch: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/backoffice/promotions/coupon-batches/:batchCode/release', method: 'POST', controller: 'DefaultPromotionApiController', operation: 'releaseCouponBatch' },
            budgetLedger: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.read', apiExposure: 'commerceManagement', key: '/backoffice/promotions/:promotionCode/budget-ledger', method: 'GET', controller: 'DefaultPromotionApiController', operation: 'budgetLedger' },
            analytics: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.read', apiExposure: 'commerceManagement', key: '/backoffice/promotions/:promotionCode/analytics', method: 'GET', controller: 'DefaultPromotionApiController', operation: 'analytics' }
        }
    }
};
