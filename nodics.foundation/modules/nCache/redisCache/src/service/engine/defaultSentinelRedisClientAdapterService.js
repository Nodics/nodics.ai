/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nCache/redisCache/service/engine/DefaultSentinelRedisClientAdapterService
 * @description Adapts an ioredis Sentinel client to the provider-neutral cache client contract.
 * @owner nCache/redisCache
 * @layer provider-adapter-service
 * @override Later-loaded modules may replace individual adapter operations through the Nodics service registry.
 */
module.exports = {
    /** Creates a lazy Sentinel client that discovers and reconnects to the promoted primary. */
    createSentinelClient: function (options) {
        const IORedis = require('ioredis');
        return this.adaptClient(new IORedis(Object.assign({}, options, { lazyConnect: true, role: 'master' })));
    },

    /** Creates the provider-neutral facade consumed by Nodics cache services. */
    adaptClient: function (client) {
        return {
            on: this.registerListener.bind(this, client),
            connect: this.connect.bind(this, client),
            disconnect: this.disconnect.bind(this, client),
            quit: this.quit.bind(this, client),
            get: this.get.bind(this, client),
            set: this.set.bind(this, client),
            getDel: this.getDel.bind(this, client),
            del: this.del.bind(this, client),
            eval: this.eval.bind(this, client),
            configSet: this.configSet.bind(this, client),
            scanIterator: this.scanIterator.bind(this, client),
            duplicate: this.duplicate.bind(this, client),
            rawClient: client
        };
    },

    /** Registers a client lifecycle listener. */
    registerListener: function (client, event, handler) {
        client.on(event, handler);
        return client;
    },

    /** Opens the lazy Sentinel connection. */
    connect: function (client) {
        return client.connect();
    },

    /** Immediately closes the client connection. */
    disconnect: function (client) {
        return client.disconnect();
    },

    /** Gracefully closes the client connection. */
    quit: function (client) {
        return client.quit();
    },

    /** Reads a cache value. */
    get: function (client, key) {
        return client.get(key);
    },

    /** Writes a cache value with optional expiry. */
    set: function (client, key, value, options) {
        return options && options.EX ? client.set(key, value, 'EX', options.EX) : client.set(key, value);
    },

    /** Atomically reads and deletes a cache value. */
    getDel: function (client, key) {
        return client.call('GETDEL', key);
    },

    /** Deletes one key or a list of keys. */
    del: function (client, keys) {
        return Array.isArray(keys) ? client.del(...keys) : client.del(keys);
    },

    /** Evaluates one cache script with explicit keys and arguments. */
    eval: function (client, script, options) {
        return client.eval(script, options.keys.length, ...options.keys, ...options.arguments);
    },

    /** Updates a supported Redis runtime configuration property. */
    configSet: function (client, key, value) {
        return client.config('SET', key, value);
    },

    /** Iterates matching keys through non-blocking SCAN operations. */
    scanIterator: async function* (client, options) {
        let cursor = '0';
        let effective = options || {};
        do {
            let result = await client.scan(cursor, 'MATCH', effective.MATCH || '*', 'COUNT', effective.COUNT || 100);
            cursor = result[0];
            for (let key of result[1]) yield key;
        } while (cursor !== '0');
    },

    /** Creates an independently connected subscriber facade. */
    duplicate: function (client) {
        return this.adaptSubscriber(client.duplicate({ lazyConnect: true }));
    },

    /** Adapts subscription callbacks so cache event registration remains provider-neutral. */
    adaptSubscriber: function (client) {
        let handlers = new Map();
        client.on('message', this.dispatchMessage.bind(this, handlers));
        let facade = this.adaptClient(client);
        facade.subscribe = this.subscribe.bind(this, client, handlers);
        return facade;
    },

    /** Dispatches one provider message to the registered Nodics channel handler. */
    dispatchMessage: function (handlers, channel, message) {
        let handler = handlers.get(channel);
        if (handler) handler(message, channel);
    },

    /** Registers one channel handler and subscribes the provider client. */
    subscribe: function (client, handlers, channel, handler) {
        handlers.set(channel, handler);
        return client.subscribe(channel);
    }
};
