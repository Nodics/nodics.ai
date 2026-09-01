/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module promotion/src/router/routers @description Promotion preview, apply, lifecycle, coupon, budget, and analytics routes. @layer router @owner promotion */
module.exports = {
    promotion: {
        customer: {
            preview: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.promotion.own', apiExposure: 'commerceCustomer', key: '/promotions/preview', method: 'POST', controller: 'DefaultPromotionController', operation: 'preview' },
            apply: { secured: true, authTokenTypes: ['access'], accessGroups: ['customerUserGroup'], permission: 'commerce.promotion.own', apiExposure: 'commerceCustomer', key: '/promotions/apply', method: 'POST', controller: 'DefaultPromotionController', operation: 'apply' }
        },
        internal: {
            reverse: { secured: true, authTokenTypes: ['internal'], accessGroups: ['serviceAccountUserGroup'], permission: 'commerce.promotion.redeem', apiExposure: 'internal', key: '/internal/promotions/redemptions/:redemptionCode/reverse', method: 'POST', controller: 'DefaultPromotionController', operation: 'reverse' },
            restoreOperational: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.product.publish', apiExposure: 'commercePublicationIngestion', key: '/internal/promotions/publication/operational/restore', method: 'POST', controller: 'DefaultPromotionController', operation: 'restoreOperational' }
        },
        backoffice: {
            saveDraft: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/promotions/drafts', method: 'PUT', controller: 'DefaultPromotionController', operation: 'saveDraft' },
            updateDraft: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/promotions/drafts/:promotionCode', method: 'PATCH', controller: 'DefaultPromotionController', operation: 'saveDraft' },
            submit: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/promotions/:promotionCode/submit', method: 'POST', controller: 'DefaultPromotionController', operation: 'submitPromotion' },
            approve: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.approve', apiExposure: 'commerceManagement', key: '/promotions/:promotionCode/approve', method: 'POST', controller: 'DefaultPromotionController', operation: 'approvePromotion' },
            schedule: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/promotions/:promotionCode/schedule', method: 'POST', controller: 'DefaultPromotionController', operation: 'schedulePromotion' },
            suspend: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/promotions/:promotionCode/suspend', method: 'POST', controller: 'DefaultPromotionController', operation: 'suspendPromotion' },
            archive: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/promotions/:promotionCode/archive', method: 'POST', controller: 'DefaultPromotionController', operation: 'archivePromotion' },
            createCouponBatch: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/promotions/:promotionCode/coupon-batches', method: 'POST', controller: 'DefaultPromotionController', operation: 'createCouponBatch' },
            reserveCouponBatch: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/promotions/coupon-batches/:batchCode/reserve', method: 'POST', controller: 'DefaultPromotionController', operation: 'reserveCouponBatch' },
            releaseCouponBatch: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.manage', apiExposure: 'commerceManagement', key: '/promotions/coupon-batches/:batchCode/release', method: 'POST', controller: 'DefaultPromotionController', operation: 'releaseCouponBatch' },
            budgetLedger: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.read', apiExposure: 'commerceManagement', key: '/promotions/:promotionCode/budget-ledger', method: 'GET', controller: 'DefaultPromotionController', operation: 'budgetLedger' },
            analytics: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'commerce.promotion.read', apiExposure: 'commerceManagement', key: '/promotions/:promotionCode/analytics', method: 'GET', controller: 'DefaultPromotionController', operation: 'analytics' }
        }
    }
};
