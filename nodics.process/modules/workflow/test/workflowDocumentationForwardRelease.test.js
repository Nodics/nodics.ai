/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module workflow/test/workflowDocumentationForwardRelease @description Guards truthful human review and original trigger command recovery guidance in canonical CMS source; source checks do not establish Online publication. @owner workflow @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const owner = path.resolve(__dirname, '..');
const contract = require('../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
const selected = { ...contract.readDocumentationRelease(owner), children: [] };
const family = suffix => contract.readReleaseRecords(selected, suffix).records;
const components = family('Component');
const article = id => components.find(record => record.properties.code === id).properties;
const previous = require('./fixtures/documentationFrozen001.json').sections.documentation;
const historicalFile = file => {
    const fixture = path.join(owner, 'test/fixtures/release001', file);
    return fs.existsSync(fixture) ? fixture : path.join(owner, 'data', file);
};
const historical = suffix => Object.keys(previous.generatedHashes).filter(file => file.endsWith(suffix + 'Data.js'))
    .flatMap(file => Object.values(require(historicalFile(file))));

test('the forward selection preserves all eight predecessor payloads and one canonical shipping record family', () => {
    const next = selected.manifest;
    assert.equal(previous.version, '0.0.1');
    assert.equal(next.version, '0.0.3');
    assert.equal(Object.keys(previous.generatedHashes).length, 8);
    for (const [file, hash] of Object.entries(previous.generatedHashes)) {
        assert.equal(contract.sha256(fs.readFileSync(historicalFile(file))), hash, file);
        if (!next.generatedHashes[file]) assert.equal(fs.existsSync(path.join(owner, 'data', file)), false, file);
    }
    contract.validateGeneration(previous, next);
    assert.throws(() => contract.validateGeneration(previous, { ...next, version: previous.version }), /Immutable documentation release changed/);
    assert.deepEqual(next.includes, previous.includes);
    assert.equal(next.contentPath, 'docs-v001');
    for (const suffix of ['Node', 'Page', 'Route']) assert.deepEqual(family(suffix), historical(suffix));
    for (const suffix of ['Component', 'PageMetadata', 'SearchMetadata', 'PublicationState']) {
        assert.deepEqual(family(suffix).map(row => row.code), historical(suffix).map(row => row.code));
    }
    const header = Object.keys(next.generatedHashes).filter(file => file.includes('/headers/'));
    assert.equal(header.length, 1);
    const after = require(path.join(owner, 'data', header[0]));
    const before = require(historicalFile(Object.keys(previous.generatedHashes).find(file => file.includes('/headers/'))));
    const dispatch = header => Object.entries(header).flatMap(([module, entries]) => Object.values(entries).map(entry => ({
        module, schemaName: entry.options.schemaName, operation: entry.options.operation,
        prefix: entry.options.dataFilePrefix.replace(/Release00[23]/, ''), query: entry.query
    })));
    assert.deepEqual(dispatch(after), dispatch(before));
    for (const entries of Object.values(after)) for (const entry of Object.values(entries)) {
        assert.equal(Object.keys(next.generatedHashes).filter(file => path.basename(file) === entry.options.dataFilePrefix + '.js').length, 1);
    }
});

test('only two article bodies change; all existing anchors, identities and other thirteen bodies are retained', () => {
    const changed = new Set(['process.first-human-task', 'process.scheduled-automation']);
    assert.equal(components.length, 15);
    for (const before of historical('Component')) {
        const after = components.find(row => row.code === before.code);
        const { properties: oldProperties, ...oldRecord } = before;
        const { properties: newProperties, ...newRecord } = after;
        assert.deepEqual(newRecord, oldRecord);
        for (const key of ['code', 'title', 'route', 'relatedPages']) assert.deepEqual(newProperties[key], oldProperties[key]);
        for (const heading of oldProperties.headings) assert.ok(newProperties.headings.some(current =>
            current.text === heading.text && current.anchor === heading.anchor && current.level === heading.level));
        if (!changed.has(oldProperties.code)) assert.deepEqual(newProperties.blocks, oldProperties.blocks);
        else assert.notDeepEqual(newProperties.blocks, oldProperties.blocks);
    }
});

test('selected article provenance, page metadata and search derive from exact current bodies', () => {
    const pages = family('PageMetadata');
    for (const page of pages) {
        const guide = components.find(row => row.code === page.articleComponent).properties;
        const body = '# ' + page.title + '\n\n' + contract.documentationText(guide.blocks);
        assert.equal(guide.source.checksum, contract.sha256(body));
        assert.equal(guide.source.wordCount, contract.countWords(body));
        assert.equal(page.sourceChecksum, guide.source.checksum);
        assert.equal(page.sourceWordCount, guide.source.wordCount);
        assert.equal(page.wordCount, guide.source.wordCount);
        assert.equal(page.sourcePath, guide.source.sourcePath);
        assert.ok(fs.existsSync(path.join(owner, page.sourcePath)));
        assert.deepEqual(page.sourceEvidence, guide.sourceEvidence);
        assert.deepEqual(page.headings, guide.headings);
        assert.equal(guide.lifecycleState, 'STAGED');
        assert.equal(guide.version, '0.0.2');
    }
    for (const id of ['process.first-human-task', 'process.scheduled-automation']) {
        const page = pages.find(page => page.documentId === id);
        const node = family('Node').find(node => node.targetDocumentationPage === page.code);
        const searches = family('SearchMetadata').filter(row => [node.code, page.code].includes(row.targetCode));
        assert.equal(searches.length, 2);
        assert.ok(searches.every(row => row.searchText === article(id).searchText));
    }
    const validated = contract.validateDataRelease(owner);
    assert.equal(validated.documents.filter(document => document.ownerRoot === owner).length, 15);
});

test('thirty-two changed review targets are staged with no fabricated Online or approval actor evidence', () => {
    const targets = [...family('PageMetadata'), ...family('SearchMetadata')].filter(row => row.lifecycleState === 'STAGED');
    assert.equal(targets.length, 32);
    const oldStates = historical('PublicationState');
    for (const state of family('PublicationState')) {
        const old = oldStates.find(row => row.code === state.code);
        const target = targets.find(row => row.code === state.targetCode);
        if (!target) { assert.deepEqual(state, old); continue; }
        assert.equal(state.lifecycleState, 'STAGED');
        const searchForward = require('./fixtures/documentationSearchPredecessor.json');
        assert.equal(state.stagedVersion, searchForward.changedSearchCodes.includes(state.targetCode) ? '0.0.3' : '0.0.2');
        assert.equal(state.author, old.author);
        assert.equal(state.checksum, contract.sha256(JSON.stringify(target)));
        assert.deepEqual(state.auditTrail, []);
        for (const field of ['onlineVersion', 'actor', 'reviewer', 'approver', 'publisher']) assert.equal(state[field], undefined);
        assert.equal(state.workflowRequired, true);
    }
    const config = require('../../../../nodics.docs/config/properties');
    assert.equal(config.cms.publication.baselines['docs-workflow'].releaseVersion, '0.0.3');
});

test('human task guide describes rights-based review without requester exclusion', () => {
    const body = contract.documentationText(article('process.first-human-task').blocks);
    assert.doesNotMatch(body, /cannot be the requester|no-self-review/);
    assert.match(body, /requesting human may also review/);
    assert.match(body, /requester identity remains audit provenance/);
});

test('trigger guide distinguishes original acknowledgement, current state, workflow completion and Cron timing', () => {
    const guide = article('process.scheduled-automation');
    const body = contract.documentationText(guide.blocks);
    for (const phrase of ['Inspect original receipt', 'Refresh relationships', '/operations/capabilities',
        'does not prove the original command was acknowledged', 'does not mean the workflow is complete',
        'reload or sign-out', 'commandReceipts.owners.workflow', 'Cron owns its timer']) assert.ok(body.includes(phrase), phrase);
    assert.ok(guide.blocks.some(block => block.kind === 'heading' && block.anchor === 'processScheduledAutomation-original-command-recovery'));
    assert.ok(guide.blocks.some(block => block.kind === 'table' && block.headers.includes('Evidence')));
});


test('search successor preserves installed 0.0.2 source and changes only thirteen lifecycle fields', () => {
    const frozen = require('./fixtures/documentationSearchPredecessor.json');
    const previous = frozen.sections.documentation;
    const resolve = file => {
        const snapshot = path.join(owner, 'test/fixtures/release002', file);
        return fs.existsSync(snapshot) ? snapshot : path.join(owner, 'data', file);
    };
    for (const [file, hash] of Object.entries(previous.generatedHashes))
        assert.equal(contract.sha256(fs.readFileSync(resolve(file))), hash, file);
    contract.validateGeneration(previous, selected.manifest);
    for (const suffix of ['Component', 'PageMetadata', 'Node', 'Page', 'Route']) {
        const file = Object.keys(previous.generatedHashes).find(file => file.endsWith(suffix + 'Data.js'));
        assert.deepEqual(family(suffix), Object.values(require(resolve(file))));
    }
    const oldFile = Object.keys(previous.generatedHashes).find(file => file.endsWith('SearchMetadataData.js'));
    const oldRows = Object.values(require(resolve(oldFile)));
    let changed = 0;
    for (const search of family('SearchMetadata')) {
        const old = oldRows.find(row => row.code === search.code);
        if (!frozen.changedSearchCodes.includes(search.code)) { assert.deepEqual(search, old); continue; }
        assert.deepEqual(search, { ...old, lifecycleState: 'STAGED' });
        assert.equal(search.lifecycleState, family('PageMetadata').find(page => page.code === search.targetCode).lifecycleState);
        changed++;
    }
    assert.equal(changed, 13);
});
