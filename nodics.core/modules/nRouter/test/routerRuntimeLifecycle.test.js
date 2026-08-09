/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const EventEmitter = require('events');

/**
 * @module nRouter/test/routerRuntimeLifecycle
 * @description Validates listener readiness ownership and lifecycle draining
 * without opening real network ports.
 * @layer test
 * @owner nRouter
 */

let registeredContributor;
global.CONFIG = {
    get: function (name) {
        if (name === 'runtimeLifecycle') return { httpDrainTimeoutMs: 5 };
        return undefined;
    }
};
global.SERVICE = {
    DefaultRuntimeLifecycleService: {
        registerContributor: function (name, contributor) {
            registeredContributor = { name, contributor };
        }
    }
};

const routerService = require('../src/service/router/defaultRouterService');
routerService.LOG = { info: function () {}, error: function () {} };
routerService.runtimeServers = [];
routerService.lifecycleContributorRegistered = false;

class FakeServer extends EventEmitter {
    constructor() {
        super();
        this.listening = false;
        this.idleClosed = false;
        this.allClosed = false;
    }

    listen() {
        this.listening = true;
        process.nextTick(() => this.emit('listening'));
    }

    close(callback) {
        this.listening = false;
        process.nextTick(() => callback());
    }

    closeIdleConnections() {
        this.idleClosed = true;
    }

    closeAllConnections() {
        this.allClosed = true;
    }
}

class HangingCloseServer extends FakeServer {
    close() {
        this.listening = false;
    }
}

(async function () {
    let moduleConfig = {
        running: false,
        setIsServerRunning: function (running) { this.running = running; }
    };
    let server = new FakeServer();
    await routerService.startListener('default', 3000, false, server, moduleConfig);
    assert.strictEqual(server.listening, true, 'listener promise must resolve after listening');
    assert.strictEqual(routerService.runtimeServers.length, 1, 'listener handle must be retained');

    assert.strictEqual(routerService.registerLifecycleContributor(), true);
    assert.strictEqual(routerService.registerLifecycleContributor(), false, 'router lifecycle contributor must be unique');
    assert.strictEqual(registeredContributor.name, 'httpListeners');

    await registeredContributor.contributor.drain();
    assert.strictEqual(server.listening, false, 'drain must stop accepting traffic');
    assert.strictEqual(server.idleClosed, true, 'drain must close idle keep-alive connections');
    await registeredContributor.contributor.shutdown();
    assert.strictEqual(server.allClosed, true, 'shutdown must force-close remaining connections');

    let hangingServer = new HangingCloseServer();
    await routerService.startListener('default', 3001, false, hangingServer, moduleConfig);
    await routerService.closeRuntimeServers(false);
    assert.strictEqual(hangingServer.listening, false, 'bounded drain must stop accepting traffic even when close callback does not return');
    assert.strictEqual(hangingServer.allClosed, true, 'bounded drain must force-close connections before lifecycle timeout');

    console.log('Router runtime lifecycle contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
