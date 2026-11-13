/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module database/test/databaseSharedRegistrationContract @description Exercises real configuration, registration, generated model wrapper and transaction ownership without connections. @layer test @owner nDatabase */
const test = require('node:test');
const assert = require('node:assert/strict');
const _ = require('lodash');
const configuration = require('../src/service/config/defaultDatabaseConfigurationService');
const connections = require('../src/service/connection/defaultDatabaseConnectionHandlerService');
const transactions = require('../src/service/transaction/defaultDatabaseTransactionService');
const modelOwner = require('../../mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService');
const creditOwner = require('../../../../../nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltySampleCreditContributionService');
const Database = require('../src/lib/database');
const schemaNames = ['loyaltyWallet', 'loyaltyWalletRewardBalance', 'rewardLedgerEntry'];
const modules = ['default', 'loyaltyWallet', 'loyaltyLedger'];
let configs, opened, closed, testEnabled;
const logger = { info() {}, debug() {}, error() {} };
connections.LOG = logger;
test.beforeEach(() => {
    opened = []; closed = []; testEnabled = false;
    configs = {};
    for (const tenant of ['default', 'alpha', 'beta']) configs[tenant] = {
        default: { options: { databaseType: 'mongodb' }, mongodb: {
            options: { connectionHandler: 'QualifiedAdapter' },
            master: { URI: 'mongodb://source-only.invalid', databaseName: tenant + 'Master', options: {} },
            test: { URI: 'mongodb://source-only.invalid', databaseName: tenant + 'Test', options: {} }
        } }, loyaltyWallet: {}, loyaltyLedger: {}
    };
    configuration.dbs = {};
    global.CLASSES = { Database, NodicsError: class extends Error {
        constructor(code, message) { super(message || code?.message); this.code = typeof code === 'string' ? code : code?.code; }
    } };
    global.UTILS = { isBlank: value => value == null };
    global.NODICS = { getModules: () => Object.fromEntries(modules.map(name => [name, {}])),
        isModuleActive: name => modules.includes(name), getModule: name => modules.includes(name) ? {} : undefined,
        getActiveTenants: () => ['default', 'alpha', 'beta'] };
    global.CONFIG = { get: (key, tenant) => ({ database: configs[tenant || 'default'], defaultTenant: 'default',
        test: { enabled: testEnabled, uTest: { enabled: testEnabled } },
        loyalty: { transactions: { enabled: true } },
        databaseTransactions: { enabled: true, failClosed: true, maximumCommitTimeMs: 1000 } })[key] };
    global.SERVICE = { DefaultDatabaseConfigurationService: configuration, QualifiedAdapter: {
        validateTenantDatabaseName: () => true,
        createConnection: async config => {
            const client = {};
            opened.push({ client, config: _.cloneDeep(config) });
            return { client, capabilities: { transactions: true }, collections: schemaNames.map(name => ({ name })),
                connection: { databaseName: config.databaseName, collection: () => ({}) } };
        },
        closeConnection: async database => { closed.push(database.getClient()); },
        transactionCapabilities: () => ({ multiRecordAtomic: true }),
        executeTransaction: async (database, options, work) => work({ client: database.getClient() }),
        transactionOperationOptions: context => ({ sessionClient: context.client })
    } };
});
test.afterEach(() => { for (const name of ['CONFIG', 'NODICS', 'UTILS', 'CLASSES', 'SERVICE']) delete global[name]; });
const held = (moduleName, tenant = 'default') => configuration.getTenantDatabase(moduleName, tenant);
async function models(channel = 'master') {
    const owner = { ...modelOwner, LOG: logger, createIndexes: async () => true, updateValidator: async () => true };
    return Promise.all(schemaNames.map(schemaName => {
        const moduleName = schemaName === 'rewardLedgerEntry' ? 'loyaltyLedger' : 'loyaltyWallet';
        const schema = { transaction: { enabled: true, sideEffects: 'none' }, cache: { enabled: false }, event: { enabled: false },
            schemaOptions: { default: { primaryKeys: ['code'] } } };
        return owner.retrieveModel({ moduleName, schemaName, modelName: schemaName, tntCode: 'default', channel,
            moduleObject: { rawSchema: { [schemaName]: schema } } }, held(moduleName)[channel]);
    }));
}
test('inherited module configuration shares the real default wrapper/client and generated transaction scope', async () => {
    await connections.createDatabaseConnection('default');
    assert.equal(opened.length, 1);
    assert.equal(held('loyaltyWallet').master, held('default').master);
    assert.equal(held('loyaltyLedger').master, held('loyaltyWallet').master);
    const prepared = await models();
    let expired;
    await transactions.execute({ moduleName: 'loyaltyWallet', tenant: 'default' }, async token => {
        expired = token;
        for (const model of prepared) assert.equal(transactions.operationOptions(token, model.dataBase, model).sessionClient,
            held('loyaltyWallet').master.getClient());
        assert.throws(() => transactions.operationOptions(token, {}, prepared[0]), /another database/);
    });
    assert.throws(() => transactions.operationOptions(expired, prepared[0].dataBase, prepared[0]), /expired/);
    await connections.closeAllConnections();
    assert.equal(closed.length, 1);
});
test('different effective database, endpoint, credentials, client options or provider options stay isolated', async () => {
    for (const override of [
        { master: { databaseName: 'separateLedger' } }, { master: { URI: 'mongodb://other.invalid' } },
        { master: { options: { auth: { username: 'private', password: 'not-output' } } } },
        { master: { options: { readPreference: 'secondary' } } }, { options: { modelHandler: 'OtherModelOwner' } }
    ]) {
        configuration.dbs = {}; opened = [];
        configs.default.loyaltyLedger = { mongodb: override };
        await connections.createDatabaseConnection('default');
        assert.equal(opened.length, 2);
        assert.notEqual(held('loyaltyWallet').master, held('loyaltyLedger').master);
        const prepared = await models();
        await transactions.execute({ moduleName: 'loyaltyWallet', tenant: 'default' }, async token => {
            assert.throws(() => transactions.operationOptions(token, prepared[2].dataBase, prepared[2]), /another database/);
        });
    }
});
test('tenant and master/test channels retain distinct wrapper/client identities and cleanup closes once', async () => {
    testEnabled = true;
    for (const tenant of ['default', 'alpha', 'beta']) await connections.createDatabaseConnection(tenant);
    assert.equal(opened.length, 6);
    for (const tenant of ['default', 'alpha', 'beta']) {
        assert.equal(held('loyaltyWallet', tenant).master, held('loyaltyLedger', tenant).master);
        assert.equal(held('loyaltyWallet', tenant).test, held('loyaltyLedger', tenant).test);
        assert.notEqual(held('loyaltyWallet', tenant).master, held('loyaltyWallet', tenant).test);
    }
    assert.notEqual(held('loyaltyWallet', 'alpha').master, held('loyaltyWallet', 'beta').master);
    const prepared = await models('test');
    await transactions.execute({ moduleName: 'loyaltyWallet', tenant: 'default', test: true }, async token => {
        assert.equal(transactions.operationOptions(token, prepared[2].dataBase, prepared[2]).sessionClient,
            held('loyaltyLedger').test.getClient());
        assert.throws(() => transactions.operationOptions(token, held('loyaltyWallet').master, prepared[0]), /another database/);
    });
    await connections.closeAllConnections();
    assert.equal(closed.length, 6);
    assert.equal(new Set(closed).size, 6);
});
test('changed test channel configuration prevents reusing either old registration', async () => {
    testEnabled = true;
    configs.default.loyaltyLedger = { mongodb: { test: { databaseName: 'differentLedgerTest' } } };
    await connections.createDatabaseConnection('default');
    assert.notEqual(held('loyaltyLedger').master, held('loyaltyWallet').master);
    assert.notEqual(held('loyaltyLedger').test, held('loyaltyWallet').test);
});
test('changed default configuration cannot alias a previously opened handle', async () => {
    await connections.createDatabase('default', 'default');
    configs.default.default.mongodb.master.options.auth = { username: 'changed', password: 'not-output' };
    await assert.rejects(connections.createDatabase('loyaltyWallet', 'default'), error => error.code === 'ERR_DBS_00003');
    assert.equal(opened.length, 1);
    assert.throws(() => held('default'), /stale/);
});
test('later connection owner customization is still selected and schema transaction exclusions remain enforced', async () => {
    let calls = 0;
    const customized = { ...connections, createDatabase(...args) { calls++; return connections.createDatabase.apply(this, args); } };
    await customized.createDatabaseConnection('default');
    assert.equal(calls, 3);
    assert.equal(opened.length, 1);
    const prepared = await models();
    prepared[2].rawSchema.transaction.enabled = false;
    await transactions.execute({ moduleName: 'loyaltyWallet', tenant: 'default' }, async token => {
        assert.throws(() => transactions.operationOptions(token, prepared[2].dataBase, prepared[2]), /not enabled/);
    });
});
test('credit persistence shares an explicit Loyalty database and refuses a separate ledger before reads', async () => {
    SERVICE.DefaultLoyaltyRewardOperationService = { fail(code, message) { const error = Error(message); error.code = code; throw error; } };
    SERVICE.DefaultLoyaltyTransactionService = { run() { throw Error('transaction execution forbidden'); },
        qualify: () => ({ scope: { moduleName: 'loyaltyWallet', tenant: 'default' }, owner: transactions }) };
    SERVICE.DefaultDatabaseModelHandlerService = { inspectIndexes: async () => ({ versioned: false,
        indexes: [{ unique: true, key: { code: 1 } }] }) };
    for (const isolated of [false, true]) {
        configuration.dbs = {};
        configs.default.loyaltyWallet = { mongodb: { master: { databaseName: 'loyalty' } } };
        configs.default.loyaltyLedger = { mongodb: { master: { databaseName: isolated ? 'isolatedLedger' : 'loyalty' } } };
        await connections.createDatabaseConnection('default');
        assert.notEqual(held('loyaltyWallet').master, held('default').master);
        assert.equal(held('loyaltyWallet').master === held('loyaltyLedger').master, !isolated);
        const prepared = await models();
        prepared[1].compareAndSetItem = () => { throw Error('record mutation forbidden'); };
        NODICS.getModels = moduleName => Object.fromEntries(prepared.filter(model => model.moduleName === moduleName)
            .map(model => [model.schemaName, model]));
        UTILS.createModelName = name => name;
        if (isolated) await assert.rejects(creditOwner.persistence({ tenant: 'default' }), error =>
            error.code === 'ERR_LOYALTY_SAMPLE_CREDIT_UNAVAILABLE' && error.sampleCreditGate === 'SCHEMA_DATABASE' &&
            error.sampleCreditSchema === 'loyaltyLedger.rewardLedgerEntry');
        else await creditOwner.persistence({ tenant: 'default' });
    }
});

test('missing module registration shares only fully equal effective configuration in the same tenant', async () => {
    NODICS.getActiveTenants = () => ['default'];
    await connections.createDatabase('default', 'default');
    // An unrelated tenant slot must not suppress legitimate same-tenant inheritance.
    configuration.dbs.loyaltyWallet = { alpha: {} };
    assert.equal(held('loyaltyWallet'), held('default'));
    assert.equal(configuration.areRequiredConnectionsReady(), true);
    for (const override of [
        { master: { databaseName: 'separate' } }, { master: { URI: 'mongodb://other.invalid' } },
        { master: { options: { auth: { username: 'different' } } } },
        { test: { databaseName: 'separateTest' } }, { options: { modelHandler: 'Other' } }
    ]) {
        configs.default.loyaltyWallet = { mongodb: override };
        assert.equal(held('loyaltyWallet'), undefined);
        assert.equal(configuration.areRequiredConnectionsReady(), false);
        assert.equal(opened.length, 1, 'read admission never opens connections');
    }
    configs.default.loyaltyWallet = {};
    assert.equal(held('loyaltyWallet'), held('default'));
});

test('malformed explicit module destinations reject instead of inheriting a default handle', async () => {
    NODICS.getActiveTenants = () => ['default'];
    await connections.createDatabase('default', 'default');
    for (const override of [undefined, null, false, '', [], 42,
        { mongodb: { master: { URI: undefined } } }, { mongodb: { test: undefined } },
        { options: { databaseType: undefined } },
        { options: null }, { options: { databaseType: 'missing' } },
        { mongodb: null }, { mongodb: { master: null } },
        { mongodb: { master: { URI: '' } } }, { mongodb: { master: { databaseName: 42 } } },
        { mongodb: { test: null } }, { mongodb: { options: { connectionHandler: false } } }
    ]) {
        configs.default.loyaltyWallet = override;
        assert.throws(() => held('loyaltyWallet'), error => error.code === 'ERR_DBS_00003');
        assert.equal(configuration.areRequiredConnectionsReady(), false);
    }
    assert.equal(opened.length, 1);
});

test('exact and fallback handles fail closed on destination, credentials and test-selection drift', async () => {
    NODICS.getActiveTenants = () => ['default'];
    await connections.createDatabaseConnection('default');
    const retained = held('default');
    for (const mutate of [
        () => { configs.default.default.mongodb.master.URI = 'mongodb://changed.invalid'; },
        () => { configs.default.default.mongodb.master.databaseName = 'changed'; },
        () => { configs.default.default.mongodb.master.options.auth = { password: 'changed' }; },
        () => { testEnabled = true; }
    ]) {
        const original = _.cloneDeep(configs);
        mutate();
        assert.throws(() => held('default'), /stale/);
        assert.throws(() => held('loyaltyWallet'), /stale/);
        assert.equal(configuration.areRequiredConnectionsReady(), false);
        await assert.rejects(connections.createDatabase('default', 'default'));
        assert.equal(opened.length, 1, 'no automatic replacement or relocation');
        assert.equal(configuration.getRetainedTenantDatabaseForCleanup('default', 'default'), retained);
        configs = original; testEnabled = false;
    }
    delete configuration.dbs.loyaltyWallet.default;
    configs.default.default.mongodb.master.databaseName = 'changed';
    assert.throws(() => held('loyaltyWallet'), /stale/);
    await connections.closeAllConnections();
    assert.equal(closed.length, 1);
});

test('an acquisition racing configuration drift cannot become current registration', async () => {
    const create = SERVICE.QualifiedAdapter.createConnection;
    SERVICE.QualifiedAdapter.createConnection = async config => {
        const result = await create(config);
        configs.default.default.mongodb.master.databaseName = 'changedDuringOpen';
        return result;
    };
    await assert.rejects(connections.createDatabase('default', 'default'), /configuration changed/);
    assert.ok(configuration.getRetainedTenantDatabaseForCleanup('default', 'default'));
    assert.throws(() => held('default'), /stale/);
    await connections.closeAllConnections();
    assert.equal(closed.length, 1);
});

test('repeated creation reuses an admitted exact registration without opening a replacement', async () => {
    await connections.createDatabase('default', 'default');
    const original = held('default');
    await connections.createDatabase('default', 'default');
    assert.equal(held('default'), original);
    assert.equal(opened.length, 1);
});

test('a losing acquisition closes only its new master/test clients and preserves the stale winner', async () => {
    testEnabled = true;
    const create = SERVICE.QualifiedAdapter.createConnection;
    let release, entered;
    const waiting = new Promise(resolve => { entered = resolve; });
    let first = true;
    SERVICE.QualifiedAdapter.createConnection = async config => {
        const result = await create(config);
        if (first) {
            first = false;
            entered();
            await new Promise(resolve => { release = resolve; });
        }
        return result;
    };
    const losing = connections.createDatabase('default', 'default');
    await waiting;
    await connections.createDatabase('default', 'default');
    const winner = held('default');
    configs.default.default.mongodb.master.options.auth = { password: 'rotated' };
    release();
    await assert.rejects(losing, /cannot be replaced/);
    assert.equal(opened.length, 4);
    assert.equal(closed.length, 2);
    assert.ok(!closed.includes(winner.master.getClient()));
    assert.ok(!closed.includes(winner.test.getClient()));
    assert.equal(configuration.getRetainedTenantDatabaseForCleanup('default', 'default'), winner);
    assert.throws(() => held('default'), /stale/);
    await connections.closeAllConnections();
    assert.equal(new Set(closed).size, 4);
});

test('failed rejected-acquisition close is surfaced and retried at shutdown', async () => {
    const create = SERVICE.QualifiedAdapter.createConnection;
    const close = SERVICE.QualifiedAdapter.closeConnection;
    let injected = false, fail = true;
    SERVICE.QualifiedAdapter.createConnection = async config => {
        const result = await create(config);
        if (!injected) {
            injected = true;
            await connections.createDatabase('default', 'default');
        }
        return result;
    };
    SERVICE.QualifiedAdapter.closeConnection = async database => {
        if (fail && database.getClient() === opened[0].client) throw Error('close refused');
        return close(database);
    };
    await assert.rejects(connections.createDatabase('default', 'default'), error =>
        error instanceof AggregateError && error.errors[1].message === 'close refused');
    assert.equal(opened.length, 2);
    assert.equal(held('default').master.getClient(), opened[1].client);
    fail = false;
    await connections.closeAllConnections();
    assert.equal(new Set(closed).size, 2);
});

test('fallback and readiness respect refreshed layered getDatabaseConfiguration overrides', async () => {
    NODICS.getActiveTenants = () => ['default'];
    let refreshedName = 'layeredDefault', moduleNameOverride;
    const selected = { ...configuration, dbs: {}, getDatabaseConfiguration(moduleName, tenant) {
        const value = configuration.getDatabaseConfiguration.call(this, moduleName, tenant);
        value.master.databaseName = moduleName === 'loyaltyWallet' && moduleNameOverride || refreshedName;
        return value;
    } };
    SERVICE.DefaultDatabaseConfigurationService = selected;
    await connections.createDatabase('default', 'default');
    const original = selected.getTenantDatabase('default', 'default');
    assert.equal(selected.getTenantDatabase('loyaltyWallet', 'default'), original);
    assert.equal(selected.areRequiredConnectionsReady(), true);
    moduleNameOverride = 'separateModule';
    assert.equal(selected.getTenantDatabase('loyaltyWallet', 'default'), undefined);
    assert.equal(selected.areRequiredConnectionsReady(), false);
    moduleNameOverride = undefined;
    refreshedName = 'refreshedDefault';
    assert.throws(() => selected.getTenantDatabase('loyaltyWallet', 'default'), /stale/);
    assert.equal(selected.areRequiredConnectionsReady(), false);
    assert.equal(opened.length, 1);
});

test('real CONFIG refresh preserves module override precedence without caching old destinations', async () => {
    NODICS.getActiveTenants = () => ['default'];
    const Config = require('../../../nConfig/bin/config');
    global.CONFIG = new Config();
    CONFIG.setProperties({ defaultTenant: 'default', database: configs.default });
    CONFIG.changeTenantProperties({ database: { loyaltyWallet: { mongodb: {
        master: { databaseName: 'moduleOverride' }
    } } } }, 'default');
    await connections.createDatabaseConnection('default');
    CONFIG.changeTenantProperties({ database: { default: { mongodb: {
        master: { databaseName: 'refreshedDefault' }
    } } } }, 'default');
    assert.equal(configuration.getDatabaseConfiguration('loyaltyWallet', 'default').master.databaseName, 'moduleOverride');
    assert.equal(configuration.getDatabaseConfiguration('default', 'default').master.databaseName, 'refreshedDefault');
    assert.ok(held('loyaltyWallet'));
    assert.throws(() => held('default'), /stale/);
    CONFIG.changeTenantProperties({ database: { loyaltyWallet: { mongodb: {
        master: { databaseName: 'refreshedModule' }
    } } } }, 'default');
    assert.throws(() => held('loyaltyWallet'), /stale/);
});
