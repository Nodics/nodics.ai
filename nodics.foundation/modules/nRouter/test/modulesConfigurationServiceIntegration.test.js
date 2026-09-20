/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

/**
 * @module nRouter/test/modulesConfigurationServiceIntegration
 * @description Verifies that router topology preparation and module fallback
 * delegate to the nService-owned singleton registry.
 * @layer test
 * @owner nRouter
 */

let preparationCount = 0;
const defaultDescriptor = { code: 'default' };
const cmsDescriptor = { code: 'cms' };
const modulesConfigurationService = {
    prepareModulesConfiguration: function () {
        preparationCount += 1;
    },
    isAvailableModuleConfig: function (moduleName) {
        return moduleName === 'cms';
    },
    getModule: function (moduleName) {
        return moduleName === 'cms' ? cmsDescriptor : defaultDescriptor;
    }
};

global.SERVICE = {
    DefaultModulesConfigurationService: modulesConfigurationService
};

const routerService = require('../src/service/router/defaultRouterService');

(async function run() {
    await routerService.prepareModulesConfiguration();
    assert.strictEqual(preparationCount, 1);
    assert.strictEqual(routerService.getModulesPool(), modulesConfigurationService);
    assert.strictEqual(routerService.getModuleServerConfig('cms'), cmsDescriptor);
    assert.strictEqual(routerService.getModuleServerConfig('unknown'), defaultDescriptor);

    global.CONFIG = { get: key => key === 'servers' ? { options: { contextRoot: 'enterprise' } } : undefined };
    const metadata = { workflow: { metaData: { prefix: 'process' } }, stock: { metaData: { prefix: 'warehouse' } } };
    global.NODICS = { getRawModule: name => metadata[name] };
    const endpoint = { getHttpHost: () => 'remote.test', getHttpPort: () => 8123 };
    Object.assign(cmsDescriptor, { getOptions: () => ({}), getAbstractEndpoint: () => endpoint });
    routerService.LOG = { error: message => { throw new Error(message); } };
    for (const [moduleName, prefix] of [['workflow', 'process'], ['stock', 'warehouse'], ['profile', 'profile']]) {
        const options = { moduleName, connectionName: 'cms' };
        assert.strictEqual(routerService.prepareUrl(options), `http://remote.test:8123/enterprise/${prefix}`);
        assert.strictEqual(options.moduleName, moduleName, 'Routing must retain logical module identity');
    }
    console.log('Router modules configuration service integration validated');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
