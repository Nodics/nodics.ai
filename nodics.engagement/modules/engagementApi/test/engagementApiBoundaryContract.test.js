/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module engagementApi/test/engagementApiBoundaryContract
 * @description Verifies the Engagement API ownership and secured router boundary.
 * @layer test
 * @owner engagementApi
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const moduleRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8'));
const readme = fs.readFileSync(path.join(moduleRoot, 'README.md'), 'utf8');
const contract = fs.readFileSync(path.join(moduleRoot, 'llm/contracts/README.md'), 'utf8');

assert.strictEqual(packageJson.name, 'engagementApi');
assert.strictEqual(packageJson.nodics.kind, 'capability');
assert.deepStrictEqual(packageJson.nodics.owns, ['configuration', 'router', 'controller', 'facade', 'service', 'utility', 'test', 'llm']);
assert.strictEqual(packageJson.nodics.runtime.router, true);
assert(fs.existsSync(path.join(moduleRoot, 'src/router/routers.js')), 'engagementApi router must exist');
assert(!fs.existsSync(path.join(moduleRoot, 'data')), 'engagementApi must not contain data before it owns seed data');
assert(!fs.existsSync(path.join(moduleRoot, 'docs')), 'engagementApi must not contain module-local docs');
assert(!fs.existsSync(path.join(moduleRoot, 'llm/README.md')), 'engagementApi must use AGENTS.md for AI navigation');
assert(readme.includes('## Capability status'), 'engagementApi README must expose implementation status');
assert(contract.includes('Status: secured foundation implemented'), 'engagementApi contract must expose implementation status');
assert(!readme.includes('Generated documentation entry'), 'engagementApi README must not retain placeholder guidance');

console.log('EngagementApi boundary contract validated');
