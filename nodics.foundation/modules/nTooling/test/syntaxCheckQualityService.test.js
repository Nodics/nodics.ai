/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/syntaxCheckQualityService
 * @description Verifies the non-runtime JavaScript syntax gate that backs the framework `check:syntax` script and basic test suite.
 * @layer test
 * @owner nTooling
 * @override Tooling modules may add more fixture coverage without weakening the default requirement that invalid JavaScript syntax fails before runtime tests run.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const syntaxCheckQualityService = require('../src/service/quality/defaultSyntaxCheckQualityService');

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-syntax-check-'));

/**
 * Writes a syntax-check fixture file below the temporary project home.
 * @param {string} relativePath Fixture path.
 * @param {string} content Fixture source content.
 * @returns {string} Absolute fixture path.
 */
function writeFixture(relativePath, content) {
    const filePath = path.join(tempRoot, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    return filePath;
}

try {
    const validFile = writeFixture('src/valid.js', 'module.exports = { ok: true };\n');
    writeFixture('dist/ignored.js', 'function () {\n');
    writeFixture('src/readme.md', '# ignored\n');

    let files = syntaxCheckQualityService.collectFiles(tempRoot, []);
    assert.deepStrictEqual(files, [validFile],
        'Syntax checking must include JavaScript files while skipping ignored folders and non-JS files');

    let result = syntaxCheckQualityService.checkHome(tempRoot);
    assert.strictEqual(result.checked, 1, 'Only the valid source fixture should be checked');
    assert.deepStrictEqual(result.failures, [], 'Valid JavaScript must pass the syntax gate');

    const invalidFile = writeFixture('src/invalid.mjs', 'export const broken = ;\n');
    files = syntaxCheckQualityService.collectFiles(tempRoot, []);
    assert(files.includes(invalidFile), 'MJS files must participate in syntax validation');

    result = syntaxCheckQualityService.checkHome(tempRoot);
    assert.strictEqual(result.checked, 2, 'Valid and invalid JavaScript-family files should be checked');
    assert.strictEqual(result.failures.length, 1, 'Invalid JavaScript syntax must fail the gate');
    assert.strictEqual(result.failures[0].filePath, invalidFile,
        'Failure output must identify the invalid source file');
} finally {
    fs.rmSync(tempRoot, { force: true, recursive: true });
}

console.log('nTooling syntax check quality service validated');
