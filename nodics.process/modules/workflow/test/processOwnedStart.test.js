/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module workflow/test/processOwnedStart @description Checks service-only Process admission with actual runtime-principal validation and controlled generated reads. @owner workflow @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const lifecycle = require('../src/service/operation/defaultProcessRuntimeLifecycleService');
const authority = require('../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService');
function fixture() {
    const policy = { enabled: true, allowedDefinitions: ['review'], permission: 'process.instance.start.internal', maximumContextBytes: 16384 };
    const definition = { code: 'review', ownerModule: 'exampleDomain', status: 'PUBLISHED', active: true };
    const version = { definitionCode: 'review', version: 3, status: 'PUBLISHED', policy: { contextAllowlist: ['enterpriseCode', 'requestHash'] } };
    const calls = { reads: 0, starts: 0 }, faults = {};
    global.CONFIG = { get: key => key === 'process' ? { runtime: { internalStarts: policy } } : undefined };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    global.SERVICE = { DefaultServiceTokenService: authority };
    const reader = row => ({ get: async request => { calls.reads++; assert.equal(request.options.skipItemCache, true);
        return faults.read || { code: 'SUC_DBS_00000', result: [structuredClone(row)] }; } });
    const owner = { ...lifecycle, definitionService: () => reader(definition), versionService: () => reader(version),
        startInstance: async request => { calls.starts++; calls.request = request; return { code: 'SUC_PROCESS_00007', data: { started: true } }; } };
    const request = { tenant: 'tenant-a', authData: { tokenType: 'service', principalType: 'service', serviceId: 'owner-runtime',
        entCode: 'enterprise-a', tenant: 'tenant-a', runtimeInstanceId: 'instance-a', modules: ['workflow', 'exampleDomain'],
        permissions: [policy.permission], runtimeScope: { instanceCode: 'instance-a', projectCode: 'project-a',
            environmentCode: 'test', serverCode: 'owner-server', assignmentCode: 'grant-a' } },
        runtimeOperation: { sourceModule: 'exampleDomain', definitionCode: 'review', version: 3, instanceCode: 'review-a',
            context: { enterpriseCode: 'enterprise-a', requestHash: 'immutable-request' } } };
    return { owner, request, policy, definition, version, calls, faults };
}
test('authorised owner delegates once to the canonical lifecycle and preserves runtime actor', async () => {
    const f = fixture(); await f.owner.startOwnedInstance(f.request);
    assert.equal(f.calls.starts, 1); assert.equal(f.calls.request.authData, f.request.authData);
    assert.equal(f.calls.request.runtimeOperation.sourceModule, undefined);
    assert.equal(f.calls.request.runtimeOperation.version, 3);
    assert.notEqual(f.calls.request.runtimeOperation.context, f.request.runtimeOperation.context);
});
for (const patch of [{ tokenType: 'access' }, { principalType: 'human' }, { serviceId: undefined }, { tenant: 'other' },
    { modules: ['workflow'] }, { modules: ['exampleDomain'] }, { permissions: ['*'] }, { runtimeScope: {} }]) {
    test('wrong runtime cannot start: '+JSON.stringify(patch), async () => {
        const f = fixture(); Object.assign(f.request.authData, patch);
        await assert.rejects(f.owner.startOwnedInstance(f.request)); assert.equal(f.calls.starts, 0); assert.equal(f.calls.reads, 0);
    });
}
for (const patch of [{ enabled: false }, { allowedDefinitions: [] }, { maximumContextBytes: 0 }, { permission: '' }]) {
    test('missing deployment admission fails: '+JSON.stringify(patch), async () => {
        const f = fixture(); Object.assign(f.policy, patch);
        await assert.rejects(f.owner.startOwnedInstance(f.request)); assert.equal(f.calls.starts, 0);
    });
}
for (const [target, patch] of [['definition', { ownerModule: 'another' }], ['definition', { status: 'DRAFT' }],
    ['definition', { code: 'another' }], ['version', { status: 'DRAFT' }], ['version', { version: 4 }],
    ['version', { definitionCode: 'another' }], ['version', { policy: {} }]]) {
    test('published owner/version evidence must match: '+JSON.stringify(patch), async () => {
        const f = fixture(); Object.assign(f[target], patch);
        await assert.rejects(f.owner.startOwnedInstance(f.request)); assert.equal(f.calls.starts, 0);
    });
}
for (const result of [{ code: 'ERR_DBS_00000', result: [] }, {}, { code: 'SUC_DBS_00000', result: [] },
    { code: 'SUC_DBS_00000', result: [], errors: {} }]) {
    test('uncertain reads do not imply permission: '+JSON.stringify(result), async () => {
        const f = fixture(); f.faults.read = result;
        await assert.rejects(f.owner.startOwnedInstance(f.request)); assert.equal(f.calls.starts, 0);
    });
}
for (const patch of [{ context: { enterpriseCode: 'other' } }, { context: [] }, { context: { approved: true } },
    { version: '3' }, { instanceCode: '../escape' }, { assignee: 'attacker' }, { context: { requestHash: 'x'.repeat(17000) } }]) {
    test('invalid start input rejects before execution: '+Object.keys(patch).join(','), async () => {
        const f = fixture(); Object.assign(f.request.runtimeOperation, patch);
        await assert.rejects(f.owner.startOwnedInstance(f.request)); assert.equal(f.calls.starts, 0);
    });
}
test('existing employee route remains employee-only and service admission defaults disabled', () => {
    const routes = Object.values(require('../src/router/routers').workflow).flatMap(group => Object.values(group));
    assert.deepEqual(routes.find(route => route.key === '/instances' && route.method === 'POST').authTokenTypes, ['access']);
    assert.deepEqual(routes.find(route => route.key === '/internal/instances').authTokenTypes, ['service']);
    assert.equal(require('../config/properties').process.runtime.internalStarts.enabled, false);
});

const permissionOwner = require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
function reviewerFixture() {
    fixture(); global.SERVICE.DefaultSecuredRequestPipelineService = { ...permissionOwner };
    const request = { tenant: 'tenant-a', authData: { tokenType: 'access', principalType: 'human', tenant: 'tenant-a',
        entCode: 'enterprise-a', loginId: 'reviewer@example.test', permissions: ['profile.enterpriseAccess.assign'] } };
    const instance = { context: { enterpriseCode: 'enterprise-a', requestedBy: 'applicant@example.test' } };
    const policy = { actorPolicy: { permission: 'profile.enterpriseAccess.assign', enterpriseContextField: 'enterpriseCode', requesterContextField: 'requestedBy' } };
    return { request, instance, policy };
}
test('immutable actor policy permits a different authorised reviewer in the correct enterprise', () => {
    const f = reviewerFixture(); lifecycle.assertTaskActorPolicy(f.request, f.instance, f.policy, { approved: true });
});
for (const loginId of ['applicant@example.test', 'APPLICANT@example.test', 'admin']) {
    test('authorised requester can review its own request: '+loginId, () => {
        const f = reviewerFixture();
        f.request.authData.loginId = loginId;
        f.instance.context.requestedBy = loginId.toLowerCase();
        assert.doesNotThrow(() => lifecycle.assertTaskActorPolicy(f.request, f.instance, f.policy, { approved: true }));
        f.request.authData.permissions = [];
        assert.throws(() => lifecycle.assertTaskActorPolicy(f.request, f.instance, f.policy, { approved: true }));
    });
}
for (const patch of [{ entCode: 'another' }, { tenant: 'another' },
    { principalType: 'customer' }, { tokenType: 'service' }, { permissions: [] }, { isSystem: true }]) {
    test('task reviewer boundary rejects '+JSON.stringify(patch), () => {
        const f = reviewerFixture(); Object.assign(f.request.authData, patch);
        assert.throws(() => lifecycle.assertTaskActorPolicy(f.request, f.instance, f.policy, { approved: true }));
    });
}
for (const decision of [{ approved: 'true' }, { approved: false }, { approved: false, reason: ' ' },
    { approved: true, targetNodeCode: 'end' }, { approved: true, emergencyOverride: true }, { approved: true, reason: {} }]) {
    test('decision cannot bypass review: '+JSON.stringify(decision), () => {
        const f = reviewerFixture(); assert.throws(() => lifecycle.assertTaskActorPolicy(f.request, f.instance, f.policy, decision));
    });
}
test('existing policies without strict actor metadata keep their previous contract', () => {
    const f = reviewerFixture(); assert.doesNotThrow(() => lifecycle.assertTaskActorPolicy({}, {}, {}, {}));
});
