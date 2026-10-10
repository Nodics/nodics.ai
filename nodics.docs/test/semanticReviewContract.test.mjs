/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nodics.docs/test/semanticReviewContract @description Rejects unsupported or stale editorial closure without conflating it with Online or provider acceptance. @layer test @owner nodics.docs */
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { qualifySemanticReview } from '../scripts/semantic-review-contract.mjs';
const hash = value => createHash('sha256').update(value).digest('hex');

test('manual review closure binds scope, canonical identity, anchors and exact source bytes', t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-semantic-review-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    for (const name of ['first', 'second']) {
        fs.mkdirSync(path.join(root, 'module/src'), { recursive: true });
        fs.writeFileSync(path.join(root, 'module/src/' + name + '.js'), 'module.exports = {};');
    }
    const definition = { item: 'Owner operations', action: 'Explain the actual owner operations.' };
    const document = { id: 'owner.guide', ownerRoot: path.join(root, 'module'),
        content: 'data/docs-v001/records/guide.js', blocks: [{ kind: 'heading', anchor: 'operations', text: 'Operations' }] };
    const sourceFiles = ['module/src/first.js', 'module/src/second.js'];
    const bundle = { reviewType: 'MANUAL_SEMANTIC_SOURCE_EDITORIAL_REVIEW',
        items: [{ item: definition.item, requestedAction: definition.action, disposition: 'PASS_SOURCE_REVIEW',
            requestedExplanationSatisfied: true, rationale: 'Inspected the exact owner operations and explained their limits without claiming deployment.',
            evidence: [{ documentId: document.id, anchors: ['operations'] }], sourceFiles }],
        canonicalDocuments: { [document.id]: { owner: 'module', componentFile: 'module/' + document.content,
            articleBlocksSha256: hash(JSON.stringify(document.blocks)) } },
        sourceFileSha256: Object.fromEntries(sourceFiles.map(file => [file, hash(fs.readFileSync(path.join(root, file)))])) };
    const inspect = value => qualifySemanticReview(definition, value, [document], root);
    assert.equal(inspect(bundle).status, 'closed-with-evidence');
    assert.equal(inspect(bundle).liveAcceptance.status, 'NOT_EXECUTED');
    const reject = mutate => { const changed = structuredClone(bundle); mutate(changed); assert.equal(inspect(changed).status, 'requires-semantic-review'); };
    reject(value => value.items[0].evidence[0].anchors = ['missing']);
    reject(value => value.canonicalDocuments[document.id].owner = 'foreign');
    reject(value => value.canonicalDocuments[document.id].articleBlocksSha256 = 'stale');
    reject(value => value.sourceFileSha256[sourceFiles[0]] = 'stale');
    reject(value => value.items[0].sourceFiles = ['../outside.js', sourceFiles[1]]);
    reject(value => value.items[0].requestedAction = 'A different review scope');
    reject(value => value.items[0].requestedExplanationSatisfied = false);
    reject(value => value.items[0].rationale = 'keyword');
    reject(value => value.items.push(value.items[0]));
    reject(value => value.items[0].disposition = 'OPEN_CONTENT_GAP');
    assert.equal(qualifySemanticReview({ ...definition, status: 'closed-with-evidence', closureEvidence: ['keyword'] },
        undefined, [document], root).status, 'requires-semantic-review');
    document.blocks.push({ kind: 'paragraph', text: 'New unreviewed explanation' });
    assert.equal(inspect(bundle).status, 'requires-semantic-review');
    document.blocks.pop();
    fs.writeFileSync(path.join(root, sourceFiles[0]), 'changed');
    assert.equal(inspect(bundle).status, 'requires-semantic-review');
});

test('the integrated backlog retains every original scope and current manual evidence', () => {
    const root = fileURLToPath(new URL('../..', import.meta.url));
    const evidenceRoot = path.join(root, 'nodics.docs/test/evidence');
    const original = JSON.parse(fs.readFileSync(path.join(evidenceRoot, 'semantic-documentation-review-2026-10-07.json')));
    const current = JSON.parse(fs.readFileSync(path.join(evidenceRoot, 'semantic-documentation-closure.json')));
    const require = createRequire(import.meta.url);
    const contract = require('../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
    const catalogue = contract.readDataCatalogue(path.join(root, 'nodics.docs'));
    assert.equal(original.items.length, 22);
    assert.equal(current.items.length, original.items.length);
    assert.equal(new Set(current.items.map(item => item.item)).size, current.items.length);
    for (const item of original.items) {
        const result = qualifySemanticReview({ item: item.item, action: item.requestedAction }, current, catalogue.documents, root);
        assert.equal(result.status, 'closed-with-evidence', item.item + ': ' + result.reviewDiagnostic);
        assert.equal(result.reviewDisposition, 'PASS_SOURCE_REVIEW');
    }
});
