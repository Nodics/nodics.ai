/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module customerReview/test/customerReviewBoundaryContract
 * @description Verifies that the Phase 1 CustomerReview package is documented, source-free, and metadata-aligned.
 * @layer test
 * @owner customerReview
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const moduleRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8'));
const readme = fs.readFileSync(path.join(moduleRoot, 'README.md'), 'utf8');
const contract = fs.readFileSync(path.join(moduleRoot, 'llm/contracts/README.md'), 'utf8');

assert.strictEqual(packageJson.name, 'customerReview');
assert.strictEqual(packageJson.nodics.kind, 'capability');
assert.deepStrictEqual(packageJson.nodics.owns, ['configuration', 'schema', 'service', 'test', 'llm']);
assert.strictEqual(packageJson.nodics.runtime.router, false);
assert(fs.existsSync(path.join(moduleRoot, 'src/schemas/schemas.js')), 'customerReview must contain implemented schemas');
assert(!fs.existsSync(path.join(moduleRoot, 'data')), 'Phase 1 customerReview must not contain data');
assert(!fs.existsSync(path.join(moduleRoot, 'docs')), 'customerReview must not contain module-local docs');
assert(!fs.existsSync(path.join(moduleRoot, 'llm/README.md')), 'customerReview must use AGENTS.md for AI navigation');
assert(readme.includes('## Phase 8 status'), 'customerReview README must expose implementation status');
assert(contract.includes('Status: implemented'), 'customerReview contract must expose implemented behavior');
assert(!readme.includes('Generated documentation entry'), 'customerReview README must not retain placeholder guidance');

console.log('CustomerReview implemented boundary contract validated');
