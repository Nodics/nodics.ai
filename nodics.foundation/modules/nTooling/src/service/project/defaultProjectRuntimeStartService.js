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
 * @description Starts a project-declared Nodics runtime server from manifest facts while keeping startup mechanics in framework tooling.
 * @layer tooling
 * @owner nTooling
 * @override Projects customize runtime server facts in nodics.project.json; framework tooling owns package resolution and start execution.
 */

const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    /**
     * Reads the project runtime contract.
     * @param {string} projectRoot Project root.
     * @returns {Object} Project manifest.
     */
    readManifest: function (projectRoot) {
        const manifestPath = path.join(projectRoot, 'nodics.project.json');
        if (!fs.existsSync(manifestPath)) {
            throw new Error('Missing nodics.project.json in project root: ' + projectRoot);
        }
        return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
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
                'Set NODICS_FRAMEWORK_ROOT in the project .env to the nodics.ai checkout.'
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
     * Resolves effective module roots for one project runtime server.
     * @param {string} projectRoot Project root.
     * @param {string} frameworkRoot Framework root.
     * @param {Object} server Project server declaration.
     * @returns {string[]} Runtime module roots.
     */
    resolveModuleRoots: function (projectRoot, frameworkRoot, server) {
        const moduleRoots = [].concat(server.moduleRoots || []).map(moduleName => {
            if (moduleName === '{project}') return projectRoot;
            return this.packageRoot(frameworkRoot, moduleName);
        });
        if (!moduleRoots.includes(projectRoot)) moduleRoots.push(projectRoot);
        return moduleRoots;
    },

    /**
     * Resolves a server declaration and protects retired runtime aliases.
     * @param {Object} manifest Project manifest.
     * @param {string} serverCode Runtime server code.
     * @returns {Object} Runtime server declaration.
     */
    resolveServer: function (manifest, serverCode) {
        const servers = manifest.runtime && manifest.runtime.servers
            ? manifest.runtime.servers
            : {};
        const server = servers[serverCode];
        if (!server) {
            throw new Error('Unknown project runtime server in nodics.project.json: ' + serverCode);
        }
        if (server.retired) {
            throw new Error([].concat(
                server.retiredMessage || ['Project runtime server is retired: ' + serverCode]
            ).join(' '));
        }
        return server;
    },

    /**
     * Starts a project runtime server.
     * @param {Object} options Start options.
     * @param {string} options.projectRoot Project root.
     * @param {string} options.serverCode Runtime server code.
     * @param {Object} options.environment Environment values.
     * @returns {void}
     */
    start: function (options) {
        const projectRoot = path.resolve(options.projectRoot || process.cwd());
        const environment = options.environment || process.env;
        const manifest = this.readManifest(projectRoot);
        const server = this.resolveServer(manifest, options.serverCode);
        const frameworkRoot = this.resolveFrameworkRoot(projectRoot, environment);
        const foundationRoot = this.packageRoot(frameworkRoot, 'nodics.foundation');
        const foundation = require(foundationRoot);
        const moduleRoots = this.resolveModuleRoots(projectRoot, frameworkRoot, server);

        foundation.start(Object.freeze({
            NODICS_HOME: foundationRoot,
            CUSTOM_HOME: projectRoot,
            MODULE_ROOTS: Object.freeze(moduleRoots),
            defaultEnvironment: environment.ENV ||
                server.environment ||
                manifest.topology?.environment ||
                'local',
            defaultServer: environment.SERVER || server.server
        }));
    },

    /**
     * CLI bridge used by nTooling's node-script command handler.
     * @param {string[]} args Command arguments.
     * @param {Object} environment Environment values.
     * @returns {void}
     */
    runCli: function (args = process.argv.slice(2), environment = process.env) {
        const serverCode = args[0];
        if (!serverCode) {
            throw new Error('Usage: project:runtime-start <serverCode>');
        }
        this.start({
            projectRoot: environment.NODICS_PROJECT_ROOT || process.cwd(),
            serverCode,
            environment
        });
    }
};

if (require.main === module) {
    try {
        module.exports.runCli();
    } catch (error) {
        console.error(error && error.stack ? error.stack : error);
        process.exitCode = 1;
    }
}
