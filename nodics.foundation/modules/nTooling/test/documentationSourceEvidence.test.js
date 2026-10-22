/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/documentationSourceEvidence @description Verifies local file and Markdown section citations without weakening missing-source refusal. @layer test @owner nTooling */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const contract = require('../src/service/defaultApplicationDocumentationContractService');

test('the current Product citation resolves its real owner file and heading', () => {
    const owner = path.resolve(__dirname, '../../../../nodics.commerce/modules/baseCommerce/modules/product');
    const citation = 'llm/contracts/README.md#public-coupon-browsing';
    const result = contract.validateSourceEvidence(owner, citation);
    assert.equal(result.path, path.join(owner, 'llm/contracts/README.md'));
    assert.equal(result.anchor, 'public-coupon-browsing');
    assert.throws(() => contract.validateSourceEvidence(owner, citation + '-missing'), /Missing source section anchor/);
});

test('source citations preserve file checks and validate decoded headings outside fenced examples', t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-source-evidence-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    fs.writeFileSync(path.join(root, 'source guide.md'), [
        '# Source',
        '## Public Coupon Browsing',
        '```markdown',
        '## Fenced False Evidence',
        '```',
        '~~~markdown',
        '## Tilde False Evidence',
        '~~~',
        '## Public Coupon Browsing',
        '### Encoded Heading',
    ].join('\n'));
    fs.writeFileSync(path.join(root, 'source.js'), '// not Markdown');
    const resolve = evidence => contract.validateSourceEvidence(root, evidence);
    assert.equal(resolve('source%20guide.md#public-coupon-browsing').path, path.join(root, 'source guide.md'));
    assert.equal(resolve('source guide.md#public-coupon-browsing-1').anchor, 'public-coupon-browsing-1');
    assert.equal(resolve('source guide.md#%65ncoded-heading').anchor, 'encoded-heading');
    assert.equal(resolve('source.js').path, path.join(root, 'source.js'));
    assert.equal(resolve('.').path, root);
    for (const anchor of ['missing', 'fenced-false-evidence', 'tilde-false-evidence'])
        assert.throws(() => resolve('source guide.md#' + anchor), /Missing source section anchor/);
    assert.throws(() => resolve('missing.md#public-coupon-browsing'), /Missing source evidence/);
    assert.throws(() => resolve('source.js#not-markdown'), /requires a Markdown file/);
    assert.throws(() => resolve('source guide.md?revision=future#public-coupon-browsing'), /Invalid local source evidence/);
    assert.throws(() => resolve('source guide.md#%broken'), /Invalid local source evidence/);
    assert.throws(() => resolve('https://example.invalid/source.md#public-coupon-browsing'), /Invalid local source evidence/);
});
