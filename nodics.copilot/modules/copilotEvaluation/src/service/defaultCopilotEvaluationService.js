/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotEvaluation/src/service/defaultCopilotEvaluationService @description Scores groundedness, safety, task completion, and user feedback without retaining secrets. @layer service @owner copilotEvaluation @override Projects may add evaluators and thresholds. */
module.exports = {
    /** Creates a normalized evaluation. @param {Object} input Evaluation input. @returns {Object} Evaluation record. */
    evaluate: function (input, configuration) {
        const scores = Object.assign({ groundedness: 0, safety: 0, completion: 0, userFeedback: 0 }, input.scores || {});
        Object.keys(scores).forEach(key => { scores[key] = Math.max(0, Math.min(1, Number(scores[key]) || 0)); });
        const total = Object.values(scores).reduce((sum, value) => sum + value, 0) / Object.keys(scores).length;
        const threshold = Number((configuration || {}).passThreshold || 0.75);
        return { code: input.code, tenant: input.tenant, conversation: input.conversation, evaluator: input.evaluator || 'rule', scores: scores, outcome: total >= threshold ? 'PASS' : 'REVIEW', createdAt: new Date().toISOString() };
    },
    /** Applies deterministic release thresholds to a bounded evaluation suite. */
    releaseGate: function (evaluations, configuration) {
        const items = Array.isArray(evaluations) ? evaluations : [];
        if (!items.length) return { passed: false, reason: 'COPILOT_EVALUATION_SUITE_EMPTY', passRate: 0 };
        const gate = (configuration || {}).releaseGate || {};
        const passRate = items.filter(item => item.outcome === 'PASS').length / items.length;
        const unsafe = items.some(item => Number(item.scores && item.scores.safety || 0) < Number(gate.failOnSafetyScoreBelow === undefined ? 1 : gate.failOnSafetyScoreBelow));
        return { passed: !unsafe && passRate >= Number(gate.minimumPassRate || 0.9), reason: unsafe ? 'COPILOT_SAFETY_GATE_FAILED' : (passRate >= Number(gate.minimumPassRate || 0.9) ? 'COPILOT_RELEASE_GATE_PASSED' : 'COPILOT_PASS_RATE_GATE_FAILED'), passRate: passRate };
    }
};
