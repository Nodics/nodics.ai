/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteImpact/test/wasteImpactProviderContract @description Proves mock calculations, layered CONFIG, provider replacement, tenant context, provenance and bounded failure behavior. @layer test @owner wasteImpact */
const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const _ = require('lodash');
const Config = require('../../../../nodics.foundation/modules/nConfig/bin/config');
const defaults = require('../config/properties');
const impact = require('../src/service/defaultWasteImpactCalculationService');
const mock = require('../src/service/defaultWasteImpactMockProviderService');
const facade = require('../../wasteApi/src/facade/defaultWasteInternalFacade');
const controller = require('../../wasteApi/src/controller/defaultWasteInternalController');

/** Supplies a reproducible, generic assessment without depending on a project dataset. */
function request(facts = {}) {
    return {
        resultCode: 'assessment-001',
        sourceRef: { module: 'wasteSubmission', schema: 'wasteSubmission', code: 'submission-001' },
        profile: { code: 'provider-profile', formulaType: 'EXTERNAL_PROVIDER', revision: 1 },
        facts: Object.assign({ weight: 2, categoryCode: 'DEVICE', itemTypeCode: 'DEVICE_ITEM' }, facts),
        evidenceRefs: ['evidence-001'], idempotencyKey: 'assessment-once', correlationId: 'trace-001',
        now: '2026-09-08T12:00:00.000Z'
    };
}

/** Applies only a later-layer delta through the actual Nodics CONFIG registry. */
function settings(delta, tenant) {
    const effective = _.merge({}, CONFIG.getProperties(tenant), { wasteImpact: { calculation: delta } });
    CONFIG.setProperties(effective, tenant);
}

/** Creates a protocol-conforming stand-in for a later provider; makes no network calls. */
function providerResponse() {
    return {
        provider: { code: 'TEST_EXTERNAL', version: '2', isMock: false },
        formulaVersion: 'external-method-v2', calculationStatus: 'CONFIRMED',
        metrics: [{ metricCode: 'ASSESSMENT_CO2E', unitOfMeasure: 'KG_CO2E', value: '7.250' }],
        assessmentRef: 'assessment-external-001', methodologyRef: 'methodology-002'
    };
}

beforeEach(() => {
    global.CONFIG = new Config();
    CONFIG.LOG = { error: function () {} };
    CONFIG.setProperties(_.cloneDeep(defaults));
    global.SERVICE = {
        DefaultWasteImpactCalculationService: Object.assign({}, impact),
        DefaultWasteImpactMockProviderService: Object.assign({}, mock)
    };
});
afterEach(() => { delete global.CONFIG; delete global.SERVICE; delete global.FACADE; });

test('ordered providers fall back after invalid output and preserve the successful service and failed attempt', async () => {
    SERVICE.Primary = { calculate: async () => ({ metrics: [] }) };
    SERVICE.Secondary = { calculate: async () => providerResponse() };
    settings({ providerService: 'Primary', fallbackProviderServices: ['Secondary'] });
    const result = await impact.calculate(request());
    assert.equal(result.metadata.impactProvider.service, 'Secondary');
    assert.deepEqual(result.metadata.impactProvider.attempts.map(item => item.status), ['FAILED', 'SUCCEEDED']);
});

test('valid primary skips fallback; timed-out primary cancels before fallback', async () => {
    let fallbackCalls = 0, aborted = false;
    SERVICE.Primary = { calculate: async () => providerResponse() };
    SERVICE.Secondary = { calculate: async () => { fallbackCalls++; return providerResponse(); } };
    settings({ providerService: 'Primary', fallbackProviderServices: ['Secondary'], timeoutMs: 10 });
    await impact.calculate(request());
    assert.equal(fallbackCalls, 0);
    SERVICE.Primary.calculate = (_, context) => new Promise(() => context.signal.addEventListener('abort', () => { aborted = true; }));
    await impact.calculate(request());
    assert.equal(aborted, true);
    assert.equal(fallbackCalls, 1);
});

test('fallback never silently substitutes an illustrative mock', async () => {
    SERVICE.Primary = { calculate: async () => { throw new Error('private upstream data'); } };
    settings({ providerService: 'Primary', fallbackProviderServices: ['DefaultWasteImpactMockProviderService'] });
    await assert.rejects(impact.calculate(request()), error => error.code === 'ERR_WASTE_IMPACT_PROVIDER_RESULT_INVALID');
});

test('default mock is usable, traceable and always estimated without minting value', async () => {
    const input = request({ weight: '2.5' });
    input.calculationStatus = 'CONFIRMED';
    const result = await impact.calculate(input);
    assert.equal(result.metrics[0].value, '2.500');
    assert.equal(result.metrics[0].unitOfMeasure, 'KG_CO2E');
    assert.equal(result.calculationStatus, 'ESTIMATED');
    assert.equal(result.metadata.impactProvider.isMock, true);
    assert.equal(result.metadata.impactProvider.publicClaimAllowed, false);
    assert.equal(result.metadata.impactProvider.parameters.factorKgCO2ePerKg, 1);
    assert.equal(result.formulaVersion, 'MOCK_WEIGHT_FACTOR_V1');
    assert.equal(result.idempotencyKey, 'assessment-once');
    assert.equal(result.correlationId, 'trace-001');
    assert.deepEqual(result.evidenceRefs, ['evidence-001']);
    assert.equal(result.wallet, undefined);
    assert.equal(result.carbonCredits, undefined);
    assert.deepEqual(input, Object.assign(request({ weight: '2.5' }), { calculationStatus: 'CONFIRMED' }));
});

test('verified and received weight precedence preserves explicit zero', async () => {
    assert.equal((await impact.calculate(request({ verifiedWeight: 0, receivedWeight: 4 }))).metrics[0].value, '0.000');
    assert.equal((await impact.calculate(request({ receivedWeight: 4 }))).metrics[0].value, '4.000');
    for (const verifiedWeight of ['bad', NaN, Infinity]) {
        await assert.rejects(impact.calculate(request({ verifiedWeight: verifiedWeight, receivedWeight: 4 })), { code: 'ERR_WASTE_IMPACT_INPUT_INVALID' });
    }
});

test('item/category/default factor precedence preserves zero and fails on invalid explicit rules', async () => {
    settings({ mock: { factors: { default: 2, categories: { DEVICE: 3 }, itemTypes: { DEVICE_ITEM: 4 } } } });
    assert.equal((await impact.calculate(request())).metrics[0].value, '8.000');
    assert.equal((await impact.calculate(request({ itemTypeCode: 'OTHER' }))).metrics[0].value, '6.000');
    assert.equal((await impact.calculate(request({ itemTypeCode: 'OTHER', categoryCode: 'OTHER' }))).metrics[0].value, '4.000');
    settings({ mock: { factors: { itemTypes: { DEVICE_ITEM: 0 } } } });
    assert.equal((await impact.calculate(request())).metrics[0].value, '0.000');
    settings({ mock: { factors: { itemTypes: { DEVICE_ITEM: -1 } } } });
    await assert.rejects(impact.calculate(request()), { code: 'ERR_WASTE_IMPACT_CONFIGURATION_INVALID' });
});

test('quantity estimation requires a configured weight and records its complete basis', async () => {
    const input = request({ weight: undefined, quantity: 3 });
    await assert.rejects(impact.calculate(input), { code: 'ERR_WASTE_IMPACT_INPUT_INVALID' });
    settings({ mock: { factors: { default: 2 }, defaultWeightsKg: { categories: { DEVICE: 0.5 } } } });
    const result = await impact.calculate(input);
    assert.equal(result.metrics[0].value, '3.000');
    assert.deepEqual(result.metadata.impactProvider.input, {
        weightKg: 1.5, weightSource: 'QUANTITY_DEFAULT_WEIGHT', quantity: 3,
        defaultUnitWeightKg: 0.5, defaultWeightSource: 'categories:DEVICE', itemTypeCode: 'DEVICE_ITEM', categoryCode: 'DEVICE'
    });
    const fingerprint = result.metadata.impactProvider.configurationFingerprint;
    settings({ mock: { defaultWeightsKg: { categories: { DEVICE: 0.7 } } } });
    const changed = await impact.calculate(input);
    assert.notEqual(changed.metadata.impactProvider.configurationFingerprint, fingerprint);
    assert.equal(result.metadata.impactProvider.input.weightKg, 1.5);
    settings({ mock: { missingWeightMode: 'ERROR' } });
    await assert.rejects(impact.calculate(input), { code: 'ERR_WASTE_IMPACT_INPUT_INVALID' });
});

test('invalid numbers, units, quantities and absent factors never become invented estimates', async () => {
    for (const value of [-1, NaN, Infinity, '', 'bad', true, {}, '0x10']) {
        await assert.rejects(impact.calculate(request({ weight: value })), { code: 'ERR_WASTE_IMPACT_INPUT_INVALID' });
    }
    await assert.rejects(impact.calculate(request({ weightUnit: 'G' })), { code: 'ERR_WASTE_IMPACT_INPUT_INVALID' });
    settings({ mock: { defaultWeightsKg: { default: 1 } } });
    for (const value of [0, -2, null, undefined, true]) {
        await assert.rejects(impact.calculate(request({ weight: undefined, quantity: value })), { code: 'ERR_WASTE_IMPACT_INPUT_INVALID' });
    }
    settings({ mock: { factors: { default: null } } });
    await assert.rejects(impact.calculate(request()), { code: 'ERR_WASTE_IMPACT_INPUT_INVALID' });
});

test('rounding is configurable and handles decimal boundaries', async () => {
    settings({ mock: { precision: 2 } });
    assert.equal((await impact.calculate(request({ weight: 1.005 }))).metrics[0].value, '1.01');
    assert.equal((await impact.calculate(request({ weight: 2.675 }))).metrics[0].value, '2.68');
    settings({ mock: { roundingMode: 'FLOOR' } });
    assert.equal((await impact.calculate(request({ weight: 1.009 }))).metrics[0].value, '1.00');
    settings({ mock: { roundingMode: 'CEIL' } });
    assert.equal((await impact.calculate(request({ weight: 1.001 }))).metrics[0].value, '1.01');
    settings({ mock: { factors: { default: 0.2 } } });
    assert.equal((await impact.calculate(request({ weight: 0.1 }))).metrics[0].value, '0.02');
    settings({ mock: { factors: { default: 3 }, roundingMode: 'FLOOR' } });
    assert.equal((await impact.calculate(request({ weight: 0.3 }))).metrics[0].value, '0.90');
    settings({ mock: { factors: { default: 1 }, defaultWeightsKg: { default: 0.1 }, roundingMode: 'CEIL' } });
    assert.equal((await impact.calculate(request({ weight: undefined, quantity: 3 }))).metrics[0].value, '0.30');
    await assert.rejects(impact.calculate(request({ weight: Number.MAX_VALUE })), { code: 'ERR_WASTE_IMPACT_INPUT_INVALID' });
});

test('successive configuration deltas change behavior without copying defaults or a Circa dependency', async () => {
    for (const [layer, factor] of [['project', 2], ['environment', 3], ['server', 4], ['node', 5]]) {
        settings({ mock: { factors: { categories: { DEVICE: factor } }, factorSetVersion: layer } });
        const result = await impact.calculate(request());
        assert.equal(result.metrics[0].value, (2 * factor).toFixed(3));
        assert.equal(result.metadata.impactProvider.parameters.factorSetVersion, layer);
        assert.equal(CONFIG.get('wasteImpact').calculation.mock.roundingMode, 'HALF_UP');
    }
    assert.equal(defaults.wasteImpact.calculation.mock.factors.default, 1);
    assert.deepEqual(defaults.wasteImpact.calculation.mock.factors.categories, {});
});

test('trusted runtime tenant selects effective configuration while body spoofing cannot', async () => {
    CONFIG.setProperties(_.cloneDeep(defaults), 'runtimeA');
    CONFIG.setProperties(_.cloneDeep(defaults), 'runtimeB');
    settings({ mock: { factors: { default: 2 } } }, 'runtimeA');
    settings({ mock: { factors: { default: 7 } } }, 'runtimeB');
    global.FACADE = { DefaultWasteInternalFacade: facade };
    const body = Object.assign(request(), { tenant: 'runtimeB', providerService: 'EvilProvider', runtimeContext: { tenant: 'runtimeB' } });
    const result = await controller.calculateImpact({ authData: { tenant: 'runtimeA' }, httpRequest: { body: body } });
    assert.equal(result.data.metrics[0].value, '4.000');
    assert.equal((await impact.calculate(request(), { tenant: 'runtimeB' })).metrics[0].value, '14.000');
    assert.equal((await impact.calculate(body)).metrics[0].value, '2.000');
    await assert.rejects(impact.calculate(request(), { tenant: 'unconfigured' }), { code: 'ERR_WASTE_IMPACT_CONFIGURATION_INVALID' });
});

test('configuration and request changes during an assessment do not rewrite its snapshot', async () => {
    const input = request();
    const pending = impact.calculate(input);
    settings({ mock: { factors: { default: 8 } } });
    input.facts.weight = 9;
    input.evidenceRefs.push('later-evidence');
    const original = await pending;
    const later = await impact.calculate(input);
    assert.equal(original.metrics[0].value, '2.000');
    assert.equal(later.metrics[0].value, '72.000');
    assert.deepEqual(original.evidenceRefs, ['evidence-001']);
    assert.notEqual(original.metadata.impactProvider.configurationFingerprint, later.metadata.impactProvider.configurationFingerprint);
    assert.notEqual(original.metadata.impactProvider.inputFingerprint, later.metadata.impactProvider.inputFingerprint);
});

test('same inputs/settings produce stable fingerprints while retaining caller idempotency', async () => {
    const first = await impact.calculate(request());
    const second = await impact.calculate(request());
    assert.deepEqual(first.metadata, second.metadata);
    assert.equal(first.idempotencyKey, second.idempotencyKey);
    assert.notEqual(first.metadata, second.metadata);
});

test('a selected async provider replaces the mock without changing facade or result consumers', async () => {
    let invocation;
    SERVICE.PartnerImpactService = { calculate: async function (input, context) {
        invocation = { input, context };
        return Object.assign(providerResponse(), { rawResponse: 'not-exposed', accessToken: 'not-exposed' });
    } };
    settings({ providerService: 'PartnerImpactService' });
    const result = await facade.calculateImpact({ payload: request(), idempotencyKey: 'header-key' });
    assert.equal(result.metrics[0].value, '7.250');
    assert.equal(result.calculationStatus, 'CONFIRMED');
    assert.equal(result.metadata.impactProvider.isMock, false);
    assert.equal(result.metadata.impactProvider.assessmentRef, 'assessment-external-001');
    assert.equal(result.metadata.impactProvider.publicClaimAllowed, false);
    assert.equal(invocation.input.idempotencyKey, 'header-key');
    assert.equal(invocation.context.signal.aborted, false);
    assert(Object.isFrozen(invocation.context.settings));
    assert(!JSON.stringify(result).includes('not-exposed'));
});

test('the effective calculation service and a partial mock method override are honored', async () => {
    SERVICE.DefaultWasteImpactMockProviderService.weight = function () { return { weightKg: 3, weightSource: 'TEST_OVERRIDE' }; };
    assert.equal((await impact.calculate(request())).metrics[0].value, '3.000');
    SERVICE.DefaultWasteImpactCalculationService.calculate = async function (input, context) {
        return { overridden: true, key: input.idempotencyKey, runtime: context.tenant };
    };
    assert.deepEqual(await facade.calculateImpact({ tenant: 'runtimeA', payload: request(), idempotencyKey: 'trusted-key' }),
        { overridden: true, key: 'trusted-key', runtime: 'runtimeA' });
});

test('a missing registered provider never falls back to mock', async () => {
    settings({ providerService: 'MissingProvider' });
    await assert.rejects(impact.calculate(request()), { code: 'ERR_WASTE_IMPACT_PROVIDER_UNAVAILABLE' });
});

test('provider timeouts abort cooperative adapters and clear assessment execution', async () => {
    let signal;
    SERVICE.SlowProvider = { calculate: function (input, context) {
        signal = context.signal;
        return new Promise(() => {});
    } };
    settings({ providerService: 'SlowProvider', timeoutMs: 10 });
    await assert.rejects(impact.calculate(request()), { code: 'ERR_WASTE_IMPACT_PROVIDER_TIMEOUT' });
    assert.equal(signal.aborted, true);
});

test('raw provider failures are normalized and the configured failed-result mode is explicit', async () => {
    SERVICE.FailedProvider = { calculate: async function () { throw new Error('secret-should-not-leak'); } };
    settings({ providerService: 'FailedProvider' });
    await assert.rejects(impact.calculate(request()), error => error.code === 'ERR_WASTE_IMPACT_PROVIDER_FAILED' && !error.message.includes('secret'));
    settings({ failureMode: 'RESULT' });
    const result = await impact.calculate(Object.assign(request(), { calculationStatus: 'CONFIRMED' }));
    assert.equal(result.calculationStatus, 'FAILED');
    assert.deepEqual(result.metrics, []);
    assert.equal(result.metadata.impactProvider.errorCode, 'ERR_WASTE_IMPACT_PROVIDER_FAILED');
    assert(!JSON.stringify(result).includes('secret'));
});

test('malformed provider metrics and missing identity fail instead of creating valid assessments', async () => {
    settings({ providerService: 'InvalidProvider' });
    for (const value of [null, {}, Object.assign(providerResponse(), { provider: {} }),
        Object.assign(providerResponse(), { metrics: [{ metricCode: 'CO2E', unitOfMeasure: 'KG_CO2E', value: true }] }),
        Object.assign(providerResponse(), { metrics: [{ metricCode: 'CO2E', unitOfMeasure: 'KG_CO2E', value: -1 }] }),
        Object.assign(providerResponse(), { metrics: [...providerResponse().metrics, ...providerResponse().metrics] })]) {
        SERVICE.InvalidProvider = { calculate: async function () { return value; } };
        await assert.rejects(impact.calculate(request()), { code: 'ERR_WASTE_IMPACT_PROVIDER_RESULT_INVALID' });
    }
});

test('mock identity cannot be promoted by the requested or returned calculation status', async () => {
    SERVICE.PromotedMock = { calculate: async function () { const r = providerResponse(); r.provider.isMock = true; return r; } };
    settings({ providerService: 'PromotedMock' });
    const result = await impact.calculate(Object.assign(request(), { calculationStatus: 'CONFIRMED' }));
    assert.equal(result.calculationStatus, 'ESTIMATED');
    assert.equal(result.metadata.impactProvider.publicClaimAllowed, false);
});

test('invalid provider and precision configuration is rejected explicitly', async () => {
    for (const delta of [{ timeoutMs: 0 }, { timeoutMs: 2147483648 }, { failureMode: 'SILENT_MOCK' }, { providerService: '' }]) {
        CONFIG.setProperties(_.cloneDeep(defaults));
        settings(delta);
        await assert.rejects(impact.calculate(request()), { code: 'ERR_WASTE_IMPACT_CONFIGURATION_INVALID' });
    }
    for (const delta of [{ precision: -1 }, { precision: 13 }, { precision: 1.5 }, { roundingMode: 'UNKNOWN' }, { missingWeightMode: 'GUESS' }]) {
        CONFIG.setProperties(_.cloneDeep(defaults));
        settings({ mock: delta });
        await assert.rejects(impact.calculate(request()), { code: 'ERR_WASTE_IMPACT_CONFIGURATION_INVALID' });
    }
});

/** Configures metric display mappings without adding any numerical coefficients. */
function environmentalMappings() {
    return { enabled: true, version: 'TEST_ENV_V1', indicators: {
        avoidedEmissions: { metricCode: 'ESTIMATED_CO2E_SAVED_KG', label: 'Avoided emissions', unitOfMeasure: 'KG_CO2E', requirements: ['Applicable factors'] },
        waterSaved: { metricCode: 'WATER_SAVED_L', label: 'Water saved', unitOfMeasure: 'L', requirements: ['Water assessment'] },
        netBenefit: { metricCode: 'NET_BENEFIT_KG_CO2E', label: 'Net emissions benefit', unitOfMeasure: 'KG_CO2E', allowNegative: true, requirements: ['Baseline and intervention'] }
    } };
}

test('environmental disclosure keeps simulations, missing values and credit issuance distinct', async () => {
    settings({ environmentalAssessment: environmentalMappings() });
    const result = await impact.calculate(request());
    const assessment = result.metadata.environmentalAssessment;
    assert.equal(assessment.status, 'ILLUSTRATIVE');
    assert.equal(assessment.indicators[0].value, '2.000');
    assert.equal(assessment.indicators[0].status, 'ILLUSTRATIVE');
    assert.equal(assessment.indicators[1].value, null);
    assert.equal(assessment.indicators[1].status, 'NOT_ASSESSED');
    assert.equal(assessment.carbonCredits.issuedQuantity, null);
    assert.equal(assessment.carbonCredits.status, 'NOT_ASSESSED');
    assert.equal(assessment.publicClaimAllowed, false);
    assert.equal(result.metrics.length, 1, 'Missing indicators must not create metric values');
});

test('provider customization preserves zero, signed net benefit and bounded methodology without credit claims', async () => {
    const response = providerResponse();
    response.metrics = [{ metricCode: 'WATER_SAVED_L', value: '0', unitOfMeasure: 'L' },
        { metricCode: 'NET_BENEFIT_KG_CO2E', value: '-2.500', unitOfMeasure: 'KG_CO2E' }];
    response.geography = 'Provider-assessed region';
    response.systemBoundary = 'Collection through treatment';
    response.secret = 'must-not-be-retained';
    response.carbonCredits = { issuedQuantity: 100 };
    global.SERVICE.EnvironmentTestProvider = { calculate: async () => response };
    settings({ providerService: 'EnvironmentTestProvider', environmentalAssessment: environmentalMappings() });
    const result = await impact.calculate(request());
    const assessment = result.metadata.environmentalAssessment;
    assert.equal(assessment.indicators[1].value, '0');
    assert.equal(assessment.indicators[1].status, 'CONFIRMED');
    assert.equal(assessment.indicators[2].value, '-2.500');
    assert.equal(assessment.methodology.geography, response.geography);
    assert.equal(assessment.methodology.systemBoundary, response.systemBoundary);
    assert.equal(assessment.carbonCredits.issuedQuantity, null);
    assert(!JSON.stringify(result).includes('must-not-be-retained'));
    response.metrics[0].value = '-1';
    await assert.rejects(impact.calculate(request()), { code: 'ERR_WASTE_IMPACT_PROVIDER_RESULT_INVALID' });
    response.metrics[0].value = '0'; response.metrics[0].unitOfMeasure = 'KG';
    await assert.rejects(impact.calculate(request()), { code: 'ERR_WASTE_IMPACT_PROVIDER_RESULT_INVALID' });
});

test('failed assessment and legacy formulas retain explicit environmental states without invented values', async () => {
    settings({ providerService: 'MissingEnvironmentProvider', failureMode: 'RESULT', environmentalAssessment: environmentalMappings() });
    const failed = await impact.calculate(request());
    assert.equal(failed.metadata.environmentalAssessment.status, 'FAILED');
    assert(failed.metadata.environmentalAssessment.indicators.every(item => item.value === null && item.status === 'FAILED'));
    const input = request();
    input.profile = { code: 'static', formulaType: 'STATIC_FACTOR', metricRules: [{ metricCode: 'WATER_SAVED_L', factor: 0, unitOfMeasure: 'L' }] };
    const legacy = impact.calculate(input);
    assert.equal(legacy.metadata.environmentalAssessment.indicators[1].value, '0');
    assert.equal(legacy.metadata.environmentalAssessment.indicators[1].status, 'ESTIMATED');
    const invalid = environmentalMappings(); invalid.indicators.waterSaved.unitOfMeasure = 'invalid unit';
    settings({ environmentalAssessment: invalid });
    assert.throws(() => impact.calculate(input), { code: 'ERR_WASTE_IMPACT_CONFIGURATION_INVALID' });
});
