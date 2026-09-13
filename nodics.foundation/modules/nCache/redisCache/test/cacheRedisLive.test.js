/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const redis = require('redis');

/**
 * @module redisCache/test/cacheRedisLive
 * @description Verifies the complete Redis cache adapter contract against the environment-provided live endpoint, or fails closed when none exists.
 * @layer test
 * @owner nCache/redisCache
 * @override CI, release, and deployment pipelines provide NODICS_CACHE_REDIS_URL when live provider evidence is mandatory.
 */

class CacheError extends Error {
    constructor(error, message) { super(message || error && error.message || String(error)); this.code = typeof error === 'string' ? error : error && error.code; }
}
global.CLASSES = { CacheError };
const configurationService = require('../../cache/src/service/config/defaultCacheConfigurationService');
global.SERVICE = { DefaultCacheConfigurationService: configurationService };

(async function () {
    const url = process.env.NODICS_CACHE_REDIS_URL;
    const requireLive = process.argv.includes('--require-live') || process.env.NODICS_CACHE_REQUIRE_LIVE === 'true';
    if (!url) {
        assert(!requireLive, 'A Redis endpoint is required for the cache Redis release gate');
        console.log('Redis cache live contract NOT EXECUTED: set NODICS_CACHE_REDIS_URL and use --require-live when live provider evidence is mandatory');
        return;
    }
    const client = redis.createClient({ url });
    await client.connect();
    const service = Object.assign({}, require('../src/service/cache/defaultRedisCacheService'), { LOG: { debug: () => {} } });
    const prefix = 'nodics-cache-live-' + Date.now();
    const channel = {
        channelName: 'contract',
        channelOptions: { ttl: 10 },
        engineOptions: { options: { prefix }, ttl: 10 },
        client
    };
    try {
        const versioned = { tenant: 'test-tenant', channel, key: 'stamp', ttl: 0, versionProperty: 'authVersion', value: { authVersion: 10 } };
        await service.putVersioned(versioned);
        const writes = await Promise.allSettled([25, 3, 19, 26, 1].map(version => service.putVersioned({ ...versioned, value: { authVersion: version } })));
        assert(writes.some(result => result.status === 'rejected'));
        assert.strictEqual((await service.get(versioned)).authVersion, 26);
        await assert.rejects(service.putVersioned(versioned), /Stale/);
        await service.putVersioned({ ...versioned, value: { authVersion: 26 } });
        const allocated = await Promise.all(Array.from({ length: 64 }, () => service.putVersioned({ ...versioned, advance: true, value: { authVersion: 1, items: [], metadata: { nested: [] } } })));
        assert.deepStrictEqual(allocated.map(row => row.result.authVersion).sort((a, b) => a - b), Array.from({ length: 64 }, (_, index) => 27 + index));
        assert.deepStrictEqual((await service.get(versioned)).metadata, { nested: [] });
        assert.deepStrictEqual((await service.get(versioned)).items, []);
        const otherTenant = { ...versioned, tenant: 'another-tenant', value: { authVersion: 1 } };
        await service.putVersioned(otherTenant);
        assert.strictEqual((await service.get(otherTenant)).authVersion, 1);
        await service.flushByKeys({ ...otherTenant, keys: ['stamp'] });
        await service.put({ tenant: 'test-tenant', channel, key: 'read', value: { result: 'ok' }, ttl: 10 });
        assert.strictEqual((await service.get({ tenant: 'test-tenant', channel, key: 'read' })).result, 'ok');
        assert.strictEqual((await service.consume({ tenant: 'test-tenant', channel, key: 'read' })).result, 'ok');
        await assert.rejects(service.get({ tenant: 'test-tenant', channel, key: 'read' }), error => error.code === 'ERR_CACHE_00001');
        await service.put({ tenant: 'test-tenant', channel, key: 'prefix-a', value: { result: 1 }, ttl: 10 });
        await service.put({ tenant: 'test-tenant', channel, key: 'keep', value: { result: 2 }, ttl: 10 });
        await service.flushByPrefix({ tenant: 'test-tenant', channel, prefix: 'prefix' });
        await assert.rejects(service.get({ tenant: 'test-tenant', channel, key: 'prefix-a' }));
        assert.strictEqual((await service.get({ tenant: 'test-tenant', channel, key: 'keep' })).result, 2);
        await service.flushByKeys({ tenant: 'test-tenant', channel, keys: ['keep'] });
        await assert.rejects(service.get({ tenant: 'test-tenant', channel, key: 'keep' }));
        console.log('Redis cache live contract validated');
    } finally {
        await service.flushByPrefix({ tenant: 'test-tenant', channel }).catch(() => false);
        await client.quit().catch(() => false);
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
