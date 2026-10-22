/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module nodics.docs/test/commerceSemanticSuccessors
 * @description Verifies cross-owner editorial successors, frozen history and qualified source claims.
 * @owner nodics.docs
 * @layer test
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const contract = require('../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
const schemas = require('../../nodics.wcms/modules/cms/src/schemas/schemas').cms;
const owners = [
    'nodics.docs',
    'nodics.commerce/modules/baseCommerce/modules/promotion',
    'nodics.commerce/modules/digitalCommerce/modules/digitalCore',
    'nodics.commerce/modules/fulfillment/modules/fulfillmentCore',
    'nodics.accelerators/modules/waste/modules/eWaste'
];
const articles = new Map();
const releases = new Map();

for (const owner of owners) {
    const ownerRoot = path.join(root, owner);
    const fixture = require(path.join(ownerRoot, 'test/fixtures/documentationSemanticPredecessor.json'));
    const selected = require(path.join(ownerRoot, 'data/manifest.json')).sections.documentation;
    const groups = {};
    for (const kind of ['Node', 'PageMetadata', 'SearchMetadata', 'Component', 'Page', 'Route', 'PublicationState']) {
        const file = Object.keys(selected.generatedHashes).find(file => file.endsWith(kind + 'Data.js'));
        groups[kind] = Object.values(require(path.join(ownerRoot, 'data', file)));
    }
    for (const row of groups.Component) if (row.properties?.blocks) articles.set(row.properties.code, row.properties);
    releases.set(owner, groups);

    test(owner + ': immutable predecessor and exactly sealed semantic successor', () => {
        assert.equal(selected.version, fixture.successorVersion);
        assert.equal(selected.releaseChecksum, fixture.successorChecksum);
        for (const [file, hash] of Object.entries(fixture.section.generatedHashes))
            assert.equal(contract.sha256(fs.readFileSync(path.join(ownerRoot, 'data', file))), hash, file);
        for (const [file, hash] of Object.entries(selected.generatedHashes))
            assert.equal(contract.sha256(fs.readFileSync(path.join(ownerRoot, 'data', file))), hash, file);
        assert.equal(selected.releaseChecksum, contract.releaseChecksum(selected.generatedHashes));
        assert.equal(contract.validateGeneration(fixture.section, selected), selected);
        assert.throws(() => contract.validateGeneration(fixture.section, {...selected, version: fixture.section.version}));
        assert.deepEqual(selected.includes, fixture.section.includes);
        assert.deepEqual(selected.referenceCatalogues, fixture.section.referenceCatalogues);
        assert.equal(selected.pages, fixture.section.pages);
        assert.equal(selected.destinationRole, 'WCMS_STAGED');
        assert.equal(selected.initialPublicationPolicy, 'ADMIN_INITIATED');
        if (owner === 'nodics.docs') {
            const foundation = require(path.join(ownerRoot, 'data/manifest.json')).sections.foundation;
            contract.validateGeneration(fixture.foundationSection, foundation);
            assert.deepEqual(foundation.generatedHashes, selected.generatedHashes);
            assert.equal(foundation.releaseChecksum, selected.releaseChecksum);
            assert.deepEqual(foundation.includes, []);
        }
    });

    test(owner + ': stable identities, exact metadata and unpublished target seals', () => {
        for (const previous of fixture.previousArticles) {
            const p = articles.get(previous.id);
            assert.ok(p, previous.id);
            assert.equal(p.route, previous.route);
            assert.deepEqual(p.headings.map(({anchor, level}) => ({anchor, level})),
                previous.headings.map(({anchor, level}) => ({anchor, level})));
            assert.deepEqual(p.headings, p.blocks.filter(block => block.kind === 'heading')
                .map(({text, anchor, level}) => ({text, anchor, level})));
            const correction = fixture.corrections.find(row => row.id === p.code);
            assert.equal(contract.sha256(JSON.stringify(p.blocks)), correction?.articleBlocksSha256 || previous.blocksSha256);
            const body = contract.documentationText(p.blocks);
            const candidates = [body, '# ' + p.title + '\n\n' + body, JSON.stringify(p.blocks)];
            assert.ok(candidates.some(text => contract.sha256(text) === p.source.checksum), p.code);
            assert.equal(p.version, selected.version);
            assert.ok(['DRAFT', 'STAGED'].includes(p.lifecycleState), p.code);
            const meta = groups.PageMetadata.find(row => row.documentId === p.code);
            assert.equal(meta.sourcePath, p.source.path);
            assert.equal(p.source.sourcePath, p.source.path);
            assert.equal(meta.sourceChecksum, p.source.checksum);
            assert.equal(meta.sourceWordCount, p.source.wordCount);
            assert.equal(meta.wordCount, p.source.wordCount);
            assert.deepEqual(meta.headings, p.headings);
            assert.deepEqual(meta.sourceEvidence, p.sourceEvidence);
            assert.ok([body, '# ' + p.title + '\n\n' + body].some(text => contract.countWords(text) === p.source.wordCount));
            for (const source of p.sourceEvidence)
                assert.ok(fs.existsSync(path.resolve(ownerRoot, source)), source);
            const search = groups.SearchMetadata.find(row => row.targetCode === meta.code);
            assert.equal(search.searchText, p.searchText, p.code + ': exact canonical search projection');
        }
        const targets = new Map();
        for (const file of Object.keys(selected.generatedHashes).filter(file =>
            file.includes('/records/') && file.endsWith('Data.js') && !file.endsWith('PublicationStateData.js')))
            for (const row of Object.values(require(path.join(ownerRoot, 'data', file)))) targets.set(row.code, row);
        for (const state of groups.PublicationState) {
            assert.ok(targets.has(state.targetCode), state.targetCode);
            assert.equal(state.checksum, contract.sha256(JSON.stringify(targets.get(state.targetCode))));
            assert.equal(state.stagedVersion, selected.version);
            assert.equal(state.lifecycleState, 'STAGED');
            assert.deepEqual(state.auditTrail, []);
            for (const field of ['onlineVersion', 'reviewer', 'approver', 'publisher', 'actor'])
                assert.equal(Object.hasOwn(state, field), false, state.code + ':' + field);
        }
    });
}

test('Digital draft remains non-publicly routable with schema-legal implemented source maturity', () => {
    const groups = releases.get(owners[2]);
    for (const [kind, schema] of [['Node', schemas.cmsDocumentationNode], ['PageMetadata', schemas.cmsDocumentationPage]])
        for (const row of groups[kind]) assert.ok(schema.definition.maturityState.enum.includes(row.maturityState), row.code);
    const p = articles.get('digital.bundle-holdings-gifts');
    const metadata = groups.PageMetadata.find(row => row.documentId === p.code);
    const node = groups.Node.find(row => row.targetDocumentationPage === metadata.code);
    const route = groups.Route.find(row => row.code === metadata.targetRoute);
    for (const row of [p, metadata, node]) assert.equal(row.lifecycleState, 'DRAFT');
    assert.equal(metadata.maturityState, 'IMPLEMENTED');
    assert.equal(node.maturityState, 'IMPLEMENTED');
    // Article editorial maturity uses nTooling's vocabulary, separate from the CMS enum.
    assert.equal(p.maturityState, 'partial');
    assert.equal(route.active, false);
    assert.match(contract.documentationText(p.blocks), /Production acceptance separately verifies/);
});

test('simulation articles use selected-environment admission, preserving unverified history', () => {
    const body = contract.documentationText(articles.get('fulfillment.shipping-management').blocks);
    assert.match(body, /classification neither admits nor denies simulation/);
    assert.match(body, /Retired LOCAL_SIMULATION configuration is rejected/);
    assert.match(body, /Existing ITEM_SIMULATION\/SIMULATED_ITEMS hashes and immutable receipt contents remain historical evidence/);
    for (const id of ['promotion.campaigns-coupon-issuance', 'digital.purchase-delivery-reveal',
        'fulfillment.shipping-management', 'commerce.fulfillment-core-source-map']) {
        const text = contract.documentationText(articles.get(id).blocks);
        assert.match(text, /SIMULATION/, id);
        assert.doesNotMatch(text, /LOCAL-only|must.*class.*LOCAL|Not LOCAL/, id);
    }
});

test('material-value coordinator and independent holdings retain their qualification boundaries', () => {
    const register = contract.documentationText(articles.get('reference.internal-source-boundary-register').blocks);
    assert.match(register, /IMPLEMENTED_ASSESSMENT_AND_RELEASE_COORDINATOR/);
    assert.match(register, /no concrete external provider is qualified here/);
    const circa = contract.documentationText(articles.get('accelerators.circa-operations-rewards').blocks);
    assert.match(circa, /Carbon does not automatically follow certificate ownership/);
    assert.match(circa, /entitlements remain with the original contributor/);
    assert.match(circa, /full attributed-value coverage for the selected allocation before release/);
    assert.match(circa, /lost acknowledgement can mean value has already posted/);
    assert.match(circa, /atomic balance-plus-ledger transaction acceptance remain deployment gates/);
    assert.doesNotMatch(circa, /Attached illustrative carbon can move/);
});

test('Digital historical original-sale records do not advertise executable retired refund phases', () => {
    const text = contract.documentationText(articles.get('digital.purchase-delivery-reveal').blocks);
    assert.match(text, /refund-preview phase returns ineligible with COMPLETED_BUNDLE_FINAL_SALE/);
    assert.match(text, /historical phase map below explains retained evidence only/);
    assert.match(text, /Incomplete purchases require recovery of the original Checkout command/);
    assert.doesNotMatch(text, /The supported source path reverses original seller proceeds/);
});
