/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nAuth/test/integration/authRuntimeRedisLive @description Qualifies JWT revocation and operational admission across independent processes using an explicitly configured disposable Redis endpoint. @layer test @owner nAuth */
const assert = require('node:assert/strict');
const { fork } = require('node:child_process');
const { randomUUID, randomBytes } = require('node:crypto');
const { createClient } = require('redis');
const { performance } = require('node:perf_hooks');
const configuration = require('./authIntegrationTestConfiguration').load();
/** Creates a bounded request channel to a separate production-owner test process. */
function worker() {
    const child = fork(require.resolve('./authRuntimeRedisWorker'), [], { stdio: ['ignore', 'ignore', 'inherit', 'ipc'] });
    const pending = new Map();
    child.on('message', message => {
        const entry = pending.get(message.id); if (!entry) return;
        clearTimeout(entry.timer); pending.delete(message.id);
        if (message.error) entry.reject(Object.assign(new Error('Runtime operation rejected'), message.error)); else entry.resolve(message.result);
    });
    child.on('exit', () => { for (const entry of pending.values()) { clearTimeout(entry.timer); entry.reject(new Error('Runtime worker exited')); } pending.clear(); });
    return { child, call: (action, input = {}) => new Promise((resolve, reject) => {
        const id = randomUUID(), timer = setTimeout(() => { pending.delete(id); reject(new Error('Runtime operation deadline exceeded')); }, 15000);
        pending.set(id, { resolve, reject, timer }); child.send({ id, action, input });
    }) };
}
/** Runs successful, rejected, burst, freshness and provider failure/recovery scenarios. */
async function run() {
    if (!configuration.redisUrl) { console.log('Runtime Redis live contract NOT EXECUTED: supply NODICS_AUTH_REDIS_LIVE_URL and --require-live'); return; }
    const replicas = [worker(), worker()], prefix = 'nodics-runtime-test-' + randomUUID(), secret = randomBytes(48).toString('base64url');
    const tenant = configuration.tenant;
    const client = createClient({ url: configuration.redisUrl, socket: { reconnectStrategy: false } }); client.on('error', () => {});
    try {
        await client.connect();
        await Promise.all(replicas.map((replica, index) => replica.call('initialize', { url: configuration.redisUrl, secret, prefix, instance: 'worker-' + index })));
        const options = { tenant, runtimeInstanceId: 'worker-0', serviceId: 'worker-principal', authVersion: 1, tokenLife: 60, modules: ['cronjob'], permissions: ['jobs.execute'],
            runtimeScope: { assignmentCode: 'explicit-test-grant', projectCode: 'runtime.test', environmentCode: 'test', serverCode: 'worker', instanceCode: 'worker-0' } };
        let token = await replicas[0].call('issue', options);
        assert.equal(await replicas[1].call('verify', { token }), true);
        await replicas[0].call('revokeToken', { token });
        await assert.rejects(replicas[1].call('verify', { token }));
        token = await replicas[0].call('issue', options);
        const changed = await replicas[1].call('revoke', options);
        assert.equal(changed, 2);
        await assert.rejects(replicas[0].call('verify', { token }));
        await assert.rejects(replicas[0].call('issue', options));
        token = await replicas[0].call('issue', { ...options, authVersion: changed });
        const otherTenant = await replicas[1].call('issue', { ...options, tenant: tenant + '_other' });
        assert.equal(await replicas[0].call('verify', { token: otherTenant }), true);
        await replicas[0].call('state', { enabled: true });
        assert.equal(await replicas[0].call('admit', { token, tenant }), true);
        await assert.rejects(replicas[0].call('admit', { token, tenant: tenant + '_other' }));
        await assert.rejects(replicas[0].call('admit', { token, tenant, moduleName: 'inventory' }));
        await replicas[1].call('state', { enabled: true });
        await assert.rejects(replicas[1].call('admit', { token, tenant }));
        await replicas[0].call('state', { enabled: false });
        await assert.rejects(replicas[0].call('admit', { token, tenant }));
        await replicas[0].call('state', { enabled: true });
        await new Promise(resolve => setTimeout(resolve, 1100));
        await assert.rejects(replicas[0].call('admit', { token, tenant }));
        await replicas[0].call('state', { enabled: true });
        assert.equal(await replicas[0].call('admit', { token, tenant }), true);
        await replicas[1].call('disconnect');
        await assert.rejects(replicas[1].call('verify', { token }));
        await replicas[1].call('reconnect');
        assert.equal(await replicas[1].call('verify', { token }), true);
        const expired = await replicas[0].call('issue', { ...options, authVersion: changed, tokenLife: -1 });
        await assert.rejects(replicas[1].call('verify', { token: expired }));
        await assert.rejects(replicas[1].call('verify', { token: 'malformed' }));
        const burstStart = performance.now();
        const burst = await Promise.all(Array.from({ length: 64 }, (_, index) => replicas[index % 2].call('issue', { ...options, authVersion: changed })));
        assert.equal(new Set(burst).size, 64);
        const burstMs = performance.now() - burstStart;
        const p95BudgetMs = Number(process.env.NODICS_AUTH_RUNTIME_P95_MAX_MS || 25);
        assert(Number.isFinite(p95BudgetMs) && p95BudgetMs > 0 && p95BudgetMs <= 10000, 'Supply a bounded local latency budget');
        const benchmark = await Promise.all(replicas.map(replica => replica.call('benchmark', { token, samples: 1000 })));
        for (const row of benchmark) {
            assert.equal(row.cacheReads, row.samples * 2, 'Verification must stay at one revocation and one principal-stamp read');
            assert(row.p95Ms <= p95BudgetMs, 'Local runtime verification p95 budget exceeded');
        }
        console.log('Runtime Redis live contract validated: ' + JSON.stringify({ replicas: 2, independentClients: true, crossProcessRevocation: true,
            staleIssuerRejected: true, tenantIsolation: true, moduleAndInstanceScope: true, inactiveAndExpiredStateRejected: true,
            expiredTokensRejected: true, disconnectedClientRejected: true, providerReconnectRecovered: true, burstTokens: 64, burstMs, p95BudgetMs, benchmark }));
    } finally {
        await Promise.allSettled(replicas.map(async replica => { try { await replica.call('stop'); } finally { replica.child.kill(); } }));
        if (client.isOpen) {
            const keys = []; for await (const batch of client.scanIterator({ MATCH: '*' + prefix + '*', COUNT: 100 })) keys.push(...[].concat(batch));
            if (keys.length) await client.del(keys); await client.quit();
        }
    }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
