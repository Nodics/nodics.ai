/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nodics.loyalty/test/loyaltyDataBaselineContract @description Verifies Loyalty data packs are owner-scoped, hash-pinned, and free from tenant or enterprise wallet ownership fields. @layer test @owner nodics.loyalty */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dataModules = [
    'loyaltyCore',
    'loyaltyRewardType',
    'loyaltyProgram',
    'loyaltyWallet',
    'loyaltyLedger',
    'loyaltyReservation',
    'loyaltyRedemption'
];

function sha256(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function recordsOf(filePath) {
    const loaded = require(filePath);
    return Object.keys(loaded).sort().map(key => loaded[key]);
}

dataModules.forEach(moduleName => {
    const moduleRoot = path.join(root, 'modules', moduleName);
    const packageJson = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8'));
    const manifestPath = path.join(moduleRoot, 'data/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert(packageJson.nodics.owns.includes('data'), `${moduleName} must declare data ownership`);
    assert.equal(manifest.contractVersion, 2);
    assert.equal(manifest.module, moduleName);
    Object.values(manifest.sections).forEach(section => {
        assert.equal(section.owningDomain, 'loyalty');
        assert.equal(section.destinationRole, 'LOYALTY');
        Object.entries(section.files).forEach(([relativeFile, expectedHash]) => {
            const absoluteFile = path.join(moduleRoot, 'data', relativeFile);
            assert.equal(sha256(absoluteFile), expectedHash, `${moduleName} manifest hash drift for ${relativeFile}`);
            if (relativeFile.includes('/records/')) {
                recordsOf(absoluteFile).forEach(record => {
                    assert.equal(record.tenant, undefined, `${moduleName}.${record.code} must not store tenant as Loyalty business data`);
                    assert.equal(record.enterpriseCode, undefined, `${moduleName}.${record.code} must not store enterpriseCode`);
                });
            }
        });
    });
});

const rewardTypes = require('../modules/loyaltyRewardType/data/core-v001/records/loyalty/loyaltyRewardTypeCoreData');
const programs = require('../modules/loyaltyProgram/data/core-v001/records/loyalty/loyaltyProgramCoreData');
const policies = require('../modules/loyaltyCore/data/core-v001/records/loyalty/loyaltyOperationPolicyCoreData');
const balance = require('../modules/loyaltyWallet/data/sample-v001/records/loyalty/loyaltyWalletRewardBalanceLifecycleData').record0;

assert.deepEqual(Object.values(rewardTypes).map(record => record.code).sort(), ['points', 'storeCredit', 'visitStamp']);
assert.equal(programs.record0.defaultRewardTypeCode, 'points');
assert.deepEqual(Object.values(policies).map(record => record.operationType).sort(), ['CAPTURE', 'EARN', 'RELEASE', 'RESERVE', 'REVERSE']);
assert.equal(balance.available, '75.00');
assert.equal(balance.reserved, '0.00');
assert.equal(balance.earned, '100.00');
assert.equal(balance.spent, '25.00');

console.log('Loyalty data baseline contract validated');
