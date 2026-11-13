/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

/** @module redisCache/test/RedisSentinelConfigurationContract @description Verifies direct compatibility and strict Sentinel option mapping. */

const service = require('../src/service/engine/defaultRedisCacheEngineService');
const adapter = require('../src/service/engine/defaultSentinelRedisClientAdapterService');

// Layer provider defaults and exercise the key consumer without connecting to Redis.
const merge = require('lodash/merge');
const cacheConfiguration = require('../../cache/src/service/config/defaultCacheConfigurationService');
const baseline = merge({}, require('../../cache/config/properties'), require('../config/properties'));
const engine = baseline.cache.default.engines.redis;
assert.strictEqual(engine.enabled, false);
assert.strictEqual(engine.options.prefix, 'localRuntimeAuth');
const enabled = merge({}, engine, { enabled: true });
const overridden = merge({}, enabled, { options: { prefix: 'isolatedRuntimeAuth' } });
const key = (engineOptions, tenant) => cacheConfiguration.createStorageKey({
    channel: { channelName: 'auth', engineOptions }, tenant, key: 'session'
});
assert.strictEqual(key(enabled, 'tenantA'), 'auth_localRuntimeAuth_tenantA_session');
assert.strictEqual(key(overridden, 'tenantA'), 'auth_isolatedRuntimeAuth_tenantA_session');
assert.notStrictEqual(key(overridden, 'tenantA'), key(overridden, 'tenantB'));
assert.strictEqual(overridden.options.host, engine.options.host);
assert.strictEqual(engine.options.prefix, 'localRuntimeAuth');
assert.strictEqual(engine.enabled, false);

assert.strictEqual(service.buildSentinelOptions({ url: 'redis://127.0.0.1:6379' }), null);
const sentinelDefaults = service.buildSentinelOptions(merge({}, engine.options, {
    sentinel: { enabled: true, name: 'independent-cache', endpoints: [{ host: 'sentinel.example.test', port: 26379 }] }
}));
assert.strictEqual(sentinelDefaults.db, 0);
assert.strictEqual(sentinelDefaults.retryStrategy(1), 250);
assert.strictEqual(sentinelDefaults.retryStrategy(100), 5000);
assert.strictEqual(sentinelDefaults.connectTimeout, 10000);
assert.strictEqual(sentinelDefaults.commandTimeout, 10000);
assert.throws(() => service.buildSentinelOptions({ sentinel: { enabled: true, endpoints: [] } }), /master name/);
assert.throws(() => service.buildSentinelOptions({ sentinel: { enabled: true, name: 'nodics', endpoints: [{ host: '', port: 0 }] } }), /valid host and port/);

const options = service.buildSentinelOptions({
    database: 2,
    username: 'runtime',
    password: 'secret',
    name: 'nodics-test',
    sentinel: {
        enabled: true,
        name: 'nodics',
        endpoints: [{ host: 'sentinel-a', port: 26379 }, { host: 'sentinel-b', port: '26380' }],
        username: 'sentinel-runtime',
        password: 'sentinel-secret',
        connectTimeout: 4000,
        commandTimeout: 5000,
        retryDelayMs: 100,
        maximumRetryDelayMs: 1000,
        tls: true
    }
});

assert.deepStrictEqual(options.sentinels, [{ host: 'sentinel-a', port: 26379 }, { host: 'sentinel-b', port: 26380 }]);
assert.strictEqual(options.name, 'nodics');
assert.strictEqual(options.db, 2);
assert.strictEqual(options.connectionName, 'nodics-test');
assert.strictEqual(options.sentinelUsername, 'sentinel-runtime');
assert.strictEqual(options.sentinelPassword, 'sentinel-secret');
assert.strictEqual(options.connectTimeout, 4000);
assert.strictEqual(options.commandTimeout, 5000);
assert.deepStrictEqual(options.sentinelTLS, {});
assert.strictEqual(options.retryStrategy(100), 1000);
assert.strictEqual(typeof adapter.createSentinelClient, 'function');
assert.strictEqual(typeof adapter.adaptClient, 'function');
assert.strictEqual(typeof adapter.adaptSubscriber, 'function');
assert.strictEqual(typeof adapter.scanIterator, 'function');
assert.strictEqual(typeof adapter.subscribe, 'function');

console.log('Redis Sentinel configuration contract validated');

require('node:test')('module cache consumers inherit capabilities and later deployment overrides', async () => {
    const previousConfig = global.CONFIG;
    const previousNodics = global.NODICS;
    const selected = merge({}, baseline, {
        cache: { default: { engines: { redis: { enabled: true } } } }
    });
    const consumer = { ...cacheConfiguration, channels: {}, engines: {} };
    try {
        global.CONFIG = { get: key => selected[key] };
        global.NODICS = { getModules: () => ({ independentModule: {}, otherModule: {} }) };
        await consumer.loadCacheConfiguration();
        const inherited = consumer.getCacheEngine('independentModule', 'redis');
        assert.strictEqual(inherited.enabled, true);
        assert.strictEqual(inherited.options.prefix, 'localRuntimeAuth');
        assert.strictEqual(inherited.distributed, true);
        assert.strictEqual(inherited.atomicConsume, true);
        selected.cache.default.engines.redis.options.prefix = 'isolatedRuntimeAuth';
        selected.cache.default.engines.redis.ttl = 270;
        selected.cache.otherModule = { engines: { redis: { enabled: false } } };
        await consumer.loadCacheConfiguration();
        const changed = consumer.getCacheEngine('independentModule', 'redis');
        assert.strictEqual(changed.options.prefix, 'isolatedRuntimeAuth');
        assert.strictEqual(changed.ttl, 270);
        assert.strictEqual(consumer.getCacheEngine('otherModule', 'redis').enabled, false);
        assert.strictEqual(consumer.getCacheEngine('inactiveModule', 'redis'), null);
        assert.strictEqual(inherited.options.prefix, 'localRuntimeAuth');
        assert.strictEqual(engine.enabled, false);
        assert.strictEqual(engine.options.prefix, 'localRuntimeAuth');
    } finally {
        global.CONFIG = previousConfig;
        global.NODICS = previousNodics;
    }
});

require("node:test")("Sentinel readiness tracks connection loss and explicit shutdown", () => {
    const provider = { status: "wait" };
    const facade = adapter.adaptClient(provider);
    assert.strictEqual(facade.isOpen, false);
    assert.strictEqual(facade.isReady, false);
    for (const status of ["connecting", "connect", "reconnecting", "close"]) {
        provider.status = status;
        assert.strictEqual(facade.isReady, false);
    }
    provider.status = "ready";
    assert.strictEqual(facade.isOpen, true);
    assert.strictEqual(facade.isReady, true);
    provider.status = "end";
    assert.strictEqual(facade.isOpen, false);
    assert.strictEqual(facade.isReady, false);
});

require("node:test")("awaited Sentinel shutdown exposes closed state before the socket close event", async () => {
    let disconnects = 0;
    const provider = Object.assign(new (require('node:events').EventEmitter)(), {
        status: 'ready', quit: async () => 'OK',
        disconnect() { disconnects++; setImmediate(() => { this.status = 'end'; this.emit('end'); }); },
        async connect() { assert.equal(this.status, 'end'); this.status = 'ready'; }
    });
    const client = adapter.adaptClient(provider);
    assert.equal(await client.quit(), "OK");
    assert.equal(client.isReady, false);
    assert.equal(client.isOpen, false);
    assert.equal(disconnects, 1);
    assert.equal(provider.status, 'end', 'shutdown waits for the provider close event');
    await client.connect();
    assert.equal(client.isReady, true);
    client.disconnect();
    assert.equal(client.isReady, false);
    assert.equal(client.isOpen, false);
});
