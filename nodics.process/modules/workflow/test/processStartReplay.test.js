/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module workflow/test/processStartReplay @description Qualifies create-only process start, exact replay and incomplete-start denial. @owner workflow @layer test */
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const lifecycle = require('../src/service/operation/defaultProcessRuntimeLifecycleService');
const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
after(() => Object.entries(previous).forEach(([key, value]) => {
    if (value === undefined) delete global[key]; else global[key] = value;
}));

function fixture() {
    const records = new Map();
    const calls = { entered: 0, audit: 0, admission: 0 };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    global.SERVICE = { DefaultModuleRegistrationAgentService: { assertModuleOperational: async () => { calls.admission++; } } };
    const key = input => input.tenant + ':' + (input.query ? input.query.code : input.model.code);
    const persistence = {
        get: async input => ({ result: records.has(key(input)) ? [structuredClone(records.get(key(input)))] : [] }),
        save: async input => {
            assert.equal(input.query, undefined, 'start must never upsert');
            if (records.has(key(input))) throw new Error('duplicate primary key');
            records.set(key(input), structuredClone(input.model));
            return { result: structuredClone(input.model) };
        },
        update: async input => {
            const model = records.get(key(input));
            if (!model || !Object.entries(input.query).every(([name, value]) => model[name] === value)) return { result: { modifiedCount: 0 } };
            Object.assign(model, input.model.$set);
            return { result: { modifiedCount: 1 } };
        },
    };
    const service = Object.assign({}, lifecycle, {
        instanceService: () => persistence,
        resolveStartVersion: async (request, body) => ({ definitionCode: body.definitionCode, version: 1, graph: {} }),
        audit: async () => { calls.audit++; },
        enterNode: async (request, instance) => {
            calls.entered++;
            Object.assign(records.get(request.tenant + ':' + instance.code), { status: 'WAITING', currentNode: 'review' });
            return { instance: Object.assign({}, instance, { status: 'WAITING', currentNode: 'review' }) };
        },
    });
    const request = { tenant: 'tenant-a', authData: { entCode: 'enterprise-a' },
        runtimeOperation: { instanceCode: 'review-a', definitionCode: 'approval', context: { b: 2, a: 1 } } };
    return { service, records, calls, request };
}

test('native Pricing start retains seller business context independently of original human enterprise', async () => {
    const f = fixture();
    const definition = require('../../../../nodics.commerce/modules/baseCommerce/modules/pricing/data/init-v001/records/process/pricingPublicationWorkflowDefinitionData').definitions[0];
    const version = { ...structuredClone(definition), definitionCode: definition.code, version: 1 };
    f.service.resolveStartVersion = async () => version;
    f.request.authData = { tokenType: 'access', principalType: 'human', loginId: 'admin',
        tenant: 'tenant-a', entCode: 'default' };
    f.request.httpRequest = { headers: { enterprise: 'default' } };
    f.request.runtimeOperation = { instanceCode: 'pricing-review', definitionCode: definition.code,
        context: { enterpriseCode: 'seller-a', tenantCode: 'tenant-a', requestedBy: 'admin', publicationCode: 'pricing-a' } };
    const original = structuredClone(f.request);
    await f.service.startInstance(f.request);
    const instance = f.records.get('tenant-a:pricing-review');
    assert.deepEqual(instance.context, original.runtimeOperation.context);
    const policy = f.service.policyOf(version, version.graph.nodes.find(node => node.code === 'policyReview'));
    assert.equal(policy.actorPolicy, undefined);
    assert.doesNotThrow(() => f.service.assertTaskActor(f.request, instance, policy));
    assert.throws(() => f.service.assertTaskActor(f.request, instance, { actorPolicy: {
        permission: 'pricing.publication.approve', enterpriseContextField: 'enterpriseCode',
        requesterContextField: 'requestedBy',
    } }), { code: 'ERR_PROCESS_00029' }, 'an explicit enterprise-bound policy must still refuse the mismatch');
    assert.deepEqual(f.request, original, 'business target must not replace signed actor or transport headers');
    const replay = await f.service.startInstance(f.request);
    assert.equal(replay.data.instance.code, instance.code);
    assert.equal(f.calls.entered, 1);
    await assert.rejects(f.service.startInstance({ ...f.request,
        authData: { ...f.request.authData, entCode: 'seller-a' } }), { code: 'ERR_PROCESS_00026' });
});

test('exact retry reuses original immutable version and preserves advanced context', async () => {
    const f = fixture();
    await f.service.startInstance(f.request);
    f.records.get('tenant-a:review-a').context = { completedDecision: true };
    f.service.resolveStartVersion = async () => { throw new Error('must not select a newer version'); };
    const retry = structuredClone(f.request);
    retry.runtimeOperation.context = { a: 1, b: 2 };
    const replay = await f.service.startInstance(retry);
    assert.equal(replay.data.instance.version, 1);
    assert.deepEqual(replay.data.instance.context, { completedDecision: true });
    assert.equal(f.calls.entered, 1);
    assert.equal(f.calls.audit, 1);
    assert.equal(f.calls.admission, 2);
});

test('changed definition, context, explicit version, enterprise or task input rejects without mutation', async () => {
    const f = fixture();
    await f.service.startInstance(f.request);
    for (const patch of [{ definitionCode: 'another' }, { context: {} }, { version: 2 }, { assignee: 'other' }]) {
        const request = structuredClone(f.request);
        Object.assign(request.runtimeOperation, patch);
        await assert.rejects(f.service.startInstance(request), { code: 'ERR_PROCESS_00026' });
    }
    await assert.rejects(f.service.startInstance({ ...f.request, authData: { entCode: 'other' } }), { code: 'ERR_PROCESS_00026' });
    assert.equal(f.calls.entered, 1);
});

test('concurrent starts enter nodes once; winner response loss permits an exact later replay', async () => {
    const f = fixture();
    const results = await Promise.allSettled([f.service.startInstance(f.request), f.service.startInstance(f.request)]);
    assert.ok(results.some(result => result.status === 'fulfilled'));
    assert.equal(f.records.size, 1);
    assert.equal(f.calls.entered, 1);
    await f.service.startInstance(f.request);
    assert.equal(f.calls.entered, 1);
});

test('partial and historical starts fail closed without replaying side effects', async () => {
    const f = fixture();
    f.service.enterNode = async () => { f.calls.entered++; throw new Error('interrupted'); };
    await assert.rejects(f.service.startInstance(f.request), /interrupted/);
    await assert.rejects(f.service.startInstance(f.request), { code: 'ERR_PROCESS_00027' });
    delete f.records.get('tenant-a:review-a').startFingerprint;
    await assert.rejects(f.service.startInstance(f.request), { code: 'ERR_PROCESS_00026' });
    assert.equal(f.calls.entered, 1);
});

test('same instance code in another tenant is independent and invalid codes never persist', async () => {
    const f = fixture();
    await f.service.startInstance(f.request);
    await f.service.startInstance({ ...f.request, tenant: 'tenant-b' });
    await assert.rejects(f.service.startInstance({ ...f.request, runtimeOperation: { ...f.request.runtimeOperation, instanceCode: '../bad' } }), { code: 'ERR_PROCESS_00006' });
    assert.equal(f.records.size, 2);
});
