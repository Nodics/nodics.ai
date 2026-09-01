/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/test/eWasteDataManifestContract @description Verifies eWaste data manifest integrity and destination contract. @layer test @owner eWaste */
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const dataRoot = path.resolve(__dirname, '../data');
const manifest = require(path.join(dataRoot, 'manifest.json'));
const section = manifest.sections['core-reference'];

assert.strictEqual(manifest.contractVersion, 2);
assert.strictEqual(manifest.module, 'eWaste');
assert.strictEqual(section.kind, 'DATA_RELEASE');
assert.strictEqual(section.dataType, 'core');
assert.strictEqual(section.owningDomain, 'waste');
assert.strictEqual(section.destinationRole, 'WASTE');
assert.strictEqual(section.lifecycle, 'REFERENCE');
assert.strictEqual(section.sourceRoot, 'core-v001');

Object.keys(section.files).forEach(function (relativeFilePath) {
    let absoluteFilePath = path.join(dataRoot, relativeFilePath);
    let actualHash = crypto.createHash('sha256').update(fs.readFileSync(absoluteFilePath)).digest('hex');
    assert.strictEqual(actualHash, section.files[relativeFilePath], relativeFilePath + ' checksum must match manifest');
});

assert.strictEqual(Object.keys(section.files).length, 20);

console.log('eWaste data manifest contract validated');
