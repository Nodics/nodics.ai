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
assert.deepStrictEqual(options.sentinelTLS, {});
assert.strictEqual(options.retryStrategy(100), 1000);
assert.strictEqual(typeof adapter.createSentinelClient, 'function');
assert.strictEqual(typeof adapter.adaptClient, 'function');
assert.strictEqual(typeof adapter.adaptSubscriber, 'function');
assert.strictEqual(typeof adapter.scanIterator, 'function');
assert.strictEqual(typeof adapter.subscribe, 'function');

console.log('Redis Sentinel configuration contract validated');
