/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/src/service/operation/defaultProcessOperationsInspectionService
 * @description Provides bounded read APIs for process runtime instances, human tasks, and audit events without creating a second runtime authority.
 * @layer service
 * @owner workflow
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

    /** Returns the generated Process recovery-incident service. */
    incidentService: function () {
        return SERVICE.DefaultProcessIncidentService;
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
            searchOptions: { pageSize: this.listLimit(request), pageNumber: 1, sort: { startedAt: -1 } }
        }));
        return { code: 'SUC_PROCESS_00000', data: response.result || [] };
    },

    /** Lists declared trigger relationships with paging controls separate from safe record filters and original human scope. */
    listTriggers: async function (request) {
        const service = SERVICE.DefaultProcessTriggerService;
        if (!service || typeof service.get !== 'function')
            throw new CLASSES.NodicsError('ERR_PROCESS_00014', 'Process trigger inspection is unavailable');
        const query = this.safeQuery(request, ['code', 'definitionCode', 'triggerType', 'cronJobCode', 'status']);
        const pageSize = this.listLimit(request);
        const response = await service.get(this.serviceRequest(request, {
            query,
            searchOptions: { pageSize, pageNumber: 1, sort: { code: 1 } }
        }));
        const rows = response && response.result;
        if (!response || !/^SUC_/.test(response.code || '') || response.success === false || response.error || response.errors ||
            !Array.isArray(rows) || rows.length > pageSize ||
            rows.some(row => !row || !this.isCode(row.code) || Object.entries(query).some(([key, value]) => row[key] !== value)) ||
            new Set(rows.map(row => row.code)).size !== rows.length ||
            (response.count !== undefined && (!Number.isSafeInteger(response.count) || response.count < rows.length)))
            throw new CLASSES.NodicsError('ERR_PROCESS_00014', 'Process trigger inspection is unavailable');
        return { code: 'SUC_PROCESS_00010', data: rows };
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
            searchOptions: { pageSize: 2, pageNumber: 1 }
        }));
        let instance = response.result && response.result[0];
        if (!instance) throw new CLASSES.NodicsError('ERR_PROCESS_00007', 'Process instance was not found');
        return { code: 'SUC_PROCESS_00000', data: instance };
    },

    /**
     * Resolves task pagination from Workflow-owned defaults and strict request bounds.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Validated page and page size.
     */
    taskPagination: function (request) {
        const policy = CONFIG.get('process')?.taskQueue;
        if (!policy || !Number.isSafeInteger(policy.defaultPageSize) ||
            !Number.isSafeInteger(policy.maximumPageSize) || policy.defaultPageSize < 1 ||
            policy.defaultPageSize > policy.maximumPageSize || policy.maximumPageSize > 100) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00006', 'Process task pagination configuration is invalid');
        }
        const source = request.query || {};
        const integer = (value) => typeof value === 'number' ||
            (typeof value === 'string' && /^[1-9][0-9]*$/.test(value)) ? Number(value) : NaN;
        const page = source.page === undefined ? 1 : integer(source.page);
        const pageSize = source.limit === undefined ? policy.defaultPageSize : integer(source.limit);
        if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) ||
            pageSize < 1 || pageSize > policy.maximumPageSize || !Number.isSafeInteger(page * pageSize)) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00006', 'Process task pagination is invalid');
        }
        return { page, pageSize };
    },

    /** Builds the owner task queue filter without accepting database operators or caller policy. */
    taskQuery: function (request) {
        const query = this.safeQuery(request, ['instanceCode', 'status', 'assignee']);
        const queue = request.query && request.query.queue;
        if (queue !== undefined && queue !== 'actionable') {
            throw new CLASSES.NodicsError('ERR_PROCESS_00006', 'Process task queue is invalid');
        }
        if (queue === 'actionable') {
            const actionable = { status: { $in: ['OPEN', 'CLAIMED', 'ESCALATED'] } };
            return { $and: [query, actionable] };
        }
        return query;
    },

    /** Lists one stable owner page; count and rows share the generated service authorization and filters. */
    listTasks: async function (request) {
        const { page, pageSize } = this.taskPagination(request);
        let response = await this.taskService().get(this.serviceRequest(request, {
            query: this.taskQuery(request),
            searchOptions: { pageSize, pageNumber: page, sort: { dueAt: 1, code: 1 } }
        }));
        if (!/^SUC_/.test(response?.code || '') || response.error || response.success === false ||
            (response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length)) ||
            !Array.isArray(response.result) || response.result.length > pageSize ||
            !Number.isSafeInteger(response.count) || response.count < response.result.length) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00006', 'Process task page is unavailable');
        }
        const tasks = await SERVICE.DefaultProcessRuntimeLifecycleService.projectTaskDecisions(
            request, response.result
        );
        return { code: 'SUC_PROCESS_00000', data: tasks, pagination: {
            page, pageSize, total: response.count,
            hasNext: response.count > page * pageSize,
            hasPrevious: page > 1,
        } };
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
            searchOptions: { pageSize: 2, pageNumber: 1 }
        }));
        let task = response.result && response.result[0];
        if (!task) throw new CLASSES.NodicsError('ERR_PROCESS_00008', 'Process task was not found');
        const projected = await SERVICE.DefaultProcessRuntimeLifecycleService.projectTaskDecisions(request, [task]);
        return { code: 'SUC_PROCESS_00000', data: projected[0] };
    },

    /** Lists recovery incidents using bounded operational filters. */
    listIncidents: async function (request) {
        let response = await this.incidentService().get(this.serviceRequest(request, {
            query: this.safeQuery(request, ['instanceCode', 'definitionCode', 'nodeCode', 'status', 'errorCode']),
            searchOptions: { pageSize: this.listLimit(request), pageNumber: 1, sort: { lastErrorAt: -1 } }
        }));
        return { code: 'SUC_PROCESS_00000', data: response.result || [] };
    },

    /** Reads one Process-owned recovery incident. */
    getIncident: async function (request) {
        let response = await this.incidentService().get(this.serviceRequest(request, {
            query: { code: this.assertCode(request.incidentCode) }, searchOptions: { pageSize: 2, pageNumber: 1 }
        }));
        let incident = response.result && response.result[0];
        if (!incident) throw new CLASSES.NodicsError('ERR_PROCESS_00022', 'Process recovery incident was not found');
        return { code: 'SUC_PROCESS_00000', data: incident };
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
            searchOptions: { pageSize: this.listLimit(request), pageNumber: 1, sort: { createdAt: -1 } }
        }));
        return { code: 'SUC_PROCESS_00000', data: response.result || [] };
    }
};
