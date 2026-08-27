/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const contracts = require('../schemas/apiContracts');

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
                responses: { '200': { description: 'Installer module metadata and bootstrap information', content: { 'application/json': { schema: contracts.responseEnvelope } } } }
            }),
            operations: Object.assign({}, securedRead, {
                permission: 'installer.workspace.view',
                key: '/nodics/installer/v0/operations',
                method: 'GET',
                operation: 'operations',
                responses: { '200': { description: 'Installer operation catalog', content: { 'application/json': { schema: contracts.responseEnvelope } } } }
            })
        },
        workspace: {
            status: Object.assign({}, securedRead, {
                permission: 'installer.workspace.view',
                key: '/nodics/installer/v0/workspace/status',
                method: 'POST',
                operation: 'workspaceStatus',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.workspaceRequest } } },
                responses: { '200': { description: 'Read-only workspace status', content: { 'application/json': { schema: contracts.responseEnvelope } } } }
            }),
            inventory: Object.assign({}, securedRead, {
                permission: 'installer.workspace.view',
                key: '/nodics/installer/v0/workspace/inventory',
                method: 'POST',
                operation: 'workspaceInventory',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.workspaceRequest } } },
                responses: { '200': { description: 'Read-only workspace repository inventory', content: { 'application/json': { schema: contracts.responseEnvelope } } } }
            }),
            preflight: Object.assign({}, securedRead, {
                permission: 'installer.workspace.view',
                key: '/nodics/installer/v0/workspace/preflight',
                method: 'POST',
                operation: 'workspacePreflight',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.workspaceRequest } } },
                responses: { '200': { description: 'Read-only workspace prerequisite and port readiness', content: { 'application/json': { schema: contracts.responseEnvelope } } } }
            })
        },
        setup: {
            plan: Object.assign({}, securedRead, {
                permission: 'installer.workspace.plan',
                key: '/nodics/installer/v0/setup/plan',
                method: 'POST',
                operation: 'setupPlan',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.setupPlanRequest } } },
                responses: { '200': { description: 'Dry-run customer setup plan', content: { 'application/json': { schema: contracts.responseEnvelope } } } }
            })
        },
        evidence: {
            read: Object.assign({}, securedRead, {
                permission: 'installer.workspace.evidence.read',
                key: '/nodics/installer/v0/evidence/read',
                method: 'POST',
                operation: 'evidenceRead',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.evidenceReadRequest } } },
                responses: { '200': { description: 'Redacted installer evidence projection', content: { 'application/json': { schema: contracts.responseEnvelope } } } }
            })
        }
    }
};
