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

test('co-located module endpoint aliases share the consolidated default listener', async () => {
    const created = [];
    const createServer = http.createServer;
    let registered = false;
    class Listener extends EventEmitter {
        constructor() { super(); this.listening = false; }
        listen() { setImmediate(() => { this.listening = true; this.emit('listening'); }); }
        close(callback) { this.listening = false; callback(); }
    }
    const defaultApp = Object.assign(() => {}, { uses: [], use(path, router) { this.uses.push({ path, router }); } });
    const moduleApp = Object.assign(() => {}, { uses: [], use(path, router) { this.uses.push({ path, router }); } });
    global.NODICS = { getModules: () => ({
        default: { app: defaultApp, moduleRouter: { code: 'default' } },
        profile: { app: moduleApp, moduleRouter: { code: 'profile' } },
        backoffice: { app: moduleApp, moduleRouter: { code: 'backoffice' } }
    }) };
    global.UTILS = { isRouterEnabled: () => true };
    global.CONFIG = { get: () => ({ httpDrainTimeoutMs: 5 }) };
    global.SERVICE = { DefaultRuntimeLifecycleService: { registerContributor: () => { registered = true; } } };
    const endpoint = { getHttpPort: () => 4300, getHttpsPort: () => undefined };
    const configs = {};
    const descriptor = name => configs[name] ||= { running: false,
        getOptions: () => ({}), getEndpoint: () => endpoint,
        isServerRunning() { return this.running; }, setIsServerRunning(value) { this.running = value; } };
    const service = Object.assign({}, source, { runtimeServers: [], lifecycleContributorRegistered: false,
        LOG: { info() {}, error() {} }, getModulesPool: () => ({ isAvailableModuleConfig: () => true }),
        getModuleServerConfig: descriptor });
    http.createServer = () => { const server = new Listener(); created.push(server); return server; };
    try {
        await service.startServers();
        assert.equal(registered, true);
        assert.equal(created.length, 1);
        assert.deepEqual(defaultApp.uses.map(item => item.router.code), ['default', 'profile', 'backoffice']);
        assert.equal(moduleApp.uses.length, 0);
    } finally {
        await service.closeRuntimeServers(true);
        http.createServer = createServer;
    }
});
