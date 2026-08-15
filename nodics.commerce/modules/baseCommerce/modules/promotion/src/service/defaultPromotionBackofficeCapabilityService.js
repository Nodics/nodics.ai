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
                        { id: 'promotion-save-draft', label: 'Save draft', intent: 'SAVE_DRAFT', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'saveDraft', operationRoute: '/backoffice/promotions/drafts', featureState: 'ACTIVE', order: 10 },
                        { id: 'promotion-submit', label: 'Submit promotion', intent: 'SUBMIT', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'submitPromotion', operationRoute: '/backoffice/promotions/:promotionCode/submit', targetStatuses: ['DRAFT'], featureState: 'ACTIVE', order: 20 },
                        { id: 'promotion-approve', label: 'Approve promotion', intent: 'APPROVE', permission: 'commerce.promotion.approve', ownerModule: 'promotion', handlerAction: 'approvePromotion', operationRoute: '/backoffice/promotions/:promotionCode/approve', targetStatuses: ['SUBMITTED'], featureState: 'ACTIVE', order: 30 },
                        { id: 'promotion-schedule', label: 'Schedule promotion', intent: 'SCHEDULE', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'schedulePromotion', operationRoute: '/backoffice/promotions/:promotionCode/schedule', targetStatuses: ['APPROVED'], featureState: 'ACTIVE', order: 40 },
                        { id: 'promotion-suspend', label: 'Suspend promotion', intent: 'SUSPEND', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'suspendPromotion', operationRoute: '/backoffice/promotions/:promotionCode/suspend', targetStatuses: ['SCHEDULED', 'ACTIVE'], featureState: 'ACTIVE', order: 50 },
                        { id: 'promotion-archive', label: 'Archive promotion', intent: 'ARCHIVE', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'archivePromotion', operationRoute: '/backoffice/promotions/:promotionCode/archive', targetStatuses: ['DRAFT', 'SUSPENDED'], featureState: 'ACTIVE', order: 60 },
                        { id: 'promotion-create-coupon-batch', label: 'Create coupon batch', intent: 'CREATE_COUPON_BATCH', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'createCouponBatch', operationRoute: '/backoffice/promotions/:promotionCode/coupon-batches', featureState: 'ACTIVE', order: 70 },
                        { id: 'promotion-reserve-coupon-batch', label: 'Reserve coupon batch', intent: 'RESERVE_COUPON_BATCH', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'reserveCouponBatch', operationRoute: '/backoffice/promotions/coupon-batches/:batchCode/reserve', featureState: 'ACTIVE', order: 80 },
                        { id: 'promotion-release-coupon-batch', label: 'Release coupon batch', intent: 'RELEASE_COUPON_BATCH', permission: 'commerce.promotion.manage', ownerModule: 'promotion', handlerAction: 'releaseCouponBatch', operationRoute: '/backoffice/promotions/coupon-batches/:batchCode/release', featureState: 'ACTIVE', order: 90 },
                        { id: 'promotion-budget-ledger', label: 'Budget ledger', intent: 'READ_BUDGET_LEDGER', permission: 'commerce.promotion.read', ownerModule: 'promotion', handlerAction: 'budgetLedger', operationRoute: '/backoffice/promotions/:promotionCode/budget-ledger', featureState: 'ACTIVE', order: 100 },
                        { id: 'promotion-analytics', label: 'Analytics', intent: 'READ_ANALYTICS', permission: 'commerce.promotion.read', ownerModule: 'promotion', handlerAction: 'analytics', operationRoute: '/backoffice/promotions/:promotionCode/analytics', featureState: 'ACTIVE', order: 110 }
                    ]
                })
            ]
        });
    }
};
