/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module copilotKnowledge/test/copilotKnowledgeGroups @description Proves restrictive group assignment, source ceilings and pre-search isolation with canonical policy and retrieval. @layer test @owner copilotKnowledge */
const test = require('node:test');
const assert = require('node:assert/strict');
const groups = require('../src/service/defaultCopilotKnowledgeGroupService');
const registryService = require('../src/service/defaultCopilotKnowledgeSourceRegistryService');
const retrieval = require('../src/service/defaultCopilotKnowledgeRetrievalService');
const runtime = require('../src/service/defaultCopilotKnowledgeRuntimeService');
const policy = require('../../copilotPolicy/src/service/defaultCopilotPolicyService');
const defaults = require('../config/properties').copilot;

/** Creates independent canonical source definitions and restrictive assignments. @returns {Object} Test inputs. */
function fixture() {
    const config = structuredClone(defaults);
    config.knowledge.sourceRegistry.definitions = [
        'public-guide',
        'private-code',
        'inactive-guide',
    ].map((code) => ({
        code,
        repository: 'repo',
        project: 'project',
        module: 'module',
        owner: 'owner',
        version: 'v1',
        sourceType: 'README',
        classification: 'INTERNAL',
        paths: ['README.md'],
        secretScanPolicy: 'REQUIRED',
        enabled: true,
        allowedChannels: ['EMPLOYEE'],
        requiredPermissions: code === 'private-code' ? ['secret.read'] : [],
    }));
    config.knowledge.groups = {
        enabled: true,
        definitions: [
            {
                code: 'guides',
                name: 'Guides',
                active: true,
                sourceCodes: ['public-guide', 'private-code'],
            },
            {
                code: 'archived',
                name: 'Archived',
                active: false,
                sourceCodes: ['inactive-guide'],
            },
        ],
        assignments: [
            {
                tenantCode: 'tenant',
                enterpriseCode: 'enterprise',
                groupCodes: ['guides', 'archived'],
                allowedSourceCodes: [
                    'public-guide',
                    'private-code',
                    'inactive-guide',
                ],
            },
        ],
    };
    const context = {
        tenant: 'tenant',
        enterprise: 'enterprise',
        actor: 'employee',
        channel: 'EMPLOYEE',
        permissions: ['copilot.knowledge.internal.read'],
        roles: [],
        groups: [],
    };
    const registry = registryService.createRegistry(
        config.knowledge.sourceRegistry.definitions,
        config.knowledge.sourceRegistry,
        policy,
    );
    return { config, context, registry };
}

test('groups intersect active membership, enterprise ceiling and current source permissions', () => {
    const f = fixture();
    const result = groups.resolve(
        f.registry,
        f.config.knowledge.groups,
        f.context,
        policy,
        {},
    );
    assert.deepEqual(
        result.registry.sources.map((source) => source.code),
        ['public-guide'],
    );
    assert.deepEqual(result.groups[0].sourceCodes, ['public-guide']);
    assert.ok(Object.isFrozen(result));
    assert.throws(() =>
        groups.resolve(
            f.registry,
            f.config.knowledge.groups,
            f.context,
            policy,
            {},
            ['archived'],
        ),
    );
    assert.throws(() =>
        groups.resolve(
            f.registry,
            f.config.knowledge.groups,
            f.context,
            policy,
            {},
            ['unassigned'],
        ),
    );
    assert.equal(
        groups.resolve(
            f.registry,
            f.config.knowledge.groups,
            f.context,
            policy,
            {},
            [],
        ).registry.sources.length,
        0,
    );
    f.config.knowledge.groups.assignments[0].allowedSourceCodes = [];
    assert.equal(
        groups.resolve(
            f.registry,
            f.config.knowledge.groups,
            f.context,
            policy,
            {},
        ).registry.sources.length,
        0,
    );
});

test('missing assignments and tenant/enterprise changes reveal no group or source metadata', () => {
    const f = fixture();
    for (const patch of [
        { enterprise: 'other' },
        { tenant: 'other' },
        { permissions: [] },
    ]) {
        const result = groups.resolve(
            f.registry,
            f.config.knowledge.groups,
            { ...f.context, ...patch },
            policy,
            {},
        );
        assert.deepEqual(result.registry.sources, []);
        assert.deepEqual(result.groups, []);
    }
    assert.throws(() =>
        groups.resolve(
            f.registry,
            f.config.knowledge.groups,
            { ...f.context, channel: 'PUBLIC' },
            policy,
            {},
        ),
    );
});

test('enterprise deactivation immediately narrows retrieval and cannot select an unassigned group', () => {
    const f = fixture();
    f.config.knowledge.groups.assignments[0].activeGroupCodes = [];
    assert.deepEqual(groups.resolve(f.registry, f.config.knowledge.groups, f.context, policy, {}).registry.sources, []);
    assert.throws(() => groups.resolve(f.registry, f.config.knowledge.groups, f.context, policy, {}, ['guides']));
    f.config.knowledge.groups.assignments[0].activeGroupCodes = ['foreign'];
    assert.throws(() => groups.validate(f.config.knowledge.groups, f.registry));
});

test('malformed or duplicated configuration never silently widens a group', () => {
    const f = fixture();
    for (const mutate of [
        (config) => {
            config.definitions[0].sourceCodes = ['not-registered'];
        },
        (config) => {
            config.assignments.push(config.assignments[0]);
        },
        (config) => {
            config.definitions[0].active = 'true';
        },
        (config) => {
            config.assignments[0].allowedSourceCodes = '*';
        },
    ]) {
        const config = structuredClone(f.config.knowledge.groups);
        mutate(config);
        assert.throws(() =>
            groups.resolve(f.registry, config, f.context, policy, {}),
        );
    }
    assert.equal(
        groups.resolve(f.registry, { enabled: false }, f.context, policy, {})
            .registry,
        f.registry,
    );
    assert.throws(() =>
        groups.resolve(
            f.registry,
            { enabled: false },
            f.context,
            policy,
            {},
            [],
        ),
    );
});

test('empty assignment never queries Discovery and injected excluded records never become evidence', async () => {
    const f = fixture();
    let calls = 0;
    const dependencies = {
        registryService,
        policyService: policy,
        knowledgeService: {
            buildContext: (evidence) => ({ evidence, citations: [] }),
        },
        discoveryRuntimeService: {
            search: async (request) => {
                calls++;
                assert.deepEqual(
                    request.searchQuery.filters['payload.sourceCode.keyword'],
                    ['public-guide'],
                );
                return [{ payload: { sourceCode: 'private-code' } }];
            },
        },
    };
    const scoped = groups.resolve(
        f.registry,
        f.config.knowledge.groups,
        f.context,
        policy,
        {},
    );
    const request = {
        query: 'help',
        indexTenant: 'tenant',
        registry: scoped.registry,
        securityContext: f.context,
        configuration: { enabled: true },
    };
    assert.deepEqual(
        (await retrieval.search(request, dependencies)).evidence,
        [],
    );
    const empty = groups.resolve(
        f.registry,
        f.config.knowledge.groups,
        { ...f.context, enterprise: 'other' },
        policy,
        {},
    );
    await retrieval.search(
        { ...request, registry: empty.registry },
        dependencies,
    );
    assert.equal(calls, 1);
});

test('runtime binds group selection and index tenant before delegation', (t) => {
    const f = fixture();
    const previous = global.SERVICE,
        classes = global.CLASSES;
    t.after(() => {
        global.SERVICE = previous;
        global.CLASSES = classes;
    });
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code) {
                super(code);
                this.code = code;
            }
        },
    };
    let calls = 0;
    global.SERVICE = {
        DefaultCopilotPolicyService: policy,
        DefaultCopilotKnowledgeGroupService: groups,
        DefaultCopilotKnowledgeSourceRegistryService: registryService,
        DefaultCopilotKnowledgeRetrievalService: {
            search: (request) => {
                calls++;
                return request;
            },
        },
    };
    const service = { ...runtime, configuration: () => f.config };
    const request = {
        query: 'help',
        indexTenant: 'tenant',
        securityContext: f.context,
    };
    assert.deepEqual(
        service.search(request).registry.sources.map((source) => source.code),
        ['public-guide'],
    );
    assert.throws(() => service.search({ ...request, indexTenant: 'other' }), {
        code: 'ERR_CPK_00014',
    });
    assert.throws(
        () => service.search({ ...request, knowledgeGroupCodes: ['archived'] }),
        { code: 'ERR_CPK_00014' },
    );
    delete global.SERVICE.DefaultCopilotKnowledgeGroupService;
    assert.throws(() => service.search(request), { code: 'ERR_CPK_00013' });
    assert.equal(calls, 1);
});
