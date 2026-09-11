/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module store/test/coreReferenceLocationContract @description Checks Commerce core-reference completeness and project-strengthened physical-place requirements. @layer test @owner store */
'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { merge } = require('lodash');
const schemas = require('../src/schemas/schemas').store;
const points = require('../../../data/core-v001/records/store/baseCommercePointOfServiceData');
const stores = require('../../../data/core-v001/records/store/baseCommerceStoreData');
const channels = require('../../../data/core-v001/records/store/baseCommerceSalesChannelData');

test('Store core data leaves technical revision ownership to generated CRUD', () => {
    for (const [name, records] of [['store', stores], ['salesChannel', channels], ['pointOfService', points]]) {
        assert.deepEqual(schemas[name].backoffice.concurrency, { field: 'revision', managed: true });
        assert.equal(schemas[name].definition.revision.default, 1);
        for (const record of Object.values(records)) assert.equal(record.revision, undefined);
    }
});

test('Commerce core records supply all locally required Store properties without Location', () => {
    for (const [name, records] of [['store', stores], ['salesChannel', channels], ['pointOfService', points]]) {
        for (const record of Object.values(records)) {
            for (const [property, definition] of Object.entries(schemas[name].definition)) {
                if (definition.required && definition.default === undefined) assert.notEqual(record[property], undefined, name + '.' + property);
                if (record[property] !== undefined && definition.enum) {
                    assert.ok(definition.enum.includes(record[property]), name + '.' + property);
                }
            }
        }
    }
    assert.equal(points.record0.locationRef, undefined);
    assert.equal(schemas.pointOfService.definition.locationRef.required, false);
});

test('optional location remains a typed reference rather than unrestricted text', () => {
    assert.equal(schemas.pointOfService.definition.locationRef.type, 'object');
    assert.deepEqual(schemas.pointOfService.refSchema.locationRef, {
        enabled: true, moduleName: 'locationCore', schemaName: 'location', type: 'one', propertyName: 'code'
    });
    assert.equal(schemas.pointOfService.definition.storeCode.required, true);
    assert.equal(schemas.pointOfService.definition.tenant.required, true);
});

test('a physical-only project can strengthen the existing property without changing the framework', () => {
    const effective = merge({}, schemas.pointOfService, { definition: { locationRef: { required: true } } });
    const required = Object.entries(effective.definition).filter(([, value]) => value.required && value.default === undefined).map(([key]) => key);
    assert.deepEqual(required.filter(key => points.record0[key] === undefined), ['locationRef']);
    const physical = { ...points.record0, locationRef: { code: 'project-physical-place' } };
    assert.deepEqual(required.filter(key => physical[key] === undefined), []);
    assert.deepEqual(effective.refSchema, schemas.pointOfService.refSchema);
    assert.equal(schemas.pointOfService.definition.locationRef.required, false);
});
