/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/command/defaultProjectCommandService
 * @description Executes and validates project-declared commands through `nodics.project.json` so generated projects keep stable facts while framework tooling evolves.
 * @layer tooling
 * @owner nTooling
 * @override Projects customize the manifest facts; framework command execution and validation remain owned by nTooling.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

module.exports = {
    /**
     * Executes a project manifest operation.
     * @param {Object} context Tooling command context.
     * @returns {Promise<boolean>} Whether the operation completed.
     */
    run: async function (context) {
        const operation = context.command.operation || 'validate';
        const manifest = this.readManifest(context.home);
        if (operation === 'validate') {
            this.validateManifest(context.home, manifest);
            console.log(JSON.stringify({
                projectCode: manifest.projectCode,
                contractVersion: manifest.contractVersion,
                commandCount: Object.keys((manifest.tooling || {}).commands || {}).length,
                state: 'PASSED'
            }, null, 2));
            return true;
        }
        if (operation === 'run') {
            this.validateManifest(context.home, manifest);
            return this.runProjectCommand(context.home, manifest, context.args[0], context.args.slice(1));
        }
        throw new Error('Unsupported project command operation: ' + operation);
    },

    /**
     * Reads the project contract manifest.
     * @param {string} projectRoot Project root.
     * @returns {Object} Parsed manifest.
     */
    readManifest: function (projectRoot) {
        const manifestPath = path.join(projectRoot, 'nodics.project.json');
        if (!fs.existsSync(manifestPath)) {
            throw new Error('Missing nodics.project.json in project root: ' + projectRoot);
        }
        return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    },

    /**
     * Validates the project contract manifest and script ownership policy.
     * @param {string} projectRoot Project root.
     * @param {Object} manifest Project manifest.
     * @returns {void}
     */
    validateManifest: function (projectRoot, manifest) {
        if (![0, 1].includes(manifest.contractVersion)) {
            throw new Error('Unsupported nodics.project.json contractVersion: ' + manifest.contractVersion);
        }
        if (!manifest.projectCode || !/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(manifest.projectCode)) {
            throw new Error('nodics.project.json requires a stable projectCode');
        }
        const commands = ((manifest.tooling || {}).commands) || {};
        Object.entries(commands).forEach(([name, command]) => this.validateCommand(projectRoot, name, command));
        this.validateScriptOwnership(projectRoot, manifest, commands);
        this.validateProjectDirectoryBoundaries(projectRoot, manifest);
    },

    /**
     * Validates one command declaration.
     * @param {string} projectRoot Project root.
     * @param {string} name Command name.
     * @param {Object} command Command declaration.
     * @returns {void}
     */
    validateCommand: function (projectRoot, name, command) {
        if (!command || !['projectScript', 'npmScript', 'frameworkCommand'].includes(command.type)) {
            throw new Error('Invalid project command type for `' + name + '`');
        }
        if (command.type === 'projectScript') {
            if (!command.script) {
                throw new Error('Project script command requires script path: ' + name);
            }
            const scriptPath = path.resolve(projectRoot, command.script);
            const relative = path.relative(projectRoot, scriptPath);
            if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(scriptPath)) {
                throw new Error('Project script command points outside project or is missing: ' + name);
            }
        }
        if (command.type === 'npmScript' && !command.script) {
            throw new Error('npmScript command requires package script name: ' + name);
        }
        if (command.type === 'frameworkCommand' && !command.command) {
            throw new Error('frameworkCommand requires command name: ' + name);
        }
    },

    /**
     * Ensures project scripts are explicitly declared and not pretending to own framework behavior.
     * @param {string} projectRoot Project root.
     * @param {Object} manifest Project manifest.
     * @param {Object} commands Project command map.
     * @returns {void}
     */
    validateScriptOwnership: function (projectRoot, manifest, commands) {
        const declaredScripts = new Set(Object.values(commands)
            .filter(command => command.type === 'projectScript')
            .map(command => path.normalize(command.script)));
        const ownership = ((manifest.tooling || {}).scriptOwnership) || {};
        const projectOwnedScripts = new Set([].concat(ownership.projectOwned || []).map(script => path.normalize(script)));
        for (const script of declaredScripts) {
            if (!projectOwnedScripts.has(script)) {
                throw new Error('Project script command is not listed under tooling.scriptOwnership.projectOwned: ' + script);
            }
        }
        const forbidden = [].concat(ownership.forbiddenProjectOwnedPatterns || []);
        for (const script of projectOwnedScripts) {
            if (!fs.existsSync(path.join(projectRoot, script))) {
                throw new Error('Project-owned script is missing: ' + script);
            }
            if (forbidden.some(pattern => new RegExp(pattern).test(script))) {
                throw new Error('Forbidden framework-owned script pattern declared as project-owned: ' + script);
            }
        }
    },

    /**
     * Ensures generated/reference projects do not grow framework-owned local
     * implementation directories that make framework upgrades harder.
     * @param {string} projectRoot Project root.
     * @param {Object} manifest Project manifest.
     * @returns {void}
     */
    validateProjectDirectoryBoundaries: function (projectRoot, manifest) {
        const ownership = ((manifest.tooling || {}).scriptOwnership) || {};
        const forbiddenDirectories = [].concat(
            ownership.forbiddenProjectDirectories || []
        );
        for (const directory of forbiddenDirectories) {
            const directoryPath = path.resolve(projectRoot, directory);
            const relative = path.relative(projectRoot, directoryPath);
            if (relative.startsWith('..') || path.isAbsolute(relative)) {
                throw new Error('Forbidden project directory must stay inside project root: ' + directory);
            }
            if (fs.existsSync(directoryPath)) {
                throw new Error(
                    'Forbidden project-owned implementation directory exists: ' + directory +
                    '. Reusable tooling, startup, and acceptance engines must remain in nodics.ai.'
                );
            }
        }
    },

    /**
     * Runs a declared project command.
     * @param {string} projectRoot Project root.
     * @param {Object} manifest Project manifest.
     * @param {string} name Command name.
     * @param {string[]} args Additional command arguments.
     * @returns {boolean} Whether command passed.
     */
    runProjectCommand: function (projectRoot, manifest, name, args) {
        const commands = ((manifest.tooling || {}).commands) || {};
        const command = commands[name];
        if (!command) {
            throw new Error('Unknown project command in nodics.project.json: ' + name);
        }
        let execution;
        if (command.type === 'projectScript') {
            execution = {
                executable: process.execPath,
                args: [path.resolve(projectRoot, command.script)].concat(command.args || [], args || [])
            };
        } else if (command.type === 'npmScript') {
            execution = {
                executable: 'npm',
                args: ['run', command.script].concat(args || [])
            };
        } else {
            const commandHome = command.home === 'project' ? projectRoot : this.resolveFrameworkRoot();
            execution = {
                executable: process.execPath,
                args: [path.join(this.resolveFrameworkRoot(), 'nodics.foundation', 'modules', 'nTooling', 'bin', 'nodics-tool.js'), command.command, '--home=' + commandHome].concat(command.args || [], args || [])
            };
        }
        const result = spawnSync(execution.executable, execution.args, {
            cwd: projectRoot,
            env: Object.assign({}, process.env, {
                NODICS_PROJECT_ROOT: projectRoot,
                NODICS_PROJECT_CODE: manifest.projectCode
            }),
            stdio: 'inherit'
        });
        if (result.error) throw result.error;
        if (result.status !== 0) {
            throw new Error('Project command failed with exit code ' + result.status + ': ' + name);
        }
        return true;
    },

    /**
     * Resolves the framework root for frameworkCommand delegation.
     * @returns {string} Framework root.
     */
    resolveFrameworkRoot: function () {
        return path.resolve(__dirname, '../../../../../..');
    }
};
