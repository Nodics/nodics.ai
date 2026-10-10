/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/test/eWasteDocumentationForwardRelease @description Protects forward CMS content, immutable source bytes, stable identities and optional asset-inclusive release selection. @layer test @owner eWaste */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.resolve(__dirname, '..');
const framework = path.resolve(root, '../../../../..');
const contract = require(path.join(framework, 'nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService'));
const baseline = require('./fixtures/documentationFrozen001.json');
const predecessor = require('./fixtures/documentationFrozen002.json');
const latestPredecessor = require('./fixtures/documentationFrozen003.json');
const frozen004 = require('./fixtures/documentationFrozen004.json');
const manifest = require('../data/manifest.json');

function release(section) {
    return contract.readDocumentationRelease(root, section);
}

function family(section, suffix) {
    return contract.readReleaseRecords(release(section), suffix).records;
}

function article(section, code) {
    const result = family(section, 'Component').find(record => record.code === code);
    assert.ok(result, 'Missing canonical article ' + code);
    return result.properties;
}

test('all 47 frozen 0.0.1 files including assets retain their original bytes', () => {
    const expected = {
        documentation: 'ac159bf7a00757e8876cc3dd872e9e6c701091ce3c5ebc31d9665ae18e70a067',
        referenceDocumentation: '09b71b0c36190de655cf98b13f90ba5ef82b1025231b16328d2efc632d8adb52'
    };
    const files = new Set();
    assert.equal(baseline.releaseVersion, '0.0.1');
    for (const [name, section] of Object.entries(baseline.sections)) {
        assert.equal(section.version, '0.0.1');
        assert.equal(contract.releaseChecksum(section.generatedHashes), expected[name]);
        for (const [file, hash] of Object.entries(section.generatedHashes)) {
            files.add(file);
            assert.equal(contract.sha256(fs.readFileSync(path.join(root, 'data', file))), hash, file);
        }
    }
    assert.equal(files.size, 47);
});

test('all frozen 0.0.2 files including assets retain their original bytes', () => {
    const expected = {
        documentation: '03b8d80a15d2130722cbf716e5db18874430534aa943c2accd54269645970938',
        referenceDocumentation: '4f098e451a16a9ad5682af78015f37ef8d45e4168dbfdc7c19327a8d288d7d59'
    };
    assert.equal(predecessor.releaseVersion, '0.0.2');
    for (const [name, section] of Object.entries(predecessor.sections)) {
        assert.equal(section.version, '0.0.2');
        assert.equal(contract.releaseChecksum(section.generatedHashes), expected[name]);
        contract.validateGeneration(baseline.sections[name], section);
        for (const [file, hash] of Object.entries(section.generatedHashes)) {
            assert.equal(contract.sha256(fs.readFileSync(path.join(root, 'data', file))), hash, file);
        }
    }
    assert.deepEqual(manifest.sections.referenceDocumentation, predecessor.sections.referenceDocumentation);
});

test('all frozen 0.0.3 files retain their bytes before the inventory-only successor', () => {
    assert.equal(latestPredecessor.releaseVersion, '0.0.3');
    assert.equal(latestPredecessor.sections.documentation.releaseChecksum,
        '2bccbf44ec8af347fec02c4560fe6a079f851973495c6a7955121c254bfb975a');
    for (const [name, section] of Object.entries(latestPredecessor.sections)) {
        assert.equal(contract.releaseChecksum(section.generatedHashes), section.releaseChecksum);
        contract.validateGeneration(predecessor.sections[name], section);
        for (const [file, hash] of Object.entries(section.generatedHashes)) {
            assert.equal(contract.sha256(fs.readFileSync(path.join(root, 'data', file))), hash, file);
        }
    }
});

test('all frozen 0.0.4 payloads, assets and release seals retain their bytes', () => {
    assert.equal(frozen004.releaseVersion, '0.0.4');
    assert.equal(frozen004.sections.documentation.releaseChecksum,
        'afbe08e362725ef74488bd58976f2ad1429e46f6169a67da7a5e056116e8c0d5');
    for (const [name, section] of Object.entries(frozen004.sections)) {
        assert.equal(contract.releaseChecksum(section.generatedHashes), section.releaseChecksum);
        contract.validateGeneration(latestPredecessor.sections[name], section);
        for (const [file, hash] of Object.entries(section.generatedHashes)) {
            assert.equal(contract.sha256(fs.readFileSync(path.join(root, 'data', file))), hash, file);
        }
    }
});

test('semantic successors stay in docs-v001 and never overwrite any frozen predecessor', () => {
    for (const [name, previous] of Object.entries(baseline.sections)) {
        const next = manifest.sections[name];
        assert.equal(next.version, name === 'documentation' ? '0.0.5' : '0.0.2');
        assert.equal(next.contentPath, 'docs-v001');
        assert.equal(next.sourceAuthority, 'data/docs-v001/records/documentation');
        assert.equal(next.pack, previous.pack);
        assert.equal(next.pages, previous.pages);
        assert.deepEqual(next.includes, previous.includes);
        assert.deepEqual(next.referenceCatalogues, previous.referenceCatalogues);
        contract.validateGeneration(previous, next);
        contract.validateGeneration(predecessor.sections[name], next);
        contract.validateGeneration(latestPredecessor.sections[name], next);
        contract.validateGeneration(frozen004.sections[name], next);
        const changedPath = Object.keys(previous.generatedHashes).find(file => file.endsWith('ComponentData.js'));
        assert.equal(next.generatedHashes[changedPath], undefined, 'Retired components must not be imported too');
        const invalid = structuredClone(next);
        invalid.generatedHashes[changedPath] = 'a'.repeat(64);
        invalid.releaseChecksum = contract.releaseChecksum(invalid.generatedHashes);
        assert.throws(() => contract.validateGeneration(previous, invalid), /Immutable documentation path would be overwritten/);
        for (const [file, hash] of Object.entries(previous.generatedHashes)) {
            if (file.includes('/assets/')) assert.equal(next.generatedHashes[file], hash, file);
        }
    }
    assert.equal(fs.existsSync(path.join(root, 'data/docs-v002')), false);
});

test('forward packs preserve canonical identities and stage exactly one selected header each', () => {
    for (const [name, previous] of Object.entries(baseline.sections)) {
        const selected = release(name);
        const headers = Object.keys(selected.manifest.generatedHashes).filter(file => /\/headers\/.*Headers?\.js$/.test(file));
        assert.equal(headers.length, 1);
        assert.ok(headers[0].includes(name === 'documentation' ? 'Release005' : 'Release002'));
        const selectedFiles = Object.keys(selected.manifest.generatedHashes);
        const header = require(path.join(root, 'data', headers[0]));
        const oldHeaderPath = Object.keys(previous.generatedHashes).find(file => /\/headers\//.test(file));
        const oldHeader = require(path.join(root, 'data', oldHeaderPath));
        const dispatch = input => Object.entries(input).flatMap(([moduleName, entries]) => Object.values(entries).map(entry => ({
            moduleName, schemaName: entry.options.schemaName, operation: entry.options.operation,
            prefix: entry.options.dataFilePrefix.replace(/Release00[2345]/, ''), query: entry.query
        })));
        assert.deepEqual(dispatch(header), dispatch(oldHeader), 'Forward headers must retain owner dispatch order and query semantics');
        for (const entries of Object.values(header)) {
            for (const entry of Object.values(entries)) {
                const prefix = entry.options.dataFilePrefix;
                assert.equal(selectedFiles.filter(file => path.basename(file) === prefix + '.js').length, 1, prefix);
            }
        }
        for (const suffix of ['Component', 'PageMetadata', 'SearchMetadata', 'Page', 'Route', 'Media']) {
            const oldFiles = Object.keys(previous.generatedHashes).filter(file => file.endsWith(suffix + 'Data.js'));
            const oldCodes = oldFiles.flatMap(file => Object.values(require(path.join(root, 'data', file))).map(record => record.code));
            const current = contract.readReleaseRecords({ ...selected, children: [] }, suffix).records;
            assert.deepEqual(current.map(record => record.code).sort(), oldCodes.sort(), name + ' ' + suffix);
        }
        const all = contract.readReleaseRecords(selected, 'Component').records;
        assert.equal(new Set(all.map(record => record.code)).size, all.length);
    }
});

test('Circa staff guidance selects the predefined reviewed pack instead of manual demo role wiring', () => {
    const properties = article('documentation', 'nodicsDocsComponentacceleratorsCircaSourceInventory');
    const body = contract.documentationText(properties.blocks);
    for (const text of ['circa.ewaste:circaCommerceStaffAssignments', 'seven existing employees',
        'commercePublicationStarterRole', 'commerceAxisRefundReviewerRole', 'MERCHANT_OPERATOR',
        'fresh session', 'seller consent', 'not manual runtime group wiring']) assert.ok(body.includes(text), text);
    assert.ok(!body.includes('These explicitly selected Profile core groups do not assign themselves to staff'));
    assert.ok(properties.sourceEvidence.some(file => file.endsWith('/circa-predefined-commerce-staff.md')));
    const demo = article('referenceDocumentation', 'circaDocsComponentcircaDemoData');
    const demoBody = contract.documentationText(demo.blocks);
    assert.ok(demoBody.includes('circa.ewaste:circaCommerceStaffAssignments'));
    assert.ok(demoBody.includes('not manual runtime group wiring'));
    assert.ok(demo.references.some(reference => reference.documentId === 'accelerators.circa-source-inventory' && reference.owner === 'eWaste'));
});

test('successor inventory covers all 46 business sections and separates 98 required roots from the optional asset subset', () => {
    const properties = article('documentation', 'nodicsDocsComponentacceleratorsCircaSourceInventory');
    const table = properties.blocks.find(block => block.kind === 'table' && block.headers[0] === 'Section');
    const names = ['profile', 'location', 'waste', 'waste-policy', 'loyalty', 'content', 'commerce',
        'operations', 'customer-workspace', 'sunmarke-profile', 'sunmarke-location', 'sunmarke-waste',
        'circaPublicationPlan', 'store', 'circaGreenPerksBudget', 'circaGreenPerksIssuance',
        'circaGreenPerksPublicationPlan', 'circaRenewWorksBudget', 'circaRenewWorksIssuance',
        'circaRenewWorksPublicationPlan', 'circaLoopCycleBudget', 'circaLoopCycleIssuance',
        'circaLoopCyclePublicationPlan', 'circaCataloguePublicationPlan', 'circaDigitalOwnershipPolicies',
        'circaMerchantOutletAccess', 'circaAssetClassification', 'circaAssetClassificationPublicationPlan',
        'circaCatalogueCurrentPublicationPlan', 'circaCommerceStaffAssignments', 'circaLocalDemoCredit',
        'circaGreenPerksOutletCommerce', 'circaGreenPerksOutletPublicationPlan', 'circaGreenPerksOutletOpening',
        'circaRenewWorksOutletCommerce', 'circaRenewWorksOutletPublicationPlan', 'circaRenewWorksOutletOpening',
        'circaLoopCycleOutletCommerce', 'circaLoopCycleOutletPublicationPlan', 'circaLoopCycleOutletOpening',
        'circaLocalDemoCreditRole', 'circaLocalDemoCreditStaffAssignment',
        'circaLocalOpeningRole', 'circaLocalOpeningStaffAssignments',
        'circaLocalUnusedRefundExceptionRole', 'circaLocalUnusedRefundExceptionStaffAssignment'];
    assert.equal(names.length, 46);
    assert.deepEqual(table.rows.map(row => row[0]).sort(), names.sort());
    for (const name of names.slice()) {
        const row = table.rows.find(item => item[0] === name);
        assert.equal(row[1], ['waste-policy', 'customer-workspace'].includes(name) ? 'core-v001' : 'sample-v001');
        assert.equal(row[2], '0.0.1');
    }
    for (const name of ['circaAssetClassification', 'circaAssetClassificationPublicationPlan', 'circaCatalogueCurrentPublicationPlan']) {
        assert.equal(table.rows.find(row => row[0] === name)[3], 'COMMERCE_STAGED');
    }
    const staff = table.rows.find(row => row[0] === 'circaCommerceStaffAssignments');
    assert.equal(staff[3], 'PLATFORM');
    assert.match(staff[4], /^NONE;/);
    const credit = table.rows.find(row => row[0] === 'circaLocalDemoCredit');
    assert.equal(credit[3], 'LOYALTY');
    assert.match(credit[4], /^NONE; explicit LOCAL demo credit, required in reviewed native setup; not executed$/);
    const body = contract.documentationText(properties.blocks);
    for (const text of ['All 46 current business manifest sections', '84 distinct roots', '98 distinct roots',
        'all 46 effective catalogue roots', 'optional five-root subset', 'other 41',
        'five-current or 45-current', 'ten English/Arabic Product localization successors',
        'input.versionId 1', 'sourceVersion 2', 'DIGITAL_OWNERSHIP', 'DIGITAL_COMMERCE',
        'circaCommerceStaffAssignments permits LOCAL and LOCAL_PRODUCTION_SIMULATION']) assert.ok(body.includes(text), text);
    const publication = properties.blocks.find(block => block.kind === 'table' && block.headers[0] === 'Signed enterprise');
    assert.equal(publication.rows[0][1], 'circaCatalogueCurrentPublicationPlan');
    assert.equal(publication.rows.length, 7);
    assert.equal(publication.rows.reduce((sum, row) => sum + Number(row[2]), 0), 98);
    for (const suffix of ['asset-classification/headers/circaAssetClassificationHeader.js',
        'asset-classification/records/circaAssetClassificationLocalizationData.js',
        'asset-publication/records/publicationPlan.json', 'publication/current-catalogue/records/publicationPlan.json',
        'envs/kickoffLocal/platformServer/config/properties.js']) {
        assert.ok(properties.sourceEvidence.some(file => file.endsWith(suffix)), suffix);
    }
});

test('0.0.5 changes only the inventory article body and stages the entire successor without fabricated approvals', () => {
    const selected = release('documentation');
    const oldFile = Object.keys(frozen004.sections.documentation.generatedHashes).find(file => file.endsWith('ComponentData.js'));
    const previous = Object.values(require(path.join(root, 'data', oldFile)));
    const current = contract.readReleaseRecords({ ...selected, children: [] }, 'Component').records;
    assert.equal(current.length, 12);
    for (const record of current) {
        const old = previous.find(item => item.code === record.code);
        assert.ok(old);
        assert.equal(record.properties.lifecycleState, 'STAGED');
        assert.equal(record.properties.route, old.properties.route);
        if (record.code !== 'nodicsDocsComponentacceleratorsCircaSourceInventory') {
            assert.deepEqual(record.properties.blocks, old.properties.blocks, record.code);
            assert.equal(record.properties.source.checksum, old.properties.source.checksum, record.code);
        }
    }
    const targets = new Map(['Node', 'PageMetadata', 'SearchMetadata'].flatMap(suffix => {
        const records = contract.readReleaseRecords({ ...selected, children: [] }, suffix).records;
        for (const record of records) assert.equal(record.lifecycleState, 'STAGED', record.code);
        return records.map(record => [record.code, record]);
    }));
    const states = contract.readReleaseRecords({ ...selected, children: [] }, 'PublicationState').records;
    assert.equal(states.length, 48);
    for (const state of states) {
        assert.equal(state.lifecycleState, 'STAGED');
        assert.equal(state.stagedVersion, '0.0.5');
        assert.equal(state.checksum, contract.sha256(JSON.stringify(targets.get(state.targetCode))));
        for (const field of ['onlineVersion', 'reviewer', 'approver', 'publisher', 'actor']) assert.equal(state[field], undefined, field);
        assert.deepEqual(state.auditTrail, []);
    }
});

test('unused-refund inventory retains every previous block and names only exact reviewed role adoption', () => {
    const properties = article('documentation', 'nodicsDocsComponentacceleratorsCircaSourceInventory');
    const previous = Object.values(require('../data/docs-v001/records/documentation/eWasteDocumentationRelease004ComponentData'))
        .find(row => row.properties.code === properties.code).properties;
    for (const [index, block] of previous.blocks.entries()) {
        if (block.kind === 'table' && block.headers[0] === 'Section') {
            assert.deepEqual(properties.blocks[index].rows.slice(0, block.rows.length), block.rows);
        } else if (block.kind === 'paragraph' && block.text.includes('All 44 current business manifest sections')) {
            assert.equal(properties.blocks[index].text, block.text
                .replace('All 44 current business manifest sections', 'All 46 current business manifest sections')
                .replace('and four bounded human-role sections', 'and six bounded human-role sections'));
        } else assert.deepEqual(properties.blocks[index], block, 'Previous block ' + index);
    }
    assert.deepEqual(properties.headings.slice(0, previous.headings.length), previous.headings);
    assert.deepEqual(properties.sourceEvidence.slice(0, previous.sourceEvidence.length), previous.sourceEvidence);
    const body = contract.documentationText(properties.blocks);
    for (const text of ['commerce.refund.exception.adjudicate', 'circa-online-administrator',
        'GREENPERKS_ONLINE', 'Profile addReferenceGroupsAll', 'original unused 50-POINTS GP-A01 purchase',
        'Docker and other runtimes remain disabled', 'Adjudication itself moves no POINTS',
        'No new credit, replenishment, retargeted purchase or redeemed-benefit reversal is authorized',
        'not re-certified here']) assert.ok(body.includes(text), text);
    for (const suffix of ['refund-exception-role/headers/circaLocalUnusedRefundExceptionRoleHeader.js',
        'refund-exception-role/records/circaLocalUnusedRefundExceptionGroupData.js',
        'refund-exception-staff/headers/circaLocalUnusedRefundExceptionStaffHeader.js',
        'refund-exception-staff/records/circaLocalUnusedRefundExceptionStaffData.js',
        'llm/contracts/circa-local-unused-refund-exception.md']) {
        const evidence = properties.sourceEvidence.find(file => file.endsWith(suffix));
        assert.ok(evidence, suffix);
        assert.ok(fs.existsSync(path.resolve(root, evidence)), evidence);
    }
    const selected = release('documentation');
    const oldComponent = Object.keys(frozen004.sections.documentation.generatedHashes).find(file => file.endsWith('ComponentData.js'));
    assert.equal(selected.manifest.generatedHashes[oldComponent], undefined);
    const invalid = structuredClone(selected.manifest);
    invalid.generatedHashes[oldComponent] = 'a'.repeat(64);
    invalid.releaseChecksum = contract.releaseChecksum(invalid.generatedHashes);
    assert.throws(() => contract.validateGeneration(frozen004.sections.documentation, invalid), /Immutable documentation path would be overwritten/);
});

test('bounded sample credit documents approved human-role source without claiming execution', () => {
    const properties = article('documentation', 'nodicsDocsComponentacceleratorsCircaSourceInventory');
    const body = contract.documentationText(properties.blocks);
    for (const text of ['circa.ewaste:circaLocalDemoCredit', '7645 POINTS', '118 -> 7763',
        '118 available; 118 earned; 0 reserved/spent/expired/reversed; revision 0',
        'CIRCA_LOCAL_DEMO_BUYER_POINTS', 'CIRCA_LOCAL_DEMO_POINT_CREDIT_20261009',
        'LOYALTY_SAMPLE_CREDITS', 'loyalty.sampleCredit.apply', 'Approved bounded circaLocalDemoCreditRole',
        'Import NOT executed', 'one atomic instruction', 'CURRENT even after', 'already-redeemed benefit reversals remain disabled']) {
        assert.ok(body.includes(text), text);
    }
    const diagram = properties.blocks.find(block => block.kind === 'diagram' && block.text.includes('Original human import and sample-credit authority'));
    assert.ok(diagram);
    assert.ok(diagram.text.includes('Abort; no partial credit'));
    assert.ok(properties.references.some(reference => reference.documentId === 'accelerators.circa-operations-rewards' && reference.owner === 'eWaste'));
    for (const suffix of ['/loyaltyWallet/llm/contracts/sample-credit-admission.md',
        '/circa.ewaste/llm/contracts/circa-local-demo-credit.md',
        '/operations/loyalty-credit/records/loyaltyCredits.json']) {
        assert.ok(properties.sourceEvidence.some(file => file.endsWith(suffix)), suffix);
    }
});

test('both guide surfaces require a second CLAIM after verification even for the same reviewer', () => {
    for (const [section, code] of [
        ['documentation', 'nodicsDocsComponentacceleratorsCircaOperationsRewards'],
        ['referenceDocumentation', 'circaDocsComponentcircaCustomerJourney']
    ]) {
        const properties = article(section, code);
        const body = contract.documentationText(properties.blocks);
        assert.ok(body.includes('CLAIM -> verify -> QUEUE -> reread revision -> CLAIM -> approve/reject'));
        assert.match(body, /same (?:employee|reviewer)/i);
        assert.ok(body.includes('ERR_WASTE_ASSIGNMENT_REQUIRED'));
        assert.ok(body.includes('expectedRevision'));
        const diagram = properties.blocks.find(block => block.kind === 'diagram' && block.text.includes('QueueHandoff'));
        assert.ok(diagram, 'Missing explicit review handoff diagram');
        for (const edge of ['ClaimForVerification --> Verify', 'Verify --> QueueHandoff',
            'QueueHandoff --> CurrentRevision', 'CurrentRevision --> ClaimForDecision', 'ClaimForDecision --> Decision']) {
            assert.ok(diagram.text.includes(edge), edge);
        }
        assert.ok(properties.sourceEvidence.some(file => file.endsWith('/review-workspace.md')));
    }
});

test('derived source metadata, navigation and article search targets match the corrected CMS blocks', () => {
    for (const name of Object.keys(baseline.sections)) {
        const selected = release(name);
        const components = contract.readReleaseRecords({ ...selected, children: [] }, 'Component').records;
        const pages = contract.readReleaseRecords({ ...selected, children: [] }, 'PageMetadata').records;
        const searches = contract.readReleaseRecords({ ...selected, children: [] }, 'SearchMetadata').records;
        const navigation = components.find(record => record.renderer === 'documentation.component.navigation');
        for (const page of pages) {
            const properties = components.find(record => record.code === page.articleComponent).properties;
            const body = (properties.blocks[0]?.kind === 'heading' && properties.blocks[0].level === 1 ? '' : '# ' + page.title + '\n\n') + contract.documentationText(properties.blocks);
            assert.equal(properties.source.checksum, contract.sha256(body));
            assert.equal(page.sourceChecksum, properties.source.checksum);
            assert.equal(page.sourceWordCount, contract.countWords(body));
            assert.equal(page.wordCount, page.sourceWordCount);
            assert.equal(page.sourcePath, properties.source.sourcePath);
            assert.ok(page.sourcePath.includes(name === 'documentation' ? 'Release005ComponentData.js' : 'Release002ComponentData.js'));
            assert.deepEqual(page.sourceEvidence, properties.sourceEvidence);
            for (const search of searches.filter(record => record.targetCode === page.code)) {
                assert.equal(search.searchText, properties.searchText);
            }
            if (navigation) {
                assert.equal(navigation.properties.items.find(item => item.code === page.documentId).searchText, properties.searchText);
            }
        }
    }
});

test('corrected articles and publication metadata are Staged without fabricated Online approval', () => {
    for (const [name, codes] of [
        ['documentation', ['nodicsDocsComponentacceleratorsCircaSourceInventory', 'nodicsDocsComponentacceleratorsCircaOperationsRewards',
            'nodicsDocsComponentacceleratorsCircaCatalogueReference', 'nodicsDocsComponentacceleratorsCircaDataNetwork']],
        ['referenceDocumentation', ['circaDocsComponentcircaCustomerJourney', 'circaDocsComponentcircaDemoData']]
    ]) {
        const pages = family(name, 'PageMetadata').filter(page => codes.includes(page.articleComponent));
        const nodes = family(name, 'Node').filter(node => pages.some(page => page.code === node.targetDocumentationPage));
        const searches = family(name, 'SearchMetadata').filter(search => pages.some(page => page.code === search.targetCode) || nodes.some(node => node.code === search.targetCode));
        for (const code of codes) assert.equal(article(name, code).lifecycleState, 'STAGED');
        for (const record of [...pages, ...nodes, ...searches]) assert.equal(record.lifecycleState, 'STAGED');
        const records = new Map([...pages, ...nodes, ...searches].map(record => [record.code, record]));
        const states = family(name, 'PublicationState').filter(state => records.has(state.targetCode));
        assert.equal(states.length, codes.length * 4);
        for (const state of states) {
            assert.equal(state.lifecycleState, 'STAGED');
            assert.equal(state.stagedVersion, manifest.sections[name].version);
            assert.equal(state.checksum, contract.sha256(JSON.stringify(records.get(state.targetCode))));
            for (const field of ['onlineVersion', 'reviewer', 'approver', 'publisher', 'actor']) assert.equal(state[field], undefined, field);
            assert.deepEqual(state.auditTrail, []);
            assert.equal(state.workflowRequired, true);
        }
    }
});

test('complete forward catalogues and owner-qualified references validate without importing anything', () => {
    const capability = contract.validateDataRelease(root, 'documentation');
    const reference = contract.validateDataRelease(root, 'referenceDocumentation');
    assert.equal(capability.documents.filter(document => document.ownerRoot === root).length, 12);
    assert.equal(reference.documents.length, 4);
    assert.equal(contract.validateReferenceCatalogues(root, manifest.sections.referenceDocumentation, reference), true);
});

test('reviewed deployment adoption selects the exact successor without changing the reference pack', () => {
    const configuration = require(path.join(framework, 'nodics.docs/config/properties'));
    for (const [profileCode, packCode, sectionName] of [
        ['docs-ewaste', 'eWasteDocumentation', 'documentation'],
        ['circadocs', 'circaDocumentation', 'referenceDocumentation']
    ]) {
        const profile = configuration.backofficeApplicationInitialization.profiles[profileCode];
        const descriptor = configuration.cms.publication.baselines[profileCode];
        const pack = configuration.data.contentPacks.packs[packCode];
        assert.equal(profile.baselineCode, profileCode);
        assert.equal(profile.contentPackCode, packCode);
        assert.equal(descriptor.contentPackCode, packCode);
        assert.equal(pack.source.manifestSection, sectionName);
        assert.equal(descriptor.releaseVersion, manifest.sections[sectionName].version);
        assert.equal(descriptor.releaseVersion, sectionName === 'documentation' ? '0.0.5' : '0.0.2');
        contract.validateGeneration(latestPredecessor.sections[sectionName], manifest.sections[sectionName]);
        assert.ok(manifest.sections[sectionName].sites.includes(descriptor.rootCode));
        assert.equal(typeof descriptor.sourceVersion, 'string');
        assert.ok(descriptor.sourceVersion.length > 0, 'Actual Staged source-version qualification remains native-owner work');
    }
});
