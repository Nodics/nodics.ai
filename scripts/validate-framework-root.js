'use strict';

/**
 * Validates the Nodics AI framework repository boundary.
 *
 * This script checks the repository-level contract only. It does not validate
 * or boot runtime modules; module tests remain owned by their module groups.
 */

const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.join(repositoryRoot, 'package.json');

const expectedFrameworkWorkspaces = [
    'nodics.core',
    'nodics.platform',
    'nodics.cron',
    'nodics.wcms',
    'nodics.docs'
];

const requiredRootFiles = [
    'AGENTS.md',
    'README.md',
    'llm/contracts/modularization-phase0-contract.md',
    'llm/contracts/modularization-phase0-validation-checklist.md'
];

const forbiddenFrameworkChildren = [
    'nodics.axis'
];

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function assertFileExists(relativePath) {
    const absolutePath = path.join(repositoryRoot, relativePath);
    assert(fs.existsSync(absolutePath), `Missing required framework file: ${relativePath}`);
}

function assertWorkspacePackage(workspaceName) {
    const workspacePackagePath = path.join(repositoryRoot, workspaceName, 'package.json');
    assert(
        fs.existsSync(workspacePackagePath),
        `Missing package.json for framework workspace: ${workspaceName}`
    );

    const workspacePackage = readJson(workspacePackagePath);
    assert(
        workspacePackage.name === workspaceName || workspaceName === 'nodics.docs',
        `Unexpected package name for ${workspaceName}: ${workspacePackage.name}`
    );
}

function assertForbiddenChildrenAbsent() {
    forbiddenFrameworkChildren.forEach(childName => {
        const childPath = path.join(repositoryRoot, childName);
        assert(
            !fs.existsSync(childPath),
            `${childName} must live outside the nodics.ai framework repository root.`
        );
    });
}

function main() {
    const packageJson = readJson(packageJsonPath);
    const workspaces = packageJson.workspaces || [];
    const missingWorkspaces = expectedFrameworkWorkspaces.filter(name => !workspaces.includes(name));
    const unexpectedWorkspaces = workspaces.filter(name => !expectedFrameworkWorkspaces.includes(name));

    assert(packageJson.name === 'nodics.ai', 'Framework root package name must be nodics.ai.');
    assert(packageJson.nodics, 'Framework root package must declare nodics metadata.');
    assert(packageJson.nodics.kind === 'framework', 'Framework root nodics.kind must be framework.');
    assert(packageJson.nodics.runtimeModule === false, 'Framework root must not be a runtime module.');
    assert(
        packageJson.nodics.loadableByNodicsModuleLoader === false,
        'Framework root must not be loadable by the Nodics module loader.'
    );
    assert(missingWorkspaces.length === 0, `Missing framework workspaces: ${missingWorkspaces.join(', ')}`);
    assert(unexpectedWorkspaces.length === 0, `Unexpected framework workspaces: ${unexpectedWorkspaces.join(', ')}`);
    assert(!workspaces.includes('nodics.axis'), 'nodics.axis must remain outside framework workspaces.');

    requiredRootFiles.forEach(assertFileExists);
    assertForbiddenChildrenAbsent();
    expectedFrameworkWorkspaces.forEach(assertWorkspacePackage);

    console.log(`Validated ${packageJson.name} framework root with ${workspaces.length} backend workspaces.`);
}

main();
