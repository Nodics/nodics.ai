/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/test/processGraphValidationService
 * @description Validates the backend-owned Nodics-native process graph contract before Axis visual designer integration.
 * @layer test
 * @owner workflow
 * @override Later process modules may extend node kinds and policies without weakening backend validation.
 */
const assert = require('assert');

let designerPolicy = {
    maximumNodesPerDefinition: 3,
    maximumTransitionsPerDefinition: 3
};

global.CONFIG = {
    get: function (key) {
        if (key === 'process') {
            return { designer: designerPolicy };
        }
        return undefined;
    }
};

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

const validationService = require('../modules/workflow/src/service/designer/defaultProcessGraphValidationService');

const validGraph = {
    nodes: [
        { code: 'start', type: 'START' },
        { code: 'approve', type: 'TASK' },
        { code: 'end', type: 'END' }
    ],
    transitions: [
        { code: 'start_to_approve', source: 'start', target: 'approve' },
        { code: 'approve_to_end', source: 'approve', target: 'end' }
    ]
};

const validResult = validationService.validateGraph(validGraph);
assert.strictEqual(validResult.valid, true);
assert.strictEqual(validResult.nodeCount, 3);
assert.strictEqual(validResult.transitionCount, 2);
assert.deepStrictEqual(validResult.issues, []);

const duplicateNodeResult = validationService.validateGraph({
    nodes: [
        { code: 'start', type: 'START' },
        { code: 'start', type: 'TASK' },
        { code: 'end', type: 'END' }
    ],
    transitions: [{ code: 'start_to_end', source: 'start', target: 'end' }]
});
assert.strictEqual(duplicateNodeResult.valid, false);
assert(duplicateNodeResult.issues.some(issue => issue.code === 'NODE_CODE_DUPLICATE'));

const executableActionResult = validationService.validateGraph({
    nodes: [
        { code: 'start', type: 'START' },
        { code: 'callHandler', type: 'ACTION', action: { moduleName: 'commerce', operation: 'https://example.test/unsafe' } },
        { code: 'end', type: 'END' }
    ],
    transitions: [
        { code: 'start_to_action', source: 'start', target: 'callHandler' },
        { code: 'action_to_end', source: 'callHandler', target: 'end' }
    ]
});
assert.strictEqual(executableActionResult.valid, false);
assert(executableActionResult.issues.some(issue => issue.code === 'NODE_ACTION_EXECUTABLE'));

designerPolicy = {
    maximumNodesPerDefinition: 10,
    maximumTransitionsPerDefinition: 10
};

const advancedNodeResult = validationService.validateGraph({
    nodes: [
        { code: 'start', type: 'START' },
        { code: 'decision', type: 'DECISION' },
        { code: 'callNoop', type: 'ACTION', action: { moduleName: 'nodics.process', operation: 'noop' } },
        { code: 'delay', type: 'TIMER', timer: { delayMs: 0 } },
        { code: 'childFlow', type: 'SUB_PROCESS', subProcessDefinitionCode: 'childApproval' },
        { code: 'end', type: 'END' }
    ],
    transitions: [
        { code: 'start_to_decision', source: 'start', target: 'decision' },
        { code: 'decision_to_action', source: 'decision', target: 'callNoop', condition: { field: 'approved', equals: true } },
        { code: 'decision_to_end', source: 'decision', target: 'end', default: true },
        { code: 'action_to_timer', source: 'callNoop', target: 'delay' },
        { code: 'timer_to_child', source: 'delay', target: 'childFlow' },
        { code: 'child_to_end', source: 'childFlow', target: 'end' }
    ]
});
assert.strictEqual(advancedNodeResult.valid, true);

const unsafeDecisionResult = validationService.validateGraph({
    nodes: [
        { code: 'start', type: 'START' },
        { code: 'decision', type: 'DECISION' },
        { code: 'end', type: 'END' }
    ],
    transitions: [
        { code: 'start_to_decision', source: 'start', target: 'decision' },
        { code: 'decision_to_end', source: 'decision', target: 'end' }
    ]
});
assert.strictEqual(unsafeDecisionResult.valid, false);
assert(unsafeDecisionResult.issues.some(issue => issue.code === 'DECISION_TRANSITION_REQUIRED'));

designerPolicy = {
    maximumNodesPerDefinition: 3,
    maximumTransitionsPerDefinition: 3
};

const limitResult = validationService.validateGraph({
    nodes: [
        { code: 'start', type: 'START' },
        { code: 'one', type: 'TASK' },
        { code: 'two', type: 'TASK' },
        { code: 'end', type: 'END' }
    ],
    transitions: []
});
assert.strictEqual(limitResult.valid, false);
assert(limitResult.issues.some(issue => issue.code === 'GRAPH_NODE_LIMIT_EXCEEDED'));

assert.throws(
    () => validationService.assertValidGraph({ nodes: [], transitions: [] }),
    error => error.code === 'ERR_PROCESS_00004' && Array.isArray(error.errors),
);

console.log('Process graph validation service contract passed');
