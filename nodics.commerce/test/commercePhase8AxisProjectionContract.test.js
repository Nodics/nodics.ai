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
const properties = require('../config/properties');
const backofficeContract = require('../../nodics.platform/modules/backoffice/src/service/contract/defaultBackofficeContractService');
const capability = properties.backofficeCapabilities['nodics.commerce'];
assert.equal(capability.capabilityId, 'commerce'); assert.equal(capability.enabled, true);
assert.equal(backofficeContract.validateBackofficeMetadata(capability), true, 'Commerce metadata must be accepted by the live BackOffice registration contract');
const navigation = capability.navigation; assert.equal(navigation.length, 19);
const ids = new Set(navigation.map(item => item.id)); assert.equal(ids.size, navigation.length);
navigation.forEach(item => {
    assert(item.requiredPermissions.length > 0); assert(item.workbenchTarget.moduleName); assert(item.workbenchTarget.schemaName);
    if (item.parentId) assert(ids.has(item.parentId), item.id + ' parent must exist');
});
const catalog = navigation.filter(item => item.id === 'catalog-and-products' || item.parentId === 'catalog-and-products');
assert(catalog.every(item => !item.lifecycleActions), 'Catalog workspaces must not publish reversal actions');
const reversal = navigation.filter(item => ['order-cancellations', 'order-returns', 'order-refunds'].includes(item.id));
assert.equal(reversal.length, 3); assert(reversal.every(item => item.parentId === 'checkout-and-orders'));
assert(reversal.every(item => item.lifecycleActions.every(action => action.ownerModule === 'order')));
assert(navigation.find(item => item.id === 'payment-reconciliation').workbenchTarget.moduleName === 'paymentCore');
assert(navigation.find(item => item.id === 'return-receipts').workbenchTarget.moduleName === 'fulfillmentCore');
console.log('Commerce Phase 8 Axis projection contract validated');
