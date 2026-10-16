/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const { isDeepStrictEqual } = require("node:util");
/** @module order/service/defaultOrderBusinessAccessService @description Binds employee business commands to signed enterprise scope and canonical owner persistence, without schema grants. @layer service @owner order */
module.exports = {
  /** Requires one authenticated employee and the exact owner permission before persistence. */
  context: function (request, permission) {
    const auth = request.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
    const enterpriseCode = auth.enterpriseCode || auth.entCode;
    const actorId = auth.principalId || auth.code || auth.loginId;
    if (!["commerce.lifecycle.read", "commerce.lifecycle.act", "commerce.order.read", "commerce.dispute.review"].includes(permission) ||
        auth.tokenType !== "access" || auth.principalType !== "human" || auth.isSystem ||
        !Array.isArray(auth.userGroups) || !auth.userGroups.includes("employeeUserGroup") || typeof actorId !== "string" || !actorId ||
        typeof auth.tenant !== "string" || !auth.tenant || request.tenant !== auth.tenant ||
        [auth.tenantCode, request.tenantCode].some(value => value !== undefined && value !== auth.tenant) ||
        typeof enterpriseCode !== "string" || !enterpriseCode ||
        [auth.entCode, auth.enterpriseCode, request.enterpriseCode, request.entCode].some(value => value !== undefined && value !== enterpriseCode) ||
        request.actorId !== undefined && request.actorId !== actorId ||
        !security?.getGrantedPermissions || !security.isPermissionGranted ||
        !security.isPermissionGranted(permission, security.getGrantedPermissions(request), {})) {
      throw new Error("Authenticated Order employee scope and permission are required");
    }
    return { tenant: auth.tenant, enterpriseCode, actorId, permission,
      identity: structuredClone({ authVersion: auth.authVersion, sessionId: auth.sessionId,
        jti: auth.jti, userGroups: auth.userGroups, permissions: security.getGrantedPermissions(request) }) };
  },
  /** Detects authority changes across awaited owner reads and before writes. */
  assertCurrent: function (request, context) {
    if (!isDeepStrictEqual(this.context(request, context.permission), context)) {
      throw new Error("Order employee authority changed; inspect before retrying");
    }
  },
  /** Returns only the existing identity owner's persistence authority, not invented service groups. */
  persistenceAuth: function () {
    const identity = SERVICE.DefaultIdentityGovernanceService;
    if (!identity?.getSystemAuthData) throw new Error("Order persistence authority is unavailable");
    return identity.getSystemAuthData();
  },
  /** Projects operator responses without private refund, approval or provider evidence. */
  publicLifecycle: function (row) {
    const fields = ["code", "orderCode", "requestType", "reasonCode", "status", "revision", "occurredAt"];
    const result = Object.fromEntries(fields.filter(key => row[key] !== undefined).map(key => {
      const value = row[key];
      if (value !== null && !["string", "number", "boolean"].includes(typeof value) &&
          !(key === "occurredAt" && value instanceof Date && Number.isFinite(value.getTime()))) {
        throw new Error("Order public projection is unconfirmed");
      }
      return [key, value];
    }));
    const execution = row.evidence?.execution;
    if (execution && typeof execution === "object") result.evidence = { execution: Object.fromEntries(
      ["status", "missingGate", "nextAction"].filter(key => typeof execution[key] === "string").map(key => [key, execution[key]])) };
    return result;
  },
  /** Rejects unconfirmed, foreign or oversized provider results before returning business data. */
  confirmRows: function (response, context, maximum) {
    const rows = SERVICE.DefaultOrderLifecycleRepositoryService.confirmedResult(response);
    if (!Array.isArray(rows) || rows.length > maximum || rows.some(row => !row || Array.isArray(row) ||
        typeof row.code !== "string" || !row.code || row.tenant !== context.tenant || row.enterpriseCode !== context.enterpriseCode) ||
        new Set(rows.map(row => row.code)).size !== rows.length) {
      throw new Error("Order owner read escaped the signed enterprise scope");
    }
    return rows;
  },
  /** Reads only this employee enterprise's lifecycle records through the generated owner. */
  lifecycleRows: async function (request, context, query, limit) {
    this.assertCurrent(request, context);
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 || !query ||
        Object.keys(query).some(key => key !== "code") ||
        Object.hasOwn(query, "code") && (typeof query.code !== "string" || !query.code || query.code.length > 128)) {
      throw new Error("Order lifecycle selection is invalid");
    }
    const response = await SERVICE.DefaultOrderLifecycleRequestService.get({
      tenant: context.tenant, authData: this.persistenceAuth(),
      query: { ...query, tenant: context.tenant, enterpriseCode: context.enterpriseCode },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: limit, limit, pageNumber: 1 },
    });
    this.assertCurrent(request, context);
    const rows = this.confirmRows(response, context, limit);
    if (query.code !== undefined && rows.some(row => row.code !== query.code)) {
      throw new Error("Order lifecycle read returned an unrelated request");
    }
    return rows;
  },
};
