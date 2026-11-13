/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

const CURRENT_READ_ONLY_PERMISSIONS = Object.freeze([
  "installer.workspace.view",
  "installer.workspace.plan",
  "installer.workspace.evidence.read",
]);

const RESERVED_MUTATING_PERMISSIONS = Object.freeze([
  "installer.workspace.operate",
  "installer.workspace.support",
  "installer.workspace.expand",
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
  init: function () {
    return Promise.resolve(true);
  },
  /** Completes post-initialization for the permission service lifecycle boundary. */
  postInit: function () {
    return Promise.resolve(true);
  },

  /** Builds a permission error with the installer API status code. */
  installerError: function (code, message) {
    const error = new Error(message);
    error.code = code;
    error.statusCode = 403;
    return error;
  },

  /**
   * Lists the installer permission model exposed to Axis and diagnostics.
   * @returns {Object} Current read-only and reserved mutating permission metadata.
   */
  listPermissions: function () {
    return {
      currentReadOnly: CURRENT_READ_ONLY_PERMISSIONS.slice(),
      reservedMutating: RESERVED_MUTATING_PERMISSIONS.slice(),
      identityAuthority: "profile",
      humanAxisTokenType: "access",
      serviceTokensForHumanAxis: false,
    };
  },

  /**
   * Fails closed when a request lacks the required installer permission.
   * @param {Object} request Installer request envelope.
   * @param {string} permission Required permission code.
   * @returns {boolean} True when permission is present.
   */
  assertPermission: function (request, permission) {
    if (!CURRENT_READ_ONLY_PERMISSIONS.includes(permission) && permission !== "installer.workspace.build") {
      throw this.installerError(
        "INSTALLER_PERMISSION_UNDEFINED",
        `Installer permission ${permission} is not available on the current read-only installer surface`,
      );
    }
    const auth = request && request.authData;
    const authority =
      global.SERVICE && SERVICE.DefaultSecuredRequestPipelineService;
    if (
      !auth ||
      auth.tokenType !== "access" ||
      auth.principalType !== "human" ||
      auth.isSystem ||
      auth.runtimeScope
    ) {
      throw this.installerError(
        "INSTALLER_SERVICE_TOKEN_REJECTED",
        "A verified human employee session is required",
      );
    }
    if (!authority || typeof authority.isPermissionGranted !== "function") {
      const error = this.installerError(
        "INSTALLER_AUTHORITY_UNAVAILABLE",
        "Authorization is unavailable",
      );
      error.statusCode = 503;
      throw error;
    }
    if (
      !authority.isPermissionGranted(
        permission,
        authority.getGrantedPermissions(request),
        authority.getRouteActionAuthorizationConfig(),
      )
    ) {
      throw this.installerError(
        "INSTALLER_PERMISSION_DENIED",
        "The current employee cannot use this operation",
      );
    }
    return true;
  },
};
