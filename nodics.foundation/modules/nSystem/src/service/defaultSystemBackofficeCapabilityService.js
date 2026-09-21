/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const capability = {
    enabled: true,
    capabilityId: 'system-runtime-configuration',
    displayName: 'Runtime Configuration',
    category: 'platform',
    icon: 'settings',
    contractVersion: 1,
    minimumClientContractVersion: 0,
    roles: [
        'CONTROL_PLANE_PROVIDER'
    ],
    requiredPermissions: [
        'runtime.config.schema.view'
    ],
    navigation: [
        {
            id: 'runtime-configuration',
            label: 'Runtime Configuration',
            route: '/administration/runtime-configuration',
            icon: 'settings',
            order: 230,
            group: {
                id: 'system-integrations',
                label: 'System & Integrations',
                order: 100
            },
            perspectives: [
                'operations'
            ],
            contexts: [
                'environment',
                'tenant'
            ],
            featureState: 'ACTIVE',
            requiredPermissions: [
                'runtime.config.schema.view',
                'runtime.config.effective.view'
            ],
            backendWorkspace: {
                contractVersion: 1,
                renderer: 'axis.workspace.native',
                workspaceCode: 'system.runtimeConfiguration',
                viewCode: 'runtimeConfiguration.overview',
                title: 'Runtime Configuration',
                description: 'Review module-owned runtime configuration schemas and update governed values through nSystem.'
            },
            help: {
                summary: 'Manage operator-updated runtime configuration values through module-declared schemas.'
            }
        }
    ]
};

/**
 * @module nSystem/service/DefaultSystemBackofficeCapabilityService
 * @description Publishes the nSystem-owned Runtime Configuration control-plane workspace for Axis.
 * @layer service
 * @owner nSystem
 * @override Projects may contribute additional runtime configuration schemas through their owning modules; the control-plane workspace remains nSystem-owned.
 */
module.exports = {
    init: function () {
        if (global.SERVICE && SERVICE.DefaultModuleRegistrationAgentService) {
            SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('system', this);
        }
        return Promise.resolve(true);
    },

    postInit: function () {
        return Promise.resolve(true);
    },

    getCapability: function () {
        return JSON.parse(JSON.stringify(capability));
    }
};
