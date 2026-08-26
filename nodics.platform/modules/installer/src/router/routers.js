/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const contracts = require('../schemas/apiContracts');

const response = description => ({
    '200': {
        description,
        content: {
            'application/json': {
                schema: contracts.responseEnvelope
            }
        }
    }
});

const securedRead = {
    secured: true,
    authTokenTypes: ['access'],
    accessGroups: ['employeeUserGroup'],
    apiExposure: 'installerManagement',
    controller: 'DefaultInstallerApplicationBuilderController'
};

/**
 * @module installer/router/routers
 * @description Declares secured read-only Application Builder routes for installed Nodics runtimes.
 * @layer router
 * @owner installer
 * @override Do not add mutating routes until command execution, audit, idempotency, and rollback contracts exist.
 */
module.exports = {
    installer: {
        discovery: {
            info: Object.assign({}, securedRead, {
                permission: 'installer.workspace.view',
                key: '/nodics/installer/v0/info',
                method: 'GET',
                operation: 'info',
                responses: response('Installer module metadata and bootstrap information')
            }),
            operations: Object.assign({}, securedRead, {
                permission: 'installer.workspace.view',
                key: '/nodics/installer/v0/operations',
                method: 'GET',
                operation: 'operations',
                responses: response('Installer operation catalog')
            })
        },
        workspace: {
            status: Object.assign({}, securedRead, {
                permission: 'installer.workspace.view',
                key: '/nodics/installer/v0/workspace/status',
                method: 'POST',
                operation: 'workspaceStatus',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.workspaceRequest } } },
                responses: response('Read-only workspace status')
            }),
            inventory: Object.assign({}, securedRead, {
                permission: 'installer.workspace.view',
                key: '/nodics/installer/v0/workspace/inventory',
                method: 'POST',
                operation: 'workspaceInventory',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.workspaceRequest } } },
                responses: response('Read-only workspace repository inventory')
            }),
            preflight: Object.assign({}, securedRead, {
                permission: 'installer.workspace.view',
                key: '/nodics/installer/v0/workspace/preflight',
                method: 'POST',
                operation: 'workspacePreflight',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.workspaceRequest } } },
                responses: response('Read-only workspace prerequisite and port readiness')
            })
        },
        setup: {
            plan: Object.assign({}, securedRead, {
                permission: 'installer.workspace.plan',
                key: '/nodics/installer/v0/setup/plan',
                method: 'POST',
                operation: 'setupPlan',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.setupPlanRequest } } },
                responses: response('Dry-run customer setup plan')
            })
        },
        evidence: {
            read: Object.assign({}, securedRead, {
                permission: 'installer.workspace.evidence.read',
                key: '/nodics/installer/v0/evidence/read',
                method: 'POST',
                operation: 'evidenceRead',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.evidenceReadRequest } } },
                responses: response('Redacted installer evidence projection')
            })
        }
    }
};
