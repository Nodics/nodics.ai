/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/acquisitionRefreshPermissionCatalogue
 * @description Verifies refresh route authority resolves through the governed owner catalogue without granting business groups refresh rights.
 * @owner promotion @layer test
 */
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const route = require('../src/router/routers').promotion.acquisitionRefresh.refresh;
const records = require('../data/init-v001/records/identity/promotionPermissionData');
const manifest = require('../data/manifest.json');
const checksum = section => crypto.createHash('sha256')
    .update(Object.keys(section.files).sort().map(file => file + ':' + section.files[file]).join('|'))
    .update(section.prerequisites?.length ? '|prerequisites:' + JSON.stringify(section.prerequisites) : '').digest('hex');

test('service refresh permission resolves to exactly one active Promotion catalogue definition', () => {
    assert.deepEqual(route.authTokenTypes, ['service']);
    const matches = Object.values(records).filter(row => row.code === route.permission);
    assert.equal(matches.length, 1, 'Refresh route requires an imported permission definition');
    assert.equal(matches[0].active, true);
    assert.equal(matches[0].ownerModule, 'promotion');
    for (const name of ['promotionUserGroupData', 'promotionBusinessAccessGroupData']) {
        const groups = require('../data/init-v001/records/identity/' + name);
        for (const group of Object.values(groups)) assert.ok(!group.permissions.includes(route.permission));
    }
});

test('governed v001 catalogue bytes and owner prerequisite pins match', () => {
    const section = manifest.sections.permissionCatalogue;
    assert.equal(section.sourceRoot, 'init-v001');
    const header = require('../data/init-v001/headers/identity/promotionPermissionHeader');
    assert.equal(header.profile.promotionPermission.options.operation, 'ensureReferenceAll');
    for (const [file, hash] of Object.entries(section.files)) {
        assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '../data', file))).digest('hex'), hash);
    }
    for (const dependent of Object.values(manifest.sections)) for (const pin of dependent.prerequisites || []) {
        if (pin.moduleName === 'promotion') {
            const target = manifest.sections[pin.sectionCode];
            assert.equal(pin.version, target.version);
            assert.equal(pin.checksum, checksum(target));
        }
    }
});
