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
 * @module nTest/service/tooling/defaultCapabilityBehaviorTestRunnerService
 * @description Discovers marker-based capability behavior tests across a target project and executes them with optional area filtering.
 * @layer tooling
 * @owner nTest
 * @override Projects may add marked tests or explicitly replace the contributed test command.
 */

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());
const marker = '@nodics-capability-behavior';
const skippedDirectories = new Set(['.git', 'node_modules']);
const areaArg = process.argv.find((arg) => arg.startsWith('--area='));
const selectedArea = areaArg ? areaArg.substring('--area='.length) : null;

/** Executes capability behavior tests when invoked as a tooling command. */


let exportedService;
module.exports = exportedService = {
    /** Implements runCli as an overrideable service operation. */
    runCli: function () {
    const tests = (this.collectCapabilityBehaviorTests || exportedService.collectCapabilityBehaviorTests).call(this, rootPath).sort();

    if (tests.length === 0) {
        const areaText = selectedArea ? ` for area ${selectedArea}` : '';
        console.log(`No capability behavior tests found${areaText}.`);
        process.exit(0);
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

    const areaText = selectedArea ? ` for area ${selectedArea}` : '';
    console.log(`\nCapability behavior tests passed${areaText}: ${tests.length}`);
},

    /** Implements hasSelectedArea as an overrideable service operation. */
    hasSelectedArea: function (content) {
    if (!selectedArea) {
        return true;
    }
    return content.includes(`@nodics-area ${selectedArea}`);
},

    /** Implements collectCapabilityBehaviorTests as an overrideable service operation. */
    collectCapabilityBehaviorTests: function (currentPath, tests = []) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    entries.forEach((entry) => {
        const entryPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
            if (!skippedDirectories.has(entry.name)) {
                (this.collectCapabilityBehaviorTests || exportedService.collectCapabilityBehaviorTests).call(this, entryPath, tests);
            }
            return;
        }

        if (!entry.name.endsWith('.test.js') || !entryPath.split(path.sep).includes('test')) {
            return;
        }

        const content = fs.readFileSync(entryPath, 'utf8');
        if (content.includes(marker) && (this.hasSelectedArea || exportedService.hasSelectedArea).call(this, content)) {
            tests.push(entryPath);
        }
    });

    return tests;
}
};

if (require.main === module) {
    exportedService.runCli();
}
