/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * Validates the Nodics AI framework repository boundary.
 *
 * This script checks the repository-level contract only. It does not validate
 * or boot runtime modules; module tests remain owned by their module groups.
 */

const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(process.env.NODICS_HOME || process.cwd());
const packageJsonPath = path.join(repositoryRoot, 'package.json');

const expectedFrameworkWorkspaces = [
    'nodics.core',
    'nodics.platform',
    'nodics.cron',
    'nodics.wcms',
    'nodics.docs',
    'nodics.process',
    'nodics.commerce',
    'nodics.communication',
    'nodics.engagement'
];

const requiredRootFiles = [
    'AGENTS.md',
    'README.md',
    'nodics.js',
    'config/properties.js',
    'config/prescripts.js',
    'config/postscripts.js',
    'nodics.core/modules/nSetup/llm/README.md',
    'nodics.core/modules/nSetup/llm/contracts/customer-config-classification-contract.md',
    'nodics.core/modules/nSetup/llm/templates/documentation-page-template.md'
];

const requiredNSetupLlmFolders = [
    'contracts',
    'standards',
    'playbooks',
    'templates',
    'examples',
    'prompts',
    'memory'
];

const forbiddenContractFilePatterns = [
    /phase/i,
    /checklist/i,
    /template/i,
    /refactor/i,
    /migration/i
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

function assertDirectoryExists(relativePath) {
    const absolutePath = path.join(repositoryRoot, relativePath);
    assert(fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory(), `Missing required directory: ${relativePath}`);
}

function assertNSetupLlmTaxonomy() {
    const llmRoot = path.join(repositoryRoot, 'nodics.core/modules/nSetup/llm');
    const contractsRoot = path.join(llmRoot, 'contracts');
    requiredNSetupLlmFolders.forEach(folderName => {
        assertDirectoryExists(path.join('nodics.core/modules/nSetup/llm', folderName));
    });
    fs.readdirSync(llmRoot, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .forEach(folderName => {
            assert(
                requiredNSetupLlmFolders.includes(folderName),
                `Unexpected nSetup LLM taxonomy folder: ${folderName}`
            );
        });
    fs.readdirSync(contractsRoot, { withFileTypes: true })
        .filter(entry => entry.isFile())
        .map(entry => entry.name)
        .forEach(fileName => {
            forbiddenContractFilePatterns.forEach(pattern => {
                assert(
                    !pattern.test(fileName),
                    `Temporary or reusable guidance file must not live in contracts/: ${fileName}`
                );
            });
        });
}

function main() {
    const packageJson = readJson(packageJsonPath);
    const workspaces = packageJson.workspaces || [];
    const rootProperties = require(path.join(repositoryRoot, 'config/properties.js'));
    const rootPrescripts = require(path.join(repositoryRoot, 'config/prescripts.js'));
    const rootPostscripts = require(path.join(repositoryRoot, 'config/postscripts.js'));
    const rootNodics = require(path.join(repositoryRoot, 'nodics.js'));
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
    assert(typeof rootNodics.init === 'function', 'Framework root nodics.js must expose init().');
    assert(typeof rootNodics.postInit === 'function', 'Framework root nodics.js must expose postInit().');
    assert(Object.keys(rootProperties).length === 0, 'Framework root properties.js must stay empty until repository-governance properties are approved.');
    assert(Object.keys(rootPrescripts).length === 0, 'Framework root prescripts.js must stay empty because the root is not runtime-active.');
    assert(Object.keys(rootPostscripts).length === 0, 'Framework root postscripts.js must stay empty because the root is not runtime-active.');
    assert(!fs.existsSync(path.join(repositoryRoot, 'llm')), 'Framework root must not contain a root llm directory; use nodics.core/modules/nSetup/llm.');
    assert(missingWorkspaces.length === 0, `Missing framework workspaces: ${missingWorkspaces.join(', ')}`);
    assert(unexpectedWorkspaces.length === 0, `Unexpected framework workspaces: ${unexpectedWorkspaces.join(', ')}`);
    assert(!workspaces.includes('nodics.axis'), 'nodics.axis must remain outside framework workspaces.');

    requiredRootFiles.forEach(assertFileExists);
    assertNSetupLlmTaxonomy();
    assertForbiddenChildrenAbsent();
    expectedFrameworkWorkspaces.forEach(assertWorkspacePackage);

    console.log(`Validated ${packageJson.name} framework root with ${workspaces.length} backend workspaces.`);
}

main();
