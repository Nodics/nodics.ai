/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesEvaluation/src/service/defaultRuleConditionEvaluationService @description Resolves one consumer property, enforces quality/missing-value policy and applies a generic operator. @layer service @owner rulesEvaluation */
module.exports = {
    service: function (name, fallback) {
        return typeof SERVICE !== 'undefined' && SERVICE[name] ? SERVICE[name] : fallback;
    },

    evaluate: function (condition, evaluationContext) {
        if (!condition || !condition.propertyCode || !condition.operatorCode) {
            throw new Error('Rule condition property and operator are required');
        }
        let registry = this.service(
            'DefaultRulePropertyCatalogueRegistryService',
            require('../../../rulesCore/src/service/defaultRulePropertyCatalogueRegistryService')
        );
        let qualityService = this.service(
            'DefaultRuleQualityService',
            require('./defaultRuleQualityService')
        );
        let operatorService = this.service(
            'DefaultRuleOperatorService',
            require('../../../rulesCore/src/service/defaultRuleOperatorService')
        );
        let providerCode = evaluationContext.propertyProviderCode;
        let resolution = registry.resolveProperty(providerCode, {
            propertyCode: condition.propertyCode,
            context: evaluationContext.input || {},
            evaluationContext: evaluationContext
        }) || { available: false };

        let acceptable = resolution.available === true &&
            qualityService.meets(resolution.quality, condition.minimumInputQuality) &&
            qualityService.confidenceMeets(resolution.confidence, condition.minimumConfidence);

        let fallbackUsed = false;
        if (!acceptable && condition.missingValueBehavior === 'FALLBACK_ALLOWED') {
            resolution = registry.resolveFallback(providerCode, {
                propertyCode: condition.propertyCode,
                context: evaluationContext.input || {},
                currentResolution: resolution,
                minimumInputQuality: condition.minimumInputQuality,
                minimumConfidence: condition.minimumConfidence,
                evaluationContext: evaluationContext
            }) || { available: false };
            fallbackUsed = resolution.available === true;
            acceptable = fallbackUsed &&
                qualityService.meets(resolution.quality, condition.minimumInputQuality) &&
                qualityService.confidenceMeets(resolution.confidence, condition.minimumConfidence);
        }

        if (!acceptable) {
            if (condition.missingValueBehavior === 'OPTIONAL') {
                return {
                    conditionCode: condition.code,
                    propertyCode: condition.propertyCode,
                    result: 'IGNORED',
                    matched: false,
                    applicable: false,
                    reason: 'INPUT_UNAVAILABLE_OR_BELOW_QUALITY',
                    resolution: resolution
                };
            }
            return {
                conditionCode: condition.code,
                propertyCode: condition.propertyCode,
                result: 'UNAVAILABLE',
                matched: false,
                applicable: true,
                reason: 'INPUT_UNAVAILABLE_OR_BELOW_QUALITY',
                resolution: resolution
            };
        }

        let matched = operatorService.evaluate(
            condition.operatorCode,
            resolution.value,
            condition.value,
            condition.valueTo
        );
        return {
            conditionCode: condition.code,
            propertyCode: condition.propertyCode,
            operatorCode: condition.operatorCode,
            expectedValue: condition.value,
            expectedValueTo: condition.valueTo,
            result: matched ? 'MATCHED' : 'NOT_MATCHED',
            matched: matched,
            applicable: true,
            fallbackUsed: fallbackUsed,
            resolution: resolution
        };
    }
};
