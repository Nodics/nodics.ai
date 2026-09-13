/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nTooling/test/serviceExportStyleGovernanceContract
 * @description Ensures framework-governed service files reject non-mergeable
 * JavaScript function styles that bypass Nodics service override behavior.
 * @layer test
 * @owner nTooling
 * @override Projects may add stricter style-governance coverage while
 * preserving the framework service export contract.
 */

const assert = require('assert');
const designPrincipleAuditService = require('../src/service/quality/defaultDesignPrincipleAuditService');

const failures = [];
designPrincipleAuditService.auditServiceExportStyle.call({
    /**
     * Supplies focused source fixtures for service export style governance.
     *
     * @param {string} relativePath Fixture source path.
     * @returns {string} Fixture source content.
     */
    readSourceForStyleGovernance: function (relativePath) {
        if (relativePath === 'validService.js') {
            return [
                'module.exports = {',
                '    readManifest: function (projectRoot) {',
                '        return projectRoot;',
                '    }',
                '};'
            ].join('\n');
        }
        return [
            'module.exports = {',
            '    readManifest(projectRoot) {',
            '        return projectRoot;',
            '    }',
            '};',
            'function hiddenHelper() {',
            '    return true;',
            '}',
            'export function leakedEntrypoint() {',
            '    return false;',
            '}',
            'module.exports = {',
            '    initSession: app => app',
            '};'
        ].join('\n');
    },

    /**
     * Records a style governance failure in the target collection.
     *
     * @param {string[]} target Mutable failure collection.
     * @param {string} message Failure message.
     * @returns {void}
     */
    fail: function (target, message) {
        target.push(message);
    }
}, failures, ['validService.js', 'invalidService.js']);

assert.strictEqual(failures.length, 4, 'style governance must report each non-mergeable function style once');
assert.ok(failures[0].includes('invalidService.js:2 uses shorthand object method'),
    'style governance must reject shorthand object service methods');
assert.ok(failures[1].includes('invalidService.js:6 uses top-level named function'),
    'style governance must reject top-level named functions');
assert.ok(failures[2].includes('invalidService.js:9 uses ESM function/default object export'),
    'style governance must reject ESM function exports in governed CommonJS service files');
assert.ok(failures[3].includes('invalidService.js:13 uses arrow function member'),
    'style governance must reject arrow function members in governed CommonJS service files');

const nestedFailures = [];
designPrincipleAuditService.auditServiceExportStyle.call({
    /** Supplies a fixture containing legal nested callbacks. */
    readSourceForStyleGovernance: function () {
        return 'module.exports = { run: function () { if (true) { return { callback: value => value, nestedMethod() { return true; } }; } } };';
    },
    /** Collects unexpected findings from the nested callback fixture. */
    fail: function (target, message) { target.push(message); }
}, nestedFailures, ['nestedCallbackService.js']);
assert.deepStrictEqual(nestedFailures, [], 'nested callbacks and control flow are not exported method declarations');

const fs = require('fs');
const path = require('path');
const os = require('os');
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-export-coverage-'));
try {
    const runtimeRoot = path.join(fixtureRoot, 'newCapability');
    const toolingRoot = path.join(fixtureRoot, 'notRuntime');
    for (const directory of [runtimeRoot, toolingRoot]) fs.mkdirSync(path.join(directory, 'src', 'service'), { recursive: true });
    fs.writeFileSync(path.join(runtimeRoot, 'package.json'), JSON.stringify({ nodics: { runtimeModule: true, loadableByNodicsModuleLoader: true } }));
    fs.writeFileSync(path.join(toolingRoot, 'package.json'), JSON.stringify({ nodics: { runtimeModule: false, loadableByNodicsModuleLoader: false } }));
    fs.writeFileSync(path.join(runtimeRoot, 'src', 'service', 'newOwnerService.js'), 'module.exports = {};');
    fs.writeFileSync(path.join(toolingRoot, 'src', 'service', 'toolService.js'), 'module.exports = {};');
    fs.mkdirSync(path.join(runtimeRoot, 'src', 'service', 'gen'));
    fs.writeFileSync(path.join(runtimeRoot, 'src', 'service', 'gen', 'generatedService.js'), 'module.exports = {};');
    assert.deepStrictEqual(designPrincipleAuditService.getServiceExportStyleGovernancePaths(fixtureRoot), ['newCapability/src/service/newOwnerService.js']);
} finally { fs.rmSync(fixtureRoot, { recursive: true, force: true }); }

console.log('Service export style governance contract validated');
