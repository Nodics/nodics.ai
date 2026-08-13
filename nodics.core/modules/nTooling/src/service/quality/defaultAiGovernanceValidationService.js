/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const fs = require('fs');
const path = require('path');

/**
 * @module nTooling/service/quality/defaultAiGovernanceValidationService
 * @description Validates portable AI-agent governance files, canonical module guidance, README casing, tool bridge files, and generated-context entrypoints across a Nodics workspace.
 * @layer tooling
 * @owner nTooling
 * @override Projects may add stricter AI governance checks, but must preserve AGENTS.md as the canonical portable instruction contract.
 */

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());
const ignoredDirectories = new Set([
    '.git',
    'node_modules',
    'logs',
    'temp',
    'tmp',
    'dist',
    'generated'
]);

const globalGuidanceRoot = 'nodics.core/modules/nSetup/llm';
const globalGuidanceIndex = globalGuidanceRoot + '/ai-enablement-index.md';
const globalGuidanceManifest = globalGuidanceRoot + '/ai-manifest.json';

const requiredRootFiles = [
    'AGENTS.md',
    'CLAUDE.md',
    '.github/copilot-instructions.md',
    '.cursor/rules/nodics-core.mdc',
    globalGuidanceIndex,
    globalGuidanceManifest,
    globalGuidanceRoot + '/contracts/nodics-principles.md',
    globalGuidanceRoot + '/contracts/module-structure-contract.md',
    globalGuidanceRoot + '/contracts/documentation-impact-contract.md',
    globalGuidanceRoot + '/contracts/testing-and-release-contract.md',
    globalGuidanceRoot + '/contracts/customer-project-mode-contract.md',
    globalGuidanceRoot + '/memory/README.md',
    globalGuidanceRoot + '/memory/decisions.md'
];

/**
 * Converts a filesystem path to a repository-relative POSIX path.
 *
 * @param {string} filePath Absolute or workspace-relative filesystem path.
 * @returns {string} POSIX-style path relative to the workspace root.
 */


/**
 * Recursively walks the workspace while skipping generated and external folders.
 *
 * @param {string} directory Directory to scan.
 * @param {Function} visitor Function invoked for every discovered entry.
 */


/**
 * Finds all package-shaped directories in the workspace.
 *
 * @returns {string[]} Package directories sorted by relative path.
 */


/**
 * Finds all AGENTS.md files governed by the workspace instruction contract.
 *
 * @returns {string[]} AGENTS.md file paths sorted by relative path.
 */


/**
 * Reads a UTF-8 file when it exists.
 *
 * @param {string} relativePath Workspace-relative path.
 * @returns {string} File content or an empty string.
 */


/**
 * Resolves AGENTS.md and global guidance references from an AGENTS.md file.
 *
 * @param {string} filePath AGENTS.md file path.
 * @returns {{reference: string, resolvedPath: string}[]} Resolved references.
 */


/**
 * Checks whether one AGENTS.md file can reach another required guidance file.
 *
 * @param {string} sourcePath Source AGENTS.md file path.
 * @param {string} targetPath Required target path.
 * @param {Set<string>} visited Already visited files.
 * @returns {boolean} True when the target is reachable.
 */


/**
 * Records a validation failure.
 *
 * @param {string[]} failures Mutable failure list.
 * @param {string} message Failure message.
 */


/**
 * Validates root-level canonical AI files and bridge files.
 *
 * @param {string[]} failures Mutable failure list.
 */


/**
 * Validates package-level AI and human documentation entrypoints.
 *
 * @param {string[]} failures Mutable failure list.
 */


/**
 * Validates that lowercase README names are not reintroduced anywhere.
 *
 * @param {string[]} failures Mutable failure list.
 */


/**
 * Validates AGENTS.md inheritance links and canonical AI guidance references.
 *
 * @param {string[]} failures Mutable failure list.
 */


/**
 * Runs AI governance validation and exits with a non-zero code on failure.
 */




let exportedService;
module.exports = exportedService = {
    /** Implements toRelative as an overrideable service operation. */
    toRelative: function (filePath) {
    return path.relative(rootPath, filePath).split(path.sep).join('/');
},

    /** Implements walk as an overrideable service operation. */
    walk: function (directory, visitor) {
    if (!fs.existsSync(directory)) return;
    fs.readdirSync(directory, { withFileTypes: true })
        .sort((left, right) => left.name.localeCompare(right.name))
        .forEach(entry => {
            if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return;
            let entryPath = path.join(directory, entry.name);
            if (entry.isDirectory() && entryPath === path.join(rootPath, 'docs')) return;
            visitor(entryPath, entry);
            if (entry.isDirectory()) (this.walk || exportedService.walk).call(this, entryPath, visitor);
        });
},

    /** Implements findPackageDirectories as an overrideable service operation. */
    findPackageDirectories: function () {
    let directories = [];
    if (fs.existsSync(path.join(rootPath, 'package.json'))) {
        directories.push(rootPath);
    }
    (this.walk || exportedService.walk).call(this, rootPath, (entryPath, entry) => {
        if (!entry.isDirectory()) return;
        if (fs.existsSync(path.join(entryPath, 'package.json'))) {
            directories.push(entryPath);
        }
    });
    return Array.from(new Set(directories)).sort((left, right) => (this.toRelative || exportedService.toRelative).call(this, left).localeCompare(this.toRelative(right)));
},

    /** Implements findAgentFiles as an overrideable service operation. */
    findAgentFiles: function () {
    let files = [];
    let rootAgents = path.join(rootPath, 'AGENTS.md');
    if (fs.existsSync(rootAgents)) {
        files.push(rootAgents);
    }
    (this.walk || exportedService.walk).call(this, rootPath, (entryPath, entry) => {
        if (entry.isFile() && entry.name === 'AGENTS.md') {
            files.push(entryPath);
        }
    });
    return Array.from(new Set(files)).sort((left, right) => (this.toRelative || exportedService.toRelative).call(this, left).localeCompare(this.toRelative(right)));
},

    /** Implements readRelative as an overrideable service operation. */
    readRelative: function (relativePath) {
    let filePath = path.join(rootPath, relativePath);
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
},

    /** Implements resolveAgentReferences as an overrideable service operation. */
    resolveAgentReferences: function (filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    return Array.from(content.matchAll(/`([^`]*(?:AGENTS\.md|nSetup\/llm\/ai-enablement-index\.md|llm\/ai-enablement-index\.md))`/g))
        .map(match => match[1])
        .map(reference => ({
            reference,
            resolvedPath: path.resolve(path.dirname(filePath), reference)
        }));
},

    /** Implements canReachGuidance as an overrideable service operation. */
    canReachGuidance: function (sourcePath, targetPath, visited = new Set()) {
    if (sourcePath === targetPath) return true;
    if (visited.has(sourcePath)) return false;
    visited.add(sourcePath);

    return (this.resolveAgentReferences || exportedService.resolveAgentReferences).call(this, sourcePath).some(resolvedReference => {
        if (resolvedReference.resolvedPath === targetPath) return true;
        if (!fs.existsSync(resolvedReference.resolvedPath)) return false;
        if (path.basename(resolvedReference.resolvedPath) !== 'AGENTS.md') return false;
        return (this.canReachGuidance || exportedService.canReachGuidance).call(this, resolvedReference.resolvedPath, targetPath, visited);
    });
},

    /** Implements fail as an overrideable service operation. */
    fail: function (failures, message) {
    failures.push(message);
},

    /** Implements validateRootFiles as an overrideable service operation. */
    validateRootFiles: function (failures) {
    requiredRootFiles.forEach(relativePath => {
        if (!fs.existsSync(path.join(rootPath, relativePath))) {
            (this.fail || exportedService.fail).call(this, failures, 'Missing AI governance file: ' + relativePath);
        }
    });
    if (fs.existsSync(path.join(rootPath, 'llm'))) {
        (this.fail || exportedService.fail).call(this,
            failures,
            'Repository root must not contain a parallel llm directory; global AI guidance belongs in ' +
            globalGuidanceRoot
        );
    }
    if (fs.existsSync(path.join(rootPath, 'memory'))) {
        (this.fail || exportedService.fail).call(this,
            failures,
            'Repository root must not contain a parallel memory directory; curated shared memory belongs in ' +
            globalGuidanceRoot + '/memory'
        );
    }

    let rootAgents = (this.readRelative || exportedService.readRelative).call(this, 'AGENTS.md');
    let normalizedRootAgents = rootAgents.toLowerCase();
    [
        'capabilities are sacred, implementations are negotiable',
        'required reading order',
        'operating modes and authority',
        'pre-implementation study gate',
        'nodics delivery expert council',
        'documentation impact contract',
        'customer/project module',
        'standard module shape'
    ].forEach(clause => {
        if (!normalizedRootAgents.includes(clause)) {
            (this.fail || exportedService.fail).call(this, failures, 'Root AGENTS.md is missing required clause: ' + clause);
        }
    });

    [
        'CLAUDE.md',
        '.github/copilot-instructions.md',
        '.cursor/rules/nodics-core.mdc'
    ].forEach(relativePath => {
        let content = (this.readRelative || exportedService.readRelative).call(this, relativePath);
        if (!content.includes('AGENTS.md')) {
            (this.fail || exportedService.fail).call(this, failures, 'AI bridge must point to AGENTS.md: ' + relativePath);
        }
        if (!content.includes('root-to-leaf') && !content.includes('ancestor module `AGENTS.md`')) {
            (this.fail || exportedService.fail).call(this, failures, 'AI bridge must preserve root-to-leaf AGENTS.md guidance: ' + relativePath);
        }
    });

    try {
        let manifest = JSON.parse((this.readRelative || exportedService.readRelative).call(this, globalGuidanceManifest));
        if (manifest.manifestSchemaVersion !== 1) {
            (this.fail || exportedService.fail).call(this, failures, 'AI manifest manifestSchemaVersion must be 1');
        }
        if (manifest.canonicalInstructionFile !== 'AGENTS.md') {
            (this.fail || exportedService.fail).call(this, failures, 'AI manifest canonicalInstructionFile must be AGENTS.md');
        }
        if (manifest.humanReadmeFile !== 'README.md') {
            (this.fail || exportedService.fail).call(this, failures, 'AI manifest humanReadmeFile must be README.md');
        }
    } catch (error) {
        (this.fail || exportedService.fail).call(this, failures, 'AI manifest must be valid JSON: ' + error.message);
    }
},

    /** Implements validatePackageFiles as an overrideable service operation. */
    validatePackageFiles: function (failures) {
    (this.findPackageDirectories || exportedService.findPackageDirectories).call(this, ).forEach(directory => {
        let relativePath = (this.toRelative || exportedService.toRelative).call(this, directory) || '.';
        let readmeNames = fs.readdirSync(directory).filter(name => /^readme\.md$/i.test(name));
        if (readmeNames.length !== 1 || readmeNames[0] !== 'README.md') {
            (this.fail || exportedService.fail).call(this, failures, 'Package must contain exactly one uppercase README.md: ' + relativePath);
        }
        if (!fs.existsSync(path.join(directory, 'AGENTS.md'))) {
            (this.fail || exportedService.fail).call(this, failures, 'Package is missing AGENTS.md: ' + relativePath);
        }
        if (directory !== rootPath) {
            [
                'llm/contracts/README.md',
                'llm/examples/README.md'
            ].forEach(relativeFile => {
                if (!fs.existsSync(path.join(directory, relativeFile))) {
                    (this.fail || exportedService.fail).call(this, failures, 'Package is missing mandatory AI/documentation file: ' + relativePath + '/' + relativeFile);
                }
            });
        }
        if (directory !== rootPath && fs.existsSync(path.join(directory, 'docs'))) {
            (this.fail || exportedService.fail).call(this,
                failures,
                'Package must not contain a parallel module docs directory; keep the local entry point in README.md ' +
                'and detailed guidance in the canonical documentation content pack: ' + relativePath + '/docs'
            );
        }
    });
},

    /** Implements validateReadmeCasing as an overrideable service operation. */
    validateReadmeCasing: function (failures) {
    (this.walk || exportedService.walk).call(this, rootPath, (entryPath, entry) => {
        if (entry.isFile() && entry.name === 'readme.md') {
            (this.fail || exportedService.fail).call(this, failures, 'Lowercase readme.md is not allowed: ' + this.toRelative(entryPath));
        }
    });
},

    /** Implements validateAgentFiles as an overrideable service operation. */
    validateAgentFiles: function (failures) {
    let rootAgentsPath = path.join(rootPath, 'AGENTS.md');
    let globalGuidancePath = path.join(rootPath, globalGuidanceIndex);
    (this.findAgentFiles || exportedService.findAgentFiles).call(this, ).forEach(filePath => {
        if (filePath === rootAgentsPath) return;

        let relativePath = (this.toRelative || exportedService.toRelative).call(this, filePath);
        let resolvedReferences = (this.resolveAgentReferences || exportedService.resolveAgentReferences).call(this, filePath);

        resolvedReferences.forEach(resolvedReference => {
            if (!fs.existsSync(resolvedReference.resolvedPath)) {
                (this.fail || exportedService.fail).call(this,
                    failures,
                    'AGENTS.md reference must resolve: ' + relativePath + ' -> ' + resolvedReference.reference
                );
            }
        });

        if (!(this.canReachGuidance || exportedService.canReachGuidance).call(this, filePath, rootAgentsPath)) {
            (this.fail || exportedService.fail).call(this, failures, 'AGENTS.md must reach the root AI contract through the AGENTS.md chain: ' + relativePath);
        }
        if (!(this.canReachGuidance || exportedService.canReachGuidance).call(this, filePath, globalGuidancePath)) {
            (this.fail || exportedService.fail).call(this, failures, 'AGENTS.md must reach global ' + globalGuidanceRoot + ' guidance: ' + relativePath);
        }
    });
},

    /** Implements run as an overrideable service operation. */
    run: function () {
    let failures = [];
    (this.validateRootFiles || exportedService.validateRootFiles).call(this, failures);
    (this.validatePackageFiles || exportedService.validatePackageFiles).call(this, failures);
    (this.validateReadmeCasing || exportedService.validateReadmeCasing).call(this, failures);
    (this.validateAgentFiles || exportedService.validateAgentFiles).call(this, failures);

    if (failures.length > 0) {
        console.error('Nodics AI governance validation failed:');
        failures.forEach(failure => console.error('- ' + failure));
        process.exit(1);
    }
    console.log('Nodics AI governance validated');
}
};

if (require.main === module) {
    exportedService.run();
}
