/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('node:assert/strict');
const schemas = require('../src/schemas/schemas').inventory;
global.SERVICE = { DefaultBackofficeCapabilityDefinitionService: require('../../../../../../nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDefinitionService') };
const capability = require('../src/service/defaultInventoryBackofficeCapabilityService').getCapability();
const navigation = capability.navigation;

assert.equal(capability.category, 'commerce');
assert.equal(navigation.length, 14);
assert.deepEqual(navigation.map(item => item.id), [
    'inventory-operations',
    'stock-availability',
    'inventory-balances',
    'stock-operations',
    'receiving-replenishment',
    'inventory-warehouses',
    'stock-transfers',
    'inventory-reservations',
    'inventory-sourcing',
    'stock-counts-reconciliation',
    'returns-stock-disposition',
    'inventory-movements',
    'inventory-exceptions-recovery',
    'inventory-planning-insights'
]);
assert.deepEqual(navigation.filter(item => item.featureState === 'DISABLED').map(item => item.id), [
    'stock-operations',
    'receiving-replenishment',
    'stock-transfers',
    'inventory-sourcing',
    'stock-counts-reconciliation',
    'returns-stock-disposition',
    'inventory-exceptions-recovery',
    'inventory-planning-insights'
]);
assert.deepEqual(navigation.map(item => item.workbenchTarget.schemaName), ['inventoryBalance', 'inventoryBalance', 'inventoryBalance', 'inventoryMovement', 'inventoryMovement', 'warehouse', 'inventoryMovement', 'inventoryReservation', 'inventoryBalance', 'inventoryMovement', 'inventoryMovement', 'inventoryMovement', 'inventoryMovement', 'inventoryBalance']);
assert(navigation.every(item => item.workbenchTarget.moduleName === 'inventory'));
assert(navigation.every(item => item.workbenchPresentation.defaultColumns.length >= 5));
assert(navigation.find(item => item.id === 'inventory-operations').lifecycleActions.some(action => action.id === 'receive-stock' && action.operationRoute === '/operator/inventory/balances/:balanceCode/actions/RECEIVE'));
assert(navigation.find(item => item.id === 'inventory-balances').lifecycleActions.some(action => action.id === 'adjust-stock' && action.ownerModule === 'inventory'));
assert(navigation.find(item => item.id === 'inventory-balances').lifecycleActions.every(action => action.permission === 'commerce.inventory.operate'));
assert.equal(navigation.find(item => item.id === 'inventory-warehouses').lifecycleActions, undefined);
assert.deepEqual(schemas.inventoryBalance.backoffice.operations, ['search', 'read']);
assert.deepEqual(schemas.inventoryReservation.backoffice.operations, ['search', 'read']);
assert.deepEqual(schemas.inventoryMovement.backoffice.operations, ['search', 'read']);
assert.deepEqual(schemas.warehouse.backoffice.operations, ['search', 'read', 'create', 'update']);
console.log('Inventory Axis projection contract validated');
