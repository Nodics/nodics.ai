/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/test/databaseShutdownCompletionContract
 * @description Proves shutdown waits for unique acquired handles and attempts remaining closes after one provider failure.
 * @layer test
 * @owner database
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const owner = require('../src/service/connection/defaultDatabaseConnectionHandlerService');
const mongodb = require('../../mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService');

test('database close waits for native MongoDB completion and deduplicates shared handles', async () => {
    let finish, calls = 0;
    const native = { close: () => { calls++; return new Promise(resolve => { finish = resolve; }); } };
    const database = { getClient: () => native, getOptions: () => ({ connectionHandler: 'Mongo' }) };
    global.CONFIG = { get: () => 'default' };
    global.NODICS = { getActiveTenants: () => ['default'] };
    global.SERVICE = { Mongo: mongodb, DefaultDatabaseConfigurationService: {
        getDatabaseActiveModules: () => ['default', 'alias'], getTenantDatabase: () => ({ master: database, test: database })
    } };
    let done = false;
    const closing = owner.closeAllConnections().then(() => { done = true; });
    while (!finish) await Promise.resolve();
    assert.equal(calls, 1);
    assert.equal(done, false);
    finish(); await closing;
    assert.equal(done, true);
});

test('all acquired handles are attempted and the first close error is preserved', async () => {
    const failure = new Error('first close failed');
    let second = false;
    const database = handler => ({ getOptions: () => ({ connectionHandler: handler }) });
    global.SERVICE = { First: { closeConnection: async () => { throw failure; } },
        Second: { closeConnection: async () => { second = true; } },
        DefaultDatabaseConfigurationService: { getTenantDatabase: () => ({ master: database('First'), test: database('Second') }) } };
    await assert.rejects(owner.closeConnection('default', 'default'), error => error === failure);
    assert.equal(second, true);
});
