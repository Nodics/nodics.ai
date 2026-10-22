/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const root = path.resolve(__dirname, '..');
const framework = path.resolve(root, '../../../../../');
const contract = require(path.join(framework, 'nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService'));
const recordValidation = require(path.join(framework, 'nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationRecordValidationService'));

test('agreement canonical CMS guide is scoped, hashed and draft without invented approval', () => {
    const catalogue = contract.validateDataRelease(root);
    const local = catalogue.documents.filter(document => document.ownerRoot === root);
    assert.equal(local.length, 1);
    const guide = local[0];
    assert.equal(guide.id, 'commerce.commercial-agreements');
    assert.equal(guide.routePath, '/docs/framework/commercial-agreements');
    assert.equal(guide.sourceOwner, 'commercialAgreement');
    assert.equal(guide.lifecycleState, 'DRAFT');
    assert.equal(guide.source.checksum, contract.sha256(guide.body));
    assert.equal(guide.source.wordCount, contract.countWords(guide.body));
    assert(contract.countWords(guide.body) >= 1500);
    for (const text of ['expectedRevision', 'commandId', 'FIXED_PRICE', 'SUBSCRIPTION',
        'ALL_ENTERPRISE_COUPONS', 'No automatic', 'Profile', 'unit/source checks only',
        'commerce.agreements / commercialAgreement.history', 'config/properties.js',
        'Every policy read validates', 'without an inline replacement']) {
        assert(guide.body.includes(text), text);
    }
    assert.equal(contract.validateReferenceGraph([{ pack: catalogue.pack, documents: local }]).documents, 1);
    const records = {};
    for (const [key, suffix] of Object.entries({ products: 'Product', navigation: 'Navigation', nodes: 'Node',
        dashboards: 'Dashboard', pages: 'PageMetadata', accessPolicies: 'AccessPolicy',
        publicationStates: 'PublicationState', searchMetadata: 'SearchMetadata',
        cmsPages: 'Page', routes: 'Route', components: 'Component' })) {
        records[key] = contract.readReleaseRecords(catalogue.releaseComposition, suffix).records;
    }
    records.manifestHashes = JSON.parse(fs.readFileSync(path.join(root, 'data/manifest.json'))).sections.documentation.generatedHashes;
    const report = recordValidation.validateRecords({ records, options: { validationScope: 'AUTHORING', owner: 'commercialAgreement' } });
    // Foundation pages link to independently selected owner packs. Their aggregate
    // reference graph is a composition gate, not a reason to invent local copies.
    const inherited = new Set(catalogue.documents.filter(document => document.ownerRoot !== root).map(document => document.id));
    for (const issue of report.issues) {
        assert.equal(issue.rule, 'related-page-reference');
        for (const id of issue.target.split(', ')) assert(inherited.has(id), id);
    }
    assert(report.summary.passed >= 24);
    const states = require('../data/docs-v001/records/documentation/commercialAgreementDocumentationPublicationStateData');
    for (const state of Object.values(states)) {
        assert.equal(state.lifecycleState, 'DRAFT');
        for (const field of ['reviewer', 'approver', 'publisher', 'onlineVersion']) assert(!Object.hasOwn(state, field));
    }
});
