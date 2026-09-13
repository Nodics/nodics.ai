/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module cronjob/test/cronJobOperationalAdmissionContract @description Verifies that activation freshness and runtime revocation block new work while preserving an already-running execution. @layer test @owner cronjob */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const agentDefinition = require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleRegistrationAgentService');
const cronDefinition = require('../src/service/cronjob/defaultCronJobService');
const handlerDefinition = require('../src/service/trigger/defaultCronJobTriggerHandlerService');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
function fixture() {
    let checks = 0, executed = 0, revoked = false, release;
    global.CLASSES = { NodicsError };
    global.NODICS = { getEnvironmentName: () => 'warehouse', getSelectedEnvironmentName: () => 'local', getServerName: () => 'jobs', getInternalAuthToken: () => 'verified-by-auth-owner' };
    const auth = { tokenType: 'service', tenant: 'tenant-a', modules: ['cronjob'], runtimeScope: { instanceCode: 'jobs-1', projectCode: 'warehouse', environmentCode: 'local', serverCode: 'jobs' } };
    const agent = { ...agentDefinition, _operationalState: null, getInstanceId: () => 'jobs-1', getConfiguration: () => ({ operationalStateTtlMs: 30000 }) };
    const cron = { ...cronDefinition, acceptingWork: true };
    const handler = { ...handlerDefinition, LOG: { debug() {} } };
    global.SERVICE = {
        DefaultModuleRegistrationAgentService: agent, DefaultCronJobService: cron,
        DefaultAuthorizationProviderService: { authorizeToken: async () => { checks++; if (revoked) throw new Error('revoked'); return { result: auth }; } },
        JobTarget: { run: () => { executed++; return new Promise(resolve => { release = resolve; }); } }
    };
    const snapshot = enabled => agent.recordOperationalState({ data: { operationalState: { instanceId: 'jobs-1', projectCode: 'warehouse', expiresAt: Date.now() + 30000, modules: [{ moduleName: 'cronjob', enabled }] } } }, ['cronjob']);
    const trigger = () => {
        const outcomes = [];
        const request = { definition: { tenant: 'tenant-a', jobDetail: { startNode: 'JobTarget.run' } } };
        const finished = handler.triggerProcess(request, {}, { nextSuccess: () => outcomes.push('success'), error: (_request, _response, error) => outcomes.push(error.message) });
        return { outcomes, finished };
    };
    return { agent, cron, auth, snapshot, trigger, revoke: () => { revoked = true; }, release: () => release({}), counts: () => ({ checks, executed }) };
}
test('missing, inactive and expired authority state block jobs without remote reconciliation', async () => {
    const f = fixture();
    for (const state of ['missing', 'inactive', 'expired']) {
        if (state !== 'missing') f.snapshot(state === 'expired');
        if (state === 'expired') f.agent._operationalState.expiresAt = Date.now() - 1;
        const attempt = f.trigger(); await attempt.finished;
        assert.match(attempt.outcomes[0], /inactive|unavailable/);
    }
    assert.deepEqual(f.counts(), { checks: 0, executed: 0 });
});
test('revoked credentials, wrong tenant and wrong module cannot begin work', async () => {
    const f = fixture(); f.snapshot(true);
    f.auth.tenant = 'tenant-b'; await assert.rejects(f.cron.assertOperational('tenant-a'), /does not authorize/);
    f.auth.tenant = 'tenant-a'; f.auth.modules = ['inventory']; await assert.rejects(f.cron.assertOperational('tenant-a'), /does not authorize/);
    f.auth.modules = ['cronjob']; f.revoke(); const attempt = f.trigger(); await attempt.finished;
    assert.deepEqual(attempt.outcomes, ['revoked']); assert.equal(f.counts().executed, 0);
});
test('deactivation blocks the next execution while an admitted job completes normally', async () => {
    const f = fixture(); f.snapshot(true);
    const first = f.trigger(); await first.finished; assert.equal(f.counts().executed, 1);
    f.snapshot(false); const second = f.trigger(); await second.finished;
    assert.match(second.outcomes[0], /inactive/);
    f.release(); await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(first.outcomes, ['success']); assert.equal(f.counts().executed, 1);
});
test('shutdown and a state change during asynchronous authorization close admission', async () => {
    const f = fixture(); f.snapshot(true);
    SERVICE.DefaultAuthorizationProviderService.authorizeToken = async () => { f.snapshot(false); return { result: f.auth }; };
    await assert.rejects(f.cron.assertOperational('tenant-a'), /changed/);
    f.cron.acceptingWork = false; await assert.rejects(f.cron.assertOperational('tenant-a'), /draining/);
});
