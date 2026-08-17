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

console.log('Service export style governance contract validated');
