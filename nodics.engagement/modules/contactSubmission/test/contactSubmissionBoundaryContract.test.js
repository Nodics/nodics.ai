/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module contactSubmission/test/contactSubmissionBoundaryContract
 * @description Verifies the Contact Submission ownership and implementation boundary.
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
assert.deepStrictEqual([...packageJson.nodics.owns].sort(), ["configuration","schema","service","utility","test","llm","data"].sort());
assert.strictEqual(packageJson.nodics.runtime.router, false);
assert(fs.existsSync(path.join(moduleRoot, 'src/schemas/schemas.js')), 'contactSubmission schemas must exist');
const manifest = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'data/manifest.json'), 'utf8'));
const permissions = manifest.sections.permissionCatalogue;
assert.strictEqual(permissions.owningDomain, packageJson.name);
assert.strictEqual(permissions.selectionPolicy, 'EXPLICIT');
assert.strictEqual(permissions.destinationRole, 'PLATFORM');
assert(Object.keys(permissions.files).length > 0, 'Owner permission data must be governed by an explicit release');
assert(!fs.existsSync(path.join(moduleRoot, 'docs')), 'contactSubmission must not contain module-local docs');
assert(!fs.existsSync(path.join(moduleRoot, 'llm/README.md')), 'contactSubmission must use AGENTS.md for AI navigation');
assert(readme.includes('## Capability status'), 'contactSubmission README must expose implementation status');
assert(contract.includes('Status: backend vertical slice implemented'), 'contactSubmission contract must expose implementation status');
assert(!readme.includes('Generated documentation entry'), 'contactSubmission README must not retain placeholder guidance');

console.log('ContactSubmission boundary contract validated');
