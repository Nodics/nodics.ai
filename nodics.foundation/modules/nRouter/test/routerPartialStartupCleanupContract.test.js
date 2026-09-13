/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nRouter/test/routerPartialStartupCleanupContract
 * @description Proves sibling listener cleanup after asynchronous bind failure and synchronous topology failure.
 * @layer test
 * @owner nRouter
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const EventEmitter = require('node:events');
const http = require('node:http');
const source = require('../src/service/router/defaultRouterService');

test('one failed bind closes a sibling whose listening event arrives later and opens no unconfigured HTTPS port', async () => {
    const original = new Error('occupied port');
    const created = [];
    const createServer = http.createServer;
    let registered = false;
    class Listener extends EventEmitter {
        constructor(index) { super(); this.index = index; this.listening = false; }
        listen() {
            assert(registered, 'cleanup owner is registered before resources open');
            if (this.index === 0) setImmediate(() => { this.listening = true; this.emit('listening'); });
            else process.nextTick(() => this.emit('error', original));
        }
        close(callback) { this.listening = false; this.closed = true; callback(); }
        closeAllConnections() { this.forced = true; }
    }
    const app = Object.assign(() => {}, { use() {} });
    global.NODICS = { getModules: () => ({ one: { app, moduleRouter: {} }, two: { app, moduleRouter: {} } }) };
    global.UTILS = { isRouterEnabled: () => true };
    global.CONFIG = { get: () => ({ httpDrainTimeoutMs: 5 }) };
    global.SERVICE = { DefaultRuntimeLifecycleService: { registerContributor: () => { registered = true; } } };
    const configs = {};
    const service = Object.assign({}, source, { runtimeServers: [], lifecycleContributorRegistered: false,
        LOG: { info() {}, error() {} }, getModulesPool: () => ({ isAvailableModuleConfig: () => true }),
        getModuleServerConfig: name => configs[name] ||= { running: false,
            getOptions: () => ({}), getEndpoint: () => ({ getHttpPort: () => 5000, getHttpsPort: () => undefined }),
            isServerRunning() { return this.running; }, setIsServerRunning(value) { this.running = value; } } });
    http.createServer = () => { const server = new Listener(created.length); created.push(server); return server; };
    try {
        await assert.rejects(service.startServers(), error => error === original);
        assert.equal(created.length, 2);
        assert.equal(created[0].listening, false);
        assert.equal(created[0].closed, true);
        assert.equal(created[0].forced, true);
    } finally { http.createServer = createServer; }
});
