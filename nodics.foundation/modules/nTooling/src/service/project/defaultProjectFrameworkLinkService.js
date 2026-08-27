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
 * @description Validates project framework-root configuration without creating project-local framework links.
 * @layer tooling
 * @owner nTooling
 * @override Projects own NODICS_FRAMEWORK_ROOT; framework tooling owns validation and migration guidance.
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
     * Validates direct framework-root wiring for one project.
     * @param {Object} options Link options.
     * @param {string} options.projectRoot Project root.
     * @param {Object} options.environment Environment values.
     * @returns {void}
     */
    validate: function (options = {}) {
        const projectRoot = path.resolve(options.projectRoot || process.cwd());
        const packageJsonPath = path.join(projectRoot, 'package.json');
        const envPath = path.join(projectRoot, '.env');
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
        this.assertFrameworkModule(frameworkRoot, 'nodics.foundation');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const dependencies = packageJson.dependencies || {};
        const legacyDependencies = Object.entries(dependencies)
            .filter(([name, value]) => name.startsWith('nodics.') && String(value).startsWith('file:.nodics/framework/'));

        if (legacyDependencies.length > 0) {
            const dependencyNames = legacyDependencies.map(([name]) => name).join(', ');
            throw new Error(
                'Project package.json still declares legacy .nodics/framework dependencies: ' + dependencyNames + '. ' +
                'Remove those nodics.* file dependencies and delegate tooling/runtime through NODICS_FRAMEWORK_ROOT.'
            );
        }

        console.log(`Validated Nodics framework root: ${frameworkRoot}`);
    },

    /**
     * CLI bridge used by nTooling's node-script command handler.
     * @param {Object} environment Environment values.
     * @returns {void}
     */
    runCli: function (environment = process.env) {
        this.validate({
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
