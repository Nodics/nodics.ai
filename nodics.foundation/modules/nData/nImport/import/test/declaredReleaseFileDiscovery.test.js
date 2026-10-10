/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module import/test/declaredReleaseFileDiscovery @description Preserves manifest-qualified sibling paths sharing basenames without importing unselected siblings. @layer test @owner import */
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const utility = require('../src/service/import/defaultImportUtilityService');

test('governed discovery collects exact paths before grouping same-named files', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-declared-discovery-'));
    const releases = ['first', 'second', 'unselected'].map(section => ({ moduleName: 'owner', sourceRoot: 'sample-v001',
        declaredFiles: ['headers/sharedHeader.js', 'records/sharedData.js'].map(file => 'sample-v001/' + section + '/' + file) }));
    for (const release of releases) for (const file of release.declaredFiles) {
        const target = path.join(root, 'data', file);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, 'module.exports = {};\n');
    }
    global.NODICS = { getRawModule: () => ({ name: 'owner', path: root }) };
    try {
        for (const [folder, key, index] of [['headers', 'sharedHeader', 0], ['data', 'sharedData_js', 1]]) {
            const discover = folder === 'headers' ? 'getSystemDataHeaders' : 'getSystemDataFiles';
            const selected = await utility[discover](['owner'], 'sample', [releases[0]]);
            assert.deepEqual(selected[key], [path.join(root, 'data', releases[0].declaredFiles[index])]);
            const layered = await utility[discover](['owner'], 'sample', releases.slice(0, 2));
            assert.deepEqual(layered[key], releases.slice(0, 2).map(release => path.join(root, 'data', release.declaredFiles[index])));
            assert.equal(JSON.stringify(layered).includes('unselected'), false);
        }
        assert.throws(() => utility.declaredReleaseFiles(['owner'], [{ moduleName: 'owner', declaredFiles: ['../headers/escapeHeader.js'] }], 'headers'));
        assert.throws(() => utility.declaredReleaseFiles(['owner'], [{ moduleName: 'owner', declaredFiles: ['sample-v001/headers/missingHeader.js'] }], 'headers'));
    } finally {
        delete global.NODICS;
        fs.rmSync(root, { recursive: true, force: true });
    }
});
