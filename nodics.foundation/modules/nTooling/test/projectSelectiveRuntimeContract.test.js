/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/projectSelectiveRuntimeContract @description Proves real framework metadata and authored loading for independent Inventory, Commerce with remote Inventory, and CMS-only compositions. @layer test @owner nTooling */
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const frameworkRoot = path.resolve(__dirname, '../../../..');
const composition = require('../src/service/command/defaultRepositoryBuildCompositionService');
const config = require('../../nConfig');
/** Prepares an isolated selected composition without initializing infrastructure or using deployment credentials. */
async function inspect(mode) {
    const fixture = composition.create(frameworkRoot);
    try {
        const packagePath = path.join(fixture.serverRoot, 'package.json');
        const metadata = JSON.parse(fs.readFileSync(packagePath));
        metadata.nodics.extends = mode === 'cms' ? ['nodics.wcms'] : ['nodics.foundation'];
        fs.writeFileSync(packagePath, JSON.stringify(metadata));
        const selected = mode === 'inventory' ? ['inventory'] : mode === 'commerce' ?
            ['store', 'product', 'pricing', 'tax', 'promotion', 'shoppingList', 'checkoutCore', 'order', 'paymentCore', 'fulfillmentCore'] : [];
        const endpoint = { httpHost: '127.0.0.1', httpPort: 9 };
        const servers = { profile: { endpoint, options: { remoteOnly: true } } };
        if (mode === 'commerce') servers.inventory = { endpoint, options: { remoteOnly: true } };
        fs.writeFileSync(path.join(fixture.serverRoot, 'config/properties.js'), 'module.exports = ' + JSON.stringify({
            activeModules: { groups: [], modules: selected.concat(['nodics.repository-build', fixture.environmentName, fixture.serverName]) },
            log: { level: 'error' }, servers
        }) + ';');
        // The source roots make packages discoverable; only selected capability graphs are loaded.
        const options = { NODICS_HOME: path.join(frameworkRoot, 'nodics.foundation'), CUSTOM_HOME: fixture.root,
            MODULE_ROOTS: require(path.join(frameworkRoot, 'package.json')).workspaces.map(item => path.join(frameworkRoot, item)).concat(fixture.root),
            defaultServer: fixture.serverName, defaultEnvironment: fixture.environmentName };
        await config.prepareBuild(options);
        await config.initUtilities(options);
        await config.loadModules();
        const active = NODICS.getActiveModules();
        for (const excluded of ['waste', 'cronjob', 'workflow', 'profile', 'redisCache', 'hazelcastCache']) assert(!active.includes(excluded), excluded + ' must not activate');
        assert.equal(SERVICE.DefaultCronJobService, undefined);
        assert.equal(SERVICE.DefaultProcessRuntimeLifecycleService, undefined);
        if (mode === 'inventory') {
            assert(active.includes('inventory'));
            for (const excluded of ['product', 'order', 'paymentCore', 'cms']) assert(!active.includes(excluded));
            assert.equal(SERVICE.DefaultCommerceOrderService, undefined);
            const request = { tenant: 'tenant-a', sku: 'sku-a' };
            const candidates = SERVICE.DefaultInventorySourcingService.source(request, [
                { tenant: 'tenant-a', sku: 'sku-a', warehouseCode: 'allowed', available: '2', revision: 1 },
                { tenant: 'tenant-b', sku: 'sku-a', warehouseCode: 'other-tenant', available: '9', revision: 1 }
            ]);
            assert.deepEqual(candidates.map(item => item.warehouseCode), ['allowed']);
        } else if (mode === 'commerce') {
            assert(active.includes('product') && active.includes('order'));
            assert(!active.includes('inventory'));
            assert.equal(SERVICE.DefaultInventorySourcingService, undefined);
            assert.equal(CONFIG.get('servers').inventory.options.remoteOnly, true);
        } else {
            assert(active.includes('cms') && active.includes('media'));
            for (const excluded of ['inventory', 'product', 'order', 'nodics.commerce']) assert(!active.includes(excluded));
            assert.equal(SERVICE.DefaultInventorySourcingService, undefined);
            assert.equal(SERVICE.DefaultCommerceOrderService, undefined);
        }
        console.log(JSON.stringify({ mode, active, authoredDefinitionsLoaded: true, runtimeResourceHooksExecuted: false }));
    } finally { fs.rmSync(fixture.root, { recursive: true, force: true }); }
}
if (process.argv.includes('--inspect')) {
    inspect(process.argv[process.argv.indexOf('--inspect') + 1]).catch(error => { console.error(error); process.exitCode = 1; });
} else {
    for (const mode of ['inventory', 'commerce', 'cms']) {
        const result = spawnSync(process.execPath, [__filename, '--inspect', mode], { encoding: 'utf8', timeout: 30000 });
        assert.equal(result.status, 0, mode + ' failed: ' + result.stderr);
        const report = result.stdout.trim().split('\n').find(line => line.startsWith('{"mode":'));
        assert(report, mode + ' evidence missing');
        console.log(report);
    }
    console.log('Real selective runtime composition contracts validated');
}
