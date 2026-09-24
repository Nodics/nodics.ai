/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/command/defaultProjectCommandService
 * @description Executes framework-owned project command aliases discovered from project package, environment server and acceptance-script structure.
 * @layer tooling
 * @owner nTooling
 * @override Projects customize behavior through module structure and layered configuration; framework command execution and validation remain owned by nTooling.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const localRuntimeCredentials = require('../project/defaultProjectLocalRuntimeCredentialService');

module.exports = {
    /**
     * Executes a project command operation.
     * @param {Object} context Tooling command context.
     * @returns {Promise<boolean>} Whether the operation completed.
     */
    run: async function (context) {
        const operation = context.command.operation || 'validate';
        this.assertNoProjectDescriptor(context.home);
        if (operation === 'validate') {
            this.validateProject(context.home);
            const projectCode = this.resolveProjectCode(context.home);
            console.log(JSON.stringify({
                projectCode: projectCode,
                commandCount: Object.keys(this.resolveCommands(context.home)).length,
                state: 'PASSED'
            }, null, 2));
            return true;
        }
        if (operation === 'run') {
            this.validateProject(context.home);
            return this.runProjectCommand(context.home, context.args[0], context.args.slice(1));
        }
        throw new Error('Unsupported project command operation: ' + operation);
    },

    /**
     * Rejects retired project descriptors.
     * @param {string} projectRoot Project root.
     * @returns {Object} Empty descriptor for older internal callers.
     */
    readManifest: function (projectRoot) {
        this.assertNoProjectDescriptor(projectRoot);
        return {};
    },

    /**
     * Rejects root-level project descriptors so structure remains canonical.
     * @param {string} projectRoot Project root.
     * @returns {void}
     */
    assertNoProjectDescriptor: function (projectRoot) {
        const descriptorPath = path.join(projectRoot, 'nodics.project.json');
        if (fs.existsSync(descriptorPath)) {
            throw new Error('Unsupported nodics.project.json; project commands must be derived from package.json, envs/* server metadata, scripts/acceptance, and layered configuration.');
        }
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
     * @returns {string} Canonical project code.
     */
    resolveProjectCode: function (projectRoot) {
        const packageJson = this.readProjectPackage(projectRoot);
        const projectCode = packageJson.name;
        if (!projectCode || !/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(projectCode)) {
            throw new Error('package.json requires a stable Nodics project name');
        }
        return projectCode;
    },

    /**
     * Validates the project command contract and script ownership policy.
     * @param {string} projectRoot Project root.
     * @returns {void}
     */
    validateProject: function (projectRoot) {
        this.assertNoProjectDescriptor(projectRoot);
        this.resolveProjectCode(projectRoot);
        const commands = this.resolveCommands(projectRoot);
        Object.entries(commands).forEach(([name, command]) => this.validateCommand(projectRoot, name, command));
        this.validateScriptOwnership(projectRoot, commands);
        this.validateProjectDirectoryBoundaries(projectRoot);
        const configurationFailures = [];
        require('../quality/defaultDesignPrincipleAuditService').auditConfigurationSources(configurationFailures, projectRoot, { customerProject: true });
        if (configurationFailures.length) throw new Error('Configuration coding restrictions failed: ' + configurationFailures.join('; '));
    },

    /**
     * Validates older callers through the current project contract.
     * @param {string} projectRoot Project root.
     * @returns {void}
     */
    validateManifest: function (projectRoot) {
        return this.validateProject(projectRoot);
    },

    /**
     * Returns framework-owned project command aliases.
     * @param {string} projectRoot Project root.
     * @returns {Object} Command alias map.
     */
    defaultCommands: function (projectRoot) {
        return Object.assign({
            "docs:generate": {
                "type": "frameworkCommand",
                "command": "project:documentation-content",
                "home": "project"
            },
            "docs:check": {
                "type": "frameworkCommand",
                "command": "project:documentation-content",
                "home": "project",
                "args": [
                    "--check"
                ]
            },
            "domains:manifests": {
                "type": "frameworkCommand",
                "command": "project:data-manifests",
                "home": "project"
            },
            "topology:start": {
                "type": "frameworkCommand",
                "command": "project:topology",
                "home": "project",
                "args": [
                    "start"
                ]
            },
            "topology:start:all": {
                "type": "frameworkCommand",
                "command": "project:topology",
                "home": "project",
                "args": [
                    "start"
                ]
            },
            "topology:preflight": {
                "type": "frameworkCommand",
                "command": "project:topology",
                "home": "project",
                "args": [
                    "preflight"
                ]
            },
            "topology:status": {
                "type": "frameworkCommand",
                "command": "project:topology",
                "home": "project",
                "args": [
                    "status"
                ]
            },
            "topology:stop": {
                "type": "frameworkCommand",
                "command": "project:topology",
                "home": "project",
                "args": [
                    "stop"
                ]
            },
            "qualification:security-boundary": {
                "type": "frameworkCommand",
                "command": "qualification:security-boundary"
            },
            "qualification:publishing-capacity": {
                "type": "frameworkCommand",
                "command": "qualification:publishing-capacity"
            },
            "qualification:publishing-soak": {
                "type": "frameworkCommand",
                "command": "qualification:publishing-soak"
            },
            "qualification:publishing-interruption-contracts": {
                "type": "frameworkCommand",
                "command": "qualification:publishing-interruption-contracts"
            },
            "docker-local:preflight": {
                "type": "frameworkCommand",
                "command": "project:container",
                "home": "project",
                "args": ["dockerLocal", "preflight"]
            },
            "docker-local:build": {
                "type": "frameworkCommand",
                "command": "project:container",
                "home": "project",
                "args": ["dockerLocal", "build"]
            },
            "docker-local:start": {
                "type": "frameworkCommand",
                "command": "project:container",
                "home": "project",
                "args": ["dockerLocal", "start"]
            },
            "docker-local:status": {
                "type": "frameworkCommand",
                "command": "project:container",
                "home": "project",
                "args": ["dockerLocal", "status"]
            },
            "docker-local:logs": {
                "type": "frameworkCommand",
                "command": "project:container",
                "home": "project",
                "args": ["dockerLocal", "logs"]
            },
            "docker-local:stop": {
                "type": "frameworkCommand",
                "command": "project:container",
                "home": "project",
                "args": ["dockerLocal", "stop"]
            },
            "docker-local:reset": {
                "type": "frameworkCommand",
                "command": "project:container",
                "home": "project",
                "args": ["dockerLocal", "reset", "--confirm-destroy-docker-local-data"]
            },
            "docker-local:acceptance": {
                "type": "frameworkCommand",
                "command": "project:container-qualification",
                "home": "project",
                "args": ["dockerLocal", "acceptance"]
            },
            "docker-local:qualify": {
                "type": "frameworkCommand",
                "command": "project:container-qualification",
                "home": "project",
                "args": ["dockerLocal", "qualification"]
            },
            "post-reset:readiness": {
                "type": "frameworkCommand",
                "command": "project:post-reset-readiness",
                "home": "project"
            },
            "local-recovery:readiness": {
                "type": "frameworkCommand",
                "command": "project:local-recovery-readiness",
                "home": "project"
            },
            "docker-local:backup": {
                "type": "frameworkCommand",
                "command": "project:container-resilience",
                "home": "project",
                "args": ["dockerLocal", "backup"]
            },
            "docker-local:verify": {
                "type": "frameworkCommand",
                "command": "project:container-resilience",
                "home": "project",
                "args": ["dockerLocal", "verify"]
            },
            "docker-local:restore": {
                "type": "frameworkCommand",
                "command": "project:container-resilience",
                "home": "project",
                "args": ["dockerLocal", "restore"]
            },
            "docker-local:resilience": {
                "type": "frameworkCommand",
                "command": "project:container-qualification",
                "home": "project",
                "args": ["dockerLocal", "resilience-qualification"]
            },
            "docker-local:soak": {
                "type": "frameworkCommand",
                "command": "project:container-qualification",
                "home": "project",
                "args": ["dockerLocal", "soak"]
            },
            "acceptance:agora-commerce:docker": {
                "type": "frameworkCommand",
                "command": "project:container-qualification",
                "home": "project",
                "args": ["dockerLocal", "commerce-acceptance"]
            },
            "acceptance:documentation:fresh-browser": {
                "type": "frameworkCommand",
                "command": "project:container-qualification",
                "home": "project",
                "args": ["dockerLocal", "acceptance", "--expect-documentation-not-installed"]
            }
        }, this.discoverRuntimeStartCommands(projectRoot), this.discoverAcceptanceCommands(projectRoot));
    },

    /**
     * Discovers runtime start aliases from environment server package metadata.
     * @param {string} projectRoot Project root.
     * @returns {Object} Command alias map.
     */
    discoverRuntimeStartCommands: function (projectRoot) {
        if (!projectRoot) return {};
        const envsRoot = path.join(projectRoot, 'envs');
        if (!fs.existsSync(envsRoot)) return {};
        const commands = {};
        const serverCodes = new Set();
        for (const environment of fs.readdirSync(envsRoot, { withFileTypes: true })) {
            if (!environment.isDirectory()) continue;
            const environmentRoot = path.join(envsRoot, environment.name);
            for (const entry of fs.readdirSync(environmentRoot, { withFileTypes: true })) {
                if (!entry.isDirectory()) continue;
                const packagePath = path.join(environmentRoot, entry.name, 'package.json');
                if (!fs.existsSync(packagePath)) continue;
                const metadata = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                if (metadata.nodics?.kind !== 'server' || metadata.nodics.retired === true) continue;
                serverCodes.add(entry.name.replace(/Server$/u, ''));
            }
        }
        Array.from(serverCodes).sort().forEach(serverCode => {
            const commandName = 'start:' + this.serverCodeToCommandSegment(serverCode);
            commands[commandName] = {
                type: 'frameworkCommand',
                command: 'project:runtime-start',
                home: 'project',
                args: [serverCode]
            };
        });
        return commands;
    },

    /**
     * Converts camel-case runtime server codes to developer command segments.
     * @param {string} serverCode Runtime server code without Server suffix.
     * @returns {string} Command segment.
     */
    serverCodeToCommandSegment: function (serverCode) {
        return String(serverCode).replace(/([a-z0-9])([A-Z])/gu, '$1:$2').toLowerCase();
    },

    /**
     * Discovers project acceptance command aliases from conventional scripts.
     * @param {string} projectRoot Project root.
     * @returns {Object} Command alias map.
     */
    discoverAcceptanceCommands: function (projectRoot) {
        if (!projectRoot) return {};
        const acceptanceRoot = path.join(projectRoot, 'scripts', 'acceptance');
        if (!fs.existsSync(acceptanceRoot)) return {};
        const commands = {};
        const explicitNames = {
            defaultProjectAgoraCmsMediaSeedService: 'acceptance:agora-cms-media-seed',
            defaultProjectAgoraCommerceAcceptanceService: 'acceptance:agora-commerce',
            defaultProjectAgoraCommerceDataAcceptanceService: 'acceptance:agora-commerce-data',
            defaultProjectAgoraCommerceLiveQualificationService: 'qualification:agora-commerce:live',
            defaultProjectAgoraCommercePublicationAcceptanceService: 'acceptance:agora-commerce-publication',
            defaultProjectCapabilityRegistryAcceptanceService: 'acceptance:capability-registry',
            defaultProjectDeploymentQualificationService: 'qualification:deployment',
            defaultProjectEditorialLiveJourneyAcceptanceService: 'acceptance:editorial-live',
            defaultProjectFunctionalJourneyAcceptanceService: 'acceptance:functional',
            defaultProjectGuidedInitializationAcceptanceService: 'acceptance:guided-initialization',
            defaultProjectLocalBootstrapAcceptanceService: 'acceptance:local',
            defaultProjectLoyaltyRewardCheckoutAcceptanceService: 'acceptance:loyalty-reward-checkout',
            defaultProjectNexusCmsMediaSeedService: 'acceptance:nexus-cms-media-seed',
            defaultProjectRuntimeDeploymentGrantAcceptanceService: 'acceptance:runtime-grants',
            defaultProjectWasteBackofficeDiscoveryAcceptanceService: 'acceptance:waste-backoffice-discovery',
            defaultProjectWasteManagementAcceptanceService: 'acceptance:waste-management'
        };
        for (const file of fs.readdirSync(acceptanceRoot).filter(name => name.endsWith('Service.mjs')).sort()) {
            const baseName = file.replace(/\.mjs$/u, '');
            const commandName = explicitNames[baseName] || this.acceptanceScriptToCommandName(baseName);
            if (!commandName) continue;
            commands[commandName] = { type: 'projectScript', script: path.join('scripts', 'acceptance', file) };
        }
        if (commands['acceptance:local']) {
            commands['acceptance:local:fresh'] = Object.assign({}, commands['acceptance:local'], { args: ['--drop-local-db'] });
        }
        if (commands['qualification:deployment']) {
            commands['qualification:deployment:local'] = Object.assign({}, commands['qualification:deployment'], { args: ['--execute-local'] });
        }
        return commands;
    },

    /**
     * Builds a fallback command name for conventional acceptance scripts.
     * @param {string} baseName Script base name.
     * @returns {string} Command name.
     */
    acceptanceScriptToCommandName: function (baseName) {
        const shortName = String(baseName)
            .replace(/^defaultProject/u, '')
            .replace(/Service$/u, '')
            .replace(/Acceptance$/u, '')
            .replace(/Journey$/u, '')
            .replace(/Qualification$/u, '');
        if (!shortName) return '';
        const kebab = shortName.replace(/([a-z0-9])([A-Z])/gu, '$1-$2').toLowerCase();
        return 'acceptance:' + kebab;
    },

    /**
     * Resolves effective command aliases from framework and project structure.
     * @param {string} projectRoot Project root.
     * @returns {Object} Effective command alias map.
     */
    resolveCommands: function (projectRoot) {
        return this.defaultCommands(projectRoot);
    },

    /**
     * Resolves script ownership defaults used by project command validation.
     * @returns {Object} Script ownership policy.
     */
    resolveScriptOwnership: function () {
        return {
            forbiddenProjectOwnedPatterns: [
                'local-security-boundary-qualification',
                'publishing-capacity-baseline',
                'local-sustained-publishing-qualification',
                'docker-local-publishing-interruption-contracts'
            ],
            forbiddenProjectDirectories: ['src']
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
     * Ensures discovered project scripts do not pretend to own framework behavior.
     * @param {string} projectRoot Project root.
     * @param {Object} commands Project command map.
     * @returns {void}
     */
    validateScriptOwnership: function (projectRoot, commands) {
        const declaredScripts = new Set(Object.values(commands)
            .filter(command => command.type === 'projectScript')
            .map(command => path.normalize(command.script)));
        const ownership = this.resolveScriptOwnership();
        const forbidden = [].concat(ownership.forbiddenProjectOwnedPatterns || []);
        for (const script of declaredScripts) {
            if (!fs.existsSync(path.join(projectRoot, script))) {
                throw new Error('Project script command is missing: ' + script);
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
     * @returns {void}
     */
    validateProjectDirectoryBoundaries: function (projectRoot) {
        const ownership = this.resolveScriptOwnership();
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
     * @param {string} name Command name.
     * @param {string[]} args Additional command arguments.
     * @returns {boolean} Whether command passed.
     */
    runProjectCommand: function (projectRoot, name, args) {
        const projectCode = this.resolveProjectCode(projectRoot);
        const commands = this.resolveCommands(projectRoot);
        const command = commands[name];
        if (!command) {
            throw new Error('Unknown project command: ' + name);
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
        const commandEnvironment = this.projectCommandEnvironment(projectRoot, process.env);
        const result = spawnSync(execution.executable, execution.args, {
            cwd: projectRoot,
            env: Object.assign({}, commandEnvironment, {
                NODICS_PROJECT_ROOT: projectRoot,
                NODICS_FRAMEWORK_ROOT: this.resolveFrameworkRoot(),
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
     * Builds the environment used by project-level commands. Native Local commands
     * receive generated runtime credentials through the same framework-owned helper
     * used by topology and selected-server startup.
     *
     * @param {string} projectRoot Project root.
     * @param {Object} environment Current process environment.
     * @returns {Object} Command environment.
     */
    projectCommandEnvironment: function (projectRoot, environment) {
        const selectedEnvironment = environment.ENV || environment.E ||
            environment.NODICS_ACCEPTANCE_RUNTIME || this.conventionalLocalEnvironmentName(projectRoot);
        return localRuntimeCredentials.mergeEnvironment(projectRoot, selectedEnvironment, environment);
    },

    /**
     * Resolves the conventional Local environment name for a customer project.
     *
     * @param {string} projectRoot Project root.
     * @returns {string} Local environment name.
     */
    conventionalLocalEnvironmentName: function (projectRoot) {
        const projectSegment = String(this.resolveProjectCode(projectRoot)).split('.').filter(Boolean).pop() || 'project';
        return projectSegment + 'Local';
    },

    /**
     * Resolves the framework root for frameworkCommand delegation.
     * @returns {string} Framework root.
     */
    resolveFrameworkRoot: function () {
        return path.resolve(__dirname, '../../../../../..');
    }
};
