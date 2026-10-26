/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/test/eWasteDocumentationForwardRelease @description Protects consolidated CMS content, historical fixture seals and current asset-inclusive release selection. @layer test @owner eWaste */
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
const frozen005 = require('./fixtures/documentationFrozen005.json');
const frozen006 = require('./fixtures/documentationFrozen006.json');

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

test('forward packs preserve canonical identities and stage exactly one selected header each', () => {
    for (const [name, previous] of Object.entries(baseline.sections)) {
        const selected = release(name);
        const headers = Object.keys(selected.manifest.generatedHashes).filter(file => /\/headers\/.*Headers?\.js$/.test(file));
        assert.equal(headers.length, 1);
        assert.ok(headers[0].includes(name === 'documentation' ? 'Release008' : 'Release004'));
        const selectedFiles = Object.keys(selected.manifest.generatedHashes);
        const header = require(path.join(root, 'data', headers[0]));
        for (const entries of Object.values(header)) {
            for (const entry of Object.values(entries)) {
                const prefix = entry.options.dataFilePrefix;
                assert.equal(selectedFiles.filter(file => path.basename(file) === prefix + '.js').length, 1, prefix);
            }
        }
        for (const suffix of ['Component', 'PageMetadata', 'SearchMetadata', 'Page', 'Route', 'Media']) {
            const current = contract.readReleaseRecords({ ...selected, children: [] }, suffix).records;
            assert.equal(new Set(current.map(record => record.code)).size, current.length, name + ' ' + suffix);
        }
        const all = contract.readReleaseRecords(selected, 'Component').records;
        assert.equal(new Set(all.map(record => record.code)).size, all.length);
    }
});

test('Circa staff guidance selects the predefined reviewed pack instead of manual demo role wiring', () => {
    const properties = article('documentation', 'nodicsDocsComponentacceleratorsCircaSourceInventory');
    const body = contract.documentationText(properties.blocks);
    for (const text of ['circa.ewaste:circaCommerceStaffAssignments', 'seven existing employees',
        'publish:accessGroups', 'order:accessGroups', 'MERCHANT_OPERATOR',
        'fresh session', 'seller consent', 'not manual runtime group wiring']) assert.ok(body.includes(text), text);
    assert.ok(!body.includes('These explicitly selected Profile core groups do not assign themselves to staff'));
    assert.ok(properties.sourceEvidence.some(file => file.endsWith('/circa-predefined-commerce-staff.md')));
    const demo = article('referenceDocumentation', 'circaDocsComponentcircaDemoData');
    const demoBody = contract.documentationText(demo.blocks);
    assert.ok(demoBody.includes('circa.ewaste:circaCommerceStaffAssignments'));
    assert.ok(demoBody.includes('not manual runtime group wiring'));
    assert.ok(demo.references.some(reference => reference.documentId === 'accelerators.circa-source-inventory' && reference.owner === 'eWaste'));
});

test('bounded sample credit documents approved human-role source without claiming execution', () => {
    const properties = article('documentation', 'nodicsDocsComponentacceleratorsCircaSourceInventory');
    const body = contract.documentationText(properties.blocks);
    for (const text of ['circa.ewaste:circaLocalDemoCredit', '7645 POINTS', '118 -> 7763',
        '118 available; 118 earned; 0 reserved/spent/expired/reversed; revision 0',
        'CIRCA_LOCAL_DEMO_BUYER_POINTS', 'CIRCA_LOCAL_DEMO_POINT_CREDIT_20261009',
        'LOYALTY_SAMPLE_CREDITS', 'loyalty.sampleCredit.apply', 'Approved bounded loyaltyWallet:specialAccessGroups and import:specialAccessGroups',
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
        const nodes = contract.readReleaseRecords({ ...selected, children: [] }, 'Node').records;
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
            assert.equal(properties.source.path, page.sourcePath);
            assert.equal(properties.source.wordCount, page.sourceWordCount);
            assert.ok(page.sourcePath.includes(name === 'documentation' ? 'Release008ComponentData.js' : 'Release004ComponentData.js'));
            assert.deepEqual(page.sourceEvidence, properties.sourceEvidence);
            const searchTargets = new Set([page.code, ...nodes.filter(node => node.targetDocumentationPage === page.code).map(node => node.code)]);
            for (const search of searches.filter(record => searchTargets.has(record.targetCode))) {
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

test('reviewed deployment adoption selects the exact current successors for both guide packs', () => {
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
        assert.equal(descriptor.releaseVersion, sectionName === 'documentation' ? '0.0.8' : '0.0.4');
        contract.validateGeneration(latestPredecessor.sections[sectionName], manifest.sections[sectionName]);
        assert.ok(manifest.sections[sectionName].sites.includes(descriptor.rootCode));
        assert.equal(typeof descriptor.sourceVersion, 'string');
        assert.ok(descriptor.sourceVersion.length > 0, 'Actual Staged source-version qualification remains native-owner work');
    }
});

test('consolidated guides remove retired selectors from all current record families', () => {
    for (const [name, old] of Object.entries(frozen005.sections)) {
        contract.validateGeneration(old, manifest.sections[name]);
        const selected = release(name);
        for (const suffix of ['Component', 'PageMetadata', 'SearchMetadata']) {
            const records = contract.readReleaseRecords({ ...selected, children: [] }, suffix).records;
            assert.doesNotMatch(JSON.stringify(records), /profile:commerce[A-Za-z]+Role|commercePublicationStarterRole|commerceAxisRefundReviewerRole|circaLocal(?:DemoCredit|Opening|UnusedRefundException)Role|circaEWaste|\/nodics\/circa\.ewaste\/v0/);
        }
        for (const row of contract.readReleaseRecords({ ...selected, children: [] }, 'Component').records) {
            for (const source of row.properties.sourceEvidence || []) assert.ok(fs.existsSync(path.resolve(root, source)), source);
        }
    }
});

test('every successor publication state seals its selected target without claiming Online approval', () => {
    for (const name of ['documentation', 'referenceDocumentation']) {
        const selected = release(name);
        const targets = new Map();
        for (const file of Object.keys(selected.manifest.generatedHashes).filter(file => /\/records\/.*Data\.js$/.test(file) && !file.endsWith('PublicationStateData.js'))) {
            for (const row of Object.values(require(path.join(root, 'data', file)))) targets.set(row.code, row);
        }
        for (const state of contract.readReleaseRecords({ ...selected, children: [] }, 'PublicationState').records) {
            assert.ok(targets.has(state.targetCode), state.targetCode);
            assert.equal(state.checksum, contract.sha256(JSON.stringify(targets.get(state.targetCode))), state.code);
            assert.equal(state.stagedVersion, selected.manifest.version);
            assert.equal(state.lifecycleState, 'STAGED');
            assert.equal(state.workflowRequired, true);
            assert.deepEqual(state.auditTrail, []);
            for (const field of ['onlineVersion', 'reviewer', 'approver', 'publisher', 'actor']) assert.equal(state[field], undefined, state.code + ':' + field);
        }
    }
});

test('current final-sale guides use common Digital owners and reject retired reversal evidence across derived families', () => {
    for (const name of ['documentation', 'referenceDocumentation']) {
        const selected = release(name);
        for (const suffix of ['Component', 'PageMetadata', 'SearchMetadata']) {
            const records = contract.readReleaseRecords({ ...selected, children: [] }, suffix).records;
            for (const record of records) {
                assert.doesNotMatch(JSON.stringify(record), /defaultEWasteOrderReversal(?:Service|Controller)|DefaultEWasteOrderReversalService|ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER|refundsEnabled true/, record.code);
                for (const source of record.sourceEvidence || record.properties?.sourceEvidence || []) {
                    assert.ok(fs.existsSync(path.resolve(root, source)), source);
                }
            }
        }
    }
    for (const [name, code] of [
        ['documentation', 'nodicsDocsComponentacceleratorsCircaCatalogueReference'],
        ['documentation', 'nodicsDocsComponentacceleratorsCircaCouponsCommerce'],
        ['referenceDocumentation', 'circaDocsComponentcircaCustomerJourney']
    ]) {
        const properties = article(name, code);
        const body = contract.documentationText(properties.blocks);
        assert.match(body, /Completed digital bundle purchases are final sale/);
        assert.match(body, /refund mutation phases refuse/);
        assert.match(body, /Digital owns purchase and proceeds coordination/);
        assert.match(body, /Loyalty alone writes balances/);
        assert.match(body, /POST \/checkouts\/:commandCode\/recovery\/resume/);
        assert.match(body, /never a return of a completed sale/);
        assert.ok(properties.sourceEvidence.includes('llm/contracts/common-bundle-commerce.md'));
        assert.ok(properties.sourceEvidence.some(source => source.endsWith('/bundle-settlement.md')));
        assert.ok(properties.sourceEvidence.some(source => source.endsWith('/forward-purchase-recovery.md')));
    }
});

test('current Circa coupon guidance requires finality and common Checkout while refund/expiry records remain historical', () => {
    for (const [section, code] of [
        ['documentation', 'nodicsDocsComponentacceleratorsCircaCouponsCommerce'],
        ['documentation', 'nodicsDocsComponentacceleratorsCircaCatalogueReference'],
        ['referenceDocumentation', 'circaDocsComponentcircaCustomerJourney'],
        ['referenceDocumentation', 'circaDocsComponentcircaCustomerKnowledge']
    ]) {
        const body = contract.documentationText(article(section, code).blocks);
        assert.match(body, /NON-REFUNDABLE/, code);
        assert.match(body, /no restoration, no expiry and no partial redemption/, code);
        assert.match(body, /Common Cart\/Checkout is the sole purchase flow/, code);
        assert.match(body, /historical.*not current Circa activation/i, code);
    }
    const inventory = article('documentation', 'nodicsDocsComponentacceleratorsCircaSourceInventory');
    assert.equal(inventory.blocks.find(block => block.anchor === 'acceleratorsCircaSourceInventory-original-unused-refund-exception').text,
        'Historical unused-coupon refund exception');
    const exception = inventory.blocks.find(block => block.kind === 'table' && block.headers[0] === 'Section')
        .rows.find(row => row[0] === 'circaLocalUnusedRefundExceptionStaffAssignment');
    assert.match(exception[4], /HISTORICAL ONLY.*not current Circa refund activation/);
    for (const section of ['documentation', 'referenceDocumentation']) {
        for (const suffix of ['Component', 'PageMetadata', 'SearchMetadata']) {
            for (const record of contract.readReleaseRecords({ ...release(section), children: [] }, suffix).records) {
                assert.doesNotMatch(JSON.stringify(record), /POST \/nodics\/eWaste\/v0\/marketplace\/:code\/purchase|Ordinary unused-coupon refund policy is a separate Commerce decision|Ordinary coupon refund policy described above remains separate/, record.code);
            }
        }
    }
});

test('historical fixture seals remain self-consistent without shipping predecessor sources', () => {
    for (const fixture of [baseline, predecessor, latestPredecessor, frozen004, frozen005, frozen006])
        for (const section of Object.values(fixture.sections))
            assert.equal(contract.releaseChecksum(section.generatedHashes), section.releaseChecksum);
});

test('only selected documentation files ship and Circa guides use the consolidated catalogue', () => {
    const walk = directory => fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry =>
        entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
    const selected = new Set(Object.values(manifest.sections).flatMap(section => Object.keys(section.generatedHashes || {})));
    for (const file of walk(path.join(root, 'data/docs-v001')))
        assert.ok(selected.has(path.relative(path.join(root, 'data'), file)), file);
    for (const section of ['documentation', 'referenceDocumentation']) {
        for (const suffix of ['Component', 'PageMetadata', 'SearchMetadata']) {
            const records = contract.readReleaseRecords({...release(section), children: []}, suffix).records;
            assert.doesNotMatch(JSON.stringify(records), /circaAssetClassification|circaProductMediaReferences|circaCatalogueCurrentPublicationPlan/);
        }
    }
    const inventory = article('documentation', 'nodicsDocsComponentacceleratorsCircaSourceInventory');
    const publication = inventory.blocks.find(block => block.kind === 'table' && block.headers[0] === 'Signed enterprise');
    assert.equal(publication.rows[0][1], 'circaCataloguePublicationPlan');
    assert.equal(publication.rows[0][2], '46');
    assert.equal(publication.rows.reduce((sum, row) => sum + Number(row[2]), 0), 98);
    assert.match(contract.documentationText(inventory.blocks), /consolidated commerce baseline owns Product classification, localization and media references/);
});

test('current adoption guidance uses the module graph and pinned release, not removed runtime markers', () => {
    const configuration = article('documentation', 'nodicsDocsComponentacceleratorsCircaConfigurationReference');
    const body = contract.documentationText(configuration.blocks);
    assert.match(body, /selected module graph and the exact pinned circa\.ewaste:waste-policy PROJECT release/);
    for (const section of ['documentation', 'referenceDocumentation']) {
        for (const suffix of ['Component', 'PageMetadata', 'SearchMetadata']) {
            for (const record of contract.readReleaseRecords({ ...release(section), children: [] }, suffix).records) {
                assert.doesNotMatch(JSON.stringify(record), /waste\.projectOverlay|waste\.accelerator/, record.code);
            }
        }
    }
});
