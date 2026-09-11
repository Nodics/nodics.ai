/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const frameworkRoot = path.resolve(__dirname, '..', '..');
const commerceStore = require(path.join(frameworkRoot, 'nodics.commerce/modules/baseCommerce/modules/store/src/schemas/schemas.js')).store;
const wasteCollection = require(path.join(frameworkRoot, 'nodics.waste/modules/wasteCollection/src/schemas/schemas.js')).wasteCollection;

const addressFields = [
    'flatNo',
    'building',
    'street',
    'addressLine1',
    'addressLine2',
    'locality',
    'city',
    'state',
    'postalCode',
    'countryCode',
    'latitude',
    'longitude',
    'coordinates'
];

function assertNoAddressDuplication(schema, label) {
    addressFields.forEach(field => assert.strictEqual(schema.definition[field], undefined, `${label} must reference Location/Profile instead of duplicating ${field}`));
}

function assertReference(schema, fieldName, targetModule, targetSchema, type = 'one') {
    assert.deepStrictEqual(schema.refSchema[fieldName], {
        enabled: true,
        moduleName: targetModule,
        schemaName: targetSchema,
        type,
        propertyName: 'code'
    });
}

assert.strictEqual(commerceStore.store.definition.primaryLocationRef.type, 'object');
assert.strictEqual(commerceStore.store.definition.primaryLocationRef.required, false);
assert.strictEqual(commerceStore.store.definition.enterpriseRef.type, 'object');
assertReference(commerceStore.store, 'primaryLocationRef', 'locationCore', 'location');
assertReference(commerceStore.store, 'enterpriseRef', 'profile', 'enterprise');

assert.strictEqual(commerceStore.salesChannel.definition.locationRef.type, 'object');
assert.strictEqual(commerceStore.salesChannel.definition.locationRef.required, false);
assert.strictEqual(commerceStore.salesChannel.definition.enterpriseRef.type, 'object');
assertReference(commerceStore.salesChannel, 'locationRef', 'locationCore', 'location');
assertReference(commerceStore.salesChannel, 'enterpriseRef', 'profile', 'enterprise');

assert.strictEqual(commerceStore.pointOfService.definition.locationRef.type, 'object');
assert.strictEqual(commerceStore.pointOfService.definition.locationRef.required, false);
assert.strictEqual(commerceStore.pointOfService.definition.operatorEnterpriseRef.type, 'object');
assertReference(commerceStore.pointOfService, 'locationRef', 'locationCore', 'location');
assertReference(commerceStore.pointOfService, 'operatorEnterpriseRef', 'profile', 'enterprise');

assert.strictEqual(wasteCollection.wasteCollectionPoint.definition.locationRef.type, 'object');
assert.strictEqual(wasteCollection.wasteCollectionPoint.definition.locationRef.required, true);
assert.strictEqual(wasteCollection.wasteCollectionPoint.definition.operatorEnterpriseRef.type, 'object');
assert.strictEqual(wasteCollection.wasteCollectionPoint.definition.operatorEnterpriseRef.required, true);

[
    ['store.store', commerceStore.store],
    ['store.salesChannel', commerceStore.salesChannel],
    ['store.pointOfService', commerceStore.pointOfService],
    ['wasteCollection.wasteCollectionPoint', wasteCollection.wasteCollectionPoint]
].forEach(([label, schema]) => assertNoAddressDuplication(schema, label));

console.log('location business association contract passed');
