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
global.SERVICE = { DefaultBackofficeCapabilityDefinitionService: require('../../../../../../nodics.core/modules/nService/src/service/module/defaultBackofficeCapabilityDefinitionService') };
const capability = require('../src/service/defaultInventoryBackofficeCapabilityService').getCapability();
const navigation = capability.navigation;

assert.equal(capability.category, 'commerce');
assert.equal(navigation.length, 5);
assert.deepEqual(navigation.map(item => item.id), ['inventory-operations', 'inventory-warehouses', 'inventory-balances', 'inventory-reservations', 'inventory-movements']);
assert.deepEqual(navigation.map(item => item.workbenchTarget.schemaName), ['inventoryBalance', 'warehouse', 'inventoryBalance', 'inventoryReservation', 'inventoryMovement']);
assert(navigation.every(item => item.workbenchTarget.moduleName === 'inventory'));
assert(navigation.every(item => item.workbenchPresentation.defaultColumns.length >= 5));
assert.deepEqual(schemas.inventoryBalance.backoffice.operations, ['search', 'read']);
assert.deepEqual(schemas.inventoryReservation.backoffice.operations, ['search', 'read']);
assert.deepEqual(schemas.inventoryMovement.backoffice.operations, ['search', 'read']);
assert.deepEqual(schemas.warehouse.backoffice.operations, ['search', 'read', 'create', 'update']);
console.log('Inventory Axis projection contract validated');
