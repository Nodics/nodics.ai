/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const assert = require('node:assert/strict'); const test = require('node:test');
const schemas = require('../src/schemas/schemas').electronicsProduct; const properties = require('../config/properties');
const validation = require('../src/service/defaultElectronicsProductValidationService'); const projection = require('../src/service/defaultElectronicsProductProjectionService');
test.beforeEach(() => { global.CONFIG = { get: key => properties[key] }; });
test('Electronics owns domain records linked to Commerce Product', () => { assert.deepEqual(Object.keys(schemas), ['electronicsSpecificationProfile', 'electronicsCompatibilityProfile', 'electronicsWarrantyProfile', 'electronicsDeviceIdentityPolicy']); assert.equal(schemas.electronicsSpecificationProfile.definition.productCode.required, true); });
test('Electronics validates specifications compatibility warranty and device identity', () => {
    assert.equal(validation.validateSpecification({ productCode: 'phone', specificationFamilyCode: 'smartphone', specifications: { storage: '256GB' } }).valid, true);
    assert.deepEqual(validation.compatible({ connector: 'USB-C' }, { connector: ['USB-C', 'USB-A'] }), { compatible: true, mismatches: [] });
    assert.equal(validation.validateWarranty({ duration: 2, durationUnit: 'YEAR', coverage: ['PARTS'] }).valid, true);
    assert.equal(validation.validateIdentityPolicy({ identifierTypes: ['IMEI', 'SERIAL'] }).valid, true);
});
test('Electronics projection exposes safe specifications and warranty only', () => { const result = projection.project({ status: 'ACTIVE', tenant: 'default', productCode: 'phone', modelNumber: 'N1', specificationFamilyCode: 'smartphone', specifications: { storage: '256GB' } }, { status: 'ACTIVE', duration: 2, durationUnit: 'YEAR', coverage: ['PARTS'] }); assert.equal(result.electronics.specifications.storage, '256GB'); assert.equal(result.electronics.tenant, undefined); assert.equal(result.electronics.warranty.duration, 2); });
