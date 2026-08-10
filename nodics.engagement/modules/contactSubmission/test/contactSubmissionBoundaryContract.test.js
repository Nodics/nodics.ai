/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module contactSubmission/test/contactSubmissionBoundaryContract
 * @description Verifies the Phase 4 Contact Submission ownership and implementation boundary.
 * @layer test
 * @owner contactSubmission
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const moduleRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8'));
const readme = fs.readFileSync(path.join(moduleRoot, 'README.md'), 'utf8');
const contract = fs.readFileSync(path.join(moduleRoot, 'llm/contracts/README.md'), 'utf8');

assert.strictEqual(packageJson.name, 'contactSubmission');
assert.strictEqual(packageJson.nodics.kind, 'capability');
assert.deepStrictEqual(packageJson.nodics.owns, ['configuration', 'schema', 'service', 'utility', 'test', 'llm']);
assert.strictEqual(packageJson.nodics.runtime.router, false);
assert(fs.existsSync(path.join(moduleRoot, 'src/schemas/schemas.js')), 'Phase 4 schemas must exist');
assert(!fs.existsSync(path.join(moduleRoot, 'data')), 'Phase 1 contactSubmission must not contain data');
assert(!fs.existsSync(path.join(moduleRoot, 'docs')), 'contactSubmission must not contain module-local docs');
assert(!fs.existsSync(path.join(moduleRoot, 'llm/README.md')), 'contactSubmission must use AGENTS.md for AI navigation');
assert(readme.includes('## Phase 4 status'), 'contactSubmission README must expose implementation status');
assert(contract.includes('Status: backend vertical slice implemented'), 'contactSubmission contract must expose implementation status');
assert(!readme.includes('Generated documentation entry'), 'contactSubmission README must not retain placeholder guidance');

console.log('ContactSubmission Phase 4 boundary contract validated');
