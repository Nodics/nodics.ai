/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

const statusDefinitions = require("../utils/statusDefinitions");
const CONTRACT_VERSION = "installer-api-scope/v0";

/**
 * @module installer/service/DefaultInstallerResponseService
 * @description Builds the common installer API response envelope.
 * @layer service
 * @owner installer
 * @override Preserve low-disclosure messages and the contract envelope shape for all installer APIs.
 */
module.exports = {
  CONTRACT_VERSION,
  /** Initializes the response service lifecycle boundary. */
  init: function () {
    return Promise.resolve(true);
  },
  /** Completes post-initialization for the response service lifecycle boundary. */
  postInit: function () {
    return Promise.resolve(true);
  },

  /** Resolves a stable request identifier from supported request envelopes. */
  requestId: function (request) {
    return (
      (request &&
        (request.requestId ||
          request.correlationId ||
          (request.headers &&
            (request.headers["x-request-id"] ||
              request.headers["x-correlation-id"])) ||
          (request.httpRequest &&
            request.httpRequest.headers &&
            (request.httpRequest.headers["x-request-id"] ||
              request.httpRequest.headers["x-correlation-id"])))) ||
      "local-installer-request"
    );
  },

  /** Converts internal errors into low-disclosure installer API messages. */
  sanitizeError: function (error) {
    const permission = [
      "INSTALLER_PERMISSION_DENIED",
      "INSTALLER_SERVICE_TOKEN_REJECTED",
      "INSTALLER_PERMISSION_UNDEFINED",
    ];
    const validation = [
      "INSTALLER_WORKSPACE_REQUIRED",
      "INSTALLER_WORKSPACE_ROOT_REJECTED",
      "INSTALLER_WORKSPACE_HOME_REJECTED",
      "INSTALLER_WORKSPACE_TRAVERSAL_REJECTED",
      "INSTALLER_EVIDENCE_FILE_NOT_ALLOWED",
      "INSTALLER_BUILD_INVALID",
    ];
    const code = permission.includes(error?.code)
      ? "ERR_IST_00001"
      : validation.includes(error?.code)
        ? "ERR_IST_00002"
        : [
              "INSTALLER_WORKSPACE_ALLOWLIST_REQUIRED",
              "INSTALLER_WORKSPACE_NOT_ALLOWED",
              "INSTALLER_VENDOR_ROOT_PROTECTED",
            ].includes(error?.code)
          ? "ERR_IST_00003"
          : error?.code === "INSTALLER_BUILD_CONFLICT"
            ? "ERR_IST_00005"
          : error?.code === "INSTALLER_BUILD_NOT_FOUND"
            ? "ERR_IST_00006"
          : error?.code === "INSTALLER_API_DISABLED"
            ? "ERR_IST_00004"
            : "ERR_IST_00000";
    const status = statusDefinitions[code];
    return { code, message: status.message, responseCode: status.code };
  },

  /**
   * Builds a successful or warning installer response envelope.
   * @param {Object} request Installer request envelope.
   * @param {string} operation Operation code.
   * @param {Object} data Response data payload.
   * @param {Object} diagnostics Optional diagnostics payload.
   * @param {string[]} redactions Optional redaction codes.
   * @returns {Object} Installer response envelope.
   */
  success: function (request, operation, data, diagnostics, redactions) {
    return {
      code: "SUC_IST_00000",
      responseCode: 200,
      message: statusDefinitions.SUC_IST_00000.message,
      contractVersion: CONTRACT_VERSION,
      operation,
      status: diagnostics && diagnostics.warning ? "WARNING" : "SUCCESS",
      requestId: this.requestId(request),
      messages: [],
      data: data || {},
      diagnostics: diagnostics || {},
      redactions: redactions || [],
    };
  },

  /**
   * Builds a low-disclosure failed installer response envelope.
   * @param {Object} request Installer request envelope.
   * @param {string} operation Operation code.
   * @param {Error} error Failure cause.
   * @returns {Object} Installer response envelope.
   */
  failure: function (request, operation, error) {
    const safe = this.sanitizeError(error);
    return {
      code: safe.code,
      responseCode: safe.responseCode,
      message: safe.message,
      contractVersion: CONTRACT_VERSION,
      operation,
      status: "FAILED",
      requestId: this.requestId(request),
      messages: [{ code: safe.code, message: safe.message }],
      data: {},
      diagnostics: {},
      redactions: [],
    };
  },
};
