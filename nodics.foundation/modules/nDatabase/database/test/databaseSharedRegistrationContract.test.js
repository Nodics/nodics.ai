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
    await connections.createDatabase('loyaltyWallet', 'default');
    assert.equal(opened.length, 2);
    assert.notEqual(held('default').master, held('loyaltyWallet').master);
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
test('credit persistence qualifies registered wallet/balance/ledger and still refuses a separate ledger wrapper before reads', async () => {
    SERVICE.DefaultLoyaltyRewardOperationService = { fail(code, message) { const error = Error(message); error.code = code; throw error; } };
    SERVICE.DefaultLoyaltyTransactionService = { run() { throw Error('transaction execution forbidden'); },
        qualify: () => ({ scope: { moduleName: 'loyaltyWallet', tenant: 'default' }, owner: transactions }) };
    SERVICE.DefaultDatabaseModelHandlerService = { inspectIndexes: async () => ({ versioned: false,
        indexes: [{ unique: true, key: { code: 1 } }] }) };
    for (const isolated of [false, true]) {
        configuration.dbs = {};
        configs.default.loyaltyLedger = isolated ? { mongodb: { master: { databaseName: 'isolatedLedger' } } } : {};
        await connections.createDatabaseConnection('default');
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
