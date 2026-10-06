/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module copilotKnowledge/test/copilotIncidentEvidence @description Proves bounded owner-audited external evidence and fail-closed scope, freshness and minimization. @layer test @owner copilotKnowledge */
const test = require('node:test');
const assert = require('node:assert/strict');
const incident = require('../src/service/defaultCopilotIncidentEvidenceService');
const runtime = require('../src/service/defaultCopilotKnowledgeRuntimeService');
const registry = require('../src/service/defaultCopilotKnowledgeSourceRegistryService');
const policy = require('../../copilotPolicy/src/service/defaultCopilotPolicyService');

/** Installs an isolated live-source contract without a data lake or network. @param {Object} t Test. @returns {Object} Mutable fixture. */
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
        code: 'runtime-logs',
        repository: 'observability',
        project: 'project-a',
        module: 'logs',
        owner: 'logs',
        version: 'v1',
        sourceType: 'EXTERNAL_LOG',
        classification: 'RESTRICTED',
        paths: ['events'],
        allowedChannels: ['EMPLOYEE'],
        requiredPermissions: ['copilot.logs.read'],
        tenantScopes: ['tenant-a'],
        enterpriseScopes: ['enterprise-a'],
        environmentScopes: ['test'],
        secretScanPolicy: 'REQUIRED',
        enabled: true,
    };
    configuration.knowledge.sourceRegistry.definitions = [source];
    Object.assign(configuration.knowledge.externalLogs, {
        enabled: true,
        sources: [
            {
                sourceCode: source.code,
                runtimeCodes: ['runtime-a'],
                serviceCodes: ['service-a'],
                categoryCodes: ['journey'],
            },
        ],
    });
    const context = {
        channel: 'EMPLOYEE',
        actor: 'employee',
        tenant: 'tenant-a',
        enterprise: 'enterprise-a',
        environment: 'test',
        permissions: ['copilot.logs.read', 'copilot.knowledge.restricted.read'],
    };
    const request = {
        tenant: 'tenant-a',
        sourceCode: source.code,
        securityContext: context,
        authData: { loginId: 'employee' },
        body: {
            from: '2026-10-03T00:00:00.000Z',
            to: '2026-10-03T00:30:00.000Z',
            correlationId: 'journey-a',
        },
    };
    const event = {
        code: 'event-a',
        tenantCode: 'tenant-a',
        enterpriseCode: 'enterprise-a',
        projectCode: 'project-a',
        environmentCode: 'test',
        timestamp: '2026-10-03T00:05:00.000Z',
        correlationId: 'journey-a',
        runtimeCode: 'runtime-a',
        serviceCode: 'service-a',
        categoryCode: 'journey',
        message: 'Operation failed',
        privateData: 'never returned',
    };
    const result = {
        accessReceipt: 'audit-a',
        events: [event],
        observedAt: '2026-10-03T00:31:00.000Z',
        coverage: 'PARTIAL',
        hasMore: false,
    };
    const calls = [];
    const provider = {
        queryEvidence: async (input) => {
            calls.push(input);
            return result;
        },
    };
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
        DefaultCopilotPolicyService: policy,
        DefaultCopilotKnowledgeSourceRegistryService: registry,
        DefaultDiscoverySourceRegistryService: {
            resolve: (owner, code) => {
                assert.equal(owner, 'COPILOT_EXTERNAL_LOG');
                assert.equal(code, source.code);
                return provider;
            },
        },
        DefaultCopilotKnowledgeSecretInspectionService: {
            inspect: (value) => ({ safe: !value.includes('secret-token') }),
        },
    };
    return { configuration, source, request, event, result, calls, provider };
}

test('an empty conversation group selection never invokes the external log provider', async (t) => {
    const f = fixture(t);
    global.SERVICE.DefaultCopilotKnowledgeGroupService = require('../src/service/defaultCopilotKnowledgeGroupService');
    f.configuration.knowledge.groups = {
        enabled: true,
        definitions: [
            {
                code: 'operations',
                name: 'Operations',
                active: true,
                sourceCodes: [f.source.code],
            },
        ],
        assignments: [
            {
                tenantCode: 'tenant-a',
                enterpriseCode: 'enterprise-a',
                groupCodes: ['operations'],
                allowedSourceCodes: [f.source.code],
            },
        ],
    };
    await assert.rejects(
        incident.query(
            { ...f.request, knowledgeGroupCodes: [] },
            f.configuration,
        ),
        { code: 'ERR_CPK_00002' },
    );
    assert.equal(f.calls.length, 0);
});

test('incident evidence preserves original identity, exact scope, audit receipt and incomplete coverage', async (t) => {
    const f = fixture(t);
    const result = await incident.query(f.request, f.configuration);
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].authData, f.request.authData);
    assert.equal(f.calls[0].requireAudit, true);
    assert.equal(result.coverage, 'PARTIAL');
    assert.equal(result.ingestionLagMs, null);
    assert.equal(result.events[0].message, 'Operation failed');
    assert.equal(result.interpretation, 'OBSERVED_EVENTS_NOT_ROOT_CAUSE');
    assert.doesNotMatch(
        JSON.stringify(result),
        /privateData|never returned|loginId/,
    );
    f.result.events = [];
    f.result.coverage = 'UNKNOWN';
    assert.equal(
        (await incident.query(f.request, f.configuration)).coverage,
        'UNKNOWN',
    );
});

test('disabled, unauthorized, unbounded and malformed requests never reach the provider', async (t) => {
    const f = fixture(t);
    for (const change of [
        { enterprise: 'other' },
        { environment: 'production' },
        { channel: 'PUBLIC' },
        { permissions: [] },
    ]) {
        await assert.rejects(
            incident.query(
                {
                    ...f.request,
                    securityContext: {
                        ...f.request.securityContext,
                        ...change,
                    },
                },
                f.configuration,
            ),
        );
    }
    for (const change of [
        { filter: {} },
        { correlationId: '*' },
        { to: '2026-10-04T00:00:00.000Z' },
        { from: '2026-10-03' },
    ]) {
        await assert.rejects(
            incident.query(
                { ...f.request, body: { ...f.request.body, ...change } },
                f.configuration,
            ),
            { code: 'ERR_CPK_00007' },
        );
    }
    f.configuration.knowledge.externalLogs.fields.push('password');
    await assert.rejects(incident.query(f.request, f.configuration));
    assert.equal(f.calls.length, 0);
});

test('foreign, secret-bearing, duplicate and unaudited evidence fails closed', async (t) => {
    const f = fixture(t);
    for (const change of [
        { tenantCode: 'other' },
        { enterpriseCode: 'other' },
        { environmentCode: 'other' },
        { projectCode: 'other' },
        { runtimeCode: 'other' },
        { serviceCode: 'other' },
        { categoryCode: 'other' },
        { correlationId: 'other' },
        { timestamp: '2026-10-02T00:00:00.000Z' },
        { message: 'secret-token' },
    ]) {
        f.result.events = [{ ...f.event, ...change }];
        await assert.rejects(incident.query(f.request, f.configuration), {
            code: 'ERR_CPK_00015',
        });
    }
    f.result.events = [f.event, f.event];
    await assert.rejects(incident.query(f.request, f.configuration));
    f.result.events = [f.event];
    delete f.result.accessReceipt;
    await assert.rejects(incident.query(f.request, f.configuration));
});

test('source or field-policy revocation during the owner query withholds returned evidence', async (t) => {
    const f = fixture(t);
    f.provider.queryEvidence = async () => {
        f.source.enabled = false;
        return f.result;
    };
    await assert.rejects(incident.query(f.request, f.configuration), {
        code: 'ERR_CPK_00002',
    });
    f.source.enabled = true;
    f.provider.queryEvidence = async () => {
        f.configuration.knowledge.externalLogs.fields = ['timestamp'];
        return f.result;
    };
    await assert.rejects(incident.query(f.request, f.configuration), {
        code: 'ERR_CPK_00002',
    });
});

test('external logs are never available to static corpus retrieval', (t) => {
    const f = fixture(t);
    const value = registry.createRegistry(
        [f.source],
        f.configuration.knowledge.sourceRegistry,
        policy,
    );
    assert.deepEqual(
        registry.listAccessible(
            value,
            f.request.securityContext,
            f.configuration.policy,
            policy,
        ),
        [],
    );
    assert.throws(
        () =>
            registry.createRegistry(
                [{ ...f.source, enterpriseScopes: [] }],
                f.configuration.knowledge.sourceRegistry,
                policy,
            ),
        /SCOPE_REQUIRED/,
    );
});
