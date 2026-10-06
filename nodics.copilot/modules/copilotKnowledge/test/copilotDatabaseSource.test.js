/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module copilotKnowledge/test/copilotDatabaseSource @description Verifies default eligible collection inclusion, explicit exclusions and current domain API authority without direct persistence. @layer test @owner copilotKnowledge */
const test = require('node:test');
const assert = require('node:assert/strict');
const database = require('../src/service/defaultCopilotDatabaseSourceService');
const registry = require('../src/service/defaultCopilotKnowledgeSourceRegistryService');
const runtime = require('../src/service/defaultCopilotKnowledgeRuntimeService');
const policy = require('../../copilotPolicy/src/service/defaultCopilotPolicyService');

/** Installs explicit live-source policy and isolated domain transports. @param {Object} t Test. @returns {Object} Fixture. */
function fixture(t) {
    const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    t.after(() => Object.assign(global, previous));
    const configuration = structuredClone(
        require('../config/properties').copilot,
    );
    configuration.policy = structuredClone(
        require('../../copilotPolicy/config/properties').copilot.policy,
    );
    const source = {
        code: 'business-data',
        repository: 'runtime',
        project: 'project',
        module: 'sample',
        owner: 'sample',
        version: '1',
        sourceType: 'DATABASE',
        classification: 'RESTRICTED',
        paths: ['*'],
        excludedPaths: ['policy'],
        allowedChannels: ['EMPLOYEE'],
        requiredPermissions: ['copilot.data.query'],
        tenantScopes: ['tenant'],
        enterpriseScopes: ['enterprise'],
        environmentScopes: ['test'],
        secretScanPolicy: 'REQUIRED',
        enabled: true,
    };
    configuration.knowledge.sourceRegistry.definitions = [source];
    const request = {
        tenant: 'tenant',
        sourceCode: source.code,
        authData: { loginId: 'employee', enterpriseCode: 'enterprise' },
        securityContext: {
            actor: 'employee',
            tenant: 'tenant',
            enterprise: 'enterprise',
            environment: 'test',
            channel: 'EMPLOYEE',
            permissions: [
                'copilot.data.query',
                'copilot.knowledge.restricted.read',
            ],
        },
        httpRequest: { headers: { authorization: 'Bearer employee-token' } },
        body: { schemaName: 'employee', search: 'Alice', page: 1 },
    };
    const descriptor = {
        moduleName: 'sample',
        schemaName: 'employee',
        label: 'Employees',
        operations: ['search'],
        apiOperations: {
            search: {
                path: '/employee/safe-search',
                method: 'POST',
                apiVersion: 'v0',
                active: true,
            },
        },
        queryCapabilities: { allowedPageSizes: [10, 25, 50] },
        fields: [
            { name: 'code' },
            { name: 'name' },
            { name: 'secret', sensitive: true },
        ],
    };
    const records = [
        {
            code: 'employee-one',
            name: 'Alice',
            secret: 'hidden',
            nested: { token: 'hidden' },
        },
    ];
    const calls = [];
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code) {
                super(code);
                this.code = code;
            }
        },
    };
    global.SERVICE = {
        DefaultCopilotKnowledgeRuntimeService: {
            ...runtime,
            configuration: () => configuration,
        },
        DefaultCopilotKnowledgeSourceRegistryService: registry,
        DefaultCopilotPolicyService: policy,
        DefaultCopilotKnowledgeSecretInspectionService: {
            inspect: () => ({ safe: true }),
        },
        DefaultCopilotOrchestrationService: require('../../copilotCore/src/service/defaultCopilotOrchestrationService'),
        DefaultModuleService: {
            invokeModule: async (input) => {
                calls.push(input);
                return input.apiName === '/schemas'
                    ? {
                          code: 'SUC_TEST',
                          data: {
                              moduleName: 'sample',
                              schemas: [
                                  descriptor,
                                  {
                                      ...descriptor,
                                      schemaName: 'policy',
                                      label: 'Policies',
                                      apiOperations: {
                                          search: {
                                              ...descriptor.apiOperations
                                                  .search,
                                              path: '/policy/safe-search',
                                          },
                                      },
                                  },
                              ],
                          },
                      }
                    : {
                          code: 'SUC_TEST',
                          data: { records, pageSize: 25, pageNumber: 1 },
                      };
            },
        },
    };
    return { configuration, source, request, descriptor, records, calls };
}

test('default eligible collections remain included and exclusions win without reading records', async (t) => {
    const f = fixture(t);
    const result = await database.inventory(f.request, f.configuration);
    assert.deepEqual(
        result.items.map((item) => [item.schemaName, item.selected]),
        [
            ['employee', true],
            ['policy', false],
        ],
    );
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].methodName, 'GET');
    assert.equal(f.calls[0].header.Authorization, 'Bearer employee-token');
    assert.equal(f.calls[0].header['x-enterprise-code'], 'enterprise');
});

test('an empty conversation group selection denies before schema or record transport', async (t) => {
    const f = fixture(t);
    global.SERVICE.DefaultCopilotKnowledgeGroupService = require('../src/service/defaultCopilotKnowledgeGroupService');
    f.configuration.knowledge.groups = {
        enabled: true,
        definitions: [
            {
                code: 'business',
                name: 'Business',
                active: true,
                sourceCodes: [f.source.code],
            },
        ],
        assignments: [
            {
                tenantCode: 'tenant',
                enterpriseCode: 'enterprise',
                groupCodes: ['business'],
                allowedSourceCodes: [f.source.code],
            },
        ],
    };
    await assert.rejects(
        database.query(
            { ...f.request, knowledgeGroupCodes: [] },
            f.configuration,
        ),
        { code: 'ERR_CPK_00002' },
    );
    assert.equal(f.calls.length, 0);
    const result = await database.query(
        { ...f.request, knowledgeGroupCodes: ['business'] },
        f.configuration,
    );
    assert.equal(result.records.length, 1);
});

test('live search uses owner-advertised operation and employee authorization, never raw database input', async (t) => {
    const f = fixture(t);
    const result = await database.query(f.request, f.configuration);
    assert.equal(f.calls[1].apiName, '/employee/safe-search');
    assert.equal(f.calls[1].maxAttempts, 1);
    assert.equal(f.calls[1].local, false);
    assert.deepEqual(f.calls[1].request, {
        query: { search: 'Alice', pageSize: 25, pageNumber: 1 },
    });
    assert.deepEqual(result.records, [{ code: 'employee-one', name: 'Alice' }]);
});

test('excluded collections, missing grants, foreign scope and operator input never invoke record reads', async (t) => {
    const f = fixture(t);
    for (const body of [
        { schemaName: 'policy', search: 'Alice' },
        { schemaName: 'employee', search: { $ne: null } },
        { schemaName: 'employee', search: 'Alice', query: {} },
    ])
        await assert.rejects(
            database.query({ ...f.request, body }, f.configuration),
        );
    await assert.rejects(
        database.query(
            {
                ...f.request,
                securityContext: {
                    ...f.request.securityContext,
                    enterprise: 'other',
                },
            },
            f.configuration,
        ),
    );
    await assert.rejects(
        database.query(
            {
                ...f.request,
                securityContext: {
                    ...f.request.securityContext,
                    permissions: [],
                },
            },
            f.configuration,
        ),
    );
    assert.equal(f.calls.length, 0);
});

test('disabled or external operation declarations fail before domain invocation', async (t) => {
    const f = fixture(t);
    f.descriptor.apiOperations.search.active = false;
    await assert.rejects(database.query(f.request, f.configuration));
    assert.equal(f.calls.length, 1);
    f.descriptor.apiOperations.search.active = true;
    f.descriptor.apiOperations.search.path = 'https://elsewhere.invalid';
    await assert.rejects(database.query(f.request, f.configuration));
    assert.equal(f.calls.length, 2);
});

test('data never enters static retrieval and source revocation withholds returned records', async (t) => {
    const f = fixture(t);
    const normalized = runtime.registry(f.configuration);
    assert.deepEqual(
        registry.listAccessible(
            normalized,
            f.request.securityContext,
            f.configuration.policy,
            policy,
        ),
        [],
    );
    const invoke = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async (input) => {
        const result = await invoke(input);
        if (input.methodName === 'POST')
            f.source.excludedPaths.push('employee');
        return result;
    };
    await assert.rejects(database.query(f.request, f.configuration), {
        code: 'ERR_CPK_00002',
    });
});

test('foreign descriptor ownership fails before a record request', async (t) => {
    const f = fixture(t);
    f.descriptor.moduleName = 'foreign';
    await assert.rejects(database.query(f.request, f.configuration), {
        code: 'ERR_CPK_00016',
    });
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].apiName, '/schemas');
});

for (const patch of [
    { path: '/employee/delete' },
    { path: '/policy/safe-search' },
    { path: '/employee/safe-search?includeSecrets=true' },
    { path: '/employee/../policy/safe-search' },
    { method: 'PUT' },
    { apiVersion: '../v0' },
    { active: false },
])
    test(
        'non-read declarations never reach records: ' + JSON.stringify(patch),
        async (t) => {
            const f = fixture(t);
            Object.assign(f.descriptor.apiOperations.search, patch);
            await assert.rejects(database.query(f.request, f.configuration), {
                code: 'ERR_CPK_00016',
            });
            assert.equal(f.calls.length, 1);
            const choices = await database.inventory(
                f.request,
                f.configuration,
            );
            assert.equal(
                choices.items.some((item) => item.schemaName === 'employee'),
                false,
            );
        },
    );

test('success-shaped native errors never become collection or record evidence', async (t) => {
    const f = fixture(t);
    const invoke = SERVICE.DefaultModuleService.invokeModule;
    let failDiscovery = true;
    SERVICE.DefaultModuleService.invokeModule = async (input) => {
        const response = await invoke(input);
        if (failDiscovery || input.methodName === 'POST')
            response.error = { code: 'DENIED' };
        return response;
    };
    await assert.rejects(database.inventory(f.request, f.configuration), {
        code: 'ERR_CPK_00016',
    });
    failDiscovery = false;
    await assert.rejects(database.query(f.request, f.configuration), {
        code: 'ERR_CPK_00016',
    });
});

test('later layers may narrow search admission without copying source or transport', async (t) => {
    const f = fixture(t);
    const narrowed = { ...database, searchOperation: () => null };
    assert.deepEqual(
        (await narrowed.inventory(f.request, f.configuration)).items,
        [],
    );
    await assert.rejects(narrowed.query(f.request, f.configuration), {
        code: 'ERR_CPK_00016',
    });
    assert.equal(
        f.calls.every((call) => call.apiName === '/schemas'),
        true,
    );
});

test('revocation while native metadata is loading prevents the subsequent record read', async (t) => {
    const f = fixture(t);
    const invoke = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async (input) => {
        const result = await invoke(input);
        f.source.excludedPaths.push('employee');
        return result;
    };
    await assert.rejects(database.query(f.request, f.configuration), {
        code: 'ERR_CPK_00002',
    });
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].methodName, 'GET');
});

/** Extends the existing source fixture with real native inspection-shaped contracts. @param {Object} t Test. @returns {Object} Inspection fixture. */
function inspectionFixture(t) {
    const f = fixture(t);
    f.descriptor.operations = ['read', 'search', 'delete'];
    f.descriptor.displayProperty = 'code';
    f.descriptor.concurrency = {
        mode: 'COMPARE_AND_SET',
        field: 'revision',
        required: true,
        managed: true,
    };
    f.descriptor.fields = [
        { name: 'code', label: 'Code', type: 'string', primary: true },
        {
            name: 'name',
            label: 'Name',
            type: 'string',
            required: true,
            default: 'private-value',
            reference: { schemaName: 'excluded' },
        },
        { name: 'revision', label: 'Revision', type: 'number', readOnly: true },
        { name: 'secret', label: 'Secret', type: 'string', sensitive: true },
        { name: 'hidden', label: 'Hidden', type: 'string', hidden: true },
    ];
    f.descriptor.apiOperations.capabilities = {
        path: '/employee/capabilities',
        method: 'GET',
        active: true,
        apiVersion: 'v0',
    };
    f.descriptor.apiOperations.deleteImpact = {
        path: '/employee/delete-impact',
        method: 'POST',
        active: true,
        apiVersion: 'v0',
    };
    f.request.body = { schemaName: 'employee' };
    const original = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async (input) => {
        if (input.apiName === '/schemas') return original(input);
        f.calls.push(input);
        if (
            ['/schemas/employee', '/employee/capabilities'].includes(
                input.apiName,
            )
        )
            return { code: 'SUC_TEST', data: structuredClone(f.descriptor) };
        if (input.apiName === '/employee/delete-impact')
            return {
                code: 'SUC_TEST',
                data: {
                    targetCount: 1,
                    blocked: true,
                    relationships: [
                        { sourceSchema: 'excluded', referenceCount: 42 },
                    ],
                },
            };
        assert.fail('Unexpected native operation: ' + input.apiName);
    };
    return f;
}

for (const kind of ['schema', 'capabilities']) {
    test(
        kind +
            ' inspection uses exact native owner with minimized fields and original employee',
        async (t) => {
            const f = inspectionFixture(t);
            const result = await database.inspect(
                f.request,
                f.configuration,
                kind,
            );
            assert.equal(f.calls.length, 2);
            assert.equal(
                f.calls[1].apiName,
                kind === 'schema'
                    ? '/schemas/employee'
                    : '/employee/capabilities',
            );
            assert.equal(
                f.calls[1].header.Authorization,
                'Bearer employee-token',
            );
            assert.equal(f.calls[1].header['x-enterprise-code'], 'enterprise');
            assert.equal(f.calls[1].request, undefined);
            assert.equal(f.calls[1].maxAttempts, 1);
            assert.deepEqual(
                result.items.map((x) => x.name),
                ['code', 'name', 'revision'],
            );
            assert.doesNotMatch(
                JSON.stringify(result),
                /private-value|excluded|secret|hidden|apiOperations|\/schemas/,
            );
            assert.deepEqual(result.advertisedOperations, [
                'read',
                'search',
                'delete',
            ]);
        },
    );
}

test('deletion impact requires independent preparation admission and exact native identity, never mutates or leaks relationships', async (t) => {
    const f = inspectionFixture(t);
    f.request.body.identity = { code: 'one', revision: 2 };
    await assert.rejects(
        database.inspect(f.request, f.configuration, 'deleteImpact'),
        { code: 'ERR_CPK_00002' },
    );
    assert.equal(f.calls.length, 0);
    f.request.securityContext.permissions.push('copilot.mutation.prepare');
    const result = await database.inspect(
        f.request,
        f.configuration,
        'deleteImpact',
    );
    assert.equal(f.calls[1].apiName, '/employee/delete-impact');
    assert.deepEqual(f.calls[1].request, {
        identity: { code: 'one', revision: 2 },
    });
    assert.deepEqual(result.items, [{ targetCount: 1, blocked: true }]);
    assert.doesNotMatch(JSON.stringify(result), /excluded|42|relationships/);
});

for (const kind of ['schema', 'capabilities', 'deleteImpact']) {
    test(
        kind +
            ' denies excluded, public, foreign and ungranted contexts before transport',
        async (t) => {
            const f = inspectionFixture(t);
            f.request.securityContext.permissions.push(
                'copilot.mutation.prepare',
            );
            for (const request of [
                { ...f.request, body: { schemaName: 'policy' } },
                { ...f.request, body: { schemaName: '../employee' } },
                {
                    ...f.request,
                    body: { schemaName: 'employee', path: '/other' },
                },
                {
                    ...f.request,
                    securityContext: {
                        ...f.request.securityContext,
                        channel: 'PUBLIC',
                    },
                },
                {
                    ...f.request,
                    securityContext: {
                        ...f.request.securityContext,
                        enterprise: 'foreign',
                    },
                },
                {
                    ...f.request,
                    securityContext: {
                        ...f.request.securityContext,
                        permissions: [],
                    },
                },
            ])
                await assert.rejects(
                    database.inspect(request, f.configuration, kind),
                );
            assert.equal(f.calls.length, 0);
        },
    );
    test(
        kind +
            ' withholds stale-policy results and prevents subsequent native invocation after revocation',
        async (t) => {
            const f = inspectionFixture(t);
            f.request.securityContext.permissions.push(
                'copilot.mutation.prepare',
            );
            f.request.body = {
                schemaName: 'employee',
                ...(kind === 'deleteImpact'
                    ? { identity: { code: 'one', revision: 2 } }
                    : {}),
            };
            const invoke = SERVICE.DefaultModuleService.invokeModule;
            let revokeAt = 2;
            SERVICE.DefaultModuleService.invokeModule = async (input) => {
                const result = await invoke(input);
                if (f.calls.length === revokeAt)
                    f.source.excludedPaths.push('employee');
                return result;
            };
            await assert.rejects(
                database.inspect(f.request, f.configuration, kind),
                { code: 'ERR_CPK_00002' },
            );
            assert.equal(f.calls.length, 2);
            f.source.excludedPaths = ['policy'];
            f.calls.length = 0;
            revokeAt = 1;
            await assert.rejects(
                database.inspect(f.request, f.configuration, kind),
                { code: 'ERR_CPK_00002' },
            );
            assert.equal(f.calls.length, 1);
        },
    );
}

test('impact rechecks the independent grant after metadata and result waits', async (t) => {
    const f = inspectionFixture(t);
    f.request.body.identity = { code: 'one', revision: 2 };
    const invoke = SERVICE.DefaultModuleService.invokeModule;
    for (const revokeAt of [1, 2]) {
        f.calls.length = 0;
        f.request.securityContext.permissions.push('copilot.mutation.prepare');
        SERVICE.DefaultModuleService.invokeModule = async (input) => {
            const result = await invoke(input);
            if (f.calls.length === revokeAt)
                f.request.securityContext.permissions =
                    f.request.securityContext.permissions.filter(
                        (x) => x !== 'copilot.mutation.prepare',
                    );
            return result;
        };
        await assert.rejects(
            database.inspect(f.request, f.configuration, 'deleteImpact'),
            { code: 'ERR_CPK_00002' },
        );
        assert.equal(f.calls.length, revokeAt);
    }
});

for (const patch of [
    { path: '/employee/remove' },
    { path: '/policy/capabilities' },
    { method: 'DELETE' },
    { active: false },
    { apiVersion: '../v0' },
]) {
    test(
        'capability route injection is rejected: ' + JSON.stringify(patch),
        async (t) => {
            const f = inspectionFixture(t);
            Object.assign(f.descriptor.apiOperations.capabilities, patch);
            await assert.rejects(
                database.inspect(f.request, f.configuration, 'capabilities'),
                { code: 'ERR_CPK_00016' },
            );
            assert.equal(f.calls.length, 1);
        },
    );
}

test('impact rejects missing, operator, foreign and stale-shaped identities before native inspection', async (t) => {
    const f = inspectionFixture(t);
    f.request.securityContext.permissions.push('copilot.mutation.prepare');
    for (const identity of [
        undefined,
        {},
        { code: 'one' },
        { code: { $ne: null }, revision: 1 },
        { code: 'one', revision: -1 },
        { code: 'one', revision: '1' },
        { code: 'one', revision: 1, enterpriseCode: 'foreign' },
    ]) {
        f.calls.length = 0;
        await assert.rejects(
            database.inspect(
                { ...f.request, body: { schemaName: 'employee', identity } },
                f.configuration,
                'deleteImpact',
            ),
            { code: 'ERR_CPK_00007' },
        );
        assert.equal(f.calls.length, 1);
    }
});

test('malformed, contradictory and foreign metadata never become conversational evidence', async (t) => {
    const f = inspectionFixture(t);
    const invoke = SERVICE.DefaultModuleService.invokeModule;
    for (const modify of [
        (response) => {
            response.error = 'denied';
        },
        (response) => {
            response.success = false;
        },
        (response) => {
            response.data.errors = ['failed'];
        },
        (response) => {
            response.data.moduleName = 'foreign';
        },
        (response) => {
            response.data.schemaName = 'policy';
        },
        (response) => {
            response.data.fields.push(response.data.fields[0]);
        },
        (response) => {
            response.data.fields[0].label = 'x'.repeat(201);
        },
        (response) => {
            response.data.operations = [];
        },
    ]) {
        SERVICE.DefaultModuleService.invokeModule = async (input) => {
            const response = await invoke(input);
            if (input.apiName !== '/schemas') modify(response);
            return response;
        };
        await assert.rejects(
            database.inspect(f.request, f.configuration, 'schema'),
            { code: 'ERR_CPK_00016' },
        );
    }
});

test('secret inspection and later-layer field projection remain enforced extension points', async (t) => {
    const f = inspectionFixture(t);
    const narrowed = { ...database, inspectionFields: () => [] };
    assert.deepEqual(
        (await narrowed.inspect(f.request, f.configuration, 'schema')).items,
        [],
    );
    SERVICE.DefaultCopilotKnowledgeSecretInspectionService.inspect = () => ({
        safe: false,
    });
    await assert.rejects(
        database.inspect(f.request, f.configuration, 'schema'),
        { code: 'ERR_CPK_00016' },
    );
});

test('impact refuses undeclared delete, substituted routes and contradictory or unbounded results', async (t) => {
    const f = inspectionFixture(t);
    f.request.securityContext.permissions.push('copilot.mutation.prepare');
    f.request.body.identity = { code: 'one', revision: 2 };
    f.descriptor.operations = ['search', 'read'];
    await assert.rejects(
        database.inspect(f.request, f.configuration, 'deleteImpact'),
        { code: 'ERR_CPK_00016' },
    );
    assert.equal(f.calls.length, 1);
    f.descriptor.operations.push('delete');
    const original = { ...f.descriptor.apiOperations.deleteImpact };
    for (const patch of [
        { path: '/employee/bulk' },
        { path: '/policy/delete-impact' },
        { method: 'DELETE' },
        { active: false },
    ]) {
        f.calls.length = 0;
        f.descriptor.apiOperations.deleteImpact = { ...original, ...patch };
        await assert.rejects(
            database.inspect(f.request, f.configuration, 'deleteImpact'),
            { code: 'ERR_CPK_00016' },
        );
        assert.equal(f.calls.length, 1);
    }
    f.descriptor.apiOperations.deleteImpact = original;
    const invoke = SERVICE.DefaultModuleService.invokeModule;
    for (const patch of [
        { targetCount: 2 },
        { targetCount: -1 },
        { targetCount: 0.5 },
        { blocked: 'false' },
        { error: 'denied' },
        { success: false },
    ]) {
        SERVICE.DefaultModuleService.invokeModule = async (input) => {
            const result = await invoke(input);
            if (input.apiName.endsWith('/delete-impact'))
                Object.assign(result.data, patch);
            return result;
        };
        await assert.rejects(
            database.inspect(f.request, f.configuration, 'deleteImpact'),
            { code: 'ERR_CPK_00016' },
        );
    }
});

test('native form-hidden fields are omitted and a narrowed projection cannot bypass final bounds', async (t) => {
    const f = inspectionFixture(t);
    f.descriptor.form = { hiddenFields: ['name'] };
    assert.deepEqual(
        (
            await database.inspect(f.request, f.configuration, 'schema')
        ).items.map((row) => row.name),
        ['code', 'revision'],
    );
    const oversized = {
        ...database,
        inspectionFields: () => [{ label: 'x'.repeat(262145) }],
    };
    await assert.rejects(
        oversized.inspect(f.request, f.configuration, 'schema'),
        { code: 'ERR_CPK_00016' },
    );
});
