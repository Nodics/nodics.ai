/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/RepositoryBuildCompositionContract @description Validates the isolated framework release-build topology. @layer test @owner nTooling */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const compositionService = require('../src/service/command/defaultRepositoryBuildCompositionService');
const lifecycleService = require('../src/service/command/defaultNodicsLifecycleCommandService');

const repositoryRoot = path.resolve(__dirname, '../../../..');
const originalRepositoryBuildTmpDir = process.env.NODICS_REPOSITORY_BUILD_TMPDIR;
const originalToolingTmpDir = process.env.NODICS_TOOLING_TMPDIR;
const originalProjectRoot = process.env.NODICS_PROJECT_ROOT;
const serverApprovedTmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-repository-build-contract-'));
process.env.NODICS_REPOSITORY_BUILD_TMPDIR = path.join(serverApprovedTmpRoot, 'scratch');
delete process.env.NODICS_TOOLING_TMPDIR;
const composition = compositionService.create();
try {
    assert(compositionService.runtimeGroups.includes('nodics.localization'),
        'Repository builds must regenerate Localization schema artifacts after clean');
    assert(compositionService.runtimeGroups.includes('nodics.discovery'),
        'Repository builds must regenerate Discovery schema artifacts after clean');
    assert(composition.root.startsWith(path.join(serverApprovedTmpRoot, 'scratch') + path.sep),
        'Composition must honor the configured server-approved scratch root');
    assert.strictEqual(compositionService.validate(composition), true);
    const serverPackagePath = path.join(composition.serverRoot, 'package.json');
    const serverPackage = JSON.parse(fs.readFileSync(serverPackagePath, 'utf8'));
    serverPackage.nodics.extends.pop();
    fs.writeFileSync(serverPackagePath, JSON.stringify(serverPackage, null, 2), 'utf8');
    assert.throws(() => compositionService.validate(composition), /every and only standard runtime group/);
    assert.throws(() => compositionService.validateMethod('start'), /Unsupported repository lifecycle method/);
    assert.strictEqual(lifecycleService.isFrameworkRepository({ home: repositoryRoot }), true);
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-project-scratch-contract-'));
    delete process.env.NODICS_REPOSITORY_BUILD_TMPDIR;
    process.env.NODICS_PROJECT_ROOT = projectRoot;
    const projectComposition = compositionService.create();
    try {
        assert(
            projectComposition.root.startsWith(path.join(projectRoot, '.nodics', 'tmp') + path.sep),
            'Project-driven builds must use the project .nodics/tmp scratch root instead of the framework checkout'
        );
    } finally {
        fs.rmSync(projectComposition.root, { recursive: true, force: true });
        fs.rmSync(projectRoot, { recursive: true, force: true });
    }
} finally {
    fs.rmSync(composition.root, { recursive: true, force: true });
    fs.rmSync(serverApprovedTmpRoot, { recursive: true, force: true });
    if (originalRepositoryBuildTmpDir === undefined) {
        delete process.env.NODICS_REPOSITORY_BUILD_TMPDIR;
    } else {
        process.env.NODICS_REPOSITORY_BUILD_TMPDIR = originalRepositoryBuildTmpDir;
    }
    if (originalToolingTmpDir === undefined) {
        delete process.env.NODICS_TOOLING_TMPDIR;
    } else {
        process.env.NODICS_TOOLING_TMPDIR = originalToolingTmpDir;
    }
    if (originalProjectRoot === undefined) {
        delete process.env.NODICS_PROJECT_ROOT;
    } else {
        process.env.NODICS_PROJECT_ROOT = originalProjectRoot;
    }
}
console.log('Repository build composition contract validated');
