/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module rulesEvaluation/src/service/defaultRulePropertyResolutionService
 * @description Resolves one consumer property and its approved fallback while enforcing normalized quality/confidence requirements.
 * @layer service
 * @owner rulesEvaluation
 */
module.exports = {
    /** Implements registry as an overrideable service operation. */
    registry: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultRulePropertyCatalogueRegistryService
            ? SERVICE.DefaultRulePropertyCatalogueRegistryService
            : require('../../../rulesCore/src/service/defaultRulePropertyCatalogueRegistryService');
    },

    /** Implements quality as an overrideable service operation. */
    quality: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultRuleQualityService
            ? SERVICE.DefaultRuleQualityService
            : require('./defaultRuleQualityService');
    },

    /** Implements available as an overrideable service operation. */
    available: function (resolution) {
        return Boolean(resolution && resolution.available === true &&
            resolution.value !== undefined && resolution.value !== null && resolution.value !== '');
    },

    /** Implements acceptable as an overrideable service operation. */
    acceptable: function (resolution, condition) {
        return this.available(resolution) &&
            this.quality().meets(resolution.quality, condition.minimumInputQuality) &&
            this.quality().confidenceMeets(resolution.confidence, condition.minimumConfidence);
    },

    /** Implements primary as an overrideable service operation. */
    primary: function (providerCode, condition, evaluationContext) {
        return this.registry().resolveProperty(providerCode, {
            propertyCode: condition.propertyCode,
            condition: condition,
            context: evaluationContext.input || {},
            evaluationContext: evaluationContext
        }) || { available: false, quality: 'UNAVAILABLE', source: 'UNAVAILABLE' };
    },

    /** Implements fallback as an overrideable service operation. */
    fallback: function (providerCode, condition, evaluationContext, current) {
        return this.registry().resolveFallback(providerCode, {
            propertyCode: condition.propertyCode,
            condition: condition,
            context: evaluationContext.input || {},
            currentResolution: current,
            minimumInputQuality: condition.minimumInputQuality,
            minimumConfidence: condition.minimumConfidence,
            evaluationContext: evaluationContext
        }) || { available: false, quality: 'UNAVAILABLE', source: 'UNAVAILABLE' };
    },

    /** Implements resolve as an overrideable service operation. */
    resolve: function (providerCode, condition, evaluationContext) {
        let resolution = this.primary(providerCode, condition, evaluationContext);
        let acceptable = this.acceptable(resolution, condition);
        let fallbackUsed = false;

        if (!acceptable && condition.missingValueBehavior === 'FALLBACK_ALLOWED') {
            resolution = this.fallback(providerCode, condition, evaluationContext, resolution);
            fallbackUsed = this.available(resolution);
            acceptable = this.acceptable(resolution, condition);
        }

        return {
            resolution: resolution,
            acceptable: acceptable,
            fallbackUsed: fallbackUsed
        };
    }
};
