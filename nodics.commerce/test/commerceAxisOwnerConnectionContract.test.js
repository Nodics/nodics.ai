/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('node:assert/strict');
global.SERVICE = global.SERVICE || {};
SERVICE.DefaultBackofficeCapabilityDefinitionService = require('../../nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDefinitionService');

const owners = {
    store: '../modules/baseCommerce/modules/store',
    product: '../modules/baseCommerce/modules/product',
    pricing: '../modules/baseCommerce/modules/pricing',
    tax: '../modules/baseCommerce/modules/tax',
    promotion: '../modules/baseCommerce/modules/promotion',
    cart: '../modules/checkout/modules/cart',
    order: '../modules/checkout/modules/order',
    paymentCore: '../modules/payment/modules/paymentCore',
    fulfillmentCore: '../modules/fulfillment/modules/fulfillmentCore'
};

const providerFiles = {
    store: 'defaultStoreBackofficeCapabilityService', product: 'defaultProductBackofficeCapabilityService',
    pricing: 'defaultPricingBackofficeCapabilityService', tax: 'defaultTaxBackofficeCapabilityService',
    promotion: 'defaultPromotionBackofficeCapabilityService', cart: 'defaultCartBackofficeCapabilityService',
    order: 'defaultOrderBackofficeCapabilityService', paymentCore: 'defaultPaymentCoreBackofficeCapabilityService',
    fulfillmentCore: 'defaultFulfillmentCoreBackofficeCapabilityService'
};
const navigation = [];
for (const [moduleName, relativeRoot] of Object.entries(owners)) {
    const metadata = require(relativeRoot + '/src/service/' + providerFiles[moduleName]).getCapability();
    assert(metadata && metadata.enabled, moduleName + ' must publish a BackOffice capability service');
    navigation.push(...metadata.navigation);
    assert.equal(require(relativeRoot + '/package.json').nodics.runtime.router, true, moduleName + ' must be browser-callable');
}

for (const item of navigation) {
    const target = item.workbenchTarget;
    assert(owners[target.moduleName], item.id + ' must target a concrete callable owner');
    const schemas = require(owners[target.moduleName] + '/src/schemas/schemas')[target.moduleName];
    assert(schemas[target.schemaName], item.id + ' target schema must exist');
    assert(item.workbenchPresentation.defaultColumns.length > 0, item.id + ' must publish useful columns');
}

console.log('Commerce Axis owner connection contract validated');
