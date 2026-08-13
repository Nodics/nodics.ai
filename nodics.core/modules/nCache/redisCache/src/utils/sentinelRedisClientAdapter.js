/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nCache/redisCache/service/engine/SentinelRedisClientAdapter
 * @description Adapts an ioredis Sentinel client to the provider-neutral client surface already consumed by nCache.
 * @owner nCache/redisCache
 * @layer provider-adapter-utility
 * @override Projects may replace the Redis engine service while preserving this cache-client behavior contract.
 */

/** Creates an async iterator over Redis SCAN results without using blocking KEYS. */
async function* scanIterator(client, options) {
    let cursor = '0';
    do {
        let result = await client.scan(cursor, 'MATCH', options.MATCH || '*', 'COUNT', options.COUNT || 100);
        cursor = result[0];
        for (let key of result[1]) yield key;
    } while (cursor !== '0');
}

/** Wraps one ioredis client with node-redis-compatible operations used by Nodics cache services. */
function adapt(client) {
    return {
        /** Registers a client lifecycle listener. */
        on: function (event, handler) { client.on(event, handler); return this; },
        /** Opens the lazy Sentinel connection. */
        connect: function () { return client.connect(); },
        /** Immediately closes the client connection. */
        disconnect: function () { return client.disconnect(); },
        /** Gracefully closes the client connection. */
        quit: function () { return client.quit(); },
        /** Reads a cache value. */
        get: function (key) { return client.get(key); },
        /** Writes a cache value with optional expiry. */
        set: function (key, value, options) {
            return options && options.EX ? client.set(key, value, 'EX', options.EX) : client.set(key, value);
        },
        /** Atomically reads and deletes a cache value. */
        getDel: function (key) { return client.call('GETDEL', key); },
        /** Deletes one key or a list of keys. */
        del: function (keys) { return Array.isArray(keys) ? client.del(...keys) : client.del(keys); },
        /** Evaluates one cache script with explicit keys and arguments. */
        eval: function (script, options) { return client.eval(script, options.keys.length, ...options.keys, ...options.arguments); },
        /** Updates a supported Redis runtime configuration property. */
        configSet: function (key, value) { return client.config('SET', key, value); },
        /** Iterates matching keys through non-blocking SCAN operations. */
        scanIterator: function (options) { return scanIterator(client, options || {}); },
        /** Creates an independently connected subscriber facade. */
        duplicate: function () { return adaptSubscriber(client.duplicate({ lazyConnect: true })); },
        rawClient: client
    };
}

/** Adapts subscription callbacks so existing cache event registration remains provider-neutral. */
function adaptSubscriber(client) {
    let handlers = new Map();
    client.on('message', (channel, message) => {
        let handler = handlers.get(channel);
        if (handler) handler(message, channel);
    });
    let facade = adapt(client);
    facade.subscribe = function (channel, handler) {
        handlers.set(channel, handler);
        return client.subscribe(channel);
    };
    return facade;
}

/** Creates a lazy Sentinel client that discovers and reconnects to the promoted primary. */
function createSentinelClient(options) {
    const IORedis = require('ioredis');
    return adapt(new IORedis(Object.assign({}, options, { lazyConnect: true, role: 'master' })));
}

module.exports = { adapt, createSentinelClient, scanIterator };
