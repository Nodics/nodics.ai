/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module cache/test/cacheVersionedWriteContract @description Verifies monotonic cache writes, independent namespaces and malformed version rejection. @layer test @owner nCache */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const local = { ...require('../../nodeCache/src/service/cache/defaultLocalCacheService'), LOG: { debug() {} } };
const facade = require('../src/service/cache/defaultCacheService');
const configuration = require('../src/service/config/defaultCacheConfigurationService');
class CacheError extends Error { constructor(error, message) { super(message || error.message || String(error)); } }
global.CLASSES = { CacheError };
const values = new Map();
const channel = { channelName: 'auth', channelOptions: { ttl: 0 }, engineOptions: { cacheHandler: 'Local', capabilities: { atomicVersionWrite: true, nonExpiringTtl: true, ttl: true }, options: { prefix: 'version-test' } }, client: { get: key => values.get(key), set: (key, value) => { values.set(key, value); return true; } } };
global.SERVICE = { DefaultCacheConfigurationService: configuration, DefaultCacheEngineService: { getCacheEngine: () => channel }, Local: local };
const owner = { ...facade, observeCacheOperation: (_method, _options, operation) => Promise.resolve().then(operation) };
const input = { moduleName: 'identity', channelName: 'auth', tenant: 'first', key: 'principal', ttl: 0, versionProperty: 'authVersion', value: { authVersion: 10 } };
test('old issuers cannot restore a revoked version, including overlapping attempts', async () => {
    await owner.putVersioned(input);
    const outcomes = await Promise.allSettled([20, 5, 12, 21, 1].map(version => owner.putVersioned({ ...input, value: { authVersion: version } })));
    assert(outcomes.some(result => result.status === 'rejected'));
    const result = await local.get({ ...input, channel }); assert.equal(result.authVersion, 21);
    await assert.rejects(owner.putVersioned(input), /Stale/);
    await owner.putVersioned({ ...input, value: { authVersion: 21 } });
    const other = { ...input, tenant: 'second', value: { authVersion: 1 } };
    await owner.putVersioned(other); assert.equal((await local.get({ ...other, channel })).authVersion, 1);
});
test('unsupported adapters and invalid numeric versions reject before writes', async () => {
    for (const version of [NaN, Infinity, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) await assert.rejects(owner.putVersioned({ ...input, value: { authVersion: version } }));
    channel.engineOptions.capabilities.atomicVersionWrite = false;
    await assert.rejects(owner.putVersioned(input), /atomicVersionWrite/);
    channel.engineOptions.capabilities.atomicVersionWrite = true;
});

test('concurrent allocation returns distinct increasing versions without mutating caller values', async () => {
    const request = { ...input, key: 'sequence', advance: true, value: { authVersion: 100, metadata: { items: [] } } };
    const allocated = await Promise.all(Array.from({ length: 64 }, () => owner.putVersioned(request)));
    assert.deepEqual(allocated.map(row => row.result.authVersion), Array.from({ length: 64 }, (_, index) => 100 + index));
    assert.equal(request.value.authVersion, 100);
    assert.deepEqual((await local.get({ ...request, channel })).metadata, { items: [] });
    await owner.putVersioned({ ...request, key: 'overflow', value: { authVersion: Number.MAX_SAFE_INTEGER } });
    await assert.rejects(owner.putVersioned({ ...request, key: 'overflow' }), /overflow/);
});
