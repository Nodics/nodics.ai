/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module checkoutCore/test/spendWorkspace @description Verifies inert copy and ordinary business-area mapping through real owner projection. @layer test @owner checkoutCore */
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const manifest = require('../data/manifest.json');
const checksum = section => crypto.createHash('sha256')
    .update(Object.keys(section.files).sort().map(file => file + ':' + section.files[file]).join('|'))
    .update(section.prerequisites?.length ? '|prerequisites:' + JSON.stringify(section.prerequisites) : '').digest('hex');
test('purchase-limit copy and unassigned access definitions have exact governed release hashes and dependency pins', () => {
    for (const name of ['enterpriseSpendWorkspace', 'enterpriseSpendingPermission', 'enterpriseSpendingAccessGroups', 'enterpriseSpendingAccessRoles']) {
        const section = manifest.sections[name];
        assert.equal(section.selectionPolicy, 'EXPLICIT');
        for (const [file, hash] of Object.entries(section.files))
            assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '../data', file))).digest('hex'), hash, name + ':' + file);
        for (const reference of section.prerequisites || []) {
            const source = reference.moduleName === 'checkoutCore' ? manifest : require('../../../../../../nodics.platform/modules/profile/data/manifest.json');
            const dependency = source.sections[reference.sectionCode];
            assert.equal(dependency.version, reference.version, name + ':' + reference.sectionCode + ':version');
            assert.equal(checksum(dependency), reference.checksum, name + ':' + reference.sectionCode + ':checksum');
        }
    }
    const component = require('../data/core-v001/records/workspace/checkoutEnterpriseSpendCmsComponentData').record0;
    const type = require('../data/core-v001/records/workspace/checkoutEnterpriseSpendCmsTypeData').record0;
    assert.deepEqual(Object.keys(component.properties).sort(), Object.keys(type.propertySchema).sort());
    assert.equal(component.perPurchaseLimit, undefined);
    assert.equal(component.activationMode, undefined);
});
test('existing Profile business-area projection exposes only explicit purchase-limit Full control, with no employee assignments', () => {
    const role = require('../data/init-v002/records/identity/checkoutSpendAccessRoleData').record0;
    const group = require('../data/init-v002/records/identity/checkoutSpendAccessGroupData').record0;
    const catalogue = require('../../../../../../nodics.platform/modules/profile/src/service/identity/defaultIdentityCatalogueService');
    assert.deepEqual(catalogue.businessAreas({ [role.code]: role }), [{
        code: 'purchaseLimits', label: 'Purchase limits', ownerModule: 'checkoutCore', scopeType: 'ENTERPRISE',
        levels: [{ value: 'fullControl', roleCode: 'CHECKOUT_SPEND_FULL_CONTROL' }]
    }]);
    assert.deepEqual(role.groupCodes, [group.code]);
    assert.deepEqual(group.permissions, ['profile.scope.read', 'commerce.checkout.spend.manage']);
    assert.deepEqual(group.parentGroups, []);
    assert.equal(role.employeeCode, undefined);
    assert.deepEqual(role.assignmentPermissions, []);
});
