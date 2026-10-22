/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nodics.docs/test/sourceEvidenceForwardReleases @description Verifies exact source-citation corrections, frozen predecessors and truthful unpublished owner successors. @layer test @owner nodics.docs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const contract = require('../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
const owners = [
    'nodics.commerce/modules/baseCommerce/modules/shoppingList',
    'nodics.platform/modules/installer'
];

/** Replaces only the reviewed obsolete citation, preserving every other authored value. */
function replaceCitation(value, from, to) {
    if (typeof value === 'string') return value.replaceAll(from, to);
    if (Array.isArray(value)) return value.map(item => replaceCitation(item, from, to));
    if (value && typeof value === 'object')
        return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, replaceCitation(child, from, to)]));
    return value;
}

for (const owner of owners) test(owner + ': source correction uses an immutable forward release with genuine provenance', () => {
    const ownerRoot = path.join(root, owner);
    const fixture = require(path.join(ownerRoot, 'test/fixtures/frozenDocumentationSourceEvidence.json'));
    const selected = require(path.join(ownerRoot, 'data/manifest.json')).sections.documentation;
    assert.equal(selected.version, '0.0.2');
    assert.equal(selected.contentPath, 'docs-v002');
    contract.validateGeneration(fixture.frozen, selected);
    assert.throws(() => contract.validateGeneration(fixture.frozen, { ...selected, version: fixture.frozen.version }));
    assert.deepEqual(selected.includes, fixture.frozen.includes);
    assert.deepEqual(selected.referenceCatalogues, fixture.frozen.referenceCatalogues);
    for (const section of [fixture.frozen, selected]) {
        assert.equal(contract.releaseChecksum(section.generatedHashes), section.releaseChecksum);
        for (const [file, expected] of Object.entries(section.generatedHashes))
            assert.equal(contract.sha256(fs.readFileSync(path.join(ownerRoot, 'data', file))), expected, file);
    }
    const records = (section, suffix) => Object.keys(section.generatedHashes)
        .filter(file => file.endsWith(suffix + 'Data.js'))
        .flatMap(file => Object.values(require(path.join(ownerRoot, 'data', file))));
    const components = records(selected, 'Component');
    const oldComponents = records(fixture.frozen, 'Component');
    const metadata = records(selected, 'PageMetadata');
    const search = records(selected, 'SearchMetadata');
    const { from, to } = fixture.citationReplacement;
    for (const old of oldComponents.filter(row => row.properties?.blocks)) {
        const current = components.find(row => row.code === old.code).properties;
        assert.deepEqual(current.blocks, replaceCitation(old.properties.blocks, from, to));
        assert.deepEqual(current.sourceEvidence, replaceCitation(old.properties.sourceEvidence, from, to));
        assert.deepEqual(current.headings, old.properties.headings);
        assert.equal(current.route, old.properties.route);
        assert.equal(current.lifecycleState, 'STAGED');
        for (const evidence of current.sourceEvidence) contract.validateSourceEvidence(ownerRoot, evidence);
        const page = metadata.find(row => row.documentId === current.code);
        assert.equal(page.sourcePath, current.source.path);
        assert.equal(page.sourceChecksum, current.source.checksum);
        const mode = fixture.articles.find(row => row.id === current.code).digestMode;
        const text = contract.documentationText(current.blocks);
        const body = mode === 'blocksJSON' ? JSON.stringify(current.blocks) :
            mode === 'titledText' ? '# ' + current.title + '\n\n' + text : text;
        assert.equal(current.source.checksum, contract.sha256(body));
        assert.equal(search.find(row => row.targetCode === page.code).searchText, current.searchText);
    }
    const targets = new Map(Object.keys(selected.generatedHashes).filter(file =>
        file.includes('/records/') && file.endsWith('Data.js') && !file.endsWith('PublicationStateData.js'))
        .flatMap(file => Object.values(require(path.join(ownerRoot, 'data', file))).map(row => [row.code, row])));
    const oldStates = records(fixture.frozen, 'PublicationState');
    for (const state of records(selected, 'PublicationState')) {
        assert.equal(state.author, oldStates.find(row => row.code === state.code).author);
        assert.ok(state.author);
        assert.equal(state.lifecycleState, 'STAGED');
        assert.equal(state.stagedVersion, selected.version);
        assert.deepEqual(state.auditTrail, []);
        for (const key of ['actor', 'reviewer', 'approver', 'publisher', 'onlineVersion'])
            assert.equal(Object.hasOwn(state, key), false, state.code + ':' + key);
        assert.equal(state.checksum, contract.sha256(JSON.stringify(targets.get(state.targetCode))));
    }
});

test('replacement citations point to actual owner authority rather than placeholders', () => {
    const groups = Object.values(require('../../nodics.platform/modules/profile/data/init-v001/records/identity/profileUserGroupData'));
    assert(groups.find(group => group.code === 'customerUserGroup').permissions.includes('commerce.shoppingList.own'));
    const installer = fs.readFileSync(path.join(root, owners[1], 'llm/contracts/installer-api-scope-contract.md'), 'utf8');
    assert.match(installer, /Current read-only APIs must not execute shell commands, mutate repositories/);
    assert.match(installer, /Profile remains the permission authority/);
    assert.match(installer, /POST \/nodics\/installer\/v0\/evidence\/read/);
});
