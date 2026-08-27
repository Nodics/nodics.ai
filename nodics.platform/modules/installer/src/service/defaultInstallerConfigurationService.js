/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const localProperties = require('../../config/properties');

/**
 * @module installer/service/DefaultInstallerConfigurationService
 * @description Resolves installer Application Builder configuration from Nodics layered config with local test fallbacks.
 * @layer service
 * @owner installer
 * @override Customer projects may override allowlists through normal configuration layering.
 */
module.exports = {
    /** Initializes the configuration service lifecycle boundary. */
    init: function () { return Promise.resolve(true); },
    /** Completes post-initialization for the configuration service lifecycle boundary. */
    postInit: function () { return Promise.resolve(true); },

    /** Clones static configuration defaults for isolated mutation-safe merging. */
    deepClone: function (value) {
        return JSON.parse(JSON.stringify(value));
    },

    /** Reads layered runtime installer configuration when CONFIG is available. */
    readRuntimeConfig: function () {
        if (global.CONFIG && typeof CONFIG.get === 'function') {
            return CONFIG.get('installer.applicationBuilder') ||
                (CONFIG.get('installer') && CONFIG.get('installer').applicationBuilder) ||
                {};
        }
        return {};
    },

    /** Reads additional allowed workspace roots from the environment. */
    envAllowedRoots: function () {
        return (process.env.NODICS_INSTALLER_WORKSPACE_ROOTS || '')
            .split(',')
            .map(value => value.trim())
            .filter(Boolean);
    },

    /**
     * Resolves Application Builder configuration from defaults, runtime config, environment, and overrides.
     * @param {Object} overrides Optional configuration overrides for tests or controlled runtime calls.
     * @returns {Object} Effective Application Builder configuration.
     */
    getApplicationBuilderConfig: function (overrides) {
        const defaults = this.deepClone(localProperties.installer.applicationBuilder);
        const runtimeConfig = this.readRuntimeConfig();
        const workspace = Object.assign(
            {},
            defaults.workspace || {},
            runtimeConfig.workspace || {},
            overrides && overrides.workspace || {}
        );
        const allowedRoots = []
            .concat(workspace.allowedRoots || [])
            .concat(this.envAllowedRoots())
            .concat(overrides && overrides.allowedWorkspaceRoots || []);

        return Object.assign({}, defaults, runtimeConfig, overrides || {}, {
            workspace: Object.assign({}, workspace, {
                allowedRoots: allowedRoots
            })
        });
    }
};
