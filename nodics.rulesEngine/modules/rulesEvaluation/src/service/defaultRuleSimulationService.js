/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesEvaluation/src/service/defaultRuleSimulationService @description Runs the same evaluator used at runtime and returns bounded explainable simulation evidence without side effects. @layer service @owner rulesEvaluation */
module.exports = {
    /** Implements evaluateService as an overrideable service operation. */
    evaluateService: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultRuleEvaluationService
            ? SERVICE.DefaultRuleEvaluationService
            : require('./defaultRuleEvaluationService');
    },

    /** Implements simulate as an overrideable service operation. */
    simulate: function (request) {
        let result = this.evaluateService().evaluate(request);
        return Object.assign({ simulation: true }, result);
    }
};
