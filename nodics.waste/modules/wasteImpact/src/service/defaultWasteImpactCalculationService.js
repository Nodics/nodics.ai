/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const SOURCE_REF = require('../../../wasteCore/src/service/defaultWasteSourceReferenceService');
const CRYPTO = require('node:crypto');
const DEFAULTS = require('../../config/properties');
const VOCABULARY = require('../utils/vocabulary').wasteImpact;
const STATUS = require('../utils/statusDefinitions');

/**
 * @module wasteImpact/src/service/defaultWasteImpactCalculationService
 * @description Calculates profile-driven impact or dispatches to a configured registered
 * provider. Accepts source/profile/facts/evidence, returns a versioned assessment, and
 * performs no persistence, wallet posting or credit issuance. External-provider work is
 * asynchronous, bounded by timeout and normalized failure policy.
 * @layer service
 * @owner wasteImpact
 * @override Later modules may replace exported methods through the service loader and
 * override wasteImpact.calculation through the standard effective CONFIG hierarchy.
 */
module.exports = {
    /** Initializes this service. */
    init: function () { return Promise.resolve(true); },

    /** Completes this service startup. */
    postInit: function () { return Promise.resolve(true); },

    /** Throws a Nodics-compatible error when available. */
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },

    /** Resolves the numeric input for a formula type. */
    inputValue: function (profile, facts) {
        if (profile.formulaType === 'STATIC_FACTOR') return 1;
        if (profile.formulaType === 'WEIGHT_FACTOR') return Number(facts.weight || facts.receivedWeight || facts.verifiedWeight || 0);
        if (profile.formulaType === 'QUANTITY_FACTOR') return Number(facts.quantity || facts.receivedQuantity || facts.verifiedQuantity || 0);
        this.fail('ERR_WASTE_IMPACT_FORMULA_UNSUPPORTED', 'impact formula type requires partner/provider implementation');
    },

    /** Calculates metric values from a static, weight, or quantity profile. */
    metrics: function (profile, facts) {
        let input = this.inputValue(profile, facts || {});
        return (profile.metricRules || []).map(function (rule) {
            let factor = Number(rule.factor === undefined ? 1 : rule.factor);
            return {
                metricCode: rule.metricCode,
                value: String(input * factor),
                unitOfMeasure: rule.unitOfMeasure,
                basis: profile.formulaType
            };
        });
    },

    /**
     * Detaches JSON contract values from mutable caller/configuration objects.
     * @returns {*} Independent snapshot; invalid serialization fails without payload logs.
     */
    snapshot: function (value, errorCode) {
        try {
            return JSON.parse(JSON.stringify(value, function (key, entry) {
                // JSON would silently turn NaN/Infinity into null and permit fallback.
                if (typeof entry === 'number' && !Number.isFinite(entry)) throw new TypeError('Nonfinite value');
                return entry;
            }));
        } catch (_) {
            this.fail(errorCode || 'ERR_WASTE_IMPACT_INPUT_INVALID', 'Impact inputs and configuration must be finite JSON values');
        }
    },

    /** Freezes a detached contract recursively; does not mutate effective CONFIG. */
    freeze: function (value) {
        if (value && typeof value === 'object') {
            Object.values(value).forEach(item => this.freeze(item));
            Object.freeze(value);
        }
        return value;
    },

    /**
     * Reads the effective merged configuration once per assessment. Standalone service
     * tests may use the same declared module defaults when no runtime CONFIG exists.
     * @returns {Object} Detached immutable provider settings; invalid selection fails.
     */
    settings: function (runtimeContext) {
        const tenant = runtimeContext && runtimeContext.tenant;
        if (tenant !== undefined && (typeof tenant !== 'string' || !tenant.trim())) {
            this.fail('ERR_WASTE_IMPACT_CONFIGURATION_INVALID', 'Trusted runtime tenant must be a nonempty string');
        }
        const effective = typeof CONFIG !== 'undefined' && CONFIG && typeof CONFIG.get === 'function' ?
            CONFIG.get('wasteImpact', tenant) : tenant === undefined ? DEFAULTS.wasteImpact : undefined;
        const settings = effective && effective.calculation;
        if (!settings || typeof settings.providerService !== 'string' || !settings.providerService.trim() ||
            !Number.isInteger(settings.timeoutMs) || settings.timeoutMs < 1 || settings.timeoutMs > 2147483647 ||
            !VOCABULARY.failureModes.includes(settings.failureMode)) {
            this.fail('ERR_WASTE_IMPACT_CONFIGURATION_INVALID', 'Provider service, timeout and failure mode must be configured');
        }
        return this.freeze(this.snapshot(settings, 'ERR_WASTE_IMPACT_CONFIGURATION_INVALID'));
    },

    /** Resolves the selected loader-owned service; never requires caller-selected files. */
    provider: function (settings) {
        const provider = typeof SERVICE !== 'undefined' && SERVICE ? SERVICE[settings.providerService] : undefined;
        if (!provider || typeof provider.calculate !== 'function' || provider === this) {
            this.fail('ERR_WASTE_IMPACT_PROVIDER_UNAVAILABLE', STATUS.ERR_WASTE_IMPACT_PROVIDER_UNAVAILABLE.message);
        }
        return provider;
    },

    /**
     * Calls a provider with detached inputs and a cancellation signal. A timeout aborts
     * cooperative adapters; no automatic retries or fallback to the mock occur.
     * @returns {Promise<Object>} Provider response. Timer resources are always released.
     */
    invokeProvider: async function (provider, request, settings, runtimeContext) {
        const controller = new AbortController();
        let timer;
        try {
            return await Promise.race([
                Promise.resolve().then(() => provider.calculate(request, { settings: settings, signal: controller.signal, runtimeContext: runtimeContext })),
                new Promise((resolve, reject) => {
                    timer = setTimeout(() => {
                        // Establish the timeout result before notifying a cooperative adapter.
                        const error = new Error(STATUS.ERR_WASTE_IMPACT_PROVIDER_TIMEOUT.message);
                        error.code = 'ERR_WASTE_IMPACT_PROVIDER_TIMEOUT';
                        reject(error);
                        controller.abort();
                    }, settings.timeoutMs);
                })
            ]);
        } finally { clearTimeout(timer); }
    },

    /** Returns a deterministic JSON representation for assessment/configuration hashes. */
    canonical: function (value) {
        if (Array.isArray(value)) return '[' + value.map(item => this.canonical(item)).join(',') + ']';
        if (value && typeof value === 'object') {
            return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + this.canonical(value[key])).join(',') + '}';
        }
        return JSON.stringify(value);
    },

    /** Hashes a detached JSON value without retaining raw provider configuration/secrets. */
    fingerprint: function (value) {
        return CRYPTO.createHash('sha256').update(this.canonical(value)).digest('hex');
    },

    /** Copies only bounded scalar provenance fields; arbitrary adapter payloads are omitted. */
    provenanceFields: function (source, fields) {
        const result = {};
        fields.forEach(field => {
            const value = source && source[field];
            if ((typeof value === 'number' && Number.isFinite(value)) || typeof value === 'boolean' ||
                (typeof value === 'string' && value.length <= 512)) result[field] = value;
        });
        return result;
    },

    /**
     * Validates optional display mappings over provider-owned metric codes. These
     * mappings contain no coefficients and cannot calculate or certify a metric.
     * @returns {Array<Object>} Bounded definitions from trusted layered settings.
     */
    environmentalIndicators: function (settings) {
        const config = settings && settings.environmentalAssessment;
        if (!config || config.enabled !== true) return [];
        if (typeof config.version !== 'string' || !config.version.trim() || config.version.length > 80 ||
            !config.indicators || typeof config.indicators !== 'object' || Array.isArray(config.indicators) ||
            Object.keys(config.indicators).length > 32) {
            this.fail('ERR_WASTE_IMPACT_CONFIGURATION_INVALID', 'Environmental indicator mappings are invalid');
        }
        const codes = new Set();
        return Object.entries(config.indicators).map(([key, definition]) => {
            if (!/^[a-zA-Z][a-zA-Z0-9]{0,63}$/.test(key) || !definition ||
                typeof definition.metricCode !== 'string' || !/^[A-Z][A-Z0-9_]{0,79}$/.test(definition.metricCode) ||
                codes.has(definition.metricCode) || typeof definition.label !== 'string' || !definition.label.trim() || definition.label.length > 120 ||
                typeof definition.unitOfMeasure !== 'string' || !/^[A-Z][A-Z0-9_]{0,31}$/.test(definition.unitOfMeasure) ||
                (definition.allowNegative !== undefined && typeof definition.allowNegative !== 'boolean') ||
                !Array.isArray(definition.requirements) || definition.requirements.length > 8 ||
                definition.requirements.some(value => typeof value !== 'string' || !value.trim() || value.length > 180)) {
                this.fail('ERR_WASTE_IMPACT_CONFIGURATION_INVALID', 'Environmental indicator mappings are invalid');
            }
            codes.add(definition.metricCode);
            return { key, metricCode: definition.metricCode, label: definition.label, unitOfMeasure: definition.unitOfMeasure,
                allowNegative: definition.allowNegative === true, requirements: definition.requirements.slice() };
        });
    },

    /**
     * Adds environmental disclosure to the existing result without creating another
     * calculation, persistence record or credit ledger. Missing values stay null;
     * absent issuance evidence cannot become zero credits or a conversion from CO2e.
     * @returns {Object} Existing result with optional additive assessment metadata.
     */
    withEnvironmentalAssessment: function (result, settings) {
        const definitions = this.environmentalIndicators(settings);
        if (!definitions.length) return result;
        const provider = result.metadata && result.metadata.impactProvider || {};
        const states = VOCABULARY.environmentalStatuses;
        const status = result.calculationStatus === states.failed ? states.failed :
            provider.isMock === true ? states.illustrative :
                [states.estimated, states.confirmed, states.recalculated].includes(result.calculationStatus) ? result.calculationStatus : states.not_assessed;
        const indicators = definitions.map(definition => {
            const metric = (result.metrics || []).find(value => value.metricCode === definition.metricCode);
            if (metric && (metric.unitOfMeasure !== definition.unitOfMeasure || !Number.isFinite(Number(metric.value)) ||
                (Number(metric.value) < 0 && !definition.allowNegative))) {
                this.fail('ERR_WASTE_IMPACT_PROVIDER_RESULT_INVALID', 'Environmental metric unit or value does not match its declared mapping');
            }
            const available = Boolean(metric) && status !== states.failed;
            return { key: definition.key, metricCode: definition.metricCode, label: definition.label,
                unitOfMeasure: definition.unitOfMeasure, value: available ? String(metric.value) : null,
                status: available ? status : status === states.failed ? states.failed : states.not_assessed,
                basis: available ? metric.basis || result.formulaVersion || null : null,
                requirements: definition.requirements,
                reason: available ? null : status === states.failed ? 'The impact calculation could not be completed.' : 'No calculation is available for this indicator.' };
        });
        const environmentalAssessment = {
            contractVersion: 1, mappingVersion: settings.environmentalAssessment.version,
            status, assessedAt: result.calculatedAt, publicClaimAllowed: false,
            indicators,
            metricEvidence: provider.metricEvidence || [],
            inputs: this.provenanceFields(provider.input, ['weightKg', 'weightSource', 'quantity', 'defaultUnitWeightKg', 'defaultWeightSource', 'weightMinKg', 'weightMaxKg', 'unitWeightMinKg', 'unitWeightMaxKg', 'weightConfidence', 'weightBasis', 'weightAggregation', 'itemTypeCode', 'categoryCode']),
            factors: this.provenanceFields(provider.parameters, ['factorKgCO2ePerKg', 'factorSource', 'factorSetVersion', 'baselineFactor', 'treatmentFactor', 'sourceFactorUnit', 'kgPerShortTon', 'savingsMinKgCO2e', 'savingsMaxKgCO2e', 'energyFactorKWhPerKg', 'energyBaselineFactor', 'energyTreatmentFactor', 'energySourceFactorUnit', 'kWhPerMillionBtu', 'energyMinKWh', 'energyMaxKWh']),
            methodology: Object.assign({ formulaVersion: result.formulaVersion || null, profileCode: result.profileCode,
                providerCode: provider.code || null, providerVersion: provider.version || null, isMock: provider.isMock === true },
                this.provenanceFields(provider, ['assessmentRef', 'methodologyRef', 'geography', 'baselineScenario', 'treatmentScenario', 'systemBoundary', 'referenceYear', 'factorDatasetRef', 'assessmentBasis', 'assessmentLimitation', 'referenceScenarioVersion', 'referenceScenarioExplanation', 'weightReference', 'weightReferenceUrl', 'comparisonReferenceUrl'])),
            carbonCredits: { status: states.not_assessed, issuedQuantity: null, registryReference: null,
                reason: 'Credit eligibility and issuance require separate programme verification and registry evidence. An impact estimate does not issue credits.' }
        };
        return Object.assign({}, result, { metadata: Object.assign({}, result.metadata, { environmentalAssessment }) });
    },

    /**
     * Validates and normalizes the provider protocol, preserving only documented fields.
     * Mock results remain ESTIMATED regardless of caller/provider confirmation requests.
     * @returns {Object} Detached metrics and provenance; malformed results fail closed.
     */
    normalizeProviderResult: function (response, request, settings) {
        const identity = response && response.provider;
        if (!identity || typeof identity.code !== 'string' || !identity.code.trim() ||
            typeof identity.version !== 'string' || !identity.version.trim() || typeof identity.isMock !== 'boolean' ||
            typeof response.formulaVersion !== 'string' || !response.formulaVersion.trim() ||
            !['ESTIMATED', 'CONFIRMED', 'RECALCULATED'].includes(response.calculationStatus) ||
            !Array.isArray(response.metrics) || response.metrics.length === 0) {
            this.fail('ERR_WASTE_IMPACT_PROVIDER_RESULT_INVALID', STATUS.ERR_WASTE_IMPACT_PROVIDER_RESULT_INVALID.message);
        }
        const definitions = this.environmentalIndicators(settings);
        const codes = new Set();
        const metrics = response.metrics.map(metric => {
            if (!metric || typeof metric.metricCode !== 'string' || !metric.metricCode.trim() ||
                codes.has(metric.metricCode) || typeof metric.unitOfMeasure !== 'string' || !metric.unitOfMeasure.trim() ||
                !['number', 'string'].includes(typeof metric.value) ||
                !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(String(metric.value).trim()) ||
                !Number.isFinite(Number(metric.value)) || (Number(metric.value) < 0 && !definitions.some(definition =>
                    definition.metricCode === metric.metricCode && definition.unitOfMeasure === metric.unitOfMeasure && definition.allowNegative))) {
                this.fail('ERR_WASTE_IMPACT_PROVIDER_RESULT_INVALID', STATUS.ERR_WASTE_IMPACT_PROVIDER_RESULT_INVALID.message);
            }
            codes.add(metric.metricCode);
            return { metricCode: metric.metricCode, value: String(metric.value).trim(),
                unitOfMeasure: metric.unitOfMeasure, basis: response.formulaVersion };
        });
        const calculation = response.calculation || {};
        const parameters = this.provenanceFields(calculation.parameters,
            ['factorKgCO2ePerKg', 'factorSource', 'factorSetVersion', 'precision', 'roundingMode', 'defaultUnitWeightKg', 'defaultWeightSource', 'baselineFactor', 'treatmentFactor', 'sourceFactorUnit', 'kgPerShortTon', 'savingsMinKgCO2e', 'savingsMaxKgCO2e', 'energyFactorKWhPerKg', 'energyBaselineFactor', 'energyTreatmentFactor', 'energySourceFactorUnit', 'kWhPerMillionBtu', 'energyMinKWh', 'energyMaxKWh']);
        const provenance = {
            service: settings.providerService,
            code: identity.code, version: identity.version, isMock: identity.isMock,
            // Confirmation is an assessment state, not certification or permission to issue.
            publicClaimAllowed: false,
            input: this.provenanceFields(calculation.input,
                ['weightKg', 'weightSource', 'quantity', 'defaultUnitWeightKg', 'defaultWeightSource', 'itemTypeCode', 'categoryCode', 'weightMinKg', 'weightMaxKg', 'unitWeightMinKg', 'unitWeightMaxKg', 'weightConfidence', 'weightBasis', 'weightAggregation']),
            parameters: parameters,
            configurationFingerprint: this.fingerprint({ service: settings.providerService, provider: {
                code: identity.code, version: identity.version, isMock: identity.isMock
            }, formulaVersion: response.formulaVersion, parameters: parameters }),
            inputFingerprint: this.fingerprint({ sourceRef: request.sourceRef, profile: request.profile, facts: request.facts })
        };
        if (response.metricEvidence !== undefined) {
            if (!Array.isArray(response.metricEvidence) || response.metricEvidence.length > 32) this.fail('ERR_WASTE_IMPACT_PROVIDER_RESULT_INVALID', 'Invalid metric evidence');
            provenance.metricEvidence = response.metricEvidence.map(evidence => {
                if (!codes.has(evidence.metricCode) || !Number.isFinite(evidence.min) || !Number.isFinite(evidence.max) || evidence.min > evidence.max ||
                    typeof evidence.explanation !== 'string' || evidence.explanation.length > 512 ||
                    typeof evidence.sourceUrl !== 'string' || evidence.sourceUrl.length > 2048 || (evidence.sourceUrl && !/^https?:\/\//.test(evidence.sourceUrl)))
                    this.fail('ERR_WASTE_IMPACT_PROVIDER_RESULT_INVALID', 'Invalid metric evidence');
                return { metricCode: evidence.metricCode, min: evidence.min, max: evidence.max, sourceUrl: evidence.sourceUrl, explanation: evidence.explanation };
            });
        }
        if (typeof response.model === 'string') provenance.model = response.model.slice(0, 120);
        Object.assign(provenance, this.provenanceFields(response, ['assessmentRef', 'methodologyRef', 'geography', 'baselineScenario', 'treatmentScenario', 'systemBoundary', 'referenceYear', 'factorDatasetRef', 'assessmentBasis', 'assessmentLimitation', 'referenceScenarioVersion', 'referenceScenarioExplanation', 'weightReference', 'weightReferenceUrl', 'comparisonReferenceUrl']));
        return { metrics: metrics, formulaVersion: response.formulaVersion,
            calculationStatus: identity.isMock ? VOCABULARY.statuses.estimated : response.calculationStatus,
            metadata: { impactProvider: provenance } };
    },

    /**
     * Executes the EXTERNAL_PROVIDER profile using trusted CONFIG, not request settings.
     * @returns {Promise<Object>} Assessment or configured FAILED result. No ledger effects.
     */
    calculateProvider: async function (request, runtimeContext) {
        const context = this.freeze(this.snapshot({ tenant: runtimeContext && runtimeContext.tenant }));
        const settings = this.settings(context);
        const input = this.freeze(this.snapshot({
            sourceRef: request.sourceRef, profile: request.profile, facts: request.facts || {},
            evidenceRefs: request.evidenceRefs || [], idempotencyKey: request.idempotencyKey,
            correlationId: request.correlationId
        }));
        const resultRequest = this.snapshot(request);
        const attempts = [];
        try {
            const fallbacks = settings.fallbackProviderServices || [];
            if (!Array.isArray(fallbacks) || fallbacks.length > 4 || fallbacks.some(name => typeof name !== 'string' || !name.trim()))
                this.fail('ERR_WASTE_IMPACT_CONFIGURATION_INVALID', 'Invalid fallback provider configuration');
            let lastError;
            for (const service of [...new Set([settings.providerService, ...fallbacks])]) {
                const selected = this.freeze({ ...settings, providerService: service });
                try {
                    const response = await this.invokeProvider(this.provider(selected), input, selected, context);
                    const normalized = this.normalizeProviderResult(response, input, selected);
                    if (attempts.length && normalized.metadata.impactProvider.isMock)
                        this.fail('ERR_WASTE_IMPACT_PROVIDER_RESULT_INVALID', 'Mock fallback is prohibited');
                    const result = this.withEnvironmentalAssessment(Object.assign(this.result(resultRequest, normalized.metrics), normalized), selected);
                    result.metadata.impactProvider.attempts = [...attempts, { service, status: 'SUCCEEDED' }];
                    return result;
                } catch (error) {
                    lastError = error;
                    attempts.push({ service, status: 'FAILED', errorCode: Object.prototype.hasOwnProperty.call(STATUS, error?.code) ? error.code : 'ERR_WASTE_IMPACT_PROVIDER_FAILED' });
                }
            }
            throw lastError;
        } catch (error) {
            const code = error && Object.prototype.hasOwnProperty.call(STATUS, error.code) ?
                error.code : 'ERR_WASTE_IMPACT_PROVIDER_FAILED';
            if (settings.failureMode === 'RESULT') {
                return this.withEnvironmentalAssessment(Object.assign(this.result(resultRequest, []), {
                    calculationStatus: VOCABULARY.statuses.failed,
                    metadata: { impactProvider: { service: settings.providerService, errorCode: code, attempts, publicClaimAllowed: false } }
                }), settings);
            }
            this.fail(code, STATUS[code].message);
        }
    },

    /** Builds the existing result envelope from source/profile context, without persistence. */
    result: function (request, metrics) {
        return {
            code: request.resultCode,
            sourceRef: request.sourceRef,
            profileCode: request.profile.code,
            metrics: metrics,
            calculationStatus: request.calculationStatus || 'ESTIMATED',
            calculatedAt: request.now || new Date(),
            evidenceRefs: request.evidenceRefs || [],
            confidence: request.confidence,
            formulaVersion: request.profile.revision === undefined ? undefined : String(request.profile.revision),
            correlationId: request.correlationId,
            idempotencyKey: request.idempotencyKey,
            revision: 0
        };
    },

    /**
     * Calculates built-in formulas synchronously or EXTERNAL_PROVIDER asynchronously.
     * @param {Object} request Source reference, profile, facts, evidence and trace context.
     * @param {Object} runtimeContext Trusted caller runtime envelope (optional tenant), never payload configuration.
     * @returns {Object|Promise<Object>} Versioned impact assessment. Consumers may await
     * either path. CUSTOM_POLICY still requires a later-layer method override.
     */
    calculate: function (request, runtimeContext) {
        request = request || {};
        const profile = request.profile || {};
        if (!profile.code || !profile.formulaType) this.fail('ERR_WASTE_IMPACT_PROFILE_INVALID', 'impact profile code and formula type are required');
        const sourceRef = SOURCE_REF.normalize(request.sourceRef, true);
        const normalized = Object.assign({}, request, { profile: profile, sourceRef: sourceRef });
        if (profile.formulaType === VOCABULARY.externalFormula) return this.calculateProvider(normalized, runtimeContext);
        const result = this.result(normalized, this.metrics(profile, request.facts || {}));
        const effective = typeof CONFIG !== 'undefined' && CONFIG && typeof CONFIG.get === 'function' ?
            CONFIG.get('wasteImpact', runtimeContext && runtimeContext.tenant) : DEFAULTS.wasteImpact;
        return this.withEnvironmentalAssessment(result, effective && effective.calculation);
    }
};
