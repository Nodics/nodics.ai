/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesEvaluation/src/service/defaultRuleGroupEvaluationService @description Recursively evaluates ALL/ANY rule groups while preserving optional-condition semantics and explanation evidence. @layer service @owner rulesEvaluation */
module.exports = {
    /** Implements conditionService as an overrideable service operation. */
    conditionService: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultRuleConditionEvaluationService
            ? SERVICE.DefaultRuleConditionEvaluationService
            : require('./defaultRuleConditionEvaluationService');
    },

    /** Implements evaluate as an overrideable service operation. */
    evaluate: function (group, evaluationContext, depth) {
        depth = depth || 1;
        let maximumDepth = evaluationContext.maximumGroupDepth || 5;
        if (depth > maximumDepth) throw new Error('Rule group nesting exceeds configured maximum depth');
        if (!group || !['ALL','ANY'].includes(group.operator)) throw new Error('Rule group operator must be ALL or ANY');

        let conditionResults = (group.conditions || []).filter(condition => condition.enabled !== false)
            .map(condition => this.conditionService().evaluate(condition, evaluationContext));
        let childResults = (group.childGroups || []).filter(child => child.enabled !== false)
            .map(child => this.evaluate(child, evaluationContext, depth + 1));

        let applicable = conditionResults.filter(result => result.applicable !== false)
            .map(result => result.matched)
            .concat(childResults.filter(result => result.applicable !== false).map(result => result.matched));

        let matched = applicable.length > 0 &&
            (group.operator === 'ALL' ? applicable.every(Boolean) : applicable.some(Boolean));

        return {
            groupCode: group.code,
            name: group.name,
            operator: group.operator,
            applicable: applicable.length > 0,
            matched: matched,
            applicableCount: applicable.length,
            conditionResults: conditionResults,
            childGroups: childResults,
            outcome: matched ? group.outcome || null : null
        };
    }
};
