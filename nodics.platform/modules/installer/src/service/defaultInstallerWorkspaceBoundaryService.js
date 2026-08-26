/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const configurationService = require('./defaultInstallerConfigurationService');

function installerError(code, message, statusCode) {
    const error = new Error(message);
    error.code = code;
    error.statusCode = statusCode || 400;
    return error;
}

function requestPayload(request) {
    return request && (
        request.payload ||
        request.body ||
        request.httpRequest && request.httpRequest.body
    ) || {};
}

function configuredAllowedRoots(config) {
    return (config.workspace && config.workspace.allowedRoots || [])
        .map(root => path.resolve(String(root)))
        .filter(Boolean);
}

function isSameOrInside(child, parent) {
    const relative = path.relative(parent, child);
    return relative === '' || Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function assertNotUnsafePath(workspaceRoot) {
    const home = path.resolve(os.homedir());
    const filesystemRoot = path.parse(workspaceRoot).root;
    if (workspaceRoot === filesystemRoot) {
        throw installerError('INSTALLER_WORKSPACE_ROOT_REJECTED',
            'Filesystem root is not a valid installer workspace');
    }
    if (workspaceRoot === home) {
        throw installerError('INSTALLER_WORKSPACE_HOME_REJECTED',
            'Home directory is not a valid installer workspace');
    }
    if (workspaceRoot.includes(`${path.sep}..${path.sep}`)) {
        throw installerError('INSTALLER_WORKSPACE_TRAVERSAL_REJECTED',
            'Workspace path traversal is not allowed');
    }
}

function assertAllowed(workspaceRoot, allowedRoots) {
    if (allowedRoots.length === 0) {
        throw installerError('INSTALLER_WORKSPACE_ALLOWLIST_REQUIRED',
            'Installer workspace roots must be configured before workspace APIs are used');
    }
    if (!allowedRoots.some(allowedRoot => isSameOrInside(workspaceRoot, allowedRoot))) {
        throw installerError('INSTALLER_WORKSPACE_NOT_ALLOWED',
            'Workspace path is outside configured installer allowed roots');
    }
}

function classifyWorkspace(workspaceRoot, config) {
    const basename = path.basename(workspaceRoot);
    const exists = fs.existsSync(workspaceRoot);
    const stat = exists ? fs.statSync(workspaceRoot) : null;
    const vendorRepositories = config.protectVendorRepositories || [];
    const protectedVendorRoot = vendorRepositories.includes(basename);
    return {
        workspaceName: basename,
        exists,
        directory: Boolean(stat && stat.isDirectory()),
        protectedVendorRoot,
        markers: {
            workspaceManifest: fs.existsSync(path.join(workspaceRoot, config.workspaceManifestName)),
            installerIdentity: fs.existsSync(path.join(workspaceRoot, config.workspaceIdentityName)),
            installerLock: fs.existsSync(path.join(workspaceRoot, config.workspaceLockName)),
            evidenceDirectory: fs.existsSync(path.join(workspaceRoot, config.evidenceDirectoryName))
        }
    };
}

/**
 * @module installer/service/DefaultInstallerWorkspaceBoundaryService
 * @description Normalizes and constrains local workspace paths for read-only Application Builder APIs.
 * @layer service
 * @owner installer
 * @override Do not relax allowlist or vendor-root protections without explicit security review.
 */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },

    resolveWorkspace: function (request, options) {
        const config = configurationService.getApplicationBuilderConfig(options || {});
        const payload = requestPayload(request);
        const suppliedRoot = payload.workspaceRoot || request && request.workspaceRoot;

        if (!config.workspace.allowRequestWorkspaceRoot) {
            throw installerError('INSTALLER_WORKSPACE_REQUEST_ROOT_DISABLED',
                'Request supplied workspace roots are disabled by configuration');
        }
        if (!suppliedRoot || typeof suppliedRoot !== 'string') {
            throw installerError('INSTALLER_WORKSPACE_REQUIRED',
                'workspaceRoot is required for this installer operation');
        }
        if (suppliedRoot.includes('..')) {
            throw installerError('INSTALLER_WORKSPACE_TRAVERSAL_REJECTED',
                'Workspace path traversal is not allowed');
        }

        const workspaceRoot = path.resolve(suppliedRoot);
        assertNotUnsafePath(workspaceRoot);
        const allowedRoots = configuredAllowedRoots(config);
        assertAllowed(workspaceRoot, allowedRoots);

        const classification = classifyWorkspace(workspaceRoot, config);
        if (classification.protectedVendorRoot) {
            throw installerError('INSTALLER_VENDOR_ROOT_PROTECTED',
                'Vendor-owned Nodics repositories are not customer workspaces');
        }

        return {
            workspaceRoot,
            allowedRoots,
            config,
            classification
        };
    },

    classifyWorkspace
};
