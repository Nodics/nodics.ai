/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module copilotKnowledge/service/DefaultCopilotDatabaseSourceService
 * @description Coordinates selected live collection reads through the existing secured schema API, never a copied database corpus or generated-service bypass.
 * @layer service @owner copilotKnowledge
 * @override Preserve original employee transport, source/group/collection intersection, advertised schema operations and live owner record/field authorization.
 */
module.exports = {
    /** Requires a truthful native success envelope before inspecting its data. @param {Object} response Native response. @returns {Object} Owner data. */
    responseData: function (response) {
        for (const value of [response, response?.data]) {
            if (
                !value ||
                typeof value !== 'object' ||
                Array.isArray(value) ||
                value.error ||
                value.success === false ||
                value.acknowledged === false ||
                (value.errors !== undefined &&
                    (!Array.isArray(value.errors) || value.errors.length))
            )
                throw new CLASSES.NodicsError('ERR_CPK_00016');
        }
        if (!/^SUC_/.test(response.code || ''))
            throw new CLASSES.NodicsError('ERR_CPK_00016');
        return response.data;
    },
    /** Rechecks selection and independent impact admission after an awaited owner call. @param {Object} request Trusted request. @param {Object} source Original source. @param {string} kind Fixed inspection intent. @returns {Object} Current source. */
    reauthorize: function (request, source, kind) {
        const configuration =
            SERVICE.DefaultCopilotKnowledgeRuntimeService.configuration();
        const current = this.authorizeInspection(request, configuration, kind);
        if (current.sourcePolicyDigest !== source.sourcePolicyDigest)
            throw new CLASSES.NodicsError('ERR_CPK_00002');
        return current;
    },
    /** Combines source read authority with independent mutation-preparation admission for impact previews. @param {Object} request Trusted request. @param {Object} configuration Effective config. @param {string} kind Fixed intent. @returns {Object} Selected source. */
    authorizeInspection: function (request, configuration, kind) {
        const source = this.authorize(request, configuration);
        if (
            kind === 'deleteImpact' &&
            !SERVICE.DefaultCopilotPolicyService.hasPermission(
                SERVICE.DefaultCopilotKnowledgeRuntimeService.securityContext(
                    request,
                    configuration,
                ),
                'copilot.mutation.prepare',
            )
        )
            throw new CLASSES.NodicsError('ERR_CPK_00002');
        return source;
    },
    /** Selects only a known non-mutating native inspection, never caller-provided routes. @param {Object} descriptor Fresh schema declaration. @param {string} kind Fixed inspection intent. @returns {Object} Native operation. */
    inspectionOperation: function (descriptor, kind) {
        if (kind === 'schema')
            return {
                path: '/schemas/' + descriptor.schemaName,
                method: 'GET',
                apiVersion: 'v0',
                active: true,
            };
        const operation = descriptor.apiOperations?.[kind];
        const suffix =
            kind === 'capabilities'
                ? 'capabilities'
                : kind === 'deleteImpact'
                  ? 'delete-impact'
                  : null;
        if (
            !suffix ||
            operation?.active !== true ||
            operation.method !== (kind === 'deleteImpact' ? 'POST' : 'GET') ||
            operation.path !==
                '/' + descriptor.schemaName.toLowerCase() + '/' + suffix ||
            !/^v\d+$/.test(operation.apiVersion)
        )
            throw new CLASSES.NodicsError('ERR_CPK_00016');
        return operation;
    },
    /** Minimizes schema metadata without defaults, values, related collection names or native transport configuration. @param {Object} descriptor Owner descriptor. @returns {Object[]} Visible field definitions. */
    inspectionFields: function (descriptor) {
        if (
            !Array.isArray(descriptor.fields) ||
            descriptor.fields.length > 1000
        )
            throw new CLASSES.NodicsError('ERR_CPK_00016');
        const hidden = descriptor.form?.hiddenFields || [];
        if (!Array.isArray(hidden))
            throw new CLASSES.NodicsError('ERR_CPK_00016');
        const fields = descriptor.fields.filter(
            (field) =>
                field &&
                field.hidden !== true &&
                field.sensitive !== true &&
                !hidden.includes(field.name),
        );
        if (new Set(fields.map((field) => field.name)).size !== fields.length)
            throw new CLASSES.NodicsError('ERR_CPK_00016');
        return fields.map((field) => {
            if (
                typeof field.name !== 'string' ||
                !/^[A-Za-z_][A-Za-z0-9_]{0,127}$/.test(field.name) ||
                typeof field.label !== 'string' ||
                !field.label.trim() ||
                field.label.length > 200 ||
                typeof field.type !== 'string' ||
                !/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(field.type)
            )
                throw new CLASSES.NodicsError('ERR_CPK_00016');
            return {
                name: field.name,
                label: field.label,
                type: field.type,
                required: field.required === true,
                readOnly: field.readOnly === true,
                primary: field.primary === true,
            };
        });
    },
    /** Validates an explicit single identity and its native revision without accepting query operators or inferred values. @param {Object} identity Human-supplied identity. @param {Object} descriptor Native schema. @returns {Object} Exact identity. */
    inspectionIdentity: function (identity, descriptor) {
        const fields = this.inspectionFields(descriptor);
        const primary =
            fields.find((field) => field.primary) ||
            fields.find((field) => field.name === descriptor.displayProperty);
        const concurrency = descriptor.concurrency;
        const revision =
            concurrency?.mode === 'COMPARE_AND_SET' &&
            concurrency.required === true
                ? concurrency.field
                : null;
        if (
            !primary ||
            (revision && !fields.some((field) => field.name === revision)) ||
            !identity ||
            typeof identity !== 'object' ||
            Array.isArray(identity) ||
            Object.keys(identity).some(
                (key) => ![primary.name, revision].includes(key),
            )
        )
            throw new CLASSES.NodicsError('ERR_CPK_00007');
        for (const key of [primary.name, ...(revision ? [revision] : [])]) {
            const value = identity[key];
            if (
                !(
                    typeof value === 'string' &&
                    value.trim() &&
                    value.length <= 200
                ) &&
                !(typeof value === 'number' && Number.isFinite(value)) &&
                !(key === primary.name && typeof value === 'boolean')
            )
                throw new CLASSES.NodicsError('ERR_CPK_00007');
        }
        if (
            revision &&
            concurrency.managed === true &&
            (!Number.isSafeInteger(identity[revision]) ||
                identity[revision] < 0)
        )
            throw new CLASSES.NodicsError('ERR_CPK_00007');
        return { ...identity };
    },
    /** Performs selected schema/capability/impact inspection using current native authority and no model or mutation. @param {Object} request Trusted command. @param {Object} configuration Effective config. @param {string} kind Fixed adapter intent. @returns {Promise<Object>} Minimized live metadata. */
    inspect: async function (request, configuration, kind) {
        try {
            const source = this.authorizeInspection(
                request,
                configuration,
                kind,
            );
            const body = request.body;
            if (
                !['schema', 'capabilities', 'deleteImpact'].includes(kind) ||
                !body ||
                typeof body !== 'object' ||
                Array.isArray(body) ||
                Object.keys(body).some(
                    (key) =>
                        !(
                            kind === 'deleteImpact'
                                ? ['schemaName', 'identity']
                                : ['schemaName']
                        ).includes(key),
                ) ||
                typeof body.schemaName !== 'string' ||
                !/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(body.schemaName) ||
                !this.selected(source, body.schemaName)
            )
                throw new CLASSES.NodicsError('ERR_CPK_00007');
            const impact = kind === 'deleteImpact';
            const descriptor = (await this.descriptors(request, source)).find(
                (row) => row.schemaName === body.schemaName,
            );
            if (
                !descriptor ||
                (impact && !descriptor.operations.includes('delete'))
            )
                throw new CLASSES.NodicsError('ERR_CPK_00016');
            const operation = this.inspectionOperation(descriptor, kind);
            const payload = impact
                ? {
                      identity: this.inspectionIdentity(
                          body.identity,
                          descriptor,
                      ),
                  }
                : undefined;
            this.reauthorize(request, source, kind);
            const data = this.responseData(
                await this.invoke(request, source, operation, payload),
            );
            this.reauthorize(request, source, kind);
            let items;
            let operations;
            if (impact) {
                if (
                    !Number.isSafeInteger(data.targetCount) ||
                    data.targetCount < 0 ||
                    data.targetCount > 1 ||
                    typeof data.blocked !== 'boolean'
                )
                    throw new CLASSES.NodicsError('ERR_CPK_00016');
                items = [
                    { targetCount: data.targetCount, blocked: data.blocked },
                ];
            } else {
                if (
                    data.moduleName !== source.module ||
                    data.schemaName !== body.schemaName ||
                    !Array.isArray(data.operations) ||
                    !data.operations.includes('search') ||
                    !this.searchOperation(data)
                )
                    throw new CLASSES.NodicsError('ERR_CPK_00016');
                items = this.inspectionFields(data);
                operations = data.operations.filter((value) =>
                    ['search', 'read', 'create', 'update', 'delete'].includes(
                        value,
                    ),
                );
            }
            const result = {
                contractVersion: 1,
                sourceCode: source.code,
                sourcePolicyDigest: source.sourcePolicyDigest,
                schemaName: body.schemaName,
                inspection: kind,
                observedAt: new Date().toISOString(),
                ...(operations
                    ? { advertisedOperations: [...new Set(operations)] }
                    : {}),
                items,
            };
            if (
                Buffer.byteLength(JSON.stringify(result)) > 262144 ||
                !SERVICE.DefaultCopilotKnowledgeSecretInspectionService.inspect(
                    JSON.stringify(result),
                ).safe
            )
                throw new CLASSES.NodicsError('ERR_CPK_00016');
            return result;
        } catch (error) {
            throw new CLASSES.NodicsError(
                ['ERR_CPK_00002', 'ERR_CPK_00007'].includes(error.code)
                    ? error.code
                    : 'ERR_CPK_00016',
            );
        }
    },
    /** Resolves only the active canonical schema read, never an arbitrary advertised POST. @param {Object} descriptor Native schema metadata. @returns {Object|null} Safe read declaration or unavailable. */
    searchOperation: function (descriptor) {
        const operation = descriptor?.apiOperations?.search;
        return typeof descriptor?.schemaName === 'string' &&
            operation?.active === true &&
            operation.method === 'POST' &&
            operation.path ===
                '/' + descriptor.schemaName.toLowerCase() + '/safe-search' &&
            /^v\d+$/.test(operation.apiVersion)
            ? operation
            : null;
    },
    /** Authorizes a current live source without accepting tenant or module overrides. @param {Object} request Trusted request. @param {Object} configuration Copilot config. @returns {Object} Scoped source. */
    authorize: function (request, configuration) {
        const runtime = SERVICE.DefaultCopilotKnowledgeRuntimeService;
        const policy = SERVICE.DefaultCopilotPolicyService;
        const context = runtime.securityContext(request, configuration);
        if (
            context.channel !== 'EMPLOYEE' ||
            context.tenant !== request.tenant ||
            !context.enterprise ||
            !policy.hasPermission(context, 'copilot.data.query')
        )
            throw new CLASSES.NodicsError('ERR_CPK_00002');
        const source = runtime
            .groupScope(configuration, context, request.knowledgeGroupCodes)
            .registry.sources.find(
                (item) =>
                    item.code === request.sourceCode &&
                    item.enabled &&
                    item.sourceType === 'DATABASE',
            );
        if (
            !source ||
            !policy.decideSourceAccess(source, context, configuration.policy)
                .allowed ||
            !source.tenantScopes.includes(context.tenant) ||
            !source.enterpriseScopes.includes(context.enterprise) ||
            !source.environmentScopes.includes(context.environment)
        )
            throw new CLASSES.NodicsError('ERR_CPK_00002');
        return source;
    },
    /** Uses the existing module transport with the employee credential and no internal-token fallback. @param {Object} request Trusted context. @param {Object} source Registered module source. @param {Object} operation Validated owner operation. @param {Object} body Inert request. @returns {Promise<Object>} Owner envelope. */
    invoke: function (request, source, operation, body) {
        if (
            !operation ||
            operation.active !== true ||
            !['GET', 'POST'].includes(operation.method) ||
            !/^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(operation.path) ||
            !/^v\d+$/.test(operation.apiVersion)
        )
            throw new CLASSES.NodicsError('ERR_CPK_00016');
        return SERVICE.DefaultModuleService.invokeModule({
            moduleName: source.module,
            tenant: request.tenant,
            local: false,
            apiName: operation.path,
            apiVersion: operation.apiVersion,
            methodName: operation.method,
            header: SERVICE.DefaultCopilotOrchestrationService.employeeExecutionHeaders(
                request,
            ),
            request: body,
            maxAttempts: 1,
        });
    },
    /** Fetches current authorized metadata from the module's canonical schema collection API. @param {Object} request Trusted request. @param {Object} source Authorized source. @returns {Promise<Array>} Current descriptors. */
    descriptors: async function (request, source) {
        const response = await this.invoke(request, source, {
            path: '/schemas',
            method: 'GET',
            apiVersion: 'v0',
            active: true,
        });
        const data = this.responseData(response);
        const rows = data.schemas;
        if (
            data.moduleName !== source.module ||
            !Array.isArray(rows) ||
            rows.length > 1000 ||
            new Set(rows.map((row) => row.schemaName)).size !== rows.length
        )
            throw new CLASSES.NodicsError('ERR_CPK_00016');
        return rows
            .filter(
                (row) =>
                    Array.isArray(row.operations) &&
                    row.operations.includes('search'),
            )
            .map((row) => {
                if (
                    row.moduleName !== source.module ||
                    typeof row.schemaName !== 'string' ||
                    !/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(row.schemaName) ||
                    typeof row.label !== 'string' ||
                    !row.label.trim() ||
                    row.label.length > 200
                )
                    throw new CLASSES.NodicsError('ERR_CPK_00016');
                return row;
            })
            .filter((row) => this.searchOperation(row));
    },
    /** Tests explicit collection narrowing; wildcard includes current eligible collections, exclusions always win. @param {Object} source Source. @param {string} name Collection. @returns {boolean} Selected. */
    selected: function (source, name) {
        return (
            (source.paths.includes('*') || source.paths.includes(name)) &&
            !source.excludedPaths.includes(name)
        );
    },
    /** Projects collection choices without records or secret schema internals. @param {Object} request Trusted request. @param {Object} configuration Copilot config. @returns {Promise<Object>} Collection inventory. */
    inventory: async function (request, configuration) {
        try {
            const source = this.authorize(request, configuration);
            const rows = await this.descriptors(request, source);
            if (
                this.authorize(
                    request,
                    SERVICE.DefaultCopilotKnowledgeRuntimeService.configuration(),
                ).sourcePolicyDigest !== source.sourcePolicyDigest
            )
                throw new CLASSES.NodicsError('ERR_CPK_00002');
            return {
                contractVersion: 1,
                sourceCode: source.code,
                sourcePolicyDigest: source.sourcePolicyDigest,
                observedAt: new Date().toISOString(),
                items: rows.map((row) => ({
                    schemaName: row.schemaName,
                    label: row.label,
                    selected: this.selected(source, row.schemaName),
                })),
            };
        } catch (error) {
            throw new CLASSES.NodicsError(
                error.code === 'ERR_CPK_00002' ? error.code : 'ERR_CPK_00016',
            );
        }
    },
    /** Performs one bounded safe search, with current source reauthorization before delivering owner-filtered data. @param {Object} request Trusted command. @param {Object} configuration Copilot config. @returns {Promise<Object>} Live records, not static knowledge. */
    query: async function (request, configuration) {
        try {
            const source = this.authorize(request, configuration);
            const body = request.body || {};
            if (
                Object.keys(body).some(
                    (key) => !['schemaName', 'search', 'page'].includes(key),
                ) ||
                typeof body.schemaName !== 'string' ||
                !/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(body.schemaName) ||
                typeof body.search !== 'string' ||
                !body.search.trim() ||
                body.search.length > 100 ||
                !Number.isSafeInteger(body.page ?? 1) ||
                (body.page ?? 1) < 1 ||
                (body.page ?? 1) > 1000 ||
                !this.selected(source, body.schemaName)
            )
                throw new CLASSES.NodicsError('ERR_CPK_00007');
            const descriptor = (await this.descriptors(request, source)).find(
                (row) => row.schemaName === body.schemaName,
            );
            const operation = this.searchOperation(descriptor);
            const sizes = descriptor?.queryCapabilities?.allowedPageSizes;
            const pageSize = Array.isArray(sizes)
                ? sizes
                      .filter(
                          (value) =>
                              Number.isSafeInteger(value) &&
                              value > 0 &&
                              value <= 25,
                      )
                      .sort((a, b) => b - a)[0]
                : undefined;
            if (
                !descriptor ||
                !operation ||
                !pageSize ||
                !Array.isArray(descriptor.fields)
            )
                throw new CLASSES.NodicsError('ERR_CPK_00016');
            if (
                this.authorize(
                    request,
                    SERVICE.DefaultCopilotKnowledgeRuntimeService.configuration(),
                ).sourcePolicyDigest !== source.sourcePolicyDigest
            )
                throw new CLASSES.NodicsError('ERR_CPK_00002');
            const response = await this.invoke(request, source, operation, {
                query: {
                    search: body.search,
                    pageSize,
                    pageNumber: body.page ?? 1,
                },
            });
            const data = response?.data;
            if (
                !/^SUC_/.test(response?.code || '') ||
                response.error ||
                !Array.isArray(data?.records) ||
                data.records.length > pageSize ||
                data.pageSize !== pageSize ||
                data.pageNumber !== (body.page ?? 1) ||
                Buffer.byteLength(JSON.stringify(data.records)) > 262144
            )
                throw new CLASSES.NodicsError('ERR_CPK_00016');
            const fields = new Set(
                descriptor.fields
                    .filter(
                        (field) =>
                            field.sensitive !== true && field.hidden !== true,
                    )
                    .map((field) => field.name),
            );
            const records = data.records.map((record) => {
                if (
                    !record ||
                    typeof record !== 'object' ||
                    Array.isArray(record)
                )
                    throw new CLASSES.NodicsError('ERR_CPK_00016');
                return Object.fromEntries(
                    Object.entries(record).filter(
                        ([key, value]) =>
                            fields.has(key) &&
                            (value === null ||
                                ['string', 'number', 'boolean'].includes(
                                    typeof value,
                                )),
                    ),
                );
            });
            const current = this.authorize(
                request,
                SERVICE.DefaultCopilotKnowledgeRuntimeService.configuration(),
            );
            if (current.sourcePolicyDigest !== source.sourcePolicyDigest)
                throw new CLASSES.NodicsError('ERR_CPK_00002');
            if (
                !SERVICE.DefaultCopilotKnowledgeSecretInspectionService.inspect(
                    JSON.stringify(records),
                ).safe
            )
                throw new CLASSES.NodicsError('ERR_CPK_00016');
            return {
                contractVersion: 1,
                sourceCode: source.code,
                sourcePolicyDigest: source.sourcePolicyDigest,
                schemaName: body.schemaName,
                page: body.page ?? 1,
                limit: pageSize,
                mayHaveMore: records.length === pageSize,
                observedAt: new Date().toISOString(),
                records,
            };
        } catch (error) {
            throw new CLASSES.NodicsError(
                ['ERR_CPK_00002', 'ERR_CPK_00007'].includes(error.code)
                    ? error.code
                    : 'ERR_CPK_00016',
            );
        }
    },
};
