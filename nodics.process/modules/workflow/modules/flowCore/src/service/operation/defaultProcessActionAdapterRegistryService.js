/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/modules/flowCore/src/service/operation/defaultProcessActionAdapterRegistryService
 * @description Executes only explicitly allowed declarative ACTION node adapters; domain modules own business behavior and Process owns orchestration evidence.
 * @layer service
 * @owner flowCore
 * @override Customer process overlays may register additional action adapters through configuration or by overriding this registry without allowing arbitrary executable graph content.
 */
module.exports = {
    /**
     * Resolves Process action-adapter configuration from merged Nodics
     * properties. The standard framework ships with a safe no-op adapter for
     * demos and tests only.
     *
     * @returns {Object} Effective action-adapter policy.
     */
    getPolicy: function () {
        return (((CONFIG.get('process') || {}).actionAdapters) || {});
    },

    /**
     * Creates a stable lookup key for a declarative action reference.
     *
     * @param {Object} action Declarative process action reference.
     * @returns {string} Adapter lookup key.
     */
    actionKey: function (action) {
        return String(action && action.moduleName || '') + '.' + String(action && action.operation || '');
    },

    /**
     * Lists framework-allowed action declarations. Configuration may add
     * project/domain adapters, but unregistered actions remain blocked.
     *
     * @returns {Object[]} Allowed action declarations.
     */
    allowedActions: function () {
        let policy = this.getPolicy();
        return Array.isArray(policy.allowedActions) ? policy.allowedActions : [
            {
                moduleName: 'nodics.process',
                operation: 'noop',
                description: 'Safe no-op adapter for framework smoke tests and beginner demos'
            }
        ];
    },

    /**
     * Finds the allowed adapter declaration for an ACTION node.
     *
     * @param {Object} action Declarative process action reference.
     * @returns {Object|undefined} Matching allowed adapter declaration.
     */
    findAllowedAction: function (action) {
        let actionKey = this.actionKey(action);
        return this.allowedActions().find(item => this.actionKey(item) === actionKey);
    },

    /**
     * Executes a safe demo action or delegates to an explicitly configured
     * service method. Unknown actions are denied so Process never becomes a
     * hidden place to execute domain business code.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} execution Action execution context.
     * @returns {Promise<Object>} Bounded action execution result.
     * @throws {CLASSES.NodicsError} When action is missing, unknown, or blocked.
     */
    execute: async function (request, execution) {
        let node = execution && execution.node || {};
        let action = node.action || {};
        let allowed = this.findAllowedAction(action);
        if (!allowed) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00019', 'Process action adapter is not registered or allowed');
        }
        if (action.moduleName === 'nodics.process' && action.operation === 'noop') {
            return {
                status: 'COMPLETED',
                adapter: this.actionKey(action),
                message: 'Safe no-op process action executed',
                output: {}
            };
        }
        if (!allowed.service || !allowed.method || !SERVICE[allowed.service] || typeof SERVICE[allowed.service][allowed.method] !== 'function') {
            throw new CLASSES.NodicsError('ERR_PROCESS_00019', 'Process action adapter implementation is unavailable');
        }
        return SERVICE[allowed.service][allowed.method](request, execution);
    }
};
