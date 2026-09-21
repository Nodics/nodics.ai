/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nTooling/service/project/defaultProjectRuntimeStartService
 * @description Starts a project Nodics runtime server from discoverable server metadata while keeping startup mechanics in framework tooling.
 * @layer tooling
 * @owner nTooling
 * @override Projects customize runtime server folders and package metadata; framework tooling owns package resolution and start execution.
 */

const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    /**
     * Rejects retired project descriptors.
     * @param {string} projectRoot Project root.
     * @returns {Object} Empty descriptor for older internal callers.
     */
    readManifest: function (projectRoot) {
        const descriptorPath = path.join(projectRoot, 'nodics.project.json');
        if (fs.existsSync(descriptorPath)) {
            throw new Error('Unsupported nodics.project.json; project runtime startup is derived from package.json and envs/* server package metadata.');
        }
        return {};
    },

    /**
     * Reads the project package metadata.
     * @param {string} projectRoot Project root.
     * @returns {Object} Parsed package metadata.
     */
    readProjectPackage: function (projectRoot) {
        const packagePath = path.join(projectRoot, 'package.json');
        if (!fs.existsSync(packagePath)) {
            throw new Error('Missing package.json in project root: ' + projectRoot);
        }
        return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    },

    /**
     * Resolves canonical project identity from package.json.name.
     * @param {string} projectRoot Project root.
     * @returns {string} Canonical project code.
     */
    resolveProjectCode: function (projectRoot) {
        const projectCode = this.readProjectPackage(projectRoot).name;
        if (!projectCode || !/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(projectCode)) {
            throw new Error('package.json requires a stable Nodics project name');
        }
        return projectCode;
    },

    /**
     * Builds the conventional local environment name for a project.
     * @param {string} projectRoot Project root.
     * @returns {string} Local environment name.
     */
    conventionalLocalEnvironmentName: function (projectRoot) {
        if (typeof projectRoot !== 'string') {
            projectRoot = process.cwd();
        }
        const projectSegment = String(this.resolveProjectCode(projectRoot)).split('.').filter(Boolean).pop() || 'project';
        return projectSegment + 'Local';
    },

    /**
     * Resolves the framework checkout used by a project runtime.
     * @param {string} projectRoot Project root.
     * @param {Object} environment Environment values.
     * @returns {string} Framework root.
     */
    resolveFrameworkRoot: function (projectRoot, environment) {
        const configuredRoot = environment.NODICS_FRAMEWORK_ROOT;
        const frameworkRoot = configuredRoot
            ? path.resolve(projectRoot, configuredRoot)
            : path.resolve(__dirname, '../../../../../../');
        if (!fs.existsSync(path.join(frameworkRoot, 'package.json')) ||
                !fs.existsSync(path.join(frameworkRoot, 'nodics.foundation', 'package.json'))) {
            throw new Error(
                'Unable to resolve Nodics framework root for project runtime. ' +
                'Set NODICS_FRAMEWORK_ROOT for this process or place the project beside the nodics.ai checkout.'
            );
        }
        return frameworkRoot;
    },

    /**
     * Resolves a framework package root directly from the framework checkout.
     * @param {string} frameworkRoot Framework root.
     * @param {string} packageName Package name.
     * @returns {string} Package root.
     */
    packageRoot: function (frameworkRoot, packageName) {
        const packageRoot = path.join(frameworkRoot, packageName);
        if (!fs.existsSync(path.join(packageRoot, 'package.json'))) {
            throw new Error('Unable to resolve framework package `' + packageName + '` from ' + frameworkRoot);
        }
        return packageRoot;
    },

    /**
     * Reads one server package metadata file.
     * @param {string} packagePath Server package path.
     * @returns {Object} Package metadata.
     */
    readPackage: function (packagePath) {
        return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    },

    /**
     * Builds a useful retirement message from server package metadata.
     * @param {string} serverCode Runtime server code.
     * @param {Object} metadata Server package metadata.
     * @returns {string} Retirement message.
     */
    retiredMessage: function (serverCode, metadata) {
        const nodics = metadata.nodics || {};
        const replacements = [].concat(nodics.replacementServers || []);
        return [
            'Project runtime server is retired: ' + serverCode + '.',
            replacements.length ? 'Use ' + replacements.join(' or ') + ' instead.' : ''
        ].filter(Boolean).join(' ');
    },

    /**
     * Discovers one runtime server from the selected environment folder.
     * @param {string} projectRoot Project root.
     * @param {string} environmentName Environment name.
     * @param {string} serverCode Runtime server code.
     * @returns {Object} Server declaration.
     */
    discoverServer: function (projectRoot, environmentName, serverCode) {
        const environmentRoot = path.join(projectRoot, 'envs', environmentName);
        const candidates = [
            serverCode,
            serverCode.endsWith('Server') ? serverCode : serverCode + 'Server'
        ].filter((candidate, index, values) => values.indexOf(candidate) === index);
        for (const candidate of candidates) {
            const packagePath = path.join(environmentRoot, candidate, 'package.json');
            if (!fs.existsSync(packagePath)) continue;
            const metadata = this.readPackage(packagePath);
            const nodics = metadata.nodics || {};
            if (nodics.retired) throw new Error(this.retiredMessage(serverCode, metadata));
            if (nodics.kind !== 'server') {
                throw new Error('Discovered project runtime is not a server: ' + candidate);
            }
            return {
                environment: environmentName,
                server: candidate,
                moduleRoots: ['nodics.foundation'].concat(nodics.runtimeModuleRoots || nodics.extends || [], ['{project}'])
            };
        }
        throw new Error('Unknown project runtime server `' + serverCode + '` in envs/' + environmentName);
    },

    /**
     * Resolves the selected environment before server metadata is loaded.
     * @param {string} projectRoot Project root.
     * @param {Object} environment Environment values.
     * @returns {string} Environment name.
     */
    resolveEnvironmentName: function (projectRoot, environment) {
        if (typeof projectRoot !== 'string') {
            environment = projectRoot || {};
            projectRoot = process.cwd();
        }
        return environment.ENV ||
            this.conventionalLocalEnvironmentName(projectRoot);
    },

    /**
     * Resolves effective module roots for one project runtime server.
     * @param {string} projectRoot Project root.
     * @param {string} frameworkRoot Framework root.
     * @param {Object} server Project server declaration.
     * @returns {string[]} Runtime module roots.
     */
    resolveModuleRoots: function (projectRoot, frameworkRoot, server) {
        const declaredRoots = [].concat(server.moduleRoots || []);
        const normalizedRoots = declaredRoots.includes('nodics.foundation')
            ? declaredRoots
            : ['nodics.foundation'].concat(declaredRoots);
        const moduleRoots = normalizedRoots.map(moduleName => {
            if (moduleName === '{project}') return projectRoot;
            return this.packageRoot(frameworkRoot, moduleName);
        });
        if (!moduleRoots.includes(projectRoot)) moduleRoots.push(projectRoot);
        return moduleRoots;
    },

    /**
     * Resolves a server declaration and protects retired runtime aliases.
     * @param {string} projectRoot Project root.
     * @param {string} serverCode Runtime server code.
     * @param {Object} environment Environment values.
     * @returns {Object} Runtime server declaration.
     */
    resolveServer: function (projectRoot, serverCode, environment, legacyEnvironment) {
        if (serverCode && typeof serverCode === 'object' && typeof environment === 'string') {
            serverCode = environment;
            environment = legacyEnvironment;
        }
        return this.discoverServer(projectRoot, this.resolveEnvironmentName(projectRoot, environment), serverCode);
    },

    /**
     * Starts a project runtime server.
     * @param {Object} options Start options.
     * @param {string} options.projectRoot Project root.
     * @param {string} options.serverCode Runtime server code.
     * @param {Object} options.environment Environment values.
     * @returns {void}
     */
    start: async function (options) {
        const projectRoot = path.resolve(options.projectRoot || process.cwd());
        const environment = options.environment || process.env;
        this.readManifest(projectRoot);
        const server = this.resolveServer(projectRoot, options.serverCode, environment);
        const frameworkRoot = this.resolveFrameworkRoot(projectRoot, environment);
        const foundationRoot = this.packageRoot(frameworkRoot, 'nodics.foundation');
        const foundation = require(foundationRoot);
        const moduleRoots = this.resolveModuleRoots(projectRoot, frameworkRoot, server);

        const previous = { S: process.env.S, E: process.env.E, NODICS_NODE: process.env.NODICS_NODE };
        process.env.S = server.server;
        process.env.E = server.environment || this.resolveEnvironmentName(projectRoot, environment);
        if (environment.NODICS_NODE) process.env.NODICS_NODE = environment.NODICS_NODE;
        try {
            return await foundation.start(Object.freeze({
                NODICS_HOME: foundationRoot, CUSTOM_HOME: projectRoot,
                MODULE_ROOTS: Object.freeze(moduleRoots),
                defaultEnvironment: process.env.E, defaultServer: server.server
            }));
        } finally {
            for (const key of Object.keys(previous)) {
                if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];
            }
        }
    },

    /**
     * Executes a selected project server clean/build through startup's topology authority.
     * @param {Object} options Project, server and lifecycle coordinates.
     * @returns {Promise<boolean>} Lifecycle result.
     */
    lifecycle: async function (options) {
        if (!['cleanAll', 'buildAll'].includes(options.method)) throw new Error('Unsupported project lifecycle method: ' + options.method);
        const projectRoot = path.resolve(options.projectRoot || process.cwd());
        const environment = options.environment || process.env;
        this.readManifest(projectRoot);
        const serverCode = options.serverCode || environment.S || environment.SERVER;
        if (!serverCode) throw new Error('Select a server with --server=<code> or SERVER before project clean/build');
        const server = this.resolveServer(projectRoot, serverCode, environment);
        const frameworkRoot = this.resolveFrameworkRoot(projectRoot, environment);
        const foundationRoot = this.packageRoot(frameworkRoot, 'nodics.foundation');
        // Lifecycle commands run in their own process. Match nConfig's environment
        // selection to the topology already resolved by this command, then restore it.
        const previous = { S: process.env.S, E: process.env.E, NODICS_NODE: process.env.NODICS_NODE };
        process.env.S = server.server;
        process.env.E = server.environment || environment.E || environment.ENV;
        if (environment.NODICS_NODE) process.env.NODICS_NODE = environment.NODICS_NODE;
        try {
            return await require(foundationRoot)[options.method]({
                NODICS_HOME: foundationRoot, CUSTOM_HOME: projectRoot,
                MODULE_ROOTS: this.resolveModuleRoots(projectRoot, frameworkRoot, server),
                defaultEnvironment: server.environment || environment.E || environment.ENV,
                defaultServer: server.server
            });
        } finally {
            for (const key of Object.keys(previous)) {
                if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];
            }
        }
    },

    /**
     * CLI bridge used by nTooling's node-script command handler.
     * @param {string[]} args Command arguments.
     * @param {Object} environment Environment values.
     * @returns {void}
     */
    runCli: function (args = process.argv.slice(2), environment = process.env) {
        const selected = args.find(value => value.startsWith('--server='));
        const environmentArg = args.find(value => value.startsWith('--environment='));
        const nodeArg = args.find(value => value.startsWith('--node='));
        const effectiveEnvironment = Object.assign({}, environment,
            environmentArg ? { E: environmentArg.slice('--environment='.length), ENV: environmentArg.slice('--environment='.length) } : {},
            nodeArg ? { NODICS_NODE: nodeArg.slice('--node='.length) } : {});
        const lifecycle = args.find(value => value.startsWith('--lifecycle='));
        const serverCode = selected ? selected.slice('--server='.length) : args.find(value => !value.startsWith('-')) || environment.S || environment.SERVER;
        if (lifecycle) return this.lifecycle({
            projectRoot: environment.NODICS_PROJECT_ROOT || process.cwd(),
            method: lifecycle.slice('--lifecycle='.length), serverCode, environment: effectiveEnvironment
        });
        if (!serverCode) throw new Error('Select a server with --server=<code> or SERVER');
        return this.start({ projectRoot: environment.NODICS_PROJECT_ROOT || process.cwd(), serverCode, environment: effectiveEnvironment });
    }
};

if (require.main === module) {
    try {
        Promise.resolve(module.exports.runCli()).catch(error => { console.error(error); process.exitCode = 1; });
    } catch (error) {
        console.error(error && error.stack ? error.stack : error);
        process.exitCode = 1;
    }
}
