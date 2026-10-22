/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module customerFeedback/test/customerFeedbackBoundaryContract
 * @description Verifies that the implemented CustomerFeedback package is documented and metadata-aligned.
 * @layer test
 * @owner customerFeedback
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const moduleRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8'));
const readme = fs.readFileSync(path.join(moduleRoot, 'README.md'), 'utf8');
const contract = fs.readFileSync(path.join(moduleRoot, 'llm/contracts/README.md'), 'utf8');

assert.strictEqual(packageJson.name, 'customerFeedback');
assert.strictEqual(packageJson.nodics.kind, 'capability');
assert.deepStrictEqual([...packageJson.nodics.owns].sort(), ["configuration","schema","service","test","llm","data"].sort());
assert.strictEqual(packageJson.nodics.runtime.router, false);
assert(fs.existsSync(path.join(moduleRoot, 'src/schemas/schemas.js')), 'customerFeedback must contain implemented schemas');
const manifest = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'data/manifest.json'), 'utf8'));
const permissions = manifest.sections.permissionCatalogue;
assert.strictEqual(permissions.owningDomain, packageJson.name);
assert.strictEqual(permissions.selectionPolicy, 'EXPLICIT');
assert.strictEqual(permissions.destinationRole, 'PLATFORM');
assert(Object.keys(permissions.files).length > 0, 'Owner permission data must be governed by an explicit release');
assert(!fs.existsSync(path.join(moduleRoot, 'docs')), 'customerFeedback must not contain module-local docs');
assert(!fs.existsSync(path.join(moduleRoot, 'llm/README.md')), 'customerFeedback must use AGENTS.md for AI navigation');
assert(readme.includes('## Capability status'), 'customerFeedback README must expose implementation status');
assert(contract.includes('Status: implemented'), 'customerFeedback contract must expose implemented behavior');
assert(!readme.includes('Generated documentation entry'), 'customerFeedback README must not retain placeholder guidance');

console.log('CustomerFeedback implemented boundary contract validated');
