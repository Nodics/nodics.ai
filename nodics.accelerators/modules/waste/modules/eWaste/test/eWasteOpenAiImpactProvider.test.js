/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module eWaste/test/eWasteOpenAiImpactProvider @description Tests sourced assessment validation and data minimization. @owner eWaste @layer test */
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const provider = require('../src/service/defaultEWasteOpenAiImpactProviderService');
const config = require('../config/properties').wasteImpact.calculation;
const definitions = Object.values(config.environmentalAssessment.indicators);
const url = 'https://www.epa.gov/example';
const response = { model: 'test-model', metadata: { sources: [{ url }], providerRequestId: 'test-request' } };
function assessment() {
    return { methodology: 'Reference comparison', geography: 'US', baseline: 'Landfill', treatment: 'Future recycling', boundary: 'Life cycle', assumptions: 'Published category proxy', weightKg: 1, weightMinKg: 1, weightMaxKg: 1,
        metrics: definitions.map(definition => ({ metricCode: definition.metricCode, value: definition.metricCode === 'ESTIMATED_CO2E_SAVED_KG' ? 2 : definition.metricCode === 'CARBON_EQUIVALENT_TCO2E' ? 0.002 : null,
            factorPerKg: definition.metricCode === 'ESTIMATED_CO2E_SAVED_KG' ? 2 : 0.002,
            min: definition.metricCode === 'ESTIMATED_CO2E_SAVED_KG' ? 2 : 0.002, max: definition.metricCode === 'ESTIMATED_CO2E_SAVED_KG' ? 2 : 0.002, sourceUrl: url, explanation: '1 kg times 2 kg CO2e/kg; reference scenario.' })) };
}
beforeEach(() => { global.SERVICE = { DefaultWastePersistenceService: { fail(code, message) { throw Object.assign(new Error(message), { code }); } } }; });
test('single items and bundles preserve sourced estimates and do not issue credits', () => {
    for (const facts of [{ weight: 1 }, { weight: 1, submissionUnit: 'BUNDLE', quantity: 1 }]) {
        const result = provider.normalize(assessment(), response, facts, definitions, config.openAiEnvironmental);
        assert.equal(result.calculationStatus, 'ESTIMATED');
        assert.equal(result.metrics.length, 2);
        assert.equal(result.metricEvidence[0].sourceUrl, url);
        assert.equal(result.carbonCredits, undefined);
    }
});
test('unknown source, changed weight, double-counted bundle and invented operational outcomes reject', () => {
    assert.throws(() => provider.normalize(assessment(), { metadata: { sources: [] } }, {}, definitions, config.openAiEnvironmental));
    assert.throws(() => provider.normalize(assessment(), response, { weight: 2 }, definitions, config.openAiEnvironmental));
    assert.throws(() => provider.normalize(assessment(), response, { submissionUnit: 'BUNDLE', quantity: 2 }, definitions, config.openAiEnvironmental));
    const data = assessment(); data.metrics.find(value => value.metricCode === 'TRANSPORT_EMISSIONS_KG_CO2E').value = 0.002;
    assert.throws(() => provider.normalize(data, response, {}, definitions, config.openAiEnvironmental));
});
test('a fabricated reference or inconsistent factor arithmetic cannot become an estimate', () => {
    const data = assessment();
    data.metrics.find(value => value.metricCode === 'ESTIMATED_CO2E_SAVED_KG').factorPerKg = 2000;
    assert.throws(() => provider.normalize(data,response,{weight:1},definitions,config.openAiEnvironmental));
    const second = assessment();
    second.metrics.find(value => value.metricCode === 'ESTIMATED_CO2E_SAVED_KG').sourceUrl = 'https://invented.example/factor';
    assert.throws(() => provider.normalize(second,response,{weight:1},definitions,config.openAiEnvironmental));
});
test('private metadata and identities are excluded before provider invocation', () => {
    assert.deepEqual(provider.facts({ itemTypeCode: 'CHARGER', customerRef: 'secret', metadata: { token: 'secret' }, materials: [{ code: 'PLASTIC', private: 'secret' }] }), { itemTypeCode: 'CHARGER', materials: [{ code: 'PLASTIC' }] });
});
test('bundle count is excluded even if the model counts one submission as an item', () => {
    const data = assessment();
    Object.assign(data.metrics.find(value => value.metricCode === 'RECYCLING_INPUT_ITEM_COUNT'), {value:1,min:1,max:1});
    const result = provider.normalize(data,response,{submissionUnit:'BUNDLE',quantity:1},definitions,config.openAiEnvironmental);
    assert.equal(result.metrics.some(value => value.metricCode === 'RECYCLING_INPUT_ITEM_COUNT'),false);
});
test('configured model call receives trusted tenant and cancellation', async () => {
    const signal = new AbortController().signal;
    global.CONFIG = { get: (key, tenant) => { assert.equal(tenant, 'tenant-a'); return { providers: {} }; } };
    SERVICE.DefaultCopilotProviderService = { invoke: async (request, options) => {
        assert.equal(options.signal, signal); assert.equal(options.profile, 'eWasteEnvironmentalAssessment');
        assert.equal(request.responseSchema.schema.additionalProperties, false);
        return { ...response, content: JSON.stringify(assessment()) };
    } };
    await provider.calculate({ facts: { weight: 1 } }, { settings: config, runtimeContext: { tenant: 'tenant-a' }, signal });
});
