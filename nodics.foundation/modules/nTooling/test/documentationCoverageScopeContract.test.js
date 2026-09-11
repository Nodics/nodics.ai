/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/documentationCoverageScopeContract
 * @description Prevents scoped documentation gates from silently inspecting zero files in nested framework layouts.
 * @layer test
 * @owner nTooling
 * @override Add project package layouts while preserving nearest-owner selection and missing-documentation failures.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const coverage = require('../src/service/quality/defaultDocumentationCoverageQualityService');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-doc-scope-'));
/** Create a disposable source package; its npm alias deliberately differs from its folder name. */
function packageAt(relative, alias) {
    const directory = path.join(root, relative);
    fs.mkdirSync(path.join(directory, 'src/service'), { recursive: true });
    fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ name: alias }));
    fs.writeFileSync(path.join(directory, 'src/service/example.js'), 'module.exports = {\n    execute: function () { return true; }\n};\n');
    return path.join(directory, 'src/service/example.js');
}
try {
    const file = packageAt('nodics.foundation/modules/nConfig', 'config');
    const child = packageAt('nodics.foundation/modules/nData/nExport/excelExport', 'excelExport');
    packageAt('nodics.waste/modules/wasteCore', 'wasteCore');
    assert.equal(coverage.getModuleName(file, root), 'nConfig');
    assert.equal(coverage.getModuleName(child, root), 'excelExport');
    assert.equal(coverage.getModuleName('/outside/src/service.js', root), '');
    const report = coverage.collectCoverage(coverage.createOptions(['--home=' + root, '--scope=all', '--module=nConfig']));
    assert.equal(report.filesChecked, 1, 'scoped gate must inspect the actual owning package');
    assert.equal(report.methodsChecked, 1);
    assert.equal(coverage.hasMissingDocumentation(report), true);
    assert.equal(report.methodsMissingDocs.length, 1);
    const packageRootReport = coverage.collectCoverage(coverage.createOptions(['--home=' + path.dirname(path.dirname(path.dirname(file))), '--scope=all', '--module=nConfig']));
    assert.equal(packageRootReport.filesChecked, 1, 'package-root execution must preserve ownership');
} finally {
    fs.rmSync(root, { recursive: true, force: true });
}
console.log('Documentation coverage scope contract validated');
