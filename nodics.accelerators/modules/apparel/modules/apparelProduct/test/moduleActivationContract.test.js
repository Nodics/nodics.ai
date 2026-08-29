/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module apparelProduct/test/moduleActivationContract
 * @description Proves accelerator discovery, parent hierarchy, selective group expansion, metadata, and composition-only group boundaries.
 * @layer test
 * @owner apparelProduct
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../../../../../../');
const configUtils = require(path.join(repositoryRoot, 'nodics.foundation/modules/nConfig/src/utils/utils'));
const acceleratorsRoot = path.join(repositoryRoot, 'nodics.accelerators');

const modules = {};
const records = [];
configUtils.collectModuleRecords(acceleratorsRoot, records, null);
configUtils.indexModuleRecords(records, modules);

assert(modules['nodics.accelerators'], 'Accelerators runtime group must be discovered');
assert(modules.apparel, 'Apparel runtime group must be discovered');
assert(modules.apparelProduct, 'Apparel Product capability must be discovered');
assert.strictEqual(modules.apparel.parent, 'nodics.accelerators');
assert.strictEqual(modules.apparelProduct.parent, 'apparel');
assert.deepStrictEqual(
    configUtils.resolveModuleHierarchy('apparelProduct', modules),
    ['apparelProduct', 'apparel', 'nodics.accelerators']
);

assert(modules['nodics.accelerators'].modules.includes('apparel'));
assert.deepStrictEqual(modules.apparel.modules, ['apparelProduct']);

const previousNodics = global.NODICS;
global.NODICS = {
    getRawModule: function (name) {
        return modules[name];
    }
};
try {
    const active = [];
    configUtils.prepareActiveModuleList({}, 'apparel', active);
    assert.deepStrictEqual(active, ['apparel', 'apparelProduct']);
} finally {
    global.NODICS = previousNodics;
}

const acceleratorPackage = require(path.join(acceleratorsRoot, 'package.json'));
const apparelPackage = require(path.join(acceleratorsRoot, 'modules/apparel/package.json'));
assert.deepStrictEqual(acceleratorPackage.nodics.extends, ['nodics.foundation', 'nodics.commerce', 'nodics.discovery']);
assert.deepStrictEqual(apparelPackage.nodics.extends, ['nodics.commerce']);
assert.strictEqual(acceleratorPackage.nodics.functionalModule.identity, 'nodics.accelerators');
assert.strictEqual(fs.existsSync(path.join(acceleratorsRoot, 'src')), false, 'Accelerator root must remain source-free');
assert.strictEqual(fs.existsSync(path.join(acceleratorsRoot, 'data')), false, 'Accelerator root must remain data-free');
assert.strictEqual(fs.existsSync(path.join(acceleratorsRoot, 'modules/apparel/src')), false, 'Apparel group must remain source-free');
assert.strictEqual(fs.existsSync(path.join(acceleratorsRoot, 'modules/apparel/data')), false, 'Apparel group must remain data-free');

console.log('Apparel accelerator module activation contract validated');
