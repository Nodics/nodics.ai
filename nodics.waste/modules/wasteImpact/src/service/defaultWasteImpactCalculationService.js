/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const SOURCE_REF = require('../../../wasteCore/src/service/defaultWasteSourceReferenceService');

/** @module wasteImpact/src/service/defaultWasteImpactCalculationService @description Calculates simple profile-driven Waste impact results from verified or received facts. @layer service @owner wasteImpact @override Partner modules may replace formula handling while preserving versioned metric result shape. */
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

    /** Builds an impact result without asserting public claim validity. */
    calculate: function (request) {
        request = request || {};
        let profile = request.profile || {};
        if (!profile.code || !profile.formulaType) this.fail('ERR_WASTE_IMPACT_PROFILE_INVALID', 'impact profile code and formula type are required');
        let sourceRef = SOURCE_REF.normalize(request.sourceRef, true);
        return {
            code: request.resultCode,
            sourceRef: sourceRef,
            profileCode: profile.code,
            metrics: this.metrics(profile, request.facts || {}),
            calculationStatus: request.calculationStatus || 'ESTIMATED',
            calculatedAt: request.now || new Date(),
            evidenceRefs: request.evidenceRefs || [],
            confidence: request.confidence,
            formulaVersion: profile.revision === undefined ? undefined : String(profile.revision),
            correlationId: request.correlationId,
            idempotencyKey: request.idempotencyKey,
            revision: 0
        };
    }
};
