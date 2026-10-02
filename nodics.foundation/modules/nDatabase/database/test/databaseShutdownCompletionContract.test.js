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
const configuration = require('../src/service/config/defaultDatabaseConfigurationService');

test('database close waits for native MongoDB completion and deduplicates shared handles', async () => {
    let finish, calls = 0;
    const native = { close: () => { calls++; return new Promise(resolve => { finish = resolve; }); } };
    const database = { getClient: () => native, getOptions: () => ({ connectionHandler: 'Mongo' }) };
    global.CONFIG = { get: () => 'default' };
    global.NODICS = { getActiveTenants: () => ['default'] };
    global.SERVICE = { Mongo: mongodb, DefaultDatabaseConfigurationService: {
        getRetainedDatabaseScopesForCleanup: () => [{ moduleName: 'default', tenant: 'default' }, { moduleName: 'alias', tenant: 'default' }],
        getRetainedTenantDatabaseForCleanup: () => ({ master: database, test: database })
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
        DefaultDatabaseConfigurationService: { getRetainedTenantDatabaseForCleanup: () => ({ master: database('First'), test: database('Second') }) } };
    await assert.rejects(owner.closeConnection('default', 'default'), error => error === failure);
    assert.equal(second, true);
});

test('real retained registry closes rolled-back inactive tenant/module despite invalid effective config', async () => {
    let calls = 0;
    const database = { getClient: () => ({ retained: true }), getOptions: () => ({ connectionHandler: 'HeldProvider' }) };
    configuration.dbs = { removedModule: { rolledBackTenant: { master: database } } };
    global.CONFIG = { get: () => { throw new Error('Config resolution is forbidden during cleanup'); } };
    global.NODICS = { getActiveTenants: () => [], isModuleActive: () => false };
    global.SERVICE = { DefaultDatabaseConfigurationService: configuration,
        HeldProvider: { closeConnection: async value => { assert.equal(value, database); calls++; } } };
    assert.throws(() => configuration.getTenantDatabase('removedModule', 'rolledBackTenant'));
    assert.deepEqual(configuration.getRetainedDatabaseScopesForCleanup(), [{ moduleName: 'removedModule', tenant: 'rolledBackTenant' }]);
    assert.equal(configuration.getRetainedTenantDatabaseForCleanup('absent', 'rolledBackTenant'), undefined, 'No default/module fallback');
    await owner.closeAllConnections();
    assert.equal(calls, 1);
});

test('retained close failure remains retryable and missing-client wrappers are not deduplicated together', async () => {
    let attempts = 0, second = 0;
    const failure = new Error('held close failed');
    configuration.dbs = { held: { inactive: {
        master: { getClient: () => undefined, getOptions: () => ({ connectionHandler: 'RetryProvider' }) },
        test: { getClient: () => undefined, getOptions: () => ({ connectionHandler: 'OtherProvider' }) }
    } } };
    global.SERVICE = { DefaultDatabaseConfigurationService: configuration,
        RetryProvider: { closeConnection: async () => { attempts++; if (attempts === 1) throw failure; } },
        OtherProvider: { closeConnection: async () => { second++; } } };
    await assert.rejects(owner.closeAllConnections(), error => error === failure);
    assert.equal(second, 1);
    assert(configuration.getRetainedTenantDatabaseForCleanup('held', 'inactive'));
    await owner.closeAllConnections();
    assert.equal(attempts, 2);
});

test('missing retained closure provider rejects but does not prevent other acquired closes', async () => {
    let closed = false;
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    configuration.dbs = { held: { inactive: {
        master: { getOptions: () => ({ connectionHandler: 'Absent' }) },
        test: { getOptions: () => ({ connectionHandler: 'Present' }) }
    } } };
    global.SERVICE = { DefaultDatabaseConfigurationService: configuration,
        Present: { closeConnection: async () => { closed = true; } } };
    await assert.rejects(owner.closeAllConnections(), error => error.code === 'ERR_DBS_00000');
    assert.equal(closed, true);
});
