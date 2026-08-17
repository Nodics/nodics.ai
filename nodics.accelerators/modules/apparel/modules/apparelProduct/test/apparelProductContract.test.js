/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const schemas = require('../src/schemas/schemas').apparelProduct;
const properties = require('../config/properties');
const validation = require('../src/service/defaultApparelProductValidationService');
const projection = require('../src/service/defaultApparelProductProjectionService');

test.beforeEach(() => { global.CONFIG = { get: key => properties[key] }; });

test('Apparel owns separate records linked to Commerce Product', () => {
    assert.deepEqual(Object.keys(schemas), ['apparelStyle', 'apparelVariantProfile', 'apparelSizeSystem', 'apparelFitProfile']);
    assert.equal(schemas.apparelStyle.definition.productCode.required, true);
    assert.equal(schemas.apparelVariantProfile.definition.variantCode.required, true);
    assert.equal(schemas.apparelStyle.schemaPolicies[0], 'tenantOwned');
});

test('Apparel validates size-system, composition, and variant compatibility', () => {
    const style = { productCode: 'dress', sizeSystemCode: 'ALPHA', materialComposition: [{ percentage: 70 }, { percentage: 30 }] };
    assert.deepEqual(validation.validateStyle(style), { valid: true, errors: [] });
    assert.equal(validation.validateStyle({ productCode: 'dress', sizeSystemCode: 'UNKNOWN' }).valid, false);
    assert.equal(validation.validateVariant({ productCode: 'dress', variantCode: 'dress-red-s', colourCode: 'red', sizeCode: 'S', sizeSystemCode: 'ALPHA' }, style, { sizeCodes: ['S', 'M'] }).valid, true);
    assert.deepEqual(validation.validateVariant({ productCode: 'dress', variantCode: 'bad', colourCode: 'red', sizeCode: 'XL', sizeSystemCode: 'EU' }, style, { sizeCodes: ['S'] }).errors,
        ['APPAREL_SIZE_SYSTEM_MISMATCH', 'APPAREL_SIZE_NOT_ALLOWED']);
});

test('Apparel projection enriches Product without internal identities', () => {
    const result = projection.project({ status: 'ACTIVE', tenant: 'default', code: 'styleRecord', productCode: 'dress', brandCode: 'brand', sizeSystemCode: 'ALPHA' },
        [{ status: 'ACTIVE', code: 'profileRecord', variantCode: 'dress-red-s', colourCode: 'red', sizeCode: 'S' }]);
    assert.equal(result.apparel.brandCode, 'brand');
    assert.equal(result.apparel.options[0].variantCode, 'dress-red-s');
    assert.equal(result.apparel.tenant, undefined);
    assert.equal(result.apparel.options[0].code, undefined);
});
