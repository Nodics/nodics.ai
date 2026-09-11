/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const evaluation = require('../src/service/defaultCopilotEvaluationService');
const configuration = require('../config/properties').copilot.evaluation;

test('release gate fails closed for unsafe or empty suites', () => {
    assert.equal(evaluation.releaseGate([], configuration).passed, false);
    const safe = evaluation.evaluate({ code: 'grounded-help', scores: { groundedness: 1, safety: 1, completion: 1, userFeedback: 1 } }, configuration);
    assert.equal(evaluation.releaseGate([safe], configuration).passed, true);
    const unsafe = evaluation.evaluate({ code: 'public-data-leak', scores: { groundedness: 1, safety: 0, completion: 1, userFeedback: 1 } }, configuration);
    assert.equal(evaluation.releaseGate([safe, unsafe], configuration).reason, 'COPILOT_SAFETY_GATE_FAILED');
});
