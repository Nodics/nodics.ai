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

const phaseOneFields = {
    phase: 'PHASE_1_READ_ONLY',
    state: 'AVAILABLE',
    mutating: false,
    requiresIdempotencyKey: false
};

const futureMutatingFields = {
    phase: 'FUTURE_MUTATING',
    state: 'FUTURE',
    mutating: true,
    method: 'POST',
    requiresWorkspace: true,
    requiresIdempotencyKey: true
};

const operationCatalog = validator.sortOperations([
    {
        ...baseFields,
        ...phaseOneFields,
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
        ...phaseOneFields,
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
        ...phaseOneFields,
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
        ...phaseOneFields,
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
        ...phaseOneFields,
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
        ...phaseOneFields,
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
        ...phaseOneFields,
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
        ...futureMutatingFields,
        code: 'lifecycle.acceptance',
        label: 'Run Acceptance',
        group: 'LIFECYCLE',
        intent: 'LIFECYCLE',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/lifecycle/acceptance',
        summary: 'Future governed execution of local acceptance checks.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...futureMutatingFields,
        code: 'lifecycle.initialize',
        label: 'Initialize Workspace',
        group: 'LIFECYCLE',
        intent: 'LIFECYCLE',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/lifecycle/initialize',
        summary: 'Future governed initialization of an installed local workspace.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...futureMutatingFields,
        code: 'lifecycle.restart',
        label: 'Restart Workspace',
        group: 'LIFECYCLE',
        intent: 'LIFECYCLE',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/lifecycle/restart',
        summary: 'Future governed restart of local Nodics services.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...futureMutatingFields,
        code: 'lifecycle.start',
        label: 'Start Workspace',
        group: 'LIFECYCLE',
        intent: 'LIFECYCLE',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/lifecycle/start',
        summary: 'Future governed startup of local Nodics services.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...futureMutatingFields,
        code: 'lifecycle.stop',
        label: 'Stop Workspace',
        group: 'LIFECYCLE',
        intent: 'LIFECYCLE',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/lifecycle/stop',
        summary: 'Future governed shutdown of local Nodics services.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...futureMutatingFields,
        code: 'expansion.environment.add',
        label: 'Add Environment',
        group: 'EXPANSION',
        intent: 'EXPAND',
        permission: 'installer.workspace.expand',
        route: '/nodics/installer/v0/expansion/environment',
        summary: 'Future governed addition of a customer environment.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...futureMutatingFields,
        code: 'expansion.module.add',
        label: 'Add Module',
        group: 'EXPANSION',
        intent: 'EXPAND',
        permission: 'installer.workspace.expand',
        route: '/nodics/installer/v0/expansion/module',
        summary: 'Future governed addition of a customer module.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...futureMutatingFields,
        code: 'expansion.site.add',
        label: 'Add Site',
        group: 'EXPANSION',
        intent: 'EXPAND',
        permission: 'installer.workspace.expand',
        route: '/nodics/installer/v0/expansion/site',
        summary: 'Future governed addition of another accelerator site.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...futureMutatingFields,
        code: 'maintenance.backup',
        label: 'Backup Workspace',
        group: 'MAINTENANCE',
        intent: 'EXPORT',
        permission: 'installer.workspace.support',
        route: '/nodics/installer/v0/maintenance/backup',
        summary: 'Future governed creation of a local workspace backup.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...futureMutatingFields,
        code: 'maintenance.cleanup',
        label: 'Cleanup Workspace',
        group: 'MAINTENANCE',
        intent: 'REPAIR',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/maintenance/cleanup',
        summary: 'Future governed cleanup of generated local workspace artifacts.',
        riskLevel: 'CRITICAL'
    },
    {
        ...baseFields,
        ...futureMutatingFields,
        code: 'maintenance.repair',
        label: 'Repair Workspace',
        group: 'MAINTENANCE',
        intent: 'REPAIR',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/maintenance/repair',
        summary: 'Future governed repair of installer-owned generated metadata.',
        riskLevel: 'HIGH'
    },
    {
        ...baseFields,
        ...futureMutatingFields,
        code: 'maintenance.rollback',
        label: 'Rollback Workspace',
        group: 'MAINTENANCE',
        intent: 'REPAIR',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/maintenance/rollback',
        summary: 'Future governed rollback to a known local workspace state.',
        riskLevel: 'CRITICAL'
    },
    {
        ...baseFields,
        ...futureMutatingFields,
        code: 'maintenance.supportBundle',
        label: 'Support Bundle',
        group: 'MAINTENANCE',
        intent: 'EXPORT',
        permission: 'installer.workspace.support',
        route: '/nodics/installer/v0/maintenance/support-bundle',
        summary: 'Future governed creation of a sanitized support bundle.',
        riskLevel: 'MEDIUM'
    },
    {
        ...baseFields,
        ...futureMutatingFields,
        code: 'maintenance.updateVendors',
        label: 'Update Vendors',
        group: 'MAINTENANCE',
        intent: 'EXPAND',
        permission: 'installer.workspace.operate',
        route: '/nodics/installer/v0/maintenance/update-vendors',
        summary: 'Future governed update of vendor-owned Nodics repositories.',
        riskLevel: 'CRITICAL'
    }
]).map(validator.normalizeOperation);

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

    /** Returns client-safe operation metadata for future Axis presentation. */
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
