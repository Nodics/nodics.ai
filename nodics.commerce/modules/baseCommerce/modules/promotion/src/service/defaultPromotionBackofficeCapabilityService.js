/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available software. See root LICENSE. */
/** @module promotion/service/DefaultPromotionBackofficeCapabilityService @description Publishes the Promotion-owned BackOffice workspaces. @layer service @owner promotion */
module.exports = {
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('promotion', this);
        return Promise.resolve(true);
    },
    postInit: function () { return Promise.resolve(true); },
    getCapability: function () {
        let d = SERVICE.DefaultBackofficeCapabilityDefinitionService;
        let promotionCodeInput = { name: 'promotionCode', label: 'Promotion code', type: 'HIDDEN', required: true, valueFromRecord: 'code', maximumLength: 128 };
        let batchCodeInput = { name: 'batchCode', label: 'Coupon batch code', type: 'TEXT', required: true, maximumLength: 128 };
        return d.capability({
            capabilityId: 'commerce-promotion',
            displayName: 'Promotions',
            category: 'commerce',
            icon: 'commerce',
            navigation: [
                d.workbench({
                    id: 'promotions',
                    parentId: 'catalog-and-products',
                    parentModuleName: 'product',
                    label: 'Promotions',
                    route: '/commerce/catalog/promotions',
                    moduleName: 'promotion',
                    schemaName: 'promotion',
                    order: 150,
                    permission: 'commerce.promotion.read',
                    summary: 'Manage promotion rules, coupons, and applied-discount evidence.',
                    presentation: {
                        defaultColumns: ['code', 'name', 'status', 'priority', 'validFrom', 'validTo', 'revision'],
                        hiddenFields: ['conditions', 'actions']
                    }
                }),
                d.workbench({
                    id: 'promotions-builder',
                    parentId: 'catalog-and-products',
                    parentModuleName: 'product',
                    label: 'Promotions Builder',
                    route: '/commerce/promotions',
                    moduleName: 'promotion',
                    schemaName: 'promotion',
                    order: 151,
                    permission: 'commerce.promotion.manage',
                    summary: 'Compose, approve, schedule, coupon-budget and audit Promotion-owned campaigns.',
                    presentation: {
                        defaultColumns: ['code', 'name', 'status', 'priority', 'validFrom', 'validTo', 'revision'],
                        hiddenFields: ['conditions', 'actions', 'budget', 'approval', 'analytics']
                    },
                    lifecycleActions: [
                        { id: 'promotion-save-draft', label: 'Save draft', intent: 'UPDATE', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'saveDraft', operationRoute: '/backoffice/promotions/drafts/:promotionCode', httpMethod: 'PATCH', inputFields: [promotionCodeInput], featureState: 'ACTIVE', order: 10 },
                        { id: 'promotion-submit', label: 'Submit promotion', intent: 'SUBMIT', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'submitPromotion', operationRoute: '/backoffice/promotions/:promotionCode/submit', httpMethod: 'POST', inputFields: [promotionCodeInput, { name: 'conflictCheck', label: 'Conflict check', type: 'SELECT', required: true, options: ['PASSED', 'NOT_RUN', 'FAILED'], defaultValue: 'PASSED', maximumLength: 32 }], targetStatuses: ['DRAFT'], featureState: 'ACTIVE', order: 20 },
                        { id: 'promotion-approve', label: 'Approve promotion', intent: 'APPROVE', permission: 'commerce.promotion.approve', ownerModule: 'promotion', handlerAction: 'approvePromotion', operationRoute: '/backoffice/promotions/:promotionCode/approve', httpMethod: 'POST', inputFields: [promotionCodeInput, { name: 'checklist', label: 'Approval checklist JSON', type: 'JSON', required: false, defaultValue: '["eligibility reviewed","budget reviewed","coupon policy reviewed"]', maximumLength: 1000 }], targetStatuses: ['SUBMITTED'], featureState: 'ACTIVE', order: 30 },
                        { id: 'promotion-schedule', label: 'Schedule promotion', intent: 'ACTIVATE', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'schedulePromotion', operationRoute: '/backoffice/promotions/:promotionCode/schedule', httpMethod: 'POST', inputFields: [promotionCodeInput, { name: 'validFrom', label: 'Valid from', type: 'TEXT', required: true, valueFromRecord: 'validFrom', maximumLength: 40 }, { name: 'validTo', label: 'Valid to', type: 'TEXT', required: true, valueFromRecord: 'validTo', maximumLength: 40 }], targetStatuses: ['APPROVED'], featureState: 'ACTIVE', order: 40 },
                        { id: 'promotion-suspend', label: 'Suspend promotion', intent: 'CANCEL', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'suspendPromotion', operationRoute: '/backoffice/promotions/:promotionCode/suspend', httpMethod: 'POST', inputFields: [promotionCodeInput, { name: 'reasonCode', label: 'Reason', type: 'MULTILINE', required: false, maximumLength: 512 }], targetStatuses: ['SCHEDULED', 'ACTIVE'], featureState: 'ACTIVE', order: 50 },
                        { id: 'promotion-archive', label: 'Archive promotion', intent: 'OTHER', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'archivePromotion', operationRoute: '/backoffice/promotions/:promotionCode/archive', httpMethod: 'POST', inputFields: [promotionCodeInput, { name: 'reasonCode', label: 'Reason', type: 'MULTILINE', required: false, maximumLength: 512 }], targetStatuses: ['DRAFT', 'SUSPENDED'], featureState: 'ACTIVE', order: 60 },
                        { id: 'promotion-create-coupon-batch', label: 'Create coupon batch', intent: 'CREATE', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'createCouponBatch', operationRoute: '/backoffice/promotions/:promotionCode/coupon-batches', httpMethod: 'POST', inputFields: [promotionCodeInput, batchCodeInput, { name: 'couponCodes', label: 'Coupon codes JSON', type: 'JSON', required: true, defaultValue: '["PROMO10A","PROMO10B"]', maximumLength: 4000 }, { name: 'maxUses', label: 'Max uses', type: 'TEXT', required: false, defaultValue: '1', maximumLength: 12 }], featureState: 'ACTIVE', order: 70 },
                        { id: 'promotion-reserve-coupon-batch', label: 'Reserve coupon batch', intent: 'EXECUTE', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'reserveCouponBatch', operationRoute: '/backoffice/promotions/coupon-batches/:batchCode/reserve', httpMethod: 'POST', inputFields: [batchCodeInput, { name: 'reservedFor', label: 'Reserved for', type: 'TEXT', required: false, maximumLength: 128 }], featureState: 'ACTIVE', order: 80 },
                        { id: 'promotion-release-coupon-batch', label: 'Release coupon batch', intent: 'EXECUTE', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'releaseCouponBatch', operationRoute: '/backoffice/promotions/coupon-batches/:batchCode/release', httpMethod: 'POST', inputFields: [batchCodeInput], featureState: 'ACTIVE', order: 90 },
                        { id: 'promotion-budget-ledger', label: 'Budget ledger', intent: 'VALIDATE', permission: 'commerce.promotion.read', ownerModule: 'promotion', handlerAction: 'budgetLedger', operationRoute: '/backoffice/promotions/:promotionCode/budget-ledger', httpMethod: 'GET', inputFields: [promotionCodeInput], featureState: 'ACTIVE', order: 100 },
                        { id: 'promotion-analytics', label: 'Analytics', intent: 'VALIDATE', permission: 'commerce.promotion.read', ownerModule: 'promotion', handlerAction: 'analytics', operationRoute: '/backoffice/promotions/:promotionCode/analytics', httpMethod: 'GET', inputFields: [promotionCodeInput], featureState: 'ACTIVE', order: 110 }
                    ]
                })
            ]
        });
    }
};
