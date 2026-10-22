/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { isDeepStrictEqual } = require("node:util");

/** @module loyaltyWallet/service/defaultLoyaltyParticipantService @description Resolves personal or represented Enterprise ownership from current Profile evidence. @layer service @owner loyaltyWallet @override Keep original credentials, exact scope and permission admission. */
module.exports = {
  /**
   * Rejects unavailable identity without leaking Profile records.
   * @returns {never} Always throws a content-safe owner error; no business writes.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  fail: function () { SERVICE.DefaultLoyaltyRewardOperationService.fail("ERR_LOYALTY_PARTICIPANT", "Loyalty participant is not authorized"); },
  /**
   * Unwraps successful Profile evidence, never a failed nested envelope.
   * @param {*} value Value to validate, normalize or project as described above.
   * @returns {Object} Validated response payload; transport success alone is insufficient.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  unwrap: function (value) {
    for (let i = 0; i < 8 && value && !Array.isArray(value); i++) {
      if (value.error || value.success === false || /^ERR_/.test(value.code || "") ||
        value.errors && (!Array.isArray(value.errors) || value.errors.length)) this.fail();
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else break;
    }
    return value;
  },
  /**
   * Queries the existing Profile owner with the unchanged signed source context.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string} path Owner-configured canonical capability path.
   * @param {string} enterpriseCode Explicit business enterprise selector; never a replacement signed alias.
   * @param {Object} body Owner-built remote payload; does not replace trusted request scope.
   * @returns {Promise<*>} Queries the existing Profile owner with the unchanged signed source context.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  profile: async function (request, path, enterpriseCode, body) {
    const p = CONFIG.get("loyalty")?.transfers, timeoutMs = p?.identityTimeoutMs, target = p?.identityTarget;
    const bounded = (value, range) => range && Number.isSafeInteger(range.minimum) && range.minimum > 0 &&
      Number.isSafeInteger(range.maximum) && range.maximum >= range.minimum &&
      Number.isSafeInteger(value) && value >= range.minimum && value <= range.maximum;
    if (!bounded(timeoutMs, p?.validation?.identityTimeoutMs) || !bounded(target?.maxAttempts, p?.validation?.identityMaxAttempts) ||
      target.moduleName !== "profile" || typeof target.connectionName !== "string" || !target.connectionName.trim() ||
      !target.targetAuthority || typeof target.targetAuthority !== "object" || Array.isArray(target.targetAuthority) ||
      !Object.keys(target.targetAuthority).length || Object.values(target.targetAuthority).some(value => typeof value !== "string" || !value.trim()) ||
      !/^v[0-9]+$/.test(target.apiVersion || "")) this.fail();
    return this.unwrap(await SERVICE.DefaultModuleService.invokeModule({ local: false,
      moduleName: target.moduleName, connectionName: target.connectionName, targetAuthority: target.targetAuthority, apiVersion: target.apiVersion,
      apiName: path, methodName: body ? "POST" : "GET", requestBody: body, tenant: request.tenant, request: { tenant: request.tenant },
      header: { Authorization: request.authorization, "X-Enterprise-Code": enterpriseCode },
      timeoutMs, maxAttempts: target.maxAttempts }));
  },
  /**
   * Revalidates an exact existing recipient through Profile, without exposing its wallet or private fields.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} selection Participant selection, subject to canonical owner resolution.
   * @returns {Promise<*>} Revalidates an exact existing recipient through Profile, without exposing its wallet or private fields.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  recipient: async function (request, selection) {
    if (!selection || !["CUSTOMER", "ENTERPRISE"].includes(selection.ownerType) ||
      typeof selection.ownerCode !== "string" || !/^[A-Za-z0-9_.:@|-]{1,200}$/.test(selection.ownerCode)) this.fail();
    const auth = structuredClone(request.authData), tenant = request.tenant, authorization = request.authorization;
    const result = await this.profile(request, "/participants/resolve", auth.enterpriseCode || auth.entCode,
      { ownerType: selection.ownerType, ownerCode: selection.ownerCode });
    if (!isDeepStrictEqual(auth, request.authData) || tenant !== request.tenant || authorization !== request.authorization ||
      result?.contractVersion !== 1 || result.tenant !== tenant || result.recipient?.ownerType !== selection.ownerType ||
      result.recipient?.ownerCode !== selection.ownerCode) this.fail();
    return result.recipient;
  },
  /**
   * Derives the owner from Profile, not ownerType/ownerCode in browser input.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string} permission Exact owner capability permission; not inferred from roles.
   * @returns {Promise<*>} Derives the owner from Profile, not ownerType/ownerCode in browser input.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  resolve: async function (request, permission) {
    const auth = structuredClone(request.authData || {}), router = SERVICE.DefaultSecuredRequestPipelineService;
    const enterpriseCode = auth.enterpriseCode || auth.entCode;
    const tenant = request.tenant, authorization = request.authorization;
    const bound = () => {
      if (!isDeepStrictEqual(request.authData, auth) || request.tenant !== tenant || request.authorization !== authorization ||
        [request.entCode, request.enterpriseCode].some(value => value !== undefined && value !== enterpriseCode)) this.fail();
    };
    if (!request.authorization || !request.tenant || auth.tenant !== request.tenant || !auth.loginId ||
      !enterpriseCode || auth.tokenType !== "access" || !["customer", "human"].includes(auth.principalType) || auth.isSystem ||
      auth.enterpriseCode && auth.entCode && auth.enterpriseCode !== auth.entCode ||
      !router?.isPermissionGranted(permission, router.getGrantedPermissions(request), {})) this.fail();
    bound();
    if (auth.principalType === "customer") {
      const identity = await this.profile(request, "/customer/identity", enterpriseCode);
      bound();
      if (identity?.contractVersion !== 1 || identity.tenant !== request.tenant ||
        identity.enterpriseCode !== enterpriseCode || identity.customer?.loginId !== auth.loginId ||
        typeof identity.customer?.code !== "string" || !identity.customer.code) this.fail();
      return { ownerType: "CUSTOMER", ownerCode: identity.customer.code, actorCode: auth.loginId };
    }
    const evidence = await this.profile(request, "/identity/scopes/me", enterpriseCode);
    bound();
    if (evidence?.principalCode !== auth.loginId || !Array.isArray(evidence.scopes) ||
      !Array.isArray(evidence.deniedScopes)) this.fail();
    const matches = scope => {
      if (!scope || typeof scope !== "object" || Array.isArray(scope)) this.fail();
      if (scope.tenantCode && scope.tenantCode !== request.tenant ||
        scope.capabilityCode && !["loyalty", "loyaltyWallet"].includes(scope.capabilityCode) ||
        scope.permissionCode && !router.isPermissionGranted(permission, [scope.permissionCode], {})) return false;
      return scope.scopeType === "GLOBAL" && scope.scopeCode === "*" ||
        scope.scopeType === "TENANT" && scope.scopeCode === request.tenant ||
        scope.scopeType === "ENTERPRISE" && scope.scopeCode === enterpriseCode;
    };
    if (!evidence.scopes.some(matches) || evidence.deniedScopes.some(matches)) this.fail();
    return { ownerType: "ENTERPRISE", ownerCode: enterpriseCode, actorCode: auth.loginId };
  },
};
