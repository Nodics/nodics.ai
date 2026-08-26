/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const localProperties = require('../../config/properties');

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function readRuntimeConfig() {
    if (global.CONFIG && typeof CONFIG.get === 'function') {
        return CONFIG.get('installer.applicationBuilder') ||
            (CONFIG.get('installer') && CONFIG.get('installer').applicationBuilder) ||
            {};
    }
    return {};
}

function envAllowedRoots() {
    return (process.env.NODICS_INSTALLER_WORKSPACE_ROOTS || '')
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);
}

/**
 * @module installer/service/DefaultInstallerConfigurationService
 * @description Resolves installer Application Builder configuration from Nodics layered config with local test fallbacks.
 * @layer service
 * @owner installer
 * @override Customer projects may override allowlists through normal configuration layering.
 */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },

    getApplicationBuilderConfig: function (overrides) {
        const defaults = deepClone(localProperties.installer.applicationBuilder);
        const runtimeConfig = readRuntimeConfig();
        const workspace = Object.assign(
            {},
            defaults.workspace || {},
            runtimeConfig.workspace || {},
            overrides && overrides.workspace || {}
        );
        const allowedRoots = []
            .concat(workspace.allowedRoots || [])
            .concat(envAllowedRoots())
            .concat(overrides && overrides.allowedWorkspaceRoots || []);

        return Object.assign({}, defaults, runtimeConfig, overrides || {}, {
            workspace: Object.assign({}, workspace, {
                allowedRoots: allowedRoots
            })
        });
    }
};
