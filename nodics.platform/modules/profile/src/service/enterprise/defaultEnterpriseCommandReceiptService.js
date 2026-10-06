/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module profile/service/enterprise/DefaultEnterpriseCommandReceiptService
 * @description Records and inspects original enterprise-create and invitation acknowledgements without replaying Profile setup stages.
 * @layer service @owner profile
 * @override Preserve Profile's current human, enterprise, consent, descriptor and role authority; receipts do not activate employees or resume uncertain setup.
 */
module.exports = {
  /** Uses the native invitation target precedence, including internal enterprise setup calls. @param {Object} request Native request. @returns {string} Enterprise identity. */
  enterprise: function (request) {
    return String(
      request.params?.enterpriseCode || request.body?.enterpriseCode || "",
    ).trim();
  },
  /** Requires the original native grant through the existing security owner. @param {Object} request Trusted employee. @param {string} permission Native grant. @returns {void} Authorized. */
  permission: function (request, permission) {
    const security = SERVICE.DefaultSecuredRequestPipelineService;
    if (
      !security?.isPermissionGranted(
        permission,
        security.getGrantedPermissions(request),
        security.getRouteActionAuthorizationConfig(),
      )
    )
      SERVICE.DefaultModelCommandReceiptService.fail();
  },
  /** Rechecks native authority for the exact original command without performing a write. @param {Object} request Trusted request. @param {string} kind Fixed owner operation. @returns {Promise<void>} Authorized. */
  authorize: async function (request, kind) {
    const owner = SERVICE.DefaultEnterpriseManagementService;
    owner.authorize(request);
    if (kind === "CREATE") {
      this.permission(request, "profile.enterprise.create");
      if (!owner.isPlatformAdministrator(request.authData))
        SERVICE.DefaultModelCommandReceiptService.fail();
      const descriptor = SERVICE.DefaultSchemaUtilityService.buildDescriptor(
        request,
        NODICS.getModule("profile"),
        "enterprise",
        "profile",
      );
      if (!descriptor?.operations?.includes("create"))
        SERVICE.DefaultModelCommandReceiptService.fail();
    } else if (kind === "INVITE") {
      this.permission(request, "profile.enterpriseAccess.assign");
      const enterprise = this.enterprise(request);
      if (typeof enterprise !== "string" || !enterprise)
        SERVICE.DefaultModelCommandReceiptService.fail();
      if (
        request.authData.entCode !== enterprise &&
        !owner.isPlatformAdministrator(request.authData)
      )
        await SERVICE.DefaultEnterpriseAdministrationConsentService.authorizeInvitation(
          request,
          enterprise,
          request.body.roleCode,
          request.body.email,
        );
      else owner.authorizeEnterpriseAccess(request, enterprise);
      owner.rolePolicy(String(request.body.roleCode || "").trim());
    } else SERVICE.DefaultModelCommandReceiptService.fail();
  },
  /** Builds exact private native receipt evidence. @param {Object} request Trusted request. @param {string} kind Fixed native operation. @param {string} key Original key. @returns {Object} Declaration. */
  command: function (request, kind, key) {
    const owner = SERVICE.DefaultModelCommandReceiptService;
    const input = structuredClone(
      kind === "CREATE"
        ? request.payload?.model
        : { enterpriseCode: this.enterprise(request), body: request.body },
    );
    return {
      moduleName: "profile",
      journalSchema: "profileCommandReceipt",
      operation:
        kind === "CREATE"
          ? "enterprise.create"
          : "enterpriseAccessAssignment.invite",
      input,
      key,
      authorize: () => this.authorize(request, kind),
      resultIdentity: (result) => {
        owner.result({ code: "SUC_PRFL_00000", result });
        if (
          typeof result.code !== "string" ||
          (kind === "CREATE"
            ? result.code !== input.code
            : result.enterpriseCode !== input.enterpriseCode ||
              result.email?.toLowerCase() !== input.body.email?.toLowerCase() ||
              result.roleCode !== input.body.roleCode ||
              result.status !== "PENDING")
        )
          owner.fail();
        return result.code;
      },
    };
  },
  /** Wraps the existing native implementation only when explicitly admitted for this owner. @param {Object} request Original request. @param {string} kind Native operation. @param {Function} execute Existing owner path. @returns {Promise<Object>} Native result. */
  execute: async function (request, kind, execute) {
    const key =
      kind === "CREATE"
        ? SERVICE.DefaultSchemaUtilityService.getIdempotencyKey(request)
        : request.body?.idempotencyKey;
    return SERVICE.DefaultModelCommandReceiptService.execute(
      request,
      this.command(request, kind, key),
      execute,
    );
  },
  /** Reads a creation receipt without invoking enterprise setup or continuation. @param {Object} request Trusted receipt request. @returns {Promise<Object>} Receipt. */
  inspectCreation: async function (request) {
    const body = request.httpRequest?.body || request.body;
    if (!body || Object.keys(body).sort().join() !== "idempotencyKey,model")
      SERVICE.DefaultModelCommandReceiptService.fail();
    return SERVICE.DefaultModelCommandReceiptService.inspect(
      { ...request, payload: { model: body.model } },
      this.command(
        { ...request, payload: { model: body.model } },
        "CREATE",
        body.idempotencyKey,
      ),
    );
  },
  /** Reads an invitation receipt without refreshing expiry or assigning an account. @param {Object} request Trusted receipt request. @returns {Promise<Object>} Receipt. */
  inspectInvitation: async function (request) {
    const body = request.httpRequest?.body || request.body;
    if (
      !body ||
      Object.keys(body).sort().join() !== "command,idempotencyKey" ||
      !body.command ||
      body.command.idempotencyKey !== body.idempotencyKey
    )
      SERVICE.DefaultModelCommandReceiptService.fail();
    const original = { ...request, body: body.command };
    return SERVICE.DefaultModelCommandReceiptService.inspect(
      original,
      this.command(original, "INVITE", body.idempotencyKey),
    );
  },
};
