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
 * @module nTooling/service/quality/defaultStructureComplianceQualityService
 * @description Audits Nodics module, project, environment, server, and node structure against the canonical structure matrix without mutating source files.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling modules may replace or wrap audit rules through the standard service merge path while keeping report-only and fail-on-gap modes explicit.
 */

const requiredRootFiles = [
    'package.json',
    'nodics.js',
    'AGENTS.md',
    'README.md'
];

const requiredConfigFiles = [
    'config/properties.js',
    'config/prescripts.js',
    'config/postscripts.js'
];

const requiredLlmEntries = [
    'llm/contracts/README.md',
    'llm/examples/README.md'
];

const sourceRegistryFiles = {
    'src/event': ['listeners.js'],
    'src/pipelines': ['pipelines.js'],
    'src/router': ['routers.js', 'appConfig.js'],
    'src/schemas': ['schemas.js'],
    'src/search': ['indexes.js'],
    'src/interceptors': ['interceptors.js'],
    'src/utils': ['utils.js', 'enums.js', 'statusDefinitions.js']
};

const ownsToSourceDirectory = {
    event: 'src/event',
    pipeline: 'src/pipelines',
    router: 'src/router',
    schema: 'src/schemas',
    search: 'src/search',
    interceptor: 'src/interceptors',
    service: 'src/service',
    controller: 'src/controller',
    facade: 'src/facade',
    utility: 'src/utils'
};

const sourceDirectoryToOwns = Object.keys(ownsToSourceDirectory).reduce((index, ownsName) => {
    index[ownsToSourceDirectory[ownsName]] = ownsName;
    return index;
}, {});

const ignoredDirectories = new Set([
    '.git',
    '.idea',
    '.vscode',
    'node_modules',
    'logs',
    'temp',
    'tmp',
    'dist',
    'generated',
    'docs'
]);




let exportedService;
module.exports = exportedService = {
    /** Implements readOption as an overrideable service operation. */
    readOption: function (args, name, defaultValue) {
    const prefix = name + '=';
    const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
    return match ? match.slice(prefix.length) : defaultValue;
},

    /** Implements toPosix as an overrideable service operation. */
    toPosix: function (filePath) {
    return filePath.split(path.sep).join('/');
},

    /** Implements relative as an overrideable service operation. */
    relative: function (rootDir, filePath) {
    return (this.toPosix || exportedService.toPosix).call(this, path.relative(rootDir, filePath));
},

    /** Implements exists as an overrideable service operation. */
    exists: function (modulePath, relativePath) {
    return fs.existsSync(path.join(modulePath, relativePath));
},

    /** Implements isModuleDirectory as an overrideable service operation. */
    isModuleDirectory: function (directory) {
    return (this.exists || exportedService.exists).call(this, directory, 'package.json') && this.exists(directory, 'nodics.js');
},

    /** Implements readJson as an overrideable service operation. */
    readJson: function (filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
},

    /** Implements createOptions as an overrideable service operation. */
    createOptions: function (args) {
    const configuredHome = (this.readOption || exportedService.readOption).call(this, args, '--home', process.env.NODICS_HOME || '');
    return {
        rootDir: configuredHome ? path.resolve(configuredHome) : process.cwd(),
        failOnGap: (args || []).includes('--fail'),
        reportLimit: Number((this.readOption || exportedService.readOption).call(this, args, '--limit', '80')),
        includeInfo: (args || []).includes('--include-info'),
        includeRoot: (args || []).includes('--include-root')
    };
},

    /** Implements shouldVisitDirectory as an overrideable service operation. */
    shouldVisitDirectory: function (entry) {
    if (entry.name.startsWith('.')) {
        return false;
    }
    return !ignoredDirectories.has(entry.name);
},

    /** Implements scanModules as an overrideable service operation. */
    scanModules: function (rootDir, directory, modules, includeCurrent) {
    if (!fs.existsSync(directory)) {
        return modules;
    }
    if (includeCurrent && (this.isModuleDirectory || exportedService.isModuleDirectory).call(this, directory)) {
        const packageJson = (this.readJson || exportedService.readJson).call(this, path.join(directory, 'package.json'));
        modules.push({
            path: directory,
            relativePath: (this.relative || exportedService.relative).call(this, rootDir, directory),
            packageJson: packageJson
        });
    }
    fs.readdirSync(directory, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && (this.shouldVisitDirectory || exportedService.shouldVisitDirectory).call(this, entry))
        .sort((left, right) => left.name.localeCompare(right.name))
        .forEach(entry => (this.scanModules || exportedService.scanModules).call(this, rootDir, path.join(directory, entry.name), modules, true));
    return modules;
},

    /** Implements createFinding as an overrideable service operation. */
    createFinding: function (report, severity, moduleObject, code, message) {
    report.findings.push({
        severity: severity,
        module: moduleObject.relativePath,
        code: code,
        message: message
    });
},

    /** Implements inferExpectedKind as an overrideable service operation. */
    inferExpectedKind: function (moduleObject) {
    const parts = moduleObject.relativePath.split('/');
    const envsIndex = parts.indexOf('envs');
    if (envsIndex >= 0) {
        const depth = parts.length - envsIndex - 1;
        if (depth === 0 || depth === 1) {
            return 'group';
        }
        if (depth === 2) {
            return 'server';
        }
        return 'node';
    }
    return null;
},

    /** Implements isTopologyModule as an overrideable service operation. */
    isTopologyModule: function (moduleObject) {
    const parts = moduleObject.relativePath.split('/');
    return parts.includes('envs');
},

    /** Implements collectJavaScriptFiles as an overrideable service operation. */
    collectJavaScriptFiles: function (directory, files) {
    if (!fs.existsSync(directory)) {
        return files;
    }
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            (this.collectJavaScriptFiles || exportedService.collectJavaScriptFiles).call(this, entryPath, files);
        } else if (entry.name.endsWith('.js')) {
            files.push(entryPath);
        }
    });
    return files;
},

    /** Implements validateRootFiles as an overrideable service operation. */
    validateRootFiles: function (report, moduleObject) {
    requiredRootFiles.forEach(relativePath => {
        if (!(this.exists || exportedService.exists).call(this, moduleObject.path, relativePath)) {
            (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'missing-root-file',
                'Missing required root file `' + relativePath + '`.');
        }
    });
    requiredConfigFiles.forEach(relativePath => {
        if (!(this.exists || exportedService.exists).call(this, moduleObject.path, relativePath)) {
            (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'missing-config-file',
                'Missing required configuration file `' + relativePath + '`.');
        }
    });
    requiredLlmEntries.forEach(relativePath => {
        if (!(this.exists || exportedService.exists).call(this, moduleObject.path, relativePath)) {
            (this.createFinding || exportedService.createFinding).call(this, report, 'warning', moduleObject, 'missing-llm-entry',
                'Missing recommended LLM guidance file `' + relativePath + '`.');
        }
    });
    const declaredOwnership = Array.isArray(moduleObject.packageJson?.nodics?.owns)
        ? moduleObject.packageJson.nodics.owns
        : [];
    if ((this.exists || exportedService.exists).call(this, moduleObject.path, 'docs')
        && !declaredOwnership.includes('documentation')) {
        (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'parallel-module-docs',
            'Only an explicit documentation owner may maintain a governed `docs/` source catalogue; other modules must use `README.md`.');
    }
},

    /** Implements validateMetadata as an overrideable service operation. */
    validateMetadata: function (report, moduleObject) {
    const packageJson = moduleObject.packageJson || {};
    const nodics = packageJson.nodics || {};
    if (packageJson.runtimeModule !== undefined) {
        (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'legacy-runtime-module',
            'Use `package.json.nodics.runtimeModule`; top-level `runtimeModule` is not authoritative.');
    }
    if (packageJson.tmpGroup !== undefined) {
        (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'obsolete-temporary-group',
            'Remove obsolete package metadata `tmpGroup`.');
    }
    if (nodics.backoffice !== undefined || nodics.description !== undefined) {
        (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'misplaced-package-value',
            'Runtime BackOffice configuration belongs in properties and package description belongs at top level.');
    }
    ['name', 'index', 'main', 'version', 'description', 'nodics'].forEach(fieldName => {
        if (packageJson[fieldName] === undefined) {
            (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'missing-package-field',
                'Missing package metadata field `' + fieldName + '`.');
        }
    });
    ['kind', 'displayName', 'runtimeModule', 'loadableByNodicsModuleLoader', 'owns', 'runtime'].forEach(fieldName => {
        if (nodics[fieldName] === undefined) {
            (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'missing-nodics-field',
                'Missing package.json.nodics field `' + fieldName + '`.');
        }
    });
    if (packageJson.main && packageJson.main !== 'nodics.js') {
        (this.createFinding || exportedService.createFinding).call(this, report, 'warning', moduleObject, 'nonstandard-main',
            'Standard module main should be `nodics.js`, found `' + packageJson.main + '`.');
    }
    const expectedKind = (this.inferExpectedKind || exportedService.inferExpectedKind).call(this, moduleObject);
    if (expectedKind && nodics.kind && nodics.kind !== expectedKind) {
        (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'kind-mismatch',
            'Expected kind `' + expectedKind + '` from approved topology, found `' + nodics.kind + '`.');
    }
    if (nodics.kind === 'project' && !packageJson.groupName) {
        (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'missing-project-group-name',
            'Project package metadata must include `groupName`.');
    }
    if (nodics.owns !== undefined && !Array.isArray(nodics.owns)) {
        (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'invalid-owns',
            '`package.json.nodics.owns` must be an array.');
    }
    if (typeof nodics.displayName !== 'string' || !nodics.displayName.trim() || nodics.displayName.length > 160) {
        (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'invalid-display-name',
            '`package.json.nodics.displayName` must be a non-empty business-facing label of at most 160 characters.');
    }
},

    /** Implements validateSourceStructure as an overrideable service operation. */
    validateSourceStructure: function (report, moduleObject) {
    Object.keys(sourceRegistryFiles).forEach(relativeDirectory => {
        if (!(this.exists || exportedService.exists).call(this, moduleObject.path, relativeDirectory)) {
            return;
        }
        sourceRegistryFiles[relativeDirectory].forEach(fileName => {
            if (!(this.exists || exportedService.exists).call(this, moduleObject.path, path.join(relativeDirectory, fileName))) {
                (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'missing-source-registry',
                    '`' + relativeDirectory + '` must include `' + fileName + '`.');
            }
        });
    });

    ['src/service', 'src/controller', 'src/facade'].forEach(relativeDirectory => {
        const directory = path.join(moduleObject.path, relativeDirectory);
        const suffix = {
            'src/service': 'Service.js',
            'src/controller': 'Controller.js',
            'src/facade': 'Facade.js'
        }[relativeDirectory];
        (this.collectJavaScriptFiles || exportedService.collectJavaScriptFiles).call(this, directory, []).forEach(filePath => {
            const fileName = path.basename(filePath);
            const relativeFile = (this.relative || exportedService.relative).call(this, moduleObject.path, filePath);
            if (relativeFile.includes('/gen/') || relativeFile.includes('/generated/') || fileName === 'common.js') {
                return;
            }
            if (!fileName.endsWith(suffix)) {
                (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'loader-invisible-file',
                    '`' + relativeFile + '` is under loader-managed `' + relativeDirectory +
                    '` but does not end with `' + suffix + '`.');
            }
        });
    });

    if ((this.exists || exportedService.exists).call(this, moduleObject.path, 'src/router/router.js')) {
        (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'retired-router-file',
            'Use `src/router/routers.js`; `src/router/router.js` is retired.');
    }
    if ((this.exists || exportedService.exists).call(this, moduleObject.path, 'src/pipelines/pipelinesDefinition.js')) {
        (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'retired-pipeline-file',
            'Use `src/pipelines/pipelines.js`; `src/pipelines/pipelinesDefinition.js` is retired.');
    }
},

    /** Implements validateOwnershipAlignment as an overrideable service operation. */
    validateOwnershipAlignment: function (report, moduleObject) {
    const nodics = moduleObject.packageJson.nodics || {};
    const owns = new Set(Array.isArray(nodics.owns) ? nodics.owns : []);
    Object.keys(sourceDirectoryToOwns).forEach(relativeDirectory => {
        if ((this.exists || exportedService.exists).call(this, moduleObject.path, relativeDirectory) && !owns.has(sourceDirectoryToOwns[relativeDirectory])) {
            (this.createFinding || exportedService.createFinding).call(this, report, 'warning', moduleObject, 'owns-missing-source',
                '`' + relativeDirectory + '` exists but `nodics.owns` does not include `' +
                sourceDirectoryToOwns[relativeDirectory] + '`.');
        }
    });
    Object.keys(ownsToSourceDirectory).forEach(ownsName => {
        if (owns.has(ownsName) && (this.exists || exportedService.exists).call(this, moduleObject.path, 'src') &&
            !(this.exists || exportedService.exists).call(this, moduleObject.path, ownsToSourceDirectory[ownsName])) {
            (this.createFinding || exportedService.createFinding).call(this, report, 'warning', moduleObject, 'owns-without-source',
                '`nodics.owns` includes `' + ownsName + '` but `' +
                ownsToSourceDirectory[ownsName] + '` does not exist.');
        }
    });
},

    /** Implements validateBoundaryFolders as an overrideable service operation. */
    validateBoundaryFolders: function (report, moduleObject) {
    const kind = ((moduleObject.packageJson.nodics || {}).kind);
    if (kind === 'project') {
        ['src', 'data', 'generated'].forEach(relativePath => {
            if ((this.exists || exportedService.exists).call(this, moduleObject.path, relativePath)) {
                (this.createFinding || exportedService.createFinding).call(this, report, 'warning', moduleObject, 'project-runtime-folder',
                    'Project root should not own empty or runtime folder `' + relativePath + '`.');
            }
        });
    }
    if (kind === 'group' && (this.exists || exportedService.exists).call(this, moduleObject.path, 'data')) {
        const owns = new Set((moduleObject.packageJson.nodics || {}).owns || []);
        if (!owns.has('data')) {
            (this.createFinding || exportedService.createFinding).call(this, report, 'warning', moduleObject, 'group-data-without-ownership',
                'Group module has `data/` but does not declare data ownership.');
        }
    }
},

    /** Implements collectNamedFiles as an overrideable service operation. */
    collectNamedFiles: function (directory, fileName, files) {
    if (!fs.existsSync(directory)) {
        return files;
    }
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            (this.collectNamedFiles || exportedService.collectNamedFiles).call(this, entryPath, fileName, files);
        } else if (entry.name === fileName) {
            files.push(entryPath);
        }
    });
    return files;
},

    /** Implements validateDataManifest as an overrideable service operation. */
    validateDataManifest: function (report, moduleObject) {
    const dataPath = path.join(moduleObject.path, 'data');
    if (!fs.existsSync(dataPath) || fs.readdirSync(dataPath).length === 0) {
        return;
    }
    const manifestPath = path.join(dataPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        (this.createFinding || exportedService.createFinding).call(this, report, 'warning', moduleObject, 'missing-data-manifest',
            '`data/manifest.json` is generated release evidence. Run the data manifest generator before publishing or release qualification.');
        return;
    }
    const nestedManifests = (this.collectNamedFiles || exportedService.collectNamedFiles).call(this, dataPath, 'manifest.json', [])
        .filter(filePath => filePath !== manifestPath);
    nestedManifests.forEach(filePath => (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject,
        'nested-data-manifest', 'Nested data manifest is forbidden: `' + (this.relative || exportedService.relative).call(this, moduleObject.path, filePath) + '`.'));
    let manifest;
    try {
        manifest = (this.readJson || exportedService.readJson).call(this, manifestPath);
    } catch (error) {
        (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'invalid-data-manifest-json',
            '`data/manifest.json` must contain valid JSON.');
        return;
    }
    if (![0, 2].includes(manifest.contractVersion) || manifest.module !== moduleObject.packageJson.name ||
        (manifest.sections !== undefined && (!manifest.sections || typeof manifest.sections !== 'object' || Array.isArray(manifest.sections)))) {
        (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'invalid-data-manifest-envelope',
            '`data/manifest.json` must use contractVersion 0 or 2, match package name, and use a sections map when release metadata is present.');
        return;
    }
    manifest.sections = manifest.sections || {};
    const supportedKinds = new Set(['DATA_RELEASE', 'CONTENT_PACK', 'SOURCE_CONTRIBUTION']);
    Object.keys(manifest.sections).forEach(sectionName => {
        const section = manifest.sections[sectionName];
        if (!section || !supportedKinds.has(section.kind) || !/^\d+\.\d+\.\d+$/.test(section.version || '')) {
            (this.createFinding || exportedService.createFinding).call(this, report, 'error', moduleObject, 'invalid-data-manifest-section',
                'Section `' + sectionName + '` must declare a supported kind and semantic version.');
        }
    });
},

    /** Implements validateActivationPlacement as an overrideable service operation. */
    validateActivationPlacement: function (report, moduleObject) {
    const propertiesPath = path.join(moduleObject.path, 'config/properties.js');
    if (!fs.existsSync(propertiesPath)) {
        return;
    }
    const source = fs.readFileSync(propertiesPath, 'utf8');
    if (!/\bactiveModules\s*:/.test(source)) {
        return;
    }
    const kind = (moduleObject.packageJson.nodics || {}).kind;
    if (kind !== 'server') {
        (this.createFinding || exportedService.createFinding).call(this, report, 'warning', moduleObject, 'active-modules-outside-server',
            '`activeModules` should normally belong to server `config/properties.js`.');
    }
},

    /** Implements stripJavaScriptComments as an overrideable service operation. */
    stripJavaScriptComments: function (source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/.*$/gm, '$1');
},

    /** Implements validatePropertiesPurity as an overrideable service operation. */
    validatePropertiesPurity: function (report, moduleObject) {
    const propertiesPath = path.join(moduleObject.path, 'config/properties.js');
    if (!fs.existsSync(propertiesPath)) {
        return;
    }
    if ((this.isTopologyModule || exportedService.isTopologyModule).call(this, moduleObject)) {
        return;
    }
    const activeSource = (this.stripJavaScriptComments || exportedService.stripJavaScriptComments).call(this, fs.readFileSync(propertiesPath, 'utf8'));
    const allowedThinDefaultRequire = /^\s*module\.exports\s*=\s*require\(["']\.\.\/src\/utils\/default[A-Za-z0-9_]+Properties["']\)\s*;?\s*$/;
    const normalizedSource = activeSource.trim();
    if (allowedThinDefaultRequire.test(normalizedSource)) {
        return;
    }
    const executablePatterns = [
        { pattern: /\bfunction\b/, label: 'function declarations' },
        { pattern: /=>/, label: 'arrow functions' },
        { pattern: /\bnew\s+(Map|Set|Date|Promise)\b/, label: 'runtime constructors' },
        { pattern: /\.(map|reduce|filter|forEach|sort|flatMap)\s*\(/, label: 'collection transformation logic' },
        { pattern: /\brequire\s*\(/, label: 'runtime imports' },
        { pattern: /\bimport\s*\(/, label: 'dynamic imports' }
    ];
    const match = executablePatterns.find(entry => entry.pattern.test(activeSource));
    if (match) {
        (this.createFinding || exportedService.createFinding).call(this, report, 'warning', moduleObject, 'properties-executable-logic',
            '`config/properties.js` must remain a thin configuration contribution. Move ' +
            match.label + ' to module-owned source utilities or services.');
    }
},

    /** Implements collectReport as an overrideable service operation. */
    collectReport: function (options) {
    const modules = (this.scanModules || exportedService.scanModules).call(this, options.rootDir, options.rootDir, [], options.includeRoot === true);
    const report = {
        rootDir: options.rootDir,
        modulesChecked: modules.length,
        findings: []
    };
    modules.forEach(moduleObject => {
        (this.validateRootFiles || exportedService.validateRootFiles).call(this, report, moduleObject);
        (this.validateMetadata || exportedService.validateMetadata).call(this, report, moduleObject);
        (this.validateSourceStructure || exportedService.validateSourceStructure).call(this, report, moduleObject);
        (this.validateOwnershipAlignment || exportedService.validateOwnershipAlignment).call(this, report, moduleObject);
        (this.validateBoundaryFolders || exportedService.validateBoundaryFolders).call(this, report, moduleObject);
        (this.validateDataManifest || exportedService.validateDataManifest).call(this, report, moduleObject);
        (this.validateActivationPlacement || exportedService.validateActivationPlacement).call(this, report, moduleObject);
        (this.validatePropertiesPurity || exportedService.validatePropertiesPurity).call(this, report, moduleObject);
    });
    report.errorCount = report.findings.filter(finding => finding.severity === 'error').length;
    report.warningCount = report.findings.filter(finding => finding.severity === 'warning').length;
    if (!options.includeInfo) {
        report.findings = report.findings.filter(finding => finding.severity !== 'info');
    }
    return report;
},

    /** Implements printReport as an overrideable service operation. */
    printReport: function (report, limit) {
    console.log('Nodics structure compliance audit');
    console.log('Modules checked       : ' + report.modulesChecked);
    console.log('Errors                : ' + report.errorCount);
    console.log('Warnings              : ' + report.warningCount);
    if (report.findings.length > 0) {
        console.log('\nFindings:');
        report.findings.slice(0, limit).forEach(finding => {
            console.log('  - [' + finding.severity + '] ' + finding.module + ' :: ' +
                finding.code + ' :: ' + finding.message);
        });
        if (report.findings.length > limit) {
            console.log('  ... ' + (report.findings.length - limit) + ' more');
        }
    }
},

    /** Implements hasComplianceGaps as an overrideable service operation. */
    hasComplianceGaps: function (report) {
    return report.errorCount > 0 || report.warningCount > 0;
},

    /** Implements runCli as an overrideable service operation. */
    runCli: function (args) {
    const options = (this.createOptions || exportedService.createOptions).call(this, args || []);
    const report = (this.collectReport || exportedService.collectReport).call(this, options);
    (this.printReport || exportedService.printReport).call(this, report, options.reportLimit);
    if (options.failOnGap && (this.hasComplianceGaps || exportedService.hasComplianceGaps).call(this, report)) {
        process.exitCode = 1;
    }
}
};

if (require.main === module) {
    exportedService.runCli(process.argv.slice(2));
}
