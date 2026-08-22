/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/service/schema/DefaultSchemaSafeQueryService
 * @description Converts browser-safe schema query envelopes into bounded
 * generated-read service input. This service is shared schema infrastructure:
 * clients and BackOffice screens must not construct raw database queries.
 * @layer service
 * @owner nDatabase
 * @override Domain modules may expose lifecycle-specific APIs, but schema
 * browsing/search must remain a generic safe-query contract instead of
 * screen-specific routes or raw Mongo query pass-through.
 */
module.exports = {
    /**
     * Executes the generated safe-search route by translating browser-safe input
     * to the owning generated service's normal get request.
     * @param {Object} request Generated service request.
     * @returns {Promise<Object>} Paged client-safe record response.
     */
    searchGenerated: function (request) {
        let schemaName = request.schemaName;
        let descriptor = this.resolveDescriptor(request, request.moduleName, schemaName);
        if (!descriptor || !descriptor.operations || !descriptor.operations.includes('search')) {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004', 'Generated safe search is not available for schema'));
        }
        let input = this.buildSearchInput(request.browserQuery || {}, descriptor);
        let serviceName = request.generatedServiceName;
        if (!serviceName || !SERVICE[serviceName] || typeof SERVICE[serviceName].get !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004', 'Generated schema read service is not available'));
        }
        return SERVICE[serviceName]
            .get({
                tenant: request.tenant,
                authData: request.authData,
                moduleName: request.moduleName,
                query: input.query,
                searchOptions: input.searchOptions,
                options: { recursive: false },
            })
            .then((result) => {
                return {
                    code: 'SUC_DBS_00000',
                    data: {
                        records: result.result || [],
                        totalCount: result.count || 0,
                        pageNumber: input.pageNumber,
                        pageSize: input.pageSize,
                        sort: input.sort,
                    },
                };
            });
    },

    /**
     * Resolves the effective schema descriptor used to advertise safe query
     * capabilities. The descriptor builder should become shared metadata
     * infrastructure; until then, the generated route reuses the existing
     * descriptor authority instead of duplicating field/security rules.
     * @param {Object} request Authenticated request.
     * @param {string} moduleName Owning module name.
     * @param {string} schemaName Logical schema name.
     * @returns {Object|undefined} Client-safe schema descriptor.
     */
    resolveDescriptor: function (request, moduleName, schemaName) {
        let schemaModule = SERVICE.DefaultSchemaWorkbenchService && typeof SERVICE.DefaultSchemaWorkbenchService.resolveSchemaModule === 'function'
            ? SERVICE.DefaultSchemaWorkbenchService.resolveSchemaModule(moduleName)
            : undefined;
        if (!schemaModule || !schemaModule.moduleObject || !SERVICE.DefaultSchemaWorkbenchService || typeof SERVICE.DefaultSchemaWorkbenchService.buildDescriptor !== 'function') {
            throw new CLASSES.NodicsError('ERR_DBS_00004', 'Generated safe search descriptor is not available');
        }
        return SERVICE.DefaultSchemaWorkbenchService.buildDescriptor(request, schemaModule.moduleObject, schemaName, schemaModule.moduleName);
    },

    /**
     * Validates browser query input and constructs internal generated-read
     * query/search options.
     * @param {Object} body Browser-safe query input.
     * @param {Object} descriptor Effective client-safe schema descriptor.
     * @returns {Object} Generated read input.
     */
    buildSearchInput: function (body, descriptor) {
        body = this.normalizeSearchBody(body);
        let workbenchConfig = CONFIG.get('schemaWorkbench') || {};
        let capabilities = descriptor.queryCapabilities;
        let search = typeof body.search === 'string' ? body.search.trim() : '';
        let maximumSearchLength = workbenchConfig.maximumSearchLength || 100;
        if (search.length > maximumSearchLength) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema search text is too long');
        }
        let pageSize = Number(body.pageSize || capabilities.defaultPageSize);
        let pageNumber = Number(body.pageNumber || 1);
        if (
            !Number.isInteger(pageNumber) ||
            pageNumber < 1 ||
            !Number.isInteger(pageSize) ||
            pageSize < 1 ||
            pageSize > capabilities.maximumPageSize ||
            !capabilities.allowedPageSizes.includes(pageSize)
        ) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema paging input is invalid');
        }
        let sort = body.sort || capabilities.defaultSort;
        if (!sort || !capabilities.sortableFields.includes(sort.field) || !['ASC', 'DESC'].includes(sort.direction)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema sorting input is invalid');
        }
        let query = {};
        if (search && capabilities.searchableFields.length > 0) {
            let escaped = this.escapeSearchText(search);
            query.$or = capabilities.searchableFields.map((field) => {
                return { [field]: { $regex: escaped, $options: 'i' } };
            });
        }
        let filterQuery = this.buildFilterQuery(body.filters, capabilities);
        if (filterQuery) {
            query = Object.keys(query).length > 0 ? { $and: [query, filterQuery] } : filterQuery;
        }
        return {
            query: query,
            pageNumber: pageNumber,
            pageSize: pageSize,
            sort: { field: sort.field, direction: sort.direction },
            searchOptions: {
                pageNumber: pageNumber,
                pageSize: pageSize,
                sort: { [sort.field]: sort.direction === 'ASC' ? 1 : -1 },
                projection: this.buildRecordProjection(descriptor),
            },
        };
    },

    /**
     * Accepts both direct search bodies and client envelopes such as
     * `{ query: ... }` so filters/search cannot be bypassed by transport shape.
     * @param {Object|undefined} body Request body.
     * @returns {Object} Normalized bounded search body.
     */
    normalizeSearchBody: function (body) {
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return {};
        }
        if (body.query && typeof body.query === 'object' && !Array.isArray(body.query)) {
            return body.query;
        }
        return body;
    },

    /**
     * Builds an inclusive record projection from descriptor-safe fields.
     * @param {Object} descriptor Client-safe schema descriptor.
     * @returns {Object} Generated service projection.
     */
    buildRecordProjection: function (descriptor) {
        let projection = { _id: 0 };
        let fieldNames = (descriptor.fields || []).filter((field) => field && field.name).map((field) => field.name);
        let presentationFields = [descriptor.displayProperty].concat(descriptor.displayProperties || []).filter((name) => {
            return this.isSafeProjectionField(name);
        });
        fieldNames = Array.from(new Set(fieldNames.concat(presentationFields)));
        let parentFields = new Set(
            fieldNames
                .filter((name) => name.includes('.'))
                .map((name) => name.split('.')[0]),
        );
        fieldNames.forEach((fieldName) => {
            if (fieldName) {
                if (parentFields.has(fieldName)) {
                    return;
                }
                projection[fieldName] = 1;
            }
        });
        return projection;
    },

    /**
     * Allows descriptor-declared presentation paths to participate in record
     * projection without exposing known secret or internal fields.
     * @param {string|undefined} name Candidate field path.
     * @returns {boolean} True when the field path is safe to request.
     */
    isSafeProjectionField: function (name) {
        if (typeof name !== 'string' || !name || name === '_id') {
            return false;
        }
        let excluded = new Set(['password', 'apiKey', 'apiKeyHash', 'accessGroups']);
        let root = name.split('.')[0];
        return !excluded.has(name) && !excluded.has(root) && /^[A-Za-z0-9_.]+$/.test(name);
    },

    /**
     * Converts the bounded browser filter tree into an internal database query.
     * @param {Object|undefined} filters Browser filter group.
     * @param {Object} capabilities Effective query capabilities.
     * @returns {Object|undefined} Internal query.
     */
    buildFilterQuery: function (filters, capabilities) {
        if (filters === undefined || filters === null) {
            return undefined;
        }
        let config = CONFIG.get('schemaWorkbench') || {};
        let state = {
            count: 0,
            maximumCount: config.maximumFilterConditions || 20,
            maximumDepth: config.maximumFilterDepth || 3,
        };
        return this.buildFilterGroup(filters, capabilities, state, 1);
    },

    /**
     * Recursively validates one AND/OR group.
     * @param {Object} group Browser filter group.
     * @param {Object} capabilities Effective query capabilities.
     * @param {Object} state Shared validation counters.
     * @param {number} depth Current group depth.
     * @returns {Object} Internal grouped query.
     */
    buildFilterGroup: function (group, capabilities, state, depth) {
        if (
            !group ||
            typeof group !== 'object' ||
            Array.isArray(group) ||
            !capabilities.groupOperators.includes(group.operator) ||
            !Array.isArray(group.items) ||
            group.items.length === 0 ||
            depth > state.maximumDepth
        ) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema filter group is invalid');
        }
        let items = group.items.map((item) => {
            if (item && Array.isArray(item.items)) {
                return this.buildFilterGroup(item, capabilities, state, depth + 1);
            }
            state.count += 1;
            if (state.count > state.maximumCount) {
                throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema filter condition limit exceeded');
            }
            return this.buildFilterCondition(item, capabilities);
        });
        return { [group.operator === 'AND' ? '$and' : '$or']: items };
    },

    /**
     * Validates one typed condition and maps it to an internal query fragment.
     * @param {Object} condition Browser condition.
     * @param {Object} capabilities Effective query capabilities.
     * @returns {Object} Internal condition query.
     */
    buildFilterCondition: function (condition, capabilities) {
        if (!condition || typeof condition !== 'object' || Array.isArray(condition)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema filter condition is invalid');
        }
        let field = capabilities.filterFields.find((item) => item.field === condition.field);
        if (!field || !field.operators.includes(condition.operator)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema filter field or operator is invalid');
        }
        let value = this.normalizeFilterValue(condition.value, field);
        switch (condition.operator) {
            case 'EQUALS':
                return { [field.field]: value };
            case 'NOT_EQUALS':
                return { [field.field]: { $ne: value } };
            case 'GREATER_THAN':
                return { [field.field]: { $gt: value } };
            case 'GREATER_OR_EQUAL':
                return { [field.field]: { $gte: value } };
            case 'LESS_THAN':
                return { [field.field]: { $lt: value } };
            case 'LESS_OR_EQUAL':
                return { [field.field]: { $lte: value } };
            case 'BEFORE':
                return { [field.field]: { $lt: value } };
            case 'AFTER':
                return { [field.field]: { $gt: value } };
            case 'CONTAINS':
                return {
                    [field.field]: {
                        $regex: this.escapeSearchText(value),
                        $options: 'i',
                    },
                };
            case 'STARTS_WITH':
                return {
                    [field.field]: {
                        $regex: '^' + this.escapeSearchText(value),
                        $options: 'i',
                    },
                };
            case 'IN':
                return { [field.field]: { $in: value } };
            case 'BETWEEN':
                if (!Array.isArray(value) || value.length !== 2) {
                    throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema range filter is invalid');
                }
                return { [field.field]: { $gte: value[0], $lte: value[1] } };
            default:
                throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema filter operator is unsupported');
        }
    },

    /**
     * Normalizes a filter value according to advertised schema type.
     * @param {*} value Browser value.
     * @param {Object} field Filter field capability.
     * @returns {*} Safe typed value.
     */
    normalizeFilterValue: function (value, field) {
        if (field.operators.includes('IN') && Array.isArray(value)) {
            if (value.length === 0 || value.length > 50 || value.some((item) => typeof item !== 'string') || (field.enum && value.some((item) => !field.enum.includes(item)))) {
                throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema filter list is invalid');
            }
            return value.slice();
        }
        if (['boolean', 'bool'].includes(field.type)) {
            if (typeof value !== 'boolean') {
                throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema boolean filter is invalid');
            }
            return value;
        }
        if (['number', 'int', 'integer'].includes(field.type)) {
            if (typeof value !== 'number' || !Number.isFinite(value)) {
                throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema number filter is invalid');
            }
            return value;
        }
        if (field.type === 'date') {
            let values = Array.isArray(value) ? value : [value];
            if (values.length === 0 || values.length > 2 || values.some((item) => typeof item !== 'string' || !Number.isFinite(Date.parse(item)))) {
                throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema date filter is invalid');
            }
            let dates = values.map((item) => new Date(item));
            return Array.isArray(value) ? dates : dates[0];
        }
        if (typeof value !== 'string' || value.length === 0 || value.length > 200 || (field.enum && !field.enum.includes(value))) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema text filter is invalid');
        }
        return value;
    },

    /**
     * Escapes a literal value before constructing an internal regular expression.
     * @param {string} value Literal search input.
     * @returns {string} Escaped expression text.
     */
    escapeSearchText: function (value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
};
