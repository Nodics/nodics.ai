/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module nodics.docs/test/postReleaseSourceCorrections @description Qualifies corrected operational guidance and exact current metadata without rewriting historical source evidence. @owner nodics.docs @layer test */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const contract = require('../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
const articles = new Map();
const cases = [
    ['nodics.foundation/modules/nData/nImport/import', 'documentationPolicyPredecessor', '0.0.3'],
    ['nodics.platform/modules/installer', 'documentationMetadataBefore005', '0.0.5'],
    ['nodics.wcms/modules/media', 'documentationCleanupBefore003', '0.0.3'],
    ['nodics.process/modules/cronjob', 'documentationExecutionBefore005', '0.0.5']
];

for (const [owner, fixture, version] of cases) test(owner + ': forward source correction preserves history and aligns current projections', () => {
    const dir = path.join(root, owner);
    const previous = require(path.join(dir, 'test/fixtures', fixture + '.json')).sections.documentation;
    const active = require(path.join(dir, 'data/manifest.json')).sections.documentation;
    assert.equal(active.version, version);
    contract.validateGeneration(previous, active);
    assert.throws(() => contract.validateGeneration(previous, { ...active, version: previous.version }));
    for (const [file, hash] of Object.entries(previous.generatedHashes))
        assert.equal(contract.sha256(fs.readFileSync(path.join(dir, 'test/fixtures', fixture, file))), hash, file);
    for (const [file, hash] of Object.entries(active.generatedHashes))
        assert.equal(contract.sha256(fs.readFileSync(path.join(dir, 'data', file))), hash, file);
    const rows = suffix => Object.keys(active.generatedHashes).filter(file => file.endsWith(suffix + 'Data.js'))
        .flatMap(file => Object.values(require(path.join(dir, 'data', file))));
    const targets = new Map(Object.keys(active.generatedHashes).filter(file => file.includes('/records/') &&
        file.endsWith('Data.js') && !file.endsWith('PublicationStateData.js'))
        .flatMap(file => Object.values(require(path.join(dir, 'data', file))).map(row => [row.code, row])));
    for (const row of rows('Component')) {
        const a = row.properties;
        if (!a?.blocks) continue;
        articles.set(a.code, a);
        const body = '# ' + a.title + '\n\n' + contract.documentationText(a.blocks);
        const headings = a.blocks.filter(block => block.kind === 'heading').map(({ text, anchor, level }) => ({ text, anchor, level }));
        assert.deepEqual(a.headings, headings, a.code);
        assert.equal(a.source.checksum, contract.sha256(body), a.code);
        assert.equal(a.source.wordCount, contract.countWords(body), a.code);
        assert.equal(a.version, version);
        const page = rows('PageMetadata').find(page => page.documentId === a.code);
        assert.deepEqual(page.headings, headings);
        assert.equal(page.sourceChecksum, a.source.checksum);
        assert.equal(page.wordCount, a.source.wordCount);
        assert.equal(page.sourceWordCount, a.source.wordCount);
        assert.equal(page.sourcePath, a.source.path);
        assert.ok(Object.hasOwn(active.generatedHashes, a.source.path.replace(/^data\//, '')));
        assert.equal(rows('SearchMetadata').find(row => row.targetCode === page.code).searchText, a.searchText);
    }
    for (const state of rows('PublicationState')) {
        assert.equal(state.checksum, contract.sha256(JSON.stringify(targets.get(state.targetCode))));
        assert.equal(state.stagedVersion, version);
        assert.equal(state.lifecycleState, 'STAGED');
        assert.deepEqual(state.auditTrail, []);
    }
    const defaults = require('../config/properties').cms.publication.baselines;
    assert.equal(defaults['docs-' + path.basename(owner)].releaseVersion, version);
    contract.validateDataRelease(dir);
});

test('operational instructions reflect enforcing owners and retain recovery limits', () => {
    const text = id => contract.documentationText(articles.get(id).blocks);
    assert.match(text('data.import-export-provider-guides'), /requires DefaultSchemaReadAccessPolicyService.applyExportPolicies/);
    assert.doesNotMatch(text('data.import-export-provider-guides'), /returns the cloned records without that additional transform/);
    assert.match(text('wcms.media-operations-runbook'), /cleanupLocations requires one current active RETIRED/);
    assert.match(text('wcms.media-operations-runbook'), /Missing, malformed or active reference evidence refuses removal/);
    assert.match(text('process.cronjob-data-authoring'), /configured cronjob.processTriggerConnection receives one authenticated POST/);
    assert.match(text('process.cronjob-data-authoring'), /STOPED when inactive, PAUSED when paused/);
    assert.match(text('installer.installed-runtime-application-builder'), /dry-run plan is not execution/);
});
