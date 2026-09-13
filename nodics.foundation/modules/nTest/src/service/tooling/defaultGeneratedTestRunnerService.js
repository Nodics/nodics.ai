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
    if (!fs.existsSync(currentPath)) return tests;
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

    /**
     * Resolves generated-test ownership from an explicit root or selected runtime metadata.
     * @param {string[]} args Command arguments.
     * @param {Object} environment Environment values.
     * @returns {string} Selected generated test root.
     */
    resolveTestRoot: function (args = process.argv.slice(2), environment = process.env) {
        const rootArg = args.find(value => value.startsWith('--root='));
        if (rootArg) return path.resolve(rootArg.slice('--root='.length));
        const home = path.resolve(environment.CUSTOM_HOME || environment.NODICS_PROJECT_ROOT || environment.NODICS_HOME || process.cwd());
        const metadataPath = path.join(home, 'package.json');
        if (!fs.existsSync(metadataPath)) return home;
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        if (metadata.nodics && metadata.nodics.kind === 'framework') {
            const composition = require('../../../../nTooling/src/service/command/defaultRepositoryBuildCompositionService');
            return path.join(composition.persistentCoordinates(home).serverRoot, 'test', 'gen');
        }
        const serverArg = args.find(value => value.startsWith('--server='));
        const serverCode = serverArg ? serverArg.slice('--server='.length) : environment.S || environment.SERVER;
        if (!serverCode) throw new Error('Select --server=<code> or --root=<generated-test-root> for generated tests');
        const runtime = require('../../../../nTooling/src/service/project/defaultProjectRuntimeStartService');
        const environmentArg = args.find(value => value.startsWith('--environment='));
        const selectedEnvironment = Object.assign({}, environment, environmentArg ? { ENV: environmentArg.slice('--environment='.length) } : {});
        const server = runtime.resolveServer(home, runtime.readManifest(home), serverCode, selectedEnvironment);
        return path.join(home, 'envs', server.environment, server.server, 'test', 'gen');
    },

    /** Implements runCli as an overrideable service operation. */
    runCli: function () {
    const selectedRoot = this.resolveTestRoot();
    const typeArg = process.argv.find((arg) => arg.startsWith('--type='));
    const selectedType = typeArg ? typeArg.substring('--type='.length) : null;
    const tests = (this.collectGeneratedTests || exportedService.collectGeneratedTests).call(this, selectedRoot, [], {
        selectedType: selectedType,
        includeDestructive: !!selectedType
    }).sort();

    if (tests.length === 0) {
        const typeText = selectedType ? ` for type ${selectedType}` : '';
        console.error(`No generated tests found${typeText}. Run npm run build to generate them.`);
        process.exit(1);
    }

    tests.forEach((testPath) => {
        const relativePath = path.relative(selectedRoot, testPath);
        console.log(`\nRunning ${relativePath}`);
        const result = spawnSync(process.execPath, [testPath], {
            cwd: selectedRoot,
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
