/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const assert = require('node:assert/strict'); const test = require('node:test');
const apparel = require('../../apparel/modules/apparelProduct/src/service/defaultApparelProductSearchEnrichmentService'); const apparelProjection = require('../../apparel/modules/apparelProduct/src/service/defaultApparelProductProjectionService');
const electronics = require('../../electronics/modules/electronicsProduct/src/service/defaultElectronicsProductSearchEnrichmentService'); const electronicsProjection = require('../../electronics/modules/electronicsProduct/src/service/defaultElectronicsProductProjectionService');
const telco = require('../../telco/modules/telcoCatalog/src/service/defaultTelcoProductSearchEnrichmentService');
test('all selected accelerators contribute customer-safe Product projection fields', async () => {
  global.SERVICE = { DefaultApparelStyleService: { get: async () => ({ result: [{ productCode: 'dress', status: 'ACTIVE', sizeSystemCode: 'ALPHA' }] }) }, DefaultApparelVariantProfileService: { get: async () => ({ result: [{ variantCode: 'dress-s', status: 'ACTIVE', sizeCode: 'S', colourCode: 'red' }] }) }, DefaultApparelProductProjectionService: apparelProjection,
    DefaultElectronicsSpecificationProfileService: { get: async () => ({ result: [{ productCode: 'phone', status: 'ACTIVE', specificationFamilyCode: 'SMARTPHONE', specifications: { storage: '256GB' } }] }) }, DefaultElectronicsWarrantyProfileService: { get: async () => ({ result: [] }) }, DefaultElectronicsProductProjectionService: electronicsProjection,
    DefaultTelcoPlanOfferingService: { get: async () => ({ result: [{ productCode: 'plan', status: 'ACTIVE', planType: 'POSTPAID', billingCycle: 'MONTHLY', allowanceCodes: ['data'], simTypes: ['ESIM'] }] }) }, DefaultTelcoAllowanceService: { get: async () => ({ result: [{ code: 'data', allowanceType: 'DATA', amount: '50', unit: 'GB' }] }) } };
  const request = { tenant: 'default' };
  assert((await apparel.enrich(request, { product: { code: 'dress' } })).apparel.options[0].sizeCode === 'S');
  assert((await electronics.enrich(request, { product: { code: 'phone' } })).electronics.specifications.storage === '256GB');
  assert((await telco.enrich(request, { product: { code: 'plan' } })).telco.allowances[0].amount === '50');
});
