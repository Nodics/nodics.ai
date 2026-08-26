/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const operationCatalog = [
    {
        code: 'workspace-status',
        label: 'Workspace Status',
        intent: 'READ',
        mutating: false,
        permission: 'installer.workspace.view',
        source: 'workspace manifest, setup evidence, topology status'
    },
    {
        code: 'workspace-inventory',
        label: 'Workspace Inventory',
        intent: 'READ',
        mutating: false,
        permission: 'installer.workspace.view',
        source: 'installer identity and lock metadata'
    },
    {
        code: 'preflight',
        label: 'Preflight',
        intent: 'VERIFY',
        mutating: false,
        permission: 'installer.workspace.view',
        source: 'local prerequisite and port checks'
    },
    {
        code: 'support-bundle',
        label: 'Support Bundle',
        intent: 'EXPORT',
        mutating: true,
        permission: 'installer.workspace.support',
        source: 'sanitized local evidence and logs'
    },
    {
        code: 'repair',
        label: 'Repair Metadata',
        intent: 'REPAIR',
        mutating: true,
        permission: 'installer.workspace.operate',
        source: 'installer-owned generated metadata only'
    }
];

/**
 * @module installer/service/DefaultInstallerOperationCatalogService
 * @description Publishes safe Application Builder operation metadata for installed Nodics runtimes.
 * @layer service
 * @owner installer
 * @override Project modules may extend operation policy, but runtime execution must preserve permission, evidence, and vendor-boundary checks.
 */
module.exports = {
    /** Initializes the operation catalog service. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Completes operation catalog service startup. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /** Returns client-safe operation metadata for future Axis presentation. */
    listOperations: function () {
        return JSON.parse(JSON.stringify(operationCatalog));
    },

    /** Returns whether backend API execution is enabled for this installed runtime. */
    apiOperationsEnabled: function () {
        return false;
    }
};
