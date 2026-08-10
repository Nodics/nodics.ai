/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.ai/NodicsFrameworkRoot
 * @description Declares the nodics.ai framework repository boundary as a standard module-group-shaped package without making it a runtime module.
 * @layer framework-root
 * @owner nodics.ai
 * @override Do not add runtime behavior here. Functional modules such as nodics.core, nodics.localization, nodics.platform, nodics.wcms, nodics.cron, nodics.process, nodics.engagement, and nodics.docs own runtime behavior.
 */
const path = require('path');
const nodicsCore = require('./nodics.core/nodics');
const frameworkPackage = require('./package.json');

/**
 * Resolves framework-root lifecycle options without making nodics.ai a runtime module.
 *
 * @param {Object} options Optional caller context.
 * @returns {Object} Effective lifecycle options for core tooling.
 */
function resolveCoreLifecycleOptions(options) {
    const workspaceRoots = (frameworkPackage.workspaces || [])
        .map(workspaceName => path.resolve(__dirname, workspaceName));
    const customHome = process.env.CUSTOM_HOME || process.cwd();
    const moduleRoots = customHome === __dirname || workspaceRoots.includes(customHome) ?
        workspaceRoots : workspaceRoots.concat([customHome]);
    return Object.assign({
        NODICS_HOME: path.resolve(__dirname, 'nodics.core'),
        CUSTOM_HOME: customHome,
        MODULE_ROOTS: Object.freeze(moduleRoots)
    }, options || {});
}

module.exports = {
    /**
     * Keeps the framework root compatible with standard Nodics package shape.
     *
     * The root package is intentionally not loadable by the Nodics module
     * loader. Runtime initialization starts from concrete functional modules
     * and customer server extension chains.
     *
     * @param {Object} options Optional caller context.
     * @returns {Promise<boolean>} Resolves true because the repository root has no runtime startup behavior.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Keeps the framework root compatible with standard Nodics package shape.
     *
     * @param {Object} options Optional caller context.
     * @returns {Promise<boolean>} Resolves true because the repository root has no runtime post-startup behavior.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Delegates repository-level clean execution to the core framework lifecycle.
     *
     * @param {Object} options Optional caller context.
     * @returns {Promise<boolean>} Resolves when generated artifacts are cleaned by core tooling.
     */
    cleanAll: function (options) {
        return nodicsCore.cleanAll(resolveCoreLifecycleOptions(options));
    },

    /**
     * Delegates repository-level build execution to the core framework lifecycle.
     *
     * The framework root owns command convenience only; generated artifacts and
     * schema discovery remain owned by the active functional modules.
     *
     * @param {Object} options Optional caller context.
     * @returns {Promise<boolean>} Resolves when generated artifacts are rebuilt by core tooling.
     */
    buildAll: function (options) {
        return nodicsCore.buildAll(resolveCoreLifecycleOptions(options));
    }
};
