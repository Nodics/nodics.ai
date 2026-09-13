/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nCache/hazelcastCache/service/cache/DefaultHazelcastCacheService
 * @description Implements the nCache adapter contract with Hazelcast distributed maps, JSON serialization, TTL, and governed invalidation.
 * @layer service
 * @owner nCache/hazelcastCache
 * @override Projects may replace map naming or serialization while preserving tenant keys, TTL, detached values, and invalidation semantics.
 */
const { LockContext } = require('hazelcast-client');

module.exports = {
    /**
     * Serializes one entry mutation across asynchronous tasks and client instances.
     * A distinct public client lock context prevents same-client reentrant races.
     * @param {Object} options Tenant/channel cache coordinates and lock policy.
     * @param {Function} operation Operation receiving the locked map and storage key.
     * @returns {Promise<*>} Operation result after releasing its own lock.
     */
    withEntryLock: async function (options, operation) {
        if (!LockContext || typeof LockContext.run !== 'function') {
            throw new CLASSES.CacheError('ERR_CACHE_00009', 'Hazelcast atomic mutations require client 5.7 or later');
        }
        const configured = options.channel && options.channel.engineOptions && options.channel.engineOptions.options || {};
        const timeout = configured.lockTimeoutMs === undefined ? 5000 : configured.lockTimeoutMs;
        if (!Number.isSafeInteger(timeout) || timeout < 1 || timeout > 60000) {
            throw new CLASSES.CacheError('ERR_CACHE_00009', 'Hazelcast lockTimeoutMs must be between 1 and 60000');
        }
        let result;
        await LockContext.run(async () => {
            const map = await this.map(options), key = SERVICE.DefaultCacheConfigurationService.createStorageKey(options);
            let locked = false, failure;
            try {
                locked = await map.tryLock(key, timeout);
                if (!locked) throw new CLASSES.CacheError('ERR_CACHE_00009', 'Hazelcast mutation lock timed out');
                result = await operation(map, key);
            } catch (error) { failure = error; throw error; }
            finally {
                if (locked) {
                    try { await map.unlock(key); }
                    catch (error) { if (!failure) throw error; }
                }
            }
        });
        return result;
    },

    /** Uses a bounded entry lock and isolated async context to prevent version rollback. */
    putVersioned: async function (options) {
        try {
            const field = options.versionProperty || 'revision', incoming = options.value && options.value[field];
            if (!Number.isSafeInteger(incoming) || incoming < 0) throw new Error('Invalid cache version');
            return await this.withEntryLock(options, async (map, key) => {
                const raw = await map.get(key);
                const current = typeof raw === 'string' ? JSON.parse(raw) : raw;
                if (current && (!Number.isSafeInteger(current[field]) || current[field] < 0)) throw new Error('Invalid stored cache version');
                const assigned = options.advance === true ? Math.max(incoming, current ? current[field] + 1 : incoming) : incoming;
                if (!Number.isSafeInteger(assigned)) throw new Error('Cache version overflow');
                if (current && assigned < current[field]) throw new Error('Stale versioned cache write');
                const value = JSON.stringify({ ...options.value, [field]: assigned });
                await map.set(key, value, SERVICE.DefaultCacheConfigurationService.resolveTtl(options) * 1000);
                return { code: 'SUC_CACHE_00000', result: JSON.parse(value) };
            });
        } catch (error) { throw error instanceof CLASSES.CacheError ? error : new CLASSES.CacheError(error); }
    },

    /** Initializes the adapter. */ init: function () { return Promise.resolve(true); },
    /** Completes adapter initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns a deterministic cluster map name for one module and channel. */
    mapName: function (options) {
        let engineOptions = options.channel && options.channel.engineOptions || {}; let prefix = engineOptions.options && engineOptions.options.mapNamePrefix || 'nodics';
        return [prefix, options.moduleName || 'default', options.channel.channelName || options.channelName || 'cache'].join('_').replace(/[^A-Za-z0-9_.-]/g, '_');
    },
    /** Resolves the distributed map proxy. */ map: function (options) { return options.channel.client.getMap(this.mapName(options)); },
    /** Stores a JSON value using the effective nCache TTL. */
    put: async function (options) {
        try {
            let map = await this.map(options); let key = SERVICE.DefaultCacheConfigurationService.createStorageKey(options);
            let ttl = SERVICE.DefaultCacheConfigurationService.resolveTtl(options); let value = JSON.stringify(options.value);
            await map.set(key, value, ttl > 0 ? ttl * 1000 : 0); return { code: 'SUC_CACHE_00000', result: JSON.parse(value) };
        } catch (error) { throw error instanceof CLASSES.CacheError ? error : new CLASSES.CacheError(error); }
    },
    /** Reads and deserializes a detached value or returns the standard miss error. */
    get: async function (options) {
        try {
            let map = await this.map(options); let key = SERVICE.DefaultCacheConfigurationService.createStorageKey(options); let value = await map.get(key);
            if (value === null || value === undefined) throw new CLASSES.CacheError('ERR_CACHE_00001', 'Could not find Hazelcast value for key: ' + key);
            return typeof value === 'string' ? JSON.parse(value) : JSON.parse(JSON.stringify(value));
        } catch (error) { throw error instanceof CLASSES.CacheError ? error : new CLASSES.CacheError(error); }
    },
    /** Atomically removes and returns one value. */
    consume: async function (options) {
        try {
            let map = await this.map(options); let key = SERVICE.DefaultCacheConfigurationService.createStorageKey(options); let value = await map.remove(key);
            if (value === null || value === undefined) throw new CLASSES.CacheError('ERR_CACHE_00001', 'Could not consume Hazelcast value for key: ' + key);
            return typeof value === 'string' ? JSON.parse(value) : JSON.parse(JSON.stringify(value));
        } catch (error) { throw error instanceof CLASSES.CacheError ? error : new CLASSES.CacheError(error); }
    },
    /** Atomically increments a bounded distributed counter under an isolated entry lock. */
    incrementBounded: async function (options) {
        try {
            const amount = options.amount === undefined ? 1 : options.amount, maximum = options.maximum;
            const ttl = SERVICE.DefaultCacheConfigurationService.resolveTtl(options);
            if (!Number.isSafeInteger(amount) || amount < 1 || !Number.isSafeInteger(maximum) || maximum < 1 || ttl < 1) {
                throw new Error('Bounded increment requires positive amount, maximum, and TTL');
            }
            return await this.withEntryLock(options, async (map, key) => {
                const stored = await map.get(key), current = stored === null || stored === undefined ? 0 : Number(stored);
                if (!Number.isSafeInteger(current) || current < 0) throw new Error('Invalid stored bounded counter');
                const next = current + amount;
                if (!Number.isSafeInteger(next)) throw new Error('Bounded counter overflow');
                if (next > maximum) return { allowed: false, value: current, maximum };
                await map.set(key, String(next), ttl * 1000);
                return { allowed: true, value: next, maximum };
            });
        } catch (error) { throw error instanceof CLASSES.CacheError ? error : new CLASSES.CacheError(error); }
    },
    /** Removes every tenant-partitioned key matching the governed logical prefix. */
    flushByPrefix: async function (options) {
        try {
            let map = await this.map(options); let prefix = SERVICE.DefaultCacheConfigurationService.createStoragePrefix(options) + (options.prefix || '');
            let keys = (await map.keySet()).filter(key => String(key).startsWith(prefix));
            await Promise.all(keys.map(key => map.delete(key))); return { code: 'SUC_CACHE_00000', result: keys };
        } catch (error) { throw error instanceof CLASSES.CacheError ? error : new CLASSES.CacheError(error); }
    },
    /** Removes explicit tenant-partitioned keys. */
    flushByKeys: async function (options) {
        try {
            let map = await this.map(options); let keys = (options.keys || []).map(key => SERVICE.DefaultCacheConfigurationService.createStorageKey(options, key));
            await Promise.all(keys.map(key => map.delete(key))); return { code: 'SUC_CACHE_00000', result: keys };
        } catch (error) { throw error instanceof CLASSES.CacheError ? error : new CLASSES.CacheError(error); }
    }
};
