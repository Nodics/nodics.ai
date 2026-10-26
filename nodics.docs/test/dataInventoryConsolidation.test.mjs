/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

/** @description Guards the selected documentation baseline and preserved historical identities without importing or publishing records. @owner nodics.docs @layer test */
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = path.join(root, 'data');
const manifest = require('../data/manifest.json');
const contract = require('../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');

test('root documentation ships only selected files with exact current seals', () => {
    const selected = new Set();
    assert.equal(manifest.retainedRoots, undefined);
    for (const section of Object.values(manifest.sections)) {
        assert.equal(section.retainedRoots, undefined);
        assert.equal(section.contentPath, 'docs-v001');
        for (const [file, checksum] of Object.entries(section.generatedHashes)) {
            selected.add(file);
            assert.equal(contract.sha256(fs.readFileSync(path.join(data, file))), checksum, file);
        }
        assert.equal(contract.releaseChecksum(section.generatedHashes), section.releaseChecksum);
    }
    const actual = fs.readdirSync(data, {recursive: true})
        .filter(file => file !== 'manifest.json' && fs.statSync(path.join(data, file)).isFile());
    assert.deepEqual(actual.sort(), [...selected].sort());
    assert.deepEqual(manifest.sections.documentation.generatedHashes, manifest.sections.foundation.generatedHashes);
});

test('selected families preserve predecessor identities exactly once', () => {
    const historical = path.join(root, 'test/fixtures/unreleasedPredecessor/docs-v001/records/documentation');
    const selected = Object.keys(manifest.sections.foundation.generatedHashes);
    for (const file of fs.readdirSync(historical)) {
        const family = file.match(/^nodicsDocumentation(.+)Data\.js$/)[1];
        const current = selected.filter(file => file.includes('/records/') && file.endsWith(family + 'Data.js'))
            .flatMap(file => Object.values(require(path.join(data, file))));
        const codes = current.map(record => record.code);
        assert.equal(codes.length, new Set(codes).size, family + ': duplicate current record');
        for (const record of Object.values(require(path.join(historical, file))))
            assert.ok(codes.includes(record.code), family + ': missing predecessor ' + record.code);
    }
});
