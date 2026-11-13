/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module nodics.docs/test/documentationCompositionForward @description Guards the composition-only forward version, unchanged shared payloads and native recursive checksum without asserting installed or Online state. @owner nodics.docs @layer test */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contract = require('../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
const previous = require('./fixtures/documentationCompositionBefore003.json').sections;
const current = require('./fixtures/documentationCompositionBefore004.json').sections;
const active = require('../data/manifest.json').sections;

test('library 0.0.3 advances only the composition version and preserves shared Foundation 0.0.2', () => {
    assert.equal(previous.documentation.version, '0.0.2');
    assert.equal(current.documentation.version, '0.0.3');
    assert.deepEqual({ ...current.documentation, version: previous.documentation.version }, previous.documentation);
    assert.deepEqual(current.foundation, previous.foundation);
    assert.equal(current.foundation.version, '0.0.2');
    assert.equal(current.documentation.includes.length, 64);
    contract.validateGeneration(previous.documentation, current.documentation);
    for (const [file, checksum] of Object.entries(previous.documentation.generatedHashes)) {
        assert.equal(contract.sha256(fs.readFileSync(path.join(root, 'data', file))), checksum, file);
    }
});

test('native content-pack inspection includes current owner versions in its recursive checksum', () => {
    const inspected = contract.readDocumentationRelease(root);
    assert.equal(inspected.version, '0.0.6');
    assert.deepEqual(active.foundation, current.foundation);
    assert.deepEqual({ ...active.documentation, version: current.documentation.version }, current.documentation);
    contract.validateGeneration(current.documentation, active.documentation);
    const workflow = inspected.children.find(child => child.manifest.pack === 'workflow');
    const backoffice = inspected.children.find(child => child.manifest.pack === 'backoffice');
    const communication = inspected.children.find(child => child.manifest.pack === 'commsCore');
    assert.equal(workflow.version, '0.0.3');
    assert.equal(backoffice.version, '0.0.3');
    assert.equal(communication.version, '0.0.3');
    assert.equal(communication.manifest.sourceAuthority, 'data/docs-v003/records/documentation');
    for (const [pack, version] of [['bpm', '0.0.3'], ['installer', '0.0.4'], ['cronjob', '0.0.4']]) {
        assert.equal(inspected.children.find(child => child.manifest.pack.toLowerCase() === pack)?.version, version);
    }
    assert.equal(inspected.children.length, 64);
    assert.notEqual(inspected.checksum, current.documentation.releaseChecksum);
    assert.equal(contract.readDocumentationRelease(root).checksum, inspected.checksum);
    const validated = contract.validateDataRelease(root);
    assert.equal(new Set(validated.documents.map(document => document.id)).size, validated.documents.length);
});
