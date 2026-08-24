/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/fullTestSuiteCoverageContract
 * @description Guards the full Nodics test command surface so import,
 * workflow, cron, NEMS, tenant, and distributed-communication coverage remains
 * wired into executable package gates instead of living only as documentation.
 * @layer test
 * @owner nTooling
 * @override Projects may add stricter release suites, but must preserve these
 * framework-owned capability and topology gates unless a reviewed replacement
 * provides equivalent coverage.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../../../..');
const scripts = require(path.join(repositoryRoot, 'package.json')).scripts || {};
const testSuites = require('../config/properties').tooling.testSuites || {};

function requireScript(scriptName) {
    assert(scripts[scriptName], 'Missing npm script: ' + scriptName);
    return scripts[scriptName];
}

function requireScriptIncludes(scriptName, expectedFragments) {
    const script = requireScript(scriptName);
    expectedFragments.forEach(fragment => {
        assert(
            script.includes(fragment),
            scriptName + ' must include `' + fragment + '` so full-suite coverage remains wired'
        );
    });
}

function suiteTokens(suiteName, stack = []) {
    const suite = testSuites[suiteName];
    assert(suite, 'Missing configured test suite: ' + suiteName);
    assert(!stack.includes(suiteName), 'Circular configured test suite reference: ' + stack.concat(suiteName).join(' -> '));
    return suite.reduce((tokens, step) => {
        if (step.suite) {
            return tokens.concat('suite:' + step.suite, suiteTokens(step.suite, stack.concat(suiteName)));
        }
        if (step.npm) {
            return tokens.concat(step.npm, step.args || []);
        }
        if (step.node) {
            return tokens.concat(step.node, step.args || []);
        }
        if (step.tool) {
            return tokens.concat(step.tool, step.args || []);
        }
        return tokens.concat(JSON.stringify(step));
    }, []);
}

function requireSuiteIncludes(suiteName, expectedFragments) {
    const tokens = suiteTokens(suiteName);
    expectedFragments.forEach(fragment => {
        assert(
            tokens.some(token => token.includes(fragment)),
            suiteName + ' suite must include `' + fragment + '` so full-suite coverage remains wired'
        );
    });
}

function requireFile(relativePath) {
    assert(
        fs.existsSync(path.join(repositoryRoot, relativePath)),
        'Missing full-suite coverage file: ' + relativePath
    );
}

requireScriptIncludes('test:basic', ['test:suite --suite=basic']);
requireScriptIncludes('test:full', ['test:suite --suite=full']);
requireScriptIncludes('test:import', ['test:suite --suite=import']);
requireScriptIncludes('release:check', ['release:check']);

requireSuiteIncludes('basic', [
    'suite:import',
    'suite:cronjob',
    'suite:ems'
]);

requireSuiteIncludes('full', [
    'basic'
]);

requireSuiteIncludes('import', [
    'importTenantPrecedence.test.js',
    'testTenantImportIsolation.test.js',
    'importLifecycleContract.test.js',
    'remoteImportTransportGovernance.test.js',
    'remoteImportInitializerContract.test.js',
    'importGovernanceLifecycleContract.test.js',
    'importExportAccessPolicy.test.js'
]);

requireSuiteIncludes('workflow', [
    'workflowLifecyclePipelineContract.test.js'
]);

requireSuiteIncludes('cronjob', [
    'cronJobServiceLifecycleContract.test.js',
    'cronJobRuntimeServiceContract.test.js',
    'cronJobEventHandlerContract.test.js'
]);

requireSuiteIncludes('ems', [
    'emsClientRouteContract.test.js',
    'messageTenantResolution.test.js',
    'emsClientServiceContract.test.js',
    'emsMessageProcessContract.test.js'
]);

[
    'test:basic:report',
    'test:full:report',
    'test:import:report'
].forEach(scriptName => {
    requireScriptIncludes(scriptName, ['test:report']);
});

[
    'nodics.foundation/modules/nData/nImport/import/test/importTenantPrecedence.test.js',
    'nodics.foundation/modules/nData/nImport/import/test/testTenantImportIsolation.test.js',
    'nodics.foundation/modules/nData/nImport/import/test/importGovernanceLifecycleContract.test.js',
    'nodics.foundation/modules/nTooling/test/dependencyOwnershipContract.test.js',
    'nodics.foundation/modules/nTooling/test/releaseCheckCommandContract.test.js',
    'nodics.process/modules/cronjob/test/cronJobRuntimeServiceContract.test.js',
    'nodics.process/modules/cronjob/test/cronJobEventHandlerContract.test.js',
    'nodics.foundation/modules/nEms/emsClient/test/messageTenantResolution.test.js',
    'nodics.foundation/modules/nEms/emsClient/test/emsMessageProcessContract.test.js'
].forEach(requireFile);

console.log('Full test suite coverage contract validated');
