/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const validator = require('./defaultInstallerOperationCatalogValidationService');

const baseFields = {
    ownerModule: 'installer',
    sourceOfTruth: validator.CONTRACT_SOURCE
};

const readOnlyFields = {
    phase: 'READ_ONLY_DISCOVERY',
    state: 'AVAILABLE',
    mutating: false,
    requiresIdempotencyKey: false
};

const reservedMutatingFields = {
    phase: 'RESERVED_MUTATING',
    state: 'RESERVED',
    mutating: true,
    method: 'POST',
    requiresWorkspace: true,
    requiresIdempotencyKey: true
};

const operationCatalog = validator.sortOperations([
    {
        ...baseFields,
        ...readOnlyFields,
        code: 'installer.info',
        label: 'Installer Info',
        group: 'DISCOVERY',
        intent: 'READ',
        permission: 'installer.workspace.view',
        route: '/nodics/installer/v0/info',
        method: 'GET',
        summary: 'Read installer module metadata, bootstrap command, and feature flags.',
        riskLevel: 'LOW',
        requiresWorkspace: false
    },
    {
        ...baseFields,
        ...readOnlyFields,
        code: 'installer.operations',
        label: 'Installer Operations',
        group: 'DISCOVERY',
        intent: 'READ',
        permission: 'installer.workspace.view',
        route: '/nodics/installer/v0/operations',
        method: 'GET',
        summary: 'Read the deterministic installer operation catalog.',
        riskLevel: 'LOW',
        requiresWorkspace: false
    },
    {
        ...baseFields,
        ...readOnlyFields,
        code: 'workspace.inventory',
        label: 'Workspace Inventory',
        group: 'WORKSPACE_READINESS',
        intent: 'READ',
        permission: 'installer.workspace.view',
        route: '/nodics/installer/v0/workspace/inventory',
        method: 'POST',
        summary: 'Inspect expected Nodics repositories and customer project locations.',
        riskLevel: 'LOW',
        requiresWorkspace: true
    },
    {
        ...baseFields,
        ...readOnlyFields,
        code: 'workspace.preflight',
        label: 'Workspace Preflight',
        group: 'WORKSPACE_READINESS',
        intent: 'VERIFY',
        permission: 'installer.workspace.view',
        route: '/nodics/installer/v0/workspace/preflight',
        method: 'POST',
        summary: 'Inspect prerequisite software, ports, and local environment readiness.',
        riskLevel: 'LOW',
        requiresWorkspace: true
    },
    {
        ...baseFields,
        ...readOnlyFields,
        code: 'workspace.status',
        label: 'Workspace Status',
        group: 'WORKSPACE_READINESS',
        intent: 'READ',
        permission: 'installer.workspace.view',
        route: '/nodics/installer/v0/workspace/status',
        method: 'POST',
        summary: 'Inspect setup evidence, topology readiness, and known workspace markers.',
        riskLevel: 'LOW',
        requiresWorkspace: true
    },
    {
        ...baseFields,
        ...readOnlyFields,
        code: 'setup.plan',
        label: 'Setup Plan',
        group: 'SETUP_PLANNING',
        intent: 'PLAN',
        permission: 'installer.workspace.plan',
        route: '/nodics/installer/v0/setup/plan',
        method: 'POST',
        summary: 'Prepare a dry-run setup plan for the requested customer application and accelerator.',
        riskLevel: 'LOW',
        requiresWorkspace: true
    },
    {
        ...baseFields,
        ...readOnlyFields,
        code: 'evidence.read',
        label: 'Evidence Read',
        group: 'EVIDENCE_READ',
        intent: 'EXPORT',
        permission: 'installer.workspace.evidence.read',
        route: '/nodics/installer/v0/evidence/read',
        method: 'POST',
        summary: 'Read sanitized installer evidence, diagnostics, and troubleshooting hints.',
        riskLevel: 'MEDIUM',
        requiresWorkspace: true
    },
    {
        ...baseFields,
        ...reservedMutatingFields,
        code: 'lifecycle.acceptance',
        label: 'Run Acceptance',
        group: 'LIFECYCLE',
        intent: 'LIFECYCLE',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/lifecycle/acceptance',
        summary: 'Reserved governed execution of local acceptance checks.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...reservedMutatingFields,
        code: 'lifecycle.initialize',
        label: 'Initialize Workspace',
        group: 'LIFECYCLE',
        intent: 'LIFECYCLE',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/lifecycle/initialize',
        summary: 'Reserved governed initialization of an installed local workspace.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...reservedMutatingFields,
        code: 'lifecycle.restart',
        label: 'Restart Workspace',
        group: 'LIFECYCLE',
        intent: 'LIFECYCLE',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/lifecycle/restart',
        summary: 'Reserved governed restart of local Nodics services.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...reservedMutatingFields,
        code: 'lifecycle.start',
        label: 'Start Workspace',
        group: 'LIFECYCLE',
        intent: 'LIFECYCLE',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/lifecycle/start',
        summary: 'Reserved governed startup of local Nodics services.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...reservedMutatingFields,
        code: 'lifecycle.stop',
        label: 'Stop Workspace',
        group: 'LIFECYCLE',
        intent: 'LIFECYCLE',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/lifecycle/stop',
        summary: 'Reserved governed shutdown of local Nodics services.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...reservedMutatingFields,
        code: 'expansion.environment.add',
        label: 'Add Environment',
        group: 'EXPANSION',
        intent: 'EXPAND',
        permission: 'installer.workspace.expand',
        route: '/nodics/installer/v0/expansion/environment',
        summary: 'Reserved governed addition of a customer environment.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...reservedMutatingFields,
        code: 'expansion.module.add',
        label: 'Add Module',
        group: 'EXPANSION',
        intent: 'EXPAND',
        permission: 'installer.workspace.expand',
        route: '/nodics/installer/v0/expansion/module',
        summary: 'Reserved governed addition of a customer module.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...reservedMutatingFields,
        code: 'expansion.site.add',
        label: 'Add Site',
        group: 'EXPANSION',
        intent: 'EXPAND',
        permission: 'installer.workspace.expand',
        route: '/nodics/installer/v0/expansion/site',
        summary: 'Reserved governed addition of another accelerator site.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...reservedMutatingFields,
        code: 'maintenance.backup',
        label: 'Backup Workspace',
        group: 'MAINTENANCE',
        intent: 'EXPORT',
        permission: 'installer.workspace.support',
        route: '/nodics/installer/v0/maintenance/backup',
        summary: 'Reserved governed creation of a local workspace backup.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...reservedMutatingFields,
        code: 'maintenance.cleanup',
        label: 'Cleanup Workspace',
        group: 'MAINTENANCE',
        intent: 'REPAIR',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/maintenance/cleanup',
        summary: 'Reserved governed cleanup of generated local workspace artifacts.',
        riskLevel: 'CRITICAL'
    },
    {
        ...baseFields,
        ...reservedMutatingFields,
        code: 'maintenance.repair',
        label: 'Repair Workspace',
        group: 'MAINTENANCE',
        intent: 'REPAIR',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/maintenance/repair',
        summary: 'Reserved governed repair of installer-owned generated metadata.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...reservedMutatingFields,
        code: 'maintenance.rollback',
        label: 'Rollback Workspace',
        group: 'MAINTENANCE',
        intent: 'REPAIR',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/maintenance/rollback',
        summary: 'Reserved governed rollback to a known local workspace state.',
        riskLevel: 'CRITICAL'
    },
    {
        ...baseFields,
        ...reservedMutatingFields,
        code: 'maintenance.supportBundle',
        label: 'Support Bundle',
        group: 'MAINTENANCE',
        intent: 'EXPORT',
        permission: 'installer.workspace.support',
        route: '/nodics/installer/v0/maintenance/support-bundle',
        summary: 'Reserved governed creation of a sanitized support bundle.',
        riskLevel: 'MEDIUM'
    },
    {
        ...baseFields,
        ...reservedMutatingFields,
        code: 'maintenance.updateVendors',
        label: 'Update Vendors',
        group: 'MAINTENANCE',
        intent: 'EXPAND',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/maintenance/update-vendors',
        summary: 'Reserved governed update of vendor-owned Nodics repositories.',
        riskLevel: 'CRITICAL'
    }
]).map(operation => validator.normalizeOperation(operation));

validator.validateOperationCatalog(operationCatalog);

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

    /** Returns client-safe operation metadata for Axis presentation. */
    listOperations: function () {
        return JSON.parse(JSON.stringify(operationCatalog));
    },

    /** Validates an installer operation definition against the frozen operation model. */
    validateOperation: function (operation) {
        return validator.validateOperation(operation);
    },

    /** Returns a normalized installer operation with executable derived from state and mutation rules. */
    normalizeOperation: function (operation) {
        return validator.normalizeOperation(operation);
    },

    /** Returns whether backend API execution is enabled for this installed runtime. */
    apiOperationsEnabled: function () {
        return true;
    }
};
