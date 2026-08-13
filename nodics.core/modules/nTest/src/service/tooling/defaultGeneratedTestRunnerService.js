/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 * @module nTest/service/tooling/defaultGeneratedTestRunnerService
 * @description Discovers and executes generated schema, API, API-scenario, and opt-in destructive CRUD tests across a target Nodics project.
 * @layer tooling
 * @owner nTest
 * @override Projects may contribute generated tests or explicitly replace this command without bypassing destructive-test selection.
 */

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());
const skippedDirectories = new Set(['.git', 'node_modules']);
const destructiveTestTypes = new Set(['crud']);


let exportedService;
module.exports = exportedService = {
    /** Implements isGeneratedTestPath as an overrideable service operation. */
    isGeneratedTestPath: function (testPath, options = {}) {
    const selectedType = options.selectedType || null;
    const includeDestructive = !!options.includeDestructive;
    const parts = testPath.split(path.sep);
    const testIndex = parts.lastIndexOf('test');
    if (testIndex < 0) {
        return false;
    }
    if (parts[testIndex + 1] !== 'gen') {
        return false;
    }
    if (selectedType && parts[testIndex + 2] !== selectedType) {
        return false;
    }
    if (!includeDestructive && !selectedType && destructiveTestTypes.has(parts[testIndex + 2])) {
        return false;
    }
    return testPath.endsWith('.test.js');
},

    /** Implements collectGeneratedTests as an overrideable service operation. */
    collectGeneratedTests: function (currentPath, tests = [], options = {}) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    entries.forEach((entry) => {
        const entryPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
            if (!skippedDirectories.has(entry.name)) {
                (this.collectGeneratedTests || exportedService.collectGeneratedTests).call(this, entryPath, tests, options);
            }
            return;
        }

        if ((this.isGeneratedTestPath || exportedService.isGeneratedTestPath).call(this, entryPath, options)) {
            tests.push(entryPath);
        }
    });

    return tests;
},

    /** Implements runCli as an overrideable service operation. */
    runCli: function () {
    const typeArg = process.argv.find((arg) => arg.startsWith('--type='));
    const selectedType = typeArg ? typeArg.substring('--type='.length) : null;
    const tests = (this.collectGeneratedTests || exportedService.collectGeneratedTests).call(this, rootPath, [], {
        selectedType: selectedType,
        includeDestructive: !!selectedType
    }).sort();

    if (tests.length === 0) {
        const typeText = selectedType ? ` for type ${selectedType}` : '';
        console.error(`No generated tests found${typeText}. Run npm run build to generate them.`);
        process.exit(1);
    }

    tests.forEach((testPath) => {
        const relativePath = path.relative(rootPath, testPath);
        console.log(`\nRunning ${relativePath}`);
        const result = spawnSync(process.execPath, [testPath], {
            cwd: rootPath,
            stdio: 'inherit'
        });

        if (result.status !== 0) {
            process.exit(result.status || 1);
        }
    });

    const typeText = selectedType ? ` for type ${selectedType}` : '';
    console.log(`\nGenerated tests passed${typeText}: ${tests.length}`);
}
};

if (require.main === module) {
    exportedService.runCli();
}
