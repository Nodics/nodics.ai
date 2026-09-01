/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nodics.waste/test/wasteModuleCompositionContract @description Verifies Waste framework composition and deterministic package order. @layer test @owner nodics.waste */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const toolingCommandService = require('../../nodics.foundation/modules/nTooling/src/service/defaultToolingCommandService');

const groupRoot = path.resolve(__dirname, '..');
const groupPackage = JSON.parse(fs.readFileSync(path.join(groupRoot, 'package.json'), 'utf8'));
const expectedModules = [
    ['wasteCore', '82.10'],
    ['wasteMaterial', '82.20'],
    ['wasteCollection', '82.30'],
    ['wasteSubmission', '82.40'],
    ['wasteVerification', '82.50'],
    ['wasteReceipt', '82.60'],
    ['wasteImpact', '82.70'],
    ['wasteMovement', '82.80'],
    ['wasteCompliance', '82.85'],
    ['wasteApi', '82.90']
];

assert.strictEqual(groupPackage.name, 'nodics.waste');
assert.strictEqual(groupPackage.index, '82.99');
assert.deepStrictEqual(groupPackage.requiredModules, expectedModules.map(function (item) { return item[0]; }));
assert.deepStrictEqual(groupPackage.nodics.extends, ['nodics.foundation']);
assert.strictEqual(groupPackage.nodics.functionalModule.identity, 'nodics.waste');
assert.strictEqual(groupPackage.nodics.kind, 'group');
assert.strictEqual(groupPackage.nodics.runtime.router, false);
assert(!fs.existsSync(path.join(groupRoot, 'src')), 'Waste group must remain composition-only');
assert(!fs.existsSync(path.join(groupRoot, 'data')), 'Waste group must not own partner seed data');

const packageIndexes = new Set([groupPackage.index]);
expectedModules.forEach(function (item) {
    let moduleName = item[0];
    let expectedIndex = item[1];
    let moduleRoot = path.join(groupRoot, 'modules', moduleName);
    let modulePackage = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8'));
    assert.strictEqual(modulePackage.name, moduleName);
    assert.strictEqual(modulePackage.index, expectedIndex);
    assert.strictEqual(modulePackage.nodics.kind, 'capability');
    assert(!packageIndexes.has(modulePackage.index), 'Waste package indexes must be unique');
    packageIndexes.add(modulePackage.index);
});

const discoveredWasteModules = toolingCommandService.collectModules(path.resolve(groupRoot, '..'), [])
    .filter(function (moduleObject) { return moduleObject.path === groupRoot || moduleObject.path.startsWith(path.join(groupRoot, 'modules')); })
    .map(function (moduleObject) { return moduleObject.name; });

assert.deepStrictEqual(
    discoveredWasteModules.sort(),
    ['nodics.waste'].concat(expectedModules.map(function (item) { return item[0]; })).sort(),
    'Standard module discovery must find the Waste group and all required children'
);

console.log('Waste module composition contract validated');
