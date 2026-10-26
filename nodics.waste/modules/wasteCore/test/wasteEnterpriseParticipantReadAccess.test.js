/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module wasteCore/test/enterpriseParticipantReadAccess @description Verifies canonical self-read composition on the existing Enterprise administrator group and exact permission prerequisites. @owner wasteCore @layer test */
const test = require('node:test'), assert = require('node:assert/strict'), crypto = require('node:crypto'), fs = require('node:fs'), path = require('node:path');
const group = require('../data/init-v001/records/identity/wasteCoreUserGroupData').record1;
const section = require('../data/manifest.json').sections.accessGroups;
test('existing Waste Enterprise administrator composes only canonical Carbon/material self-read additions', () => {
  assert.equal(group.code, 'wasteEnterpriseAdministratorUserGroup');
  assert.deepEqual(group.parentGroups, ['axisOperationalUserGroup']);
  assert.deepEqual(group.permissions.filter(code => code.startsWith('carbon.') || code.startsWith('waste.materialValue.')).sort(),
    ['carbon.holdings.read', 'waste.materialValue.read']);
  for (const [owner, code, file] of [
    ['wasteCarbon', 'carbon.holdings.read', 'wasteCarbonPermissionData'],
    ['wasteReward', 'waste.materialValue.read', 'wasteRewardPermissionData']]) {
    const root = path.resolve(__dirname, '../../', owner, 'data');
    const target = require(path.join(root, 'manifest.json')).sections.permissionCatalogue;
    const rows = Object.values(require(path.join(root, 'init-v001/records/identity', file)));
    assert(rows.some(row => row.code === code && row.active === true));
    const prerequisite = section.prerequisites.find(ref => ref.moduleName === owner && ref.sectionCode === 'permissionCatalogue');
    assert(prerequisite); assert.equal(prerequisite.version, target.version);
    assert.equal(prerequisite.checksum, crypto.createHash('sha256').update(Object.keys(target.files).sort().map(name => name + ':' + target.files[name]).join('|')).digest('hex'));
  }
  for (const [file, expected] of Object.entries(section.files))
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname, '../data', file))).digest('hex'), expected);
});
