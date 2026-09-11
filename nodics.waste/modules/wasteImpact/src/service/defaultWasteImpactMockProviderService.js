/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const VOCABULARY = require('../utils/vocabulary').wasteImpact;

/**
 * @module wasteImpact/src/service/defaultWasteImpactMockProviderService
 * @description Computes deterministic, explicitly simulated kgCO2e estimates. Inputs are
 * reviewed facts and a snapshot of layered settings; no network, persistence or wallet
 * effects occur. Invalid/missing inputs throw module-owned errors.
 * @layer service
 * @owner wasteImpact
 * @override Later modules may override individual methods or select another registered
 * provider service. Numerical factors and weights belong in config/properties.js.
 */
module.exports = {
    /** Creates a typed validation error; does not disclose credentials or input payloads. */
    fail: function (code, message) {
        const error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ?
            new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },

    /**
     * Parses a finite nonnegative decimal number. Zero is a value, never a missing input.
     * @param {number|string} value Configuration or fact value.
     * @param {string} code Owning error code for an invalid value.
     * @returns {number} Parsed value; throws for booleans, blank, null, NaN or infinity.
     */
    number: function (value, code) {
        if (typeof value !== 'number' &&
            !(typeof value === 'string' && /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()))) {
            this.fail(code, 'A finite nonnegative decimal value is required');
        }
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 0) this.fail(code, 'A finite nonnegative decimal value is required');
        return parsed;
    },

    /**
     * Resolves an explicit item-type, category, then default rule without inherited keys.
     * @param {Object} table Layered rule table with itemTypes/categories/default members.
     * @param {Object} facts Item/category codes from the assessed facts.
     * @returns {Object} Selected value and its lookup provenance; missing rules fail.
     */
    rule: function (table, facts) {
        if (!table || typeof table !== 'object' || Array.isArray(table)) {
            this.fail('ERR_WASTE_IMPACT_CONFIGURATION_INVALID', 'A calculation rule table is required');
        }
        for (const [group, key] of [['itemTypes', facts.itemTypeCode], ['categories', facts.categoryCode]]) {
            const entries = table[group];
            if (entries !== undefined && (!entries || typeof entries !== 'object' || Array.isArray(entries))) {
                this.fail('ERR_WASTE_IMPACT_CONFIGURATION_INVALID', 'Calculation rule groups must be objects');
            }
            if (key !== undefined && (typeof key !== 'string' || !key.trim())) {
                this.fail('ERR_WASTE_IMPACT_INPUT_INVALID', 'Item and category codes must be nonempty strings');
            }
            if (key && entries && Object.prototype.hasOwnProperty.call(entries, key)) {
                return { value: entries[key], source: group + ':' + key };
            }
        }
        if (Object.prototype.hasOwnProperty.call(table, 'default') && table.default !== null && table.default !== undefined) {
            return { value: table.default, source: 'default' };
        }
        this.fail('ERR_WASTE_IMPACT_INPUT_INVALID', 'No configured calculation rule matches these facts');
    },

    /**
     * Resolves verified, received, then submitted weight in kilograms. If absent, uses
     * quantity times an explicitly configured unit weight when policy allows it.
     * @param {Object} facts Input facts; all supplied weights use weightUnit KG or omitted.
     * @param {Object} settings Effective mock configuration snapshot.
     * @returns {Object} Weight and its assessed/estimated basis; invalid facts fail.
     */
    weight: function (facts, settings) {
        if (facts.weightUnit !== undefined && facts.weightUnit !== 'KG') {
            this.fail('ERR_WASTE_IMPACT_INPUT_INVALID', 'Normalize input weight to KG before calculation');
        }
        for (const field of ['verifiedWeight', 'receivedWeight', 'weight']) {
            if (facts[field] !== undefined && facts[field] !== null) {
                return { weightKg: this.number(facts[field], 'ERR_WASTE_IMPACT_INPUT_INVALID'), weightSource: field };
            }
        }
        if (settings.missingWeightMode !== 'ESTIMATE_FROM_QUANTITY') {
            this.fail('ERR_WASTE_IMPACT_INPUT_INVALID', 'Weight is required by calculation policy');
        }
        const quantity = this.number(facts.quantity, 'ERR_WASTE_IMPACT_INPUT_INVALID');
        if (quantity <= 0) this.fail('ERR_WASTE_IMPACT_INPUT_INVALID', 'A positive quantity is required to estimate weight');
        const selected = this.rule(settings.defaultWeightsKg, facts);
        const unitWeight = this.number(selected.value, 'ERR_WASTE_IMPACT_CONFIGURATION_INVALID');
        if (unitWeight <= 0) this.fail('ERR_WASTE_IMPACT_CONFIGURATION_INVALID', 'Default unit weight must be positive');
        const product = this.decimalProduct(quantity, unitWeight);
        return {
            weightKg: this.number(Number(product.coefficient.toString() + 'e' + product.exponent), 'ERR_WASTE_IMPACT_INPUT_INVALID'),
            weightSource: 'QUANTITY_DEFAULT_WEIGHT', quantity: quantity,
            defaultUnitWeightKg: unitWeight, defaultWeightSource: selected.source
        };
    },

    /**
     * Converts a validated number's decimal representation into coefficient/exponent.
     * @returns {Object} Exact decimal components used only in this calculation; no state.
     */
    decimal: function (value) {
        this.number(value, 'ERR_WASTE_IMPACT_INPUT_INVALID');
        const parts = value.toString().toLowerCase().split('e');
        const fraction = parts[0].split('.');
        return {
            coefficient: BigInt(fraction.join('')),
            exponent: Number(parts[1] || 0) - (fraction[1] || '').length
        };
    },

    /** Multiplies decimal inputs without introducing binary floating-point artifacts. */
    decimalProduct: function (left, right) {
        const first = this.decimal(left);
        const second = this.decimal(right);
        return { coefficient: first.coefficient * second.coefficient, exponent: first.exponent + second.exponent };
    },

    /**
     * Multiplies then rounds nonnegative decimal inputs using the configured mode.
     * @returns {string} Fixed decimal representation; unsafe scaled magnitudes fail.
     * Exact coefficient arithmetic handles both half-up ties and floor/ceil boundaries.
     */
    roundedValue: function (weight, factor, precision, mode) {
        const product = this.decimalProduct(weight, factor);
        const exponent = product.exponent + precision;
        let scaled;
        if (exponent >= 0) {
            scaled = product.coefficient * (10n ** BigInt(exponent));
        } else {
            const divisor = 10n ** BigInt(-exponent);
            scaled = product.coefficient / divisor;
            const remainder = product.coefficient % divisor;
            if ((mode === 'CEIL' && remainder > 0n) || (mode === 'HALF_UP' && remainder * 2n >= divisor)) scaled += 1n;
        }
        if (scaled > BigInt(Number.MAX_SAFE_INTEGER)) {
            this.fail('ERR_WASTE_IMPACT_INPUT_INVALID', 'Impact result exceeds supported numerical precision');
        }
        const digits = scaled.toString().padStart(precision + 1, '0');
        return precision === 0 ? digits : digits.slice(0, -precision) + '.' + digits.slice(-precision);
    },

    /**
     * Calculates weight times an illustrative factor without issuing carbon credits.
     * @param {Object} request Facts and profile/source/evidence context from wasteImpact.
     * @param {Object} context Immutable settings snapshot and optional cancellation signal.
     * @returns {Object} Provider response with metrics, mock identity and calculation basis.
     * @throws Typed errors for missing rules, invalid numbers or unsupported settings.
     */
    calculate: function (request, context) {
        const settings = context && context.settings && context.settings.mock;
        if (!settings || !Number.isInteger(settings.precision) || settings.precision < 0 || settings.precision > 12 ||
            !VOCABULARY.roundingModes.includes(settings.roundingMode) ||
            !VOCABULARY.missingWeightModes.includes(settings.missingWeightMode) ||
            typeof settings.factorSetVersion !== 'string' || !settings.factorSetVersion.trim() ||
            typeof settings.metricCode !== 'string' || !settings.metricCode.trim()) {
            this.fail('ERR_WASTE_IMPACT_CONFIGURATION_INVALID', 'Mock calculation settings are incomplete or invalid');
        }
        const facts = request.facts || {};
        const selected = this.rule(settings.factors, facts);
        const factor = this.number(selected.value, 'ERR_WASTE_IMPACT_CONFIGURATION_INVALID');
        const input = this.weight(facts, settings);
        const value = this.roundedValue(input.weightKg, factor, settings.precision, settings.roundingMode);
        return {
            provider: { code: VOCABULARY.mockProviderCode, version: VOCABULARY.mockProviderVersion, isMock: true },
            formulaVersion: VOCABULARY.mockFormulaVersion,
            calculationStatus: VOCABULARY.statuses.estimated,
            metrics: [{ metricCode: settings.metricCode, value: value, unitOfMeasure: VOCABULARY.carbonUnit, basis: VOCABULARY.mockFormulaVersion }],
            calculation: {
                input: Object.assign({}, input, { itemTypeCode: facts.itemTypeCode, categoryCode: facts.categoryCode }),
                parameters: {
                    factorKgCO2ePerKg: factor, factorSource: selected.source,
                    factorSetVersion: settings.factorSetVersion,
                    precision: settings.precision, roundingMode: settings.roundingMode,
                    defaultUnitWeightKg: input.defaultUnitWeightKg, defaultWeightSource: input.defaultWeightSource
                }
            }
        };
    }
};
