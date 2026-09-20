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
    /**
     * Resolves loadable runtime groups from framework workspace package metadata.
     * @param {string} frameworkRoot Selected framework checkout.
     * @returns {string[]} Group package names in workspace order.
     */
    runtimeGroups: function (frameworkRoot = path.resolve(__dirname, '../../../../../..')) {
        const packageJson = JSON.parse(fs.readFileSync(path.join(frameworkRoot, 'package.json'), 'utf8'));
        const groups = [];
        for (const workspace of packageJson.workspaces || []) {
            const metadata = JSON.parse(fs.readFileSync(path.join(frameworkRoot, workspace, 'package.json'), 'utf8'));
            const nodics = metadata.nodics || {};
            if (nodics.kind === 'group' && nodics.runtimeModule === true && nodics.loadableByNodicsModuleLoader === true) {
                if (!metadata.name || groups.includes(metadata.name)) throw new Error('Repository runtime group names must be present and unique');
                groups.push(metadata.name);
            }
        }
        if (!groups.length) throw new Error('Repository build composition requires loadable workspace groups');
        return groups;
    },

    /** Writes one generated composition file. @param {string} filePath Target. @param {string|Object} value Content. @returns {void} */
    writeFile: function (filePath, value) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 });
    },

    /** Creates one standard runtime package. @param {string} root Root. @param {Object} definition Definition. @returns {void} */
    writeModule: function (root, definition) {
        this.writeFile(path.join(root, 'package.json'), definition.packageJson);
        this.writeFile(path.join(root, 'nodics.js'), 'module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); } };\n');
        this.writeFile(path.join(root, 'config', 'properties.js'), 'module.exports = ' + JSON.stringify(definition.properties || {}, null, 2) + ';\n');
        this.writeFile(path.join(root, 'config', 'prescripts.js'), 'module.exports = {};\n');
        this.writeFile(path.join(root, 'config', 'postscripts.js'), 'module.exports = {};\n');
    },

    /**
     * Resolves a writable scratch root for repository build composition.
     * Server deployments can pin this to an approved mount.
     *
     * @returns {string} Writable temporary root.
     */
    tempRoot: function () {
        const projectRoot = process.env.NODICS_PROJECT_ROOT ? path.resolve(process.env.NODICS_PROJECT_ROOT) : null;
        const candidates = [
            process.env.NODICS_REPOSITORY_BUILD_TMPDIR,
            projectRoot ? path.join(projectRoot, '.nodics', 'tmp') : null,
            process.env.NODICS_TOOLING_TMPDIR,
            os.tmpdir()
        ].filter(Boolean);
        let lastError = null;
        for (const candidate of candidates) {
            const resolved = path.resolve(candidate);
            try {
                fs.mkdirSync(resolved, {recursive: true});
                fs.accessSync(resolved, fs.constants.W_OK);
                return resolved;
            } catch (error) {
                lastError = error;
            }
        }
        throw new Error(
            'Repository build composition requires a writable temporary directory. ' +
            'Set NODICS_PROJECT_ROOT or NODICS_REPOSITORY_BUILD_TMPDIR to a server-approved project scratch path. ' +
            (lastError ? 'Last error: ' + lastError.message : '')
        );
    },

    /** Returns the retained repository validation server coordinates. @param {string} frameworkRoot Framework checkout. @returns {Object} Paths. */
    persistentCoordinates: function (frameworkRoot) {
        const root = path.join(frameworkRoot, '.nodics', 'tmp', 'repository-build');
        const environmentRoot = path.join(root, 'envs', 'repositoryBuildEnvironment');
        return { root, environmentRoot, serverRoot: path.join(environmentRoot, 'repositoryBuildServer') };
    },

    /** Materializes the isolated repository build topology. @returns {Object} Composition coordinates. */
    create: function (frameworkRoot = path.resolve(__dirname, '../../../../../..'), options = {}) {
        const runtimeGroups = this.runtimeGroups(frameworkRoot);
        const root = options.persistent ? this.persistentCoordinates(frameworkRoot).root :
            fs.mkdtempSync(path.join(this.tempRoot(), 'nodics-repository-build-'));
        fs.mkdirSync(root, { recursive: true, mode: 0o700 });
        fs.chmodSync(root, 0o700);
        const environmentRoot = path.join(root, 'envs', 'repositoryBuildEnvironment');
        const existingProperties = path.join(environmentRoot, 'config', 'properties.js');
        let existing = {};
        if (options.persistent === true && fs.existsSync(existingProperties)) {
            existing = JSON.parse(fs.readFileSync(existingProperties, 'utf8').replace(/^module.exports\s*=\s*/, '').trim().replace(/;$/, ''));
        }
        const existingPepper = existing.authSecurity && existing.authSecurity.apiKey && existing.authSecurity.apiKey.pepper;
        const existingSecret = existing.authSecurity && existing.authSecurity.jwt && existing.authSecurity.jwt.secret;
        const apiKeyPepper = typeof existingPepper === 'string' && existingPepper.length >= 32 ? existingPepper : crypto.randomBytes(32).toString('hex');
        const jwtSecret = typeof existingSecret === 'string' && existingSecret.length >= 48 ? existingSecret : crypto.randomBytes(48).toString('hex');
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
        serverPackage.nodics.extends = runtimeGroups.slice();
        this.writeModule(serverRoot, {
            packageJson: serverPackage,
            properties: {
                activeModules: { groups: [], modules: ['nTest', 'nodics.repository-build'] },
                servers: { default: { endpoint: { httpHost: '127.0.0.1', httpPort: 4399, httpsHost: '127.0.0.1', httpsPort: 4398 } } }
            }
        });
        const composition = { persistent: options.persistent === true, frameworkRoot, root, environmentRoot, serverRoot, serverName: 'repositoryBuildServer', environmentName: 'repositoryBuildEnvironment' };
        this.validate(composition);
        return composition;
    },

    /** Validates that the ephemeral server covers only standard framework runtime groups. @param {Object} composition Coordinates. @returns {boolean} True. */
    validate: function (composition) {
        const serverPackagePath = path.join(composition.serverRoot, 'package.json');
        if (!fs.existsSync(serverPackagePath)) throw new Error('Repository build composition is missing its server package');
        const serverPackage = JSON.parse(fs.readFileSync(serverPackagePath, 'utf8'));
        const actual = ((serverPackage.nodics || {}).extends || []).slice().sort();
        const expected = this.runtimeGroups(composition.frameworkRoot).sort();
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error('Repository build composition must extend every and only standard runtime group');
        }
        return true;
    },

    /** Removes a materialized composition. @param {Object} composition Coordinates. @returns {void} */
    remove: function (composition) {
        if (composition && composition.root && !composition.persistent) fs.rmSync(composition.root, { recursive: true, force: true });
    },

    /** Rejects lifecycle methods that are unsafe for the repository composition. @param {string} method Method. @returns {boolean} True. */
    validateMethod: function (method) {
        if (!['cleanAll', 'buildAll'].includes(method)) throw new Error('Unsupported repository lifecycle method: ' + method);
        return true;
    },

    /** Executes cleanAll or buildAll against the ephemeral composition. @param {string} frameworkRoot Framework root. @param {string} method Lifecycle method. @returns {Promise<boolean>} Result. */
    execute: async function (frameworkRoot, method) {
        this.validateMethod(method);
        const composition = this.create(frameworkRoot, { persistent: true });
        try {
            const frameworkPackage = require(path.join(frameworkRoot, 'package.json'));
            const moduleRoots = (frameworkPackage.workspaces || []).map(workspace => path.join(frameworkRoot, workspace)).concat([composition.root]);
            return await require(path.join(frameworkRoot, 'nodics'))[method]({
                NODICS_HOME: path.join(frameworkRoot, 'nodics.foundation'), CUSTOM_HOME: composition.root,
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
