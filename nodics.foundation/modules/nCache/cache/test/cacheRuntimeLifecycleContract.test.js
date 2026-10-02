/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nCache/cache/test/cacheRuntimeLifecycleContract @description Verifies awaited subscriber readiness, owned-resource drain, and original failure preservation. @layer test @owner nCache/cache */
const assert = require('node:assert/strict');
const definition = require('../src/service/engine/defaultCacheEngineService');
const redisEngine = require('../../redisCache/src/service/engine/defaultRedisCacheEngineService');
/** Exercises effective layered configuration and real engine/channel startup with provider connections replaced by memory. */
async function verifyNamespaces() {
    const _ = require('lodash');
    const configuration = require('../src/service/config/defaultCacheConfigurationService');
    const adapter = require('../../redisCache/src/service/cache/defaultRedisCacheService');
    const defaults = require('../config/properties').cache;
    for (const explicit of [true, false]) {
        const policy = _.cloneDeep(defaults), started = [];
        policy.default.engines.redis.enabled = true;
        if (explicit) policy.default.engines.redis.options.prefix = 'isolatedLocal';
        else delete policy.default.engines.redis.options.prefix;
        for (const name of ['local', 'redis']) {
            policy.default.engines[name].connectionHandler = 'Connection';
            policy.default.engines[name].cacheHandler = 'Adapter';
        }
        policy.auth = { channels: { auth: { enabled: true, fallback: false, engine: 'redis', ttl: 0 } } };
        policy.inventory = { engines: { redis: { options: { prefix: 'inventoryScoped' } } },
            channels: { schema: { enabled: true, fallback: false, engine: 'redis', ttl: 17 } } };
        const modules = { auth: {}, profile: {}, inventory: {}, store: {} };
        global.CONFIG = { get: key => key === 'cache' ? policy : undefined };
        global.NODICS = { getModules: () => modules };
        global.CLASSES = { CacheError: Error };
        global.UTILS = { isBlank: value => !value || Object.keys(value).length === 0, generateHash: () => 'same-query' };
        const selected = { ...configuration, channels: {}, engines: {} };
        global.SERVICE = {
            DefaultCacheConfigurationService: selected,
            Adapter: adapter,
            Connection: { initCache: async (options, moduleName) => {
                started.push({ moduleName, prefix: options.options.prefix });
                return { code: 'SUC_CACHE_00000', result: { isReady: true, quit: async () => {} } };
            } }
        };
        await selected.loadCacheConfiguration();
        const startup = { ...definition, engineClients: {}, cacheClients: {} };
        await startup.buildCacheEngines();
        assert.equal(selected.engines.auth.redis.options.prefix, explicit ? 'isolatedLocal' : 'auth');
        assert.equal(selected.engines.profile.redis.options.prefix, explicit ? 'isolatedLocal' : 'profile');
        assert.equal(selected.engines.inventory.redis.options.prefix, 'inventoryScoped');
        const auth = startup.getCacheEngine('auth', 'auth');
        assert.equal(auth.channelOptions.fallback, false);
        assert.equal(auth.channelOptions.ttl, 0);
        assert.equal(selected.createStorageKey({ moduleName: 'auth', channel: auth, key: 'securityStamp:default:fixture' }),
            'auth_' + (explicit ? 'isolatedLocal' : 'auth') + '_securityStamp:default:fixture');
        const inventoryChannel = startup.getCacheEngine('inventory', 'schema');
        assert.equal(inventoryChannel.engineOptions.options.prefix, 'inventoryScoped');
        assert.equal(inventoryChannel.channelOptions.ttl, 17);
        assert.equal(inventoryChannel.channelOptions.fallback, false);
        const logical = selected.createItemKey({ tenant: 'default', schemaModel: { schemaName: 'sameSchema' }, query: {}, options: {} });
        const profileKey = selected.createStorageKey({ moduleName: 'profile', channel: startup.getCacheEngine('profile', 'schema'), key: logical });
        const storeKey = selected.createStorageKey({ moduleName: 'store', channel: startup.getCacheEngine('store', 'schema'), key: logical });
        const inventoryKey = selected.createStorageKey({ moduleName: 'inventory', channel: inventoryChannel, key: logical });
        assert.notEqual(profileKey, storeKey, 'ordinary default local item channels retain distinct module namespaces');
        assert.notEqual(profileKey, inventoryKey, 'ordinary Redis override retains its explicit owning namespace');
        assert(started.some(row => row.moduleName === 'inventory' && row.prefix === 'inventoryScoped'));
        const replicaConfiguration = {...configuration,channels:{},engines:{}};
        SERVICE.DefaultCacheConfigurationService = replicaConfiguration;
        await replicaConfiguration.loadCacheConfiguration();
        const replica = {...definition,engineClients:{},cacheClients:{}};
        await replica.buildCacheEngines();
        assert.equal(replicaConfiguration.createStorageKey({moduleName:'auth',channel:replica.getCacheEngine('auth','auth'),key:'securityStamp:default:fixture'}),
            selected.createStorageKey({moduleName:'auth',channel:auth,key:'securityStamp:default:fixture'}),
            'independent participants intentionally share the selected auth namespace');
        if (explicit) {
            const sharedSchema = {...auth,channelName:'schema'};
            assert.equal(selected.createStorageKey({moduleName:'profile',channel:sharedSchema,key:logical}),
                selected.createStorageKey({moduleName:'store',channel:sharedSchema,key:logical}),
                'explicitly sharing Redis prefixes also shares ordinary keys; deployments must use module overrides for isolation');
        }
        await replica.closeEngineClients();
        await startup.closeEngineClients();
    }
}
/** Exercises real lifecycle and subscription owners with controlled resource completion. */
async function run() {
    await verifyNamespaces();
    const contributors = {}, readiness = {}, closed = [];
    global.SERVICE = {
        DefaultRuntimeLifecycleService: { registerContributor: (name, value) => { contributors[name] = value; } },
        DefaultHealthService: { registerReadinessContributor: (name, value) => { readiness[name] = value; } }
    };
    const publisher = { isReady: true, quit: async () => { closed.push('publisher'); } };
    const subscriber = { isReady: true, quit: async () => { closed.push('subscriber'); } };
    const service = { ...definition, cacheClients: { cms: { first: { eventClient: subscriber }, alias: { eventClient: subscriber } } },
        engineClients: { cms: { redis: publisher, alias: publisher, hazelcast: { shutdown: async () => { closed.push('hazelcast'); } } } } };
    await service.init();
    assert(contributors.cacheEngines && readiness.cacheEngines);
    assert.equal(service.getCacheReadiness(), true);
    subscriber.isReady = false;
    assert.equal(service.getCacheReadiness(), false, 'A disconnected owned subscriber cannot report cache readiness');
    subscriber.isReady = true;
    await contributors.cacheEngines.shutdown();
    assert.deepEqual(closed.sort(), ['hazelcast', 'publisher', 'subscriber']);
    assert.deepEqual(service.cacheClients, {}); assert.deepEqual(service.engineClients, {});

    const failure = new Error('close failed');
    service.engineClients = { cms: { failed: { quit: () => { throw failure; } }, second: publisher } };
    service.cacheClients = { cms: { events: { eventClient: subscriber } } };
    closed.length = 0;
    await assert.rejects(service.closeEngineClients(), error => error === failure);
    assert.deepEqual(closed.sort(), ['publisher', 'subscriber'], 'Every owned client is attempted even after a synchronous close failure');

    let ready;
    const gate = new Promise(resolve => { ready = resolve; });
    const channel = { enabled: true, engine: 'redis', events: { expired: 'Owner.expired' } };
    global.UTILS = { isBlank: value => !value || Object.keys(value).length === 0 };
    global.CLASSES = { CacheError: Error };
    SERVICE.DefaultCacheConfigurationService = { getCacheChannels: () => ({ auth: channel }), getCacheEngine: () => ({ connectionHandler: 'Connection' }) };
    SERVICE.Connection = { registerEvents: () => gate };
    const startup = { ...definition, cacheClients: {}, engineClients: { cms: { redis: publisher } }, validateEngineContract: () => ({}) };
    let completed = false;
    const building = startup.buildModuleCacheEngine('cms', ['auth']).then(() => { completed = true; });
    await Promise.resolve(); await Promise.resolve(); assert.equal(completed, false, 'Startup must await configured subscriptions');
    ready(subscriber); await building;
    assert.equal(startup.cacheClients.cms.auth.eventClient, subscriber);
    await startup.closeEngineClients();

    const subscribeFailure = new Error('subscription failed');
    let destroyed = 0;
    global.NODICS = { getModule: () => ({}) };
    const broken = { on() {}, connect: async () => {}, subscribe: async () => { throw subscribeFailure; },
        destroy: () => { destroyed++; throw new Error('secondary cleanup failure'); } };
    await assert.rejects(redisEngine.registerEvents({ moduleName: 'cms', cacheOptions: {}, options: channel,
        publishClient: { configSet: async () => {}, duplicate: () => broken } }), error => error === subscribeFailure);
    assert.equal(destroyed, 1, 'An unregistered failed subscription must close before propagating its original failure');
    const { spawnSync } = require('node:child_process');
    const enginePath = require.resolve('../../redisCache/src/service/engine/defaultRedisCacheEngineService');
    const failedConnection = spawnSync(process.execPath, ['-e', `
        const net = require('node:net'), assert = require('node:assert/strict');
        global.CLASSES = { CacheError: Error };
        const engine = { ...require(${JSON.stringify(enginePath)}), LOG: { info() {}, error() {}, debug() {} } };
        (async () => {
            const reservation = net.createServer();
            await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
            const port = reservation.address().port;
            await new Promise(resolve => reservation.close(resolve));
            await assert.rejects(engine.initCache({ options: { host: '127.0.0.1', port, socket: { connectTimeout: 250 } } }, 'test'));
            console.log('FAILED_CONNECTION_CLOSED');
        })().catch(error => { console.error(error); process.exitCode = 1; });
    `], { encoding: 'utf8', timeout: 4000 });
    assert.equal(failedConnection.status, 0, 'A rejected Redis connection must exit without a reconnect loop: ' + failedConnection.stderr);
    assert(failedConnection.stdout.includes('FAILED_CONNECTION_CLOSED'));
    console.log('Cache runtime lifecycle contracts validated');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
