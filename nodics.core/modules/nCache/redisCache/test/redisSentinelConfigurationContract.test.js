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

console.log('Redis Sentinel configuration contract validated');
