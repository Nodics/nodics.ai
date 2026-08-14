/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/ownershipLanguageGovernance
 * @description Validates ownership-language checks that stop consumer acceptance wording from becoming false framework ownership.
 * @layer test
 * @owner nTooling
 * @override Projects may add stricter wording checks, but must not remove the base consumer/frontend/server ownership boundary assertions.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const ownershipLanguage = require('../src/service/quality/defaultOwnershipLanguageQualityService');

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-ownership-language-'));
const kickoffBadOwnership = 'Kickoff owns the WCMS Designer authoring contract.';
const axisBadOwnership = 'Axis frontend owns backend-importable CMS records.';
const runtimeBadOwnership = 'The runtime server owns the module lifecycle contract.';

fs.writeFileSync(
    path.join(tempRoot, 'bad.md'),
    [
        kickoffBadOwnership,
        axisBadOwnership,
        runtimeBadOwnership
    ].join('\n'),
    'utf8'
);
fs.writeFileSync(
    path.join(tempRoot, 'good.md'),
    [
        'Kickoff must not own the WCMS Designer authoring contract.',
        'Axis renders backend-owned CMS records but does not own importable data.',
        'The runtime server composes functional modules and never owns the module lifecycle contract.'
    ].join('\n'),
    'utf8'
);

const report = ownershipLanguage.inspectFiles({ rootDir: tempRoot });
assert.strictEqual(report.filesChecked, 2);
assert.strictEqual(report.findings.length, 4);
assert(report.findings.some(finding => finding.code === 'consumer-project-framework-contract-owner'));
assert(report.findings.some(finding => finding.code === 'consumer-project-named-authoring-contract'));
assert(report.findings.some(finding => finding.code === 'frontend-backend-data-owner'));
assert(report.findings.some(finding => finding.code === 'runtime-server-functional-module-owner'));

console.log('Ownership-language governance validated');
