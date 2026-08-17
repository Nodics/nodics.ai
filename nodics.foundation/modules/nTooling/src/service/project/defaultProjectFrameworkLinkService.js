/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nTooling/service/project/defaultProjectFrameworkLinkService
 * @description Synchronizes generated framework links for a project while keeping link mechanics in framework tooling.
 * @layer tooling
 * @owner nTooling
 * @override Projects own dependency facts and NODICS_FRAMEWORK_ROOT; framework tooling owns link validation and replacement.
 */

const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    /**
     * Reads a dotenv-style file without loading it into global process state.
     * @param {string} filePath Environment file path.
     * @returns {Object} Parsed values.
     */
    readEnvFile: function (filePath) {
        if (!fs.existsSync(filePath)) return {};
        return fs.readFileSync(filePath, 'utf8')
            .split(/\r?\n/u)
            .reduce((env, line) => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) return env;
                const separatorIndex = trimmed.indexOf('=');
                if (separatorIndex < 0) return env;
                const key = trimmed.slice(0, separatorIndex).trim();
                let value = trimmed.slice(separatorIndex + 1).trim();
                if ((value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                env[key] = value;
                return env;
            }, {});
    },

    /**
     * Resolves and validates one framework package root.
     * @param {string} frameworkRoot Framework root.
     * @param {string} moduleName Framework package name.
     * @returns {string} Module root.
     */
    assertFrameworkModule: function (frameworkRoot, moduleName) {
        const moduleRoot = path.join(frameworkRoot, moduleName);
        const modulePackage = path.join(moduleRoot, 'package.json');
        if (!fs.existsSync(modulePackage)) {
            throw new Error(
                `Cannot resolve ${moduleName}. Expected package at ${modulePackage}. ` +
                'Update NODICS_FRAMEWORK_ROOT in .env.'
            );
        }
        return moduleRoot;
    },

    /**
     * Returns the committed generated-link dependency path.
     * @param {string} moduleName Framework package name.
     * @returns {string} Dependency path.
     */
    expectedDependencyPath: function (moduleName) {
        return `file:.nodics/framework/${moduleName}`;
    },

    /**
     * Validates that project dependencies point to generated framework links.
     * @param {Object} dependencies Package dependencies.
     * @param {string} moduleName Framework package name.
     * @returns {void}
     */
    assertCommittedDependency: function (dependencies, moduleName) {
        const expectedPath = this.expectedDependencyPath(moduleName);
        if (dependencies[moduleName] !== expectedPath) {
            throw new Error(
                `Unexpected dependency path for ${moduleName}: ${dependencies[moduleName]}. ` +
                `Expected ${expectedPath}. Package dependencies must point to generated framework links.`
            );
        }
    },

    /**
     * Replaces a generated symlink after verifying no real directory/file would be removed.
     * @param {string} linkPath Generated symlink path.
     * @param {string} targetPath Framework module root.
     * @returns {void}
     */
    replaceGeneratedLink: function (linkPath, targetPath) {
        if (fs.existsSync(linkPath)) {
            const linkStats = fs.lstatSync(linkPath);
            if (!linkStats.isSymbolicLink()) {
                throw new Error(
                    `Refusing to replace non-symlink path: ${linkPath}. ` +
                    'Remove it manually if it is safe, then rerun configure:framework.'
                );
            }
            fs.unlinkSync(linkPath);
        }
        fs.symlinkSync(targetPath, linkPath, 'dir');
    },

    /**
     * Removes generated links that no longer correspond to package dependencies.
     * @param {string} frameworkLinkRoot Generated framework link root.
     * @param {string[]} frameworkDependencies Declared framework dependencies.
     * @returns {void}
     */
    removeStaleGeneratedLinks: function (frameworkLinkRoot, frameworkDependencies) {
        fs.readdirSync(frameworkLinkRoot)
            .filter(name => name.startsWith('nodics.') && !frameworkDependencies.includes(name))
            .forEach(name => {
                const stalePath = path.join(frameworkLinkRoot, name);
                const staleStats = fs.lstatSync(stalePath);
                if (!staleStats.isSymbolicLink()) {
                    throw new Error(
                        `Refusing to remove stale non-symlink framework path: ${stalePath}. ` +
                        'Remove it manually if it is safe, then rerun configure:framework.'
                    );
                }
                fs.unlinkSync(stalePath);
                console.log(`Removed stale framework link ${name}`);
            });
    },

    /**
     * Synchronizes generated framework links for one project.
     * @param {Object} options Link options.
     * @param {string} options.projectRoot Project root.
     * @param {Object} options.environment Environment values.
     * @returns {void}
     */
    synchronize: function (options = {}) {
        const projectRoot = path.resolve(options.projectRoot || process.cwd());
        const packageJsonPath = path.join(projectRoot, 'package.json');
        const envPath = path.join(projectRoot, '.env');
        const frameworkLinkRoot = path.join(projectRoot, '.nodics', 'framework');
        const environment = Object.assign(
            {},
            this.readEnvFile(envPath),
            options.environment || process.env
        );
        const frameworkRootValue = environment.NODICS_FRAMEWORK_ROOT;
        if (!frameworkRootValue) {
            throw new Error(
                'NODICS_FRAMEWORK_ROOT is not configured. Copy .env.example to .env ' +
                'and point it to the folder containing Nodics framework packages.'
            );
        }

        const frameworkRoot = path.resolve(projectRoot, frameworkRootValue);
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const dependencies = packageJson.dependencies || {};
        const frameworkDependencies = Object.keys(dependencies)
            .filter(name => name.startsWith('nodics.'));

        if (frameworkDependencies.length === 0) {
            throw new Error('No nodics.* dependencies found in package.json.');
        }

        fs.mkdirSync(frameworkLinkRoot, { recursive: true });
        this.removeStaleGeneratedLinks(frameworkLinkRoot, frameworkDependencies);

        frameworkDependencies.forEach(moduleName => {
            this.assertCommittedDependency(dependencies, moduleName);
            const moduleRoot = this.assertFrameworkModule(frameworkRoot, moduleName);
            const linkPath = path.join(frameworkLinkRoot, moduleName);
            this.replaceGeneratedLink(linkPath, moduleRoot);
            console.log(`${moduleName} -> ${moduleRoot}`);
        });

        console.log(`Linked ${frameworkDependencies.length} Nodics framework dependencies from ${frameworkRoot}`);
    },

    /**
     * CLI bridge used by nTooling's node-script command handler.
     * @param {Object} environment Environment values.
     * @returns {void}
     */
    runCli: function (environment = process.env) {
        this.synchronize({
            projectRoot: environment.NODICS_PROJECT_ROOT || process.cwd(),
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
