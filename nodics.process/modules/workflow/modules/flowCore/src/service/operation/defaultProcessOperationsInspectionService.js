/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/modules/flowCore/src/service/operation/defaultProcessOperationsInspectionService
 * @description Provides bounded read APIs for process runtime instances, human tasks, and audit events without creating a second runtime authority.
 * @layer service
 * @owner flowCore
 * @override Customer process overlays may add domain filters, redaction, or tenancy policy while preserving safe default limits and backend ownership.
 */
module.exports = {
    /**
     * Resolves tenant from the authorized Nodics request context.
     *
     * @param {Object} request Nodics request context.
     * @returns {string} Tenant code.
     */
    getTenant: function (request) {
        return request && request.tenant || CONFIG.get('defaultTenant') || 'default';
    },

    /**
     * Builds a generated-service request preserving authorization context.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} additions Service additions.
     * @returns {Object} Generated-service request.
     */
    serviceRequest: function (request, additions) {
        return Object.assign({
            tenant: this.getTenant(request),
            authData: request && request.authData,
            options: { recursive: false }
        }, additions || {});
    },

    /**
     * Returns the generated process instance service.
     *
     * @returns {Object} Generated process instance service.
     */
    instanceService: function () {
        return SERVICE.DefaultProcessInstanceService;
    },

    /**
     * Returns the generated process task service.
     *
     * @returns {Object} Generated process task service.
     */
    taskService: function () {
        return SERVICE.DefaultProcessTaskService;
    },

    /**
     * Returns the generated process audit event service.
     *
     * @returns {Object} Generated process audit event service.
     */
    auditService: function () {
        return SERVICE.DefaultProcessAuditEventService;
    },

    /**
     * Validates stable runtime entity codes.
     *
     * @param {*} value Candidate code.
     * @returns {boolean} Whether the code is valid.
     */
    isCode: function (value) {
        return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
    },

    /**
     * Throws when an operational entity code is unsafe.
     *
     * @param {*} code Candidate code.
     * @returns {string} Valid code.
     * @throws {CLASSES.NodicsError} When code is invalid.
     */
    assertCode: function (code) {
        if (!this.isCode(code)) throw new CLASSES.NodicsError('ERR_PROCESS_00006', 'Process runtime code is invalid');
        return code;
    },

    /**
     * Converts HTTP query values into a bounded generated-service query.
     *
     * @param {Object} request Nodics request context.
     * @param {string[]} allowedKeys Allowed query keys.
     * @returns {Object} Safe query object.
     */
    safeQuery: function (request, allowedKeys) {
        let source = request && request.query || {};
        return allowedKeys.reduce((query, key) => {
            if (typeof source[key] === 'string' && source[key].trim()) {
                query[key] = source[key].trim().slice(0, 128);
            }
            return query;
        }, {});
    },

    /**
     * Resolves a bounded list limit from query or defaults.
     *
     * @param {Object} request Nodics request context.
     * @returns {number} Safe limit.
     */
    listLimit: function (request) {
        let limit = Number(request && request.query && request.query.limit || 50);
        if (!Number.isFinite(limit) || limit < 1) return 50;
        return Math.min(Math.floor(limit), 100);
    },

    /**
     * Lists runtime instances using safe filters.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Runtime instance list.
     */
    listInstances: async function (request) {
        let response = await this.instanceService().get(this.serviceRequest(request, {
            query: this.safeQuery(request, ['definitionCode', 'status']),
            searchOptions: { limit: this.listLimit(request), sort: { startedAt: -1 } }
        }));
        return { code: 'SUC_PROCESS_00000', data: response.result || [] };
    },

    /**
     * Reads one runtime instance by code.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Runtime instance projection.
     */
    getInstance: async function (request) {
        let response = await this.instanceService().get(this.serviceRequest(request, {
            query: { code: this.assertCode(request.instanceCode) },
            searchOptions: { limit: 2 }
        }));
        let instance = response.result && response.result[0];
        if (!instance) throw new CLASSES.NodicsError('ERR_PROCESS_00007', 'Process instance was not found');
        return { code: 'SUC_PROCESS_00000', data: instance };
    },

    /**
     * Lists human tasks using safe filters.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Human task list.
     */
    listTasks: async function (request) {
        let response = await this.taskService().get(this.serviceRequest(request, {
            query: this.safeQuery(request, ['instanceCode', 'status', 'assignee']),
            searchOptions: { limit: this.listLimit(request), sort: { dueAt: 1 } }
        }));
        return { code: 'SUC_PROCESS_00000', data: response.result || [] };
    },

    /**
     * Reads one human task by code.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Human task projection.
     */
    getTask: async function (request) {
        let response = await this.taskService().get(this.serviceRequest(request, {
            query: { code: this.assertCode(request.taskCode) },
            searchOptions: { limit: 2 }
        }));
        let task = response.result && response.result[0];
        if (!task) throw new CLASSES.NodicsError('ERR_PROCESS_00008', 'Process task was not found');
        return { code: 'SUC_PROCESS_00000', data: task };
    },

    /**
     * Lists audit events using safe filters.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Audit event list.
     */
    listAuditEvents: async function (request) {
        let response = await this.auditService().get(this.serviceRequest(request, {
            query: this.safeQuery(request, ['definitionCode', 'instanceCode', 'eventType', 'outcome']),
            searchOptions: { limit: this.listLimit(request), sort: { createdAt: -1 } }
        }));
        return { code: 'SUC_PROCESS_00000', data: response.result || [] };
    }
};
