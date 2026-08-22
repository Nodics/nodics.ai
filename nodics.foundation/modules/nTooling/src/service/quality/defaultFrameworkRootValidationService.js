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
const crypto = require('node:crypto');

const repositoryRoot = path.resolve(process.env.NODICS_HOME || process.cwd());
const packageJsonPath = path.join(repositoryRoot, 'package.json');

const expectedFrameworkWorkspaces = [
    'nodics.foundation',
    'nodics.localization',
    'nodics.platform',
    'nodics.cron',
    'nodics.wcms',
    'nodics.docs',
    'nodics.process',
    'nodics.discovery',
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
    'nodics.foundation/modules/nSetup/llm/README.md',
    'nodics.foundation/modules/nSetup/llm/contracts/customer-config-classification-contract.md',
    'nodics.foundation/modules/nSetup/llm/contracts/data-manifest-contract.md',
    'nodics.foundation/modules/nSetup/llm/templates/documentation-page-template.md'
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


/**
 * @module nTooling/service/quality/defaultFrameworkRootValidationService
 * @description Validates framework-root boundaries, workspace metadata, guidance taxonomy, and package-owned data manifests.
 * @layer tooling
 * @owner nTooling
 * @override Repository governance may extend individual validations through the configured tooling service override.
 */
let exportedService;
module.exports = exportedService = {
    /** Implements readJson as an overrideable service operation. */
    readJson: function (filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
},

    /** Implements assert as an overrideable service operation. */
    assert: function (condition, message) {
    if (!condition) {
        throw new Error(message);
    }
},

    /** Implements assertFileExists as an overrideable service operation. */
    assertFileExists: function (relativePath) {
    const absolutePath = path.join(repositoryRoot, relativePath);
    (this.assert || exportedService.assert).call(this, fs.existsSync(absolutePath), `Missing required framework file: ${relativePath}`);
},

    /** Implements assertWorkspacePackage as an overrideable service operation. */
    assertWorkspacePackage: function (workspaceName) {
    const workspacePackagePath = path.join(repositoryRoot, workspaceName, 'package.json');
    (this.assert || exportedService.assert).call(this,
        fs.existsSync(workspacePackagePath),
        `Missing package.json for framework workspace: ${workspaceName}`
    );

    const workspacePackage = (this.readJson || exportedService.readJson).call(this, workspacePackagePath);
    (this.assert || exportedService.assert).call(this,
        workspacePackage.name === workspaceName || workspaceName === 'nodics.docs',
        `Unexpected package name for ${workspaceName}: ${workspacePackage.name}`
    );
},

    /** Implements assertForbiddenChildrenAbsent as an overrideable service operation. */
    assertForbiddenChildrenAbsent: function () {
    forbiddenFrameworkChildren.forEach(childName => {
        const childPath = path.join(repositoryRoot, childName);
        (this.assert || exportedService.assert).call(this,
            !fs.existsSync(childPath),
            `${childName} must live outside the nodics.ai framework repository root.`
        );
    });
},

    /** Implements assertDirectoryExists as an overrideable service operation. */
    assertDirectoryExists: function (relativePath) {
    const absolutePath = path.join(repositoryRoot, relativePath);
    (this.assert || exportedService.assert).call(this, fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory(), `Missing required directory: ${relativePath}`);
},

    /** Implements assertNSetupLlmTaxonomy as an overrideable service operation. */
    assertNSetupLlmTaxonomy: function () {
    const llmRoot = path.join(repositoryRoot, 'nodics.foundation/modules/nSetup/llm');
    const contractsRoot = path.join(llmRoot, 'contracts');
    requiredNSetupLlmFolders.forEach(folderName => {
        (this.assertDirectoryExists || exportedService.assertDirectoryExists).call(this, path.join('nodics.foundation/modules/nSetup/llm', folderName));
    });
    fs.readdirSync(llmRoot, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .forEach(folderName => {
            (this.assert || exportedService.assert).call(this,
                requiredNSetupLlmFolders.includes(folderName),
                `Unexpected nSetup LLM taxonomy folder: ${folderName}`
            );
        });
    fs.readdirSync(contractsRoot, { withFileTypes: true })
        .filter(entry => entry.isFile())
        .map(entry => entry.name)
        .forEach(fileName => {
            forbiddenContractFilePatterns.forEach(pattern => {
                (this.assert || exportedService.assert).call(this,
                    !pattern.test(fileName),
                    `Temporary or reusable guidance file must not live in contracts/: ${fileName}`
                );
            });
        });
},

    /** Implements assertDataManifestCompliance as an overrideable service operation. */
    assertDataManifestCompliance: function () {
        return (this.visitDataManifestFolder || exportedService.visitDataManifestFolder).call(this, repositoryRoot,
            new Set(['DATA_RELEASE', 'CONTENT_PACK', 'SOURCE_CONTRIBUTION']),
            new Set(['.git', '.nodics', 'node_modules', 'temp', 'docs', 'local-archive']));
    },

    /** Collects published files below one data root without hiding traversal from later overrides. */
    collectPublishedFiles: function (folder, publishedFiles) {
        fs.readdirSync(folder, { withFileTypes: true }).forEach(entry => {
            const absolute = path.join(folder, entry.name);
            if (entry.isDirectory()) {
                (this.collectPublishedFiles || exportedService.collectPublishedFiles).call(this, absolute, publishedFiles);
            } else if (entry.isFile()) {
                publishedFiles.push(absolute);
            }
        });
        return publishedFiles;
    },

    /** Validates aggregate manifests recursively across one governed repository root. */
    visitDataManifestFolder: function (folder, supportedKinds, ignoredFolders) {
        const packagePath = path.join(folder, 'package.json');
        const dataRoot = path.join(folder, 'data');
        if (fs.existsSync(packagePath) && fs.existsSync(dataRoot) && fs.statSync(dataRoot).isDirectory()) {
            const publishedFiles = (this.collectPublishedFiles || exportedService.collectPublishedFiles).call(this, dataRoot, []);
            if (publishedFiles.length > 0) {
                const manifestPath = path.join(dataRoot, 'manifest.json');
                (this.assert || exportedService.assert).call(this, fs.existsSync(manifestPath), `Published data root is missing data/manifest.json: ${path.relative(repositoryRoot, folder)}`);
                const packageMetadata = (this.readJson || exportedService.readJson).call(this, packagePath);
                const manifest = (this.readJson || exportedService.readJson).call(this, manifestPath);
                (this.assert || exportedService.assert).call(this, [0, 2].includes(manifest.contractVersion), `Aggregate data manifest must use contractVersion 0 or 2: ${path.relative(repositoryRoot, manifestPath)}`);
                (this.assert || exportedService.assert).call(this, manifest.module === packageMetadata.name, `Aggregate data manifest module identity mismatch: ${path.relative(repositoryRoot, manifestPath)}`);
                (this.assert || exportedService.assert).call(this, manifest.sections && typeof manifest.sections === 'object' && !Array.isArray(manifest.sections),
                    `Aggregate data manifest sections are invalid: ${path.relative(repositoryRoot, manifestPath)}`);
                const nestedManifests = publishedFiles.filter(file => file !== manifestPath && path.basename(file) === 'manifest.json');
                (this.assert || exportedService.assert).call(this, nestedManifests.length === 0,
                    `Per-type or nested data manifests are prohibited: ${nestedManifests.map(file => path.relative(repositoryRoot, file)).join(', ')}`);
                Object.entries(manifest.sections).forEach(([sectionName, section]) => {
                    (this.assert || exportedService.assert).call(this, section && supportedKinds.has(section.kind), `Unsupported data manifest section kind: ${packageMetadata.name}#${sectionName}`);
                    (this.assert || exportedService.assert).call(this, /^\d+\.\d+\.\d+$/.test(section.version || ''), `Data manifest section version is invalid: ${packageMetadata.name}#${sectionName}`);
                    const files = section.kind === 'CONTENT_PACK' ? section.generatedHashes : section.files;
                    (this.assert || exportedService.assert).call(this, files && typeof files === 'object' && !Array.isArray(files) && Object.keys(files).length > 0,
                        `Data manifest section files are invalid: ${packageMetadata.name}#${sectionName}`);
                    Object.entries(files).forEach(([relativeFile, expectedHash]) => {
                        (this.assert || exportedService.assert).call(this, !path.isAbsolute(relativeFile) && !relativeFile.includes('..'),
                            `Data manifest file path is invalid: ${packageMetadata.name}#${sectionName}:${relativeFile}`);
                        const absolute = path.resolve(dataRoot, relativeFile);
                        (this.assert || exportedService.assert).call(this, absolute.startsWith(dataRoot + path.sep) && fs.existsSync(absolute) && fs.statSync(absolute).isFile(),
                            `Data manifest file is unavailable: ${packageMetadata.name}#${sectionName}:${relativeFile}`);
                        (this.assert || exportedService.assert).call(this, !fs.lstatSync(absolute).isSymbolicLink(),
                            `Data manifest file must not be a symbolic link: ${packageMetadata.name}#${sectionName}:${relativeFile}`);
                        const actualHash = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
                        (this.assert || exportedService.assert).call(this, actualHash === expectedHash,
                            `Data manifest checksum mismatch: ${packageMetadata.name}#${sectionName}:${relativeFile}`);
                    });
                });
            }
        }
        fs.readdirSync(folder, { withFileTypes: true }).forEach(entry => {
            if (entry.isDirectory() && !ignoredFolders.has(entry.name)) {
                (this.visitDataManifestFolder || exportedService.visitDataManifestFolder).call(this,
                    path.join(folder, entry.name), supportedKinds, ignoredFolders);
            }
        });
        return true;
    },

    /** Implements main as an overrideable service operation. */
    main: function () {
    const packageJson = (this.readJson || exportedService.readJson).call(this, packageJsonPath);
    const workspaces = packageJson.workspaces || [];
    const rootProperties = require(path.join(repositoryRoot, 'config/properties.js'));
    const rootPrescripts = require(path.join(repositoryRoot, 'config/prescripts.js'));
    const rootPostscripts = require(path.join(repositoryRoot, 'config/postscripts.js'));
    const rootNodics = require(path.join(repositoryRoot, 'nodics.js'));
    const missingWorkspaces = expectedFrameworkWorkspaces.filter(name => !workspaces.includes(name));
    const unexpectedWorkspaces = workspaces.filter(name => !expectedFrameworkWorkspaces.includes(name));

    (this.assert || exportedService.assert).call(this, packageJson.name === 'nodics.ai', 'Framework root package name must be nodics.ai.');
    (this.assert || exportedService.assert).call(this, packageJson.nodics, 'Framework root package must declare nodics metadata.');
    (this.assert || exportedService.assert).call(this, packageJson.nodics.kind === 'framework', 'Framework root nodics.kind must be framework.');
    (this.assert || exportedService.assert).call(this, packageJson.nodics.runtimeModule === false, 'Framework root must not be a runtime module.');
    (this.assert || exportedService.assert).call(this,
        packageJson.nodics.loadableByNodicsModuleLoader === false,
        'Framework root must not be loadable by the Nodics module loader.'
    );
    (this.assert || exportedService.assert).call(this, typeof rootNodics.init === 'function', 'Framework root nodics.js must expose init().');
    (this.assert || exportedService.assert).call(this, typeof rootNodics.postInit === 'function', 'Framework root nodics.js must expose postInit().');
    (this.assert || exportedService.assert).call(this, Object.keys(rootProperties).length === 0, 'Framework root properties.js must stay empty until repository-governance properties are approved.');
    (this.assert || exportedService.assert).call(this, Object.keys(rootPrescripts).length === 0, 'Framework root prescripts.js must stay empty because the root is not runtime-active.');
    (this.assert || exportedService.assert).call(this, Object.keys(rootPostscripts).length === 0, 'Framework root postscripts.js must stay empty because the root is not runtime-active.');
    (this.assert || exportedService.assert).call(this, !fs.existsSync(path.join(repositoryRoot, 'llm')), 'Framework root must not contain a root llm directory; use nodics.foundation/modules/nSetup/llm.');
    (this.assert || exportedService.assert).call(this, missingWorkspaces.length === 0, `Missing framework workspaces: ${missingWorkspaces.join(', ')}`);
    (this.assert || exportedService.assert).call(this, unexpectedWorkspaces.length === 0, `Unexpected framework workspaces: ${unexpectedWorkspaces.join(', ')}`);
    (this.assert || exportedService.assert).call(this, !workspaces.includes('nodics.axis'), 'nodics.axis must remain outside framework workspaces.');

    requiredRootFiles.forEach(relativePath =>
        (this.assertFileExists || exportedService.assertFileExists).call(this, relativePath));
    (this.assertNSetupLlmTaxonomy || exportedService.assertNSetupLlmTaxonomy).call(this, );
    (this.assertDataManifestCompliance || exportedService.assertDataManifestCompliance).call(this, );
    (this.assertForbiddenChildrenAbsent || exportedService.assertForbiddenChildrenAbsent).call(this, );
    expectedFrameworkWorkspaces.forEach(workspaceName =>
        (this.assertWorkspacePackage || exportedService.assertWorkspacePackage).call(this, workspaceName));

    console.log(`Validated ${packageJson.name} framework root with ${workspaces.length} backend workspaces.`);
}
};

exportedService.main();
