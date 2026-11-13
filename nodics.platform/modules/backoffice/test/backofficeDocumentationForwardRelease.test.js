/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module backoffice/test/backofficeDocumentationForwardRelease @description Guards forward metadata correction, frozen releases and source-only publication handoff. @layer test @owner backoffice */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.resolve(__dirname, '..');
const framework = path.resolve(root, '../../..');
const contract = require(path.join(framework, 'nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService'));
const previous = require('./fixtures/documentationFrozen001.json').sections.documentation;
const frozen002 = require('./fixtures/documentationFrozen002.json').sections.documentation;
const active = contract.readDocumentationRelease(root, 'documentation');
const next = require('./fixtures/documentationReviewPredecessor.json').sections.documentation;
const selected = { ...active, manifest: next, fileRoot: path.join(root, 'test/fixtures/documentationReviewPredecessor') };
const local = { ...selected, children: [] };
const historicalFile = file => {
    const fixture = path.join(root, 'test/fixtures/unreleasedPredecessor', file);
    return fs.existsSync(fixture) ? fixture : path.join(root, 'data', file);
};
const family = (release, suffix) => contract.readReleaseRecords(release, suffix).records;
const components = family(local, 'Component');
const original = suffix => Object.keys(previous.generatedHashes).filter(file => file.endsWith(suffix + 'Data.js'))
    .flatMap(file => Object.values(require(historicalFile(file))));
const axis = components.find(record => record.properties.code === 'applications.axis-setup-error-contracts').properties;
const file002 = file => {
    const fixture = path.join(root, 'test/fixtures/release002', file);
    return fs.existsSync(fixture) ? fixture : path.join(selected.fileRoot, file);
};
const records002 = suffix => Object.keys(frozen002.generatedHashes)
    .filter(file => file.endsWith(suffix + 'Data.js'))
    .flatMap(file => Object.values(require(file002(file))));

test('all eight frozen 0.0.2 payloads retain exact bytes and superseded files leave shipping data', () => {
    assert.equal(frozen002.version, '0.0.2');
    assert.equal(contract.releaseChecksum(frozen002.generatedHashes), '711722bc5cb4ef7000f9f4dd7be5327ac8c3790f7d4345c07892003d4cdfd455');
    assert.equal(Object.keys(frozen002.generatedHashes).length, 8);
    for (const [file, hash] of Object.entries(frozen002.generatedHashes)) {
        assert.equal(contract.sha256(fs.readFileSync(file002(file))), hash, file);
        if (!next.generatedHashes[file]) assert.equal(fs.existsSync(path.join(root, 'data', file)), false, file);
    }
});

test('0.0.3 changes only registry word counts and their unapproved staged review evidence', () => {
    for (const suffix of ['Component', 'Node', 'SearchMetadata', 'Page', 'Route']) {
        assert.deepEqual(family(local, suffix), records002(suffix), suffix);
    }
    const before = records002('PageMetadata');
    const after = family(local, 'PageMetadata');
    assert.deepEqual(after.map(record => record.code), before.map(record => record.code));
    for (const record of before) {
        const expected = structuredClone(record);
        if (record.documentId === 'platform.module-registry') {
            assert.equal(record.wordCount, 2395);
            assert.equal(record.sourceWordCount, 2395);
            expected.wordCount = expected.sourceWordCount = 2689;
        }
        assert.deepEqual(after.find(item => item.code === record.code), expected);
    }
    const states = family(local, 'PublicationState');
    assert.equal(states.length, records002('PublicationState').length);
    for (const state of records002('PublicationState')) {
        const expected = structuredClone(state);
        if (state.targetCode === 'nodicsDocsMetadataplatformModuleRegistry') {
            expected.stagedVersion = '0.0.3';
            expected.checksum = contract.sha256(JSON.stringify(after.find(record => record.code === state.targetCode)));
        }
        assert.deepEqual(states.find(item => item.code === state.code), expected);
    }
    const sameVersion = { ...next, version: '0.0.2' };
    assert.throws(() => contract.validateGeneration(frozen002, sameVersion), /Immutable documentation release changed/);
    const staleSeal = { ...next, releaseChecksum: frozen002.releaseChecksum };
    assert.throws(() => contract.validateGeneration(frozen002, staleSeal), /checksum is inconsistent/);
});

test('all eight released 0.0.1 payloads retain their exact bytes', () => {
    assert.equal(previous.version, '0.0.1');
    assert.equal(contract.releaseChecksum(previous.generatedHashes), 'fca75462cfb14798e573c502a9f8646bbf8f6c35aa86fa7cc5735f3a868c666b');
    assert.equal(Object.keys(previous.generatedHashes).length, 8);
    for (const [file, hash] of Object.entries(previous.generatedHashes)) {
        assert.equal(contract.sha256(fs.readFileSync(historicalFile(file))), hash, file);
    }
});

test('0.0.3 selects forward metadata paths in docs-v001 without replacing released paths or shared composition', () => {
    assert.equal(next.version, '0.0.3');
    assert.equal(next.contentPath, 'docs-v001');
    assert.equal(next.sourceAuthority, previous.sourceAuthority);
    assert.deepEqual(next.includes, previous.includes);
    for (const field of ['pack', 'pages', 'components', 'routes', 'destinationRole', 'publicationPolicy']) {
        assert.deepEqual(next[field], previous[field], field);
    }
    contract.validateGeneration(previous, next);
    contract.validateGeneration(frozen002, next);
    const oldComponent = Object.keys(previous.generatedHashes).find(file => file.endsWith('ComponentData.js'));
    assert.equal(next.generatedHashes[oldComponent], undefined);
    const overwritten = structuredClone(next);
    overwritten.generatedHashes[oldComponent] = 'a'.repeat(64);
    overwritten.releaseChecksum = contract.releaseChecksum(overwritten.generatedHashes);
    assert.throws(() => contract.validateGeneration(previous, overwritten), /Immutable documentation path would be overwritten/);
    for (const suffix of ['Page', 'Route']) {
        const file = Object.keys(previous.generatedHashes).find(name => name.endsWith(suffix + 'Data.js'));
        assert.equal(next.generatedHashes[file], previous.generatedHashes[file]);
    }
    assert.equal(fs.existsSync(path.join(root, 'data/docs-v002')), false);
});

test('one successor header preserves dispatch, query, ordering and all canonical identities', () => {
    const files = Object.keys(next.generatedHashes);
    const headers = files.filter(file => file.includes('/headers/'));
    assert.equal(headers.length, 1);
    assert.ok(headers[0].includes('Release003'));
    const before = require(historicalFile(Object.keys(previous.generatedHashes).find(file => file.includes('/headers/'))));
    const after = require(path.join(selected.fileRoot, headers[0]));
    const dispatch = header => Object.entries(header).flatMap(([module, entries]) => Object.values(entries).map(entry => ({
        module, schemaName: entry.options.schemaName, operation: entry.options.operation,
        prefix: entry.options.dataFilePrefix.replace(/Release00[23]/, ''), query: entry.query
    })));
    assert.deepEqual(dispatch(after), dispatch(before));
    for (const entries of Object.values(after)) for (const entry of Object.values(entries)) {
        assert.equal(files.filter(file => path.basename(file) === entry.options.dataFilePrefix + '.js').length, 1);
    }
    for (const suffix of ['Component', 'PageMetadata', 'Node', 'PublicationState', 'SearchMetadata', 'Page', 'Route']) {
        assert.deepEqual(family(local, suffix).map(record => record.code).sort(), original(suffix).map(record => record.code).sort());
    }
    const all = family(selected, 'Component');
    assert.equal(new Set(all.map(record => record.code)).size, all.length);
});

test('Axis setup changes and the bounded registry appendix preserve original anchors and other bodies', () => {
    const before = original('Component');
    assert.equal(components.length, 4);
    for (const record of before) {
        const current = components.find(item => item.code === record.code);
        if (record.properties.code === 'platform.module-registry') {
            assert.deepEqual(current.properties.blocks.slice(0, record.properties.blocks.length), record.properties.blocks);
            const appendix = current.properties.blocks.slice(record.properties.blocks.length);
            assert.equal(appendix.length, 4);
            assert.ok(appendix.every(block => block.kind === 'paragraph'));
            for (const [index, phrase] of ['Active', 'Module Health Check', 'minimumLength', 'administrator decision'].entries()) {
                assert.ok(appendix[index].text.includes(phrase), phrase);
            }
        } else if (record.properties.code !== axis.code) assert.deepEqual(current.properties.blocks, record.properties.blocks);
        else for (const heading of record.properties.blocks.filter(block => block.kind === 'heading')) {
            assert.ok(axis.blocks.some(block => block.kind === 'heading' && block.anchor === heading.anchor), heading.anchor);
        }
    }
    assert.notDeepEqual(axis.blocks, before.find(record => record.properties.code === axis.code).properties.blocks);
    const setup = axis.blocks.find(block => block.kind === 'code' && block.text.startsWith('1. Read'));
    assert.match(setup.text, /unscoped profile.*every required publication CURRENT/);
    assert.match(setup.text, /scoped profile.*all publications for that signed operator.*foreign stages.*BLOCKED/);
});

test('operator-stage screen flow distinguishes selected writes from incomplete aggregate readiness', () => {
    const body = contract.documentationText(axis.blocks);
    for (const phrase of ['afterPublicationStepCode', 'operatorEnterpriseCode', 'selectionRequired:false',
        'selectableStepCodes:[]', 'selectionRequired:true', 'AUTHORITY_PENDING', 'singleton',
        'original bounded Bearer', 'commerceSetupPublisherUserGroup', 'commerceCouponIssuerUserGroup',
        'ignores forceRefresh for CMS', 'Foreign pending stages do not deny this local admission',
        'SOURCE_READY', 'without automatic write retry']) {
        assert.ok(body.toLowerCase().includes(phrase.toLowerCase()), phrase);
    }
    const diagram = axis.blocks.find(block => block.kind === 'diagram' && block.text.includes('Scoped operator stages?'));
    assert.ok(diagram);
    for (const edge of ['Mode -->|no| Global', 'Mode -->|yes| Select', 'Own -->|yes| Install',
        'Own -->|no| Wait', 'Complete -->|no| Block']) assert.ok(diagram.text.includes(edge), edge);
    const example = JSON.parse(axis.blocks.find(block => block.kind === 'code' && block.language === 'json').text);
    assert.deepEqual(Object.keys(example).sort(), ['afterPublicationStepCode', 'correlationId', 'reason']);
    assert.equal(example.afterPublicationStepCode, 'partner:issuerBudget');
});

test('aggregate observation and recovery retain read-only, fresh-evidence and financial boundaries', () => {
    const body = contract.documentationText(axis.blocks);
    for (const phrase of ['disabled by default', '/publications/setup/observe', 'before and after dispatch',
        'source/target/source', 'ERR_BOF_00083', 'cross-request CURRENT cache', 'not a global transaction',
        'preserve original receipts and correlation', 'Do not blindly retry', 'not current financial/business qualification',
        'provider acceptance', 'reconcile, rollback and retire reject selection']) assert.ok(body.includes(phrase), phrase);
    assert.ok(body.includes('BEFORE MEDIA_ASSET_MANIFEST can return owner-admitted SOURCE_READY'));
    assert.ok(body.includes('storedBytesVerified:false'));
    assert.ok(body.includes('mediaDependencies.qualified=true'));
    assert.ok(body.includes('AFTER SOURCE_READY never proves installed CURRENT'));
    for (const anchor of ['axis-signed-operator-selection', 'axis-selection-and-authority-pending',
        'axis-aggregate-read-observation', 'axis-selected-stage-verification']) assert.ok(axis.headings.some(h => h.anchor === anchor));
});

test('active article provenance, derived metadata and both Axis search targets match the successor', () => {
    for (const page of family(local, 'PageMetadata')) {
        const article = components.find(record => record.code === page.articleComponent).properties;
        const body = '# ' + page.title + '\n\n' + contract.documentationText(article.blocks);
        assert.equal(article.source.checksum, contract.sha256(body));
        assert.equal(article.source.wordCount, contract.countWords(body));
        assert.equal(page.sourceChecksum, article.source.checksum);
        assert.equal(page.sourceWordCount, contract.countWords(body));
        assert.equal(page.wordCount, page.sourceWordCount);
        assert.equal(page.sourcePath, article.source.sourcePath);
        assert.ok(page.sourcePath.includes('Release002ComponentData.js'));
        assert.deepEqual(page.sourceEvidence, article.sourceEvidence);
        assert.deepEqual(page.headings, article.headings);
    }
    const page = family(local, 'PageMetadata').find(record => record.documentId === axis.code);
    const node = family(local, 'Node').find(record => record.targetDocumentationPage === page.code);
    const searches = family(local, 'SearchMetadata').filter(record => [node.code, page.code].includes(record.targetCode));
    assert.equal(searches.length, 2);
    for (const search of searches) {
        assert.equal(search.searchText, axis.searchText);
        assert.deepEqual(search.keywords, axis.searchKeywords);
    }
});

test('changed source and provenance records are Staged without newly fabricated approval actors', () => {
    assert.equal(axis.lifecycleState, 'STAGED');
    const records = [...family(local, 'PageMetadata'), ...family(local, 'Node'), ...family(local, 'SearchMetadata')]
        .filter(record => record.lifecycleState === 'STAGED');
    assert.equal(records.length, 10, 'Four metadata and matching page-search provenance changes plus Axis node and node-search');
    const states = family(local, 'PublicationState').filter(state => records.some(record => record.code === state.targetCode));
    assert.equal(states.length, 10);
    for (const record of records) {
        const state = states.find(state => state.targetCode === record.code);
        assert.equal(state.lifecycleState, 'STAGED');
        assert.equal(state.stagedVersion, record.documentId === 'platform.module-registry' ? '0.0.3' : '0.0.2');
        assert.equal(state.checksum, contract.sha256(JSON.stringify(record)));
        assert.equal(state.author, 'codex.source-editorial-review');
        for (const field of ['onlineVersion', 'actor', 'reviewer', 'approver', 'publisher']) assert.equal(state[field], undefined);
        assert.deepEqual(state.auditTrail, []);
        assert.equal(state.workflowRequired, true);
    }
});

test('existing pack/profile/exact baseline selects the active successor and validates through the unchanged contract', () => {
    const config = require(path.join(framework, 'nodics.docs/config/properties'));
    const baseline = config.cms.publication.baselines['docs-backoffice'];
    const profile = config.backofficeApplicationInitialization.profiles['docs-backoffice'];
    assert.equal(baseline.releaseVersion, active.manifest.version);
    assert.equal(baseline.sourceVersion, '0');
    assert.equal(profile.contentPackCode, 'backofficeDocumentation');
    assert.equal(baseline.contentPackCode, profile.contentPackCode);
    const pack = config.data.contentPacks.packs[profile.contentPackCode];
    assert.equal(pack.source.manifestSection, 'documentation');
    const catalogue = contract.validateDataRelease(root);
    assert.equal(catalogue.documents.filter(document => document.ownerRoot === root).length, 4);
});

test('0.0.4 preserves the sealed predecessor and adds only the shared observation guidance', () => {
    assert.equal(active.manifest.version, '0.0.4');
    contract.validateGeneration(next, active.manifest);
    for (const [file, hash] of Object.entries(next.generatedHashes)) assert.equal(contract.sha256(fs.readFileSync(path.join(selected.fileRoot, file))), hash);
    const current = family({ ...active, children: [] }, 'Component');
    assert.deepEqual(current.map(r => r.code), components.map(r => r.code));
    for (const old of components) {
        const now = current.find(r => r.code === old.code);
        if (old.properties.code !== 'platform.module-registry') assert.deepEqual(now.properties.blocks, old.properties.blocks);
        else {
            assert.deepEqual(now.properties.blocks.slice(0, old.properties.blocks.length), old.properties.blocks);
            const body = contract.documentationText(now.properties.blocks.slice(old.properties.blocks.length));
            for (const phrase of ['partial view', 'distributed lease store', 'compare-and-set', 'activation decision']) assert.ok(body.includes(phrase));
        }
    }
    for (const suffix of ['Page', 'Route', 'Node']) assert.deepEqual(family({ ...active, children: [] }, suffix), family(local, suffix));
    const pages = family({ ...active, children: [] }, 'PageMetadata');
    for (const record of current) {
        const article = record.properties, page = pages.find(p => p.articleComponent === record.code);
        const body = '# ' + article.title + '\n\n' + contract.documentationText(article.blocks);
        assert.equal(article.source.checksum, contract.sha256(body));
        assert.equal(article.source.wordCount, contract.countWords(body));
        assert.equal(page.sourceChecksum, article.source.checksum);
        assert.equal(page.sourceWordCount, article.source.wordCount);
        assert.equal(page.wordCount, article.source.wordCount);
        assert.equal(page.sourcePath, article.source.path);
    }
});
