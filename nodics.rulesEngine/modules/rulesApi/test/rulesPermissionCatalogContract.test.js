/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('assert');
const routers = require('../src/router/routers');
const permissionRecords = Object.values(require('../data/init-v001/records/identity/rulesApiPermissionData'));
const permissionHeader = require('../data/init-v001/headers/identity/rulesApiPermissionHeader');
const permissionPack = require('../data/manifest.json').sections.permissionCatalogue;
const profileInit = require('../../../../nodics.platform/modules/profile/data/manifest.json').sections['init-v001'];

const catalog = new Set(permissionRecords.map(row => row.code));
assert.strictEqual(catalog.size, permissionRecords.length, 'Rules permission definitions must be unique');
assert.deepStrictEqual([...catalog].sort(), [
    'rules.backoffice.view', 'rules.definition.read', 'rules.definition.create', 'rules.definition.update',
    'rules.definition.validate', 'rules.definition.simulate', 'rules.definition.submit', 'rules.definition.approve',
    'rules.definition.publish', 'rules.definition.schedule', 'rules.definition.disable', 'rules.definition.audit',
    'rules.band.read', 'rules.band.create', 'rules.band.update', 'rules.band.publish',
].sort());
permissionRecords.forEach(row => {
    assert.strictEqual(row.ownerModule, 'rulesApi');
    assert.strictEqual(row.active, true);
    assert.deepStrictEqual(Object.keys(row).sort(), ['active', 'code', 'name', 'ownerModule'],
        'Permission vocabulary must not contain group or principal assignments');
});
assert.strictEqual(permissionPack.owningDomain, 'rulesApi');
assert.strictEqual(permissionPack.selectionPolicy, 'EXPLICIT');
assert.strictEqual(permissionPack.destinationRole, 'PLATFORM');
assert(Object.hasOwn(permissionPack.files, 'init-v001/records/identity/rulesApiPermissionData.js'));
assert(Object.hasOwn(permissionPack.files, 'init-v001/headers/identity/rulesApiPermissionHeader.js'));
assert.deepStrictEqual(Object.keys(permissionHeader), ['profile']);
assert.strictEqual(permissionHeader.profile.rulesApiPermission.options.schemaName, 'permission');
assert.strictEqual(permissionHeader.profile.rulesApiPermission.options.operation, 'ensureReferenceAll');
assert(profileInit.prerequisites.some(ref => ref.moduleName === 'rulesApi' &&
    ref.sectionCode === 'permissionCatalogue' && ref.partition === 'DEFAULT'));
const missing = [];
Object.values(routers.rulesApi).forEach(group => {
    Object.entries(group).forEach(([name, route]) => {
        assert.strictEqual(route.secured, true, name + ' must stay secured');
        assert(route.permission || route.permissionConfig, name + ' must declare permission');
        if (route.permission && !catalog.has(route.permission)) missing.push(name + ':' + route.permission);
    });
});
assert.deepStrictEqual(missing, [], 'Rules permissions missing from identity catalogue: ' + missing.join(', '));
console.log('Rules API permission catalogue contract validated');
