/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const assert = require('node:assert/strict'); const test = require('node:test');
const enrichment = require('../src/service/defaultProductSearchEnrichmentService'); const builder = require('../src/service/defaultProductLocalizedProjectionBuilderService');
test('Product invokes configured domain contributors without depending on accelerator names', async () => {
  global.CONFIG = { get: key => key === 'product' ? { publication: { searchEnrichment: { pricing: { enabled: false }, inventory: { enabled: false }, domains: { enabled: true, contributors: { selectedDomain: { serviceName: 'SelectedDomainContributor', required: true } } } } } } : undefined };
  global.SERVICE = { SelectedDomainContributor: { enrich: async () => ({ selectedDomain: { option: 'value' } }) }, DefaultProductLocalizationPolicyService: { resolve: () => ({ value: { name: 'Product', description: 'Description', slug: 'product', revision: 1 }, resolvedLocale: 'en', requestedLocale: 'en', fallbackUsed: false }) } };
  const summaries = await enrichment.enrich({ tenant: 'default' }, { product: { code: 'product' }, variants: [] }); assert.deepEqual(summaries, { selectedDomain: { option: 'value' } });
  const projection = builder.build({ tenant: 'default', now: '2026-01-01T00:00:00.000Z' }, { product: { code: 'product', tenant: 'default', revision: 1 }, storeCode: 'store', locale: 'en', localizations: [], customerSummaries: summaries }); assert.deepEqual(projection.payload.selectedDomain, { option: 'value' });
});
