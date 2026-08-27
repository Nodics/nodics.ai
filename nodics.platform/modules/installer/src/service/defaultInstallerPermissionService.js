/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const CURRENT_READ_ONLY_PERMISSIONS = Object.freeze([
    'installer.workspace.view',
    'installer.workspace.plan',
    'installer.workspace.evidence.read'
]);

const RESERVED_MUTATING_PERMISSIONS = Object.freeze([
    'installer.workspace.operate',
    'installer.workspace.support',
    'installer.workspace.expand'
]);

/**
 * @module installer/service/DefaultInstallerPermissionService
 * @description Documents and enforces the current read-only installer permission model before facade operations run.
 * @layer service
 * @owner installer
 * @override Profile remains the identity and permission authority; this guard only fails closed for direct service/facade invocation.
 */
module.exports = {
    CURRENT_READ_ONLY_PERMISSIONS,
    RESERVED_MUTATING_PERMISSIONS,

    /** Initializes the permission service lifecycle boundary. */
    init: function () { return Promise.resolve(true); },
    /** Completes post-initialization for the permission service lifecycle boundary. */
    postInit: function () { return Promise.resolve(true); },

    /** Builds a permission error with the installer API status code. */
    installerError: function (code, message) {
        const error = new Error(message);
        error.code = code;
        error.statusCode = 403;
        return error;
    },

    /** Collects permissions from all supported request principal envelopes. */
    collectPermissions: function (request) {
        const candidates = [
            request && request.permissions,
            request && request.authData && request.authData.permissions,
            request && request.principal && request.principal.permissions,
            request && request.user && request.user.permissions,
            request && request.session && request.session.permissions
        ];
        return new Set(candidates.flatMap(value => Array.isArray(value) ? value : []));
    },

    /** Resolves the token type from direct and Axis-authenticated request envelopes. */
    tokenType: function (request) {
        return request && (
            request.authTokenType ||
            request.tokenType ||
            request.authData && request.authData.tokenType ||
            request.authData && request.authData.authTokenType
        );
    },

    /**
     * Lists the installer permission model exposed to Axis and diagnostics.
     * @returns {Object} Current read-only and reserved mutating permission metadata.
     */
    listPermissions: function () {
        return {
            currentReadOnly: CURRENT_READ_ONLY_PERMISSIONS.slice(),
            reservedMutating: RESERVED_MUTATING_PERMISSIONS.slice(),
            identityAuthority: 'profile',
            humanAxisTokenType: 'access',
            serviceTokensForHumanAxis: false
        };
    },

    /**
     * Fails closed when a request lacks the required installer permission.
     * @param {Object} request Installer request envelope.
     * @param {string} permission Required permission code.
     * @returns {boolean} True when permission is present.
     */
    assertPermission: function (request, permission) {
        if (!CURRENT_READ_ONLY_PERMISSIONS.includes(permission)) {
            throw this.installerError('INSTALLER_PERMISSION_UNDEFINED',
                `Installer permission ${permission} is not available on the current read-only installer surface`);
        }
        if (['service', 'internal'].includes(this.tokenType(request))) {
            throw this.installerError('INSTALLER_SERVICE_TOKEN_REJECTED',
                'Service and internal tokens are not accepted for human Axis installer operations');
        }
        if (!this.collectPermissions(request).has(permission)) {
            throw this.installerError('INSTALLER_PERMISSION_DENIED',
                `Missing installer permission ${permission}`);
        }
        return true;
    }
};
