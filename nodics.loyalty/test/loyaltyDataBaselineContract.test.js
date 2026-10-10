/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nodics.loyalty/test/loyaltyDataBaselineContract @description Verifies isolated Loyalty business packs and separately governed documentation contributions, including ownership and release hashes. @layer test @owner nodics.loyalty */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const documentation = require('../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');

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

function assertDocumentationSection(moduleRoot, moduleName, section) {
    assert.equal(section.kind, 'CONTENT_PACK');
    assert.equal(section.owningDomain, 'documentation');
    assert.equal(section.destinationRole, 'WCMS_STAGED');
    assert.equal(section.contentPath, 'docs-v001');
    assert.equal(section.pack, moduleName);
    assert.equal(section.sourceMode, 'cms-records');
    assert.equal(section.sourceAuthority, 'data/docs-v001/records/documentation');
    assert.equal(section.lifecycle, 'PUBLISHABLE');
    assert.equal(section.versioningPolicy, 'IMMUTABLE');
    assert.equal(section.publicationPolicy, 'REQUIRED');
    assert.equal(section.initialPublicationPolicy, 'ADMIN_INITIATED');
    assert.equal(section.installationPolicy, 'OPTIONAL_AXIS_INITIATED');
    assert.equal(section.files, undefined, 'Documentation must not share the business file inventory');
    const files = Object.keys(section.generatedHashes).sort();
    const actualFiles = fs.readdirSync(path.join(moduleRoot, 'data/docs-v001'), { recursive: true, withFileTypes: true })
        .filter(entry => entry.isFile())
        .map(entry => path.relative(path.join(moduleRoot, 'data'), path.join(entry.parentPath, entry.name)))
        .sort();
    assert.deepEqual(files, actualFiles, `${moduleName} documentation inventory must cover every release file`);
    assert(files.some(file => file.startsWith('docs-v001/headers/')));
    assert(files.some(file => file.startsWith('docs-v001/records/documentation/')));
    files.forEach(file => {
        assert(/^docs-v001\/(headers|records\/documentation|assets)\//.test(file), `${moduleName} documentation file must stay in its own release`);
        assert.equal(sha256(path.join(moduleRoot, 'data', file)), section.generatedHashes[file], `${moduleName} documentation hash drift for ${file}`);
    });
    assert.equal(documentation.releaseChecksum(section.generatedHashes), section.releaseChecksum);
}

dataModules.forEach(moduleName => {
    const moduleRoot = path.join(root, 'modules', moduleName);
    const packageJson = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8'));
    const manifestPath = path.join(moduleRoot, 'data/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert(packageJson.nodics.owns.includes('data'), `${moduleName} must declare data ownership`);
    assert.equal(manifest.contractVersion, 2);
    assert.equal(manifest.module, moduleName);
    if (fs.existsSync(path.join(moduleRoot, 'data/docs-v001'))) {
        assert(manifest.sections.documentation, `${moduleName} must declare its separate documentation contribution`);
    }
    Object.entries(manifest.sections).forEach(([sectionName, section]) => {
        if (sectionName === 'documentation') {
            assertDocumentationSection(moduleRoot, moduleName, section);
            return;
        }
        assert.equal(section.kind, 'DATA_RELEASE');
        assert.equal(section.owningDomain, 'loyalty');
        const targetsProfileEnterprise = Object.keys(section.files || {}).some(relativeFile => relativeFile.includes('/profile/'));
        assert.equal(section.destinationRole, targetsProfileEnterprise ? 'PLATFORM' : 'LOYALTY');
        Object.entries(section.files).forEach(([relativeFile, expectedHash]) => {
            const absoluteFile = path.join(moduleRoot, 'data', relativeFile);
            assert.equal(sha256(absoluteFile), expectedHash, `${moduleName} manifest hash drift for ${relativeFile}`);
            if (relativeFile.includes('/records/')) {
                recordsOf(absoluteFile).forEach(record => {
                    const targetsProfileEnterpriseRecord = relativeFile.includes('/records/profile/');
                    if (!targetsProfileEnterpriseRecord) {
                        assert.equal(record.tenant, undefined, `${moduleName}.${record.code} must not store tenant as Loyalty business data`);
                    }
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
