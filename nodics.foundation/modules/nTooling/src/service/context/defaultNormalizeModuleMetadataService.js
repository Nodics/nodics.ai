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
 * @module nTooling/service/context/defaultNormalizeModuleMetadataService
 * @description Normalizes canonical package kind, runtime activation, loader eligibility, ownership, and topology descriptions across a target Nodics project.
 * @layer tooling
 * @owner nTooling
 * @override Projects may extend recognized package conventions through an explicit tooling command replacement rather than post-processing generated metadata.
 */

const {
    rootPath,
    listFeatureFolders,
    scanModules
} = require('./defaultModuleLlmContextUtilsService');

const generatedFolderToOwnership = {
    config: 'configuration',
    data: 'data',
    'src/schemas': 'schema',
    'src/router': 'router',
    'src/controller': 'controller',
    'src/facade': 'facade',
    'src/service': 'service',
    'src/pipelines': 'pipeline',
    'src/interceptors': 'interceptor',
    'src/event': 'event',
    'src/search': 'search',
    'src/service/tooling': 'tooling',
    'src/utils': 'utility',
    test: 'test'
};

const preservedExplicitOwnership = new Set([
    'assets',
    'documentation'
]);

const nonRuntimeKinds = new Set([
    'framework',
    'setup',
    'tooling'
]);

function detectJsonIndent(source) {
    const match = source.match(/\n( +)"/);
    return match ? match[1].length : 2;
}

function writePackageJsonIfChanged(packagePath, packageJson, source) {
    const formatted = JSON.stringify(packageJson, null, detectJsonIndent(source)) + '\n';
    if (formatted !== source) {
        fs.writeFileSync(packagePath, formatted, 'utf8');
    }
}

function isStructuralGroup(module) {
    return module.relativePath === 'modules' || module.relativePath === 'envs';
}




let exportedService;
module.exports = exportedService = {
    /** Implements hasChildren as an overrideable service operation. */
    hasChildren: function (module) {
    let entries = fs.readdirSync(module.path, { withFileTypes: true });
    return entries.some(entry => {
        if (!entry.isDirectory()) {
            return false;
        }
        let childPath = path.join(module.path, entry.name);
        return fs.existsSync(path.join(childPath, 'package.json')) &&
            fs.existsSync(path.join(childPath, 'nodics.js'));
    });
},

    /** Implements inferKind as an overrideable service operation. */
    inferKind: function (module) {
    let relativePath = module.relativePath;
    let type = module.packageJson.type;
    let nodics = module.packageJson.nodics || {};

    if (nodics.kind) {
        return nodics.kind;
    }
    if (relativePath === '.') {
        return 'application';
    }
    if (relativePath === 'modules/nSetup' || type === 'setup') {
        return 'setup';
    }
    if (relativePath === 'nodics.foundation/modules/nTooling') {
        return 'tooling';
    }
    if (relativePath.includes('/templates/')) {
        return 'template';
    }
    let pathParts = relativePath.split('/');
    let envGroupIndex = pathParts.findIndex(part => /Envs$/.test(part));
    if (envGroupIndex >= 0) {
        let hierarchyDepth = pathParts.length - envGroupIndex - 1;
        return ['group', 'group', 'server'][hierarchyDepth] || 'node';
    }
    if (relativePath.endsWith('Modules')) {
        return 'group';
    }
    if (pathParts.length === 1 && (this.hasChildren || exportedService.hasChildren).call(this, module)) {
        return 'application';
    }
    if (type === 'group' || ((this.hasChildren || exportedService.hasChildren).call(this, module) && !['router', 'publish', 'web'].includes(type))) {
        return 'group';
    }
    if (type === 'publish') {
        return 'publish';
    }
    if (type === 'web') {
        return 'web';
    }
    return 'capability';
},

    /** Implements inferRuntime as an overrideable service operation. */
    inferRuntime: function (packageJson, kind) {
    let currentRuntime = packageJson.nodics && packageJson.nodics.runtime ? packageJson.nodics.runtime : {};
    return Object.assign({}, currentRuntime, {
        router: currentRuntime.router === true || packageJson.type === 'router' || packageJson.type === 'web',
        publish: currentRuntime.publish === true || kind === 'publish' || packageJson.type === 'publish',
        web: currentRuntime.web === true || kind === 'web' || packageJson.type === 'web'
    });
},

    /** Implements inferDescription as an overrideable service operation. */
    inferDescription: function (module, kind) {
    if (module.packageJson.description) {
        return module.packageJson.description;
    }
    const displayName = module.packageJson?.nodics?.displayName || module.packageJson.name;
    if (module.relativePath === 'envs') {
        return 'Environment composition boundary for this Nodics project.';
    }
    if (module.relativePath.startsWith('envs/')) {
        return displayName + ' runtime composition and configuration boundary for this Nodics project.';
    }
    return displayName + ' ' + kind + ' module for this Nodics project.';
},

    /** Implements inferOwns as an overrideable service operation. */
    inferOwns: function (module, kind) {
    if (kind === 'framework') {
        return Array.isArray(module.packageJson?.nodics?.owns) && module.packageJson.nodics.owns.length
            ? module.packageJson.nodics.owns
            : ['repository', 'workspace-governance', 'release'];
    }
    if (kind === 'setup') {
        return ['llm'];
    }
    if (kind === 'tooling') {
        return ['tooling', 'quality', 'configuration', 'service', 'test', 'llm'];
    }
    let owns = listFeatureFolders(module.path)
        .map(folder => generatedFolderToOwnership[folder])
        .filter(Boolean);
    if (fs.existsSync(path.join(module.path, 'docs'))) {
        owns.push('documentation');
    }
    (Array.isArray(module.packageJson?.nodics?.owns) ? module.packageJson.nodics.owns : [])
        .filter(ownership => preservedExplicitOwnership.has(ownership))
        .forEach(ownership => owns.push(ownership));
    if ((kind === 'group' || (this.hasChildren || exportedService.hasChildren).call(this, module)) && !owns.includes('composition')) {
        owns.unshift('composition');
    }
    if (!owns.includes('llm')) {
        owns.push('llm');
    }
    return Array.from(new Set(owns));
},

    /** Implements normalizeModule as an overrideable service operation. */
    normalizeModule: function (module) {
    let packagePath = path.join(module.path, 'package.json');
    let source = fs.readFileSync(packagePath, 'utf8');
    let packageJson = JSON.parse(source);
    let kind = (this.inferKind || exportedService.inferKind).call(this, module);
    packageJson.description = (this.inferDescription || exportedService.inferDescription).call(this, {
        path: module.path,
        relativePath: module.relativePath,
        packageJson: packageJson
    }, kind);
    const runtimeLoadable = !nonRuntimeKinds.has(kind) && !isStructuralGroup(module);
    packageJson.nodics = Object.assign({}, packageJson.nodics || {}, {
        kind: kind,
        runtime: (this.inferRuntime || exportedService.inferRuntime).call(this, packageJson, kind),
        runtimeModule: runtimeLoadable,
        loadableByNodicsModuleLoader: runtimeLoadable,
        owns: (this.inferOwns || exportedService.inferOwns).call(this, module, kind)
    });
    delete packageJson.nodics.moduleType;
    delete packageJson.type;
    delete packageJson.nodics.description;
    writePackageJsonIfChanged(packagePath, packageJson, source);
},

    /** Implements run as an overrideable service operation. */
    run: function () {
    let rootPackage = JSON.parse(fs.readFileSync(path.join(rootPath, 'package.json'), 'utf8'));
    let modules = [{
        name: rootPackage.name,
        index: rootPackage.index,
        path: rootPath,
        relativePath: '.',
        packageJson: rootPackage
    }].concat(scanModules());
    modules.forEach(exportedService.normalizeModule);
    console.log('Normalized Nodics metadata for ' + modules.length + ' packages');
}
};

if (require.main === module) {
    exportedService.run();
}
