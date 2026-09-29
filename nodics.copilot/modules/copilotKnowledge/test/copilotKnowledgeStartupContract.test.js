/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module copilotKnowledge/test/copilotKnowledgeStartupContract @description Proves opt-in startup orchestration and trusted source selection without a customer checkout or live providers. @layer test @owner copilotKnowledge */
const assert = require('node:assert/strict');
const test = require('node:test');
const runtime = require('../src/service/defaultCopilotKnowledgeRuntimeService');
const defaults = require('../config/properties').copilot;
const registry = require('../src/service/defaultCopilotKnowledgeSourceRegistryService');
const policy = require('../../copilotPolicy/src/service/defaultCopilotPolicyService');
const policyDefaults = require('../../copilotPolicy/config/properties').copilot.policy;
const statuses = require('../src/utils/statusDefinitions');

const source = (code, project = 'example', enabled = true) => ({
    code, project, enabled, repository: 'test-repository', module: 'testKnowledge', owner: 'testKnowledge',
    version: 'commit-1', sourceType: 'README', classification: 'INTERNAL', paths: ['README.md'],
    allowedChannels: ['EMPLOYEE'], requiredPermissions: ['copilot.knowledge.internal.read'], secretScanPolicy: 'REQUIRED'
});

/** Isolate globals and use the real runtime registry, policy normalization and report state. */
function fixture(t) {
    const previous = Object.fromEntries(['SERVICE', 'NODICS', 'CLASSES'].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]));
    t.after(() => {
        for (const [key, descriptor] of Object.entries(previous)) {
            if (descriptor) Object.defineProperty(global, key, descriptor);
            else delete global[key];
        }
    });
    const configuration = structuredClone(defaults);
    configuration.policy = policyDefaults;
    const ingestion = configuration.knowledge.ingestion;
    Object.assign(ingestion, { enabled: true, ingestOnStart: true, indexTenant: 'test-tenant' });
    ingestion.startup.environment = 'testWest';
    configuration.knowledge.sourceRegistry.definitions = [source('first'), source('second', 'another'), source('disabled', 'example', false)];
    const calls = [], logs = [];
    global.NODICS = { LOG: { info: (...args) => logs.push(args) } };
    global.CLASSES = { NodicsError: class extends Error {
        constructor(error) {
            const code = typeof error === 'string' ? error : error.code;
            super(error.message || statuses[code].message);
            this.code = code;
        }
    } };
    global.SERVICE = {
        DefaultCopilotKnowledgeSourceRegistryService: registry,
        DefaultCopilotPolicyService: policy,
        DefaultCopilotKnowledgeIngestionService: { ingestSource: async request => {
            calls.push(request);
            return { sourceCode: request.source.code, state: 'PROJECTED', filesAccepted: 1, filesRejected: 0, chunksProjected: 1 };
        } }
    };
    const service = { ...runtime, configuration: () => configuration, state: { reports: new Map(), lastRefreshAt: null } };
    return { configuration, ingestion, service, calls, logs };
}

test('framework defaults and either disabled gate perform no registry or ingestion work', async t => {
    assert.equal(defaults.knowledge.ingestion.enabled, false);
    assert.equal(defaults.knowledge.ingestion.ingestOnStart, false);
    const f = fixture(t);
    f.service.registry = () => { throw new Error('must not register'); };
    for (const flags of [{ enabled: false, ingestOnStart: true }, { enabled: true, ingestOnStart: false }]) {
        Object.assign(f.ingestion, flags);
        assert.equal(await f.service.ingestOnStart(), true);
    }
    assert.deepEqual(f.calls, []);
});

test('startup uses registered enabled sources and fixed bounded authority, never caller inputs', async t => {
    const f = fixture(t);
    f.ingestion.startup.logSummary = true;
    const execute = SERVICE.DefaultCopilotKnowledgeIngestionService.ingestSource;
    SERVICE.DefaultCopilotKnowledgeIngestionService.ingestSource = async request =>
        ({ ...await execute(request), secret: 'never-log-this', rejected: [{ relativePath: '/private/path' }] });
    assert.equal(await f.service.ingestOnStart({ sourceCode: 'disabled', authData: { permissions: ['*'] }, indexTenant: 'attacker' }), true);
    assert.deepEqual(f.calls.map(call => call.source.code), ['first', 'second']);
    for (const call of f.calls) {
        assert.equal(call.indexTenant, 'test-tenant');
        assert.equal(call.indexVersion, 'commit-1');
        assert.equal(call.locale, 'en');
        assert.equal(call.securityContext.channel, 'SYSTEM');
        assert.equal(call.securityContext.actor, 'copilot-knowledge-startup');
        assert.equal(call.securityContext.environment, 'testWest');
        assert.deepEqual(call.securityContext.permissions, ['copilot.knowledge.source.manage']);
        assert.deepEqual(call.authData, { isSystem: true, serviceId: 'copilot-knowledge-startup', permissions: ['copilot.knowledge.source.manage'] });
    }
    assert.equal(f.service.state.reports.size, 2);
    assert.equal(f.logs.length, 1);
    assert.equal(JSON.stringify(f.logs).includes('never-log-this'), false);
    assert.equal(JSON.stringify(f.logs).includes('/private/path'), false);
});

test('project selector narrows ingestion and a later unmatched selector performs no writes', async t => {
    const f = fixture(t);
    Object.assign(f.ingestion.startup, { sourceProject: 'another', serviceId: 'selected-indexer', locale: 'fr' });
    await f.service.ingestOnStart();
    assert.deepEqual(f.calls.map(call => call.source.code), ['second']);
    assert.equal(f.calls[0].authData.serviceId, 'selected-indexer');
    assert.equal(f.calls[0].locale, 'fr');
    f.ingestion.startup.sourceProject = 'unselected';
    await f.service.ingestOnStart();
    assert.equal(f.calls.length, 1);
    assert.deepEqual(f.logs, []);
});

test('invalid startup policy or source registry fails before source ingestion', async t => {
    const f = fixture(t);
    const baseline = structuredClone(f.ingestion.startup);
    for (const change of [{ sourceProject: [] }, { serviceId: '' }, { environment: { $config: 'context' } },
        { locale: '' }, { failOnRejectedFiles: 'true' }, { logSummary: 1 }, { rejectionMessage: {} }]) {
        f.ingestion.startup = { ...baseline, ...change };
        await assert.rejects(f.service.ingestOnStart(), { code: 'ERR_CPK_00010' });
    }
    f.ingestion.startup = baseline;
    f.configuration.knowledge.sourceRegistry.definitions[0].classification = 'PUBLIC';
    await assert.rejects(f.service.ingestOnStart());
    assert.deepEqual(f.calls, []);
});

test('partial rejection preserves reports, optionally fails startup, and explicit retries delegate again', async t => {
    const f = fixture(t);
    let attempts = 0;
    SERVICE.DefaultCopilotKnowledgeIngestionService.ingestSource = async request => {
        attempts++;
        return { sourceCode: request.source.code, state: 'PROJECTED', filesAccepted: 1, filesRejected: 1, chunksProjected: 1 };
    };
    assert.equal(await f.service.ingestOnStart(), true);
    assert.equal(attempts, 2);
    Object.assign(f.ingestion.startup, { failOnRejectedFiles: true, rejectionMessage: 'PROJECT_STARTUP_REJECTED' });
    await assert.rejects(f.service.ingestOnStart(), { code: 'ERR_CPK_00009', message: 'PROJECT_STARTUP_REJECTED' });
    assert.equal(attempts, 3, 'failure stops later sources');
    assert.equal(f.service.state.reports.get('first').filesRejected, 1);
    SERVICE.DefaultCopilotKnowledgeIngestionService.ingestSource = async request => {
        attempts++;
        return { sourceCode: request.source.code, state: 'PROJECTED', filesRejected: 0 };
    };
    assert.equal(await f.service.ingestOnStart(), true);
    assert.equal(attempts, 5, 'no local skip ledger hides a retry');
});

test('provider failure propagates and later sources are not attempted', async t => {
    const f = fixture(t);
    const failure = Object.assign(new Error('provider unavailable'), { code: 'PROVIDER_UNAVAILABLE' });
    SERVICE.DefaultCopilotKnowledgeIngestionService.ingestSource = async request => {
        f.calls.push(request);
        throw failure;
    };
    await assert.rejects(f.service.ingestOnStart(), error => error === failure);
    assert.equal(f.calls.length, 1);
    assert.equal(f.service.state.reports.get('first').state, 'FAILED');
    assert.deepEqual(f.logs, []);
});
