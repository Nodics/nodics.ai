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
 * @module nDynamo/service/tooling/defaultGovernanceReportGeneratorService
 * @description Generates a server-owned report of effective schema, router, artifact, generated-file, warning, and override traceability state.
 * @layer tooling
 * @owner nDynamo
 * @override Projects may explicitly replace the `governance:report` command or extend governed runtime definitions through the standard module hierarchy.
 */

const frameworkRootDir = path.resolve(__dirname, '../../../..');
const config = require(path.join(frameworkRootDir, 'nConfig'));
const tooling = require(path.join(frameworkRootDir, 'nTooling/src/service/defaultToolingCommandService'));
const runtime = require(path.join(frameworkRootDir, 'nTooling/src/service/project/defaultProjectRuntimeStartService'));
const composition = require(path.join(frameworkRootDir, 'nTooling/src/service/command/defaultRepositoryBuildCompositionService'));
const projectRootDir = path.resolve(process.env.NODICS_HOME || process.cwd());

/**
 * Resolves governance-report targets through canonical nTooling project metadata
 * or its tooling-only repository build composition.
 *
 * @returns {Object} Effective runtime options for `config.prepareBuild`.
 */


/** Executes the governance report generator from the command line. */


let exportedService;
module.exports = exportedService = {
    /** Implements resolveRuntimeOptions as an overrideable service operation. */
    resolveRuntimeOptions: function (args = process.argv.slice(2), environment = process.env) {
    args = tooling.normalizeArguments(args);
    const commandHome = path.resolve(tooling.readOption(args, '--home', environment.NODICS_HOME || process.cwd()));
    const packageJson = runtime.readProjectPackage(commandHome);
    const selected = Object.assign({}, environment);
    const environmentName = tooling.readOption(args, '--environment', environment.ENV || environment.E);
    if (environmentName) { selected.ENV = environmentName; selected.E = environmentName; }
    let projectHome = commandHome;
    let serverCode = tooling.readOption(args, '--server', environment.S || environment.SERVER);
    let frameworkRoot;
    if (packageJson.name === 'nodics.ai' && packageJson.nodics && packageJson.nodics.runtimeModule === false) {
        frameworkRoot = commandHome;
        if (environment.CUSTOM_HOME && path.resolve(environment.CUSTOM_HOME) !== commandHome) {
            projectHome = path.resolve(environment.CUSTOM_HOME);
        } else {
            const target = composition.create(frameworkRoot, { persistent: true });
            projectHome = target.root;
            selected.ENV = environmentName || target.environmentName;
            selected.E = selected.ENV;
            serverCode = serverCode || target.serverName;
        }
    } else if (!packageJson.nodics || packageJson.nodics.kind !== 'application') {
        throw new Error('Governance reporting requires a project application or framework repository home');
    }
    if (!serverCode) throw new Error('Select --server for project governance reporting');
    runtime.readManifest(projectHome);
    const server = runtime.resolveServer(projectHome, serverCode, selected);
    frameworkRoot = frameworkRoot || runtime.resolveFrameworkRoot(projectHome, selected);
    return {
        NODICS_HOME: runtime.packageRoot(frameworkRoot, 'nodics.foundation'),
        CUSTOM_HOME: projectHome,
        // The repository composition already extends Foundation; discovery visits each root once.
        MODULE_ROOTS: [...new Set(runtime.resolveModuleRoots(projectHome, frameworkRoot, server))],
        defaultEnvironment: server.environment,
        defaultServer: server.server
    };
},

    /** Implements toRelative as an overrideable service operation. */
    toRelative: function (filePath) {
    if (!filePath) {
        return undefined;
    }
    return filePath.replace(NODICS.getNodicsHome(), '.');
},

    /** Implements getActiveOutputModule as an overrideable service operation. */
    getActiveOutputModule: function () {
    let moduleName = NODICS.getServerName && NODICS.getServerName();
    let moduleObject = moduleName ? NODICS.getRawModule(moduleName) : null;
    if (!moduleObject || !moduleObject.path) {
        throw new Error('Active server module is required to generate governance report');
    }
    return {
        name: moduleName,
        path: moduleObject.path
    };
},

    /** Implements collectSchemaSummary as an overrideable service operation. */
    collectSchemaSummary: function (rawSchema) {
    let schemas = [];
    Object.keys(rawSchema || {}).forEach(moduleName => {
        Object.keys(rawSchema[moduleName] || {}).forEach(schemaName => {
            let schema = rawSchema[moduleName][schemaName] || {};
            let trace = schema.xNodics && schema.xNodics.overrideTrace ? schema.xNodics.overrideTrace : [];
            schemas.push({
                moduleName: moduleName,
                schemaName: schemaName,
                properties: Object.keys(schema.definition || {}),
                trace: trace,
                finalSourceModule: trace.length ? trace[trace.length - 1].sourceModule : undefined,
                overridden: trace.length > 1,
                warnings: trace.reduce((warnings, item) => warnings.concat(item.warnings || []), [])
            });
        });
    });
    return schemas;
},

    /** Implements collectRouterSummary as an overrideable service operation. */
    collectRouterSummary: function (rawRouters) {
    let routes = [];
    Object.keys(rawRouters || {}).forEach(moduleName => {
        Object.keys(rawRouters[moduleName] || {}).forEach(groupName => {
            Object.keys(rawRouters[moduleName][groupName] || {}).forEach(routeName => {
                let route = rawRouters[moduleName][groupName][routeName] || {};
                if (!route || routeName === 'xNodics') {
                    return;
                }
                let trace = route.xNodics && route.xNodics.overrideTrace ? route.xNodics.overrideTrace : [];
                routes.push({
                    moduleName: moduleName,
                    groupName: groupName,
                    routeName: routeName,
                    key: route.key,
                    method: route.method,
                    controller: route.controller,
                    operation: route.operation,
                    secured: route.secured,
                    accessGroups: route.accessGroups,
                    trace: trace,
                    finalSourceModule: trace.length ? trace[trace.length - 1].sourceModule : undefined,
                    overridden: trace.length > 1,
                    warnings: trace.reduce((warnings, item) => warnings.concat(item.warnings || []), [])
                });
            });
        });
    });
    return routes;
},

    /** Implements scanDirectory as an overrideable service operation. */
    scanDirectory: function (directory, suffix, callback) {
    if (!fs.existsSync(directory)) {
        return;
    }
    fs.readdirSync(directory).forEach(entry => {
        let filePath = path.join(directory, entry);
        let stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            (this.scanDirectory || exportedService.scanDirectory).call(this, filePath, suffix, callback);
        } else if (stat.isFile() && filePath.endsWith(suffix)) {
            callback(filePath);
        }
    });
},

    /** Implements readJsonIfExists as an overrideable service operation. */
    readJsonIfExists: function (filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
},

    /** Implements countFiles as an overrideable service operation. */
    countFiles: function (directory, suffix) {
    let count = 0;
    (this.scanDirectory || exportedService.scanDirectory).call(this, directory, suffix, () => {
        count += 1;
    });
    return count;
},

    /** Implements normalizeModulePath as an overrideable service operation. */
    normalizeModulePath: function (moduleObject) {
    return path.relative(projectRootDir, moduleObject.path).split(path.sep).join('/');
},

    /** Implements extractReadmeMaturity as an overrideable service operation. */
    extractReadmeMaturity: function (modulePath) {
    let readmePath = path.join(modulePath, 'README.md');
    if (!fs.existsSync(readmePath)) {
        return null;
    }
    let content = fs.readFileSync(readmePath, 'utf8');
    let match = content.match(/\*\*Maturity:\s*([^*]+)\*\*/i);
    return match ? match[1].trim() : null;
},

    /** Implements inferMaturity as an overrideable service operation. */
    inferMaturity: function (moduleObject, evidence) {
    if (evidence.readmeMaturity) {
        return evidence.readmeMaturity;
    }
    if (evidence.sourceFiles > 0 && evidence.testFiles > 0 && evidence.generatedTests > 0) {
        return 'implemented with generated contract evidence';
    }
    if (evidence.sourceFiles > 0 && evidence.testFiles > 0) {
        return 'implemented with focused test evidence';
    }
    if (evidence.sourceFiles > 0) {
        return 'source-present; test evidence incomplete';
    }
    if ((moduleObject.nodics && moduleObject.nodics.runtimeModule) === false) {
        return 'composition or metadata only';
    }
    return 'metadata-only; implementation evidence incomplete';
},

    /** Implements collectDependencyPackages as an overrideable service operation. */
    collectDependencyPackages: function (ownedDependencies, modulePath) {
    return Object.keys(ownedDependencies || {}).filter(packageName => {
        let ownership = ownedDependencies[packageName] || {};
        let ownershipRoots = [].concat(ownership.owners || [], ownership.allowedConsumers || []);
        return ownershipRoots.some(ownerPath => ownerPath === modulePath ||
            ownerPath.startsWith(modulePath + '/') ||
            modulePath.startsWith(ownerPath + '/'));
    }).map(packageName => ({
        packageName: packageName,
        type: ownedDependencies[packageName].type,
        restricted: ownedDependencies[packageName].restricted === true
    }));
},

    /** Implements collectProviderCapabilityMaturitySummary as an overrideable service operation. */
    collectProviderCapabilityMaturitySummary: function (indexedModules, ownedDependencies) {
    return indexedModules.map(moduleObject => {
        let modulePath = (this.normalizeModulePath || exportedService.normalizeModulePath).call(this, moduleObject);
        let packageJson = (this.readJsonIfExists || exportedService.readJsonIfExists).call(this, path.join(moduleObject.path, 'package.json')) || {};
        let nodics = packageJson.nodics || {};
        let dependencyPackages = (this.collectDependencyPackages || exportedService.collectDependencyPackages).call(this, ownedDependencies, modulePath);
        let evidence = {
            readme: fs.existsSync(path.join(moduleObject.path, 'README.md')),
            readmeMaturity: (this.extractReadmeMaturity || exportedService.extractReadmeMaturity).call(this, moduleObject.path),
            sourceFiles: (this.countFiles || exportedService.countFiles).call(this, path.join(moduleObject.path, 'src'), '.js'),
            testFiles: (this.countFiles || exportedService.countFiles).call(this, path.join(moduleObject.path, 'test'), '.test.js'),
            generatedTests: (this.countFiles || exportedService.countFiles).call(this, path.join(moduleObject.path, 'test', 'gen'), '.test.js'),
            generatedContext: fs.existsSync(path.join(moduleObject.path, 'llm', 'generated', 'manifest.json')),
            dependencyPackages: dependencyPackages
        };
        return {
            moduleName: moduleObject.name,
            modulePath: modulePath,
            displayName: nodics.displayName || packageJson.description || moduleObject.name,
            kind: nodics.kind || 'unknown',
            activeRuntimeModule: nodics.runtimeModule !== false,
            runtime: nodics.runtime || {},
            owns: nodics.owns || [],
            providerBacked: dependencyPackages.some(item => String(item.type || '').includes('provider')) ||
                String(moduleObject.name).toLowerCase().includes('provider') ||
                (nodics.owns || []).includes('provider'),
            maturity: (this.inferMaturity || exportedService.inferMaturity).call(this, moduleObject, evidence),
            evidence: evidence
        };
    }).sort((left, right) => left.modulePath.localeCompare(right.modulePath));
},

    /** Implements collectArtifactSummary as an overrideable service operation. */
    collectArtifactSummary: function () {
        const registries = { service: SERVICE, facade: FACADE, controller: CONTROLLER, pipeline: PIPELINE };
        const artifacts = [];
        for (const [layer, registry] of Object.entries(registries)) {
            for (const [name, artifact] of Object.entries(registry || {})) {
                const metadata = artifact && artifact.xNodics;
                const trace = metadata && metadata.overrideTrace;
                if (!Array.isArray(trace) || trace.length === 0) continue;
                artifacts.push({
                    name, layer,
                    contributions: trace.map(item => ({ sourceModule: item.sourceModule, file: item.file,
                        action: item.action, generatedBaseline: item.generatedBaseline === true, members: (item.members || []).slice() })),
                    firstSourceModule: trace[0].sourceModule,
                    finalSourceModule: trace[trace.length - 1].sourceModule,
                    memberOrigins: metadata.memberOrigins || {},
                    overridden: trace.length > 1
                });
            }
        }
        return artifacts.sort((left, right) => (left.layer + ':' + left.name).localeCompare(right.layer + ':' + right.name));
    },

    /** Implements collectGeneratedSummary as an overrideable service operation. */
    collectGeneratedSummary: function () {
    let generatedFiles = [];
    NODICS.getIndexedModules().forEach(moduleObject => {
        ['src/service/gen', 'src/facade/gen', 'src/controller/gen', 'test/gen'].forEach(relativePath => {
            let directory = path.join(moduleObject.path, relativePath);
            (this.scanDirectory || exportedService.scanDirectory).call(this, directory, '.js', filePath => {
                generatedFiles.push({
                    sourceModule: moduleObject.name,
                    file: (this.toRelative || exportedService.toRelative).call(this, filePath)
                });
            });
        });
    });
    return generatedFiles;
},

    /** Implements initialize as an overrideable service operation. */
    initialize: async function (args = process.argv.slice(2), environment = process.env) {
    args = tooling.normalizeArguments(args);
    const options = (this.resolveRuntimeOptions || exportedService.resolveRuntimeOptions).call(this, args, environment);
    const previous = { S: process.env.S, E: process.env.E, NODICS_NODE: process.env.NODICS_NODE };
    process.env.S = options.defaultServer;
    process.env.E = options.defaultEnvironment;
    const node = tooling.readOption(args, '--node', environment.NODICS_NODE || environment.N);
    if (node) process.env.NODICS_NODE = node;
    try {
        await config.prepareBuild(options);
        await config.initUtilities(options);
        await config.loadModules();
    } finally {
        for (const [key, value] of Object.entries(previous)) {
            if (value === undefined) delete process.env[key]; else process.env[key] = value;
        }
    }
},

    /** Implements run as an overrideable service operation. */
    run: async function (args = process.argv.slice(2)) {
    await (this.initialize || exportedService.initialize).call(this, args);
    let rawSchema = SERVICE.DefaultFilesLoaderService.loadSchemaFiles('/src/schemas/schemas.js', null);
    let rawRouters = SERVICE.DefaultFilesLoaderService.loadRouterFiles('/src/router/routers.js');
    let schemas = (this.collectSchemaSummary || exportedService.collectSchemaSummary).call(this, rawSchema);
    let routes = (this.collectRouterSummary || exportedService.collectRouterSummary).call(this, rawRouters);
    let artifacts = (this.collectArtifactSummary || exportedService.collectArtifactSummary).call(this, );
    let generatedFiles = (this.collectGeneratedSummary || exportedService.collectGeneratedSummary).call(this, );
    let rootPackage = (this.readJsonIfExists || exportedService.readJsonIfExists).call(this, path.join(projectRootDir, 'package.json')) || {};
    let ownedDependencies = rootPackage.nodics && rootPackage.nodics.dependencyGovernance ?
        rootPackage.nodics.dependencyGovernance.ownedDependencies || {} : {};
    let providerCapabilityMaturity = (this.collectProviderCapabilityMaturitySummary || exportedService.collectProviderCapabilityMaturitySummary).call(this,
        Array.from(NODICS.getIndexedModules().values()),
        ownedDependencies
    );
    let activeOutputModule = (this.getActiveOutputModule || exportedService.getActiveOutputModule).call(this, );
    let report = {
        generatedAt: new Date().toISOString(),
        environmentName: NODICS.getSelectedEnvironmentName ? NODICS.getSelectedEnvironmentName() : NODICS.getEnvironmentName(),
        serverRootName: NODICS.getServerRootName(),
        serverName: NODICS.getServerName(),
        nodeName: NODICS.getNodeName(),
        activeOutputModule: activeOutputModule.name,
        activeRuntimeTarget: NODICS.getNodeName() || activeOutputModule.name,
        activeModules: NODICS.getActiveModules(),
        indexedModules: Array.from(NODICS.getIndexedModules().values()).map(moduleObject => ({
            name: moduleObject.name,
            index: moduleObject.index,
            parent: moduleObject.parent,
            path: (this.toRelative || exportedService.toRelative).call(this, moduleObject.path)
        })),
        summary: {
            schemas: schemas.length,
            schemaOverrides: schemas.filter(schema => schema.overridden).length,
            schemaWarnings: schemas.reduce((count, schema) => count + schema.warnings.length, 0),
            routes: routes.length,
            routeOverrides: routes.filter(route => route.overridden).length,
            routeWarnings: routes.reduce((count, route) => count + route.warnings.length, 0),
            artifacts: artifacts.length,
            artifactOverrides: artifacts.filter(artifact => artifact.overridden).length,
            generatedFiles: generatedFiles.length,
            providerCapabilityMaturityEntries: providerCapabilityMaturity.length,
            providerBackedCapabilities: providerCapabilityMaturity.filter(entry => entry.providerBacked).length
        },
        schemas: schemas,
        routes: routes,
        artifacts: artifacts,
        generatedFiles: generatedFiles,
        providerCapabilityMaturity: providerCapabilityMaturity
    };

    let outputDirectory = path.join(activeOutputModule.path, 'generated', 'governance');
    fs.mkdirSync(outputDirectory, { recursive: true });
    let reportTargetName = NODICS.getNodeName() || activeOutputModule.name;
    let outputPath = path.join(outputDirectory, reportTargetName + '.governance-report.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log('Generated governance report: ' + (this.toRelative || exportedService.toRelative).call(this, outputPath));
    console.log('Schemas: ' + report.summary.schemas + ', Routes: ' + report.summary.routes + ', Artifacts: ' + report.summary.artifacts);
    console.log('Overrides - schema: ' + report.summary.schemaOverrides + ', route: ' + report.summary.routeOverrides + ', artifact: ' + report.summary.artifactOverrides);
    console.log('Provider/capability maturity entries: ' + report.summary.providerCapabilityMaturityEntries +
        ', provider-backed: ' + report.summary.providerBackedCapabilities);
},

    /** Implements runCli as an overrideable service operation. */
    runCli: function (args = process.argv.slice(2)) {
    return (this.run || exportedService.run).call(this, args).catch(error => {
        console.error(error);
        process.exit(1);
    });
}
};

if (require.main === module) {
    exportedService.runCli();
}
