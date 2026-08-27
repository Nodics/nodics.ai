/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const assert = require('node:assert/strict');
const backofficeContract = require('../../nodics.platform/modules/backoffice/src/service/contract/defaultBackofficeContractService');
global.SERVICE = global.SERVICE || {};
SERVICE.DefaultBackofficeCapabilityDefinitionService = require('../../nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDefinitionService');
const providers = [
    '../modules/baseCommerce/modules/store/src/service/defaultStoreBackofficeCapabilityService',
    '../modules/baseCommerce/modules/product/src/service/defaultProductBackofficeCapabilityService',
    '../modules/baseCommerce/modules/pricing/src/service/defaultPricingBackofficeCapabilityService',
    '../modules/baseCommerce/modules/tax/src/service/defaultTaxBackofficeCapabilityService',
    '../modules/baseCommerce/modules/promotion/src/service/defaultPromotionBackofficeCapabilityService',
    '../modules/checkout/modules/cart/src/service/defaultCartBackofficeCapabilityService',
    '../modules/checkout/modules/order/src/service/defaultOrderBackofficeCapabilityService',
    '../modules/payment/modules/paymentCore/src/service/defaultPaymentCoreBackofficeCapabilityService',
    '../modules/fulfillment/modules/fulfillmentCore/src/service/defaultFulfillmentCoreBackofficeCapabilityService'
].map(file => require(file).getCapability());
assert(providers.every(capability => backofficeContract.validateBackofficeMetadata(capability)), 'Every concrete Commerce provider must satisfy the live BackOffice contract');
const navigation = providers.flatMap(capability => capability.navigation); assert.equal(navigation.length, 76);
const ids = new Set(navigation.map(item => item.id)); assert.equal(ids.size, navigation.length);
navigation.forEach(item => {
    assert(item.requiredPermissions.length > 0); assert(item.workbenchTarget.moduleName); assert(item.workbenchTarget.schemaName);
    if (item.parentId) assert(ids.has(item.parentId), item.id + ' parent must exist');
});
const catalog = navigation.filter(item => item.id === 'catalog-and-products' || item.parentId === 'catalog-and-products');
assert(catalog.every(item => !item.lifecycleActions || item.id === 'promotions-builder' && item.lifecycleActions.every(action => action.ownerModule === 'promotion')), 'Catalog workspaces must not publish non-Promotion lifecycle actions');
assert(navigation.find(item => item.id === 'promotions-builder').lifecycleActions.some(action => action.handlerAction === 'createCouponBatch'));
assert(navigation.find(item => item.id === 'promotions-builder').lifecycleActions.some(action => action.handlerAction === 'analytics'));
const reversal = navigation.filter(item => ['order-cancellations', 'order-returns', 'order-refunds'].includes(item.id));
assert.equal(reversal.length, 3);
assert(reversal.every(item => item.lifecycleActions.every(action => action.ownerModule === 'order')));
assert.deepEqual(reversal.map(item => item.workbenchPresentation.fixedFilters[0].value), ['CANCELLATION', 'RETURN', 'REFUND']);
assert(navigation.find(item => item.id === 'payment-reconciliation').workbenchTarget.moduleName === 'paymentCore');
assert(navigation.find(item => item.id === 'return-receipts').workbenchTarget.moduleName === 'fulfillmentCore');
const localizedProductWorkspaces = navigation.filter(item => ['product-localizations', 'category-localizations',
    'variant-localizations', 'product-search-locales'].includes(item.id));
assert.equal(localizedProductWorkspaces.length, 4);
assert(localizedProductWorkspaces.every(item => item.parentId === 'products' && item.workbenchTarget.moduleName === 'product'));
assert.deepEqual(localizedProductWorkspaces.map(item => item.workbenchTarget.schemaName), [
    'productLocalization', 'categoryLocalization', 'productVariantLocalization', 'productSearchProjection'
]);
console.log('Commerce Axis projection contract validated');
