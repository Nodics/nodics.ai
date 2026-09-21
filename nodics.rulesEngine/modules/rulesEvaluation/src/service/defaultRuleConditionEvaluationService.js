/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesEvaluation/src/service/defaultRuleConditionEvaluationService @description Applies missing-value policy and one generic operator after centralized consumer property resolution. @layer service @owner rulesEvaluation */
module.exports = {
    /** Implements resolutionService as an overrideable service operation. */
    resolutionService: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultRulePropertyResolutionService
            ? SERVICE.DefaultRulePropertyResolutionService
            : require('./defaultRulePropertyResolutionService');
    },

    /** Implements operatorService as an overrideable service operation. */
    operatorService: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultRuleOperatorService
            ? SERVICE.DefaultRuleOperatorService
            : require('../../../rulesCore/src/service/defaultRuleOperatorService');
    },

    /** Implements availabilityOperator as an overrideable service operation. */
    availabilityOperator: function (operatorCode) {
        return operatorCode === 'IS_AVAILABLE' || operatorCode === 'IS_NOT_AVAILABLE';
    },

    /** Implements evaluate as an overrideable service operation. */
    evaluate: function (condition, evaluationContext) {
        if (!condition || !condition.propertyCode || !condition.operatorCode) {
            throw new Error('Rule condition property and operator are required');
        }

        let resolved = this.resolutionService().resolve(
            evaluationContext.propertyProviderCode,
            condition,
            evaluationContext
        );
        let resolution = resolved.resolution || { available: false, quality: 'UNAVAILABLE' };

        if (this.availabilityOperator(condition.operatorCode)) {
            let availabilityMatch = this.operatorService().evaluate(
                condition.operatorCode,
                resolution.available === true ? resolution.value : undefined
            );
            return {
                conditionCode: condition.code,
                propertyCode: condition.propertyCode,
                operatorCode: condition.operatorCode,
                result: availabilityMatch ? 'MATCHED' : 'NOT_MATCHED',
                matched: availabilityMatch,
                applicable: true,
                fallbackUsed: false,
                resolution: resolution
            };
        }

        if (!resolved.acceptable) {
            if (condition.missingValueBehavior === 'OPTIONAL') {
                return {
                    conditionCode: condition.code,
                    propertyCode: condition.propertyCode,
                    result: 'IGNORED',
                    matched: false,
                    applicable: false,
                    reason: 'INPUT_UNAVAILABLE_OR_BELOW_QUALITY',
                    fallbackUsed: resolved.fallbackUsed,
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
                fallbackUsed: resolved.fallbackUsed,
                resolution: resolution
            };
        }

        let matched = this.operatorService().evaluate(
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
            fallbackUsed: resolved.fallbackUsed,
            resolution: resolution
        };
    }
};
