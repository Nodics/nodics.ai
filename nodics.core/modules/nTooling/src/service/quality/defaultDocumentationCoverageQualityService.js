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
 * @module nTooling/service/quality/defaultDocumentationCoverageQualityService
 * @description Collects project-scoped source documentation coverage by module, layer, contract scope, test inclusion, and generated-artifact policy.
 * @layer tooling
 * @owner nTooling
 * @override Projects may replace or wrap the `docs:coverage` command while retaining explicit scope and failure semantics.
 */

const frameworkRootDir = path.resolve(__dirname, '../../../../..');


const excludedDirs = new Set([
    '.git',
    'node_modules',
    'temp',
    'logs',
    'dist',
    'gen',
    'templates'
]);

const sourceLayers = new Set([
    'controller',
    'facade',
    'service',
    'router',
    'pipelines',
    'interceptors',
    'lib',
    'schemas',
    'utils'
]);

const runtimeLayers = new Set([
    'controller',
    'facade',
    'service',
    'router',
    'pipelines',
    'interceptors',
    'lib'
]);

const contractLayers = new Set([
    'schemas',
    'router'
]);




let exportedService;
module.exports = exportedService = {
    /** Implements readOption as an overrideable service operation. */
    readOption: function (args, name, defaultValue) {
    const prefix = name + '=';
    const match = args.find(arg => arg.indexOf(prefix) === 0);
    if (!match) {
        return defaultValue;
    }
    return match.slice(prefix.length);
},

    /** Implements readCsvOption as an overrideable service operation. */
    readCsvOption: function (args, name) {
    const value = (this.readOption || exportedService.readOption).call(this, args, name, '');
    if (!value) {
        return [];
    }
    return value.split(',').map(item => item.trim()).filter(Boolean);
},

    /** Implements isExcludedDirectory as an overrideable service operation. */
    isExcludedDirectory: function (fullPath, entryName, rootDir, includeGenerated) {
    if (path.relative(rootDir, fullPath) === 'docs') {
        return true;
    }
    return excludedDirs.has(entryName) && !(includeGenerated && entryName === 'gen');
},

    /** Implements walk as an overrideable service operation. */
    walk: function (dir, files, includeTests, includeGenerated, rootDir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
        if (entry.name.startsWith('.')) {
            return;
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if ((this.isExcludedDirectory || exportedService.isExcludedDirectory).call(this, fullPath, entry.name, rootDir, includeGenerated)) {
                return;
            }
            if (!includeTests && entry.name === 'test') {
                return;
            }
            (this.walk || exportedService.walk).call(this, fullPath, files, includeTests, includeGenerated, rootDir);
            return;
        }
        if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath);
        }
    });
},

    /** Implements pathParts as an overrideable service operation. */
    pathParts: function (filePath, coverageRootDir) {
    return (this.relative || exportedService.relative).call(this, filePath, coverageRootDir).split(path.sep);
},

    /** Implements getModuleName as an overrideable service operation. */
    getModuleName: function (filePath, coverageRootDir) {
    const parts = (this.pathParts || exportedService.pathParts).call(this, filePath, coverageRootDir);
    if (parts.length < 2) {
        return '';
    }
    if (parts[1] && !['config', 'src', 'test', 'data', 'nodics.js'].includes(parts[1])) {
        return parts[1];
    }
    return parts[0];
},

    /** Implements getLayer as an overrideable service operation. */
    getLayer: function (filePath, coverageRootDir) {
    const parts = (this.pathParts || exportedService.pathParts).call(this, filePath, coverageRootDir);
    const srcIndex = parts.indexOf('src');
    if (srcIndex >= 0 && parts[srcIndex + 1]) {
        return parts[srcIndex + 1];
    }
    if (parts.includes('config')) {
        return 'config';
    }
    if (parts.includes('test')) {
        return 'test';
    }
    if (parts.includes('data')) {
        return 'data';
    }
    if (parts[parts.length - 1] === 'nodics.js') {
        return 'module';
    }
    return 'unknown';
},

    /** Implements isFrameworkCoreModule as an overrideable service operation. */
    isFrameworkCoreModule: function (moduleName) {
    return [
        'nConfig',
        'nCommon',
        'nDatabase',
        'nRouter',
        'nService',
        'nPipeline'
    ].includes(moduleName);
},

    /** Implements isGeneratedRuntimeArtifact as an overrideable service operation. */
    isGeneratedRuntimeArtifact: function (filePath, coverageRootDir) {
    const parts = (this.pathParts || exportedService.pathParts).call(this, filePath, coverageRootDir);
    const genIndex = parts.indexOf('gen');
    if (genIndex < 0 || !parts.includes('src')) {
        return false;
    }
    const srcIndex = parts.indexOf('src');
    const layer = parts[srcIndex + 1];
    return ['service', 'facade', 'controller'].includes(layer) && parts[genIndex - 1] === layer;
},

    /** Implements matchesScope as an overrideable service operation. */
    matchesScope: function (filePath, options) {
    const parts = (this.pathParts || exportedService.pathParts).call(this, filePath, options.rootDir);
    const layer = (this.getLayer || exportedService.getLayer).call(this, filePath, options.rootDir);
    const moduleName = (this.getModuleName || exportedService.getModuleName).call(this, filePath, options.rootDir);

    if (options.moduleFilter.length > 0 && !options.moduleFilter.includes(moduleName)) {
        return false;
    }
    if (options.layerFilter.length > 0 && !options.layerFilter.includes(layer)) {
        return false;
    }

    if (options.scope === 'all') {
        return true;
    }
    if (options.scope === 'source') {
        return parts.includes('src') && sourceLayers.has(layer);
    }
    if (options.scope === 'runtime') {
        return parts.includes('src') && runtimeLayers.has(layer);
    }
    if (options.scope === 'contracts') {
        return (parts.includes('src') && contractLayers.has(layer)) || layer === 'config' || layer === 'module';
    }
    if (options.scope === 'framework-core') {
        return (this.isFrameworkCoreModule || exportedService.isFrameworkCoreModule).call(this, moduleName) && parts.includes('src') && runtimeLayers.has(layer);
    }
    if (options.scope === 'generated') {
        return (this.isGeneratedRuntimeArtifact || exportedService.isGeneratedRuntimeArtifact).call(this, filePath, options.rootDir);
    }
    throw new Error('Unknown documentation coverage scope: ' + options.scope);
},

    /** Implements hasModuleDocumentation as an overrideable service operation. */
    hasModuleDocumentation: function (content) {
    const exportIndex = content.indexOf('module.exports');
    if (exportIndex < 0) {
        return true;
    }
    const beforeExport = content.slice(0, exportIndex);
    const docBlocks = beforeExport.match(/\/\*\*[\s\S]*?\*\//g) || [];
    return docBlocks.some(block => block.includes('@module') || block.includes('@description'));
},

    /** Implements hasGeneratedDocumentation as an overrideable service operation. */
    hasGeneratedDocumentation: function (content) {
    const exportIndex = content.indexOf('module.exports');
    const header = exportIndex >= 0 ? content.slice(0, exportIndex) : content;
    return header.includes('@generated') &&
        header.includes('@module generated/') &&
        header.includes('@sourceTemplate') &&
        header.includes('@schema') &&
        header.includes('@override');
},

    /** Implements maskComments as an overrideable service operation. */
    maskComments: function (content) {
    return content.replace(/\/\*[\s\S]*?\*\//g, match => ' '.repeat(match.length))
        .replace(/\/\/[^\n\r]*/g, match => ' '.repeat(match.length));
},

    /** Implements findExportedMethods as an overrideable service operation. */
    findExportedMethods: function (content) {
    const methods = [];
    const exportIndex = content.indexOf('module.exports');
    if (exportIndex < 0) {
        return methods;
    }

    const scanContent = (this.maskComments || exportedService.maskComments).call(this, content);
    const methodPattern = /(?:^|\n)(\s*)([A-Za-z_$][\w$]*)\s*:\s*(?:async\s+)?function\s*\(/g;
    let match;
    while ((match = methodPattern.exec(scanContent)) !== null) {
        methods.push({
            name: match[2],
            index: match.index + match[0].indexOf(match[2])
        });
    }
    return methods;
},

    /** Implements hasMethodDocumentation as an overrideable service operation. */
    hasMethodDocumentation: function (content, methodIndex) {
    const beforeMethod = content.slice(Math.max(0, methodIndex - 2000), methodIndex);
    const lastDocStart = beforeMethod.lastIndexOf('/**');
    const lastDocEnd = beforeMethod.lastIndexOf('*/');
    if (lastDocStart < 0 || lastDocEnd < lastDocStart) {
        return false;
    }
    const betweenDocAndMethod = beforeMethod.slice(lastDocEnd + 2).trim();
    return betweenDocAndMethod.length === 0;
},

    /** Implements relative as an overrideable service operation. */
    relative: function (filePath, coverageRootDir) {
    return path.relative(coverageRootDir || frameworkRootDir, filePath);
},

    /** Implements createOptions as an overrideable service operation. */
    createOptions: function (args) {
    args = args || [];
    const configuredHome = (this.readOption || exportedService.readOption).call(this, args, '--home', process.env.NODICS_HOME || '');
    return {
        rootDir: configuredHome ? path.resolve(configuredHome) : process.cwd(),
        failOnMissing: args.includes('--fail'),
        includeTests: args.includes('--include-tests'),
        includeGenerated: args.includes('--include-generated') || (this.readOption || exportedService.readOption).call(this, args, '--scope', 'all') === 'generated',
        scope: (this.readOption || exportedService.readOption).call(this, args, '--scope', 'all'),
        moduleFilter: (this.readCsvOption || exportedService.readCsvOption).call(this, args, '--module'),
        layerFilter: (this.readCsvOption || exportedService.readCsvOption).call(this, args, '--layer'),
        reportLimit: Number((this.readOption || exportedService.readOption).call(this, args, '--limit', '80'))
    };
},

    /** Implements collectCoverage as an overrideable service operation. */
    collectCoverage: function (options) {
    const files = [];
    (this.walk || exportedService.walk).call(this, options.rootDir, files, options.includeTests, options.includeGenerated, options.rootDir);

    const report = {
        scope: options.scope,
        moduleFilter: options.moduleFilter,
        layerFilter: options.layerFilter,
        filesChecked: 0,
        filesMissingModuleDocs: [],
        methodsChecked: 0,
        methodsMissingDocs: []
    };

    files.forEach(filePath => {
        if (!(this.matchesScope || exportedService.matchesScope).call(this, filePath, options)) {
            return;
        }
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('module.exports')) {
            return;
        }

        report.filesChecked += 1;
        if (options.scope === 'generated') {
            if (!(this.hasGeneratedDocumentation || exportedService.hasGeneratedDocumentation).call(this, content)) {
                report.filesMissingModuleDocs.push((this.relative || exportedService.relative).call(this, filePath, options.rootDir));
            }
            return;
        }
        if (!(this.hasModuleDocumentation || exportedService.hasModuleDocumentation).call(this, content)) {
            report.filesMissingModuleDocs.push((this.relative || exportedService.relative).call(this, filePath, options.rootDir));
        }

        (this.findExportedMethods || exportedService.findExportedMethods).call(this, content).forEach(method => {
            report.methodsChecked += 1;
            if (!(this.hasMethodDocumentation || exportedService.hasMethodDocumentation).call(this, content, method.index)) {
                report.methodsMissingDocs.push((this.relative || exportedService.relative).call(this, filePath, options.rootDir) + '#' + method.name);
            }
        });
    });

    return report;
},

    /** Implements printReport as an overrideable service operation. */
    printReport: function (report, reportLimit) {
    console.log('Nodics documentation coverage');
    console.log('Scope                      : ' + report.scope);
    if (report.moduleFilter.length > 0) {
        console.log('Module filter              : ' + report.moduleFilter.join(', '));
    }
    if (report.layerFilter.length > 0) {
        console.log('Layer filter               : ' + report.layerFilter.join(', '));
    }
    console.log('Files checked              : ' + report.filesChecked);
    console.log('Undocumented files         : ' + report.filesMissingModuleDocs.length);
    console.log('Exported methods checked   : ' + report.methodsChecked);
    console.log('Methods without JSDoc      : ' + report.methodsMissingDocs.length);

    if (report.filesMissingModuleDocs.length > 0) {
        console.log('\nUndocumented files:');
        report.filesMissingModuleDocs.slice(0, reportLimit).forEach(item => console.log('  - ' + item));
        if (report.filesMissingModuleDocs.length > reportLimit) {
            console.log('  ... ' + (report.filesMissingModuleDocs.length - reportLimit) + ' more');
        }
    }

    if (report.methodsMissingDocs.length > 0) {
        console.log('\nExported methods without JSDoc:');
        report.methodsMissingDocs.slice(0, reportLimit).forEach(item => console.log('  - ' + item));
        if (report.methodsMissingDocs.length > reportLimit) {
            console.log('  ... ' + (report.methodsMissingDocs.length - reportLimit) + ' more');
        }
    }
},

    /** Implements hasMissingDocumentation as an overrideable service operation. */
    hasMissingDocumentation: function (report) {
    return report.filesMissingModuleDocs.length > 0 || report.methodsMissingDocs.length > 0;
},

    /** Implements runCli as an overrideable service operation. */
    runCli: function (args) {
    const options = (this.createOptions || exportedService.createOptions).call(this, args);
    const report = (this.collectCoverage || exportedService.collectCoverage).call(this, options);
    (this.printReport || exportedService.printReport).call(this, report, options.reportLimit);
    if (options.failOnMissing && (this.hasMissingDocumentation || exportedService.hasMissingDocumentation).call(this, report)) {
        process.exitCode = 1;
    }
}
};

if (require.main === module) {
    exportedService.runCli(process.argv.slice(2));
}
