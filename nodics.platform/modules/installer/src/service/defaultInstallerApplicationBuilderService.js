/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const configurationService = require('./defaultInstallerConfigurationService');
const operationCatalogService = require('./defaultInstallerOperationCatalogService');
const permissionService = require('./defaultInstallerPermissionService');
const redactionService = require('./defaultInstallerRedactionService');
const responseService = require('./defaultInstallerResponseService');
const workspaceBoundaryService = require('./defaultInstallerWorkspaceBoundaryService');

const ACCELERATOR_FAMILIES = Object.freeze([
    'apparel',
    'electronics',
    'telco'
]);

function payload(request) {
    return request && (
        request.payload ||
        request.body ||
        request.httpRequest && request.httpRequest.body
    ) || {};
}

function assertOperationPermission(request, operationCode) {
    const operation = operationCatalogService.listOperations()
        .find(candidate => candidate.code === operationCode);
    if (!operation) {
        const error = new Error(`Unknown installer operation ${operationCode}`);
        error.code = 'INSTALLER_OPERATION_UNKNOWN';
        throw error;
    }
    permissionService.assertPermission(request, operation.permission);
    return operation;
}

function workspaceProjection(resolved) {
    return {
        workspaceName: resolved.classification.workspaceName,
        exists: resolved.classification.exists,
        directory: resolved.classification.directory,
        protectedVendorRoot: resolved.classification.protectedVendorRoot,
        markers: resolved.classification.markers
    };
}

function safeDirectoryInventory(workspaceRoot, config) {
    if (!fs.existsSync(workspaceRoot) || !fs.statSync(workspaceRoot).isDirectory()) {
        return [];
    }
    return fs.readdirSync(workspaceRoot, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .slice(0, 100)
        .map(entry => {
            const repositoryRoot = path.join(workspaceRoot, entry.name);
            return {
                name: entry.name,
                vendorProtected: (config.protectVendorRepositories || []).includes(entry.name),
                gitRepository: fs.existsSync(path.join(repositoryRoot, '.git')),
                packageManifest: fs.existsSync(path.join(repositoryRoot, 'package.json')),
                nodicsModule: fs.existsSync(path.join(repositoryRoot, 'nodics.js')) ||
                    fs.existsSync(path.join(repositoryRoot, 'package.json'))
            };
        });
}

function validateApplicationName(name) {
    return typeof name === 'string' && /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(name);
}

function requestedAccelerator(request) {
    return payload(request).accelerator || payload(request).applicationType || payload(request).siteType || 'apparel';
}

function evidenceCandidates(resolved, request) {
    const requested = payload(request).evidenceFile;
    const allowed = resolved.config.workspace.allowedEvidenceFiles || [];
    if (requested) {
        if (!allowed.includes(requested)) {
            const error = new Error('Requested evidence file is not allowlisted');
            error.code = 'INSTALLER_EVIDENCE_FILE_NOT_ALLOWED';
            throw error;
        }
        return [requested];
    }
    return allowed;
}

function readEvidenceFiles(resolved, request) {
    const files = [];
    const maxBytes = resolved.config.workspace.maxEvidenceBytes || 65536;
    evidenceCandidates(resolved, request).forEach(fileName => {
        const root = fileName.startsWith('.nodics-') ?
            resolved.workspaceRoot :
            path.join(resolved.workspaceRoot, resolved.config.evidenceDirectoryName);
        const absolutePath = path.resolve(root, fileName);
        if (!absolutePath.startsWith(path.resolve(root))) {
            return;
        }
        if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
            return;
        }
        const raw = fs.readFileSync(absolutePath, 'utf8');
        const redacted = redactionService.redactText(raw, maxBytes);
        files.push({
            name: fileName,
            bytes: Buffer.byteLength(raw, 'utf8'),
            redacted: redacted.redactions,
            content: redacted.value
        });
    });
    return files;
}

/**
 * @module installer/service/DefaultInstallerApplicationBuilderService
 * @description Implements Phase 1 read-only Application Builder operations for installed Nodics runtimes.
 * @layer service
 * @owner installer
 * @override Mutating setup, lifecycle, repair, backup, rollback, and update operations require a future governed contract.
 */
module.exports = {
    /** Initializes the service lifecycle boundary. */
    init: function () { return Promise.resolve(true); },
    /** Completes post-initialization for the service lifecycle boundary. */
    postInit: function () { return Promise.resolve(true); },

    /**
     * Returns installer Application Builder metadata and permission visibility.
     * @param {Object} request Installer request envelope.
     * @returns {Promise<Object>} Standard installer success response.
     */
    info: async function (request) {
        assertOperationPermission(request, 'installer.info');
        const config = configurationService.getApplicationBuilderConfig();
        return responseService.success(request, 'installer.info', {
            module: 'installer',
            apiOperationsEnabled: config.apiOperationsEnabled === true,
            mutatingOperationsEnabled: config.mutatingOperationsEnabled === true,
            standaloneBootstrap: {
                repository: config.standaloneBootstrapRepository,
                command: config.standaloneBootstrapCommand,
                latestVerifiedVersion: config.latestVerifiedStandaloneVersion
            },
            protectedVendorRepositories: (config.protectVendorRepositories || []).slice(),
            permissions: permissionService.listPermissions()
        });
    },

    /**
     * Lists safe Phase 1 operations exposed by the installer surface.
     * @param {Object} request Installer request envelope.
     * @returns {Promise<Object>} Standard installer success response.
     */
    operations: async function (request) {
        assertOperationPermission(request, 'installer.operations');
        return responseService.success(request, 'installer.operations', {
            operations: operationCatalogService.listOperations(),
            states: operationCatalogService.listOperations()
                .reduce((states, operation) => states.includes(operation.state) ? states : states.concat(operation.state), [])
        });
    },

    /**
     * Returns protected workspace status without mutating local files.
     * @param {Object} request Installer request envelope.
     * @returns {Promise<Object>} Standard installer success response.
     */
    workspaceStatus: async function (request) {
        assertOperationPermission(request, 'workspace.status');
        const resolved = workspaceBoundaryService.resolveWorkspace(request);
        return responseService.success(request, 'workspace.status', {
            workspace: workspaceProjection(resolved)
        });
    },

    /**
     * Returns a bounded repository inventory for an allowed workspace.
     * @param {Object} request Installer request envelope.
     * @returns {Promise<Object>} Standard installer success response.
     */
    workspaceInventory: async function (request) {
        assertOperationPermission(request, 'workspace.inventory');
        const resolved = workspaceBoundaryService.resolveWorkspace(request);
        return responseService.success(request, 'workspace.inventory', {
            workspace: workspaceProjection(resolved),
            repositories: safeDirectoryInventory(resolved.workspaceRoot, resolved.config)
        });
    },

    /**
     * Runs non-mutating preflight checks for an allowed workspace.
     * @param {Object} request Installer request envelope.
     * @returns {Promise<Object>} Standard installer success response.
     */
    workspacePreflight: async function (request) {
        assertOperationPermission(request, 'workspace.preflight');
        const resolved = workspaceBoundaryService.resolveWorkspace(request);
        const requestedPorts = Array.isArray(payload(request).ports) ? payload(request).ports : [];
        return responseService.success(request, 'workspace.preflight', {
            workspace: workspaceProjection(resolved),
            checks: [
                { code: 'node.runtime', status: 'PASS', observedVersion: process.versions.node },
                { code: 'workspace.exists', status: resolved.classification.exists ? 'PASS' : 'WARN' },
                { code: 'workspace.directory', status: resolved.classification.directory ? 'PASS' : 'WARN' }
            ],
            ports: requestedPorts.slice(0, 50).map(port => ({
                port,
                valid: Number.isInteger(Number(port)) && Number(port) > 0 && Number(port) <= 65535,
                bound: false
            }))
        });
    },

    /**
     * Produces a dry-run setup plan for a requested customer workspace.
     * @param {Object} request Installer request envelope.
     * @returns {Promise<Object>} Standard installer success response.
     */
    setupPlan: async function (request) {
        assertOperationPermission(request, 'setup.plan');
        const resolved = workspaceBoundaryService.resolveWorkspace(request);
        const requestBody = payload(request);
        const applicationName = requestBody.applicationName;
        const companySiteName = requestBody.companySiteName || requestBody.companyName;
        const accelerator = requestedAccelerator(request);
        const messages = [];

        if (!validateApplicationName(applicationName)) {
            messages.push({
                code: 'INSTALLER_APPLICATION_NAME_INVALID',
                message: 'applicationName must be lowercase and may contain letters, numbers, dots, or hyphens'
            });
        }
        if (companySiteName && !validateApplicationName(companySiteName)) {
            messages.push({
                code: 'INSTALLER_COMPANY_SITE_NAME_INVALID',
                message: 'companySiteName must be lowercase and may contain letters, numbers, dots, or hyphens'
            });
        }
        if (!ACCELERATOR_FAMILIES.includes(accelerator)) {
            messages.push({
                code: 'INSTALLER_ACCELERATOR_UNSUPPORTED',
                message: 'accelerator must be one of apparel, electronics, or telco'
            });
        }

        return responseService.success(request, 'setup.plan', {
            valid: messages.length === 0,
            workspace: workspaceProjection(resolved),
            requested: {
                applicationName,
                companySiteName,
                accelerator
            },
            plan: messages.length === 0 ? {
                vendorRepositories: ['nodics.ai', 'nodics.axis'],
                customerProjects: [companySiteName, applicationName].filter(Boolean),
                firstEnvironment: requestBody.environment || 'local',
                dryRunOnly: true
            } : null,
            messages
        }, messages.length ? { warning: true } : {});
    },

    /**
     * Reads allowlisted evidence files with configured redaction.
     * @param {Object} request Installer request envelope.
     * @returns {Promise<Object>} Standard installer success response.
     */
    evidenceRead: async function (request) {
        assertOperationPermission(request, 'evidence.read');
        const resolved = workspaceBoundaryService.resolveWorkspace(request);
        const evidence = readEvidenceFiles(resolved, request);
        return responseService.success(request, 'evidence.read', {
            workspace: workspaceProjection(resolved),
            evidence
        }, evidence.length === 0 ? { warning: true, reason: 'No allowlisted evidence files found' } : {},
        evidence.flatMap(file => file.redacted));
    }
};
