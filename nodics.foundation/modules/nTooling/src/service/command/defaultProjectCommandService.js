/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/command/defaultProjectCommandService
 * @description Executes framework-owned project command aliases with project manifest overrides so generated projects stay light while framework tooling evolves.
 * @layer tooling
 * @owner nTooling
 * @override Projects customize only non-standard command aliases; framework command execution and validation remain owned by nTooling.
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
            const projectCode = this.resolveProjectCode(context.home, manifest);
            console.log(JSON.stringify({
                projectCode: projectCode,
                commandCount: Object.keys(this.resolveCommands(manifest)).length,
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
     * Reads optional project command overrides.
     * @param {string} projectRoot Project root.
     * @returns {Object} Parsed manifest.
     */
    readManifest: function (projectRoot) {
        const manifestPath = path.join(projectRoot, 'nodics.project.json');
        if (!fs.existsSync(manifestPath)) return {};
        return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    },

    /**
     * Reads the project package metadata that owns the canonical project identity.
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
     * Resolves the canonical project code from package.json.name.
     * @param {string} projectRoot Project root.
     * @param {Object} manifest Project manifest.
     * @returns {string} Canonical project code.
     */
    resolveProjectCode: function (projectRoot, manifest) {
        const packageJson = this.readProjectPackage(projectRoot);
        const projectCode = packageJson.name;
        if (!projectCode || !/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(projectCode)) {
            throw new Error('package.json requires a stable Nodics project name');
        }
        if (Object.prototype.hasOwnProperty.call(manifest, 'contractVersion')) {
            throw new Error('nodics.project.json must not declare contractVersion');
        }
        if (Object.prototype.hasOwnProperty.call(manifest, 'projectCode')) {
            throw new Error('nodics.project.json must not declare projectCode; use package.json.name');
        }
        return projectCode;
    },

    /**
     * Validates the project contract manifest and script ownership policy.
     * @param {string} projectRoot Project root.
     * @param {Object} manifest Project manifest.
     * @returns {void}
     */
    validateManifest: function (projectRoot, manifest) {
        this.validateDescriptorProperties(projectRoot, manifest);
        this.resolveProjectCode(projectRoot, manifest);
        const commands = this.resolveCommands(manifest);
        Object.entries(commands).forEach(([name, command]) => this.validateCommand(projectRoot, name, command));
        this.validateScriptOwnership(projectRoot, manifest, commands);
        this.validateProjectDirectoryBoundaries(projectRoot, manifest);
    },

    /**
     * Rejects redundant or misplaced project descriptor properties.
     * @param {string} projectRoot Project root.
     * @param {Object} manifest Project manifest.
     * @returns {void}
     */
    validateDescriptorProperties: function (projectRoot, manifest) {
        const descriptorExists = fs.existsSync(path.join(projectRoot, 'nodics.project.json'));
        const keys = Object.keys(manifest || {});
        if (!descriptorExists && keys.length === 0) return;
        if (descriptorExists && keys.length === 0) {
            throw new Error('Unnecessary nodics.project.json; remove the file unless project-owned tooling or acceptance overrides are required');
        }
        if (Object.prototype.hasOwnProperty.call(manifest, 'contractVersion')) {
            throw new Error('nodics.project.json must not declare contractVersion');
        }
        if (Object.prototype.hasOwnProperty.call(manifest, 'projectCode')) {
            throw new Error('nodics.project.json must not declare projectCode; use package.json.name');
        }
        const allowedTopLevel = ['acceptance', 'tooling'];
        keys.forEach(key => {
            if (!allowedTopLevel.includes(key)) {
                throw new Error('Unsupported nodics.project.json property `' + key + '`. Allowed properties: acceptance, tooling');
            }
        });
        this.validateDescriptorSection('tooling', manifest.tooling, ['commands', 'scriptOwnership']);
        this.validateDescriptorSection('acceptance', manifest.acceptance, [
            'capabilityRegistry',
            'functionalJourney',
            'guidedInitialization',
            'localBootstrap'
        ]);
    },

    /**
     * Validates that a descriptor section is a non-empty object with known keys.
     * @param {string} sectionName Descriptor section name.
     * @param {Object} section Section value.
     * @param {string[]} allowedKeys Allowed nested keys.
     * @returns {void}
     */
    validateDescriptorSection: function (sectionName, section, allowedKeys) {
        if (section === undefined) return;
        if (!section || typeof section !== 'object' || Array.isArray(section)) {
            throw new Error('nodics.project.json `' + sectionName + '` must be an object');
        }
        const keys = Object.keys(section);
        if (keys.length === 0) {
            throw new Error('Unnecessary nodics.project.json `' + sectionName + '` section; remove empty override sections');
        }
        keys.forEach(key => {
            if (!allowedKeys.includes(key)) {
                throw new Error('Unsupported nodics.project.json `' + sectionName + '.' + key + '` property');
            }
        });
    },

    /**
     * Returns framework-owned project command aliases. Project manifests only
     * need to declare custom additions or intentional overrides.
     * @returns {Object} Command alias map.
     */
    defaultCommands: function () {
        const runtimeStart = server => ({ type: 'frameworkCommand', command: 'project:runtime-start', home: 'project', args: [server] });
        const framework = (command, args = []) => ({ type: 'frameworkCommand', command, home: 'project', ...(args.length ? { args } : {}) });
        return {
            'start:platform': runtimeStart('platform'),
            'start:commerce': runtimeStart('commerce'),
            'start:commerce:staged': runtimeStart('commerceStaged'),
            'start:engagement': runtimeStart('engagement'),
            'start:loyalty': runtimeStart('loyalty'),
            'start:process': runtimeStart('process'),
            'start:wcms': runtimeStart('wcms'),
            'start:wcms:staged': runtimeStart('wcmsStaged'),
            'start:wcms:online': runtimeStart('wcmsOnline'),
            'docs:generate': framework('project:documentation-content'),
            'docs:check': framework('project:documentation-content', ['--check']),
            'domains:manifests': framework('project:data-manifests'),
            'topology:start': framework('project:topology', ['start']),
            'topology:start:all': framework('project:topology', ['start', '--include-frontends']),
            'topology:preflight': framework('project:topology', ['preflight', '--include-frontends']),
            'topology:status': framework('project:topology', ['status', '--include-frontends']),
            'topology:stop': framework('project:topology', ['stop']),
            'docker-local:preflight': framework('project:container', ['dockerLocal', 'preflight']),
            'docker-local:build': framework('project:container', ['dockerLocal', 'build']),
            'docker-local:start': framework('project:container', ['dockerLocal', 'start']),
            'docker-local:status': framework('project:container', ['dockerLocal', 'status']),
            'docker-local:logs': framework('project:container', ['dockerLocal', 'logs']),
            'docker-local:stop': framework('project:container', ['dockerLocal', 'stop']),
            'docker-local:reset': framework('project:container', ['dockerLocal', 'reset', '--confirm-destroy-docker-local-data']),
            'docker-local:acceptance': framework('project:container-qualification', ['dockerLocal', 'acceptance']),
            'docker-local:qualify': framework('project:container-qualification', ['dockerLocal', 'qualification']),
            'docker-local:backup': framework('project:container-resilience', ['dockerLocal', 'backup']),
            'docker-local:verify': framework('project:container-resilience', ['dockerLocal', 'verify']),
            'docker-local:restore': framework('project:container-resilience', ['dockerLocal', 'restore']),
            'docker-local:resilience': framework('project:container-qualification', ['dockerLocal', 'resilience-qualification']),
            'docker-local:soak': framework('project:container-qualification', ['dockerLocal', 'soak']),
            'acceptance:local': framework('project:local-bootstrap-acceptance'),
            'acceptance:local:fresh': framework('project:local-bootstrap-acceptance', ['--drop-local-db']),
            'acceptance:functional': framework('project:functional-journey-acceptance'),
            'acceptance:agora-commerce': framework('project:agora-commerce-acceptance'),
            'acceptance:loyalty-reward-checkout': framework('project:loyalty-reward-checkout-acceptance'),
            'acceptance:agora-commerce:docker': framework('project:container-qualification', ['dockerLocal', 'commerce-acceptance']),
            'acceptance:agora-commerce-data': framework('project:agora-commerce-data-acceptance'),
            'acceptance:agora-commerce-publication': framework('project:agora-commerce-publication-acceptance'),
            'qualification:agora-commerce:live': framework('project:agora-commerce-live-qualification'),
            'acceptance:agora-cms-media-seed': framework('project:agora-cms-media-seed'),
            'acceptance:nexus-cms-media-seed': framework('project:nexus-cms-media-seed'),
            'acceptance:editorial-live': framework('project:editorial-live-journey-acceptance'),
            'acceptance:capability-registry': framework('project:capability-registry-acceptance'),
            'acceptance:guided-initialization': framework('project:guided-initialization-acceptance'),
            'acceptance:documentation:fresh-browser': framework('project:container-qualification', ['dockerLocal', 'acceptance', '--expect-documentation-not-installed']),
            'qualification:deployment': framework('project:deployment-qualification'),
            'qualification:deployment:local': framework('project:deployment-qualification', ['--execute-local']),
            'qualification:security-boundary': { type: 'frameworkCommand', command: 'qualification:security-boundary' },
            'qualification:publishing-capacity': { type: 'frameworkCommand', command: 'qualification:publishing-capacity' },
            'qualification:publishing-soak': { type: 'frameworkCommand', command: 'qualification:publishing-soak' },
            'qualification:publishing-interruption-contracts': { type: 'frameworkCommand', command: 'qualification:publishing-interruption-contracts' }
        };
    },

    /**
     * Resolves effective command aliases from framework defaults plus project
     * overrides.
     * @param {Object} manifest Project manifest.
     * @returns {Object} Effective command alias map.
     */
    resolveCommands: function (manifest) {
        return Object.assign({}, this.defaultCommands(), ((manifest.tooling || {}).commands) || {});
    },

    /**
     * Resolves script ownership defaults used by project command validation.
     * @param {Object} manifest Project manifest.
     * @returns {Object} Script ownership policy.
     */
    resolveScriptOwnership: function (manifest) {
        const local = ((manifest.tooling || {}).scriptOwnership) || {};
        return {
            projectOwned: [].concat(local.projectOwned || []),
            forbiddenProjectOwnedPatterns: [].concat(local.forbiddenProjectOwnedPatterns || [
                'local-security-boundary-qualification',
                'publishing-capacity-baseline',
                'local-sustained-publishing-qualification',
                'docker-local-publishing-interruption-contracts'
            ]),
            forbiddenProjectDirectories: [].concat(local.forbiddenProjectDirectories || ['src'])
        };
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
        const ownership = this.resolveScriptOwnership(manifest);
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
        const ownership = this.resolveScriptOwnership(manifest);
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
        const projectCode = this.resolveProjectCode(projectRoot, manifest);
        const commands = this.resolveCommands(manifest);
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
                NODICS_PROJECT_CODE: projectCode
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
