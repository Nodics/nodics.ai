/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

const nativeRoutes = require("../../router/routers").workflow.processOperations;

/**
 * @module workflow/service/operation/DefaultProcessCommandCapabilityService
 * @description Projects current native trigger authorization and opt-in journal policy without reading records, claiming commands or granting execution.
 * @layer service
 * @owner workflow
 * @override Narrow effective router permissions/exposure through existing layers. Preserve native security checks, canonical client coordinates and independent inspection after recording shutdown.
 */
module.exports = {
  /**
   * Observes one existing pipeline guard without invoking its request lifecycle.
   * Missing, throwing or contradictory callbacks remain unavailable.
   * @param {Object} owner Existing pipeline service.
   * @param {string} method Read-only guard method.
   * @param {Object} request Original context with selected native router.
   * @returns {Promise<string>} AUTHORIZED, DENIED or UNAVAILABLE.
   */
  guard: async function (owner, method, request) {
    if (typeof owner?.[method] !== "function") return "UNAVAILABLE";
    const results = [];
    try {
      await owner[method](request, {}, {
        nextSuccess: () => results.push("AUTHORIZED"),
        error: () => results.push("DENIED"),
      });
      return results.length === 1 ? results[0] : "UNAVAILABLE";
    } catch {
      return "UNAVAILABLE";
    }
  },

  /**
   * Resolves canonical v0 management coordinates from the effective router owner.
   * Path/version migrations need a corresponding typed client deployment.
   * @param {Object} request Trusted employee request.
   * @param {string} name Existing native route identifier.
   * @returns {Promise<string>} Current advisory route authorization.
   */
  routeAuthorization: async function (request, name) {
    let effective;
    try {
      effective = SERVICE.DefaultRouterConfigurationService.getRawRouters()
        ?.workflow?.processOperations?.[name];
    } catch {
      return "UNAVAILABLE";
    }
    const native = nativeRoutes[name];
    if (
      !native || !effective || effective.active === false ||
      effective.secured !== true ||
      effective.key !== native.key ||
      String(effective.method).toUpperCase() !== native.method ||
      (effective.apiVersion || "v0") !== "v0" ||
      effective.operation !== native.operation ||
      !Array.isArray(effective.accessGroups) || !effective.accessGroups.length ||
      !Array.isArray(effective.authTokenTypes) ||
      !effective.authTokenTypes.includes("access")
    ) return "UNAVAILABLE";

    const selected = {
      ...request,
      moduleName: "workflow",
      router: structuredClone({ ...effective, moduleName: "workflow" }),
    };
    const exposure = await this.guard(
      SERVICE.DefaultRequestHandlerPipelineService,
      "validateApiExposure",
      selected,
    );
    if (exposure !== "AUTHORIZED") return exposure;
    return this.guard(
      SERVICE.DefaultSecuredRequestPipelineService,
      "checkAccess",
      selected,
    );
  },

  /**
   * Projects only the four commands already owned by the native receipt service.
   * Route admission is advisory; state, CAS and original-command checks still run
   * on every command/inspection. No generated persistence service is called here.
   * @param {Object} request Trusted employee scope.
   * @returns {Promise<Object>} Versioned, private, non-executable metadata.
   */
  get: async function (request) {
    const receipts = SERVICE.DefaultProcessTriggerCommandReceiptService;
    let newRecording = "UNAVAILABLE";
    try {
      const enabled = SERVICE.DefaultModelCommandReceiptService.enabled("workflow");
      if (enabled === true) newRecording = "ENABLED";
      else if (enabled === false) newRecording = "DISABLED";
    } catch { /* Unavailable policy never enables keyed commands. */ }
    const inspection = await this.routeAuthorization(request, "inspectTriggerCommand");
    const triggerCommands = {};
    for (const kind of ["create", "update", "archive", "execute"]) {
      let authorization = "UNAVAILABLE";
      let receiptInspection = "UNAVAILABLE";
      try {
        const operation = receipts.operation(kind);
        authorization = await this.routeAuthorization(request, operation.method);
        receiptInspection = inspection;
        if (receiptInspection === "AUTHORIZED") {
          // Original receipts independently require the exact native grant, even
          // when deployment route authorization uses legacy compatibility mode.
          try { await receipts.authorize(request, kind); }
          catch { receiptInspection = "DENIED"; }
        }
      } catch { /* Missing native owner never grants command or inspection. */ }
      triggerCommands[kind] = { authorization, receiptInspection };
    }
    return {
      code: "SUC_PROCESS_00000",
      data: { contractVersion: 1, newRecording, triggerCommands },
    };
  },
};
