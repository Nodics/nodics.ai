/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module engagementCore/test/engagementCoreBoundaryContract
 * @description Verifies that EngagementCore owns only its internal shared contracts.
 * @layer test
 * @owner engagementCore
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const moduleRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8'));
const readme = fs.readFileSync(path.join(moduleRoot, 'README.md'), 'utf8');
const contract = fs.readFileSync(path.join(moduleRoot, 'llm/contracts/README.md'), 'utf8');

assert.strictEqual(packageJson.name, 'engagementCore');
assert.strictEqual(packageJson.nodics.kind, 'capability');
assert.deepStrictEqual(packageJson.nodics.owns, ['configuration', 'schema', 'service', 'utility', 'test', 'llm']);
assert.strictEqual(packageJson.nodics.runtime.router, false);
assert(fs.existsSync(path.join(moduleRoot, 'src/schemas/schemas.js')), 'engagementCore schemas must exist');
assert(fs.existsSync(path.join(moduleRoot, 'src/service/defaultEngagementIntakeService.js')), 'engagementCore intake service must exist');
assert(!fs.existsSync(path.join(moduleRoot, 'data')), 'engagementCore must not contain data before it owns seed data');
assert(!fs.existsSync(path.join(moduleRoot, 'docs')), 'engagementCore must not contain module-local docs');
assert(!fs.existsSync(path.join(moduleRoot, 'llm/README.md')), 'engagementCore must use AGENTS.md for AI navigation');
assert(readme.includes('## Capability status'), 'engagementCore README must expose implementation status');
assert(contract.includes('Status: implemented core contracts'), 'engagementCore contract must expose implementation status');
assert(!readme.includes('Generated documentation entry'), 'engagementCore README must not retain placeholder guidance');

console.log('EngagementCore boundary contract validated');
