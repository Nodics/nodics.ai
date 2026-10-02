/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/service/authorization/DefaultProfileSessionContextValidationService
 * @description Adapts already verified typed session claims to live Profile owner validation without exposing canonical records.
 * @layer service
 * @owner profile
 * @override Later Profile layers may tighten admission or provide a qualified remote adapter; preserve current owner evidence and exact proof matching.
 */
module.exports = {
  /** Validates a signed subject credential on a scoped runtime-only route; unsigned claims are never admitted. @param {Object} request Verified runtime request with transient authToken body. @returns {Promise<Object>} Matched public live proof only. */
  validateRemote: async function (request) {
    try {
      SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
      const policy = CONFIG.get("authSecurity.sessionContextValidation");
      if (
        policy?.qualified !== true ||
        policy.remoteQualified !== true ||
        policy.captureProtectionQualified !== true ||
        SERVICE.DefaultModuleService.isLocalModuleActive(
          CONFIG.get("profileModuleName"),
          policy.connectionName || CONFIG.get("profileModuleName"),
        ) !== true
      )
        throw new Error();
      const caller = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(
        request,
        CONFIG.get("profileModuleName"),
      );
      if (
        caller.principalType !== "service" ||
        caller.entCode !== request.entCode ||
        !Array.isArray(caller.permissions) ||
        !caller.permissions.includes(policy.permission)
      )
        throw new Error();
      const body = request.body;
      if (
        !body ||
        Object.keys(body).join(",") !== "authToken" ||
        typeof body.authToken !== "string" ||
        body.authToken.length > 65536 ||
        !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(body.authToken)
      )
        throw new Error();
      const token = body.authToken;
      delete body.authToken;
      const verified =
        await SERVICE.DefaultAuthorizationProviderService.authorizeToken({
          authToken: token,
        });
      const payload = verified?.result;
      if (
        verified?.code !== "SUC_SYS_00000" ||
        payload?.tenant !== request.tenant ||
        payload?.entCode !== request.entCode
      )
        throw new Error();
      return await this.validate(
        SERVICE.DefaultAuthSecurityService.cloneAuthorizationClaims(payload),
      );
    } catch {
      throw new CLASSES.NodicsError("ERR_AUTH_00001");
    } finally {
      if (request.body && typeof request.body === "object")
        delete request.body.authToken;
    }
  },
  /** Validates only Profile-owned access contexts; JWT verification remains with nService/nAuth before invocation. @param {Object} payload Verified access claims, never browser-supplied unsigned authority. @returns {Promise<Object>} Exact redacted owner proof or stable rejection. */
  validate: async function (payload) {
    try {
      const context = payload?.sessionContext;
      if (
        payload?.tokenType !== "access" ||
        !["human", "customer"].includes(payload.principalType) ||
        payload.isSystem ||
        !context ||
        ![
          "profile",
          "profile.customerParticipation",
          "profile.customerEligibility",
        ].includes(context.owner) ||
        Object.keys(context).sort().join(",") !== "code,owner,version" ||
        typeof context.code !== "string" ||
        !/^[A-Za-z0-9_.:-]{1,192}$/.test(context.code) ||
        !Number.isSafeInteger(context.version) ||
        context.version < 1 ||
        typeof SERVICE.DefaultEnterpriseMembershipService?.validateContext !==
          "function"
      )
        throw new Error("Invalid owner context");
      const binding = {
        owner: context.owner,
        code: context.code,
        version: context.version,
      };
      const anchor =
        await SERVICE.DefaultEnterpriseMembershipService.validateContext(
          payload,
        );
      if (
        !anchor ||
        typeof anchor.identity !== "object" ||
        !anchor.identity ||
        typeof anchor.person !== "object" ||
        !anchor.person ||
        payload.sessionContext?.owner !== binding.owner ||
        payload.sessionContext?.code !== binding.code ||
        payload.sessionContext?.version !== binding.version
      )
        throw new Error("Unconfirmed owner context");
      return { valid: true, ...binding };
    } catch {
      throw new CLASSES.NodicsError("ERR_AUTH_00001");
    }
  },
};
