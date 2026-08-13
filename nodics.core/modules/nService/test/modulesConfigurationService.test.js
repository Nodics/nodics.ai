/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

/**
 * @module nService/test/modulesConfigurationService
 * @description Verifies singleton topology preparation, atomic replacement,
 * mutation isolation, registry lifecycle, and later-layer method overrides.
 * @layer test
 * @owner nService
 */

const servers = {
    options: { contextRoot: '/api' },
    default: {
        endpoint: { httpHost: 'localhost', httpPort: 3000 },
        nodes: {}
    }
};

global.CONFIG = {
    get: function (key) {
        return key === 'servers' ? servers : undefined;
    }
};
global.UTILS = {
    isBlank: function (value) {
        return !value || Object.keys(value).length === 0;
    }
};
global.CLASSES = {
    ModuleConfiguration: function (moduleName) {
        this.moduleName = moduleName;
        this.addEndpoint = endpoint => { this.endpoint = endpoint; };
        this.addOptions = options => { this.options = options; };
        this.addAbstractEndpoint = endpoint => { this.abstractEndpoint = endpoint; };
        this.addNode = (nodeName, node) => {
            this.nodes = this.nodes || {};
            this.nodes[nodeName] = node;
        };
    }
};

const service = require('../src/service/module/defaultModulesConfigurationService');
service.LOG = { debug: function () {} };

let prepared = service.prepareModulesConfiguration();
assert.strictEqual(prepared, service.getModules());
assert.strictEqual(service.isAvailableModuleConfig('default'), true);
assert.strictEqual(service.getModule('default').options.contextRoot, '/api');
assert.deepStrictEqual(service.getModule('default').nodes.node0, servers.default.endpoint);
assert.strictEqual(servers.default.abstractEndpoint, undefined, 'layered CONFIG must not be mutated');
assert.deepStrictEqual(servers.default.nodes, {}, 'layered CONFIG nodes must not be mutated');

service.addModule('process', {
    endpoint: { httpHost: 'localhost', httpPort: 3010 }
});
assert.strictEqual(service.getModule('process').moduleName, 'process');
assert.strictEqual(service.removeModule('process'), true);
assert.strictEqual(service.removeModule('process'), false);
assert.throws(() => service.getModule('process'), /Invalid module name/);

const previousModules = service.getModules();
servers.invalid = {};
assert.throws(() => service.prepareModulesConfiguration(), /Invalid endpoint configuration/);
assert.strictEqual(service.getModules(), previousModules, 'failed preparation must retain the active registry');
delete servers.invalid;

const customizedService = Object.assign({}, service, {
    modules: {},
    createModuleConfiguration: function (moduleName) {
        return { customized: true, moduleName: moduleName };
    }
});
customizedService.prepareModulesConfiguration();
assert.deepStrictEqual(customizedService.getModule('default'), {
    customized: true,
    moduleName: 'default'
});

console.log('Modules configuration service contract validated');
