/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

/**
 * @module nTooling/service/command/DefaultRepositoryBuildCompositionService
 * @description Materializes an ephemeral, tooling-owned runtime composition so
 * framework clean/build gates can evaluate every runtime product group without
 * depending on a customer project or committing a production server to nodics.ai.
 * @layer tooling
 * @owner nTooling
 */
module.exports = {
    runtimeGroups: Object.freeze([
        'nodics.core', 'nodics.platform', 'nodics.cron', 'nodics.wcms',
        'nodics.process', 'nodics.commerce', 'nodics.communication', 'nodics.engagement'
    ]),

    /** Writes one generated composition file. @param {string} filePath Target. @param {string|Object} value Content. @returns {void} */
    writeFile: function (filePath, value) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n', 'utf8');
    },

    /** Creates one standard runtime package. @param {string} root Root. @param {Object} definition Definition. @returns {void} */
    writeModule: function (root, definition) {
        this.writeFile(path.join(root, 'package.json'), definition.packageJson);
        this.writeFile(path.join(root, 'nodics.js'), 'module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); } };\n');
        this.writeFile(path.join(root, 'config', 'properties.js'), 'module.exports = ' + JSON.stringify(definition.properties || {}, null, 2) + ';\n');
        this.writeFile(path.join(root, 'config', 'prescripts.js'), 'module.exports = {};\n');
        this.writeFile(path.join(root, 'config', 'postscripts.js'), 'module.exports = {};\n');
    },

    /** Materializes the isolated repository build topology. @returns {Object} Composition coordinates. */
    create: function () {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-repository-build-'));
        const apiKeyPepper = crypto.randomBytes(32).toString('hex');
        const jwtSecret = crypto.randomBytes(48).toString('hex');
        const environmentRoot = path.join(root, 'envs', 'repositoryBuildEnvironment');
        const serverRoot = path.join(environmentRoot, 'repositoryBuildServer');
        const metadata = (name, index, kind, displayName, extra) => Object.assign({
            name, version: '0.0.0', index, private: true, main: 'nodics.js',
            description: displayName + ' used only by the Nodics repository release gate.',
            nodics: {
                kind, runtimeModule: true, loadableByNodicsModuleLoader: true,
                owns: ['composition', 'configuration'],
                runtime: { router: false, publish: false, web: false }, displayName
            }
        }, extra || {});
        this.writeModule(root, {
            packageJson: metadata('nodics.repository-build', '9000.00', 'application', 'Repository Build Composition'),
            properties: { project: { code: 'nodics.repository-build', toolingOnly: true } }
        });
        this.writeModule(environmentRoot, {
            packageJson: metadata('repositoryBuildEnvironment', '9000.10', 'environment', 'Repository Build Environment'),
            properties: {
                environment: { code: 'repositoryBuildEnvironment', toolingOnly: true },
                log: { level: 'warn' }, event: { remotePublishEnabled: false },
                authSecurity: {
                    apiKey: { pepper: apiKeyPepper }, jwt: { secret: jwtSecret },
                    securityStamp: { failClosed: false, allowMissingStamp: true },
                    refreshToken: { requireDistributedCache: false }
                },
                cache: { invalidation: { crossNode: false } },
                database: { default: { mongodb: { master: { databaseName: 'nodicsRepositoryBuild' } } } }
            }
        });
        const serverPackage = metadata('repositoryBuildServer', '9000.20', 'server', 'Repository Build Server');
        serverPackage.nodics.extends = this.runtimeGroups.slice();
        this.writeModule(serverRoot, {
            packageJson: serverPackage,
            properties: {
                activeModules: { groups: [], modules: ['nodics.repository-build', 'repositoryBuildEnvironment', 'repositoryBuildServer'] },
                servers: { default: { endpoint: { httpHost: '127.0.0.1', httpPort: 4399, httpsHost: '127.0.0.1', httpsPort: 4398 } } }
            }
        });
        const composition = { root, environmentRoot, serverRoot, serverName: 'repositoryBuildServer', environmentName: 'repositoryBuildEnvironment' };
        this.validate(composition);
        return composition;
    },

    /** Validates that the ephemeral server covers only standard framework runtime groups. @param {Object} composition Coordinates. @returns {boolean} True. */
    validate: function (composition) {
        const serverPackagePath = path.join(composition.serverRoot, 'package.json');
        if (!fs.existsSync(serverPackagePath)) throw new Error('Repository build composition is missing its server package');
        const serverPackage = JSON.parse(fs.readFileSync(serverPackagePath, 'utf8'));
        const actual = ((serverPackage.nodics || {}).extends || []).slice().sort();
        const expected = this.runtimeGroups.slice().sort();
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error('Repository build composition must extend every and only standard runtime group');
        }
        return true;
    },

    /** Removes a materialized composition. @param {Object} composition Coordinates. @returns {void} */
    remove: function (composition) {
        if (composition && composition.root) fs.rmSync(composition.root, { recursive: true, force: true });
    },

    /** Rejects lifecycle methods that are unsafe for the repository composition. @param {string} method Method. @returns {boolean} True. */
    validateMethod: function (method) {
        if (!['cleanAll', 'buildAll'].includes(method)) throw new Error('Unsupported repository lifecycle method: ' + method);
        return true;
    },

    /** Executes cleanAll or buildAll against the ephemeral composition. @param {string} frameworkRoot Framework root. @param {string} method Lifecycle method. @returns {Promise<boolean>} Result. */
    execute: async function (frameworkRoot, method) {
        this.validateMethod(method);
        const composition = this.create();
        try {
            const frameworkPackage = require(path.join(frameworkRoot, 'package.json'));
            const moduleRoots = (frameworkPackage.workspaces || []).map(workspace => path.join(frameworkRoot, workspace)).concat([composition.root]);
            return await require(path.join(frameworkRoot, 'nodics'))[method]({
                NODICS_HOME: path.join(frameworkRoot, 'nodics.core'), CUSTOM_HOME: composition.root,
                MODULE_ROOTS: moduleRoots, defaultServer: composition.serverName,
                defaultEnvironment: composition.environmentName
            });
        } finally {
            this.remove(composition);
        }
    }
};

if (require.main === module) {
    module.exports.execute(path.resolve(process.argv[3]), process.argv[2]).catch(error => {
        console.error(error);
        process.exit(1);
    });
}
