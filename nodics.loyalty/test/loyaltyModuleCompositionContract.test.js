/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nodics.loyalty/test/loyaltyModuleCompositionContract @description Verifies Loyalty group composition and deterministic package order. @layer test @owner nodics.loyalty */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const toolingCommandService = require('../../nodics.foundation/modules/nTooling/src/service/defaultToolingCommandService');

const groupRoot = path.resolve(__dirname, '..');
const groupPackage = JSON.parse(fs.readFileSync(path.join(groupRoot, 'package.json'), 'utf8'));
const expectedModules = [
    ['loyaltyCore', '80.10'],
    ['loyaltyProgram', '80.20'],
    ['loyaltyRewardType', '80.30'],
    ['loyaltyWallet', '80.40'],
    ['loyaltyLedger', '80.50'],
    ['loyaltyReservation', '80.60'],
    ['loyaltyRedemption', '80.70'],
    ['loyaltyApi', '80.80']
];

assert.strictEqual(groupPackage.name, 'nodics.loyalty');
assert.strictEqual(groupPackage.index, '80.99');
assert.deepStrictEqual(groupPackage.requiredModules, expectedModules.map(item => item[0]));
assert.deepStrictEqual(groupPackage.nodics.extends, ['nodics.foundation']);
assert.strictEqual(groupPackage.nodics.functionalModule.identity, 'nodics.loyalty');
assert.strictEqual(groupPackage.nodics.kind, 'group');
assert.strictEqual(groupPackage.nodics.runtime.router, false);
assert(!fs.existsSync(path.join(groupRoot, 'src')), 'Pure Loyalty group must not own runtime source');
assert(!fs.existsSync(path.join(groupRoot, 'data')), 'Pure Loyalty group must not own data');

const packageIndexes = new Set([groupPackage.index]);
expectedModules.forEach(([moduleName, expectedIndex]) => {
    const moduleRoot = path.join(groupRoot, 'modules', moduleName);
    const modulePackage = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8'));
    assert.strictEqual(modulePackage.name, moduleName);
    assert.strictEqual(modulePackage.index, expectedIndex);
    assert.strictEqual(modulePackage.nodics.kind, 'capability');
    assert(!packageIndexes.has(modulePackage.index), 'Loyalty package indexes must be unique');
    packageIndexes.add(modulePackage.index);
});

const discoveredLoyaltyModules = toolingCommandService.collectModules(path.resolve(groupRoot, '..'), [])
    .filter(moduleObject => moduleObject.path === groupRoot || moduleObject.path.startsWith(path.join(groupRoot, 'modules')))
    .map(moduleObject => moduleObject.name);
assert.deepStrictEqual(
    discoveredLoyaltyModules.sort(),
    ['nodics.loyalty'].concat(expectedModules.map(item => item[0])).sort(),
    'Standard module discovery must find the Loyalty group and all required children'
);

console.log('Loyalty module composition contract validated');
