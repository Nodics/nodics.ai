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
const released007 = require('./fixtures/documentationCompositionBefore008.json').sections;
const before007 = require('./fixtures/documentationCompositionBefore007.json').sections;
const cacheRoot = path.resolve(root, '../nodics.foundation/modules/nCache/cache');
const cacheBefore003 = require(path.join(cacheRoot, 'test/fixtures/documentationCompositionBefore003.json')).sections.documentation;

test('cache 0.0.3 and library 0.0.7 advance composed identities without rewriting article payloads', () => {
    const cache = require(path.join(cacheRoot, 'data/manifest.json')).sections.documentation;
    assert.equal(cacheBefore003.version, '0.0.2');
    assert.equal(cache.version, '0.0.3');
    assert.deepEqual({ ...cache, version: cacheBefore003.version }, cacheBefore003);
    assert.equal(before007.documentation.version, '0.0.6');
    assert.equal(released007.documentation.version, '0.0.7');
    assert.deepEqual({ ...released007.documentation, version: before007.documentation.version }, before007.documentation);
    assert.deepEqual(released007.foundation, before007.foundation);
    assert.equal(released007.foundation.version, '0.0.3');
    contract.validateGeneration(cacheBefore003, cache);
    contract.validateGeneration(before007.documentation, released007.documentation);
    const library = contract.readDocumentationRelease(root);
    const child = library.children.find(item => item.manifest.pack === 'cache');
    const standalone = contract.readDocumentationRelease(cacheRoot);
    assert.equal(child.version, cache.version);
    assert.equal(child.checksum, standalone.checksum);
    assert.equal(standalone.children[0].version, active.foundation.version);
    assert.equal(standalone.children[0].checksum, active.foundation.releaseChecksum);
});

test('library 0.0.3 advances only the composition version and preserves shared Foundation 0.0.2', () => {
    assert.equal(previous.documentation.version, '0.0.2');
    assert.equal(current.documentation.version, '0.0.3');
    assert.deepEqual({ ...current.documentation, version: previous.documentation.version }, previous.documentation);
    assert.deepEqual(current.foundation, previous.foundation);
    assert.equal(current.foundation.version, '0.0.2');
    assert.equal(current.documentation.includes.length, 64);
    contract.validateGeneration(previous.documentation, current.documentation);
    // These frozen selections describe the historical composition-only change.
    // The current unreleased v001 source has since advanced independently.
    assert.deepEqual(current.documentation.generatedHashes, previous.documentation.generatedHashes);
    assert.equal(contract.releaseChecksum(previous.documentation.generatedHashes), previous.documentation.releaseChecksum);
    assert.equal(contract.releaseChecksum(current.documentation.generatedHashes), current.documentation.releaseChecksum);
});

test('native content-pack inspection includes current owner versions in its recursive checksum', () => {
    const inspected = contract.readDocumentationRelease(root);
    assert.equal(inspected.version, '0.0.8');
    assert.equal(active.foundation.version, '0.0.3');
    assert.deepEqual(active.documentation.includes, current.documentation.includes);
    assert.equal(active.documentation.pack, current.documentation.pack);
    for (const section of [active.foundation, active.documentation]) {
        assert.equal(section.contentPath, 'docs-v001');
        for (const [file, checksum] of Object.entries(section.generatedHashes)) {
            assert.equal(contract.sha256(fs.readFileSync(path.join(root, 'data', file))), checksum, file);
        }
        assert.equal(contract.releaseChecksum(section.generatedHashes), section.releaseChecksum);
    }
    const workflow = inspected.children.find(child => child.manifest.pack === 'workflow');
    const backoffice = inspected.children.find(child => child.manifest.pack === 'backoffice');
    const communication = inspected.children.find(child => child.manifest.pack === 'commsCore');
    assert.equal(workflow.version, '0.0.3');
    assert.equal(backoffice.version, '0.0.5');
    assert.equal(communication.version, '0.0.3');
    assert.equal(communication.manifest.sourceAuthority, 'data/docs-v001/records/documentation');
    for (const [pack, version] of [['bpm', '0.0.3'], ['installer', '0.0.5'], ['cronjob', '0.0.5'], ['import', '0.0.3'], ['media', '0.0.3']]) {
        assert.equal(inspected.children.find(child => child.manifest.pack.toLowerCase() === pack)?.version, version);
    }
    assert.equal(inspected.children.length, 64);
    assert.notEqual(inspected.checksum, current.documentation.releaseChecksum);
    assert.equal(contract.readDocumentationRelease(root).checksum, inspected.checksum);
    const validated = contract.validateDataRelease(root);
    assert.equal(new Set(validated.documents.map(document => document.id)).size, validated.documents.length);
});

test('source corrections advance the library without changing its shared Foundation payload', () => {
    assert.deepEqual({ ...active.documentation, version: released007.documentation.version }, released007.documentation);
    assert.deepEqual(active.foundation, released007.foundation);
    contract.validateGeneration(released007.documentation, active.documentation);
});
