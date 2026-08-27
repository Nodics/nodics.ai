/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module testimonial/test/testimonialBoundaryContract
 * @description Verifies that the implemented Testimonial package is documented and metadata-aligned.
 * @layer test
 * @owner testimonial
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const moduleRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8'));
const readme = fs.readFileSync(path.join(moduleRoot, 'README.md'), 'utf8');
const contract = fs.readFileSync(path.join(moduleRoot, 'llm/contracts/README.md'), 'utf8');

assert.strictEqual(packageJson.name, 'testimonial');
assert.strictEqual(packageJson.nodics.kind, 'capability');
assert.deepStrictEqual(packageJson.nodics.owns, ['configuration', 'schema', 'service', 'test', 'llm']);
assert.strictEqual(packageJson.nodics.runtime.router, false);
assert(!fs.existsSync(path.join(moduleRoot, 'data')), 'testimonial must not contain data before it owns seed data');
assert(!fs.existsSync(path.join(moduleRoot, 'docs')), 'testimonial must not contain module-local docs');
assert(!fs.existsSync(path.join(moduleRoot, 'llm/README.md')), 'testimonial must use AGENTS.md for AI navigation');
assert(fs.existsSync(path.join(moduleRoot, 'src/schemas/schemas.js')), 'testimonial must contain implemented schemas');
assert(readme.includes('## Capability status'), 'testimonial README must expose implementation status');
assert(contract.includes('Status: implemented'), 'testimonial contract must expose implemented behavior');
assert(!readme.includes('Generated documentation entry'), 'testimonial README must not retain placeholder guidance');

console.log('Testimonial implemented boundary contract validated');
