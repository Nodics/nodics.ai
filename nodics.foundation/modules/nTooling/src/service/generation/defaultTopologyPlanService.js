/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const fs = require('fs');
const path = require('path');
const structureGeneratorService = require('./defaultStructureGeneratorService');

/**
 * @module nTooling/service/generation/defaultTopologyPlanService
 * @description Creates approval-first Nodics project topology plans and optionally applies them through the structure generator.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling modules may replace or wrap topology planning while preserving no-write-by-default behavior and structure-audit compatibility.
 */


let exportedService;
module.exports = exportedService = {
    /** Implements readOption as an overrideable service operation. */
    readOption: function (args, name, defaultValue) {
    const prefix = name + '=';
    const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
    return match ? match.slice(prefix.length) : defaultValue;
},

    /** Implements readCsv as an overrideable service operation. */
    readCsv: function (args, name, defaultValue) {
    const value = (this.readOption || exportedService.readOption).call(this, args, name, '');
    if (!value) {
        return defaultValue || [];
    }
    return value.split(',').map(item => item.trim()).filter(Boolean);
},

    /** Implements ensureArray as an overrideable service operation. */
    ensureArray: function (value, fallback) {
    return value && value.length > 0 ? value : fallback;
},

    /** Implements toPosix as an overrideable service operation. */
    toPosix: function (filePath) {
    return filePath.split(path.sep).join('/');
},

    /** Implements upperCaseFirstChar as an overrideable service operation. */
    upperCaseFirstChar: function (value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
},

    /** Implements serverProperties as an overrideable service operation. */
    serverProperties: function (moduleName, activeGroups, activeModules) {
    return `/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module ${moduleName}/config/properties
 * @description Defines generated server topology configuration, active module selection, and process-owned defaults for ${moduleName}.
 * @layer config
 * @owner generated
 * @override Environment, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    activeModules: {
        groups: ${JSON.stringify(activeGroups, null, 8).replace(/\n/g, '\n        ')},
        modules: ${JSON.stringify(activeModules, null, 8).replace(/\n/g, '\n        ')}
    }
};
`;
},

    /**
     * Parses topology planning arguments.
     * @param {string[]} args Command arguments.
     * @returns {Object} Topology options.
     */
    createOptions: function (args) {
        const name = (this.readOption || exportedService.readOption).call(this, args, '--name', '');
        const targetPath = (this.readOption || exportedService.readOption).call(this, args, '--path', name);
        const modules = (this.ensureArray || exportedService.ensureArray).call(this, this.readCsv(args, '--modules', []), [name + 'Core']);
        return {
            apply: (args || []).includes('--apply'),
            name: name,
            groupName: (this.readOption || exportedService.readOption).call(this, args, '--groupName', ''),
            targetPath: targetPath ? path.resolve(process.cwd(), targetPath) : '',
            baseIndex: (this.readOption || exportedService.readOption).call(this, args, '--index', '9000'),
            modules: modules,
            providers: (this.readCsv || exportedService.readCsv).call(this, args, '--providers', []),
            envs: (this.ensureArray || exportedService.ensureArray).call(this, this.readCsv(args, '--envs', []), ['local']),
            servers: (this.ensureArray || exportedService.ensureArray).call(this, this.readCsv(args, '--servers', []), [name + 'Server']),
            nodes: (this.readCsv || exportedService.readCsv).call(this, args, '--nodes', ['node0']),
            activeGroups: (this.readCsv || exportedService.readCsv).call(this, args, '--activeGroups', ['nodics.foundation', 'nodics.platform', 'modules'])
        };
    },

    /**
     * Validates topology planning options.
     * @param {Object} options Topology options.
     * @returns {boolean} True when options are valid.
     */
    validateOptions: function (options) {
        if (!options.name || !/^[A-Za-z][A-Za-z0-9]*$/.test(options.name)) {
            throw new Error('A valid --name=<ProjectName> is required.');
        }
        if (!options.groupName) {
            throw new Error('Topology planning requires --groupName=<companyOrProjectGroup>.');
        }
        if (!options.targetPath) {
            throw new Error('Topology planning requires --path=<projectPath>.');
        }
        return true;
    },

    /**
     * Creates a deterministic topology plan without writing files.
     * @param {Object} options Topology options.
     * @returns {Object} Topology plan.
     */
    createPlan: function (options) {
        (this.validateOptions || exportedService.validateOptions).call(this, options);
        const base = options.baseIndex;
        const entries = [];
        entries.push({
            kind: 'project',
            name: options.name,
            path: options.targetPath,
            index: base + '.0',
            groupName: options.groupName
        });
        options.modules.forEach((moduleName, index) => {
            entries.push({
                kind: 'capability',
                name: moduleName,
                path: path.join(options.targetPath, 'modules', moduleName),
                index: base + '.1' + (index + 1)
            });
        });
        options.providers.forEach((providerName, index) => {
            entries.push({
                kind: 'provider',
                name: providerName,
                path: path.join(options.targetPath, 'modules', providerName),
                index: base + '.2' + (index + 1)
            });
        });
        options.envs.forEach((envName, envIndex) => {
            const envPath = path.join(options.targetPath, 'envs', envName);
            entries.push({
                kind: 'environment',
                name: envName,
                path: envPath,
                index: base + '.3' + (envIndex + 1)
            });
            options.servers.forEach((serverName, serverIndex) => {
                const scopedServerName = options.envs.length > 1 ? envName + (this.upperCaseFirstChar || exportedService.upperCaseFirstChar).call(this, serverName) : serverName;
                const serverPath = path.join(envPath, scopedServerName);
                entries.push({
                    kind: 'server',
                    name: scopedServerName,
                    path: serverPath,
                    index: base + '.3' + (envIndex + 1) + '.' + (serverIndex + 1),
                    activeGroups: options.activeGroups,
                    activeModules: [scopedServerName, envName].concat(options.modules, options.providers)
                });
                options.nodes.forEach((nodeName, nodeIndex) => {
                    entries.push({
                        kind: 'node',
                        name: nodeName,
                        path: path.join(serverPath, nodeName),
                        index: base + '.3' + (envIndex + 1) + '.' + (serverIndex + 1) + (nodeIndex + 1)
                    });
                });
            });
        });
        return {
            project: options.name,
            groupName: options.groupName,
            apply: options.apply,
            entries: entries,
            validations: [
                'npm run structure:audit -- --fail',
                'npm run llm:generate',
                'npm run llm:validate'
            ]
        };
    },

    /**
     * Applies a topology plan through the structure generator.
     * @param {Object} plan Topology plan.
     * @returns {Object} Applied plan summary.
     */
    applyPlan: function (plan) {
        plan.entries.forEach(entry => {
            const args = [
                '--kind=' + entry.kind,
                '--name=' + entry.name,
                '--path=' + entry.path,
                '--index=' + entry.index
            ];
            if (entry.kind === 'project') {
                args.push('--groupName=' + entry.groupName);
            }
            structureGeneratorService.generate(structureGeneratorService.createOptions(args));
            if (entry.kind === 'server') {
                fs.writeFileSync(path.join(entry.path, 'config', 'properties.js'),
                    (this.serverProperties || exportedService.serverProperties).call(this, entry.name, entry.activeGroups, entry.activeModules), 'utf8');
            }
        });
        return plan;
    },

    /**
     * Prints a topology plan for developer approval.
     * @param {Object} plan Topology plan.
     * @returns {void}
     */
    printPlan: function (plan) {
        console.log('Nodics topology plan');
        console.log('Project        : ' + plan.project);
        console.log('Group name     : ' + plan.groupName);
        console.log('Mode           : ' + (plan.apply ? 'apply' : 'plan-only'));
        console.log('\nHierarchy:');
        plan.entries.forEach(entry => {
            console.log('  - [' + entry.kind + '] ' + entry.name + ' @ ' + (this.toPosix || exportedService.toPosix).call(this, entry.path) + ' #' + entry.index);
            if (entry.kind === 'server') {
                console.log('    activeModules.groups  : ' + entry.activeGroups.join(', '));
                console.log('    activeModules.modules : ' + entry.activeModules.join(', '));
            }
        });
        console.log('\nValidation commands:');
        plan.validations.forEach(command => console.log('  - ' + command));
        if (!plan.apply) {
            console.log('\nNo files written. Re-run with --apply after approval.');
        }
    },

    /**
     * Runs topology planning from command-line arguments.
     * @param {string[]} args Command arguments.
     * @returns {void}
     */
    runCli: function (args) {
        const options = (this.createOptions || exportedService.createOptions).call(this, args || []);
        const plan = (this.createPlan || exportedService.createPlan).call(this, options);
        if (options.apply) {
            (this.applyPlan || exportedService.applyPlan).call(this, plan);
        }
        (this.printPlan || exportedService.printPlan).call(this, plan);
    }
};

if (require.main === module) {
    exportedService.runCli(process.argv.slice(2));
}
