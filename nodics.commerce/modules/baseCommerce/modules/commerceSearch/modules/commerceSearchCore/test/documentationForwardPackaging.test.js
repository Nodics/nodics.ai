/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module commerceSearchCore/test/documentationForwardPackaging
 * @description Validates consolidated source CMS identities, metadata and unpublished target seals.
 * @owner commerceSearchCore
 * @layer test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const contract = require('../../../../../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
const root = path.resolve(__dirname, '..');
const selected = require('../data/manifest.json').sections.documentation;
const groups = {};
for (const file of Object.keys(selected.generatedHashes)) {
    if (file.includes('/records/documentation/') && file.endsWith('Data.js')) {
        const kind = path.basename(file).replace(/^.*Documentation(?:Release\d+)?/, '').replace('Data.js', '');
        groups[kind] = Object.values(require(path.join(root, 'data', file)));
    }
}

test('consolidated CMS release has exact checksums and one record per target identity', () => {
    assert.equal(selected.contentPath, 'docs-v001');
    assert.equal(selected.sourceAuthority, 'data/docs-v001/records/documentation');
    for (const [file, hash] of Object.entries(selected.generatedHashes)) {
        assert.equal(contract.sha256(fs.readFileSync(path.join(root, 'data', file))), hash, file);
    }
    assert.equal(selected.releaseChecksum, contract.releaseChecksum(selected.generatedHashes));
    for (const rows of Object.values(groups))
        assert.equal(new Set(rows.map(row => row.code)).size, rows.length);
    assert.doesNotThrow(() => contract.validateDataRelease(root));
});

test('selected articles retain source metadata and owner evidence', () => {
    const articles = groups.Component.filter(row => Array.isArray(row.properties?.blocks));
    assert.ok(articles.length);
    for (const row of articles) {
        const p = row.properties;
        assert.equal(p.version, selected.version);
        assert.ok(p.source.path.startsWith(selected.sourceAuthority + '/'));
        assert.equal(p.source.sourcePath, p.source.path);
        const meta = groups.PageMetadata.find(item => item.sourcePath === p.source.path &&
            item.sourceChecksum === p.source.checksum && item.title === p.title);
        assert.ok(meta, p.code);
        assert.equal(meta.sourceWordCount, p.source.wordCount);
        assert.deepEqual(meta.headings, p.headings);
        assert.deepEqual(meta.sourceEvidence, p.sourceEvidence);
        for (const source of p.sourceEvidence) assert.ok(fs.existsSync(path.resolve(root, source)), source);
    }
});

test('target seals remain unpublished without invented approvals or runtime adoption', () => {
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
});
