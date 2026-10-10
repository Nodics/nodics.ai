/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/documentationReferenceGraph @description Verifies stable cross-owner references without duplicate content or implicit pack imports. @layer test @owner nTooling */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const contract = require('../src/service/defaultApplicationDocumentationContractService');

/** Models two independently owned optional documentation packs. */
function catalogues() {
    return [
        { pack: 'partner.accelerator', documents: [{ id: 'accelerator.journey', sourceOwner: 'partner.accelerator',
            routePath: '/docs/accelerator/journey', relatedPages: ['commerce.orders'],
            references: [{ documentId: 'commerce.orders', owner: 'commerce', anchor: 'order-approval' }] }] },
        { pack: 'commerce', documents: [{ id: 'commerce.orders', sourceOwner: 'commerce',
            routePath: '/docs/commerce/orders', headings: [{ anchor: 'order-approval' }] }] }
    ];
}

test('a shared capability is referenced by identity, owner and stable anchor without copying its article', () => {
    const selected = catalogues(), before = JSON.stringify(selected);
    const result = contract.validateReferenceGraph(selected);
    assert.equal(result.documents, 2);
    assert.equal(result.routes, 2);
    assert.equal(result.edges.length, 2);
    assert.equal(result.edges[1].anchor, 'order-approval');
    assert.equal(result.edges[1].targetPack, 'commerce');
    assert.equal(JSON.stringify(selected), before, 'Reference validation must not mutate content or configuration');
});

test('missing optional targets are reported without implicit installation', () => {
    assert.throws(() => contract.validateReferenceGraph([catalogues()[0]]), /unavailable canonical document/);
    assert.throws(() => contract.validateReferenceGraph([]), /Select documentation catalogues/);
});

test('duplicate identities and routes cannot create competing canonical detail', () => {
    const duplicateId = catalogues();
    duplicateId[1].documents.push({ ...duplicateId[0].documents[0] });
    assert.throws(() => contract.validateReferenceGraph(duplicateId), /Duplicate canonical document/);
    const duplicateRoute = catalogues();
    duplicateRoute[1].documents[0].routePath = duplicateRoute[0].documents[0].routePath;
    assert.throws(() => contract.validateReferenceGraph(duplicateRoute), /Duplicate canonical documentation route/);
});

test('incorrect owners and removed section anchors fail the reference gate', () => {
    const wrongOwner = catalogues();
    wrongOwner[0].documents[0].references[0].owner = 'customer-copy';
    assert.throws(() => contract.validateReferenceGraph(wrongOwner), /incorrectly owned reference/);
    const missingAnchor = catalogues();
    missingAnchor[0].documents[0].references[0].anchor = 'renamed-heading';
    assert.throws(() => contract.validateReferenceGraph(missingAnchor), /unknown section anchor/);
});
