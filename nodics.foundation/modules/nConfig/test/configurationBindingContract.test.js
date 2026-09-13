/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module config/test/configurationBindingContract @description Exercises declarative bindings through real nConfig contribution loading, layering, selection and rejection paths. @layer test @owner config */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const resolver = require('../src/service/defaultConfigurationBindingService');
const initializer = require('../src/service/DefaultFrameworkInitializerService');
const composition = { environmentVariable: 'DOMAIN_SELECTION', domains: [
    { code: 'warehouse', frameworkGroup: 'warehouse', projectPack: 'customer.warehouse', productSearchContributor: { required: true } },
    { code: 'shipping', frameworkGroup: 'shipping', projectPack: 'customer.shipping' }
], sharedModules: [{ module: 'sharedOperations', minSelectedDomains: 2 }] };
test('the existing nConfig load sequence resolves references and preserves later overrides without shared mutations', t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'configuration-binding-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const envRoot = path.join(root, 'envs/qa'), serverRoot = path.join(envRoot, 'jobsServer');
    const write = (file, data) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, 'module.exports = ' + JSON.stringify(data) + ';'); };
    write(path.join(root, 'config/properties.js'), { connectionValues: { local: { host: '127.0.0.1', port: 4500 } } });
    write(path.join(envRoot, 'config/properties.js'), { log: { level: 'warn' } });
    fs.writeFileSync(path.join(envRoot, 'nodics.environment.json'), JSON.stringify({ environment: 'qa', composition: { business: composition } }));
    write(path.join(serverRoot, 'config/properties.js'), {
        connection: { $config: 'ref', path: ['connectionValues', 'local'] },
        sourceRoot: { $config: 'path', base: 'project', relative: 'docs/customer' },
        project: { $config: 'context', name: 'projectCode' },
        activeModules: { modules: ['jobs', { $config: 'composition', name: 'business', field: 'projectPacks', spread: true }] }
    });
    const node = path.join(serverRoot, 'worker1');
    write(path.join(node, 'config/properties.js'), { connection: { port: 4600 }, log: { level: 'debug' } });
    global.NODICS = { getEnvironmentPath: () => root, getServerRootPath: () => envRoot, getServerPath: () => serverRoot,
        getNodePath: () => node, getNodicsHome: () => path.join(root, 'framework/nodics.foundation'),
        getEnvironmentName: () => 'customer.application', getSelectedEnvironmentName: () => 'qa', getServerName: () => 'jobsServer', getNodeName: () => 'worker1' };
    const actual = initializer.loadServerProperties();
    assert.deepEqual(actual.connection, { host: '127.0.0.1', port: 4600 });
    assert.equal(actual.connectionValues.local.port, 4500);
    assert.equal(actual.project, 'customer.application');
    assert.equal(actual.sourceRoot, path.join(root, 'docs/customer'));
    assert.deepEqual(actual.activeModules.modules, ['jobs', 'customer.warehouse', 'customer.shipping']);
    assert.equal(actual.log.level, 'debug');
    let loaded = {};
    global.CONFIG = { getProperties: () => loaded, setProperties: values => { loaded = values; } };
    const instance = { ...initializer, LOG: { debug() {} } };
    for (const file of [path.join(root, 'config/properties.js'), path.join(serverRoot, 'config/properties.js'), path.join(node, 'config/properties.js')]) instance.loadConfiguration(file);
    assert.deepEqual(loaded.connection, actual.connection);
});
test('environment values, explicit empty selections and conditional contributions remain declarative', () => {
    const definition = {
        secret: { $config: 'env', name: 'SERVICE_SECRET' },
        port: { $config: 'env', name: 'PORT', type: 'number', fallback: 4500 },
        enabled: { $config: 'all', values: [{ $config: 'env', name: 'ENABLED', type: 'boolean', fallback: true }, true] },
        modules: [{ $config: 'selected', name: 'business', field: 'domains', includes: 'warehouse', value: 'warehouseModule' }],
        contributors: { optional: { $config: 'selected', name: 'business', field: 'domains', includes: 'shipping', value: { required: true } } }
    };
    const context = { compositions: { business: composition }, environmentVariables: { DOMAIN_SELECTION: 'warehouse', ENABLED: 'false', PORT: '4501', SERVICE_SECRET: 'test-secret' } };
    const actual = resolver.resolve(definition, {}, context);
    assert.equal(actual.secret, 'test-secret'); assert.equal(actual.port, 4501); assert.equal(actual.enabled, false);
    assert.deepEqual(actual.modules, ['warehouseModule']); assert.deepEqual(actual.contributors, {});
    assert.deepEqual(resolver.resolveDomainComposition({ ...composition, emptySelections: ['none', 'foundation'] }, 'foundation').domains, []);
    assert.throws(() => resolver.resolveDomainComposition(composition, 'commerce'), /Unsupported/);
    assert.throws(() => resolver.resolve(definition, {}, { ...context, environmentVariables: { ENABLED: 'maybe' } }), /boolean/);
    assert.throws(() => resolver.resolve(definition, {}, { ...context, environmentVariables: { PORT: 'Infinity' } }), /finite/);
    assert.equal(definition.enabled.$config, 'all', 'resolution never changes authoring objects');
});
test('cycles, unavailable contexts, malformed bindings and unsafe reference paths fail before use', () => {
    assert.throws(() => resolver.resolve({ first: { $config: 'ref', path: 'second' }, second: { $config: 'ref', path: 'first' } }), /cycle/);
    assert.throws(() => resolver.resolve({ value: { $config: 'ref', path: ['__proto__', 'polluted'] } }), /Invalid.*path/);
    assert.throws(() => resolver.resolve({ value: { $config: 'ref', path: 'missing' } }), /unavailable/);
    assert.throws(() => resolver.resolve({ value: { $config: 'script', path: '/tmp/run.js' } }), /Invalid.*declaration/);
    assert.throws(() => resolver.resolve({ value: { $config: 'context', name: 'process' } }), /Unknown/);
    assert.throws(() => resolver.resolve({ value: { $config: 'env', name: 'SECRET', expression: 'eval()' } }), /Invalid/);
    assert.throws(() => resolver.resolve({ value: { $config: 'composition', name: 'missing' } }), /unavailable/);
    assert.throws(() => resolver.resolve([{ $config: 'env', name: 'PORT', fallback: 2, spread: true }]), /requires an array/);
    assert.throws(() => resolver.resolve({ value: { $config: 'env', name: 'PORT', spread: true } }), /only permitted/);
});
