/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module nodics.docs/test/documentationProvenanceForward @description Guards exact article intent, immutable predecessor bytes, truthful Draft boundaries and current provenance for capability corrections. @owner nodics.docs @layer test */
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
    "nodics.commerce/modules/digitalCommerce/modules/digitalCore",
    "nodics.commerce/modules/baseCommerce/modules/shoppingList",
    "nodics.foundation/modules/nConfig",
    "nodics.foundation/modules/nData/nImport/import",
    "nodics.foundation/modules/nDatabase/database",
    "nodics.foundation/modules/nbpm",
    "nodics.platform/modules/profile",
    "nodics.process/modules/cronjob",
    "nodics.wcms/modules/cms",
    "nodics.wcms/modules/media",
    "nodics.location/modules/locationMap"
];
for (const owner of owners) test(owner + ': provenance successor preserves intent and immutable history', () => {
    const ownerRoot = path.join(root, owner);
    const fixture = require(path.join(ownerRoot, 'test/fixtures/documentationProvenancePredecessor.json'));
    const previous = fixture.sections.documentation;
    // Later editorial releases retain this exact provenance-only successor as a frozen fixture.
    const current = fixture.successorSnapshot
        ? require(path.join(ownerRoot, fixture.successorSnapshot + '.json')).sections.documentation
        : require(path.join(ownerRoot, 'data/manifest.json')).sections.documentation;
    const currentFile = file => {
        const frozen = fixture.successorSnapshot && path.join(ownerRoot, fixture.successorSnapshot, file);
        return frozen && fs.existsSync(frozen) ? frozen : path.join(ownerRoot, 'data', file);
    };
    const historical = file => {
        const snapshot = path.join(ownerRoot, 'test/fixtures/documentationProvenancePredecessor', file);
        return fs.existsSync(snapshot) ? snapshot : path.join(ownerRoot, 'data', file);
    };
    assert.equal(current.version, fixture.successorVersion);
    assert.notEqual(current.version, previous.version);
    contract.validateGeneration(previous, current);
    assert.throws(() => contract.validateGeneration(previous, { ...current, version: previous.version }));
    for (const [file, checksum] of Object.entries(previous.generatedHashes))
        assert.equal(contract.sha256(fs.readFileSync(historical(file))), checksum, file);
    for (const [file, checksum] of Object.entries(current.generatedHashes))
        assert.equal(contract.sha256(fs.readFileSync(currentFile(file))), checksum, file);
    assert.equal(contract.releaseChecksum(current.generatedHashes), current.releaseChecksum);
    assert.deepEqual(current.includes, previous.includes);
    assert.deepEqual(current.referenceCatalogues, previous.referenceCatalogues);
    const rows = (section, suffix, resolver) => Object.keys(section.generatedHashes)
        .filter(file => file.endsWith(suffix + 'Data.js')).flatMap(file => Object.values(require(resolver(file))));
    const resolveCurrent = currentFile;
    const oldComponents = rows(previous, 'Component', historical);
    const components = rows(current, 'Component', resolveCurrent);
    const pages = rows(current, 'PageMetadata', resolveCurrent);
    const oldPages = rows(previous, 'PageMetadata', historical);
    for (const old of oldComponents) {
        const record = components.find(row => row.code === old.code);
        assert(record);
        if (!old.properties?.blocks) { assert.deepEqual(record, old); continue; }
        const article = record.properties;
        const withoutProvenance = value => {
            const { source, version, lifecycleState, ...intent } = value;
            return intent;
        };
        assert.deepEqual(withoutProvenance(article), withoutProvenance(old.properties));
        assert.equal(article.lifecycleState, old.properties.lifecycleState === 'DRAFT' ? 'DRAFT' : 'STAGED');
        assert.deepEqual(article.blocks, old.properties.blocks);
        assert.deepEqual(article.sourceEvidence, old.properties.sourceEvidence);
        const body = contract.documentationText(article.blocks);
        assert([body, '# ' + article.title + '\n\n' + body, JSON.stringify(article.blocks)]
            .some(value => contract.sha256(value) === article.source.checksum), article.code);
        assert([contract.countWords(body), contract.countWords('# ' + article.title + '\n\n' + body)]
            .includes(article.source.wordCount), article.code);
        const page = pages.find(row => row.articleComponent === record.code);
        assert.equal(page.sourcePath, article.source.path);
        assert.equal(article.source.path, article.source.sourcePath);
        assert.equal(page.sourceChecksum, article.source.checksum);
        assert.equal(page.sourceWordCount, article.source.wordCount);
        assert.equal(page.wordCount, article.source.wordCount);
        assert.deepEqual(page.headings, article.headings);
        assert.equal(page.lifecycleState, oldPages.find(row => row.code === page.code).lifecycleState === 'DRAFT' ? 'DRAFT' : 'STAGED');
        for (const field of ['code', 'title', 'summary', 'targetPage', 'targetRoute', 'articleComponent', 'accessPolicy'])
            assert.deepEqual(page[field], oldPages.find(row => row.code === page.code)[field]);
    }
    const targets = new Map(Object.keys(current.generatedHashes)
        .filter(file => file.includes('/records/') && file.endsWith('Data.js') && !file.endsWith('PublicationStateData.js'))
        .flatMap(file => Object.values(require(resolveCurrent(file))).map(row => [row.code, row])));
    const oldStates = rows(previous, 'PublicationState', historical);
    for (const state of rows(current, 'PublicationState', resolveCurrent)) {
        const old = oldStates.find(row => row.code === state.code);
        assert.equal(state.author, old.author);
        assert.equal(state.lifecycleState, old.lifecycleState === 'DRAFT' ? 'DRAFT' : 'STAGED');
        assert.equal(state.checksum, contract.sha256(JSON.stringify(targets.get(state.targetCode))));
        for (const field of ['actor', 'reviewer', 'approver', 'publisher', 'onlineVersion']) assert.equal(Object.hasOwn(state, field), false);
    }
    const oldSearch = rows(previous, 'SearchMetadata', historical);
    for (const search of rows(current, 'SearchMetadata', resolveCurrent)) {
        const old = oldSearch.find(row => row.code === search.code);
        const { lifecycleState: currentState, ...currentIntent } = search;
        const { lifecycleState: previousState, ...previousIntent } = old;
        assert.deepEqual(currentIntent, previousIntent);
        const page = pages.find(page => page.code === search.targetCode);
        assert.equal(currentState, search.targetType === 'PAGE' && page ? page.lifecycleState : previousState);
    }
    // Stable pages, routes and navigation are not reauthored by a metadata correction.
    for (const suffix of ['Node', 'Page', 'Route'])
        assert.deepEqual(rows(current, suffix, resolveCurrent), rows(previous, suffix, historical));
});
