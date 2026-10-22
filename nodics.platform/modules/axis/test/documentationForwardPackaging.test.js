/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module axis/test/documentationForwardPackaging
 * @description Pins frozen predecessor bytes and validates source-only forward CMS projections.
 * @owner axis
 * @layer test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const contract = require('../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
const evidence = require('./fixtures/frozenDocumentationPackaging.json');
const root = path.resolve(__dirname, '..');
const selected = require('../data/manifest.json').sections.documentation;
const groups = {};
for (const file of Object.keys(selected.generatedHashes)) {
    if (file.includes('/records/documentation/') && file.endsWith('Data.js')) {
        groups[path.basename(file).replace('axisDocumentation', '').replace('Data.js', '')] =
            Object.values(require(path.join(root, 'data', file)));
    }
}

test('frozen bytes and selected forward paths obey the canonical immutable generation contract', () => {
    for (const [file, hash] of Object.entries(evidence.frozen.generatedHashes)) {
        assert.equal(contract.sha256(fs.readFileSync(path.join(root, 'data', file))), hash, file);
        assert.equal(Object.hasOwn(selected.generatedHashes, file), false, file);
    }
    assert.equal(selected.version, '0.0.2');
    assert.equal(selected.contentPath, 'docs-v002');
    assert.equal(selected.sourceAuthority, 'data/' + selected.contentPath + '/records/documentation');
    assert.equal(contract.validateGeneration(evidence.frozen, selected), selected);
    assert.throws(() => contract.validateGeneration(evidence.frozen,
        {...selected, version: evidence.frozen.version}), {code: 'ERR_TOOL_DOC_00006'});
    const first = Object.keys(evidence.frozen.generatedHashes)[0];
    const reused = {...selected.generatedHashes, [first]: '0'.repeat(64)};
    assert.throws(() => contract.validateGeneration(evidence.frozen,
        {...selected, generatedHashes: reused, releaseChecksum: contract.releaseChecksum(reused)}),
        {code: 'ERR_TOOL_DOC_00006'});
    assert.doesNotThrow(() => contract.validateDataRelease(root));
});

test('selected articles preserve reviewed blocks and derive exact owner source metadata', () => {
    const articles = groups.Component.filter(row => Array.isArray(row.properties?.blocks));
    assert.equal(articles.length, evidence.articles.length);
    for (const original of evidence.articles) {
        const row = articles.find(item => item.code === original.componentCode);
        assert.ok(row, original.id);
        const p = row.properties;
        assert.equal(p.code, original.id);
        assert.equal(p.route, original.route);
        assert.equal(contract.sha256(JSON.stringify(p.blocks)), original.blocksChecksum);
        const migration = original.sourceEvidenceMigration;
        assert.ok(migration, original.id);
        assert.equal(contract.sha256(JSON.stringify(migration.original)), original.evidenceChecksum);
        assert.equal(contract.sha256(JSON.stringify(p.sourceEvidence)), migration.selectedChecksum);
        const registerFile = path.join(root, migration.register);
        assert.equal(contract.sha256(fs.readFileSync(registerFile)), migration.registerChecksum);
        const register = JSON.parse(fs.readFileSync(registerFile));
        for (const retired of migration.retired) {
            assert.ok(register.sources.some(source => source.evidence === retired &&
                source.destinationRoute === p.route && source.evidenceStatus === 'retired-after-verified-migration'));
            assert.equal(p.sourceEvidence.includes(retired), false);
        }
        assert.ok(p.sourceEvidence.includes(p.source.path));
        const body = contract.documentationText(p.blocks);
        const text = original.digestMode === 'titledText' ? '# ' + p.title + '\n\n' + body : body;
        const checksum = contract.sha256(original.digestMode === 'blocksJSON' ? JSON.stringify(p.blocks) : text);
        const words = contract.countWords(text);
        assert.equal(p.version, selected.version);
        assert.equal(p.lifecycleState, original.lifecycleState);
        assert.equal(p.source.path, selected.sourceAuthority + '/axisDocumentationComponentData.js');
        assert.equal(p.source.sourcePath, p.source.path);
        assert.equal(p.source.checksum, checksum);
        assert.equal(p.source.wordCount, words);
        const meta = groups.PageMetadata.find(item => item.code === original.metadataCode);
        assert.ok(meta, original.id);
        assert.equal(meta.sourcePath, p.source.path);
        assert.equal(meta.sourceChecksum, checksum);
        assert.equal(meta.sourceWordCount, words);
        assert.equal(meta.wordCount, words);
        assert.deepEqual(meta.headings, p.headings);
        assert.deepEqual(meta.sourceEvidence, p.sourceEvidence);
        const search = groups.SearchMetadata.find(item => item.targetType === 'PAGE' && item.targetCode === meta.code);
        assert.ok(search, original.id);
        assert.ok(search.searchText.endsWith(p.searchText), original.id);
        for (const source of p.sourceEvidence) assert.ok(fs.existsSync(path.resolve(root, source)), source);
    }
});

test('selected target seals remain unpublished without invented approvals or runtime adoption', () => {
    const targets = new Map(Object.entries(groups).filter(([kind]) => kind !== 'PublicationState')
        .flatMap(([, rows]) => rows.map(row => [row.code, row])));
    for (const row of groups.PublicationState) {
        assert.ok(targets.has(row.targetCode), row.targetCode);
        assert.equal(row.checksum, contract.sha256(JSON.stringify(targets.get(row.targetCode))), row.code);
        assert.equal(row.stagedVersion, selected.version);
        assert.equal(row.validationResult.sourceAuthority, selected.sourceAuthority);
        assert.deepEqual(row.auditTrail, []);
        for (const field of ['onlineVersion', 'reviewer', 'approver', 'publisher'])
            assert.equal(Object.hasOwn(row, field), false, row.code + ':' + field);
    }
    for (const rows of Object.values(groups)) for (const row of rows) {
        for (const state of [row, row.properties].filter(Boolean)) {
            for (const field of ['lifecycleState', 'deliveryState'])
                if (Object.hasOwn(state, field)) assert.ok(['DRAFT', 'STAGED'].includes(state[field]), row.code);
        }
    }
    assert.equal(selected.destinationRole, 'WCMS_STAGED');
    assert.equal(selected.initialPublicationPolicy, 'ADMIN_INITIATED');
    assert.equal(selected.installationPolicy, 'OPTIONAL_AXIS_INITIATED');
    assert.equal(selected.releaseChecksum, contract.releaseChecksum(selected.generatedHashes));
});
