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
const point = { code: 'test-online', tenant: 'default', storeCode: 'test-store',
    name: 'Test online', status: 'ACTIVE', timezone: 'UTC' };

test('Store delegates all business sample records to projects and revision to CRUD', () => {
    const manifest = require('../data/manifest.json');
    assert.equal(Object.values(manifest.sections).some(section => section.dataType === 'core' || section.dataType === 'sample'), false);
    for (const name of ['store', 'salesChannel', 'pointOfService']) {
        assert.deepEqual(schemas[name].backoffice.concurrency, { field: 'revision', managed: true });
        assert.equal(schemas[name].definition.revision.default, 1);
    }
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
    assert.deepEqual(required.filter(key => point[key] === undefined), ['locationRef']);
    const physical = { ...point, locationRef: { code: 'project-physical-place' } };
    assert.deepEqual(required.filter(key => physical[key] === undefined), []);
    assert.deepEqual(effective.refSchema, schemas.pointOfService.refSchema);
    assert.equal(schemas.pointOfService.definition.locationRef.required, false);
});
