/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/test/schemaWorkbenchContract
 * @description Verifies safe default model discovery, explicit exclusion,
 * permission filtering, field projection, managed-field protection, and
 * relationship discovery.
 * @layer test
 * @owner nDatabase
 * @override Later layers may extend fixtures while retaining these discovery
 * and ownership invariants.
 */

const assert = require('assert');
const routerDefinitions = require('../src/router/routers');
const generatedRouterDefinitions = require('../../../nRouter/src/router/routers');

const profileModule = {
    rawSchema: {
        nonModel: { definition: { code: { type: 'string' } } },
        hidden: {
            model: true,
            accessGroups: { adminGroup: 10 },
            backoffice: { enabled: false },
            definition: { code: { type: 'string' } },
        },
        enterprise: {
            model: true,
            accessGroups: { adminGroup: 10 },
            definition: {
                code: {
                    type: 'string',
                    primary: true,
                    searchOptions: { enabled: true },
                },
                name: { type: 'string' },
                description: { type: 'string' },
            },
        },
        address: {
            model: true,
            accessGroups: { adminGroup: 10 },
            backoffice: {
                enabled: true,
                operations: ['search', 'read', 'create', 'update', 'delete'],
                bulkOperations: ['DELETE'],
                relationships: {
                    contacts: {
                        targetModule: 'profile',
                        actions: ['SELECT_EXISTING', 'CREATE_RELATED'],
                    },
                },
            },
            definition: {
                code: {
                    type: 'string',
                    required: true,
                    primary: true,
                    searchOptions: { enabled: true },
                },
                password: { type: 'string' },
                accessGroups: { type: 'array' },
                created: { type: 'date', required: true },
                type: { enum: ['HOME', 'OFFICE'], required: true },
                contacts: {
                    type: 'array',
                    label: 'Contact methods',
                    description: 'Linked contacts',
                },
            },
            refSchema: {
                contacts: {
                    enabled: true,
                    schemaName: 'contact',
                    type: 'many',
                    propertyName: 'code',
                },
            },
        },
        employee: {
            model: true,
            accessGroups: { adminGroup: 10 },
            backoffice: {
                displayProperty: 'loginId',
                displayProperties: ['loginId', 'name.firstName', 'name.lastName'],
                searchableFields: ['loginId', 'code', 'name.firstName', 'name.lastName'],
                sortableFields: ['loginId', 'code', 'name.firstName', 'name.lastName'],
                filterFields: ['loginId', 'code', 'name.firstName', 'name.lastName'],
                defaultSortField: 'loginId',
                defaultSortDirection: 'ASC',
                excludedFields: ['apiKeyPrefix', 'apiKeyStatus', 'apiKeyCreatedAt', 'apiKeyExpiresAt', 'apiKeyScopes'],
            },
            definition: {
                code: {
                    type: 'string',
                    primary: true,
                    searchOptions: { enabled: true },
                },
                loginId: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                },
                name: { type: 'object', required: true },
                'name.firstName': {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                },
                'name.lastName': {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                },
                userGroups: { type: 'array', required: true },
                apiKeyPrefix: { type: 'string' },
                apiKeyStatus: { type: 'string' },
                apiKeyCreatedAt: { type: 'date' },
                apiKeyExpiresAt: { type: 'date' },
                apiKeyScopes: { type: 'array' },
                apiKey: { type: 'string' },
                apiKeyHash: { type: 'string' },
            },
        },
    },
};

const workflowModule = {
    rawSchema: {
        workflow: {
            model: false,
            accessGroups: { adminGroup: 10 },
            definition: {
                code: { type: 'string', primary: true },
            },
        },
        workflowAction: {
            model: true,
            accessGroups: { adminGroup: 10 },
            definition: {
                code: {
                    type: 'string',
                    primary: true,
                    searchOptions: { enabled: true },
                },
                position: { type: 'string' },
            },
        },
    },
};

const prefixedWorkflowModule = {
    metaData: {
        name: 'prefixedWorkflow',
        prefix: 'workflow',
    },
};

const paymentCoreModule = {
    metaData: {
        name: 'paymentCore',
        nodics: {
            schemaWorkbench: {
                schemaModule: 'workflow',
            },
        },
    },
};

global.NODICS = {
    getModule: (name) => {
        if (name === 'profile') return profileModule;
        if (name === 'workflow') return workflowModule;
        if (name === 'prefixedWorkflow') return prefixedWorkflowModule;
        if (name === 'paymentCore') return paymentCoreModule;
        return undefined;
    },
};
global.CONFIG = {
    get: (key) => {
        if (key === 'accessPoints') {
            return {
                readAccessPoint: 1,
                writeAccessPoint: 2,
                removeAccessPoint: 3,
            };
        }
        if (key === 'schemaWorkbench') {
            return {
                discoverModelsByDefault: true,
                defaultModelOperations: ['search', 'read', 'create', 'update', 'delete'],
                defaultRelationshipActions: ['SELECT_EXISTING', 'CREATE_RELATED'],
                defaultMutationMode: 'GENERATED_CRUD',
                defaultPageSize: 25,
                allowedPageSizes: [10, 25, 50],
                maximumPageSize: 50,
                maximumSearchLength: 100,
                maximumFilterConditions: 20,
                maximumFilterDepth: 3,
            };
        }
        return undefined;
    },
};
let lastSearchInput;
global.SERVICE = {
    DefaultSchemaSafeQueryService: require('../src/service/schema/defaultSchemaSafeQueryService'),
    DefaultSchemaAccessHandlerService: {
        getAccessPoint: (authData) => (authData.userGroups.includes('adminGroup') ? 10 : 0),
    },
    DefaultAddressService: {
        get: (input) => {
            lastSearchInput = input;
            return Promise.resolve({
                count: 1,
                result: [{ code: 'DXB-OFFICE', type: 'OFFICE' }],
            });
        },
    },
    DefaultEmployeeService: {
        get: (input) => {
            lastSearchInput = input;
            return Promise.resolve({
                count: 1,
                result: [{ code: 'admin', loginId: 'admin' }],
            });
        },
    },
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    },
};

const service = require('../src/service/schema/defaultSchemaWorkbenchService');
global.SERVICE.DefaultSchemaWorkbenchService = service;

(async function () {
    assert(
        generatedRouterDefinitions.default.commonGetterOperation.safeSearch,
        'Generated schema CRUD must expose a browser-safe search route template',
    );
    assert.deepStrictEqual(
        {
            key: generatedRouterDefinitions.default.commonGetterOperation.safeSearch.key,
            method: generatedRouterDefinitions.default.commonGetterOperation.safeSearch.method,
            operation: generatedRouterDefinitions.default.commonGetterOperation.safeSearch.operation,
        },
        {
            key: '/schemaName/safe-search',
            method: 'POST',
            operation: 'safeSearch',
        },
        'Generated schema CRUD safe search must be generic per schema and must not use Workbench-specific or screen-specific route patterns',
    );
    assert(
        generatedRouterDefinitions.default.commonGetterOperation.safeSearch.help.message.includes('generic admin/schema-driven tooling only')
        && generatedRouterDefinitions.default.commonGetterOperation.safeSearch.help.message.includes('Use module-owned domain APIs for business journeys'),
        'Generated safe-search Swagger/help text must warn developers that it is not a business API',
    );
    assert.deepStrictEqual(
        {
            key: generatedRouterDefinitions.default.commonGetterOperation.capabilities.key,
            method: generatedRouterDefinitions.default.commonGetterOperation.capabilities.method,
            operation: generatedRouterDefinitions.default.commonGetterOperation.capabilities.operation,
        },
        {
            key: '/schemaName/capabilities',
            method: 'GET',
            operation: 'capabilities',
        },
        'Generated schema CRUD utility APIs must expose capabilities generically per schema, not through Schema Workbench route sprawl',
    );
    assert(
        generatedRouterDefinitions.default.commonGetterOperation.capabilities.help.message.includes('generic admin/schema-driven tooling only')
        && generatedRouterDefinitions.default.commonGetterOperation.capabilities.help.message.includes('use module-owned domain APIs for business journeys'),
        'Generated capabilities Swagger/help text must warn developers that it is not a business API',
    );
    assert.deepStrictEqual(
        {
            key: generatedRouterDefinitions.default.commonRemoveOperations.deleteImpact.key,
            method: generatedRouterDefinitions.default.commonRemoveOperations.deleteImpact.method,
            operation: generatedRouterDefinitions.default.commonRemoveOperations.deleteImpact.operation,
        },
        {
            key: '/schemaName/delete-impact',
            method: 'POST',
            operation: 'deleteImpact',
        },
        'Generated schema CRUD utility APIs must expose delete-impact generically per schema, not through Schema Workbench route sprawl',
    );
    assert(
        generatedRouterDefinitions.default.commonRemoveOperations.deleteImpact.help.message.includes('generic admin/schema-driven tooling only')
        && generatedRouterDefinitions.default.commonRemoveOperations.deleteImpact.help.message.includes('use module-owned lifecycle APIs'),
        'Generated delete-impact Swagger/help text must warn developers that it is not a business lifecycle API',
    );
    let workbenchRoutes = routerDefinitions.common.schemaWorkbench;
    let allowedWorkbenchRouteKeys = [
        '/schema/workbench',
        '/schema/workbench/:schema',
        '/schema/workbench/:schema/records',
        '/schema/workbench/:schema/delete-impact',
        '/schema/workbench/:schema/record',
        '/schema/workbench/:schema/bulk',
        '/schema/workbench/:schema/aggregate',
    ];
    assert.deepStrictEqual(
        Object.values(workbenchRoutes).map((route) => route.key).sort(),
        allowedWorkbenchRouteKeys.slice().sort(),
        'Schema Workbench must not grow screen-specific or schema-specific API routes without an explicit architecture decision',
    );
    assert(
        Object.values(workbenchRoutes).every((route) => /^\/schema\/workbench(\/:schema)?(\/(records|delete-impact|record|bulk|aggregate))?$/.test(route.key)),
        'Schema Workbench route keys must remain generic by schema placeholder; custom projects must not inherit per-screen route sprawl',
    );
    let request = {
        moduleName: 'profile',
        authData: { userGroups: ['adminGroup'] },
        httpRequest: { params: { schema: 'address' } },
    };
    let listed = await service.list(request);
    assert.deepStrictEqual(listed.data.schemas.map((schema) => schema.schemaName).sort(), ['address', 'employee', 'enterprise'], 'all authorized model schemas must be searchable by default');
    assert.deepStrictEqual(
        listed.data.schemas.find((schema) => schema.schemaName === 'enterprise').operations,
        ['search', 'read', 'create', 'update', 'delete'],
        'authorized models must expose generated CRUD operations by default',
    );
    assert.deepStrictEqual(
        listed.data.schemas.find((schema) => schema.schemaName === 'enterprise').displayProperties,
        ['code', 'description'],
        'all models should expose the stable identity followed by description',
    );
    let descriptor = (await service.get(request)).data;
    assert.strictEqual(descriptor.schemaName, 'address');
    assert.deepStrictEqual(descriptor.operations, ['search', 'read', 'create', 'update', 'delete']);
    assert(!descriptor.fields.some((field) => field.name === 'password'), 'secret fields must never be projected');
    assert(!descriptor.fields.some((field) => field.name === 'accessGroups'), 'access policy fields must not be projected');
    assert.strictEqual(descriptor.fields.find((field) => field.name === 'created').readOnly, true);
    assert.strictEqual(descriptor.fields.find((field) => field.name === 'type').type, 'string');
    assert.deepStrictEqual(descriptor.displayProperties, ['code']);
    assert.deepStrictEqual(descriptor.queryCapabilities, {
        searchableFields: ['code'],
        sortableFields: ['code', 'created', 'type'],
        filterFields: [
            {
                field: 'code',
                label: 'Code',
                type: 'string',
                operators: ['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'STARTS_WITH'],
                enum: undefined,
            },
            {
                field: 'created',
                label: 'Created',
                type: 'date',
                operators: ['EQUALS', 'BEFORE', 'AFTER', 'BETWEEN'],
                enum: undefined,
            },
            {
                field: 'type',
                label: 'Type',
                type: 'string',
                operators: ['EQUALS', 'NOT_EQUALS', 'IN'],
                enum: ['HOME', 'OFFICE'],
            },
        ],
        groupOperators: ['AND', 'OR'],
        textOperator: 'CONTAINS',
        allowedPageSizes: [10, 25, 50],
        defaultPageSize: 25,
        maximumPageSize: 50,
        defaultSort: { field: 'code', direction: 'ASC' },
    });
    assert.deepStrictEqual(descriptor.relationships[0], {
        field: 'contacts',
        label: 'Contact methods',
        description: 'Linked contacts',
        targetModule: 'profile',
        targetSchema: 'contact',
        cardinality: 'MANY',
        referenceProperty: 'code',
        resolution: 'LOCAL_OR_REMOTE',
        actions: ['SELECT_EXISTING', 'CREATE_RELATED'],
        required: false,
        relationshipType: 'ASSOCIATION',
        ownership: 'SOURCE',
        inverseField: '',
        onTargetDelete: 'NONE',
        maximumDepth: 3,
        cycleHandling: 'SELECT_EXISTING',
        deleteImpactAvailable: false,
    });
    profileModule.rawSchema.enterprise.refSchema = {
        tenant: {
            enabled: true,
            schemaName: 'tenant',
            type: 'one',
            propertyName: 'code',
        },
    };
    let enterpriseDescriptor = (
        await service.get(
            Object.assign({}, request, {
                httpRequest: { params: { schema: 'enterprise' } },
            }),
        )
    ).data;
    assert.deepStrictEqual(
        enterpriseDescriptor.relationships[0].actions,
        ['SELECT_EXISTING', 'CREATE_RELATED'],
        'relationships inherit configurable create-related support unless a schema narrows it',
    );
    assert.deepStrictEqual(descriptor.bulkCapabilities, {
        operations: ['DELETE'],
        maximumItems: 100,
        idempotencyRequired: true,
        outcomeMode: 'AUTHORITATIVE_RESULT',
    });
    assert.deepStrictEqual(descriptor.concurrency, {
        mode: 'NONE',
        field: '',
        required: false,
    });
    assert.deepStrictEqual(descriptor.aggregateOperations, []);
    let denied = await service.list(
        Object.assign({}, request, {
            authData: { userGroups: ['employeeUserGroup'] },
        }),
    );
    assert.deepStrictEqual(denied.data.schemas, [], 'schemas without effective read access must not be disclosed');
    let workflowListedThroughApiModule = await service.list({
        moduleName: 'workflow',
        authData: { userGroups: ['adminGroup'] },
        httpRequest: {},
    });
    assert.strictEqual(
        workflowListedThroughApiModule.data.moduleName,
        'workflow',
        'Workbench must report the schema authority from the exported module hierarchy, not the API implementation module',
    );
    assert.deepStrictEqual(
        workflowListedThroughApiModule.data.schemas.map((schema) => schema.schemaName),
        ['workflowAction'],
        'Workbench must discover model schemas contributed to the workflow hierarchy through a prefixed API module',
    );
    let workflowActionThroughApiModule = (
        await service.get({
            moduleName: 'workflow',
            authData: { userGroups: ['adminGroup'] },
            httpRequest: { params: { schema: 'workflowAction' } },
        })
    ).data;
    assert.strictEqual(
        workflowActionThroughApiModule.moduleName,
        'workflow',
        'Workbench descriptors must keep workflow as the schema-owning module when reached through a prefixed workflow API surface',
    );
    let workflowListedThroughExplicitAlias = await service.list({
        moduleName: 'paymentCore',
        authData: { userGroups: ['adminGroup'] },
        httpRequest: {},
    });
    assert.strictEqual(
        workflowListedThroughExplicitAlias.data.moduleName,
        'workflow',
        'Workbench must support explicit schemaModule aliases without reusing router URL prefixes',
    );
    await assert.rejects(
        service.get(
            Object.assign({}, request, {
                httpRequest: { params: { schema: 'hidden' } },
            }),
        ),
        (error) => error.code === 'ERR_DBS_00004',
    );
    let searched = await service.search(
        Object.assign({}, request, {
            tenant: 'default',
            httpRequest: {
                params: { schema: 'address' },
                body: {
                    search: 'DXB.*',
                    pageNumber: 2,
                    pageSize: 10,
                    sort: { field: 'type', direction: 'DESC' },
                    filters: {
                        operator: 'AND',
                        items: [
                            {
                                field: 'type',
                                operator: 'IN',
                                value: ['OFFICE'],
                            },
                            {
                                operator: 'OR',
                                items: [
                                    {
                                        field: 'code',
                                        operator: 'STARTS_WITH',
                                        value: 'DXB.',
                                    },
                                    {
                                        field: 'created',
                                        operator: 'AFTER',
                                        value: '2026-01-01',
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        }),
    );
    assert.strictEqual(searched.data.totalCount, 1);
    assert.deepStrictEqual(searched.data.records, [{ code: 'DXB-OFFICE', type: 'OFFICE' }]);
    assert.deepStrictEqual(searched.data.sort, {
        field: 'type',
        direction: 'DESC',
    });
    assert.deepStrictEqual(lastSearchInput.query, {
        $and: [
            { $or: [{ code: { $regex: 'DXB\\.\\*', $options: 'i' } }] },
            {
                $and: [
                    { type: { $in: ['OFFICE'] } },
                    {
                        $or: [{ code: { $regex: '^DXB\\.', $options: 'i' } }, { created: { $gt: new Date('2026-01-01') } }],
                    },
                ],
            },
        ],
    });
    assert.deepStrictEqual(
        lastSearchInput.searchOptions.projection,
        {
            _id: 0,
            code: 1,
            created: 1,
            type: 1,
            contacts: 1,
        },
        'record search must project only descriptor-safe Workbench fields',
    );
    let employeeDescriptor = (
        await service.get(
            Object.assign({}, request, {
                httpRequest: { params: { schema: 'employee' } },
            }),
        )
    ).data;
    assert.deepStrictEqual(
        employeeDescriptor.displayProperties,
        ['loginId', 'name.firstName', 'name.lastName'],
        'employee Workbench descriptor must use configured non-secret identity fields',
    );
    assert.strictEqual(
        employeeDescriptor.displayProperty,
        'loginId',
        'employee Workbench descriptor must use login id as the configured display identity',
    );
    assert.deepStrictEqual(
        employeeDescriptor.queryCapabilities.searchableFields,
        ['loginId', 'code', 'name.firstName', 'name.lastName'],
        'employee Workbench descriptor must use configured searchable identity fields',
    );
    assert.deepStrictEqual(
        employeeDescriptor.queryCapabilities.sortableFields,
        ['loginId', 'code', 'name.firstName', 'name.lastName'],
        'employee Workbench descriptor must use configured sortable identity fields',
    );
    assert.deepStrictEqual(
        employeeDescriptor.queryCapabilities.defaultSort,
        { field: 'loginId', direction: 'ASC' },
        'employee Workbench descriptor must default to login id sorting',
    );
    assert(!employeeDescriptor.fields.some((field) => field.name === 'apiKey'), 'employee Workbench descriptor must never expose plaintext API key');
    assert(!employeeDescriptor.fields.some((field) => field.name === 'apiKeyHash'), 'employee Workbench descriptor must never expose API-key hash');
    assert(!employeeDescriptor.fields.some((field) => field.name === 'apiKeyPrefix'), 'employee Workbench descriptor must allow profile to exclude non-secret credential metadata');
    let employeeSearch = await service.search(
        Object.assign({}, request, {
            tenant: 'default',
            httpRequest: {
                params: { schema: 'employee' },
                body: {
                    search: 'admin',
                    pageNumber: 1,
                    pageSize: 10,
                    sort: { field: 'loginId', direction: 'ASC' },
                },
            },
        }),
    );
    assert.strictEqual(employeeSearch.data.totalCount, 1);
    assert.deepStrictEqual(
        lastSearchInput.options,
        { recursive: false },
        'employee Schema Workbench search must ask the generated service for a flat record projection',
    );
    assert.deepStrictEqual(
        lastSearchInput.searchOptions.projection,
        {
            _id: 0,
            code: 1,
            loginId: 1,
            'name.firstName': 1,
            'name.lastName': 1,
            userGroups: 1,
        },
        'employee Schema Workbench search must project only explicitly safe employee fields without parent-child path collisions',
    );
    assert.deepStrictEqual(
        service.buildRecordProjection({
            displayProperty: 'code',
            displayProperties: ['code', 'description', 'apiKeyHash'],
            fields: [
                { name: 'active' },
                { name: 'description' },
                { name: 'properties' },
            ],
        }),
        {
            _id: 0,
            active: 1,
            description: 1,
            properties: 1,
            code: 1,
        },
        'record projection must include configured display identity fields used by relationship pickers without accepting secret presentation fields',
    );
    assert.deepStrictEqual(
        service.buildSearchInput(
            {
                query: {
                    search: 'DXB',
                    filters: {
                        operator: 'AND',
                        items: [
                            {
                                field: 'code',
                                operator: 'EQUALS',
                                value: 'DXB',
                            },
                        ],
                    },
                    pageNumber: 1,
                    pageSize: 10,
                    sort: { field: 'code', direction: 'ASC' },
                },
            },
            descriptor,
        ).query,
        {
            $and: [
                { $or: [{ code: { $regex: 'DXB', $options: 'i' } }] },
                { $and: [{ code: 'DXB' }] },
            ],
        },
        'Schema Workbench must honor the Axis { query } envelope for search and fixed filters',
    );
    let generatedSafeSearch = await global.SERVICE.DefaultSchemaSafeQueryService.searchGenerated({
        tenant: 'default',
        authData: { userGroups: ['adminGroup'] },
        moduleName: 'profile',
        schemaName: 'address',
        generatedServiceName: 'DefaultAddressService',
        browserQuery: {
            query: {
                search: 'DXB',
                pageNumber: 1,
                pageSize: 10,
                sort: { field: 'code', direction: 'ASC' },
            },
        },
    });
    assert.strictEqual(generatedSafeSearch.data.totalCount, 1);
    assert.deepStrictEqual(
        lastSearchInput.query,
        { $or: [{ code: { $regex: 'DXB', $options: 'i' } }] },
        'Generated CRUD safe search must translate browser-safe search into backend-owned generated read input',
    );
    assert.deepStrictEqual(
        lastSearchInput.options,
        { recursive: false },
        'Generated CRUD safe search must keep generated read traversal bounded',
    );
    global.SERVICE.DefaultSchemaUtilityService = require('../src/service/schema/defaultSchemaUtilityService');
    let generatedCapabilities = await global.SERVICE.DefaultSchemaUtilityService.capabilitiesGenerated({
        tenant: 'default',
        authData: { userGroups: ['adminGroup'] },
        moduleName: 'profile',
        schemaName: 'address',
    });
    assert.strictEqual(generatedCapabilities.data.schemaName, 'address');
    assert.deepStrictEqual(
        generatedCapabilities.data.queryCapabilities.searchableFields,
        ['code'],
        'Generated schema capabilities must expose the same browser-safe query contract Axis needs without calling the Workbench descriptor route',
    );
    assert.throws(
        () =>
            service.buildSearchInput(
                {
                    filters: {
                        operator: 'AND',
                        items: [
                            {
                                field: 'password',
                                operator: 'EQUALS',
                                value: 'secret',
                            },
                        ],
                    },
                },
                descriptor,
            ),
        (error) => error.code === 'ERR_DBS_00003',
    );
    assert.throws(
        () =>
            service.buildSearchInput(
                {
                    filters: {
                        operator: 'AND',
                        items: [
                            {
                                field: 'code',
                                operator: 'RAW_QUERY',
                                value: '{}',
                            },
                        ],
                    },
                },
                descriptor,
            ),
        (error) => error.code === 'ERR_DBS_00003',
    );
    assert.throws(
        () =>
            service.buildSearchInput(
                {
                    filters: {
                        operator: 'AND',
                        items: Array.from({ length: 21 }, () => {
                            return {
                                field: 'code',
                                operator: 'EQUALS',
                                value: 'DXB',
                            };
                        }),
                    },
                },
                descriptor,
            ),
        (error) => error.code === 'ERR_DBS_00003',
    );
    assert.throws(
        () =>
            service.buildSearchInput(
                {
                    filters: {
                        operator: 'AND',
                        items: [
                            {
                                operator: 'AND',
                                items: [
                                    {
                                        operator: 'AND',
                                        items: [
                                            {
                                                operator: 'AND',
                                                items: [
                                                    {
                                                        field: 'code',
                                                        operator: 'EQUALS',
                                                        value: 'DXB',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                },
                descriptor,
            ),
        (error) => error.code === 'ERR_DBS_00003',
    );
    assert.throws(
        () =>
            service.search(
                Object.assign({}, request, {
                    tenant: 'default',
                    httpRequest: {
                        params: { schema: 'address' },
                        body: { pageNumber: 1, pageSize: 100 },
                    },
                }),
            ),
        (error) => error.code === 'ERR_DBS_00003',
    );
    console.log('Schema Workbench discovery contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
