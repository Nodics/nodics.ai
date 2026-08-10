/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.process/config/properties
 * @description Defines default process/workflow BackOffice metadata and designer policy for the Process functional module group.
 * @layer config
 * @owner nodics.process
 * @override Project, environment, server, tenant, or customer process overlays may enable APIs, designer providers, and process schemas without changing framework defaults.
 */
module.exports = {
    apiExposure: {
        categories: {
            processManagement: {
                enabled: true
            }
        }
    },
    process: {
        actionAdapters: {
            enabled: true,
            allowUnregisteredActions: false,
            allowedActions: [
                {
                    moduleName: 'nodics.process',
                    operation: 'noop',
                    description: 'Safe no-op adapter for framework smoke tests and beginner demos'
                }
            ]
        },
        designer: {
            enabled: false,
            provider: 'NODICS_NATIVE_GRAPH',
            persistDrafts: false,
            allowBpmnImport: false,
            allowBpmnExport: false,
            maximumNodesPerDefinition: 250,
            maximumTransitionsPerDefinition: 500
        }
    }
};
