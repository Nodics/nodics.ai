/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/test/TenantPhysicalNamespaceContract
 * @description Source-only namespace resolution and pre-provider admission regressions; no network or provider writes.
 * @layer test
 * @owner nDatabase
 * @override Later-layer providers must implement the same pure namespace methods.
 */
'use strict';
const assert = require('node:assert/strict');
const _ = require('lodash');
const owner = require('../src/service/config/defaultDatabaseConfigurationService');
const provider = require('../../mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService');
const connections = require('../src/service/connection/defaultDatabaseConnectionHandlerService');
global.CLASSES = { NodicsError: class extends Error {
    constructor(code, message) { super(message || code?.message); this.code = typeof code === 'string' ? code : code?.code; }
} };
let tenants;
let configs;
global.NODICS = {
    getActiveTenants: () => tenants.slice(), getModules: () => ({ default: {}, profile: {} }),
    getModule: () => ({}), isModuleActive: () => true,
    getEnvironmentName: () => 'kickoff', getSelectedEnvironmentName: () => 'Local', getServerName: () => 'platformServer'
};
global.CONFIG = { get: (key, tenant) => key === 'database' ? configs[tenant || 'default'] : key === 'defaultTenant' ? 'default' : undefined };
global.SERVICE = { DefaultDatabaseConfigurationService: owner, DefaultMongodbDatabaseConnectionHandlerService: provider };
function setup(base = 'runtimePlatform') {
    tenants = ['default', 'alpha', 'beta'];
    const database = { default: {
        options: { databaseType: 'mongodb' }, mongodb: {
            options: { connectionHandler: 'DefaultMongodbDatabaseConnectionHandlerService' },
            master: { URI: 'mongodb://127.0.0.1:27017', databaseName: base },
            test: { URI: 'mongodb://127.0.0.1:27017', databaseName: base + 'Test' }
        }
    }, profile: {} };
    configs = { default: _.cloneDeep(database) };
    for (const tenant of ['alpha', 'beta']) configs[tenant] = _.merge({}, database, owner.createTenantNamespaceIntent(tenant).database);
    owner.dbs = {};
    pin();
}
function pin() {
    for (const tenant of ['alpha', 'beta']) {
        if (!configs[tenant].tenantNamespace) continue;
        const candidate = owner.buildTenantNamespaceBinding(tenant);
        configs[tenant].tenantNamespaceBindings = { [candidate.scopeKey]: candidate.binding };
    }
}
let passed = 0;
function check(name, fn) { setup(); fn(); passed++; console.log('PASS ' + name); }
check('default unchanged; two tenants isolated with independent channels', () => {
    assert.equal(owner.getDatabaseConfiguration('default', 'default').master.databaseName, 'runtimePlatform');
    const a = owner.getDatabaseConfiguration('profile', 'alpha');
    const b = owner.getDatabaseConfiguration('profile', 'beta');
    assert.notEqual(a.master.databaseName, b.master.databaseName);
    assert.notEqual(a.master.databaseName, a.test.databaseName);
    assert.equal(a.master.databaseName, owner.getDatabaseConfiguration('default', 'alpha').master.databaseName);
    assert.equal(configs.alpha.default.mongodb.master.databaseName, 'runtimePlatform');
});
check('each runtime/module base participates in stable derivation', () => {
    const first = owner.getDatabaseConfiguration('profile', 'alpha').master.databaseName;
    setup('runtimeWaste');
    assert.notEqual(owner.getDatabaseConfiguration('profile', 'alpha').master.databaseName, first);
    configs.default.profile = { mongodb: { master: { databaseName: 'moduleBase' } } };
    for (const tenant of ['alpha', 'beta']) configs[tenant].profile = _.cloneDeep(configs.default.profile);
    pin();
    assert.notEqual(owner.getDatabaseConfiguration('profile', 'alpha').master.databaseName,
        owner.getDatabaseConfiguration('default', 'alpha').master.databaseName);
});
check('explicit isolated legacy override remains unchanged without opt-in', () => {
    delete configs.alpha.tenantNamespace;
    configs.alpha.default.mongodb.master.databaseName = 'existingAlpha';
    configs.alpha.default.mongodb.test.databaseName = 'existingAlphaTest';
    assert.equal(owner.getDatabaseConfiguration('profile', 'alpha').master.databaseName, 'existingAlpha');
});
check('explicit override under intent remains authoritative if isolated', () => {
    configs.alpha.profile = { mongodb: { master: { databaseName: 'explicitAlpha' } } };
    pin();
    assert.equal(owner.getDatabaseConfiguration('profile', 'alpha').master.databaseName, 'explicitAlpha');
});
check('unqualified inherited alias rejects and does not silently relocate', () => {
    delete configs.alpha.tenantNamespace;
    assert.throws(() => owner.getDatabaseConfiguration('profile', 'alpha'), /aliases/);
    assert.equal(configs.alpha.default.mongodb.master.databaseName, 'runtimePlatform');
});
check('cross-module/tenant alias and case-only alias reject regardless of URI', () => {
    const betaName = owner.getDatabaseConfiguration('profile', 'beta').master.databaseName;
    configs.alpha.profile = { mongodb: { master: { databaseName: betaName.toUpperCase(), URI: 'mongodb://other.invalid:27017' } } };
    assert.throws(() => owner.getDatabaseConfiguration('profile', 'alpha'), /aliases/);
});
check('normalization collisions, unicode and maximum names retain exact digest identity', () => {
    const a = provider.deriveTenantDatabaseName('a'.repeat(63), 'a/b');
    const b = provider.deriveTenantDatabaseName('a'.repeat(63), 'a_b');
    assert.notEqual(a, b);
    assert.notEqual(provider.deriveTenantDatabaseName('base', 'Ab'), provider.deriveTenantDatabaseName('base', 'ab'));
    assert(Buffer.byteLength(a) <= 63);
    assert.equal(provider.validateTenantDatabaseName(provider.deriveTenantDatabaseName('base', '租户')), true);
    for (const name of ['x'.repeat(64), 'bad.name', 'bad/name', 'bad name', 'admin', '']) assert.throws(() => provider.validateTenantDatabaseName(name));
});
check('malformed/mismatched intent and unqualified provider reject', () => {
    configs.alpha.tenantNamespace.tenantCode = 'beta';
    assert.throws(() => owner.getDatabaseConfiguration('profile', 'alpha'), /intent/);
    setup();
    configs.alpha.default.mongodb.options.connectionHandler = 'MissingProvider';
    assert.throws(() => owner.getDatabaseConfiguration('profile', 'alpha'), /Provider/);
    for (const tenant of ['', 'default', ' x', 'x\u0000', 'x'.repeat(257)]) assert.throws(() => owner.createTenantNamespaceIntent(tenant));
});
check('existing handle refuses changed physical name; model handle read rechecks admission', () => {
    const name = owner.getDatabaseConfiguration('profile', 'alpha').master.databaseName;
    owner.dbs.profile = { alpha: { master: { getConnection: () => ({ databaseName: name }) } } };
    configs.alpha.profile = { mongodb: { master: { databaseName: 'newLocation' } } };
    assert.throws(() => owner.getTenantDatabase('profile', 'alpha'), /relocated/);
});
check('later-layer selected provider and module options remain effective', () => {
    let calls = 0;
    SERVICE.CustomNamespaceProvider = {
        validateTenantDatabaseName: name => provider.validateTenantDatabaseName(name),
        deriveTenantDatabaseName: (base, tenant) => { calls++; return provider.deriveTenantDatabaseName(base, tenant); },
        getTenantEndpointFingerprint: config => provider.getTenantEndpointFingerprint(config)
    };
    configs.alpha.default.mongodb.options.connectionHandler = 'CustomNamespaceProvider';
    configs.alpha.profile = { mongodb: { options: { maxPoolSize: 7 } } };
    pin();
    const resolved = owner.getDatabaseConfiguration('profile', 'alpha');
    assert.equal(resolved.options.connectionHandler, 'CustomNamespaceProvider');
    assert.equal(resolved.options.maxPoolSize, 7);
    assert(calls >= 2);
    delete SERVICE.CustomNamespaceProvider;
});
check('qualified explicit differing provider is retained, without automatic derivation requirement', () => {
    SERVICE.ExplicitOnlyProvider = {
        validateTenantDatabaseName: name => provider.validateTenantDatabaseName(name),
        getTenantEndpointFingerprint: config => provider.getTenantEndpointFingerprint({ ...config, URI: 'mongodb://custom.invalid:27017' })
    };
    delete configs.alpha.tenantNamespace;
    configs.alpha.default = {
        options: { databaseType: 'explicitAdapter' },
        explicitAdapter: {
            options: { connectionHandler: 'ExplicitOnlyProvider' },
            master: { URI: 'adapter://local.invalid', databaseName: 'explicitOtherProvider' }
        }
    };
    const resolved = owner.getDatabaseConfiguration('profile', 'alpha');
    assert.equal(resolved.master.databaseName, 'explicitOtherProvider');
    assert.equal(resolved.options.connectionHandler, 'ExplicitOnlyProvider');
    configs.alpha.tenantNamespace = owner.createTenantNamespaceIntent('alpha').database.tenantNamespace;
    pin();
    assert.equal(owner.getDatabaseConfiguration('profile', 'alpha').master.databaseName, 'explicitOtherProvider');
    configs.alpha.default.explicitAdapter.master.databaseName = 'runtimePlatform';
    assert.throws(() => owner.getDatabaseConfiguration('profile', 'alpha'), /automatic tenant derivation/);
    delete SERVICE.ExplicitOnlyProvider;
});
check('explicit differing provider aliases and non-positive validation reject', () => {
    SERVICE.ExplicitOnlyProvider = { validateTenantDatabaseName: name => provider.validateTenantDatabaseName(name) };
    delete configs.alpha.tenantNamespace;
    configs.alpha.default = {
        options: { databaseType: 'explicitAdapter' }, explicitAdapter: {
            options: { connectionHandler: 'ExplicitOnlyProvider' },
            master: { URI: 'adapter://local.invalid', databaseName: 'runtimePlatform' }
        }
    };
    assert.throws(() => owner.getDatabaseConfiguration('profile', 'alpha'), /aliases/);
    configs.alpha.default.explicitAdapter.master.databaseName = 'isolatedOtherProvider';
    SERVICE.ExplicitOnlyProvider.validateTenantDatabaseName = () => undefined;
    assert.throws(() => owner.getDatabaseConfiguration('profile', 'alpha'), /did not admit/);
    delete SERVICE.ExplicitOnlyProvider;
});
check('candidate builds before pin requirement; missing durable pin rejects ordinary access', () => {
    delete configs.alpha.tenantNamespaceBindings;
    const candidate = owner.buildTenantNamespaceBinding('alpha');
    assert.equal(owner.validateTenantNamespaceBindingCandidate(candidate,
        { tenantCode: 'alpha', projectCode: 'kickoff', environmentCode: 'Local', serverCode: 'platformServer' }), true);
    assert.throws(() => owner.getDatabaseConfiguration('profile', 'alpha'), error => error.code === 'ERR_DATABASE_TENANT_BINDING');
    assert.equal(configs.alpha.tenantNamespaceBindings, undefined, 'Candidate builder must not persist');
    configs.alpha.tenantNamespaceBindings = { [candidate.scopeKey]: candidate.binding };
    assert.doesNotThrow(() => owner.getDatabaseConfiguration('profile', 'alpha'));
});
check('fresh module instance enforces persisted pin without in-memory handles', () => {
    const path = require.resolve('../src/service/config/defaultDatabaseConfigurationService');
    delete require.cache[path];
    const fresh = require(path);
    assert.deepEqual(fresh.dbs, {});
    assert.doesNotThrow(() => fresh.getDatabaseConfiguration('profile', 'alpha'));
    const scopeKey = fresh.getTenantNamespaceBindingScope().scopeKey;
    configs.alpha.tenantNamespaceBindings[scopeKey].modules.profile.channels.master.destination.databaseName = 'wrongPhysicalName';
    assert.throws(() => fresh.getDatabaseConfiguration('profile', 'alpha'), error => error.code === 'ERR_DATABASE_TENANT_BINDING');
});
check('stable deployment/server scope ignores replica changes and separates servers', () => {
    const first = owner.getTenantNamespaceBindingScope();
    NODICS.getNodeName = () => 'newReplica';
    assert.deepEqual(owner.getTenantNamespaceBindingScope(), first);
    NODICS.getServerName = () => 'wasteServer';
    try {
        assert.notEqual(owner.getTenantNamespaceBindingScope().scopeKey, first.scopeKey);
        assert.throws(() => owner.getDatabaseConfiguration('profile', 'alpha'), error => error.code === 'ERR_DATABASE_TENANT_BINDING');
    } finally { NODICS.getServerName = () => 'platformServer'; }
});
check('project and selected environment are required exact scope without silent fallback', () => {
    const first = owner.getTenantNamespaceBindingScope();
    NODICS.getEnvironmentName = () => 'otherProject';
    try {
        assert.notEqual(owner.getTenantNamespaceBindingScope().scopeKey, first.scopeKey);
        assert.throws(() => owner.getDatabaseConfiguration('profile', 'alpha'), error => error.code === 'ERR_DATABASE_TENANT_BINDING');
    } finally { NODICS.getEnvironmentName = () => 'kickoff'; }
    NODICS.getSelectedEnvironmentName = () => undefined;
    try {
        assert.throws(() => owner.buildTenantNamespaceBinding('alpha'), error => error.code === 'ERR_DATABASE_TENANT_BINDING');
    } finally { NODICS.getSelectedEnvironmentName = () => 'Local'; }
});
check('base, endpoint, provider and module inventory drift invalidate pin', () => {
    configs.default.default.mongodb.master.databaseName = 'changedBase';
    for (const tenant of ['alpha', 'beta']) configs[tenant].default.mongodb.master.databaseName = 'changedBase';
    assert.throws(() => owner.getDatabaseConfiguration('profile', 'alpha'), error => error.code === 'ERR_DATABASE_TENANT_BINDING');
    setup();
    configs.alpha.default.mongodb.master.URI = 'mongodb://different.invalid:27017';
    assert.throws(() => owner.getDatabaseConfiguration('profile', 'alpha'), error => error.code === 'ERR_DATABASE_TENANT_BINDING');
    setup();
    SERVICE.SameProviderDifferentHandler = provider;
    configs.alpha.default.mongodb.options.connectionHandler = 'SameProviderDifferentHandler';
    assert.throws(() => owner.getDatabaseConfiguration('profile', 'alpha'), error => error.code === 'ERR_DATABASE_TENANT_BINDING');
    delete SERVICE.SameProviderDifferentHandler;
    setup();
    const key = owner.getTenantNamespaceBindingScope().scopeKey;
    delete configs.alpha.tenantNamespaceBindings[key].modules.profile;
    assert.throws(() => owner.getDatabaseConfiguration('profile', 'alpha'), error => error.code === 'ERR_DATABASE_TENANT_BINDING');
});
check('transport rejects wrong scope, unbounded/extra/private fields and invalid endpoint fingerprints', () => {
    const expected = { tenantCode: 'alpha', projectCode: 'kickoff', environmentCode: 'Local', serverCode: 'platformServer' };
    const candidate = owner.buildTenantNamespaceBinding('alpha');
    assert.equal(owner.validateTenantNamespaceBindingCandidate(candidate, expected), true);
    assert.throws(() => owner.validateTenantNamespaceBindingCandidate(candidate, { ...expected, serverCode: 'other' }));
    for (const mutate of [
        dto => { dto.binding.modules.profile.channels.master.destination.URI = 'private'; },
        dto => { dto.binding.modules.profile.channels.master.base.endpointFingerprint = 'not-a-digest'; },
        dto => { dto.binding.scope.instanceCode = 'replica'; },
        dto => { dto.binding.modules.profile.channels.extra = {}; },
        dto => { dto.binding.modules.profile.connectionHandler = 'x'.repeat(129); },
        dto => { for (let i = 0; i < 257; i++) dto.binding.modules['m' + i] = dto.binding.modules.profile; }
    ]) {
        const copy = _.cloneDeep(candidate); mutate(copy);
        assert.throws(() => owner.validateTenantNamespaceBindingCandidate(copy, expected), error => error.code === 'ERR_DATABASE_TENANT_BINDING');
    }
});
check('endpoint fingerprint excludes credentials and includes endpoint/topology configuration only', () => {
    const first = { databaseName: 'fixtureDb', URI: 'mongodb://fixtureUser:fixturePassword@localhost:27017/?replicaSet=rs0&authSource=admin&tlsCertificateKeyFilePassword=fixtureSecret' };
    const rotated = { databaseName: 'fixtureDb', URI: 'mongodb://otherUser:otherPassword@LOCALHOST/?authSource=other&replicaSet=rs0&tlsCertificateKeyFilePassword=rotatedSecret' };
    assert.equal(provider.getTenantEndpointFingerprint(first), provider.getTenantEndpointFingerprint(rotated));
    assert.notEqual(provider.getTenantEndpointFingerprint(first), provider.getTenantEndpointFingerprint({ databaseName: 'fixtureDb', URI: 'mongodb://localhost/?replicaSet=rs1' }));
    assert.notEqual(provider.getTenantEndpointFingerprint(first), provider.getTenantEndpointFingerprint({ ...first, databaseName: 'otherDb' }));
    assert.notEqual(provider.getTenantEndpointFingerprint(first), provider.getTenantEndpointFingerprint({ ...first, options: { tls: true } }));
    assert.equal(provider.getTenantEndpointFingerprint(first), provider.getTenantEndpointFingerprint({ ...first, options: { tlsCertificateKeyFilePassword: 'rotatedOptionSecret' } }));
    assert.notEqual(provider.getTenantEndpointFingerprint(first), provider.getTenantEndpointFingerprint({ ...first, options: { proxyHost: 'proxy.invalid', proxyPort: 1080 } }));
    configs.alpha.default.mongodb.master.URI = first.URI;
    const dto = owner.buildTenantNamespaceBinding('alpha');
    const serialized = JSON.stringify(dto);
    for (const forbidden of ['fixturePassword', 'fixtureUser', 'mongodb://', 'localhost']) assert(!serialized.includes(forbidden));
    assert.throws(() => provider.getTenantEndpointFingerprint({ URI: 'invalid' }), error => error.code === 'ERR_DATABASE_TENANT_BINDING' && !error.message.includes('invalid'));
});
check('case-sensitive Unix socket endpoints reject instead of TCP normalization', () => {
    for (const URI of ['mongodb://%2Ftmp%2FMongo.sock', 'mongodb://%2Ftmp%2Fmongo.sock']) {
        assert.throws(() => provider.getTenantEndpointFingerprint({ URI, databaseName: 'fixtureDb' }),
            error => error.code === 'ERR_DATABASE_TENANT_BINDING' && !error.message.includes('/tmp'));
    }
});
check('structured endpoint parser is a directly declared root-owned restricted runtime dependency', () => {
    const path = require('node:path');
    const root = path.resolve(__dirname, '../../../../..');
    const manifest = require(path.join(root, 'package.json'));
    const lock = require(path.join(root, 'package-lock.json'));
    assert.equal(manifest.dependencies['mongodb-connection-string-url'], '2.6.0');
    assert.equal(lock.packages[''].dependencies['mongodb-connection-string-url'], '2.6.0');
    assert.equal(lock.packages['node_modules/mongodb-connection-string-url'].version, '2.6.0');
    assert.deepEqual(manifest.nodics.dependencyGovernance.ownedDependencies['mongodb-connection-string-url'].allowedConsumers,
        ['nodics.foundation/modules/nDatabase/mongodb']);
});
check('namespace refusals resolve through registered statuses and the actual Nodics error type', () => {
    const definitions = require('../src/utils/statusDefinitions');
    const NodicsError = require('../../../nCommon/src/lib/nodicsError');
    const previous = SERVICE.DefaultStatusService;
    SERVICE.DefaultStatusService = { get: code => {
        assert.ok(definitions[code], 'Namespace refusal must have an owning status definition');
        return definitions[code];
    } };
    try {
        for (const code of ['ERR_DATABASE_TENANT_NAMESPACE', 'ERR_DATABASE_TENANT_BINDING']) {
            const error = new NodicsError(code, undefined, code);
            assert.equal(error.code, code);
            assert.equal(error.responseCode, '409');
            assert.equal(error.message, definitions[code].message);
        }
    } finally {
        if (previous === undefined) delete SERVICE.DefaultStatusService;
        else SERVICE.DefaultStatusService = previous;
    }
});
check('readiness uses actual isolation and durable pins once per tenant without opening providers', () => {
    const originalBinding = owner.assertTenantNamespaceBinding;
    const bindings = [];
    let reads = 0;
    for (const moduleName of ['default', 'profile']) {
        owner.dbs[moduleName] = Object.fromEntries(tenants.map(tenant => [tenant, {
            master: { getConnection: () => { reads++; return {}; } }
        }]));
    }
    owner.assertTenantNamespaceBinding = function (tenant) {
        bindings.push(tenant);
        return originalBinding.call(this, tenant);
    };
    try {
        assert.equal(connections.areRequiredConnectionsReady(), true);
        assert.deepEqual(bindings, ['default', 'alpha', 'beta']);
        assert.equal(reads, 14, 'Isolation checks also inspect acquired handles; none are skipped');
        bindings.length = 0;
        delete configs.alpha.tenantNamespaceBindings;
        assert.equal(connections.areRequiredConnectionsReady(), false);
        assert.deepEqual(bindings, ['default', 'alpha']);
        pin();
        configs.alpha.profile = { mongodb: { master: {
            databaseName: owner.getDatabaseConfiguration('profile', 'beta').master.databaseName
        } } };
        assert.equal(connections.areRequiredConnectionsReady(), false);
    } finally { owner.assertTenantNamespaceBinding = originalBinding; }
});
check('readiness never retains pin approval, fabricates missing handles or hides provider failure', () => {
    for (const moduleName of ['default', 'profile']) {
        owner.dbs[moduleName] = Object.fromEntries(tenants.map(tenant => [tenant, {
            master: { getConnection: () => ({}) }
        }]));
    }
    assert.equal(connections.areRequiredConnectionsReady(), true);
    configs.alpha.tenantNamespaceBindings = {};
    assert.equal(connections.areRequiredConnectionsReady(), false);
    pin();
    delete owner.dbs.profile.alpha;
    assert.equal(connections.areRequiredConnectionsReady(), false);
    owner.dbs.profile.alpha = { master: { getConnection: () => { throw new Error('provider unavailable'); } } };
    assert.equal(connections.areRequiredConnectionsReady(), false);
});
(async () => {
    const path = require('node:path');
    const initializer = require('../../../nConfig/src/service/DefaultFrameworkInitializerService');
    const files = require('../../../nConfig/src/service/defaultFilesLoaderService');
    const logger = require('../../../nConfig/src/service/DefaultLoggerService');
    const originals = { files: files.processFiles, logger: logger.createLogger,
        services: global.SERVICE, utils: global.UTILS, home: NODICS.getNodicsHome };
    const log = { debug: () => {}, warn: () => {}, error: () => {} };
    NODICS.getNodicsHome = () => path.resolve(__dirname, '../../../../..');
    global.UTILS = { getFileNameWithoutExtension: file => {
        const name = path.basename(file, '.js');
        return name[0].toUpperCase() + name.slice(1);
    } };
    logger.createLogger = () => log;
    files.processFiles = (directory, suffix, visit) => visit(directory.endsWith('/src/service') && !directory.includes('/fixtures/')
        ? path.join(directory, 'config/defaultDatabaseConfigurationService.js')
        : path.join(directory.replace('/src/service', ''), 'defaultDatabaseConfigurationService.js'));
    try {
        for (const fixture of ['readinessGetter', 'readinessConfiguration']) {
            setup();
            for (const moduleName of ['default', 'profile']) {
                owner.dbs[moduleName] = Object.fromEntries(tenants.map(tenant => [tenant, {
                    master: { getConnection: () => ({}) }
                }]));
            }
            global.SERVICE = { DefaultMongodbDatabaseConnectionHandlerService: provider };
            const loader = { ...initializer, LOG: log };
            await loader.loadServices({ name: 'database', path: path.resolve(__dirname, '..') });
            const selected = SERVICE.DefaultDatabaseConfigurationService;
            const loadedOwner = require('../src/service/config/defaultDatabaseConfigurationService');
            selected.dbs = owner.dbs;
            assert.equal(selected.getTenantDatabase, loadedOwner.getTenantDatabase);
            assert.equal(selected.getDatabaseConfiguration, loadedOwner.getDatabaseConfiguration);
            assert.equal(connections.areRequiredConnectionsReady(), true);
            await loader.loadServices({ name: 'customDatabase', path: path.join(__dirname, 'fixtures', fixture) });
            assert.equal(selected.areRequiredConnectionsReady, loadedOwner.areRequiredConnectionsReady);
            const changed = fixture === 'readinessGetter' ? 'getTenantDatabase' : 'getDatabaseConfiguration';
            assert.equal(selected.xNodics.memberOrigins[changed].sourceModule, 'customDatabase');
            assert.equal(connections.areRequiredConnectionsReady(), false);
            if (fixture === 'readinessGetter') {
                selected.fixtureGetterThrows = true;
                assert.equal(connections.areRequiredConnectionsReady(), false);
            }
            passed++;
            console.log('PASS actual startup composition preserves custom ' + changed + ' refusals');
        }
    } finally {
        files.processFiles = originals.files;
        logger.createLogger = originals.logger;
        global.SERVICE = originals.services;
        global.UTILS = originals.utils;
        if (originals.home) NODICS.getNodicsHome = originals.home;
        else delete NODICS.getNodicsHome;
    }
    const health = require('../../../nSystem/src/service/health/defaultHealthService');
    setup();
    for (const moduleName of ['default', 'profile']) {
        owner.dbs[moduleName] = Object.fromEntries(tenants.map(tenant => [tenant, {
            master: { getConnection: () => ({}) }
        }]));
    }
    NODICS.getServerState = () => 'started';
    NODICS.getActiveModules = () => ['default', 'profile'];
    NODICS.getInternalAuthToken = () => 'fixture-readiness-presence';
    SERVICE.DefaultHealthService = health;
    health.resetReadinessContributors();
    await connections.init();
    assert.equal((await health.getReadiness({})).data.status, 'UP');
    delete configs.alpha.tenantNamespaceBindings;
    health._readinessCache = null;
    assert.equal((await health.getReadiness({})).data.status, 'DOWN');
    health.resetReadinessContributors();
    delete SERVICE.DefaultHealthService;
    passed++;
    console.log('PASS actual connection contributor and public health owner preserve fresh pin refusal');
    setup();
    let opens = 0;
    const original = connections.createDatabase;
    connections.createDatabase = async () => { opens++; };
    try {
        configs.alpha.profile = { mongodb: { master: { databaseName: 'runtimePlatform' + 'Test' } } };
        await assert.rejects(connections.createDatabaseConnection('alpha'), /aliases/);
        assert.equal(opens, 0, 'Whole batch must admit before first provider invocation');
        setup();
        await connections.createDatabaseConnection('alpha');
        assert.equal(opens, 2);
        passed++;
        console.log('PASS actual connection batch rejects before any provider dispatch');
        opens = 0;
        setup();
        delete configs.alpha.tenantNamespaceBindings;
        await assert.rejects(connections.createDatabaseConnection('alpha'), error => error.code === 'ERR_DATABASE_TENANT_BINDING');
        assert.equal(opens, 0);
        setup();
        configs.default.default.mongodb.master.databaseName = 'afterRestart';
        for (const tenant of ['alpha', 'beta']) configs[tenant].default.mongodb.master.databaseName = 'afterRestart';
        owner.dbs = {};
        await assert.rejects(connections.createDatabaseConnection('alpha'), error => error.code === 'ERR_DATABASE_TENANT_BINDING');
        assert.equal(opens, 0);
        passed++;
        console.log('PASS missing pin and base drift reject actual batch before provider opens');
    } finally { connections.createDatabase = original; }
    console.log(passed + ' physical namespace cases passed (source only)');
})().catch(error => { console.error(error); process.exitCode = 1; });
