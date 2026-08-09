/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/modules/flowCore/src/service/designer/defaultProcessGraphValidationService
 * @description Validates Nodics-native workflow graphs before draft save or publish; Axis visual graphs are only editor projections over this backend contract.
 * @layer service
 * @owner flowCore
 * @override Customer process overlays may add node kinds, condition policies, or domain action reference validation without bypassing backend validation.
 */
module.exports = {
    /**
     * Returns configurable designer and graph validation policy.
     *
     * @returns {Object} Effective process designer policy.
     */
    getPolicy: function () {
        return ((CONFIG.get('process') || {}).designer) || {};
    },

    /**
     * Returns true when the value is a plain object.
     *
     * @param {*} value Candidate value.
     * @returns {boolean} Whether value is a non-array object.
     */
    isObject: function (value) {
        return value && typeof value === 'object' && !Array.isArray(value);
    },

    /**
     * Validates a stable Nodics code segment used by nodes and transitions.
     *
     * @param {*} value Candidate code.
     * @returns {boolean} Whether value is a safe code.
     */
    isCode: function (value) {
        return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
    },

    /**
     * Checks whether a string looks like executable code or a direct resource path.
     *
     * @param {*} value Candidate reference.
     * @returns {boolean} True when the string must not be stored as a domain action.
     */
    looksExecutable: function (value) {
        return typeof value === 'string' && /[\\/]|^(https?|javascript|data|file):|=>|function\s*\(|\beval\s*\(/i.test(value);
    },

    /**
     * Adds a validation issue to the accumulator.
     *
     * @param {Object[]} issues Validation issue accumulator.
     * @param {string} code Stable issue code.
     * @param {string} message Human-readable issue.
     * @param {Object} [context] Optional bounded diagnostic context.
     * @returns {void}
     */
    addIssue: function (issues, code, message, context) {
        issues.push(Object.assign({ code: code, message: message }, context || {}));
    },

    /**
     * Validates a single node and records structural or ownership problems.
     *
     * @param {Object} node Node contract to inspect.
     * @param {Object[]} issues Validation issue accumulator.
     * @returns {void}
     */
    validateNode: function (node, issues) {
        if (!this.isObject(node)) {
            this.addIssue(issues, 'NODE_INVALID', 'Every graph node must be an object');
            return;
        }
        if (!this.isCode(node.code)) this.addIssue(issues, 'NODE_CODE_INVALID', 'Node code is required and must be stable', { nodeCode: node.code });
        if (!['START', 'END', 'ACTION', 'DECISION', 'TASK', 'EVENT', 'WAIT'].includes(node.type)) {
            this.addIssue(issues, 'NODE_TYPE_INVALID', 'Node type is not supported by nodics.process', { nodeCode: node.code, nodeType: node.type });
        }
        if (node.action) {
            if (!this.isObject(node.action) || !this.isCode(node.action.moduleName) || !this.isCode(node.action.operation)) {
                this.addIssue(issues, 'NODE_ACTION_INVALID', 'Domain action must be a declarative module and operation reference', { nodeCode: node.code });
            }
            if (this.looksExecutable(node.action.operation) || this.looksExecutable(node.action.handler)) {
                this.addIssue(issues, 'NODE_ACTION_EXECUTABLE', 'Domain action references must not store executable code, URLs, or file paths', { nodeCode: node.code });
            }
        }
    },

    /**
     * Validates the full Nodics-native graph contract.
     *
     * @param {Object} graph Candidate workflow graph.
     * @returns {Object} Validation result containing `valid`, `issues`, and summary counts.
     */
    validateGraph: function (graph) {
        let issues = [];
        let policy = this.getPolicy();
        let maximumNodes = Number(policy.maximumNodesPerDefinition || 250);
        let maximumTransitions = Number(policy.maximumTransitionsPerDefinition || 500);
        if (!this.isObject(graph)) {
            this.addIssue(issues, 'GRAPH_INVALID', 'Graph must be an object');
            return { valid: false, issues: issues, nodeCount: 0, transitionCount: 0 };
        }
        let nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
        let transitions = Array.isArray(graph.transitions) ? graph.transitions : [];
        if (nodes.length === 0) this.addIssue(issues, 'GRAPH_NODES_REQUIRED', 'At least one node is required');
        if (nodes.length > maximumNodes) this.addIssue(issues, 'GRAPH_NODE_LIMIT_EXCEEDED', 'Graph contains more nodes than allowed', { maximum: maximumNodes, actual: nodes.length });
        if (transitions.length > maximumTransitions) this.addIssue(issues, 'GRAPH_TRANSITION_LIMIT_EXCEEDED', 'Graph contains more transitions than allowed', { maximum: maximumTransitions, actual: transitions.length });

        let nodeCodes = new Set();
        nodes.forEach(node => {
            this.validateNode(node, issues);
            if (node && this.isCode(node.code)) {
                if (nodeCodes.has(node.code)) this.addIssue(issues, 'NODE_CODE_DUPLICATE', 'Node code must be unique', { nodeCode: node.code });
                nodeCodes.add(node.code);
            }
        });

        let startNodes = nodes.filter(node => node && node.type === 'START');
        let endNodes = nodes.filter(node => node && node.type === 'END');
        if (startNodes.length !== 1) this.addIssue(issues, 'START_NODE_REQUIRED', 'Exactly one START node is required', { actual: startNodes.length });
        if (endNodes.length < 1) this.addIssue(issues, 'END_NODE_REQUIRED', 'At least one END node is required');

        transitions.forEach(transition => {
            if (!this.isObject(transition)) {
                this.addIssue(issues, 'TRANSITION_INVALID', 'Every transition must be an object');
                return;
            }
            if (!this.isCode(transition.code)) this.addIssue(issues, 'TRANSITION_CODE_INVALID', 'Transition code is required and must be stable', { transitionCode: transition.code });
            if (!nodeCodes.has(transition.source)) this.addIssue(issues, 'TRANSITION_SOURCE_INVALID', 'Transition source node does not exist', { transitionCode: transition.code, source: transition.source });
            if (!nodeCodes.has(transition.target)) this.addIssue(issues, 'TRANSITION_TARGET_INVALID', 'Transition target node does not exist', { transitionCode: transition.code, target: transition.target });
            let sourceNode = nodes.find(node => node && node.code === transition.source);
            let targetNode = nodes.find(node => node && node.code === transition.target);
            if (sourceNode && sourceNode.type === 'END') this.addIssue(issues, 'TRANSITION_FROM_END_INVALID', 'END nodes cannot have outgoing transitions', { transitionCode: transition.code });
            if (targetNode && targetNode.type === 'START') this.addIssue(issues, 'TRANSITION_TO_START_INVALID', 'START nodes cannot have incoming transitions', { transitionCode: transition.code });
        });

        return {
            valid: issues.length === 0,
            issues: issues,
            nodeCount: nodes.length,
            transitionCount: transitions.length
        };
    },

    /**
     * Throws a Nodics process validation error when the graph is invalid.
     *
     * @param {Object} graph Candidate workflow graph.
     * @returns {Object} Successful validation result.
     * @throws {CLASSES.NodicsError} When graph validation fails.
     */
    assertValidGraph: function (graph) {
        let validation = this.validateGraph(graph);
        if (!validation.valid) {
            let error = new CLASSES.NodicsError('ERR_PROCESS_00004', 'Process graph validation failed');
            error.errors = validation.issues;
            throw error;
        }
        return validation;
    }
};
