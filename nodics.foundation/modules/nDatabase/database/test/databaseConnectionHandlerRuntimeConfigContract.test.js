/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/test/databaseConnectionHandlerRuntimeConfigContract
 * @description Verifies runtime database connection setup does not require unit-test configuration.
 * @layer test
 * @owner nDatabase
 */
'use strict';

const assert = require('assert');

class Database {
    setName(value) { this.name = value; }
    setURI(value) { this.URI = value; }
    setOptions(value) { this.options = value; }
    setConnectionOptions(value) { this.connectionOptions = value; }
    setConnection(value) { this.connection = value; }
    setCollections(value) { this.collections = value; }
    setClient(value) { this.client = value; }
    setCapabilities(value) { this.capabilities = value; }
}

global.UTILS = { isBlank: value => value === undefined || value === null };
global.CLASSES = { Database, NodicsError: class NodicsError extends Error {} };
global.CONFIG = { get: key => key === 'test' ? undefined : undefined };

let registered;
global.SERVICE = {
    DefaultDatabaseConfigurationService: {
        getDatabaseConfiguration: () => ({
            master: { URI: 'mongodb://localhost:27017/kickoffLocalPlatform', options: {} },
            options: { connectionHandler: 'MockConnectionHandler' }
        }),
        addTenantDatabase: (moduleName, tenant, value) => { registered = { moduleName, tenant, value }; }
    },
    MockConnectionHandler: {
        createConnection: () => Promise.resolve({
            connection: { readyState: 1 },
            collections: {},
            client: {},
            capabilities: { transactions: false }
        })
    }
};

const service = require('../src/service/connection/defaultDatabaseConnectionHandlerService.js');
service.LOG = { info: () => {}, error: () => {} };

service.createDatabase('default', 'default').then(() => {
    assert(registered, 'Runtime database connection should be registered');
    assert.strictEqual(registered.moduleName, 'default');
    assert.strictEqual(registered.tenant, 'default');
    assert(registered.value.master instanceof Database, 'Master database handle should be registered');
    assert.strictEqual(registered.value.test, null, 'Test database handle should remain disabled when CONFIG.test is absent');
    console.log('Database connection handler runtime config contract validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
