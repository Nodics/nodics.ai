/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module config/test/configurationValidation
 * @description Validates consolidated and modular environment/server/node configuration resolution, canonical package kinds, required module ordering, topology declarations, and negative startup cases.
 * @layer test
 * @owner nConfig
 * @override Project applications should add their own topology fixtures through project modules while preserving these generic hierarchy and metadata invariants.
 */
const assert = require('assert');
const path = require('path');

const Nodics = require('../bin/nodics');
const utils = require('../src/utils/utils');
const initService = require('../src/service/DefaultFrameworkInitializerService');

const repoRoot = path.resolve(__dirname, '../../../');

/**
 * Creates a raw-module fixture for topology and validation unit checks.
 * @param {string} name Runtime module name.
 * @param {string} kind Nodics module kind.
 * @param {string} parent Physical parent module name.
 * @param {string} index Module index.
 * @returns {Object} Raw module fixture.
 */
function moduleFixture(name, kind, parent, index) {
    return {
        name: name,
        canonicalIdentity: parent ? parent + '/' + name : name,
        registryKey: parent ? parent + '/' + name : name,
        path: path.join(repoRoot, 'nodics.core', 'modules', 'nConfig', 'test', 'fixtures', parent || '', name),
        parent: parent,
        children: [],
        index: index,
        metaData: {
            name: name,
            index: index,
            nodics: { kind: kind }
        }
    };
}

/**
 * Installs synthetic raw modules into the active Nodics runtime registry.
 * @param {Object[]} modules Raw module fixtures.
 * @returns {Nodics} Runtime registry configured with the fixtures.
 */
function installSyntheticModules(modules) {
    const runtime = new Nodics();
    runtime.init({ NODICS_HOME: repoRoot });
    const moduleMap = {};
    modules.forEach(moduleObject => {
        moduleMap[moduleObject.registryKey] = moduleObject;
    });
    runtime.addRawModules(moduleMap);
    global.NODICS = runtime;
    return runtime;
}

const syntheticModules = [
    moduleFixture('envs', 'application', 'nodics.ai', '1000.0'),
    moduleFixture('kickoffLocal', 'group', 'envs', '1001.10'),
    moduleFixture('kickoffDev', 'group', 'envs', '1001.20'),
    moduleFixture('monoServer', 'server', 'kickoffLocal', '1001.11'),
    moduleFixture('monoServer', 'server', 'kickoffDev', '1001.21'),
    moduleFixture('profileServer', 'server', 'kickoffLocal', '1001.12'),
    moduleFixture('monoNode0', 'node', 'monoServer', '1001.11.1'),
    moduleFixture('profile', 'module', 'nodics.platform', '5.15')
];
syntheticModules.find(moduleObject => moduleObject.name === 'monoNode0').parentKey = 'kickoffLocal/monoServer';
syntheticModules.find(moduleObject => moduleObject.name === 'profileServer').path = path.join(repoRoot, 'modules', 'nConfig');

let discovery = installSyntheticModules(syntheticModules);

assert.throws(() => utils.indexModuleRecords([{
    name: 'duplicateCapability',
    canonicalIdentity: 'groupA/duplicateCapability',
    physicalParent: 'groupA',
    children: [],
    metaData: { name: 'duplicateCapability', nodics: { kind: 'module' } }
}, {
    name: 'duplicateCapability',
    canonicalIdentity: 'groupB/duplicateCapability',
    physicalParent: 'groupB',
    children: [],
    metaData: { name: 'duplicateCapability', nodics: { kind: 'module' } }
}], {}), /Duplicate runtime module name.*duplicateCapability/,
'ordinary modules must retain globally unique runtime names');

assert.throws(() => discovery.resolveTopologyModule('monoServer', 'server'), /Ambiguous server/,
    'an unscoped duplicate server name must fail in non-interactive execution');
let localConsolidated = discovery.resolveTopologyModule('monoServer', 'server', 'kickoffLocal');
let devConsolidated = discovery.resolveTopologyModule('monoServer', 'server', 'kickoffDev');
assert(localConsolidated && devConsolidated);
assert.notStrictEqual(localConsolidated.canonicalIdentity, devConsolidated.canonicalIdentity,
    'same-name servers in different environments require distinct runtime-derived canonical identities');
let promptedEnvironment;
let interactiveDiscovery = new Nodics();
interactiveDiscovery.init({ NODICS_HOME: repoRoot, environmentSelector: options => {
    promptedEnvironment = options.environments;
    return 'kickoffDev';
} });
interactiveDiscovery.addRawModules(NODICS.getRawModules());
global.NODICS = interactiveDiscovery;
assert.strictEqual(interactiveDiscovery.resolveTopologyModule('monoServer', 'server').parent, 'kickoffDev');
assert(promptedEnvironment.includes('kickoffLocal') && promptedEnvironment.includes('kickoffDev'),
    'interactive selection adapter must receive only discovered environment candidates');

let nodeWithoutServer = installSyntheticModules(syntheticModules);
let originalNodeArgv = process.argv.slice();
process.argv = process.argv.slice(0, 2).concat(['NODE=monoNode0']);
assert.throws(() => nodeWithoutServer.initEnvironment({
    defaultEnvironment: 'kickoffLocal',
    defaultServer: 'monoServer'
}), /Node startup requires an explicit SERVER/,
'node startup must not silently use the project default server');
process.argv = originalNodeArgv;

discovery = installSyntheticModules(syntheticModules);
let localConsolidatedNode = discovery.resolveTopologyModule('monoNode0', 'node', 'kickoffLocal', 'monoServer');
assert(localConsolidatedNode, 'selected nodes must resolve inside the selected server and environment');
assert.strictEqual(localConsolidatedNode.parent, 'monoServer');
let loadOrder = initService.getConfigurationLoadOrder();
assert(loadOrder.includes('active module /config/properties.js files in module index order'));

assert.throws(() => {
    initService.validateModuleKind('profile', 'server', 'test module kind validation');
}, /must have nodics.kind server/);

assert.throws(() => {
    initService.validateRuntimeTopologyConfiguration({
        test: {
            runtimeTopology: {
                monoServer: 'missingServer',
                modularServers: ['profileServer']
            }
        }
    });
}, /unknown module: missingServer/);

assert.throws(() => {
    initService.validateRuntimeTopologyConfiguration({
        test: {
            runtimeTopology: {
                monoServer: 'profileServer',
                modularServers: ['profileServer', 'profileServer']
            }
        }
    });
}, /duplicate server/);

let originalGetServerNameForConfiguredModules = NODICS.getServerName;
NODICS.getServerName = function () {
    return 'profileServer';
};
assert.throws(() => {
    initService.validateConfiguredModules({
        activeModules: {
            groups: ['missingGroup'],
            modules: []
        }
    });
}, /unknown module: missingGroup/);
NODICS.getServerName = originalGetServerNameForConfiguredModules;

assert.throws(() => {
    initService.validateServerConfiguration({
        servers: {}
    });
}, /servers.default must be defined/);

assert.throws(() => {
    initService.validateServerConfiguration({
        servers: {
            default: {
                server: {
                    httpHost: 'localhost',
                    httpPort: 3000
                }
            }
        }
    });
}, /servers.default.endpoint must be defined/);

assert.throws(() => {
    initService.validateModuleIndexOrder({
        name: 'applicationServer',
        index: '100.1.1'
    }, {
        name: 'applicationEnvironment',
        index: '100.1'
    }, 'server root to server');
}, /index order is invalid/);

let originalGetEnvironmentName = NODICS.getEnvironmentName;
let originalGetServerName = NODICS.getServerName;
let originalGetServerRootName = NODICS.getServerRootName;
let originalGetRawModule = NODICS.getRawModule;
NODICS.getEnvironmentName = function () {
    return 'detachedRuntimeGroup';
};
NODICS.getServerName = function () {
    return 'profileServer';
};
NODICS.getServerRootName = function () {
    return 'kickoffLocal';
};
NODICS.getRawModule = function (moduleName) {
    if (moduleName === 'detachedRuntimeGroup') {
        return {
            name: 'detachedRuntimeGroup',
            index: '100.0',
            parent: 'application',
            metaData: { name: 'detachedRuntimeGroup', nodics: { kind: 'group' } }
        };
    }
    return originalGetRawModule.call(NODICS, moduleName);
};
assert.throws(() => {
    initService.validateSelectedRuntimeHierarchy();
}, /selected environment kickoffLocal must be a child of project detachedRuntimeGroup/);
NODICS.getEnvironmentName = originalGetEnvironmentName;
NODICS.getServerName = originalGetServerName;
NODICS.getServerRootName = originalGetServerRootName;
NODICS.getRawModule = originalGetRawModule;
