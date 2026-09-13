/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module hazelcastCache/test/cacheHazelcastLive @description Qualifies a real member for tenant isolation, TTL, atomic same-client/multi-client mutations, lock timeout and connection failure. @layer test @owner nCache/hazelcastCache */
const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const members = process.env.NODICS_CACHE_HAZELCAST_MEMBERS;
const required = process.argv.includes('--require-live');
if (!members) {
    if (required) { console.error('NODICS_CACHE_HAZELCAST_MEMBERS is required'); process.exit(1); }
    console.log('Hazelcast cache live contract NOT EXECUTED: set NODICS_CACHE_HAZELCAST_MEMBERS; use --require-live');
} else {
    class CacheError extends Error { constructor(error, message) { super(message || error && error.message || String(error)); this.code = typeof error === 'string' ? error : error && error.code; } }
    global.CLASSES = { CacheError };
    const configuration = require('../../cache/src/service/config/defaultCacheConfigurationService');
    global.SERVICE = { DefaultCacheConfigurationService: configuration };
    const { LockContext } = require('hazelcast-client');
    const engine = Object.assign({}, require('../src/service/engine/defaultHazelcastCacheEngineService'), { LOG: { info: () => {} } });
    const service = require('../src/service/cache/defaultHazelcastCacheService');
    const clients = [];
    const engineOptions = {
        clusterName: process.env.NODICS_CACHE_HAZELCAST_CLUSTER || 'dev',
        clusterMembers: members.split(',').map(value => value.trim()).filter(Boolean),
        connectionTimeoutMs: 5000, properties: { 'hazelcast.logging.level': 'OFF' }
    };
    (async () => {
        const started = await engine.initCache({ options: engineOptions }, 'hazelcastLive');
        clients.push(started.result);
        const channel = { channelName: 'qualification', channelOptions: { ttl: 30 }, engineOptions: { options: {
            prefix: 'hazelcastLive', mapNamePrefix: 'nodics-live-' + require('node:crypto').randomUUID(), lockTimeoutMs: 1000
        } }, client: started.result };
        const request = { tenant: 'tenant-a', moduleName: 'hazelcastLive', channel };
        const map = await service.map(request);
        const evidence = { memberVersion: 'external configured member', clientVersion: require('hazelcast-client/package.json').version };
        try {
            await service.put({ ...request, key: 'expire', value: { result: 'a' }, ttl: 1 });
            await service.put({ ...request, tenant: 'tenant-b', key: 'expire', value: { result: 'b' }, ttl: 10 });
            await new Promise(resolve => setTimeout(resolve, 1300));
            await assert.rejects(service.get({ ...request, key: 'expire' }));
            assert.equal((await service.get({ ...request, tenant: 'tenant-b', key: 'expire' })).result, 'b');
            await service.flushByPrefix({ ...request, prefix: 'expire' });
            assert.equal((await service.get({ ...request, tenant: 'tenant-b', key: 'expire' })).result, 'b');

            const value = { revision: 1, payload: ['preserved'] };
            const sameClient = await Promise.all(Array.from({ length: 64 }, () => service.putVersioned({ ...request, key: 'same', value, advance: true, ttl: 0 })));
            assert.equal(new Set(sameClient.map(row => row.result.revision)).size, 64);
            assert.equal((await service.get({ ...request, key: 'same' })).revision, 64);
            assert.equal(value.revision, 1);
            await assert.rejects(service.putVersioned({ ...request, key: 'same', value, ttl: 0 }), /Stale/);
            evidence.sameClientUniqueVersions = 64;

            for (let index = 0; index < 2; index++) clients.push((await engine.initCache({ options: engineOptions }, 'hazelcastLive')).result);
            const multiClient = await Promise.all(Array.from({ length: 96 }, (_, index) => service.putVersioned({
                ...request, channel: { ...channel, client: clients[index % clients.length] }, key: 'shared', value, advance: true, ttl: 0
            })));
            assert.equal(new Set(multiClient.map(row => row.result.revision)).size, 96);
            assert.equal((await service.get({ ...request, key: 'shared' })).revision, 96);
            evidence.multiClientUniqueVersions = 96;
            const counter = await Promise.all(Array.from({ length: 64 }, (_, index) => service.incrementBounded({
                ...request, channel: { ...channel, client: clients[index % clients.length] }, key: 'bounded', maximum: 17, ttl: 30
            })));
            assert.equal(counter.filter(row => row.allowed).length, 17);
            assert.equal(new Set(counter.filter(row => row.allowed).map(row => row.value)).size, 17);
            evidence.counterAdmissions = 17;

            const lockedRequest = { ...request, key: 'locked', value, advance: true };
            const key = configuration.createStorageKey(lockedRequest);
            let release, ready;
            const acquired = new Promise(resolve => { ready = resolve; });
            const holding = LockContext.run(async () => {
                await map.lock(key); ready();
                try { await new Promise(resolve => { release = resolve; }); } finally { await map.unlock(key); }
            });
            await acquired;
            try {
                const boundedChannel = { ...channel, engineOptions: { options: { ...channel.engineOptions.options, lockTimeoutMs: 30 } } };
                await assert.rejects(service.putVersioned({ ...lockedRequest, channel: boundedChannel }), /lock timed out/);
                assert.equal(await map.get(key), null);
            } finally { release(); await holding; }
            assert.equal((await service.putVersioned(lockedRequest)).result.revision, 1);
            evidence.lockTimeoutAndRecovery = true;

            const samples = [];
            for (let index = 0; index < 150; index++) {
                const start = performance.now();
                await service.putVersioned({ ...request, key: 'latency', value, advance: true, ttl: 0 });
                samples.push(performance.now() - start);
            }
            samples.sort((a, b) => a - b);
            evidence.sequentialMutationMs = { samples: samples.length, median: Number(samples[74].toFixed(3)), p95: Number(samples[142].toFixed(3)) };
            // A wrong cluster name exercises real bounded connection failure without touching another member.
            const start = performance.now();
            await assert.rejects(engine.initCache({ options: { ...engineOptions, clusterName: engineOptions.clusterName + '-absent',
                connectionTimeoutMs: 200, connectionStrategy: { connectionRetry: { initialBackoffMillis: 10, maxBackoffMillis: 20, clusterConnectTimeoutMillis: 200 } }
            } }, 'hazelcastLive'));
            assert(performance.now() - start < 2500, 'Connection attempts must not retry indefinitely');
            evidence.connectionFailureBounded = true;
            console.log('Hazelcast cache live contract validated: ' + JSON.stringify(evidence));
        } finally {
            await map.destroy();
            const lifecycle = require('../../cache/src/service/engine/defaultCacheEngineService');
            const owned = { ...lifecycle, cacheClients: {}, engineClients: { qualification: Object.fromEntries(clients.map((client, index) => [index, client])) } };
            await owned.closeEngineClients();
            assert(clients.every(client => !client.getLifecycleService().isRunning()));
        }
    })().catch(error => { console.error(error); process.exit(1); });
}
