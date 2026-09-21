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
 * @override Projects own framework-root configuration; framework tooling owns validation and migration guidance.
 */

const fs = require('node:fs');
const path = require('node:path');

module.exports = {
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
                'Update the project framework-root configuration or the NODICS_FRAMEWORK_ROOT process value.'
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
        const environment = Object.assign(
            {},
            options.environment || process.env
        );
        const frameworkRootValue = environment.NODICS_FRAMEWORK_ROOT;
        if (!frameworkRootValue) {
            throw new Error(
                'NODICS_FRAMEWORK_ROOT is not configured. Provide it through the project runtime configuration or this process invocation.'
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
