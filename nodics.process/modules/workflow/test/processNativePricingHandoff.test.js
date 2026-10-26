/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module workflow/test/processNativePricingHandoff @description Actual Process lifecycle and remote claim with isolated persistence and Pricing target response; not live publication proof. @owner workflow @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const _ = require('lodash');
const lifecycle = require('../src/service/operation/defaultProcessRuntimeLifecycleService');
const remote = require('../src/service/operation/defaultProcessRemoteActionAdapterService');
const registry = require('../src/service/operation/defaultProcessActionAdapterRegistryService');

test('native Pricing start through completed task and remote claim retains seller context and original platform actor', async t => {
    const previous = Object.fromEntries(['SERVICE', 'CONFIG', 'NODICS', 'UTILS', 'CLASSES'].map(key => [key, global[key]]));
    t.after(() => Object.entries(previous).forEach(([key, value]) => { global[key] = value; }));
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
    global.UTILS = { isBlank: _.isEmpty };
    const source = require('../../../../nodics.commerce/modules/baseCommerce/modules/pricing/data/init-v001/records/process/pricingPublicationWorkflowDefinitionData').definitions[0];
    const definition = { ...structuredClone(source), status: 'PUBLISHED', currentVersion: 1 };
    const version = { ...structuredClone(source), definitionCode: source.code, status: 'PUBLISHED', version: 1 };
    const settings = structuredClone(require('../config/properties').process);
    settings.actionAdapters.allowedActions = ['pricing.applyPublicationDecision'];
    settings.actionAdapters.definitions = require('../../../../nodics.commerce/modules/baseCommerce/modules/pricing/config/properties').process.actionAdapters.definitions;
    settings.remoteActions.targets = { pricing: { connectionName: 'commerceStaged' } };
    global.CONFIG = { get: key => key === 'process' ? settings : undefined };
    const principal = (moduleName, code) => ({ tokenType: 'service', serviceId: code, tenant: 'default',
        entCode: 'default', modules: [moduleName], runtimeInstanceId: code, runtimeScope: { instanceCode: code,
            projectCode: 'kickoff', environmentCode: 'local', serverCode: code, assignmentCode: code + '-assignment' } });
    const processAuth = principal('workflow', 'process'), pricingAuth = principal('pricing', 'commerceStaged');
    global.NODICS = { getInternalAuthToken: () => 'isolated-runtime-token', getEnvironmentName: () => 'kickoff',
        getSelectedEnvironmentName: () => 'local', getServerName: () => 'process' };
    const matches = (row, query) => Object.entries(query || {}).every(([key, expected]) => {
        const actual = _.get(row, key);
        if (expected && typeof expected === 'object' && '$exists' in expected) return (actual !== undefined) === expected.$exists;
        if (expected && typeof expected === 'object' && '$in' in expected) return expected.$in.includes(actual);
        if (expected && typeof expected === 'object' && '$gt' in expected) return actual > expected.$gt;
        return _.isEqual(actual, expected);
    });
    const store = (initial = []) => {
        const rows = structuredClone(initial);
        return { rows, get: async request => ({ code: 'SUC_DB', result: structuredClone(rows.filter(row => matches(row, request.query))) }),
            save: async request => { assert(!rows.some(row => row.code === request.model.code && row.code));
                rows.push(structuredClone(request.model)); return { code: 'SUC_DB', result: structuredClone(request.model) }; },
            update: async request => { const row = rows.find(row => matches(row, request.query));
                if (row) for (const [key, value] of Object.entries(request.model.$set || request.model)) _.set(row, key, structuredClone(value));
                return { code: 'SUC_DB', result: { acknowledged: true, matchedCount: row ? 1 : 0, modifiedCount: row ? 1 : 0 } }; } };
    };
    const instances = store(), tasks = store(), audits = store();
    let claimed, callbacks = 0;
    global.SERVICE = {
        DefaultProcessRuntimeLifecycleService: lifecycle, DefaultProcessRemoteActionAdapterService: remote,
        DefaultProcessActionAdapterRegistryService: registry,
        DefaultProcessDefinitionService: store([definition]), DefaultProcessDefinitionVersionService: store([version]),
        DefaultProcessInstanceService: instances, DefaultProcessTaskService: tasks, DefaultProcessAuditEventService: audits,
        DefaultProcessIncidentService: store(),
        DefaultModelsUpdateInitializerService: require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService'),
        DefaultServiceTokenService: require('../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService'),
        DefaultAuthorizationProviderService: { authorizeToken: async () => ({ result: processAuth }) },
        DefaultModuleRegistrationAgentService: { assertModuleOperational: async () => {}, getInstanceId: () => 'process' },
        DefaultModuleService: { invokeModule: async descriptor => {
            callbacks++;
            assert.equal(descriptor.moduleName, 'pricing');
            assert.equal(descriptor.header['x-enterprise-code'], 'default');
            assert.deepEqual(Object.keys(descriptor.requestBody).sort(), ['executionCode', 'instanceCode']);
            claimed = await remote.claim({ tenant: 'default', authData: pricingAuth,
                instanceCode: descriptor.requestBody.instanceCode, runtimeOperation: { ...descriptor.requestBody,
                    actionKey: 'pricing.applyPublicationDecision', sourceRuntimeInstanceId: processAuth.runtimeInstanceId } });
            return { status: 'COMPLETED' };
        } },
    };
    const request = { tenant: 'default', authData: { tokenType: 'access', principalType: 'human', loginId: 'admin',
        tenant: 'default', entCode: 'default' }, httpRequest: { headers: { 'x-enterprise-code': 'default' } },
        runtimeOperation: { instanceCode: 'pricing-native-review', definitionCode: source.code, taskCode: 'pricing-native-task',
            assignee: 'admin', context: { tenantCode: 'default', enterpriseCode: 'seller', requestedBy: 'admin',
                publicationCode: 'pricing-publication', publicationRevision: 1 } } };
    const original = structuredClone(request);
    await lifecycle.startInstance(request);
    assert.equal(instances.rows[0].status, 'WAITING');
    assert.equal(tasks.rows[0].nodeCode, 'policyReview');
    const policy = lifecycle.policyOf(version, version.graph.nodes.find(node => node.code === 'policyReview'));
    assert.equal(policy.actorPolicy, undefined);
    assert.throws(() => lifecycle.assertTaskActor(request, instances.rows[0], { actorPolicy: {
        permission: 'pricing.publication.approve', enterpriseContextField: 'enterpriseCode', requesterContextField: 'requestedBy',
    } }), { code: 'ERR_PROCESS_00029' });
    const decisionRequest = { ...request, taskCode: 'pricing-native-task', runtimeOperation: { decision: { approved: true } } };
    await lifecycle.claimTask({ ...decisionRequest, runtimeOperation: {} });
    await lifecycle.completeTask(decisionRequest);
    assert.equal(callbacks, 1);
    assert.equal(tasks.rows[0].status, 'COMPLETED');
    assert.equal(tasks.rows[0].completedBy, 'admin');
    assert.equal(instances.rows[0].status, 'COMPLETED');
    assert.equal(instances.rows[0].activeRemoteAction.status, 'COMPLETED');
    assert.deepEqual(claimed.data.instance.context, original.runtimeOperation.context);
    assert.equal(claimed.data.actor, 'admin');
    assert.deepEqual(claimed.data.body.decision, { approved: true });
    assert.deepEqual(request, original);
    await lifecycle.startInstance(request);
    assert.equal(callbacks, 1, 'exact start replay never repeats publication callback');
});
