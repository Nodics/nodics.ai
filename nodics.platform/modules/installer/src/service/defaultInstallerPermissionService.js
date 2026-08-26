/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const PHASE_ONE_PERMISSIONS = Object.freeze([
    'installer.workspace.view',
    'installer.workspace.plan',
    'installer.workspace.evidence.read'
]);

const FUTURE_PERMISSIONS = Object.freeze([
    'installer.workspace.operate',
    'installer.workspace.support',
    'installer.workspace.expand'
]);

function installerError(code, message) {
    const error = new Error(message);
    error.code = code;
    error.statusCode = 403;
    return error;
}

function collectPermissions(request) {
    const candidates = [
        request && request.permissions,
        request && request.authData && request.authData.permissions,
        request && request.principal && request.principal.permissions,
        request && request.user && request.user.permissions,
        request && request.session && request.session.permissions
    ];
    return new Set(candidates.flatMap(value => Array.isArray(value) ? value : []));
}

function tokenType(request) {
    return request && (
        request.authTokenType ||
        request.tokenType ||
        request.authData && request.authData.tokenType ||
        request.authData && request.authData.authTokenType
    );
}

/**
 * @module installer/service/DefaultInstallerPermissionService
 * @description Documents and enforces the Phase 1 installer permission model before facade operations run.
 * @layer service
 * @owner installer
 * @override Profile remains the identity and permission authority; this guard only fails closed for direct service/facade invocation.
 */
module.exports = {
    PHASE_ONE_PERMISSIONS,
    FUTURE_PERMISSIONS,

    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },

    listPermissions: function () {
        return {
            phaseOne: PHASE_ONE_PERMISSIONS.slice(),
            future: FUTURE_PERMISSIONS.slice(),
            identityAuthority: 'profile',
            humanAxisTokenType: 'access',
            serviceTokensForHumanAxis: false
        };
    },

    assertPermission: function (request, permission) {
        if (!PHASE_ONE_PERMISSIONS.includes(permission)) {
            throw installerError('INSTALLER_PERMISSION_UNDEFINED',
                `Installer permission ${permission} is not available in Phase 1`);
        }
        if (['service', 'internal'].includes(tokenType(request))) {
            throw installerError('INSTALLER_SERVICE_TOKEN_REJECTED',
                'Service and internal tokens are not accepted for human Axis installer operations');
        }
        if (!collectPermissions(request).has(permission)) {
            throw installerError('INSTALLER_PERMISSION_DENIED',
                `Missing installer permission ${permission}`);
        }
        return true;
    }
};
