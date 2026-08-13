/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Enum = require('../../../../nConfig/bin/enum');
const toolingProperties = require('../../../config/properties');

/**
 * @module nTooling/service/context/defaultModuleLlmContextUtilsService
 * @description Shared project-aware discovery, ownership, schema bootstrap, fingerprint, and generated-directory utilities used by Nodics context and metadata commands.
 * @layer tooling
 * @owner nTooling
 * @override Tooling commands may compose these utilities, but project-root resolution and module ownership rules must remain consistent.
 */

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());
const discoveryConfig = toolingProperties.tooling && toolingProperties.tooling.discovery || {};
const ignoredDirectories = new Set(discoveryConfig.ignoredDirectories || []);
const ignoredFiles = new Set(discoveryConfig.ignoredFiles || []);


let exportedService;
module.exports = exportedService = {
    /** Implements toPosix as an overrideable service operation. */
    toPosix: function (filePath) {
    return filePath.split(path.sep).join('/');
},

    /** Implements toRelative as an overrideable service operation. */
    toRelative: function (filePath) {
    return (this.toPosix || exportedService.toPosix).call(this, path.relative(rootPath, filePath));
},

    /** Implements readJson as an overrideable service operation. */
    readJson: function (filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
},

    /** Implements isModuleDirectory as an overrideable service operation. */
    isModuleDirectory: function (directory) {
    return fs.existsSync(path.join(directory, 'nodics.js')) &&
        fs.existsSync(path.join(directory, 'package.json'));
},

    /** Implements scanModules as an overrideable service operation. */
    scanModules: function (directory = rootPath, modules = []) {
    if (!fs.existsSync(directory)) {
        return modules;
    }

    let entries = fs.readdirSync(directory, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .sort((left, right) => left.name.localeCompare(right.name));

    entries.forEach(entry => {
        if (ignoredDirectories.has(entry.name)) {
            return;
        }

        let entryPath = path.join(directory, entry.name);
        if ((this.isModuleDirectory || exportedService.isModuleDirectory).call(this, entryPath)) {
            let packageJson = (this.readJson || exportedService.readJson).call(this, path.join(entryPath, 'package.json'));
            modules.push({
                name: packageJson.name || entry.name,
                index: packageJson.index,
                description: packageJson.description,
                path: entryPath,
                relativePath: (this.toRelative || exportedService.toRelative).call(this, entryPath),
                packageJson: packageJson
            });
        }
        (this.scanModules || exportedService.scanModules).call(this, entryPath, modules);
    });

    return modules.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
},

    /** Implements ensureDirectory as an overrideable service operation. */
    ensureDirectory: function (directory) {
    fs.mkdirSync(directory, { recursive: true });
},

    /** Implements removeDirectory as an overrideable service operation. */
    removeDirectory: function (directory) {
    if (fs.existsSync(directory)) {
        fs.rmSync(directory, { recursive: true, force: true });
    }
},

    /** Implements collectFiles as an overrideable service operation. */
    collectFiles: function (directory, matcher, files = []) {
    if (!fs.existsSync(directory)) {
        return files;
    }

    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
        let entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            if (!ignoredDirectories.has(entry.name)) {
                (this.collectFiles || exportedService.collectFiles).call(this, entryPath, matcher, files);
            }
            return;
        }
        if (ignoredFiles.has(entry.name)) {
            return;
        }
        if (!matcher || matcher(entryPath)) {
            files.push((this.toRelative || exportedService.toRelative).call(this, entryPath));
        }
    });

    return files.sort();
},

    /** Implements collectModuleOwnedFiles as an overrideable service operation. */
    collectModuleOwnedFiles: function (modulePath) {
    const files = [];
    const ignoredModuleDirectories = new Set([
        ...ignoredDirectories,
        'gen'
    ]);

    function walk(directory) {
        if (!fs.existsSync(directory)) {
            return;
        }
        fs.readdirSync(directory, { withFileTypes: true })
            .sort((left, right) => left.name.localeCompare(right.name))
            .forEach(entry => {
                const entryPath = path.join(directory, entry.name);
                if (entry.isDirectory()) {
                    if (ignoredModuleDirectories.has(entry.name)) {
                        return;
                    }
                    if (entryPath !== modulePath && (this.isModuleDirectory || exportedService.isModuleDirectory).call(this, entryPath)) {
                        return;
                    }
                    if (entry.name === 'llm') {
                        const readmePath = path.join(entryPath, 'README.md');
                        if (fs.existsSync(readmePath)) {
                            files.push((this.toRelative || exportedService.toRelative).call(this, readmePath));
                        }
                        return;
                    }
                    walk(entryPath);
                    return;
                }
                if (!ignoredFiles.has(entry.name)) {
                    files.push((this.toRelative || exportedService.toRelative).call(this, entryPath));
                }
            });
    }

    walk(modulePath);
    return files.sort();
},

    /** Implements createFilesFingerprint as an overrideable service operation. */
    createFilesFingerprint: function (relativeFiles) {
    const hash = crypto.createHash('sha256');
    (relativeFiles || []).slice().sort().forEach(relativeFile => {
        const absolutePath = path.join(rootPath, relativeFile);
        hash.update(relativeFile);
        hash.update('\0');
        hash.update(fs.readFileSync(absolutePath));
        hash.update('\0');
    });
    return hash.digest('hex');
},

    /** Implements getRelativeIfExists as an overrideable service operation. */
    getRelativeIfExists: function (modulePath, relativePath) {
    let targetPath = path.join(modulePath, relativePath);
    return fs.existsSync(targetPath) ? (this.toRelative || exportedService.toRelative).call(this, targetPath) : null;
},

    /** Implements loadLocalSchemas as an overrideable service operation. */
    loadLocalSchemas: function (modulePath) {
    let schemaPath = path.join(modulePath, 'src', 'schemas', 'schemas.js');
    if (!fs.existsSync(schemaPath)) {
        return {
            schemas: {},
            error: null
        };
    }

    try {
        delete require.cache[require.resolve(schemaPath)];
        return {
            schemas: require(schemaPath) || {},
            error: null
        };
    } catch (error) {
        return {
            schemas: {},
            error: error.message
        };
    }
},

    /** Implements createEnumOptions as an overrideable service operation. */
    createEnumOptions: function (enumName, enumDefinition) {
    if (!enumDefinition || !enumDefinition._options) {
        return undefined;
    }
    return {
        name: enumDefinition._options.name || enumName,
        separator: enumDefinition._options.separator || '|',
        ignoreCase: enumDefinition._options.ignoreCase || false,
        freez: enumDefinition._options.freez || false,
        endianness: enumDefinition._options.endianness
    };
},

    /** Implements bootstrapSchemaGlobals as an overrideable service operation. */
    bootstrapSchemaGlobals: function (modules = (this.scanModules || exportedService.scanModules).call(this, )) {
    global.ENUMS = global.ENUMS || {};
    modules.forEach(module => {
        let enumPath = path.join(module.path, 'src', 'utils', 'enums.js');
        if (!fs.existsSync(enumPath)) {
            return;
        }
        delete require.cache[require.resolve(enumPath)];
        let enumScript = require(enumPath);
        Object.keys(enumScript || {}).forEach(enumName => {
            let enumDefinition = enumScript[enumName];
            if (enumDefinition && enumDefinition.definition) {
                global.ENUMS[enumName] = new Enum(enumDefinition.definition, (this.createEnumOptions || exportedService.createEnumOptions).call(this, enumName, enumDefinition));
            }
        });
    });
},

    /** Implements listFeatureFolders as an overrideable service operation. */
    listFeatureFolders: function (modulePath) {
    return [
        'config',
        'data',
        'src/schemas',
        'src/router',
        'src/controller',
        'src/facade',
        'src/service',
        'src/pipelines',
        'src/interceptors',
        'src/event',
        'src/search',
        'src/utils',
        'test'
    ].filter(relativePath => fs.existsSync(path.join(modulePath, relativePath)));
},

    /** Implements getModuleKind as an overrideable service operation. */
    getModuleKind: function (module) {
    if (module.packageJson && module.packageJson.nodics && module.packageJson.nodics.kind) {
        return module.packageJson.nodics.kind;
    }

    let relativePath = module.relativePath;
    if ((this.isNSetupModule || exportedService.isNSetupModule).call(this, module)) {
        return 'setup';
    }
    let pathParts = relativePath.split('/');
    let envGroupIndex = pathParts.findIndex(part => /Envs$/.test(part));
    if (envGroupIndex >= 0) {
        let hierarchyDepth = pathParts.length - envGroupIndex - 1;
        return ['group', 'group', 'server'][hierarchyDepth] || 'node';
    }
    if (pathParts.some(part => /Modules$/.test(part))) {
        return 'capability';
    }
    if (pathParts.length === 1 && !relativePath.startsWith('nodics.')) {
        return 'application';
    }
    if (relativePath.includes('/templates/')) {
        return 'template';
    }
    return 'capability';
},

    /** Implements isNSetupModule as an overrideable service operation. */
    isNSetupModule: function (module) {
    return module.name === 'nSetup' ||
        module.relativePath === 'modules/nSetup' ||
        module.relativePath.endsWith('/modules/nSetup');
},

    /** Implements getModuleRuntime as an overrideable service operation. */
    getModuleRuntime: function (module) {
    if (module.packageJson && module.packageJson.nodics && module.packageJson.nodics.runtime) {
        return module.packageJson.nodics.runtime;
    }
    return {};
},

    /** Implements getModuleRuntimeSummary as an overrideable service operation. */
    getModuleRuntimeSummary: function (module) {
    let runtime = (this.getModuleRuntime || exportedService.getModuleRuntime).call(this, module);
    let enabled = Object.keys(runtime).sort().filter(key => runtime[key] === true);
    return enabled.length ? enabled.join(', ') : 'none';
},

    /** Implements rootPath as an overrideable service operation. */
rootPath
};
